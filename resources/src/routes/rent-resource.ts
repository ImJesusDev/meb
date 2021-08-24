import express, { Request, Response } from 'express';
import {
  requireAuth,
  BadRequestError,
  ResourceStatus,
  ReservationStatus,
} from '@movers/common';
import { Resource } from '../models/resource';
import { Reservation } from '../models/reservation';
import { natsClient } from '../nats';
import { ResourceUpdatedPublisher } from '../events/publishers/resource-updated-publisher';

const router = express.Router();

router.post(
  '/api/resources/:id/rent',
  requireAuth(),
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const user = req.currentUser;
    const existingResource = await Resource.findById(id);
    if (!existingResource) {
      throw new BadRequestError('The reference already exists');
    }

    existingResource.set({
      status: ResourceStatus.Rented,
    });

    await existingResource.save();
    await new ResourceUpdatedPublisher(natsClient.client).publish({
      id: existingResource.id,
      status: existingResource.status,
      version: existingResource.version,
    });
    const reservation = Reservation.build({
      resourceRef: existingResource.reference,
      createdAt: new Date(),
      status: ReservationStatus.Active,
      userId: user!.id,
    });
    await reservation.save();
    res.status(200).send({ resource: existingResource, reservation });
  }
);
export default router;
