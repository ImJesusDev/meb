import {
  BadRequestError,
  requireAuth,
  validateRequest,
  CheckupStatus,
} from '@movers/common';
import express, { Request, Response } from 'express';
import { Resource } from '../models/resource';
import { ResourceType } from '../models/resource-type';
import { Component } from '../models/component';
import { Checkup, ComponentCheckupAttrs } from '../models/checkup';

const router = express.Router();

router.post(
  '/api/resources/:id/checkups',
  requireAuth(),
  async (req: Request, res: Response) => {
    const resource = await Resource.findById(req.params.id);

    if (!resource) {
      throw new BadRequestError('The resource does not exists');
    }
    const existingType = await ResourceType.findOne({
      type: resource.type,
    }).populate(['components']);

    const components: ComponentCheckupAttrs[] = [];
    if (existingType && existingType.components) {
      for (const component of existingType.components) {
        components.push({
          componentId: component.id,
          componentName: component.name,
        });
      }
    }

    const checkup = Checkup.build({
      resourceRef: resource.reference,
      createdAt: new Date(),
      components,
      status: CheckupStatus.Pending,
    });

    await checkup.save();

    res.status(201).send(checkup);
  }
);

export default router;
