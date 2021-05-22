import express, { request, Request, Response } from 'express';
/* Models */
import { Client } from '../models/client';
/* Commons */
import { NotFoundError } from '@movers/common';
const router = express.Router();

router.get('/api/clients/:id', async (req: Request, res: Response) => {
  const client = await Client.findById(req.params.id).populate([
    'meb_admin',
    'super_admin_client',
  ]);
  if (!client) {
    throw new NotFoundError();
  }
  res.send(client);
});

export { router as showClientRouter };
