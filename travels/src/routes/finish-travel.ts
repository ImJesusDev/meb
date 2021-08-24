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
} from '@movers/common';
import { TravelFinishedPublisher } from '../events/publishers/travel-finished-publisher';
import { natsClient } from '../nats';

const router = express.Router();

router.put(
  '/api/travels/:id/finish',
  requireAuth(),
  async (req: Request, res: Response) => {
    const { tracking } = req.body;
    const indicators = req.body.indicators as TravelIndicators;
    const id = req.params.id;
    const travel = await Travel.findById(id);

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
    });
    res.status(200).send(travel);
  }
);

export { router as finishTravelRouter };
