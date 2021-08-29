import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import {
  requireAuth,
  validateRequest,
  BadRequestError,
  ResourceStatus,
} from '@movers/common';
import { Resource } from '../models/resource';
import { ResourceType } from '../models/resource-type';
import { Document, DocumentAttrs } from '../models/document';
import { checkupQueue } from '../queues/checkup-queue';
import { natsClient } from '../nats';
import { ResourceCreatedPublisher } from '../events/publishers/resource-created-publisher';
import QRCode from 'qrcode';

const router = express.Router();

router.delete(
  '/api/resources/:id',
  requireAuth(),
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const existingResource = await Resource.findById(id);
    if (!existingResource) {
      throw new BadRequestError('Resource not found');
    }

    existingResource.set({
      deletedAt: new Date(),
    });

    res.status(204).send({});
  }
);
export default router;
