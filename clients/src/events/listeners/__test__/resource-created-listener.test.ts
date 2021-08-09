import { Message } from 'node-nats-streaming';
import { ResourceCreatedEvent, ResourceStatus } from '@movers/common';
import mongoose from 'mongoose';
import { natsClient } from '../../../nats';
import { Resource } from '../../../models/resource';
import { ResourceCreatedListener } from '../resource-created-listener';

const setup = async () => {
  // Create instance of listener
  const listener = new ResourceCreatedListener(natsClient.client);
  // Create fake data for event
  const data: ResourceCreatedEvent['data'] = {
    version: 0,
    id: new mongoose.Types.ObjectId().toHexString(),
    type: 'Bicicleta',
    reference: '0001',
    qrCode: 'qrCode',
    lockerPassword: 12345,
    client: 'Claro',
    office: 'Principal',
    loanTime: 24,
    status: ResourceStatus.Available,
  };
  // Create a fake message event
  // @ts-ignore
  const message: Message = {
    ack: jest.fn(),
  };

  return { listener, data, message };
};

it('creates and save a resource', async () => {
  const { listener, data, message } = await setup();
  // Call the on message method with fake data and event
  await listener.onMessage(data, message);
  // Make assertions
  const resource = await Resource.findById(data.id);
  expect(resource).toBeDefined();
  expect(resource!.reference).toEqual(data.reference);
  expect(resource!.client).toEqual(data.client);
});

it('ack the message', async () => {
  const { listener, data, message } = await setup();
  // Call the on message method with fake data and event
  await listener.onMessage(data, message);
  // Make assertions
  expect(message.ack).toHaveBeenCalled();
});
