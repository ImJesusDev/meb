import request from 'supertest';
import { app } from '../../app';
import { User } from '../../models/user';
import { natsClient } from '../../nats';
it('has a POST route handler for /api/users/load-users', async () => {
  const response = await request(app).post('/api/users/load-users').send({});
  expect(response.status).not.toEqual(404);
});

it('can only be accessed by signed in users', async () => {
  const response = await request(app)
    .post('/api/users/load-users')
    .send({})
    .expect(401);
});

it('returns a status other than 401 if the user is signed in', async () => {
  const cookie = await global.signin();
  const response = await request(app)
    .post('/api/users/load-users')
    .set('Cookie', cookie)
    .send({});
  expect(response.status).not.toEqual(401);
});

it('returns an error if the users params is not sent', async () => {
  const cookie = await global.signin();
  const response = await request(app)
    .post('/api/users/load-users')
    .set('Cookie', cookie)
    .send({
      role: 'user',
    });
  expect(response.status).toEqual(400);
});

it('returns an error if the users params is not and array', async () => {
  const cookie = await global.signin();
  const response = await request(app)
    .post('/api/users/load-users')
    .set('Cookie', cookie)
    .send({
      role: 'user',
      users: 'Not an array',
    });
  expect(response.status).toEqual(400);
});

it('returns an error if the role param is not sent', async () => {
  const cookie = await global.signin();
  const response = await request(app)
    .post('/api/users/load-users')
    .set('Cookie', cookie)
    .send({
      users: [
        {
          email: 'testuser@test.com',
          password: 'password',
          firstName: 'Regular',
          lastName: 'User',
          city: 'Bogota',
          country: 'Colombia',
          mainTransportationMethod: 'Carro',
          secondaryTransportationMethod: 'Moto',
          termsDate: true,
          comodatoDate: true,
        },
      ],
    });
  expect(response.status).toEqual(400);
});

it('returns an error if the users array does not contains firstName', async () => {
  const cookie = await global.signin();
  const response = await request(app)
    .post('/api/users/load-users')
    .set('Cookie', cookie)
    .send({
      role: 'user',
      users: [
        {
          email: 'testuser@test.com',
          password: 'password',
          firstName: '',
          lastName: 'User',
          city: 'Bogota',
          country: 'Colombia',
          mainTransportationMethod: 'Carro',
          secondaryTransportationMethod: 'Moto',
          termsDate: true,
          comodatoDate: true,
        },
      ],
    });
  expect(response.status).toEqual(400);
});

it('returns an error if the users array does not contains lastName', async () => {
  const cookie = await global.signin();
  const response = await request(app)
    .post('/api/users/load-users')
    .set('Cookie', cookie)
    .send({
      role: 'user',
      users: [
        {
          email: 'testuser@test.com',
          password: 'password',
          firstName: 'Regular',
          lastName: '',
          city: 'Bogota',
          country: 'Colombia',
          mainTransportationMethod: 'Carro',
          secondaryTransportationMethod: 'Moto',
          termsDate: true,
          comodatoDate: true,
        },
      ],
    });
  expect(response.status).toEqual(400);
});

it('returns an error if the users array does not contains city', async () => {
  const cookie = await global.signin();
  const response = await request(app)
    .post('/api/users/load-users')
    .set('Cookie', cookie)
    .send({
      role: 'user',
      users: [
        {
          email: 'testuser@test.com',
          password: 'password',
          firstName: 'Regular',
          lastName: 'User',
          city: '',
          country: 'Colombia',
          mainTransportationMethod: 'Carro',
          secondaryTransportationMethod: 'Moto',
          termsDate: true,
          comodatoDate: true,
        },
      ],
    });
  expect(response.status).toEqual(400);
});

it('returns an error if the users array does not contains country', async () => {
  const cookie = await global.signin();
  const response = await request(app)
    .post('/api/users/load-users')
    .set('Cookie', cookie)
    .send({
      role: 'user',
      users: [
        {
          email: 'testuser@test.com',
          password: 'password',
          firstName: 'Regular',
          lastName: 'User',
          city: 'Bogota',
          country: '',
          mainTransportationMethod: 'Carro',
          secondaryTransportationMethod: 'Moto',
          termsDate: true,
          comodatoDate: true,
        },
      ],
    });
  expect(response.status).toEqual(400);
});

it('returns an error if the users array does not contains email', async () => {
  const cookie = await global.signin();
  const response = await request(app)
    .post('/api/users/load-users')
    .set('Cookie', cookie)
    .send({
      role: 'user',
      users: [
        {
          email: '',
          password: 'password',
          firstName: 'Regular',
          lastName: 'User',
          city: 'Bogota',
          country: 'Colombia',
          mainTransportationMethod: 'Carro',
          secondaryTransportationMethod: 'Moto',
          termsDate: true,
          comodatoDate: true,
        },
      ],
    });
  expect(response.status).toEqual(400);
});

it('returns an error if the users array contains invalid email', async () => {
  const cookie = await global.signin();
  const response = await request(app)
    .post('/api/users/load-users')
    .set('Cookie', cookie)
    .send({
      role: 'user',
      users: [
        {
          email: 'invalid mail',
          password: 'password',
          firstName: 'Regular',
          lastName: 'User',
          city: 'Bogota',
          country: 'Colombia',
          mainTransportationMethod: 'Carro',
          secondaryTransportationMethod: 'Moto',
          termsDate: true,
          comodatoDate: true,
        },
      ],
    });
  expect(response.status).toEqual(400);
});

it('returns an error if the users array does not contains a valid password', async () => {
  const cookie = await global.signin();
  const response = await request(app)
    .post('/api/users/load-users')
    .set('Cookie', cookie)
    .send({
      role: 'user',
      users: [
        {
          email: 'testuser@test.com',
          password: '',
          firstName: 'Regular',
          lastName: 'User',
          city: 'Bogota',
          country: 'Colombia',
          mainTransportationMethod: 'Carro',
          secondaryTransportationMethod: 'Moto',
          termsDate: true,
          comodatoDate: true,
        },
      ],
    });
  expect(response.status).toEqual(400);
});

it('returns an error if the users array does not contains mainTransportationMethod', async () => {
  const cookie = await global.signin();
  const response = await request(app)
    .post('/api/users/load-users')
    .set('Cookie', cookie)
    .send({
      role: 'user',
      users: [
        {
          email: 'testuser@test.com',
          password: '123456',
          firstName: 'Regular',
          lastName: 'User',
          city: 'Bogota',
          country: 'Colombia',
          mainTransportationMethod: '',
          secondaryTransportationMethod: 'Moto',
          termsDate: true,
          comodatoDate: true,
        },
      ],
    });
  expect(response.status).toEqual(400);
});

it('returns an error if the users array does not contains secondaryTransportationMethod', async () => {
  const cookie = await global.signin();
  const response = await request(app)
    .post('/api/users/load-users')
    .set('Cookie', cookie)
    .send({
      role: 'user',
      users: [
        {
          email: 'testuser@test.com',
          password: '123456',
          firstName: 'Regular',
          lastName: 'User',
          city: 'Bogota',
          country: 'Colombia',
          mainTransportationMethod: 'Carro',
          secondaryTransportationMethod: '',
          termsDate: true,
          comodatoDate: true,
        },
      ],
    });
  expect(response.status).toEqual(400);
});

it('creates users and publishes events when given valid params', async () => {
  let users = await User.find({});
  expect(users.length).toEqual(0);
  const cookie = await global.signin();
  const response = await request(app)
    .post('/api/users/load-users')
    .set('Cookie', cookie)
    .send({
      role: 'user',
      users: [
        {
          email: 'testuser@test.com',
          password: '123456',
          firstName: 'Regular',
          lastName: 'User',
          city: 'Bogota',
          country: 'Colombia',
          mainTransportationMethod: 'Carro',
          secondaryTransportationMethod: 'Moto',
          termsDate: true,
          comodatoDate: true,
        },
      ],
    });
  expect(response.status).toEqual(201);
  users = await User.find({});
  // Equals 2: 1 created from global.signin method, other created from test api call
  expect(users.length).toEqual(2);
  expect(natsClient.client.publish).toHaveBeenCalled();
});
