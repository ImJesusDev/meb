import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { BadRequestError, requireAuth, validateRequest } from '@movers/common';
import { Component, ComponentAttrs } from '../models/component';
import { ResourceType } from '../models/resource-type';
const router = express.Router();

router.put(
  '/api/resources/resource-types/:id/components/:componentId',
  requireAuth(),
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('componentBrand').notEmpty().withMessage('Brand is required'),
    body('componentModel').notEmpty().withMessage('Model is required'),
    body('regularCondition')
      .notEmpty()
      .withMessage('Regular condition object required'),
    body('regularCondition.disables')
      .notEmpty()
      .withMessage('Regular condition disables property is required'),
    body('regularCondition.disables')
      .isBoolean()
      .withMessage('Regular condition disables property is invalid'),
    body('regularCondition.ticket')
      .notEmpty()
      .withMessage('Regular condition ticket property is required'),
    body('regularCondition.ticket')
      .isBoolean()
      .withMessage('Bad condition ticket property is invalid'),
    body('badCondition.disables')
      .notEmpty()
      .withMessage('Bad condition disables property is required'),
    body('badCondition.disables')
      .isBoolean()
      .withMessage('Bad condition disables property is invalid'),
    body('badCondition.ticket')
      .notEmpty()
      .withMessage('Bad condition ticket property is required'),
    body('badCondition.ticket')
      .isBoolean()
      .withMessage('Regular condition ticket property is invalid'),
    body('regularCondition')
      .isObject()
      .withMessage('Regular condition object required'),
    body('badCondition')
      .notEmpty()
      .withMessage('Bad condition object required'),
    body('badCondition')
      .isObject()
      .withMessage('Bad condition object required'),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { name, componentBrand, componentModel } = req.body;

    // Since the format of this objects is validated in the request
    // Map to the Model attrs from body
    const badCondition = req.body
      .badCondition as ComponentAttrs['badCondition'];
    const regularCondition = req.body
      .regularCondition as ComponentAttrs['regularCondition'];
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
    existingComponent.set({
      name,
      componentBrand,
      componentModel,
      badCondition,
      regularCondition,
      resourceType: existingResourceType.type,
    });

    await existingComponent.save();
    res.status(200).send(existingComponent);
  }
);

export default router;
