import express, { request, Request, Response } from 'express';
import { body } from 'express-validator';

/* Models */
import { Office } from '../models/office';
/* Commons */
import {
  NotFoundError,
  currentUser,
  requireAuth,
  validateRequest,
} from '@movers/common';
const router = express.Router();

router.post(
  '/api/clients/enable-offices',
  currentUser,
  requireAuth(),
  [
    body('offices')
      .not()
      .isEmpty()
      .withMessage('The offices param is required'),
    body('offices').isArray().withMessage('The offices param must be an array'),
    body('offices.*.id')
      .not()
      .isEmpty()
      .withMessage('The office id is required'),
  ],
  async (req: Request, res: Response) => {
    const offices = req.body.offices as [{ id: string }];

    const success = [];

    for (const office of offices) {
      const existingOffice = await Office.findById(office.id);
      if (existingOffice) {
        existingOffice.set({
          deletedAt: null,
        });
        await existingOffice.save();
        success.push(existingOffice);
      }
    }
    res.status(200).send(success);
  }
);

export { router as enableOfficesRouter };
