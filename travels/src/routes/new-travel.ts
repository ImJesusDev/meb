import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { Travel } from '../models/travel';
import {
  requireAuth,
  validateRequest,
  TravelStatus,
  Location,
} from '@movers/common';
import { TravelCreatedPublisher } from '../events/publishers/travel-created-publisher';
import { natsClient } from '../nats';
const router = express.Router();

router.post(
  '/api/travels',
  requireAuth(),
  [
    body('origin').not().isEmpty().withMessage('Origin is required'),
    body('destination').not().isEmpty().withMessage('Origin is required'),
    body('resourceRef')
      .not()
      .isEmpty()
      .withMessage('Resource reference is required'),
    body('reservationId')
      .not()
      .isEmpty()
      .withMessage('Reservation id is required'),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { origin, destination, resourceRef, reservationId } = req.body;
    const user = req.currentUser;
    const originPoint = req.body.originPoint as Location;
    const destinationPoint = req.body.destinationPoint as Location;
    const travel = Travel.build({
      origin,
      destination,
      resourceRef,
      reservationId,
      status: TravelStatus.Pending,
      userId: user!.id,
      originPoint,
      destinationPoint,
      createdAt: new Date(),
    });
    await travel.save();

    await new TravelCreatedPublisher(natsClient.client).publish({
      id: travel.id,
      resourceRef,
      reservationId,
      status: TravelStatus.Pending,
      userId: travel.userId,
      version: travel.version,
      origin: travel.origin,
      destination: travel.destination,
      originPoint,
      destinationPoint,
    });

    console.log('TravelCreatedPublisher', {
      id: travel.id,
      resourceRef,
      reservationId,
      status: TravelStatus.Pending,
      userId: travel.userId,
      version: travel.version,
      origin: travel.origin,
      destination: travel.destination,
      originPoint,
      destinationPoint,
    });
    res.status(201).send(travel);
  }
);

export { router as newTravelRouter };
