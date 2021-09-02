import request from 'supertest';
import { app } from '../../app';
import { Client } from '../../models/client';
import { User } from '../../models/user';
import mongoose from 'mongoose';

const getUser = async () => {
  const user = User.build({
    id: mongoose.Types.ObjectId().toHexString(),
    firstName: 'Jesus',
    lastName: 'Diaz',
    email: 'test@mail.com',
  });
  await user.save();
  return user;
};

it('has a POST route handler for /api/clients ', async () => {
  const response = await request(app).post('/api/clients').send({});
  expect(response.status).not.toEqual(404);
});

it('can only access by signed in users', async () => {
  const response = await request(app).post('/api/clients').send({}).expect(401);
});

it('returns a status other than 401 if the user is signed in', async () => {
  const response = await request(app)
    .post('/api/clients')
    .set('Cookie', global.signin())
    .send({});
  expect(response.status).not.toEqual(401);
});

it('returns an error with invalid name', async () => {
  const mebAdmin = await getUser();
  await request(app)
    .post('/api/clients')
    .set('Cookie', global.signin())
    .send({
      name: '',
      nit: 'NITCLIENTE',
      logo: 'https://img.com/logo.png',
      mebAdmin: mebAdmin.id,
      superAdminClient: mebAdmin.id,
    })
    .expect(400);
});
it('returns an error with invalid nit', async () => {
  const mebAdmin = await getUser();
  await request(app)
    .post('/api/clients')
    .set('Cookie', global.signin())
    .send({
      name: 'CLARO',
      nit: '',
      logo: 'https://img.com/logo.png',
      mebAdmin: mebAdmin.id,
      superAdminClient: mebAdmin.id,
    })
    .expect(400);
});

it('returns an error with invalid logo', async () => {
  const mebAdmin = await getUser();
  await request(app)
    .post('/api/clients')
    .set('Cookie', global.signin())
    .send({
      name: 'CLARO',
      nit: 'NITCLARO',
      logo: '',
      mebAdmin: mebAdmin.id,
      superAdminClient: mebAdmin.id,
    })
    .expect(400);
});
it('returns an error with invalid meb admin', async () => {
  const mebAdmin = await getUser();
  await request(app)
    .post('/api/clients')
    .set('Cookie', global.signin())
    .send({
      name: 'CLARO',
      nit: 'NITCLARO',
      logo: 'https://img.com/logo.png',
      mebAdmin: '',
      superAdminClient: mebAdmin.id,
    })
    .expect(400);
});
it('returns an error with meb admin that does not exists', async () => {
  const mebAdmin = await getUser();
  await request(app)
    .post('/api/clients')
    .set('Cookie', global.signin())
    .send({
      name: 'CLARO',
      nit: 'NITCLARO',
      logo: 'https://img.com/logo.png',
      mebAdmin: new mongoose.Types.ObjectId().toHexString(),
      superAdminClient: mebAdmin.id,
    })
    .expect(400);
});
it('returns an error with super admin client that does not exists', async () => {
  const mebAdmin = await getUser();
  await request(app)
    .post('/api/clients')
    .set('Cookie', global.signin())
    .send({
      name: 'CLARO',
      nit: 'NITCLARO',
      logo: 'https://img.com/logo.png',
      mebAdmin: mebAdmin.id,
      superAdminClient: new mongoose.Types.ObjectId().toHexString(),
    })
    .expect(400);
});
it('returns an error with invalid super admin client', async () => {
  const mebAdmin = await getUser();
  await request(app)
    .post('/api/clients')
    .set('Cookie', global.signin())
    .send({
      name: 'CLARO',
      nit: 'NITCLARO',
      logo: 'https://img.com/logo.png',
      mebAdmin: mebAdmin.id,
      superAdminClient: '',
    })
    .expect(400);
});

it('creates a client with valid params', async () => {
  let clients = await Client.find({});
  expect(clients.length).toEqual(0);
  const name = 'Banco de Bogota';
  const nit = 'NITCLIENTE';
  const logo = 'https://img.com/logo.png';
  const mebAdmin = await getUser();
  const response = await request(app)
    .post('/api/clients')
    .set('Cookie', global.signin())
    .send({
      name,
      nit,
      logo,
      mebAdmin: mebAdmin.id,
      superAdminClient: mebAdmin.id,
    });
  expect(response.status).toEqual(201);
  clients = await Client.find({});
  expect(clients.length).toEqual(1);
  expect(clients[0].name).toEqual(name);
  expect(clients[0].nit).toEqual(nit);
  expect(clients[0].logo).toEqual(logo);
});
