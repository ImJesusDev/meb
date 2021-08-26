import express, { Request, Response } from 'express';
import { Resource } from '../models/resource';
import { NotFoundError } from '@movers/common';

const router = express.Router();

router.get(
  '/api/resources/find-by-ref',
  async (req: Request<{}, {}, {}, any>, res: Response) => {
    const ref = req.query.ref;
    const resource = await Resource.findOne({ reference: ref }).populate([
      'documents',
      'checkups',
      'repairs',
      'maintenances',
    ]);
    if (!resource) {
      throw new NotFoundError();
    }
    res.status(200).send(resource);
  }
);

export default router;
