import express, { Request, Response } from 'express';
import { Maintenance } from '../models/maintenance';

const router = express.Router();

router.get(
  '/api/resources/maintenances-history',
  async (req: Request<{}, {}, {}, any>, res: Response) => {
    let query: any = {};
    const status = req.query.status;
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
    if (status) {
      query['status'] = status;
    }
    let perPage = req.query.perPage ? req.query.perPage : 50;
    let skip = req.query.page ? (Math.max(0, req.query.page) - 1) * perPage : 0;
    const totalResults = await Maintenance.find(query).countDocuments();
    const maintenances = await Maintenance.find(query)
      .skip(Number(skip))
      .limit(Number(perPage))
      .populate(['resource']);

    res.status(200).send({
      maintenances,
      totalResults,
      page: skip,
      perPage,
    });
  }
);
export default router;
