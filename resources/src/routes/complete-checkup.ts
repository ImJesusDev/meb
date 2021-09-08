import {
  BadRequestError,
  requireAuth,
  validateRequest,
  CheckupStatus,
  ResourceStatus,
  ComponentStatus,
  RepairStatus,
} from '@movers/common';
import express, { Request, Response } from 'express';
import { Resource } from '../models/resource';
import { Component } from '../models/component';
import { Checkup, ComponentCheckupAttrs } from '../models/checkup';
import { body } from 'express-validator';
import { checkupQueue } from '../queues/checkup-queue';
import { ResourceType } from '../models/resource-type';
import { ResourceUpdatedPublisher } from '../events/publishers/resource-updated-publisher';
import { natsClient } from '../nats';
import { Repair } from '../models/repair';
import { Office } from '../models/office';
import { s3Client } from '../s3';

const router = express.Router();

router.put(
  '/api/resources/:id/checkups',
  requireAuth(),
  [
    body('components').notEmpty().withMessage('components param is required'),
    body('checkupId')
      .notEmpty()
      .withMessage('The id of the checkup is required'),
    body('components')
      .isArray()
      .withMessage('components param must be an array'),
    body('components.*.componentId')
      .not()
      .isEmpty()
      .withMessage('The id of the component is required'),
    body('components.*.status')
      .not()
      .isEmpty()
      .withMessage('The status of the component is required'),
    body('components.*.componentName')
      .not()
      .isEmpty()
      .withMessage('The name of the component is required'),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { checkupId } = req.body;

    const existingCheckup = await Checkup.findById(checkupId);
    if (!existingCheckup) {
      throw new BadRequestError('The Checkup does not exists');
    }
    const resource = await Resource.findById(req.params.id);
    const components = req.body.components as ComponentCheckupAttrs[];

    let disableResource = false;
    let toRepair = false;
    let newStatus = ResourceStatus.Available;

    if (!resource) {
      throw new BadRequestError('The resource does not exists');
    }
    const office = await Office.findOne({ name: resource.office });
    if (!office) {
      throw new BadRequestError('The resource office does not exists');
    }
    const existingType = await ResourceType.findOne({
      type: resource.type,
    }).populate(['documentTypes']);

    if (!existingType) {
      throw new BadRequestError('The resource type does not exists');
    }
    for (const component of components) {
      if (component.photo) {
        // Create Buffer
        const buffer = Buffer.from(
          component.photo.replace(/^data:image\/\w+;base64,/, ''),
          'base64'
        );
        // Get MimeType
        const mimeType = component.photo.match(
          /[^:]\w+\/[\w-+\d.]+(?=;|,)/
        )![0];
        const imageKey = `images/checkups/${Date.now()}`;
        // Params to upload file
        const uploadParams = {
          Bucket: 'meb-images',
          Key: imageKey,
          Body: buffer,
          ContentEncoding: 'base64',
          ContentType: mimeType,
          ACL: 'public-read',
        };
        await s3Client.client.upload(uploadParams).promise();
        component.photo = `https://meb-images.${process.env.SPACES_ENDPOINT}/${imageKey}`;
      }
      const existingComponent = await Component.findById(component.componentId);
      if (!existingComponent) {
        throw new BadRequestError(
          `The component id ${component.componentId} does not exists`
        );
      }
      // Business logic when a component is un regular condition
      if (component.status === ComponentStatus.Regular) {
        // The resource should be disabled when the component is in regular condition
        if (existingComponent.regularCondition.disables) {
          disableResource = true;
        }
        // The resource should be send to repair when the component is in regular condition
        if (existingComponent.regularCondition.ticket) {
          toRepair = true;
        }
      }
      // Business logic when a component is un regular condition
      if (component.status === ComponentStatus.Bad) {
        // The resource should be disabled when the component is in bad condition
        if (existingComponent.badCondition.disables) {
          disableResource = true;
        }
        // The resource should be send to repair when the component is in bad condition
        if (existingComponent.badCondition.ticket) {
          toRepair = true;
        }
      }
    }
    // If the resource should be sent to repair
    if (toRepair === true) {
      console.log('creating repair');
      console.log('components', JSON.stringify(components, null, 2));
      newStatus = ResourceStatus.PendingRepair;
      const repair = Repair.build({
        resourceRef: resource.reference,
        createdAt: new Date(),
        components,
        status: RepairStatus.Pending,
        assignee: office.repairAdmin,
      });
      await repair.save();
      console.log('repair created');
      console.log(JSON.stringify(repair, null, 2));
    } else if (disableResource === true) {
      // If the resource should be disabled
      newStatus = ResourceStatus.Disabled;
    }
    existingCheckup.set({
      completedAt: new Date(),
      components,
      status: CheckupStatus.Completed,
    });

    await existingCheckup.save();
    resource.set({
      status: newStatus,
    });

    await resource.save();
    await new ResourceUpdatedPublisher(natsClient.client).publish({
      id: resource.id,
      status: resource.status,
      version: resource.version,
    });
    // Delay of days in ms
    const delay = 1000 * 60 * 60 * 24 * existingType.checkupTime;

    await checkupQueue.add(
      {
        resourceId: resource.id,
      },
      {
        delay,
      }
    );

    console.log(`Created checkup queue with delay ${delay}`);

    res.status(201).send(existingCheckup);
  }
);

export default router;
