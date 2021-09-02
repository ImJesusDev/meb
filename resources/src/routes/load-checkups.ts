import {
  BadRequestError,
  requireAuth,
  validateRequest,
  CheckupStatus,
  ResourceStatus,
} from '@movers/common';
import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { Resource, ResourceDoc } from '../models/resource';
import { ResourceType } from '../models/resource-type';
import { Component } from '../models/component';
import { Checkup, ComponentCheckupAttrs } from '../models/checkup';
import { ResourceUpdatedPublisher } from '../events/publishers/resource-updated-publisher';
import { natsClient } from '../nats';
import { Office } from '../models/office';
const router = express.Router();

router.post(
  '/api/resources/load-checkups',
  [
    body('resources').isArray().withMessage('Resources must be an array'),
    body('resources.*.id').notEmpty().withMessage('Resource id is required'),
  ],
  requireAuth(),
  async (req: Request, res: Response) => {
    // Store successful checkups
    const success: Array<ResourceDoc> = [];
    // Get array with id of resources
    const resources = req.body.resources as [{ id: string }];
    // Iterare all items
    for (const item of resources) {
      // Find resource
      const resource = await Resource.findById(item.id);
      if (resource) {
        const office = await Office.findOne({ name: resource.office });
        if (!office) {
          continue;
        }
        // Find existing type with components
        const existingType = await ResourceType.findOne({
          type: resource.type,
        }).populate(['components']);
        // Create array of components for checkup
        const components: ComponentCheckupAttrs[] = [];
        if (existingType && existingType.components) {
          for (const component of existingType.components) {
            components.push({
              componentId: component.id,
              componentName: component.name,
            });
          }
        }
        // Create the checkup
        const checkup = Checkup.build({
          resourceRef: resource.reference,
          createdAt: new Date(),
          components,
          status: CheckupStatus.Pending,
          assignee: office.inventoryAdmin,
        });
        // Save Checkup
        await checkup.save();

        // Update resource status
        resource.set({
          status: ResourceStatus.PendingCheckup,
        });
        // Save updated resource
        await resource.save();
        // Emit updated event
        await new ResourceUpdatedPublisher(natsClient.client).publish({
          id: resource.id,
          status: resource.status,
          version: resource.version,
        });
        success.push(resource);
      }
    }
    res.status(201).send(success);
  }
);

export default router;
