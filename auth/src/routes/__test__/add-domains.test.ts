import request from 'supertest';
import { app } from '../../app';
import { Domain } from '../../models/domain';

it('has a POST route handler for /api/domains ', async () => {
  const response = await request(app).post('/api/domains').send({});
  expect(response.status).not.toEqual(404);
});

it('can only access by signed in users', async () => {
  const response = await request(app).post('/api/domains').send({}).expect(401);
});

it('returns a status other than 401 if the user is signed in', async () => {
  const cookie = await global.signin();
  const response = await request(app)
    .post('/api/domains')
    .set('Cookie', cookie)
    .send({});

  expect(response.status).not.toEqual(401);
});
it('returns an error with invalid domains', async () => {
  const cookie = await global.signin();
  const response = await request(app)
    .post('/api/domains')
    .set('Cookie', cookie)
    .send({
      domains: '',
    });
  expect(response.status).toEqual(400);
});
it('returns an error with an empty domain', async () => {
  const cookie = await global.signin();
  const response = await request(app)
    .post('/api/domains')
    .set('Cookie', cookie)
    .send({
      domains: [{ domain: '', client: 'Claro' }],
    });
  expect(response.status).toEqual(400);
});
it('returns an error with an invalid domain', async () => {
  const cookie = await global.signin();
  const response = await request(app)
    .post('/api/domains')
    .set('Cookie', cookie)
    .send({
      domains: [{ domain: 'not a domain', client: 'Claro' }],
    });
  expect(response.status).toEqual(400);
});

it('returns an error with an invalid client', async () => {
  const cookie = await global.signin();
  const response = await request(app)
    .post('/api/domains')
    .set('Cookie', cookie)
    .send({
      domains: [{ domain: 'claro.com.co', client: '' }],
    });
  expect(response.status).toEqual(400);
});
it('creates a domain when given valid params', async () => {
  let domains = await Domain.find({});
  expect(domains.length).toEqual(0);
  const cookie = await global.signin();
  const response = await request(app)
    .post('/api/domains')
    .set('Cookie', cookie)
    .send({
      domains: [{ domain: 'claro.com.co', client: 'Claro' }],
    });
  expect(response.status).toEqual(201);
  expect(response.body[0].active).toBeTruthy();
  domains = await Domain.find({});
  expect(domains.length).toEqual(1);
});
