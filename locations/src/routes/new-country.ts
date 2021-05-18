import express, { Request, Response } from 'express';
import { body } from 'express-validator';
/* Commons */
import { validateRequest, requireAuth, BadRequestError } from '@movers/common';
/* Models */
import { Country } from '../models/country';

const router = express.Router();

router.post(
  '/api/locations/countries',
  requireAuth(),
  [body('name').trim().not().isEmpty().withMessage('Name is required')],
  validateRequest,
  async (req: Request, res: Response) => {
    // Get data from request
    const { name } = req.body;
    const slug = name.replace(' ', '-').toLowerCase();

    // check if the country already exists
    const existingCountry = await Country.findOne({ slug });

    if (existingCountry) {
      throw new BadRequestError('Country already exists');
    }
    const country = Country.build({ name, slug });

    await country.save();

    res.status(201).send(country);
  }
);

export { router as newCountryRouter };
