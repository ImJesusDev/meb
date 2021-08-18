import express, { Request, Response } from 'express';
import { Repair } from '../models/repair';

const router = express.Router();

router.get(
  '/api/resources/repairs-history',
  async (req: Request<{}, {}, {}, any>, res: Response) => {
    let perPage = req.query.perPage ? req.query.perPage : 50;
    let skip = req.query.page ? (Math.max(0, req.query.page) - 1) * perPage : 0;
    const totalResults = await Repair.find({}).countDocuments();
    const repairs = await Repair.find({})
      .skip(Number(skip))
      .limit(Number(perPage))
      .populate(['resource']);

    res.status(200).send({
      repairs,
      totalResults,
      page: skip,
      perPage,
    });
  }
);
export default router;
