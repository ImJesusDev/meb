import { BadRequestError } from '@movers/common';
import express from 'express';
import { UserUpdatedPublisher } from '../events/publishers/user-updated-publisher';
import { User } from '../models/user';
import { natsClient } from '../nats';

const router = express.Router();

router.put('/api/users/:id/archive', async (req, res) => {
  const { id } = req.params;
  const user = await User.findById(id);
  if (!user) {
    throw new BadRequestError('User not found');
  }
  user.set({
    deletedAt: new Date(),
  });

  await user.save();
  await new UserUpdatedPublisher(natsClient.client).publish({
    id: user.id,
    email: user.email,
    version: user.version,
    documentNumber: user.documentNumber,
    deletedAt: user.deletedAt,
  });

  res.send(user);
});

export default router;
