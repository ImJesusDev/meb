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
  '/api/resources/:id/return',
  requireAuth(),
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const { reservationId } = req.body;
    const user = req.currentUser;
    const existingResource = await Resource.findById(id);
    if (!existingResource) {
      throw new BadRequestError('The resource does not exists');
    }
    const reservation = await Reservation.findById(reservationId);
    if (!reservation) {
      throw new BadRequestError('The resource does not exists');
    }

    existingResource.set({
      status: ResourceStatus.Available,
    });

    await existingResource.save();
    await new ResourceUpdatedPublisher(natsClient.client).publish({
      id: existingResource.id,
      status: existingResource.status,
      version: existingResource.version,
    });
    reservation.set({
      status: ReservationStatus.Finished,
    });
    await reservation.save();
    res.status(200).send({ resource: existingResource, reservation });
  }
);
export default router;
