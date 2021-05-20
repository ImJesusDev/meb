import request from 'supertest';
import { app } from '../../app';

it('it can fetch a list of clients', async () => {
  const name = 'Banco de Bogota';
  const nit = 'NITCLIENTE';
  const logo = 'https://img.com/logo.png';
  await request(app)
    .post('/api/clients')
    .set('Cookie', global.signin())
    .send({
      name,
      nit,
      logo,
    })
    .expect(201);

  const response = await request(app).get(`/api/clients`).send().expect(200);
  expect(response.body.length).toEqual(1);
});
