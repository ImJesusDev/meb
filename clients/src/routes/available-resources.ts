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
      $and: [
        { client, office },
        {
          $or: [
            { status: ResourceStatus.Available },
            { status: ResourceStatus.PendingRepair },
            { status: ResourceStatus.PendingCheckup },
          ],
        },
      ],
    });
    // const resources = await Resource.find({
    //   status: ResourceStatus.Available,
    //   client,
    //   office,
    // });

    res.send(resources);
  }
);

export { router as availableResourcesRouter };
