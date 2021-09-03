import express, { Request, Response } from 'express';
import { Repair } from '../models/repair';

const router = express.Router();

router.get(
  '/api/resources/repairs-history',
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
    const totalResults = await Repair.find(query).countDocuments();
    const repairs = await Repair.find(query)
      .skip(Number(skip))
      .limit(Number(perPage))
      .populate(['resource', 'assignedUser']);

    res.status(200).send({
      repairs,
      totalResults,
      page: skip,
      perPage,
    });
  }
);
export default router;
