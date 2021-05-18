import express, { Request, Response } from 'express';
import { body } from 'express-validator';
/* Commons */
import { validateRequest, requireAuth, BadRequestError } from '@movers/common';
/* Models */
import { City } from '../models/city';
import { Country } from '../models/country';

const router = express.Router();

router.post(
  '/api/locations/cities',
  requireAuth(),
  [body('name').trim().not().isEmpty().withMessage('Name is required')],
  [body('country').trim().not().isEmpty().withMessage('Country is required')],
  validateRequest,
  async (req: Request, res: Response) => {
    // Get data from request
    const { name, country } = req.body;
    const slug = name.replace(' ', '-').toLowerCase();

    // check if the country does not exists
    const existingCountry = await Country.findOne({ name: country });
    if (!existingCountry) {
      throw new BadRequestError('The country does not exists');
    }
    // check if the city already exists
    const existingCity = await City.findOne({ slug });

    if (existingCity) {
      throw new BadRequestError('City already exists');
    }
    const city = City.build({ name, slug, country });

    await city.save();

    res.status(201).send(city);
  }
);

export { router as newCityRouter };
