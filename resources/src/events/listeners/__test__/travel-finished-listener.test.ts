import { Message } from 'node-nats-streaming';
import {
  TravelFinishedEvent,
  TravelStatus,
  UserRole,
  UserStatus,
  ResourceStatus,
} from '@movers/common';
import mongoose from 'mongoose';
import { natsClient } from '../../../nats';
import { TravelFinishedListener } from '../travel-finished-listener';
import { Resource } from '../../../models/resource';
import { Travel } from '../../../models/travel';

const setup = async () => {
  const resource = Resource.build({
    type: 'Bicicleta',
    reference: '0001',
    qrCode: 'qrCode',
    lockerPassword: 12345,
    client: 'Claro',
    office: 'Bogota',
    loanTime: 20,
    status: ResourceStatus.Available,
  });
  await resource.save();
  const travel = Travel.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    origin: 'Calle 80',
    destination: 'Calle 100',
    resourceRef: resource.id,
    reservationId: new mongoose.Types.ObjectId().toHexString(),
    status: TravelStatus.Completed,
    userId: new mongoose.Types.ObjectId().toHexString(),
  });
  await travel.save();
  // Create instance of listener
  const listener = new TravelFinishedListener(natsClient.client);
  // Create fake data for event
  const data: TravelFinishedEvent['data'] = {
    version: 1,
    id: travel.id,
    resourceRef: '0001',
    reservationId: new mongoose.Types.ObjectId().toHexString(),
    userId: new mongoose.Types.ObjectId().toHexString(),
    status: TravelStatus.Pending,
    origin: 'Calle 80',
    destination: 'Calle 100',
    indicators: {
      calories: 20,
      economicFootprint: 30,
      energyFootprint: 20,
      environmentalFootprint: 50,
      km: 10,
    },
  };
  // Create a fake message event
  // @ts-ignore
  const message: Message = {
    ack: jest.fn(),
  };

  return { listener, data, message };
};

it('updated the travel', async () => {
  const { listener, data, message } = await setup();

  // Call the on message method with fake data and event
  await listener.onMessage(data, message);
  // Make assertions
  const travel = await Travel.findById(data.id);
  expect(travel).toBeDefined();
  expect(travel!.indicators).toBeDefined();
});
it('ack the message', async () => {
  const { listener, data, message } = await setup();
  // Call the on message method with fake data and event
  await listener.onMessage(data, message);
  // Make assertions
  expect(message.ack).toHaveBeenCalled();
});
