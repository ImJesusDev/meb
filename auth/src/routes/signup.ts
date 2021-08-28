import express, { Request, Response } from 'express';
import { body } from 'express-validator';
/* Commons */
import {
  validateRequest,
  UserStatus,
  UserRole,
  BadRequestError,
} from '@movers/common';
/* Models */
import { User } from '../models/user';
/* Publishers */
import { UserCreatedPublisher } from '../events/publishers/user-created-publisher';
/* NATS Client */
import { natsClient } from '../nats';

const router = express.Router();

router.post(
  '/api/users/signup',
  [
    body('email').isEmail().withMessage('Email inválido'),
    body('firstName').not().isEmpty().withMessage('El nombre es requerido'),
    body('client').not().isEmpty().withMessage('El cliente es requerido'),
    body('office').not().isEmpty().withMessage('La sede es requerida'),
    body('lastName').not().isEmpty().withMessage('El apellido es requerido'),
    body('termsDate')
      .isBoolean()
      .withMessage('Debe aceptar términos y condiciones'),
    body('comodatoDate')
      .isBoolean()
      .withMessage('Debe aceptar el contrato Comodato'),
    body('mainTransportationMethod')
      .not()
      .isEmpty()
      .withMessage('El medio de transporte principal es requerido'),
    body('secondaryTransportationMethod')
      .not()
      .isEmpty()
      .withMessage('El medio de transporte secundario es requerido'),
    body('password')
      .trim()
      .isLength({ min: 4, max: 20 })
      .withMessage('La contraseña debe de tener entre 4 y 20 caracteres'),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const {
      email,
      password,
      firstName,
      lastName,
      client,
      office,
      mainTransportationMethod,
      secondaryTransportationMethod,
      termsDate,
      comodatoDate,
      weight,
      emergencyContactName,
      emergencyContactPhone,
      bloodType,
      gender,
    } = req.body;

    if (!termsDate) {
      throw new BadRequestError('Debe aceptar términos y condiciones');
    }
    if (!comodatoDate) {
      throw new BadRequestError('Debe aceptar el contrato Comodato');
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      throw new BadRequestError('El correo se encuentra en uso');
    }
    const activationCode = User.generateActivationCode();

    const user = User.build({
      email,
      password,
      firstName,
      lastName,
      client,
      office,
      activationCode,
      role: UserRole.User,
      status: UserStatus.Unverified,
      mainTransportationMethod,
      secondaryTransportationMethod,
      weight,
      emergencyContactName,
      emergencyContactPhone,
      bloodType,
      gender,
    });
    await user.save();

    await new UserCreatedPublisher(natsClient.client).publish({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      version: user.version,
      activationCode: user.activationCode,
      client: user.client!,
      office: user.office!,
    });

    res.status(201).send(user);
  }
);

export default router;
