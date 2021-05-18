import request from 'supertest';
import { app } from '../../app';
import { City } from '../../models/city';
import { Country } from '../../models/country';

const getCountry = async () => {
  const country = Country.build({
    name: 'Colombia',
    slug: 'colombia',
  });
  await country.save();
  return { country };
};
it('has a POST route handler for /api/locations/cities', async () => {
  const response = await request(app).post('/api/locations/cities').send({});
  expect(response.status).not.toEqual(404);
});

it('can only access by signed in users', async () => {
  const response = await request(app)
    .post('/api/locations/cities')
    .send({})
    .expect(401);
});

it('returns a status other than 401 if the user is signed in', async () => {
  const response = await request(app)
    .post('/api/locations/cities')
    .set('Cookie', global.signin())
    .send({});
  expect(response.status).not.toEqual(401);
});

it('returns an error with invalid params', async () => {
  await request(app)
    .post('/api/locations/cities')
    .set('Cookie', global.signin())
    .send({
      name: '',
    })
    .expect(400);
  await request(app)
    .post('/api/locations/cities')
    .set('Cookie', global.signin())
    .send({
      name: '',
      country: '',
    })
    .expect(400);
  await request(app)
    .post('/api/locations/cities')
    .set('Cookie', global.signin())
    .send({
      name: 'Bogota',
      country: 'DoesNotExists',
    })
    .expect(400);
});
it('creates a city with valid params', async () => {
  const { country } = await getCountry();
  let cities = await City.find({});
  expect(cities.length).toEqual(0);
  await request(app)
    .post('/api/locations/cities')
    .set('Cookie', global.signin())
    .send({
      name: 'Bogota',
      country: country.name,
    })
    .expect(201);

  cities = await City.find({});
  expect(cities.length).toEqual(1);
  expect(cities[0].name).toEqual('Bogota');
});
it('disallows repeated cities', async () => {
  const { country } = await getCountry();
  let cities = await City.find({});
  expect(cities.length).toEqual(0);
  await request(app)
    .post('/api/locations/cities')
    .set('Cookie', global.signin())
    .send({
      name: 'Bogota',
      country: country.name,
    })
    .expect(201);
  cities = await City.find({});
  expect(cities.length).toEqual(1);
  expect(cities[0].name).toEqual('Bogota');

  await request(app)
    .post('/api/locations/cities')
    .set('Cookie', global.signin())
    .send({
      name: 'Bogota',
      country: country.name,
    })
    .expect(400);

  cities = await City.find({});
  expect(cities.length).toEqual(1);
});
