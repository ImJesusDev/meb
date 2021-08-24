import express, { Request, Response } from 'express';
import { requireAuth, ReservationStatus } from '@movers/common';

import { Reservation } from '../models/reservation';

const router = express.Router();

router.get(
  '/api/resources/rented-resources',
  requireAuth(),
  async (req: Request, res: Response) => {
    const user = req.currentUser;
    const reservation = await Reservation.find({
      status: ReservationStatus.Active,
      userId: user!.id,
    });

    res.status(200).send(reservation);
  }
);
export default router;
