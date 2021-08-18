import {
  BadRequestError,
  requireAuth,
  validateRequest,
  RepairStatus,
  ResourceStatus,
} from '@movers/common';
import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { Resource } from '../models/resource';
import { Repair } from '../models/repair';
import { ResourceUpdatedPublisher } from '../events/publishers/resource-updated-publisher';
import { natsClient } from '../nats';

const router = express.Router();

router.post(
  '/api/resources/:id/approve-repair',
  requireAuth(),
  [body('repairId').notEmpty().withMessage('The id of the repair is required')],
  validateRequest,
  async (req: Request, res: Response) => {
    const resource = await Resource.findById(req.params.id);

    if (!resource) {
      throw new BadRequestError('The resource does not exists');
    }
    const { repairId } = req.body;
    const existingRepair = await Repair.findById(repairId);
    if (!existingRepair) {
      throw new BadRequestError('The Repair does not exists');
    }
    existingRepair.set({
      status: RepairStatus.Approved,
    });

    await existingRepair.save();

    resource.set({
      status: ResourceStatus.Available,
    });

    await resource.save();
    await new ResourceUpdatedPublisher(natsClient.client).publish({
      id: resource.id,
      status: resource.status,
      version: resource.version,
    });

    res.status(200).send(existingRepair);
  }
);

export default router;
