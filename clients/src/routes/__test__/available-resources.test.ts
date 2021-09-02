import request from 'supertest';
import { app } from '../../app';
import mongoose from 'mongoose';
import { Resource } from '../../models/resource';
import { ResourceStatus } from '@movers/common';

beforeEach(async () => {
  const resource = Resource.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    type: 'Bicicleta',
    reference: '001',
    qrCode: 'qrCode',
    lockerPassword: 12345,
    client: 'Claro',
    office: 'Bogota',
    loanTime: 20,
    status: ResourceStatus.Available,
  });
  await resource.save();
});

it('returns available resources', async () => {
  const response = await request(app)
    .get(`/api/clients/resources/available?client=Claro&office=Bogota`)
    .expect(200);
  expect(response.body.length).toEqual(1);
});
