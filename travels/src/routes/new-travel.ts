import express, { Request, Response } from 'express';

const router = express.Router();

router.post('/api/travels', async (req: Request, res: Response) => {
  res.send({});
});

export { router as newTravelRouter };
