import {
  BadRequestError,
  requireAuth,
  validateRequest,
  CheckupStatus,
  ResourceStatus,
} from '@movers/common';
import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { Resource } from '../models/resource';
import { Checkup } from '../models/checkup';
import { ResourceUpdatedPublisher } from '../events/publishers/resource-updated-publisher';
import { natsClient } from '../nats';

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
    resource.set({
      status: ResourceStatus.Checkup,
    });

    await resource.save();
    await new ResourceUpdatedPublisher(natsClient.client).publish({
      id: resource.id,
      status: resource.status,
      version: resource.version,
    });

    res.status(200).send(existingCheckup);
  }
);

export default router;
