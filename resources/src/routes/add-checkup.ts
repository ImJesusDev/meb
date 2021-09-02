import {
  BadRequestError,
  requireAuth,
  validateRequest,
  CheckupStatus,
  ResourceStatus,
} from '@movers/common';
import express, { Request, Response } from 'express';
import { Resource } from '../models/resource';
import { ResourceType } from '../models/resource-type';
import { Component } from '../models/component';
import { Checkup, ComponentCheckupAttrs } from '../models/checkup';
import { ResourceUpdatedPublisher } from '../events/publishers/resource-updated-publisher';
import { natsClient } from '../nats';
import { Office } from '../models/office';
const router = express.Router();

router.post(
  '/api/resources/:id/checkups',
  requireAuth(),
  async (req: Request, res: Response) => {
    const resource = await Resource.findById(req.params.id);

    if (!resource) {
      throw new BadRequestError('The resource does not exists');
    }
    const office = await Office.findOne({ name: resource.office });
    if (!office) {
      throw new BadRequestError('The resource office does not exists');
    }

    const existingType = await ResourceType.findOne({
      type: resource.type,
    }).populate(['components']);

    const components: ComponentCheckupAttrs[] = [];
    if (existingType && existingType.components) {
      for (const component of existingType.components) {
        components.push({
          componentId: component.id,
          componentName: component.name,
        });
      }
    }

    const checkup = Checkup.build({
      resourceRef: resource.reference,
      createdAt: new Date(),
      components,
      status: CheckupStatus.Pending,
      assignee: office.inventoryAdmin,
    });

    await checkup.save();

    resource.set({
      status: ResourceStatus.PendingCheckup,
    });

    await resource.save();
    await new ResourceUpdatedPublisher(natsClient.client).publish({
      id: resource.id,
      status: resource.status,
      version: resource.version,
    });

    res.status(201).send(checkup);
  }
);

export default router;
