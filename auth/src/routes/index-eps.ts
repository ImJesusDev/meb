import express, { Request, Response } from 'express';
/* Models */
import { Eps } from '../models/eps';
const router = express.Router();

router.get('/api/users/eps-list', async (req: Request, res: Response) => {
  const epsList = await Eps.find({});
  res.send(epsList);
});

export default router;
