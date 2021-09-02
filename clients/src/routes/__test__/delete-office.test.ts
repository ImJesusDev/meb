import request from 'supertest';
import { app } from '../../app';
import mongoose from 'mongoose';
import { User } from '../../models/user';
import { Client } from '../../models/client';
import { Office } from '../../models/office';

const getData = async () => {
  const user = User.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    firstName: 'Jesus',
    lastName: 'Diaz',
    email: 'test@mail.com',
  });
  await user.save();

  const client = Client.build({
    name: 'Claro',
    nit: 'NIT-Claro',
    logo: 'https://mylogo.com/logo.png',
    mebAdmin: user.id,
    superAdminClient: user.id,
  });
  await client.save();
  return { user, client };
};

it('returns 404 if client is not found', async () => {
  const id = new mongoose.Types.ObjectId().toHexString();
  await request(app)
    .delete(`/api/clients/${id}/offices/${id}`)
    .send()
    .expect(404);
});

it('deletes the office', async () => {
  let offices = await Office.find({});
  expect(offices.length).toEqual(0);
  const { client, user } = await getData();
  const response = await request(app)
    .post(`/api/clients/${client.id}/offices`)
    .set('Cookie', global.signin())
    .send({
      name: 'Sede Principal',
      country: 'Colombia',
      city: 'Bogota',
      mebAdmin: user.id,
      repairAdmin: user.id,
      maintenanceAdmin: user.id,
      inventoryAdmin: user.id,
      clientAdmin: user.id,
      location: {
        lat: 1,
        lng: 2,
      },
    })
    .expect(201);
  offices = await Office.find({});
  expect(offices.length).toEqual(1);
  await request(app)
    .delete(`/api/clients/${client.id}/offices/${response.body.id}`)
    .send({})
    .expect(204);
  offices = await Office.find({});
  expect(offices.length).toEqual(0);
});
