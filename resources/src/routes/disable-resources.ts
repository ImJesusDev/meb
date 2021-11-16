import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import {
  BadRequestError,
  requireAuth,
  validateRequest,
  ResourceStatus,
} from '@movers/common';
import { Resource } from '../models/resource';
import { ResourceType } from '../models/resource-type';
import { ResourceUpdatedPublisher } from '../events/publishers/resource-updated-publisher';
import { natsClient } from '../nats';
const router = express.Router();

router.post(
  '/api/resources/disable-resources',
  requireAuth(),
  [
    body('resources')
      .not()
      .isEmpty()
      .withMessage('The resources param is required'),
    body('resources')
      .isArray()
      .withMessage('The resources param must be an array'),
    body('resources.*.id')
      .not()
      .isEmpty()
      .withMessage('The resource id is required'),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const resources = req.body.resources as [{ id: string }];

    const success = [];

    for (const resource of resources) {
      const existingResource = await Resource.findById(resource.id);

      if (existingResource) {
        existingResource.set({
          status: ResourceStatus.Disabled,
        });
        await existingResource.save();
        const existingType = await ResourceType.findOne({
          type: existingResource.type,
        });
        await new ResourceUpdatedPublisher(natsClient.client).publish({
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
        });
        success.push(existingResource);
      }
    }
    res.status(200).send(success);
  }
);

export default router;
