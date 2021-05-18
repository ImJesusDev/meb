import request from 'supertest';
import { app } from '../../app';
import { Country } from '../../models/country';

it('has a POST route handler for /api/locations/countries', async () => {
  const response = await request(app).post('/api/locations/countries').send({});
  expect(response.status).not.toEqual(404);
});

it('can only access by signed in users', async () => {
  const response = await request(app)
    .post('/api/locations/countries')
    .send({})
    .expect(401);
});

it('returns a status other than 401 if the user is signed in', async () => {
  const response = await request(app)
    .post('/api/locations/countries')
    .set('Cookie', global.signin())
    .send({});
  expect(response.status).not.toEqual(401);
});
it('returns an error with invalid params', async () => {
  await request(app)
    .post('/api/locations/countries')
    .set('Cookie', global.signin())
    .send({
      name: '',
    })
    .expect(400);
});
it('creates a country with valid params', async () => {
  let countries = await Country.find({});
  expect(countries.length).toEqual(0);
  await request(app)
    .post('/api/locations/countries')
    .set('Cookie', global.signin())
    .send({
      name: 'Colombia',
    })
    .expect(201);

  countries = await Country.find({});
  expect(countries.length).toEqual(1);
  expect(countries[0].name).toEqual('Colombia');
});
it('disallows repeated countries', async () => {
  let countries = await Country.find({});
  expect(countries.length).toEqual(0);
  await request(app)
    .post('/api/locations/countries')
    .set('Cookie', global.signin())
    .send({
      name: 'Colombia',
    })
    .expect(201);
  countries = await Country.find({});
  expect(countries.length).toEqual(1);
  expect(countries[0].name).toEqual('Colombia');

  await request(app)
    .post('/api/locations/countries')
    .set('Cookie', global.signin())
    .send({
      name: 'Colombia',
    })
    .expect(400);

  countries = await Country.find({});
  expect(countries.length).toEqual(1);
});
