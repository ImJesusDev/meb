import request from 'supertest';
import { app } from '../../app';
import mongoose from 'mongoose';
import { User } from '../../models/user';
import { Domain } from '../../models/domain';
import { Email } from '../../models/email';

beforeAll(async () => {
  // Hack to register domain schema and avoid MissingSchemaError
  const domains = await Domain.find({});
  const emails = await Email.find({});
});

it('it can fetch a list of clients', async () => {
  const id = new mongoose.Types.ObjectId().toHexString();
  const user = User.build({
    id,
    email: 'test@mail.com',
    firstName: 'Jesus',
    lastName: 'Diaz',
  });
  await user.save();
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
      mebAdmin: user.id,
      superAdminClient: user.id,
    })
    .expect(201);

  const response = await request(app).get(`/api/clients`).send().expect(200);
  expect(response.body.length).toEqual(1);
});
