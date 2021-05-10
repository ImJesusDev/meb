import request from 'supertest';
import { app } from '../../app';
import { User } from '../../models/user';

it('returns 401 if the user is not signed in', async () => {
  await request(app)
    .put(`/api/users`)
    .send({
      firstName: 'Regular',
      lastName: 'User',
      password: '12345',
    })
    .expect(401);
});
it('returns 400 with invalid params', async () => {
  const cookie = await global.signin();
  await request(app)
    .put(`/api/users`)
    .set('Cookie', cookie)
    .send({
      lastName: 'User',
      password: '12345',
    })
    .expect(400);
  await request(app)
    .put(`/api/users`)
    .set('Cookie', cookie)
    .send({
      firstName: 'Regular',
      password: '12345',
    })
    .expect(400);
  await request(app)
    .put(`/api/users`)
    .set('Cookie', cookie)
    .send({
      firstName: 'Regular',
      lastName: 'User',
    })
    .expect(400);
});
it('updates the user with valid params', async () => {
  const cookie = await global.signin();
  await request(app)
    .put(`/api/users`)
    .set('Cookie', cookie)
    .send({
      firstName: 'Updated',
      lastName: 'User',
      password: '12345',
    })
    .expect(200);
  const response = await request(app)
    .get(`/api/users/current-user`)
    .set('Cookie', cookie)
    .send({});
  const user = await User.findById(response.body.currentUser.id);
  expect(user?.firstName).toEqual('Updated');
});
