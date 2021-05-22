import express, { Request, Response } from 'express';
import { body } from 'express-validator';
/* Commons */
import { requireAuth, validateRequest } from '@movers/common';
/* Models */
import { Client } from '../models/client';
const router = express.Router();

router.post(
  '/api/clients',
  requireAuth(),
  [
    body('name').not().isEmpty().withMessage('Name is required'),
    body('nit').not().isEmpty().withMessage('Nit is required'),
    body('logo').not().isEmpty().withMessage('Logo is required'),
    body('mebAdmin').not().isEmpty().withMessage('MEB admin is required'),
    body('superAdminClient')
      .not()
      .isEmpty()
      .withMessage('Super admin client is required'),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { name, nit, logo, mebAdmin, superAdminClient } = req.body;

    const client = Client.build({
      name,
      nit,
      logo,
      mebAdmin,
      superAdminClient,
    });
    await client.save();

    res.status(201).send(client);
  }
);

export { router as newClientRouter };
