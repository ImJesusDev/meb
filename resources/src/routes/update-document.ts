import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { BadRequestError, requireAuth, validateRequest } from '@movers/common';
import { Document } from '../models/document';
const router = express.Router();

router.put(
  '/api/resources/documents/:id/update',
  requireAuth(),
  [
    body('type').notEmpty().withMessage('Type of the document is required'),
    body('resourceReference')
      .notEmpty()
      .withMessage('The `resourceReference` attribute is required'),
    body('expeditionDate')
      .notEmpty()
      .withMessage('The `expeditionDate` attribute is required'),
    body('expirationDate')
      .notEmpty()
      .withMessage('The `expirationDate` attribute is required'),
    body('documentNumber')
      .notEmpty()
      .withMessage('The `documentNumber` attribute is required'),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const {
      type,
      resourceReference,
      expeditionDate,
      expirationDate,
      documentNumber,
    } = req.body;
    const { id } = req.params;

    const existingDocument = await Document.findById(id);

    if (!existingDocument) {
      throw new BadRequestError('Document does not exists');
    }
    existingDocument.set({
      type,
      resourceReference,
      expeditionDate,
      expirationDate,
      documentNumber,
    });

    await existingDocument.save();
    res.status(200).send(existingDocument);
  }
);

export default router;
