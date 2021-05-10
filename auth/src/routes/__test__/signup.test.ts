import request from 'supertest';
import { app } from '../../app';
import { natsClient } from '../../nats';

it('returns a 201 on successful signup', async () => {
  return request(app)
    .post('/api/users/signup')
    .send({
      email: 'test@test.com',
      password: 'password',
    })
    .expect(201);
});
it('publishes and event when a new user is created', async () => {
  await request(app)
    .post('/api/users/signup')
    .send({
      email: 'test@test.com',
      password: 'password',
    })
    .expect(201);

  expect(natsClient.client.publish).toHaveBeenCalled();
});

it('returns a 400 with an invalid email', async () => {
  return request(app)
    .post('/api/users/signup')
    .send({
      email: 'test.com',
      password: 'password',
    })
    .expect(400);
});
it('returns a 400 with an invalid password', async () => {
  return request(app)
    .post('/api/users/signup')
    .send({
      email: 'test@test.com',
      password: '',
    })
    .expect(400);
});
it('returns a 400 with an missing email and password', async () => {
  await request(app)
    .post('/api/users/signup')
    .send({
      email: 'test@mail.com',
    })
    .expect(400);
  return request(app)
    .post('/api/users/signup')
    .send({
      password: '123456',
    })
    .expect(400);
});
it('disallows duplicate email', async () => {
  await request(app)
    .post('/api/users/signup')
    .send({
      email: 'test@test.com',
      password: 'password',
    })
    .expect(201);

  return request(app)
    .post('/api/users/signup')
    .send({
      email: 'test@test.com',
      password: 'password',
    })
    .expect(400);
});
it('sets a cookie after successful signup', async () => {
  const response = await request(app)
    .post('/api/users/signup')
    .send({
      email: 'test@test.com',
      password: 'password',
    })
    .expect(201);
  expect(response.get('Set-Cookie')).toBeDefined();
});
