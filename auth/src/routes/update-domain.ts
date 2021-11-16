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
import { Domain } from '../models/domain';

const router = express.Router();

router.put(
  '/api/users/domains/:id',
  currentUser,
  requireAuth(),
  [
    body('domain').not().isEmpty().withMessage('Domain is required'),
    body('client').not().isEmpty().withMessage('Client is required'),
    body('active').notEmpty().withMessage('Active property is required'),
    body('active').isBoolean().withMessage('Active property is invalid'),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { domain, client, office, active } = req.body;
    const { id } = req.params;

    const existingDomain = await Domain.findById(id);
    if (!existingDomain) {
      throw new BadRequestError('Domain does not exists');
    }
    existingDomain.set({ domain, client, office, active });

    res.status(200).send(existingDomain);
  }
);

export default router;
