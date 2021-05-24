import request from 'supertest';
import { app } from '../../app';
import { User } from '../../models/user';
import { PasswordReset } from '../../models/password-reset';
import { UserRole, UserStatus } from '@movers/common';
import { natsClient } from '../../nats';

const getData = async () => {
  const user = User.build({
    email: 'test@mail.com',
    password: '123456',
    firstName: 'firstName',
    lastName: 'lastName',
    activationCode: 123321,
    city: 'Bogota',
    country: 'Colombia',
    role: UserRole.User,
    status: UserStatus.Active,
    mainTransportationMethod: 'Carro',
    secondaryTransportationMethod: 'Moto',
  });
  await user.save();

  const passwordReset = PasswordReset.build({
    code: '123456',
    userId: user.id,
  });
  await passwordReset.save();

  return { passwordReset, user };
};

it('returns a 404 for a not found user email', async () => {
  const { passwordReset } = await getData();
  await request(app)
    .post('/api/users/update-password')
    .send({
      email: 'fake@mail.com',
      activationCode: passwordReset.code,
      password: '654321',
    })
    .expect(404);
});

it('returns a 404 for a not found activation code', async () => {
  const { user, passwordReset } = await getData();
  await request(app)
    .post('/api/users/update-password')
    .send({
      email: user.email,
      activationCode: '010101',
      password: '654321',
    })
    .expect(404);
});

it('returns a 400 when invalid email is provided', async () => {
  await request(app)
    .post('/api/users/update-password')
    .send({
      email: 'fake.com',
      activationCode: '123456',
      password: '654321',
    })
    .expect(400);
});

it('returns a 400 when empty email is provided', async () => {
  await request(app)
    .post('/api/users/update-password')
    .send({
      email: '',
      activationCode: '123456',
      password: '654321',
    })
    .expect(400);
});
it('returns a 400 when empty code is provided', async () => {
  const { user } = await getData();
  await request(app)
    .post('/api/users/update-password')
    .send({
      email: user.email,
      activationCode: '',
      password: '654321',
    })
    .expect(400);
});
it('returns a 400 when empty password is provided', async () => {
  const { user } = await getData();
  await request(app)
    .post('/api/users/update-password')
    .send({
      email: user.email,
      activationCode: '',
      password: '',
    })
    .expect(400);
});

it('it updates the password', async () => {
  const { user, passwordReset } = await getData();
  await request(app)
    .post('/api/users/update-password')
    .send({
      email: user.email,
      activationCode: passwordReset.code,
      password: '654321',
    })
    .expect(200);
  await request(app)
    .post('/api/users/signin')
    .send({
      email: user.email,
      password: '654321',
    })
    .expect(200);
});
