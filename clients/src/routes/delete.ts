import express, { request, Request, Response } from 'express';
/* Models */
import { Client } from '../models/client';
/* Commons */
import { NotFoundError } from '@movers/common';
const router = express.Router();

router.delete('/api/clients/:id', async (req: Request, res: Response) => {
  const client = await Client.findById(req.params.id);
  if (!client) {
    throw new NotFoundError();
  }
  await client.delete();
  res.status(204).send({});
});

export { router as deleteClientRouter };
