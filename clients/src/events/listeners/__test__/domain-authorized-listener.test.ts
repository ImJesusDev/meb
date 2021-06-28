import { Message } from 'node-nats-streaming';
import { DomainAuthorizedEvent } from '@movers/common';
import mongoose from 'mongoose';
import { natsClient } from '../../../nats';
import { Domain } from '../../../models/domain';
import { DomainAuthorizedListener } from '../domain-authorized-listener';

const setup = async () => {
  // Create instance of listener
  const listener = new DomainAuthorizedListener(natsClient.client);
  // Create fake data for event
  const data: DomainAuthorizedEvent['data'] = {
    version: 0,
    id: new mongoose.Types.ObjectId().toHexString(),
    domain: 'moversapp.co',
    client: 'Claro',
    active: true,
  };
  // Create a fake message event
  // @ts-ignore
  const message: Message = {
    ack: jest.fn(),
  };

  return { listener, data, message };
};

it('creates and save a domain', async () => {
  const { listener, data, message } = await setup();
  // Call the on message method with fake data and event
  await listener.onMessage(data, message);
  // Make assertions
  const domain = await Domain.findById(data.id);
  expect(domain).toBeDefined();
  expect(domain!.domain).toEqual(data.domain);
});
it('ack the message', async () => {
  const { listener, data, message } = await setup();
  // Call the on message method with fake data and event
  await listener.onMessage(data, message);
  // Make assertions
  expect(message.ack).toHaveBeenCalled();
});
