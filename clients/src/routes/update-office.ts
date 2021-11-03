import express, { Request, Response } from 'express';
import { body } from 'express-validator';

/* Commons */
import { requireAuth, validateRequest, BadRequestError } from '@movers/common';

/* Models */
import { Client } from '../models/client';
import { Office } from '../models/office';
import { User } from '../models/user';
import { natsClient } from '../nats';
import { OfficeCreatedPublisher } from '../events/publishers/office-created-publisher';

const router = express.Router();

router.put(
  '/api/clients/:id/offices/:officeId',
  requireAuth(),
  [
    body('city').not().isEmpty().withMessage('City is required'),
    body('country').not().isEmpty().withMessage('Country is required'),
    body('mebAdmin').not().isEmpty().withMessage('MEB admin is required'),
    body('clientAdmin').not().isEmpty().withMessage('Client admin is required'),
    body('repairAdmin')
      .not()
      .isEmpty()
      .withMessage('Repairs admin is required'),
    body('maintenanceAdmin')
      .not()
      .isEmpty()
      .withMessage('Maintenance admin is required'),
    body('inventoryAdmin')
      .not()
      .isEmpty()
      .withMessage('Inventory admin is required'),
    body('location').not().isEmpty().withMessage('Location is required'),
    body('location.lat').not().isEmpty().withMessage('Latitude is required'),
    body('location.lng').not().isEmpty().withMessage('Longitude is required'),
    body('location.lat').isNumeric().withMessage('Invalid latitude'),
    body('location.lng').isNumeric().withMessage('Invalid longitude'),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const clientId = req.params.id;
    const officeId = req.params.officeId;

    const {
      city,
      country,
      mebAdmin,
      clientAdmin,
      location,
      repairAdmin,
      maintenanceAdmin,
      inventoryAdmin,
    } = req.body;

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
    const existingRepairAdmin = await User.findById(repairAdmin);
    if (!existingRepairAdmin) {
      throw new BadRequestError('El administrador de reparación no existe');
    }
    const existingMaintenanceAdmin = await User.findById(maintenanceAdmin);
    if (!existingMaintenanceAdmin) {
      throw new BadRequestError('El administrador de mantenimiento no existe');
    }
    const existingInventoryAdmin = await User.findById(inventoryAdmin);
    if (!existingInventoryAdmin) {
      throw new BadRequestError('El administrador de inventario no existe');
    }
    const existingOffice = await Office.findById(officeId);
    if (!existingOffice) {
      throw new BadRequestError('La Oficina no existe');
    }
    existingOffice.set({
      country,
      city,
      mebAdmin,
      clientAdmin,
      location,
      client: existingClient.name,
      repairAdmin,
      maintenanceAdmin,
      inventoryAdmin,
    });

    await existingOffice.save();

    res.status(200).send(existingOffice);
  }
);

export { router as updateOfficeRouter };
