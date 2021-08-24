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
  '/api/resources/rents/:id/rate',
  requireAuth(),
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const user = req.currentUser;
    const { comments, rating } = req.body;
    const existingReservation = await Reservation.findById(id);
    if (!existingReservation) {
      throw new BadRequestError('The reference already exists');
    }
    existingReservation.set({
      rating,
      comments,
    });
    await existingReservation.save();
    res.status(200).send({ reservation: existingReservation });
  }
);
export default router;
