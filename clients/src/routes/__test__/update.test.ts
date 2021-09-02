import request from 'supertest';
import { app } from '../../app';
import mongoose from 'mongoose';
import { User } from '../../models/user';

const getUser = async () => {
  const user = User.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    firstName: 'Jesus',
    lastName: 'Diaz',
    email: 'test@mail.com',
  });
  await user.save();
  return user;
};

it('returns 404 if client is not found', async () => {
  const mebAdmin = await getUser();
  const id = new mongoose.Types.ObjectId().toHexString();
  await request(app)
    .put(`/api/clients/${id}`)
    .set('Cookie', global.signin())
    .send({
      name: 'Nutresa',
      nit: 'NITCLIENTE',
      logo: 'https://myimg.com/logo.png',
      mebAdmin: mebAdmin.id,
      superAdminClient: mebAdmin.id,
    })
    .expect(404);
});
it('returns 401 if the user is not signed in', async () => {
  const id = new mongoose.Types.ObjectId().toHexString();
  const mebAdmin = await getUser();
  await request(app)
    .put(`/api/clients/${id}`)
    .send({
      name: 'Nutresa',
      nit: 'NITCLIENTE',
      logo: 'https://myimg.com/logo.png',
      mebAdmin: mebAdmin.id,
      superAdminClient: mebAdmin.id,
    })
    .expect(401);
});

it('returns 400 if the user provides invalid name', async () => {
  const mebAdmin = await getUser();
  const name = 'Banco de Bogota';
  const nit = 'Calle 100';
  const logo = 'https://img.com/logo.png';
  const response = await request(app)
    .post('/api/clients')
    .set('Cookie', global.signin())
    .send({
      name,
      nit,
      logo,
      mebAdmin: mebAdmin.id,
      superAdminClient: mebAdmin.id,
    })
    .expect(201);
  await request(app)
    .put(`/api/clients/${response.body.id}`)
    .set('Cookie', global.signin())
    .send({
      name: '',
      nit,
      logo,
      mebAdmin: mebAdmin.id,
      superAdminClient: mebAdmin.id,
    })
    .expect(400);
});

it('returns 400 if the user provides invalid nit', async () => {
  const mebAdmin = await getUser();
  const name = 'Banco de Bogota';
  const nit = 'Calle 100';
  const logo = 'https://img.com/logo.png';
  const response = await request(app)
    .post('/api/clients')
    .set('Cookie', global.signin())
    .send({
      name,
      nit,
      logo,
      mebAdmin: mebAdmin.id,
      superAdminClient: mebAdmin.id,
    })
    .expect(201);
  await request(app)
    .put(`/api/clients/${response.body.id}`)
    .set('Cookie', global.signin())
    .send({
      name,
      nit: '',
      logo,
      mebAdmin: mebAdmin.id,
      superAdminClient: mebAdmin.id,
    })
    .expect(400);
});
it('returns 400 if the user provides invalid logo', async () => {
  const mebAdmin = await getUser();
  const name = 'Banco de Bogota';
  const nit = 'Calle 100';
  const logo = 'https://img.com/logo.png';
  const response = await request(app)
    .post('/api/clients')
    .set('Cookie', global.signin())
    .send({
      name,
      nit,
      logo,
      mebAdmin: mebAdmin.id,
      superAdminClient: mebAdmin.id,
    })
    .expect(201);
  await request(app)
    .put(`/api/clients/${response.body.id}`)
    .set('Cookie', global.signin())
    .send({
      name,
      nit,
      logo: '',
      mebAdmin: mebAdmin.id,
      superAdminClient: mebAdmin.id,
    })
    .expect(400);
});

it('updates the client with valid params', async () => {
  const mebAdmin = await getUser();
  const name = 'Banco de Bogota';
  const nit = 'Calle 100';
  const logo = 'https://img.com/logo.png';
  const response = await request(app)
    .post('/api/clients')
    .set('Cookie', global.signin())
    .send({
      name,
      nit,
      logo,
      mebAdmin: mebAdmin.id,
      superAdminClient: mebAdmin.id,
    })
    .expect(201);
  await request(app)
    .put(`/api/clients/${response.body.id}`)
    .set('Cookie', global.signin())
    .send({
      name: 'New name',
      nit,
      logo,
      mebAdmin: mebAdmin.id,
      superAdminClient: mebAdmin.id,
    })
    .expect(200);
  const updateResponse = await request(app)
    .get(`/api/clients/${response.body.id}`)
    .send()
    .expect(200);
  expect(updateResponse.body.name).toEqual('New name');
  expect(updateResponse.body.nit).toEqual(nit);
  expect(updateResponse.body.logo).toEqual(logo);
  expect(updateResponse.body.meb_admin.id).toEqual(mebAdmin.id);
  expect(updateResponse.body.super_admin_client.id).toEqual(mebAdmin.id);
});
