import request from 'supertest';
import { app } from '../../app';

it('it can fetch a list of countries', async () => {
  const name = 'Colombia';
  await request(app)
    .post('/api/locations/countries')
    .set('Cookie', global.signin())
    .send({
      name,
    })
    .expect(201);

  const response = await request(app)
    .get(`/api/locations/countries`)
    .send()
    .expect(200);
  expect(response.body.length).toEqual(1);
});
