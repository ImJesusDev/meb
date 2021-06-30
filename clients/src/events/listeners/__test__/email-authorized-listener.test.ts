import { Message } from 'node-nats-streaming';
import { EmailAuthorizedEvent } from '@movers/common';
import mongoose from 'mongoose';
import { natsClient } from '../../../nats';
import { Email } from '../../../models/email';
import { EmailAuthorizedListener } from '../email-authorized-listener';

const setup = async () => {
  // Create instance of listener
  const listener = new EmailAuthorizedListener(natsClient.client);
  // Create fake data for event
  const data: EmailAuthorizedEvent['data'] = {
    version: 0,
    id: new mongoose.Types.ObjectId().toHexString(),
    email: 'admin@moversapp.co',
    client: 'Claro',
    office: 'Sede Principal',
    active: true,
  };
  // Create a fake message event
  // @ts-ignore
  const message: Message = {
    ack: jest.fn(),
  };

  return { listener, data, message };
};

it('creates and save a email', async () => {
  const { listener, data, message } = await setup();
  // Call the on message method with fake data and event
  await listener.onMessage(data, message);
  // Make assertions
  const email = await Email.findById(data.id);
  expect(email).toBeDefined();
  expect(email!.email).toEqual(data.email);
});
it('ack the message', async () => {
  const { listener, data, message } = await setup();
  // Call the on message method with fake data and event
  await listener.onMessage(data, message);
  // Make assertions
  expect(message.ack).toHaveBeenCalled();
});
