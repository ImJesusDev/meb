import express, { Request, Response } from 'express';
/* Models */
import { UserIndicators } from '../models/user-indicators';
import { BadRequestError, currentUser, requireAuth } from '@movers/common';
const router = express.Router();

router.get(
  '/api/users/user-indicators',
  currentUser,
  requireAuth(),
  async (req: Request<{}, {}, {}, any>, res: Response) => {
    let query: any = {};
    const from = req.query.from;
    const to = req.query.to;
    const type = req.query.type;
    const currentUser = req.currentUser;
    if (!currentUser) {
      throw new BadRequestError('Must be logged in');
    }
    query['userId'] = currentUser.id;

    let response = {
      energyFootprint: 0,
      environmentalFootprint: 0,
      economicFootprint: 0,
      calories: 0,
      km: 0,
    };
    if (to) {
      query['createdAt'] = {
        $lte: new Date(to),
      };
    }

    if (from) {
      query['createdAt'] = {
        $gte: new Date(from),
      };
    }

    if (from && to) {
      query['createdAt'] = {
        $gte: new Date(from),
        $lte: new Date(to),
      };
    }

    if (type) {
      query['resourceType'] = type;
    }

    const indicators = await UserIndicators.find(query);
    for (const indicator of indicators) {
      response = {
        energyFootprint: response.energyFootprint + indicator.energyFootprint,
        environmentalFootprint:
          response.environmentalFootprint + indicator.environmentalFootprint,
        economicFootprint:
          response.economicFootprint + indicator.economicFootprint,
        calories: response.calories + indicator.calories,
        km: response.km + indicator.km,
      };
    }
    res.send({
      indicators: response,
    });
  }
);

export default router;
