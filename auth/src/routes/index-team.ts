import express, { Request, Response } from 'express';
/* Models */
import { User } from '../models/user';
import { UserRole } from '@movers/common';
const router = express.Router();

router.get('/api/users/team', async (req: Request, res: Response) => {
  const users = await User.find({
    $or: [
      { role: UserRole.MebAdmin },
      { role: UserRole.User },
      { role: UserRole.RepairManager },
      { role: UserRole.InventoryManager },
      { role: UserRole.MaintenanceManager },
    ],
  });
  res.send(users);
});

export default router;
