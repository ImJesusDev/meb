import express, { Request, Response } from 'express';
import { Resource } from '../models/resource';

const router = express.Router();
interface QueryParams {
  page: number;
  perPage: number;
  status: string;
  client: string;
  office: string;
  type: string;
  reference: string;
  from: string;
  to: string;
}

interface Params {
  id: string;
}
router.get(
  '/api/resources',
  async (req: Request<Params, {}, {}, QueryParams>, res: Response) => {
    let query: any = {};
    const status = req.query.status;
    const client = req.query.client;
    const office = req.query.office;
    const type = req.query.type;
    const reference = req.query.reference;
    const from = req.query.from;
    const to = req.query.to;
    if (status) query['status'] = status;
    if (client) query['client'] = client;
    if (office) query['office'] = office;
    if (type) query['type'] = type;
    if (reference) query['reference'] = reference;

    if (to) {
      query['createdAt'] = {
        $lte: new Date(to),
      };
    }
    if (from) {
      query['createdAt'] = {
        $gte: new Date(from),
      };
    }
    if (from && to) {
      query['createdAt'] = {
        $gte: new Date(from),
        $lte: new Date(to),
      };
    }
    let perPage = req.query.perPage ? req.query.perPage : 50;
    let skip = req.query.page ? (Math.max(0, req.query.page) - 1) * perPage : 0;

    const totalResults = await Resource.find(query).countDocuments();
    const resources = await Resource.find(query)
      .skip(Number(skip))
      .limit(Number(perPage))
      .populate(['documents', 'checkups', 'repairs', 'maintenances']);

    res.status(200).send({
      resources,
      totalResults,
      page: skip,
      perPage,
    });
  }
);

export default router;
