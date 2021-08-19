import express, { Request, Response } from 'express';
import { Checkup } from '../models/checkup';

const router = express.Router();

router.get(
  '/api/resources/checkups-history',
  async (req: Request<{}, {}, {}, any>, res: Response) => {
    let query: any = {};
    const status = req.query.status;
    if (status) {
      query['status'] = status;
    }
    let perPage = req.query.perPage ? req.query.perPage : 50;
    let skip = req.query.page ? (Math.max(0, req.query.page) - 1) * perPage : 0;
    const totalResults = await Checkup.find(query).countDocuments();
    const checkups = await Checkup.find(query)
      .skip(Number(skip))
      .limit(Number(perPage))
      .populate(['resource']);

    res.status(200).send({
      checkups,
      totalResults,
      page: skip,
      perPage,
    });
  }
);
export default router;
