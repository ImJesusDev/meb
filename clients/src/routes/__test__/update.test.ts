import request from 'supertest';
import { app } from '../../app';
import mongoose from 'mongoose';
it('returns 404 if client is not found', async () => {
  const id = new mongoose.Types.ObjectId().toHexString();
  await request(app)
    .put(`/api/clients/${id}`)
    .set('Cookie', global.signin())
    .send({
      name: 'Nutresa',
      address: 'Calle 80',
      logo: 'https://myimg.com/logo.png',
    })
    .expect(404);
});
it('returns 401 if the user is not signed in', async () => {
  const id = new mongoose.Types.ObjectId().toHexString();
  await request(app)
    .put(`/api/clients/${id}`)
    .send({
      name: 'Nutresa',
      address: 'Calle 80',
      logo: 'https://myimg.com/logo.png',
    })
    .expect(401);
});
it('returns 400 if the user provides invalid params', async () => {
  const name = 'Banco de Bogota';
  const address = 'Calle 100';
  const logo = 'https://img.com/logo.png';
  const response = await request(app)
    .post('/api/clients')
    .set('Cookie', global.signin())
    .send({
      name,
      address,
      logo,
    })
    .expect(201);
  await request(app)
    .put(`/api/clients/${response.body.id}`)
    .set('Cookie', global.signin())
    .send({
      name: '',
      address,
      logo,
    })
    .expect(400);
});
it('updates the ticked with valid params', async () => {
  const name = 'Banco de Bogota';
  const address = 'Calle 100';
  const logo = 'https://img.com/logo.png';
  const response = await request(app)
    .post('/api/clients')
    .set('Cookie', global.signin())
    .send({
      name,
      address,
      logo,
    })
    .expect(201);
  await request(app)
    .put(`/api/clients/${response.body.id}`)
    .set('Cookie', global.signin())
    .send({
      name: 'New name',
      address,
      logo,
    })
    .expect(200);
  const updateResponse = await request(app)
    .get(`/api/clients/${response.body.id}`)
    .send()
    .expect(200);
  expect(updateResponse.body.name).toEqual('New name');
  expect(updateResponse.body.address).toEqual(address);
  expect(updateResponse.body.logo).toEqual(logo);
});
