import express, { Request, Response } from 'express';
import { body } from 'express-validator';

/* Commons */
import {
  requireAuth,
  validateRequest,
  currentUser,
  BadRequestError,
} from '@movers/common';

/* Models */
import { Email } from '../models/email';
/* Publishers */
import { EmailAuthorizedPublisher } from '../events/publishers/email-authorized-publisher';
/* NATS Client */
import { natsClient } from '../nats';
const router = express.Router();

router.put(
  '/api/users/emails/:id',
  currentUser,
  requireAuth(),
  [
    body('email').not().isEmpty().withMessage('Email is required'),
    body('email').isEmail().withMessage('The email is invalid'),
    body('client').not().isEmpty().withMessage('Client is required'),
    body('office').not().isEmpty().withMessage('Office is required'),
    body('active').notEmpty().withMessage('Active property is required'),
    body('active').isBoolean().withMessage('Active property is invalid'),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { email, client, office, active } = req.body;
    const { id } = req.params;

    const existingEmail = await Email.findById(id);
    if (!existingEmail) {
      throw new BadRequestError('Email does not exists');
    }
    existingEmail.set({ email, client, office, active });

    res.status(200).send(existingEmail);
  }
);

export default router;
