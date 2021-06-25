import request from 'supertest';
import { app } from '../../app';
import { Email } from '../../models/email';

it('has a POST route handler for /api/emails ', async () => {
  const response = await request(app).post('/api/emails').send({});
  expect(response.status).not.toEqual(404);
});

it('can only access by signed in users', async () => {
  const response = await request(app).post('/api/emails').send({}).expect(401);
});

it('returns a status other than 401 if the user is signed in', async () => {
  const cookie = await global.signin();
  const response = await request(app)
    .post('/api/emails')
    .set('Cookie', cookie)
    .send({});

  expect(response.status).not.toEqual(401);
});
it('returns an error with invalid emails', async () => {
  const cookie = await global.signin();
  const response = await request(app)
    .post('/api/emails')
    .set('Cookie', cookie)
    .send({
      emails: '',
    });
  expect(response.status).toEqual(400);
});

it('returns an error with an empty email', async () => {
  const cookie = await global.signin();
  const response = await request(app)
    .post('/api/emails')
    .set('Cookie', cookie)
    .send({
      emails: [{ email: '', client: 'Claro' }],
    });
  expect(response.status).toEqual(400);
});

it('returns an error with an invalid email', async () => {
  const cookie = await global.signin();
  const response = await request(app)
    .post('/api/emails')
    .set('Cookie', cookie)
    .send({
      emails: [{ email: 'not a email', client: 'Claro' }],
    });
  expect(response.status).toEqual(400);
});

it('returns an error with an invalid client', async () => {
  const cookie = await global.signin();
  const response = await request(app)
    .post('/api/emails')
    .set('Cookie', cookie)
    .send({
      emails: [{ email: 'jdiaz@mail.com', client: '' }],
    });
  expect(response.status).toEqual(400);
});
it('creates a email when given valid params', async () => {
  let emails = await Email.find({});
  expect(emails.length).toEqual(0);
  const cookie = await global.signin();
  const response = await request(app)
    .post('/api/emails')
    .set('Cookie', cookie)
    .send({
      emails: [{ email: 'jdiaz@mail.com', client: 'Claro' }],
    });
  expect(response.status).toEqual(201);
  expect(response.body[0].active).toBeTruthy();
  emails = await Email.find({});
  expect(emails.length).toEqual(1);
});
