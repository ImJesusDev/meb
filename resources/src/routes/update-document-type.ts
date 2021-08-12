import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { BadRequestError, requireAuth, validateRequest } from '@movers/common';
import { ResourceType } from '../models/resource-type';
import { DocumentType } from '../models/document-type';
const router = express.Router();

router.put(
  '/api/resources/resource-types/:id/document-types/:documentId',
  requireAuth(),
  [
    body('name').notEmpty().withMessage('Name of the document is required'),
    body('disables')
      .notEmpty()
      .withMessage('The `disables` attribute is required'),
    body('expires')
      .notEmpty()
      .withMessage('The `expires` attribute is required'),
    body('requiresPhoto')
      .notEmpty()
      .withMessage('The `requiresPhoto` attribute is required'),
    body('disables')
      .isBoolean()
      .withMessage('The `disables` attribute must be a boolean'),
    body('expires')
      .isBoolean()
      .withMessage('The `expires` attribute must be a boolean'),
    body('requiresPhoto')
      .isBoolean()
      .withMessage('The `requiresPhoto` attribute must be a boolean'),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { name, disables, requiresPhoto, expires } = req.body;
    const resourceTypeId = req.params.id;
    const documentId = req.params.documentId;

    const existingResourceType = await ResourceType.findById(resourceTypeId);

    if (!existingResourceType) {
      throw new BadRequestError('Resource Type does not exists');
    }
    const existingDocumentType = await DocumentType.findById(documentId);

    if (!existingDocumentType) {
      throw new BadRequestError('Document Type does not exists');
    }
    existingDocumentType.set({
      resourceType: existingResourceType.type,
      name,
      disables,
      requiresPhoto,
      expires,
    });

    await existingDocumentType.save();
    res.status(200).send(existingDocumentType);
  }
);

export default router;
