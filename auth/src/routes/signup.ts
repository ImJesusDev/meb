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
/* JWT */
import jwt from 'jsonwebtoken';
/* Publishers */
import { UserCreatedPublisher } from '../events/publishers/user-created-publisher';
/* NATS Client */
import { natsClient } from '../nats';

const router = express.Router();

router.post(
  '/api/users/signup',
  [
    body('email').isEmail().withMessage('Invalid email'),
    body('firstName').not().isEmpty().withMessage('First name is required'),
    body('lastName').not().isEmpty().withMessage('Last name is required'),
    body('password')
      .trim()
      .isLength({ min: 4, max: 20 })
      .withMessage('Password must be between 4 and 20 characters'),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { email, password, firstName, lastName } = req.body;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      throw new BadRequestError('Email in use');
    }
    const activationCode = 112233;

    const user = User.build({
      email,
      password,
      firstName,
      lastName,
      activationCode,
      role: UserRole.User,
      status: UserStatus.Unverified,
    });
    await user.save();

    await new UserCreatedPublisher(natsClient.client).publish({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      version: user.version,
      activationCode: user.activationCode,
    });

    const userJwt = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        status: user.status,
      },
      process.env.JWT_KEY!
    );

    req.session = {
      jwt: userJwt,
    };

    res.status(201).send(user);
  }
);

export { router as signupRouter };
