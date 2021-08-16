import express, { Request, Response } from 'express';
import { Resource } from '../models/resource';

const router = express.Router();
interface QueryParams {
  page: number;
  perPage: number;
}

interface Params {
  id: string;
}
router.get(
  '/api/resources',
  async (req: Request<Params, {}, {}, QueryParams>, res: Response) => {
    let perPage = req.query.perPage ? req.query.perPage : 50;
    let skip = req.query.page ? (Math.max(0, req.query.page) - 1) * perPage : 0;

    const resources = await Resource.find({})
      .skip(Number(skip))
      .limit(Number(perPage))
      .populate(['documents']);

    res.status(200).send(resources);
  }
);

export default router;
