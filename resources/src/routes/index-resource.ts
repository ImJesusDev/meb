import express, { Request, Response } from 'express';
import { Resource } from '../models/resource';

const router = express.Router();

router.get('/api/resources', async (req: Request, res: Response) => {
  const resources = await Resource.find({}).populate(['documents']);

  res.status(200).send(resources);
});

export default router;
