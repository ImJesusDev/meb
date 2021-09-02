import express, { Request, Response } from 'express';
import { Resource } from '../models/resource';
import { NotFoundError } from '@movers/common';

const router = express.Router();

router.get('/api/resources/find/:id', async (req: Request, res: Response) => {
  const resource = await Resource.findById(req.params.id)
    .populate(['documents', 'checkups', 'repairs', 'maintenances'])
    .populate({
      path: 'repairs',
      populate: ['assignee'],
    })
    .populate({
      path: 'checkups',
      populate: ['assignee'],
    })
    .populate({
      path: 'maintenances',
      populate: ['assignee'],
    });
  if (!resource) {
    throw new NotFoundError();
  }
  res.status(200).send(resource);
});

export default router;
