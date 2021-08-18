import {
  BadRequestError,
  requireAuth,
  validateRequest,
  RepairStatus,
} from '@movers/common';
import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { Resource } from '../models/resource';
import { Repair } from '../models/repair';

const router = express.Router();

router.post(
  '/api/resources/:id/start-repair',
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
      status: RepairStatus.InProgress,
    });

    await existingRepair.save();

    res.status(200).send(existingRepair);
  }
);

export default router;
