import request from 'supertest';
import { app } from '../../app';
import { User } from '../../models/user';
import { PasswordReset } from '../../models/password-reset';
import { UserRole, UserStatus } from '@movers/common';
import { natsClient } from '../../nats';

it('returns a 404 for a not found user code', async () => {
  await request(app)
    .post('/api/users/password-reset')
    .send({
      email: 'fake@mail.com',
    })
    .expect(404);
});

it('returns a 400 when invalid email is provided', async () => {
  await request(app)
    .post('/api/users/password-reset')
    .send({
      email: 'fake.com',
    })
    .expect(400);
});

it('returns a 400 when empty email is provided', async () => {
  await request(app)
    .post('/api/users/password-reset')
    .send({
      email: '',
    })
    .expect(400);
});

it('publishes and event when a password reset is created', async (done) => {
  let resets = await PasswordReset.find({});
  expect(resets.length).toEqual(0);
  // Create a new user
  const user = User.build({
    email: 'test@mail.com',
    password: '123456',
    firstName: 'firstName',
    lastName: 'lastName',
    activationCode: 123321,
    city: 'Bogota',
    country: 'Colombia',
    role: UserRole.User,
    status: UserStatus.Unverified,
    mainTransportationMethod: 'Carro',
    secondaryTransportationMethod: 'Moto',
  });
  await user.save();
  await request(app)
    .post('/api/users/password-reset')
    .send({
      email: 'test@mail.com',
    })
    .expect(200);

  resets = await PasswordReset.find({});
  expect(resets.length).toEqual(1);
  expect(natsClient.client.publish).toHaveBeenCalled();
  return done();
});
it('generates password reset when valid email is provided', async () => {
  let resets = await PasswordReset.find({});
  expect(resets.length).toEqual(0);
  // Create a new user
  const user = User.build({
    email: 'test@mail.com',
    password: '123456',
    firstName: 'firstName',
    lastName: 'lastName',
    activationCode: 123321,
    city: 'Bogota',
    country: 'Colombia',
    role: UserRole.User,
    status: UserStatus.Unverified,
    mainTransportationMethod: 'Carro',
    secondaryTransportationMethod: 'Moto',
  });
  await user.save();
  await request(app)
    .post('/api/users/password-reset')
    .send({
      email: 'test@mail.com',
    })
    .expect(200);

  resets = await PasswordReset.find({});
  expect(resets.length).toEqual(1);
});
