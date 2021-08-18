import {
  BadRequestError,
  requireAuth,
  validateRequest,
  CheckupStatus,
} from '@movers/common';
import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { Resource } from '../models/resource';
import { Checkup } from '../models/checkup';

const router = express.Router();

router.post(
  '/api/resources/:id/start-checkup',
  requireAuth(),
  [
    body('checkupId')
      .notEmpty()
      .withMessage('The id of the checkup is required'),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const resource = await Resource.findById(req.params.id);

    if (!resource) {
      throw new BadRequestError('The resource does not exists');
    }
    const { checkupId } = req.body;
    const existingCheckup = await Checkup.findById(checkupId);
    if (!existingCheckup) {
      throw new BadRequestError('The Checkup does not exists');
    }
    existingCheckup.set({
      status: CheckupStatus.InProgress,
    });

    await existingCheckup.save();

    res.status(200).send(existingCheckup);
  }
);

export default router;
