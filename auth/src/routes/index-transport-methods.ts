import express, { Request, Response } from 'express';
/* Models */
import { TransportMethod } from '../models/transport-method';
const router = express.Router();

router.get(
  '/api/users/transport-methods',
  async (req: Request, res: Response) => {
    const methods = await TransportMethod.find({});
    res.send(methods);
  }
);

export default router;
