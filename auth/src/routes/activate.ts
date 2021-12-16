import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { NotFoundError, validateRequest, UserStatus } from '@movers/common';
/* Models */
import { User } from '../models/user';
import { UserUpdatedPublisher } from '../events/publishers/user-updated-publisher';
import { natsClient } from '../nats';
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
    console.log(`[Activate User] USER ${existingUser.email} to version ${existingUser.version}`);
    await new UserUpdatedPublisher(natsClient.client).publish({
      id: existingUser.id,
      email: existingUser.email,
      version: existingUser.version,
      documentNumber: existingUser.documentNumber
    });
    res.status(200).send(existingUser);
  }
);

export default router;
