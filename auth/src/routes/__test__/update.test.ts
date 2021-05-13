import request from 'supertest';
import { app } from '../../app';
import { User } from '../../models/user';

it('returns 401 if the user is not signed in', async () => {
  return await request(app)
    .put(`/api/users`)
    .send({
      firstName: 'Regular',
      lastName: 'User',
      password: '12345',
    })
    .expect(401);
});
