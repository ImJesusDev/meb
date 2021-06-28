import express, { Request, Response } from 'express';
/* Models */
import { Domain } from '../models/domain';
const router = express.Router();

router.get('/api/users/domains', async (req: Request, res: Response) => {
  let query: any = {};
  const client = req.query.client;
  if (client) {
    query['client'] = client;
  }
  const domains = await Domain.find(query);
  res.send(domains);
});

export default router;
