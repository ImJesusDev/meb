import express, { Request, Response } from 'express';
import { requireAuth, BadRequestError, validateRequest } from '@movers/common';
import { Reservation } from '../models/reservation';
import { body } from 'express-validator';

const router = express.Router();

router.put(
  '/api/resources/reservations/:id/reply',
  [body('reply').notEmpty().withMessage('The reply is required')],
  requireAuth(),
  validateRequest,
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const { reply } = req.body;
    // Get reservation
    const reservation = await Reservation.findById(id);

    if (!reservation) {
      throw new BadRequestError('Reservation not found');
    }
    reservation.set({
      reply,
    });

    await reservation.save();

    res.status(200).send(reservation);
  }
);
export default router;
