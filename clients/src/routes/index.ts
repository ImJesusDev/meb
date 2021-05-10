import express, { Request, Response } from 'express';
/* Models */
import { Client } from '../models/client';

const router = express.Router();

router.get('/api/clients', async (req: Request, res: Response) => {
  const clients = await Client.find({});
  res.send(clients);
});

export { router as indexClientRouter };
