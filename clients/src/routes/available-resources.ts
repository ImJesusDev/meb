import express, { request, Request, Response } from 'express';
/* Models */
import { Resource } from '../models/resource';
/* Commons */
import { BadRequestError, ResourceStatus } from '@movers/common';
const router = express.Router();

router.get(
  '/api/clients/resources/available',
  async (req: Request, res: Response) => {
    const client = req.query.client as string;
    const office = req.query.office as string;
    if (!client) {
      throw new BadRequestError('Client is required');
    }
    if (!office) {
      throw new BadRequestError('Office is required');
    }
    const resources = await Resource.find({
      client,
      office,
      status: {
        $in: [
          ResourceStatus.Available,
          ResourceStatus.PendingRepair,
          ResourceStatus.PendingCheckup,
        ],
      },
    });

    res.send(resources);
  }
);

export { router as availableResourcesRouter };
