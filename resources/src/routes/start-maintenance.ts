import {
  BadRequestError,
  requireAuth,
  validateRequest,
  MaintenanceStatus,
  ResourceStatus,
} from '@movers/common';
import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { Resource } from '../models/resource';
import { Maintenance } from '../models/maintenance';
import { ResourceUpdatedPublisher } from '../events/publishers/resource-updated-publisher';
import { natsClient } from '../nats';

const router = express.Router();

router.post(
  '/api/resources/:id/start-maintenance',
  requireAuth(),
  [
    body('maintenanceId')
      .notEmpty()
      .withMessage('The id of the maintenance is required'),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const resource = await Resource.findById(req.params.id);

    if (!resource) {
      throw new BadRequestError('The resource does not exists');
    }
    const { maintenanceId } = req.body;
    const existingMaintenance = await Maintenance.findById(maintenanceId);
    if (!existingMaintenance) {
      throw new BadRequestError('The Maintenance does not exists');
    }
    existingMaintenance.set({
      status: MaintenanceStatus.InProgress,
    });

    await existingMaintenance.save();
    resource.set({
      status: ResourceStatus.Maintenance,
    });

    await resource.save();
    await new ResourceUpdatedPublisher(natsClient.client).publish({
      id: resource.id,
      status: resource.status,
      version: resource.version,
    });

    res.status(200).send(existingMaintenance);
  }
);

export default router;
