import express, { Request, Response } from 'express';
import { body } from 'express-validator';
/* Commons */
import {
  validateRequest,
  requireAuth,
  NotFoundError,
  BadRequestError,
} from '@movers/common';
/* Models */
import { City } from '../models/city';
import { Geometry } from '../models/geometry';

const router = express.Router();

router.post(
  '/api/locations/cities/:id/geometries',
  requireAuth(),
  [
    body('name').trim().not().isEmpty().withMessage('Name is required'),
    body('points').isArray().withMessage('Points must be an array'),
    body('points').not().isEmpty().withMessage('Points are required'),
    body('points.*.lat').not().isEmpty().withMessage('Latitude is required'),
    body('points.*.lng').not().isEmpty().withMessage('Longitude is required'),
    body('points.*.lat').isNumeric().withMessage('Invalid latitude'),
    body('points.*.lng').isNumeric().withMessage('Invalid longitude'),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { name, points } = req.body;

    // Find city
    const city = await City.findById(req.params.id);
    if (!city) {
      throw new BadRequestError('The city does not exists');
    }

    // Find geometry by name
    const existingGeometry = await Geometry.findOne({ name });
    if (existingGeometry) {
      throw new BadRequestError('Geometry name already exists');
    }

    // Create new geometry
    const geometry = Geometry.build({
      name,
      city: city.name,
      points,
    });

    await geometry.save();

    res.status(201).send(geometry);
  }
);

export { router as newGeometryRouter };
