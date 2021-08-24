import { Message } from 'node-nats-streaming';
import {
  TravelCreatedEvent,
  TravelStatus,
  UserRole,
  UserStatus,
  ResourceStatus,
} from '@movers/common';
import mongoose from 'mongoose';
import { natsClient } from '../../../nats';
import { User } from '../../../models/user';
import { TravelCreatedListener } from '../travel-created-listener';
import { UserPoints, PointsType } from '../../../models/user-points';
import { Resource } from '../../../models/resource';
import { UserRanking } from '../../../models/user-ranking';

const setup = async () => {
  const user = User.build({
    email: 'test@test.com',
    password: 'password',
    firstName: 'Regular',
    lastName: 'User',
    client: 'Claro',
    office: 'Sede Principal',
    mainTransportationMethod: 'Carro',
    secondaryTransportationMethod: 'Moto',
    activationCode: 1234,
    role: UserRole.User,
    status: UserStatus.Unverified,
  });
  await user.save();
  const resource = Resource.build({
    id: new mongoose.Types.ObjectId().toHexString(),
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
  // Create instance of listener
  const listener = new TravelCreatedListener(natsClient.client);
  // Create fake data for event
  const data: TravelCreatedEvent['data'] = {
    version: 0,
    id: new mongoose.Types.ObjectId().toHexString(),
    resourceRef: '0001',
    reservationId: new mongoose.Types.ObjectId().toHexString(),
    userId: user.id,
    status: TravelStatus.Pending,
  };
  // Create a fake message event
  // @ts-ignore
  const message: Message = {
    ack: jest.fn(),
  };

  return { listener, data, message };
};

it('updated the points', async () => {
  const { listener, data, message } = await setup();
  // Call the on message method with fake data and event
  await listener.onMessage(data, message);
  // Make assertions
  const user = await User.findById(data.userId);
  const userPoints = await UserPoints.findOne({
    userId: data.userId,
    reservationId: data.reservationId,
    type: PointsType.ResourceRent,
  });
  const userRaking = await UserRanking.findOne({
    userId: data.userId,
  });
  expect(user).toBeDefined();
  expect(userRaking).toBeDefined();
  expect(userPoints).toBeDefined();
  expect(user!.points).toEqual(50);
  expect(userRaking!.points).toEqual(50);
});
it('ack the message', async () => {
  const { listener, data, message } = await setup();
  // Call the on message method with fake data and event
  await listener.onMessage(data, message);
  // Make assertions
  expect(message.ack).toHaveBeenCalled();
});
