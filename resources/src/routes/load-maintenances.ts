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
import { Office } from '../models/office';

const router = express.Router();

router.post(
  '/api/resources/load-maintenances',
  requireAuth(),
  async (req: Request, res: Response) => {
    const resources = req.body.resources as [{ id: string }];
    const success = [];
    for (const id of resources) {
      const resource = await Resource.findById(id);

      if (!resource) {
        continue;
      }
      const office = await Office.findOne({ name: resource.office });
      if (!office) {
        continue;
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
        assignee: office.maintenanceAdmin,
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
      success.push(resource);
    }

    res.status(201).send(success);
  }
);

export default router;
