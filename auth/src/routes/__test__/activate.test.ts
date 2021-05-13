import request from 'supertest';
import { app } from '../../app';
import { User } from '../../models/user';
import { UserRole, UserStatus } from '@movers/common';

it('returns a 404 for a not found user code', async () => {
  await request(app)
    .post('/api/users/activate')
    .send({
      email: 'fake@mail.com',
      activationCode: 123456,
    })
    .expect(404);
});
it('returns a 400 when no email is provided', async () => {
  await request(app)
    .post('/api/users/activate')
    .send({
      activationCode: 123456,
    })
    .expect(400);
});
it('returns a 400 when no activation is provided', async () => {
  await request(app)
    .post('/api/users/activate')
    .send({
      email: 'fake@mail.com',
    })
    .expect(400);
});
it('activates the user when correct params are provided', async () => {
  // Create a new user
  const user = User.build({
    email: 'test@mail.com',
    password: '123456',
    firstName: 'firstName',
    lastName: 'lastName',
    activationCode: 123321,
    role: UserRole.User,
    status: UserStatus.Unverified,
  });
  await user.save();
  await request(app)
    .post('/api/users/activate')
    .send({
      email: 'test@mail.com',
      activationCode: 123321,
    })
    .expect(200);

  const updatedUser = await User.findOne({ email: 'test@mail.com' });
  expect(updatedUser?.status).toEqual(UserStatus.Active);
});
