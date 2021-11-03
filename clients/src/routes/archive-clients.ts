import express, { request, Request, Response } from 'express';
import { body } from 'express-validator';

/* Models */
import { Client } from '../models/client';
/* Commons */
import {
  NotFoundError,
  currentUser,
  requireAuth,
  validateRequest,
} from '@movers/common';
const router = express.Router();

router.post(
  '/api/clients/disable-clients',
  currentUser,
  requireAuth(),
  [
    body('clients')
      .not()
      .isEmpty()
      .withMessage('The clients param is required'),
    body('clients').isArray().withMessage('The clients param must be an array'),
    body('clients.*.id')
      .not()
      .isEmpty()
      .withMessage('The client id is required'),
  ],
  async (req: Request, res: Response) => {
    const clients = req.body.clients as [{ id: string }];

    const success = [];

    for (const client of clients) {
      const existingClient = await Client.findById(client.id);
      if (existingClient) {
        existingClient.set({
          deletedAt: new Date(),
        });
        await existingClient.save();
        success.push(existingClient);
      }
    }
    res.status(200).send(success);
  }
);

export { router as disableClientsRouter };
