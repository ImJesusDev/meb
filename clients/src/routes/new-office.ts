import express, { Request, Response } from 'express';
import { body } from 'express-validator';

/* Commons */
import { requireAuth, validateRequest, BadRequestError } from '@movers/common';

/* Models */
import { Client } from '../models/client';
import { Office } from '../models/office';
import { User } from '../models/user';

const router = express.Router();

router.post(
  '/api/clients/:id/offices',
  requireAuth(),
  [
    body('name').not().isEmpty().withMessage('Name is required'),
    body('city').not().isEmpty().withMessage('City is required'),
    body('country').not().isEmpty().withMessage('Country is required'),
    body('mebAdmin').not().isEmpty().withMessage('MEB admin is required'),
    body('clientAdmin').not().isEmpty().withMessage('Client admin is required'),
    body('location').not().isEmpty().withMessage('Location is required'),
    body('location.lat').not().isEmpty().withMessage('Latitude is required'),
    body('location.lng').not().isEmpty().withMessage('Longitude is required'),
    body('location.lat').isNumeric().withMessage('Invalid latitude'),
    body('location.lng').isNumeric().withMessage('Invalid longitude'),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const clientId = req.params.id;

    const { name, city, country, mebAdmin, clientAdmin, location } = req.body;

    const existingClient = await Client.findById(clientId);
    if (!existingClient) {
      throw new BadRequestError('El cliente no existe');
    }
    const existingMebAdmin = await User.findById(mebAdmin);
    if (!existingMebAdmin) {
      throw new BadRequestError('El administrador Mejor en Bici no existe');
    }
    const existingClientAdmin = await User.findById(clientAdmin);
    if (!existingClientAdmin) {
      throw new BadRequestError('El administrador del cliente no existe');
    }

    const office = Office.build({
      name,
      country,
      city,
      mebAdmin,
      clientAdmin,
      location,
      client: existingClient.name,
    });

    await office.save();
    res.status(201).send(office);
  }
);

export { router as addOfficeRouter };
