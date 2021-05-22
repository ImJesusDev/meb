import express, { Request, Response } from 'express';
/* Models */
import { User } from '../models/user';
import { UserRole } from '@movers/common';
const router = express.Router();

router.get('/api/users', async (req: Request, res: Response) => {
  let query: any = {};
  const role = req.query.role as UserRole;
  if (role) {
    query['role'] = role;
  }
  const users = await User.find(query);
  res.send(users);
});

export { router as indexUserRouter };
