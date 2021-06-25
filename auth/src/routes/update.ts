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
    body('city').not().isEmpty().withMessage('La ciudad es requerida'),
    body('country').not().isEmpty().withMessage('El país es requerido'),
    body('lastName').not().isEmpty().withMessage('El apellido es requerido'),
    body('password')
      .trim()
      .isLength({ min: 4, max: 20 })
      .withMessage('La contraseña debe de tener entre 4 y 20 caracteres'),
  ],
  validateRequest,
  currentUser,
  requireAuth(),
  async (req: Request, res: Response) => {
    const { password, firstName, lastName, city, country } = req.body;

    const currentUser = req.currentUser;

    const user = await User.findOne({ email: currentUser?.email });

    if (!user) {
      throw new NotFoundError();
    }

    user.set({
      password,
      firstName,
      lastName,
      city,
      country,
    });

    await user.save();
    res.status(200).send(user);
  }
);

export default router;
