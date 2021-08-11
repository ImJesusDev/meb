import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { Travel } from '../models/travel';
import { requireAuth, validateRequest, TravelStatus } from '@movers/common';

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
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { origin, destination, resourceRef } = req.body;
    const user = req.currentUser;

    const travel = Travel.build({
      origin,
      destination,
      resourceRef,
      status: TravelStatus.Pending,
      userId: user!.id,
    });
    await travel.save();
    res.status(201).send(travel);
  }
);

export { router as newTravelRouter };
