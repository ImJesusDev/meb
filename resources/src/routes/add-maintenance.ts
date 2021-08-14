import {
  BadRequestError,
  requireAuth,
  validateRequest,
  ResourceStatus,
  MaintenanceStatus,
} from '@movers/common';
import express, { Request, Response } from 'express';
import { Resource } from '../models/resource';
import { ResourceType } from '../models/resource-type';

import { Maintenance, ComponentMaintenanceAttrs } from '../models/maintenance';
import { ResourceUpdatedPublisher } from '../events/publishers/resource-updated-publisher';
import { natsClient } from '../nats';

const router = express.Router();

router.post(
  '/api/resources/:id/maintenances',
  requireAuth(),
  async (req: Request, res: Response) => {
    const resource = await Resource.findById(req.params.id);

    if (!resource) {
      throw new BadRequestError('The resource does not exists');
    }
    const existingType = await ResourceType.findOne({
      type: resource.type,
    }).populate(['components']);

    const components: ComponentMaintenanceAttrs[] = [];
    if (existingType && existingType.components) {
      for (const component of existingType.components) {
        components.push({
          componentId: component.id,
          componentName: component.name,
        });
      }
    }

    const maintenance = Maintenance.build({
      resourceRef: resource.reference,
      createdAt: new Date(),
      components,
      status: MaintenanceStatus.Pending,
    });

    await maintenance.save();

    resource.set({
      status: ResourceStatus.PendingMaintenance,
    });

    await resource.save();
    await new ResourceUpdatedPublisher(natsClient.client).publish({
      id: resource.id,
      status: resource.status,
      version: resource.version,
    });

    res.status(201).send(maintenance);
  }
);

export default router;
