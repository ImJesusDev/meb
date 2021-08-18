import {
  BadRequestError,
  requireAuth,
  validateRequest,
  MaintenanceStatus,
} from '@movers/common';
import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { Resource } from '../models/resource';
import { Maintenance } from '../models/maintenance';

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

    res.status(200).send(existingMaintenance);
  }
);

export default router;
