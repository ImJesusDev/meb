import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { BadRequestError, requireAuth, validateRequest } from '@movers/common';
import { ResourceType } from '../models/resource-type';
import { DocumentType } from '../models/document-type';
const router = express.Router();

router.delete(
  '/api/resources/resource-types/:id/document-types/:documentId',
  requireAuth(),

  async (req: Request, res: Response) => {
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

    await existingDocumentType.delete();
    res.status(204).send({});
  }
);

export default router;
