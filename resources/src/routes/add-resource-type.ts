import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { requireAuth, validateRequest, BadRequestError } from '@movers/common';
import { ResourceType } from '../models/resource-type';
import { s3Client } from '../s3';
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
    let resourcePhoto = '';
    const existingResourceType = await ResourceType.findOne({ type });
    if (existingResourceType) {
      throw new BadRequestError('Resource Type already exists');
    }
    if (photo && photo.includes('data:image')) {
      // Create Buffer
      const buffer = Buffer.from(
        photo.replace(/^data:image\/\w+;base64,/, ''),
        'base64'
      );
      // Get MimeType
      const mimeType = photo.match(/[^:]\w+\/[\w-+\d.]+(?=;|,)/)[0];
      const imageKey = `images/resourceTypes/${Date.now()}`;
      // Params to upload file
      const uploadParams = {
        Bucket: 'meb-images',
        Key: imageKey,
        Body: buffer,
        ContentEncoding: 'base64',
        ContentType: mimeType,
        ACL: 'public-read',
      };
      await s3Client.client.upload(uploadParams).promise();
      resourcePhoto = `https://meb-images.${process.env.SPACES_ENDPOINT}/${imageKey}`;
    } else if (photo) {
      resourcePhoto = photo;
    }
    const resourceType = ResourceType.build({
      resourceTypeBrand: brand,
      resourceTypeModel: model,
      checkupTime,
      kmToMaintenance,
      photo: resourcePhoto,
      type,
      measureIndicators,
    });

    await resourceType.save();

    res.status(201).send(resourceType);
  }
);

export default router;
