import request from 'supertest';
import { app } from '../../app';
import mongoose from 'mongoose';
import { User } from '../../models/user';

const getUser = async () => {
  const user = User.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    firstName: 'Jesus',
    lastName: 'Diaz',
    email: 'test@mail.com',
  });
  await user.save();
  return user;
};

it('returns 404 if client is not found', async () => {
  const id = new mongoose.Types.ObjectId().toHexString();
  await request(app).get(`/api/clients/${id}`).send().expect(404);
});

it('deletes the client', async () => {
  const name = 'Banco de Bogota';
  const nit = 'NITCLIENTE';
  const logo = 'https://img.com/logo.png';
  const mebAdmin = await getUser();
  const response = await request(app)
    .post('/api/clients')
    .set('Cookie', global.signin())
    .send({
      name,
      nit,
      logo,
      mebAdmin: mebAdmin.id,
      superAdminClient: mebAdmin.id,
    })
    .expect(201);
  await request(app)
    .delete(`/api/clients/${response.body.id}`)
    .send({})
    .expect(204);
  const clientResponse = await request(app).get('/api/clients').send({});
  expect(clientResponse.body.length).toEqual(0);
});
