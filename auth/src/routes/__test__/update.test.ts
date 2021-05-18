import request from 'supertest';
import { app } from '../../app';
import { User } from '../../models/user';

it('returns 401 if the user is not signed in', async (done) => {
  const response = await request(app).put(`/api/users`).send({
    firstName: 'Regular',
    lastName: 'User',
    password: '12345',
    city: 'Bogota',
    country: 'Colombia',
  });
  expect(response.status).toEqual(401);
  return done();
});

it('returns error with invalid first name ', async (done) => {
  const cookie = await global.signin();
  const response = await request(app)
    .put(`/api/users`)
    .set('Cookie', cookie)
    .send({
      firstName: '',
      lastName: 'User',
      password: '12345',
      city: 'Bogota',
      country: 'Colombia',
    });
  expect(response.status).toEqual(400);
  return done();
});
it('returns error with invalid last name ', async (done) => {
  const cookie = await global.signin();
  const response = await request(app)
    .put(`/api/users`)
    .set('Cookie', cookie)
    .send({
      firstName: 'Regular',
      lastName: '',
      password: '12345',
      city: 'Bogota',
      country: 'Colombia',
    });
  expect(response.status).toEqual(400);
  return done();
});
it('returns error with invalid password ', async (done) => {
  const cookie = await global.signin();
  let response = await request(app)
    .put(`/api/users`)
    .set('Cookie', cookie)
    .send({
      firstName: 'Regular',
      lastName: 'User',
      password: '123',
      city: 'Bogota',
      country: 'Colombia',
    });
  expect(response.status).toEqual(400);

  response = await request(app).put(`/api/users`).set('Cookie', cookie).send({
    firstName: 'Regular',
    lastName: 'User',
    password: 'the_limit_for_the_password_is_20_characters',
    city: 'Bogota',
    country: 'Colombia',
  });
  expect(response.status).toEqual(400);
  return done();
});

it('returns error with invalid city ', async (done) => {
  const cookie = await global.signin();
  const response = await request(app)
    .put(`/api/users`)
    .set('Cookie', cookie)
    .send({
      firstName: 'Regular',
      lastName: 'User',
      password: '12345',
      city: '',
      country: 'Colombia',
    });
  expect(response.status).toEqual(400);
  return done();
});

it('updates user when given valid params', async (done) => {
  const cookie = await global.signin();
  const response = await request(app)
    .put(`/api/users`)
    .set('Cookie', cookie)
    .send({
      firstName: 'Updated Regular',
      lastName: 'User',
      password: '12345',
      city: 'Bogota',
      country: 'Colombia',
    });
  expect(response.status).toEqual(200);
  expect(response.body.firstName).toEqual('Updated Regular');
  return done();
});
