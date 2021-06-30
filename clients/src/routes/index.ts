import express, { Request, Response } from 'express';
/* Models */
import { Client } from '../models/client';

const router = express.Router();

router.get('/api/clients', async (req: Request, res: Response) => {
  const clients = await Client.find({
    deletedAt: null,
  })
    .limit(10)
    .populate([
      'meb_admin',
      'super_admin_client',
      'offices',
      'domains',
      'emails',
      'users',
    ])
    .populate({
      path: 'offices',
      populate: ['emails'],
    });
  res.send(clients);
});

export { router as indexClientRouter };
