import express, { Request, Response } from 'express';
/* Models */
import { Country } from '../models/country';

const router = express.Router();

router.get('/api/locations/countries', async (req: Request, res: Response) => {
  const countries = await Country.find({}).populate('cities');
  res.send(countries);
});

export { router as indexCountryRouter };
