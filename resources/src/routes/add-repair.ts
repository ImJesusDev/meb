import {
  BadRequestError,
  requireAuth,
  validateRequest,
  ResourceStatus,
  RepairStatus,
} from '@movers/common';
import express, { Request, Response } from 'express';
import { Resource } from '../models/resource';
import { ResourceType } from '../models/resource-type';
import { Repair, ComponentRepairAttrs } from '../models/repair';
import { ResourceUpdatedPublisher } from '../events/publishers/resource-updated-publisher';
import { natsClient } from '../nats';
import { Office } from '../models/office';

const router = express.Router();

router.post(
  '/api/resources/:id/repairs',
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

    const components: ComponentRepairAttrs[] = [];
    if (existingType && existingType.components) {
      for (const component of existingType.components) {
        components.push({
          componentId: component.id,
          componentName: component.name,
        });
      }
    }

    const repair = Repair.build({
      resourceRef: resource.reference,
      createdAt: new Date(),
      components,
      status: RepairStatus.Pending,
      assignee: office.repairAdmin,
    });

    await repair.save();

    resource.set({
      status: ResourceStatus.PendingRepair,
    });

    await resource.save();
    await new ResourceUpdatedPublisher(natsClient.client).publish({
      id: resource.id,
      status: resource.status,
      version: resource.version,
    });

    res.status(201).send(repair);
  }
);

export default router;
