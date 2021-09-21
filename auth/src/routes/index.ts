import express, { Request, Response } from 'express';
/* Models */
import { User } from '../models/user';
import { UserRole } from '@movers/common';
const router = express.Router();

router.get(
  '/api/users',
  async (req: Request<{}, {}, {}, any>, res: Response) => {
    let query: any = {};
    const role = req.query.role as UserRole;
    const client = req.query.client;
    const office = req.query.office;
    const documentNumber = req.query.documentNumber;
    let skip = req.query.page ? (Math.max(0, req.query.page) - 1) * perPage : 0;
    let perPage = req.query.perPage ? req.query.perPage : 50;

    if (role) {
      query['role'] = role;
    }
    if (client) {
      query['client'] = client;
    }
    if (office) {
      query['office'] = office;
    }
    if (documentNumber) {
      query['documentNumber'] = documentNumber;
    }
    const totalResults = await User.find(query).countDocuments();
    const users = await User.find(query)
      .skip(Number(skip))
      .limit(Number(perPage));
    res.send({ users, totalResults, page: skip, perPage });
  }
);

export default router;
