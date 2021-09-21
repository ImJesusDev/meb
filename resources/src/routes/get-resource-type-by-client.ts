import express, { Request, Response } from 'express';
import { ResourceType } from '../models/resource-type';
import { NotFoundError } from '@movers/common';
import { Resource } from '../models/resource';

const router = express.Router();

router.get(
  '/api/resources/types-by-client',
  async (req: Request, res: Response) => {
    let query: any = {};
    // Model to return
    let types: {
      id: string;
      name: string;
      photo: string;
      measureIndicators: boolean;
    }[] = [];
    // Get client to filter
    const { client } = req.query;
    if (client) {
      query['client'] = client;
    }
    // Get all resources by client
    const resources = await Resource.find(query);
    // Iterate resources
    for (const resource of resources) {
      // Get resource type
      const inArray = types.find((e) => e.name === resource.type);
      // Validate if is already in array
      if (!inArray) {
        const type = await ResourceType.findOne({
          type: resource.type,
        });
        // If the type is found
        if (type) {
          types.push({
            id: type.id,
            name: type.type,
            photo: type.photo,
            measureIndicators: type.measureIndicators,
          });
        }
      }
    }
    res.status(200).send(types);
  }
);

export default router;
