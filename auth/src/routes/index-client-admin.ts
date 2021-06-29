import express, { Request, Response } from 'express';
/* Models */
import { User } from '../models/user';
import { UserRole } from '@movers/common';
const router = express.Router();

router.get('/api/users/client-admins', async (req: Request, res: Response) => {
  const users = await User.find({
    $or: [{ role: UserRole.Client }, { role: UserRole.ClientAdmin }],
  });
  res.send(users);
});

export default router;
