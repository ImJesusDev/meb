import { Message } from 'node-nats-streaming';
import { UserCreatedEvent } from '@movers/common';
import mongoose from 'mongoose';
import { natsClient } from '../../../nats';
import { User } from '../../../models/user';
import { UserCreatedListener } from '../user-created-listener';

const setup = async () => {
  // Create instance of listener
  const listener = new UserCreatedListener(natsClient.client);
  // Create fake data for event
  const data: UserCreatedEvent['data'] = {
    version: 0,
    id: new mongoose.Types.ObjectId().toHexString(),
    email: 'test@mail.com',
    firstName: 'Regular',
    lastName: 'User',
    activationCode: 123456,
  };
  // Create a fake message event
  // @ts-ignore
  const message: Message = {
    ack: jest.fn(),
  };

  return { listener, data, message };
};

it('creates and save an user', async () => {
  const { listener, data, message } = await setup();
  // Call the on message method with fake data and event
  await listener.onMessage(data, message);
  // Make assertions
  const user = await User.findById(data.id);
  expect(user).toBeDefined();
  expect(user!.email).toEqual(data.email);
});
it('ack the message', async () => {
  const { listener, data, message } = await setup();
  // Call the on message method with fake data and event
  await listener.onMessage(data, message);
  // Make assertions
  expect(message.ack).toHaveBeenCalled();
});
