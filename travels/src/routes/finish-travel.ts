import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { Travel } from '../models/travel';
import {
  requireAuth,
  validateRequest,
  TravelStatus,
  NotFoundError,
  NotAuthorizedError,
  TravelIndicators,
  Location,
} from '@movers/common';
import { TravelFinishedPublisher } from '../events/publishers/travel-finished-publisher';
import { natsClient } from '../nats';

const router = express.Router();

router.put(
  '/api/travels/:id/finish',
  requireAuth(),
  async (req: Request, res: Response) => {
    console.log('finish travel');

    const { tracking, origin, destination } = req.body;
    console.log('tracking: ', tracking);
    const indicators = req.body.indicators as TravelIndicators;
    const id = req.params.id;
    const travel = await Travel.findById(id);
    const originPoint = req.body.originPoint as Location;
    const destinationPoint = req.body.destinationPoint as Location;
    if (!travel) {
      throw new NotFoundError();
    }

    const user = req.currentUser;

    if (user!.id !== travel.userId) {
      throw new NotAuthorizedError();
    }

    travel.set({
      status: TravelStatus.Completed,
      indicators: indicators ? indicators : {},
      tracking: tracking ? tracking : [],
      completedAt: new Date(),
      origin: origin ? origin : travel.origin,
      destination: destination ? destination : travel.destination,
      originPoint,
      destinationPoint,
    });

    await travel.save();
    await new TravelFinishedPublisher(natsClient.client).publish({
      id: travel.id,
      resourceRef: travel.resourceRef,
      reservationId: travel.reservationId,
      status: TravelStatus.Completed,
      indicators,
      userId: travel.userId,
      version: travel.version,
      origin: travel.origin,
      destination: travel.destination,
      originPoint: travel.originPoint,
      destinationPoint: travel.destinationPoint,
      tracking: travel.tracking,
    });
    res.status(200).send(travel);
  }
);

export { router as finishTravelRouter };
