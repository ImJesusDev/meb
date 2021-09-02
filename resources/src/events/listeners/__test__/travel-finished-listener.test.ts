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
import { ResourceType } from '../../../models/resource-type';
import { Component } from '../../../models/component';
import { Maintenance } from '../../../models/maintenance';
import { Office } from '../../../models/office';

const setup = async () => {
  await Component.find({});
  const resourceType = ResourceType.build({
    resourceTypeBrand: 'Marca',
    resourceTypeModel: 'Modelo',
    checkupTime: 20,
    kmToMaintenance: 5,
    photo: 'Photo',
    type: 'Bicicleta',
    measureIndicators: true,
  });
  await resourceType.save();
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
  const office = Office.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    name: 'Bogota',
    client: 'Claro',
    repairAdmin: new mongoose.Types.ObjectId().toHexString(),
    maintenanceAdmin: new mongoose.Types.ObjectId().toHexString(),
    inventoryAdmin: new mongoose.Types.ObjectId().toHexString(),
  });
  await office.save();
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
  let maintenances = await Maintenance.find({});
  expect(maintenances.length).toEqual(1);
});
it('ack the message', async () => {
  const { listener, data, message } = await setup();
  // Call the on message method with fake data and event
  await listener.onMessage(data, message);
  // Make assertions
  expect(message.ack).toHaveBeenCalled();
});
