import request from 'supertest';
import { app } from '../../app';

it('fails with an email that does not exists', async () => {
  await request(app)
    .post('/api/users/signin')
    .send({
      email: 'fail@mail.com',
      password: '1234',
    })
    .expect(400);
});
it('fails with an incorrect password', async () => {
  await request(app)
    .post('/api/users/signup')
    .send({
      email: 'test@test.com',
      password: 'password',
      firstName: 'Regular',
      lastName: 'User',
      client: 'Claro',
      office: 'Sede Principal',
      mainTransportationMethod: 'Carro',
      secondaryTransportationMethod: 'Moto',
      termsDate: true,
      comodatoDate: true,
    })
    .expect(201);

  await request(app)
    .post('/api/users/signin')
    .send({
      email: 'test@test.com',
      password: 'passwordFail',
    })
    .expect(400);
});
it('responds with a cookie when given valid credentials', async () => {
  await request(app)
    .post('/api/users/signup')
    .send({
      email: 'test@test.com',
      password: 'password',
      firstName: 'Regular',
      lastName: 'User',
      client: 'Claro',
      office: 'Sede Principal',
      mainTransportationMethod: 'Carro',
      secondaryTransportationMethod: 'Moto',
      termsDate: true,
      comodatoDate: true,
    })
    .expect(201);

  const response = await request(app).post('/api/users/signin').send({
    email: 'test@test.com',
    password: 'password',
  });
  expect(response.status).toEqual(200);
  expect(response.get('Set-Cookie')).toBeDefined();
});
