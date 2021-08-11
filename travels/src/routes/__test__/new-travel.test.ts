import request from 'supertest';
import { app } from '../../app';

it('has a POST route handler for /api/travels ', async () => {
  const response = await request(app).post('/api/travels').send({});
  expect(response.status).not.toEqual(404);
});
