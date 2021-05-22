import request from 'supertest';
import { app } from '../../app';
import { natsClient } from '../../nats';

it('returns a 201 on successful signup', async (done) => {
  const response = await request(app).post('/api/users/admin/signup').send({
    email: 'test@test.com',
    password: 'password',
    firstName: 'Regular',
    lastName: 'User',
    documentType: 'Cédula de ciudadanía',
    documentNumber: '123456',
    phone: '321000000',
    role: 'admin',
  });
  expect(response.status).toEqual(201);

  return done();
});

it('publishes and event when a new user is created', async (done) => {
  const response = await request(app).post('/api/users/admin/signup').send({
    email: 'test@test.com',
    password: 'password',
    firstName: 'Regular',
    lastName: 'User',
    documentType: 'Cédula de ciudadanía',
    documentNumber: '123456',
    phone: '321000000',
    role: 'admin',
  });
  expect(response.status).toEqual(201);
  expect(natsClient.client.publish).toHaveBeenCalled();

  return done();
});

it('returns a 400 with an invalid email', async (done) => {
  const response = await request(app).post('/api/users/admin/signup').send({
    email: 'test.com',
    password: 'password',
    firstName: 'Regular',
    lastName: 'User',
    documentType: 'Cédula de ciudadanía',
    documentNumber: '123456',
    phone: '321000000',
    role: 'admin',
  });

  expect(response.status).toEqual(400);
  return done();
});
it('returns a 400 with an invalid role', async (done) => {
  const response = await request(app).post('/api/users/admin/signup').send({
    email: 'test@test.com',
    password: 'password',
    firstName: 'Regular',
    lastName: 'User',
    documentType: 'Cédula de ciudadanía',
    documentNumber: '123456',
    phone: '321000000',
    role: '',
  });

  expect(response.status).toEqual(400);
  return done();
});

it('returns a 400 with an invalid password', async (done) => {
  const response = await request(app).post('/api/users/admin/signup').send({
    email: 'test@test.com',
    password: '',
    firstName: 'Regular',
    lastName: 'User',
    documentType: 'Cédula de ciudadanía',
    documentNumber: '123456',
    phone: '321000000',
    role: 'admin',
  });
  expect(response.status).toEqual(400);
  return done();
});

it('returns a 400 with an invalid firstName', async (done) => {
  const response = await request(app).post('/api/users/admin/signup').send({
    email: 'test@test.com',
    password: 'password',
    firstName: '',
    lastName: 'User',
    documentType: 'Cédula de ciudadanía',
    documentNumber: '123456',
    phone: '321000000',
    role: 'admin',
  });
  expect(response.status).toEqual(400);
  return done();
});

it('returns a 400 with an invalid lastName', async (done) => {
  const response = await request(app).post('/api/users/admin/signup').send({
    email: 'test@test.com',
    password: 'password',
    firstName: 'Regular',
    lastName: '',
    documentType: 'Cédula de ciudadanía',
    documentNumber: '123456',
    phone: '321000000',
    role: 'admin',
  });
  expect(response.status).toEqual(400);
  return done();
});

it('disallows duplicate email', async (done) => {
  let response = await request(app).post('/api/users/admin/signup').send({
    email: 'test@test.com',
    password: 'password',
    firstName: 'Regular',
    lastName: 'User',
    documentType: 'Cédula de ciudadanía',
    documentNumber: '123456',
    phone: '321000000',
    role: 'admin',
  });
  expect(response.status).toEqual(201);

  response = await request(app).post('/api/users/admin/signup').send({
    email: 'test@test.com',
    password: 'password',
    firstName: 'Regular',
    lastName: 'User',
    documentType: 'Cédula de ciudadanía',
    documentNumber: '123456',
    phone: '321000000',
    role: 'admin',
  });
  expect(response.status).toEqual(400);

  return done();
});
it('disallows duplicate document number', async (done) => {
  let response = await request(app).post('/api/users/admin/signup').send({
    email: 'test@test.com',
    password: 'password',
    firstName: 'Regular',
    lastName: 'User',
    documentType: 'Cédula de ciudadanía',
    documentNumber: '123456',
    phone: '321000000',
    role: 'admin',
  });
  expect(response.status).toEqual(201);

  response = await request(app).post('/api/users/admin/signup').send({
    email: 'test1@test.com',
    password: 'password',
    firstName: 'Regular',
    lastName: 'User',
    documentType: 'Cédula de ciudadanía',
    documentNumber: '123456',
    phone: '322000000',
    role: 'admin',
  });
  expect(response.status).toEqual(400);

  return done();
});
it('disallows duplicate phone number', async (done) => {
  let response = await request(app).post('/api/users/admin/signup').send({
    email: 'test@test.com',
    password: 'password',
    firstName: 'Regular',
    lastName: 'User',
    documentType: 'Cédula de ciudadanía',
    documentNumber: '123456',
    phone: '321000000',
    role: 'admin',
  });
  expect(response.status).toEqual(201);

  response = await request(app).post('/api/users/admin/signup').send({
    email: 'test1@test.com',
    password: 'password',
    firstName: 'Regular',
    lastName: 'User',
    documentType: 'Cédula de ciudadanía',
    documentNumber: '12345678',
    phone: '321000000',
    role: 'admin',
  });
  expect(response.status).toEqual(400);

  return done();
});
