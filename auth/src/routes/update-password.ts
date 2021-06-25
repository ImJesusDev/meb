import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { NotFoundError, validateRequest, UserStatus } from '@movers/common';
/* Models */
import { User } from '../models/user';
import { PasswordReset } from '../models/password-reset';

const router = express.Router();

router.post(
  '/api/users/update-password',
  [
    body('email').isEmail().withMessage('Invalid email'),
    body('email').not().isEmpty().withMessage('Email is email'),
    body('password')
      .trim()
      .isLength({ min: 4, max: 20 })
      .withMessage('La contraseña debe de tener entre 4 y 20 caracteres'),
    body('activationCode')
      .not()
      .isEmpty()
      .withMessage('Activation code is required'),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { email, activationCode, password } = req.body;

    const existingUser = await User.findOne({ email });

    if (!existingUser) {
      throw new NotFoundError();
    }

    const passwordReset = await PasswordReset.findOne({
      userId: existingUser.id,
      code: activationCode,
    });
    if (!passwordReset) {
      throw new NotFoundError();
    }
    existingUser.set({
      password,
    });

    await existingUser.save();
    res.status(200).send(existingUser);
  }
);

export default router;
