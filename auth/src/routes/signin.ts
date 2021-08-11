import express, { Request, Response } from 'express';
import { body } from 'express-validator';
/* Models */
import { User } from '../models/user';
/* Commons */
import { validateRequest, BadRequestError } from '@movers/common';
/* Services */
import { Password } from '../services/password';
/* JWT */
import jwt from 'jsonwebtoken';

const router = express.Router();

router.post(
  '/api/users/signin',
  [
    body('email').isEmail().withMessage('Invalid email'),
    body('password').trim().notEmpty().withMessage('Must provide password'),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const existingUser = await User.findOne({ email });

    if (!existingUser) {
      throw new BadRequestError('Invalid credentials');
    }

    const passwordsMatch = await Password.compare(
      existingUser.password,
      password
    );

    if (!passwordsMatch) {
      throw new BadRequestError('Invalid credentials');
    }

    const userJwt = jwt.sign(
      {
        id: existingUser.id,
        email: existingUser.email,
        firstName: existingUser.firstName,
        lastName: existingUser.lastName,
        country: existingUser.country,
        city: existingUser.city,
        role: existingUser.role,
        status: existingUser.status,
        mainTransportationMethod: existingUser.mainTransportationMethod,
        secondaryTransportationMethod:
          existingUser.secondaryTransportationMethod,
        photo: existingUser.photo,
        client: existingUser.client,
        office: existingUser.office,
      },
      process.env.JWT_KEY!
    );

    req.session = {
      jwt: userJwt,
    };

    res.status(200).send(existingUser);
  }
);

export default router;
