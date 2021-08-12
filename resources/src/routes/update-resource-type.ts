import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { requireAuth, validateRequest, BadRequestError } from '@movers/common';
import { ResourceType } from '../models/resource-type';
const router = express.Router();

router.put(
  '/api/resources/resource-types/:id',
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
    body('photo')
      .not()
      .isEmpty()
      .withMessage('The photo of the resource is required.'),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { brand, model, type, checkupTime, photo, measureIndicators } =
      req.body;
    const id = req.params.id;

    const existingResourceType = await ResourceType.findById(id);
    if (!existingResourceType) {
      throw new BadRequestError('Resource Type does not exists');
    }
    existingResourceType.set({
      resourceTypeBrand: brand,
      resourceTypeModel: model,
      checkupTime,
      photo,
      type,
      measureIndicators,
    });

    await existingResourceType.save();

    res.status(200).send(existingResourceType);
  }
);

export default router;
