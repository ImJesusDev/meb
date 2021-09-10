import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { Travel } from '../models/travel';
import {
  requireAuth,
  validateRequest,
  TravelStatus,
  Location,
  BadRequestError,
} from '@movers/common';
import { TravelCreatedPublisher } from '../events/publishers/travel-created-publisher';
import { natsClient } from '../nats';
const router = express.Router();

router.get(
  '/api/travels',
  requireAuth(),
  async (req: Request<{}, {}, {}, any>, res: Response) => {
    const user = req.currentUser;
    if(!user) {
      throw new BadRequestError("Must be logged in");
    }
    let query: any = {};
    query['userId'] = req.currentUser?.id;
    let perPage = req.query.perPage ? req.query.perPage : 50;
    let skip = req.query.page ? (Math.max(0, req.query.page) - 1) * perPage : 0;
    const travels = await Travel.find(query)
      .skip(Number(skip))
      .limit(Number(perPage))
    res.status(201).send(travels);
  }
);

export { router as travelListRouter };
