import express, { Request, Response } from 'express';
import { ResourceType } from '../models/resource-type';

const router = express.Router();

router.get(
  '/api/resources/resource-types',
  async (req: Request, res: Response) => {
    const resources = await ResourceType.find({}).populate(['documentTypes']);

    res.status(200).send(resources);
  }
);

export default router;
