import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { NotFoundError, validateRequest, UserStatus } from '@movers/common';
/* Models */
import { User } from '../models/user';
import { PasswordReset } from '../models/password-reset';
/* Publishers */
import { PasswordResetPublisher } from '../events/publishers/password-reset-publisher';
/* NATS Client */
import { natsClient } from '../nats';
const router = express.Router();

router.post(
  '/api/users/password-reset',
  [
    body('email').isEmail().withMessage('Invalid email'),
    body('email').not().isEmpty().withMessage('Email is email'),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { email } = req.body;

    const existingUser = await User.findOne({ email });

    if (!existingUser) {
      throw new NotFoundError();
    }
    const passwordReset = PasswordReset.build({
      userId: existingUser.id,
      code: PasswordReset.generateCode().toString(),
    });

    await passwordReset.save();
    await new PasswordResetPublisher(natsClient.client).publish({
      userId: existingUser.id,
      code: passwordReset.code,
    });
    res.status(200).send(existingUser);
  }
);

export default router;
