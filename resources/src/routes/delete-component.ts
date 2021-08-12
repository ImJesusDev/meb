import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { BadRequestError, requireAuth, validateRequest } from '@movers/common';
import { Component, ComponentAttrs } from '../models/component';
import { ResourceType } from '../models/resource-type';
const router = express.Router();

router.delete(
  '/api/resources/resource-types/:id/components/:componentId',
  requireAuth(),
  async (req: Request, res: Response) => {
    const resourceTypeId = req.params.id;
    const componentId = req.params.componentId;

    const existingResourceType = await ResourceType.findById(resourceTypeId);

    if (!existingResourceType) {
      throw new BadRequestError('Resource type does not exists');
    }
    const existingComponent = await Component.findById(componentId);

    if (!existingComponent) {
      throw new BadRequestError('Component does not exists');
    }

    await existingComponent.delete();
    res.status(204).send({});
  }
);

export default router;
