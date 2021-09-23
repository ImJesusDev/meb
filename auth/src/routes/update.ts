import express, { Request, Response } from 'express';
import { body } from 'express-validator';
/* JWT */
import jwt from 'jsonwebtoken';
/* Commons */
import {
  BadRequestError,
  requireAuth,
  validateRequest,
  NotFoundError,
  currentUser,
  NotAuthorizedError,
} from '@movers/common';
/* Models */
import { User } from '../models/user';
import { UserUpdatedPublisher } from '../events/publishers/user-updated-publisher';
import { natsClient } from '../nats';

const router = express.Router();

router.put(
  '/api/users',
  [
    body('firstName').not().isEmpty().withMessage('El nombre es requerido'),
    body('client').not().isEmpty().withMessage('El cliente es requerido'),
    body('office').not().isEmpty().withMessage('La sede es requerida'),
    body('lastName').not().isEmpty().withMessage('El apellido es requerido'),
  ],
  validateRequest,
  currentUser,
  requireAuth(),
  async (req: Request, res: Response) => {
    const {
      password,
      firstName,
      lastName,
      client,
      office,
      mainTransportationMethod,
      secondaryTransportationMethod,
      phone,
      photo,
      weight,
      emergencyContactName,
      emergencyContactPhone,
      bloodType,
      gender,
      documentNumber,
      eps,
    } = req.body;

    const currentUser = req.currentUser;

    const user = await User.findOne({ email: currentUser?.email });

    if (!user) {
      throw new NotFoundError();
    }

    user.set({
      firstName,
      lastName,
      client,
      office,
      mainTransportationMethod: mainTransportationMethod
        ? mainTransportationMethod
        : user.mainTransportationMethod,
      secondaryTransportationMethod: secondaryTransportationMethod
        ? secondaryTransportationMethod
        : user.secondaryTransportationMethod,
      phone: phone ? phone : user.phone,
      photo: photo ? photo : user.photo,
      password: password ? password : user.password,
      weight: weight ? weight : user.weight,
      documentNumber: documentNumber ? documentNumber : user.documentNumber,
      emergencyContactName: emergencyContactName
        ? emergencyContactName
        : user.emergencyContactName,
      emergencyContactPhone: emergencyContactPhone
        ? emergencyContactPhone
        : user.emergencyContactPhone,
      bloodType: bloodType ? bloodType : user.bloodType,
      gender: gender ? gender : user.gender,
      eps: eps ? eps : user.eps,
    });

    await user.save();
    await new UserUpdatedPublisher(natsClient.client).publish({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      version: user.version,
      client: user.client!,
      office: user.office!,
      weight: weight ? weight : user.weight,
      documentNumber: documentNumber ? documentNumber : user.documentNumber,
      emergencyContactName: emergencyContactName
        ? emergencyContactName
        : user.emergencyContactName,
      emergencyContactPhone: emergencyContactPhone
        ? emergencyContactPhone
        : user.emergencyContactPhone,
      bloodType: bloodType ? bloodType : user.bloodType,
      gender: gender ? gender : user.gender,
      phone: phone ? phone : user.phone,
      eps: eps ? eps : user.eps,
    });

    const userJwt = jwt.sign(
      {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        country: user.country,
        city: user.city,
        role: user.role,
        status: user.status,
        mainTransportationMethod: user.mainTransportationMethod,
        secondaryTransportationMethod: user.secondaryTransportationMethod,
        photo: user.photo,
        client: user.client,
        office: user.office,
      },
      process.env.JWT_KEY!
    );

    req.session = {
      jwt: userJwt,
    };
    res.status(200).send(user);
  }
);

export default router;
