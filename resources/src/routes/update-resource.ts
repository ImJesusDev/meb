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

router.put(
  '/api/resources/:id',
  requireAuth(),
  [
    body('type').not().isEmpty().withMessage('Resource type is required.'),
    body('reference')
      .not()
      .isEmpty()
      .withMessage('Resource reference is required.'),
    body('qrCode').not().isEmpty().withMessage('Resource qrCode is required.'),
    body('lockerPassword')
      .not()
      .isEmpty()
      .withMessage('Resource lockerPassword is required.'),
    body('client').not().isEmpty().withMessage('Resource client is required.'),
    body('office').not().isEmpty().withMessage('Resource office is required.'),
    body('loanTime')
      .not()
      .isEmpty()
      .withMessage('Resource loanTime is required.'),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const {
      type,
      reference,
      qrCode,
      lockerPassword,
      client,
      office,
      loanTime,
    } = req.body;
    const id = req.params.id;
    const existingResource = await Resource.findById(id);
    if (!existingResource) {
      throw new BadRequestError('Resource not found');
    }
    const existingResources = await Resource.find({ reference });
    if (existingResources.length > 1) {
      throw new BadRequestError('The reference already exists');
    }

    const existingType = await ResourceType.findOne({ type }).populate([
      'documentTypes',
    ]);

    if (!existingType) {
      throw new BadRequestError('The resource type does not exists');
    }
    existingResource.set({
      type,
      reference,
      qrCode,
      lockerPassword,
      client,
      office,
      loanTime,
      status: ResourceStatus.Available,
    });

    await existingResource.save();
    const url = `https://meb.moversapp.co/api/resources/find-by-ref?ref=${existingResource.reference}`;
    const generatedCode = await QRCode.toDataURL(url);
    existingResource.set({
      qrCode: generatedCode,
    });
    await existingResource.save();

    await new ResourceCreatedPublisher(natsClient.client).publish({
      id: existingResource.id,
      type: existingResource.type,
      reference: existingResource.reference,
      qrCode: existingResource.qrCode,
      lockerPassword: existingResource.lockerPassword,
      client: existingResource.client,
      office: existingResource.office,
      loanTime: existingResource.loanTime,
      status: existingResource.status,
      version: existingResource.version,
      photo: existingType.photo,
    });

    res.status(201).send(existingResource);
  }
);
export default router;
