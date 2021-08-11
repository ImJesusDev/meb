import express, { Request, Response } from 'express';
import { body } from 'express-validator';
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
    });

    await user.save();
    res.status(200).send(user);
  }
);

export default router;
