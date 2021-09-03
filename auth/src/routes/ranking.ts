import express, { Request, Response } from 'express';
/* Models */
import { UserRanking } from '../models/user-ranking';
const router = express.Router();

router.get('/api/users/ranking', async (req: Request, res: Response) => {
  let query: any = {};

  const type = req.query.type;

  if (type) {
    query['resourceType'] = type;
  }

  const ranking = await UserRanking.find(query)
    .sort({ points: -1 })
    .populate(['user']);

  res.send(ranking);
});

export default router;
