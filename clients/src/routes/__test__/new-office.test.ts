import request from 'supertest';
import { app } from '../../app';
import mongoose from 'mongoose';
import { Client } from '../../models/client';
import { User } from '../../models/user';
import { Office } from '../../models/office';

const getData = async () => {
  const user = User.build({
    id: mongoose.Types.ObjectId().toHexString(),
    firstName: 'Jesus',
    lastName: 'Diaz',
    email: 'test@mail.com',
  });
  await user.save();

  const client = Client.build({
    name: 'Claro',
    nit: 'Claro NIT',
    logo: 'https://logo.com/logo.png',
    mebAdmin: user.id,
    superAdminClient: user.id,
  });

  await client.save();
  return { user, client };
};
it('has a POST route handler for /api/clients/:id/offices ', async () => {
  const id = mongoose.Types.ObjectId().toHexString();
  const response = await request(app)
    .post(`/api/clients/${id}/offices`)
    .send({});
  expect(response.status).not.toEqual(404);
});

it('can only access by signed in users', async () => {
  const id = mongoose.Types.ObjectId().toHexString();
  const response = await request(app)
    .post(`/api/clients/${id}/offices`)
    .send({})
    .expect(401);
});

it('returns a status other than 401 if the user is signed in', async () => {
  const id = mongoose.Types.ObjectId().toHexString();
  const response = await request(app)
    .post(`/api/clients/${id}/offices`)
    .set('Cookie', global.signin())
    .send({});
  expect(response.status).not.toEqual(401);
});

it('returns an error with invalid client', async () => {
  const { user } = await getData();
  const id = mongoose.Types.ObjectId().toHexString();
  await request(app)
    .post(`/api/clients/${id}/offices`)
    .set('Cookie', global.signin())
    .send({
      name: 'Sede Principal',
      country: 'Colombia',
      city: 'Bogota',
      mebAdmin: user.id,
      clientAdmin: user.id,
      location: {
        lat: 1,
        lng: 2,
      },
    })
    .expect(400);
});

it('returns an error with invalid name', async () => {
  const { user, client } = await getData();
  await request(app)
    .post(`/api/clients/${client.id}/offices`)
    .set('Cookie', global.signin())
    .send({
      name: '',
      country: 'Colombia',
      city: 'Bogota',
      mebAdmin: user.id,
      clientAdmin: user.id,
      location: {
        lat: 1,
        lng: 2,
      },
    })
    .expect(400);
});
it('returns an error with invalid country', async () => {
  const { user, client } = await getData();
  await request(app)
    .post(`/api/clients/${client.id}/offices`)
    .set('Cookie', global.signin())
    .send({
      name: 'Sede Principal',
      country: '',
      city: 'Bogota',
      mebAdmin: user.id,
      clientAdmin: user.id,
      location: {
        lat: 1,
        lng: 2,
      },
    })
    .expect(400);
});
it('returns an error with invalid city', async () => {
  const { user, client } = await getData();
  await request(app)
    .post(`/api/clients/${client.id}/offices`)
    .set('Cookie', global.signin())
    .send({
      name: 'Sede Principal',
      country: 'Colombia',
      city: '',
      mebAdmin: user.id,
      clientAdmin: user.id,
      location: {
        lat: 1,
        lng: 2,
      },
    })
    .expect(400);
});

it('returns an error with invalid meb admin', async () => {
  const id = mongoose.Types.ObjectId().toHexString();
  const { user, client } = await getData();
  await request(app)
    .post(`/api/clients/${client.id}/offices`)
    .set('Cookie', global.signin())
    .send({
      name: 'Sede Principal',
      country: 'Colombia',
      city: 'Bogota',
      mebAdmin: id,
      clientAdmin: user.id,
      location: {
        lat: 1,
        lng: 2,
      },
    })
    .expect(400);
});

it('returns an error with invalid client admin', async () => {
  const id = mongoose.Types.ObjectId().toHexString();
  const { user, client } = await getData();
  await request(app)
    .post(`/api/clients/${client.id}/offices`)
    .set('Cookie', global.signin())
    .send({
      name: 'Sede Principal',
      country: 'Colombia',
      city: 'Bogota',
      mebAdmin: user.id,
      clientAdmin: id,
      location: {
        lat: 1,
        lng: 2,
      },
    })
    .expect(400);
});

it('returns an error with invalid location', async () => {
  const { user, client } = await getData();
  await request(app)
    .post(`/api/clients/${client.id}/offices`)
    .set('Cookie', global.signin())
    .send({
      name: 'Sede Principal',
      country: 'Colombia',
      city: 'Bogota',
      mebAdmin: user.id,
      clientAdmin: user.id,
      location: {},
    })
    .expect(400);
});

it('returns an error with invalid latitude', async () => {
  const { user, client } = await getData();
  await request(app)
    .post(`/api/clients/${client.id}/offices`)
    .set('Cookie', global.signin())
    .send({
      name: 'Sede Principal',
      country: 'Colombia',
      city: 'Bogota',
      mebAdmin: user.id,
      clientAdmin: user.id,
      location: {
        lat: 'invalid',
        lng: 2,
      },
    })
    .expect(400);
});

it('returns an error with invalid longitude', async () => {
  const { user, client } = await getData();
  await request(app)
    .post(`/api/clients/${client.id}/offices`)
    .set('Cookie', global.signin())
    .send({
      name: 'Sede Principal',
      country: 'Colombia',
      city: 'Bogota',
      mebAdmin: user.id,
      clientAdmin: user.id,
      location: {
        lat: 1,
        lng: 'invalid',
      },
    })
    .expect(400);
});

it('returns 201 with valid params', async () => {
  const { user, client } = await getData();
  await request(app)
    .post(`/api/clients/${client.id}/offices`)
    .set('Cookie', global.signin())
    .send({
      name: 'Sede Principal',
      country: 'Colombia',
      city: 'Bogota',
      mebAdmin: user.id,
      clientAdmin: user.id,
      location: {
        lat: 1,
        lng: 2,
      },
    })
    .expect(201);
});

it('creates the office with valid params', async () => {
  const { user, client } = await getData();
  let offices = await Office.find({});
  expect(offices.length).toEqual(0);
  await request(app)
    .post(`/api/clients/${client.id}/offices`)
    .set('Cookie', global.signin())
    .send({
      name: 'Sede Principal',
      country: 'Colombia',
      city: 'Bogota',
      mebAdmin: user.id,
      clientAdmin: user.id,
      location: {
        lat: 1,
        lng: 2,
      },
    })
    .expect(201);

  offices = await Office.find({});
  expect(offices.length).toEqual(1);
});
