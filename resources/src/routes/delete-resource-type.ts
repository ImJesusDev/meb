import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { requireAuth, validateRequest, BadRequestError } from '@movers/common';
import { ResourceType } from '../models/resource-type';
const router = express.Router();

router.delete(
  '/api/resources/resource-types/:id',
  requireAuth(),

  async (req: Request, res: Response) => {
    const id = req.params.id;

    const existingResourceType = await ResourceType.findById(id);
    if (!existingResourceType) {
      throw new BadRequestError('Resource Type does not exists');
    }

    existingResourceType.set({
      deletedAt: new Date(),
    });
    await existingResourceType.save();

    res.status(204).send({});
  }
);

export default router;
