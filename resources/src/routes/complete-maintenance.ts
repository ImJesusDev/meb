import {
  BadRequestError,
  requireAuth,
  validateRequest,
  MaintenanceStatus,
  ResourceStatus,
  ComponentStatus,
} from '@movers/common';
import express, { Request, Response } from 'express';
import { Resource } from '../models/resource';
import { Component } from '../models/component';
import { Maintenance, ComponentMaintenanceAttrs } from '../models/maintenance';
import { body } from 'express-validator';
import { ResourceType } from '../models/resource-type';
import { ResourceUpdatedPublisher } from '../events/publishers/resource-updated-publisher';
import { natsClient } from '../nats';

const router = express.Router();

router.put(
  '/api/resources/:id/maintenances',
  requireAuth(),
  [
    body('components').notEmpty().withMessage('components param is required'),
    body('maintenanceId')
      .notEmpty()
      .withMessage('The id of the maintenance is required'),
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
    const { maintenanceId } = req.body;

    const existingMaintenance = await Maintenance.findById(maintenanceId);
    if (!existingMaintenance) {
      throw new BadRequestError('The Maintenance does not exists');
    }
    const resource = await Resource.findById(req.params.id);
    const components = req.body.components as ComponentMaintenanceAttrs[];

    let newStatus = ResourceStatus.WaitingApprovalMaintenance;

    if (!resource) {
      throw new BadRequestError('The resource does not exists');
    }
    const existingType = await ResourceType.findOne({
      type: resource.type,
    });

    if (!existingType) {
      throw new BadRequestError('The resource type does not exists');
    }
    for (const component of components) {
      const existingComponent = await Component.findById(component.componentId);
      if (!existingComponent) {
        throw new BadRequestError(
          `The component id ${component.componentId} does not exists`
        );
      }
    }

    existingMaintenance.set({
      completedAt: new Date(),
      components,
      status: MaintenanceStatus.Completed,
    });

    await existingMaintenance.save();

    resource.set({
      status: newStatus,
      kmSinceMaintenance: 0,
    });

    await resource.save();
    await new ResourceUpdatedPublisher(natsClient.client).publish({
      id: resource.id,
      status: resource.status,
      version: resource.version,
    });

    res.status(201).send(existingMaintenance);
  }
);

export default router;
