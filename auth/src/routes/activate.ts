import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { NotFoundError, validateRequest, UserStatus } from '@movers/common';
/* Models */
import { User } from '../models/user';

const router = express.Router();

router.post(
  '/api/users/activate',
  [
    body('email').isEmail().withMessage('Invalid email'),
    body('email').not().isEmpty().withMessage('Email is email'),
    body('activationCode')
      .not()
      .isEmpty()
      .withMessage('Activation code is required'),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { email, activationCode } = req.body;

    const existingUser = await User.findOne({ email, activationCode });

    if (!existingUser) {
      throw new NotFoundError();
    }
    existingUser.set({
      status: UserStatus.Active,
    });

    await existingUser.save();
    res.status(200).send(existingUser);
  }
);

export { router as activateUserRouter };
