import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { BadRequestError, requireAuth, validateRequest } from '@movers/common';
import { Component, ComponentAttrs } from '../models/component';
import { ResourceType } from '../models/resource-type';
const router = express.Router();

router.post(
  '/api/resources/disable-components',
  requireAuth(),
  [
    body('components')
      .not()
      .isEmpty()
      .withMessage('The components param is required'),
    body('components')
      .isArray()
      .withMessage('The components param must be an array'),
    body('components.*.id')
      .not()
      .isEmpty()
      .withMessage('The component id is required'),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const components = req.body.components as [{ id: string }];

    const success = [];

    for (const component of components) {
      const existingComponent = await Component.findById(component.id);
      if (existingComponent) {
        existingComponent.set({
          deletedAt: new Date(),
        });
        await existingComponent.save();
        success.push(existingComponent);
      }
    }
    res.status(200).send(success);
  }
);

export default router;
