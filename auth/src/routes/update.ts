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
    body('firstName').not().isEmpty().withMessage('First name is required'),
    body('lastName').not().isEmpty().withMessage('Last name is required'),
    body('password')
      .trim()
      .isLength({ min: 4, max: 20 })
      .withMessage('Password must be between 4 and 20 characters'),
  ],
  validateRequest,
  currentUser,
  requireAuth(),
  async (req: Request, res: Response) => {
    const { password, firstName, lastName } = req.body;

    const currentUser = req.currentUser;

    const user = await User.findOne({ email: currentUser?.email });

    if (!user) {
      throw new NotFoundError();
    }

    user.set({
      password,
      firstName,
      lastName,
    });

    await user.save();
    res.status(200).send(user);
  }
);

export { router as updateUserRouter };
