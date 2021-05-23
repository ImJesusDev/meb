import { Message } from 'node-nats-streaming';
import { PasswordResetEvent } from '@movers/common';
import mongoose from 'mongoose';
import { natsClient } from '../../../nats';
import { mailer } from '../../../mailer';
import { User } from '../../../models/user';
import { PasswordResetListener } from '../password-reset-listener';

const setup = async () => {
  // Create instance of listener
  const listener = new PasswordResetListener(natsClient.client);
  const userId = new mongoose.Types.ObjectId().toHexString();
  const user = User.build({
    id: userId,
    email: 'test@mail.com',
    firstName: 'Regular',
    lastName: 'User',
    activationCode: 123456,
  });
  await user.save();
  // Create fake data for event
  const data: PasswordResetEvent['data'] = {
    userId,
    code: '123456',
  };
  // Create a fake message event
  // @ts-ignore
  const message: Message = {
    ack: jest.fn(),
  };

  return { listener, data, message };
};

it('send password reset email', async () => {
  const { listener, data, message } = await setup();
  // Call the on message method with fake data and event
  await listener.onMessage(data, message);
  // Make assertions
  expect(mailer.sendEmail).toHaveBeenCalled();
});

it('ack the message', async () => {
  const { listener, data, message } = await setup();
  // Call the on message method with fake data and event
  await listener.onMessage(data, message);
  // Make assertions
  expect(message.ack).toHaveBeenCalled();
});
