import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { Travel } from '../models/travel';
import {
  requireAuth,
  validateRequest,
  TravelStatus,
  NotFoundError,
  NotAuthorizedError,
} from '@movers/common';

const router = express.Router();

router.put(
  '/api/travels/:id/finish',
  requireAuth(),
  async (req: Request, res: Response) => {
    const { tracking, indicators } = req.body;
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
      indicators: indicators ? indicators : [],
      tracking: tracking ? tracking : [],
      completedAt: new Date(),
    });

    await travel.save();
    res.status(200).send(travel);
  }
);

export { router as finishTravelRouter };
