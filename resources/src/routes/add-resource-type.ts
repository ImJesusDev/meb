import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { requireAuth, validateRequest, BadRequestError } from '@movers/common';
import { ResourceType } from '../models/resource-type';
const router = express.Router();

router.post(
  '/api/resources/resource-types',
  requireAuth(),
  [
    body('type').not().isEmpty().withMessage('Resource type is required.'),
    body('brand')
      .not()
      .isEmpty()
      .withMessage('The brand of the resource is required.'),
    body('model')
      .not()
      .isEmpty()
      .withMessage('The model of the resource is required.'),
    body('measureIndicators')
      .not()
      .isEmpty()
      .withMessage('measureIndicators is required.'),
    body('measureIndicators')
      .isBoolean()
      .withMessage('measureIndicators must be a boolean.'),
    body('checkupTime')
      .not()
      .isEmpty()
      .withMessage('The checkup time of the resource is required.'),
    body('checkupTime')
      .isNumeric()
      .withMessage('The checkup time of the resource is required.'),
    body('kmToMaintenance')
      .not()
      .isEmpty()
      .withMessage('The kmToMaintenance time of the resource is required.'),
    body('kmToMaintenance')
      .isNumeric()
      .withMessage('The kmToMaintenance time of the resource is required.'),
    body('photo')
      .not()
      .isEmpty()
      .withMessage('The photo of the resource is required.'),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const {
      brand,
      model,
      type,
      checkupTime,
      kmToMaintenance,
      photo,
      measureIndicators,
    } = req.body;

    const existingResourceType = await ResourceType.findOne({ type });
    if (existingResourceType) {
      throw new BadRequestError('Resource Type already exists');
    }
    const resourceType = ResourceType.build({
      resourceTypeBrand: brand,
      resourceTypeModel: model,
      checkupTime,
      kmToMaintenance,
      photo,
      type,
      measureIndicators,
    });

    await resourceType.save();

    res.status(201).send(resourceType);
  }
);

export default router;
