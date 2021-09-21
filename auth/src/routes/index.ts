import express, { Request, Response } from 'express';
/* Models */
import { User } from '../models/user';
import { UserRole } from '@movers/common';
const router = express.Router();

router.get('/api/users', async (req: Request, res: Response) => {
  let query: any = {};
  const role = req.query.role as UserRole;
  const client = req.query.client;
  if (role) {
    query['role'] = role;
  }
  if (client) {
    query['client'] = client;
  }
  const users = await User.find(query);
  res.send(users);
});

export default router;
