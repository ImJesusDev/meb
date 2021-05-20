import request from 'supertest';
import { app } from '../../app';
import { Client } from '../../models/client';

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

it('returns an error with invalid params', async () => {
  await request(app)
    .post('/api/clients')
    .set('Cookie', global.signin())
    .send({
      name: '',
      nit: 'NITCLIENTE',
      logo: 'https://img.com/logo.png',
    })
    .expect(400);
  await request(app)
    .post('/api/clients')
    .set('Cookie', global.signin())
    .send({
      name: 'Banco de Bogota',
      nit: '',
      logo: 'https://img.com/logo.png',
    })
    .expect(400);
  await request(app)
    .post('/api/clients')
    .set('Cookie', global.signin())
    .send({
      name: 'Banco de Bogota',
      nit: 'NITCLIENTE',
      logo: '',
    })
    .expect(400);
});
it('creates a client with valid params', async () => {
  let clients = await Client.find({});
  expect(clients.length).toEqual(0);
  const name = 'Banco de Bogota';
  const nit = 'NITCLIENTE';
  const logo = 'https://img.com/logo.png';
  await request(app)
    .post('/api/clients')
    .set('Cookie', global.signin())
    .send({
      name,
      nit,
      logo,
    })
    .expect(201);
  clients = await Client.find({});
  expect(clients.length).toEqual(1);
  expect(clients[0].name).toEqual(name);
  expect(clients[0].nit).toEqual(nit);
  expect(clients[0].logo).toEqual(logo);
});
