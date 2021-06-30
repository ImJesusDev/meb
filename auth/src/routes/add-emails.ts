import express, { Request, Response } from 'express';
import { body } from 'express-validator';

/* Commons */
import { requireAuth, validateRequest, currentUser } from '@movers/common';

/* Models */
import { Email } from '../models/email';
/* Publishers */
import { EmailAuthorizedPublisher } from '../events/publishers/email-authorized-publisher';
/* NATS Client */
import { natsClient } from '../nats';
const router = express.Router();

router.post(
  '/api/users/emails',
  currentUser,
  requireAuth(),
  [
    body('emails').not().isEmpty().withMessage('Emails are required'),
    body('emails').isArray().withMessage('Emails must be an array'),
    body('emails.*.email').not().isEmpty().withMessage('Email is required'),
    body('emails.*.email').isEmail().withMessage('The email is invalid'),
    body('emails.*.client').not().isEmpty().withMessage('Client is required'),
    body('emails.*.office').not().isEmpty().withMessage('Office is required'),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const emails = req.body.emails as {
      email: string;
      client: string;
      office: string;
    }[];

    const success = [];

    for (const email of emails) {
      // Find email by email and client
      const existingEmail = await Email.findOne({
        email: email.email,
        client: email.client,
      });
      if (!existingEmail) {
        const newEmail = Email.build({
          email: email.email,
          client: email.client,
          office: email.office,
          active: true,
        });

        await newEmail.save();
        success.push(newEmail);
        await new EmailAuthorizedPublisher(natsClient.client).publish({
          id: newEmail.id,
          email: newEmail.email,
          client: newEmail.client,
          office: newEmail.office,
          active: newEmail.active,
          version: newEmail.version,
        });
      }
    }

    res.status(201).send(success);
  }
);

export default router;
