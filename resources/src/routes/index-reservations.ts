import express, { Request, Response } from 'express';
import { Reservation } from '../models/reservation';
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
  '/api/resources/reservation-list',
  async (req: Request<Params, {}, {}, QueryParams>, res: Response) => {
    let query: any = {};
    const from = req.query.from;
    const to = req.query.to;

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

    const client = req.query.client;
    if (client) {
        query["resource.client"] = client;
    }

    let perPage = req.query.perPage ? req.query.perPage : 50;
    let skip = req.query.page ? (Math.max(0, req.query.page) - 1) * perPage : 0;

    const totalResults = await Reservation.find(query).countDocuments();
    const reservations = await Reservation.find(query)
      .skip(Number(skip))
      .limit(Number(perPage))
      .populate(['travels', 'user', 'resource']);

    res.status(200).send({
      reservations,
      totalResults,
      page: skip,
      perPage,
    });
  }
);

export default router;
