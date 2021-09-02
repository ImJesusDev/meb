import request from 'supertest';
import { app } from '../../app';
import { City } from '../../models/city';
import { Geometry } from '../../models/geometry';
import mongoose from 'mongoose';

const getCity = async () => {
  const city = City.build({
    name: 'Bogota',
    slug: 'bogota',
    country: 'Colombia',
  });
  await city.save();
  return { city };
};

it('has a POST route handler for /api/locations/:id/geometries', async () => {
  const { city } = await getCity();
  const response = await request(app)
    .post(`/api/locations/cities/${city.id}/geometries`)
    .send({});
  expect(response.status).not.toEqual(404);
});

it('can only access by signed in users', async () => {
  const { city } = await getCity();
  const response = await request(app)
    .post(`/api/locations/cities/${city.id}/geometries`)
    .send({})
    .expect(401);
});

it('returns a status other than 401 if the user is signed in', async () => {
  const { city } = await getCity();
  const response = await request(app)
    .post(`/api/locations/cities/${city.id}/geometries`)
    .set('Cookie', global.signin())
    .send({});
  expect(response.status).not.toEqual(401);
});
it('returns an error with invalid name', async () => {
  const { city } = await getCity();
  await request(app)
    .post(`/api/locations/cities/${city.id}/geometries`)
    .set('Cookie', global.signin())
    .send({
      name: '',
      points: [{ lat: 1, lng: 2 }],
    })
    .expect(400);
});
it('returns an error with invalid city', async () => {
  const fakeCityId = new mongoose.Types.ObjectId().toHexString();
  await request(app)
    .post(`/api/locations/cities/${fakeCityId}/geometries`)
    .set('Cookie', global.signin())
    .send({
      name: 'My Geometry',
      points: [{ lat: 1, lng: 2 }],
    })
    .expect(400);
});
it('returns an error with invalid points', async () => {
  const { city } = await getCity();
  await request(app)
    .post(`/api/locations/cities/${city.id}/geometries`)
    .set('Cookie', global.signin())
    .send({
      name: 'My Geometry',
      points: 'invalid',
    })
    .expect(400);
  await request(app)
    .post(`/api/locations/cities/${city.id}/geometries`)
    .set('Cookie', global.signin())
    .send({
      name: 'My Geometry',
      points: [],
    })
    .expect(400);
  await request(app)
    .post(`/api/locations/cities/${city.id}/geometries`)
    .set('Cookie', global.signin())
    .send({
      name: 'My Geometry',
      points: [{ lat: 'invalid', lng: 2 }],
    })
    .expect(400);
  await request(app)
    .post(`/api/locations/cities/${city.id}/geometries`)
    .set('Cookie', global.signin())
    .send({
      name: 'My Geometry',
      points: [{ lat: 1, lng: 'invalid' }],
    })
    .expect(400);
});
it('creates a geometry with valid params', async () => {
  const { city } = await getCity();
  await request(app)
    .post(`/api/locations/cities/${city.id}/geometries`)
    .set('Cookie', global.signin())
    .send({
      name: 'New geometry',
      points: [{ lat: 1, lng: 2 }],
    })
    .expect(201);
});

it('creates a geometry with valid params', async () => {
  let geometries = await Geometry.find({});
  expect(geometries.length).toEqual(0);
  const { city } = await getCity();
  await request(app)
    .post(`/api/locations/cities/${city.id}/geometries`)
    .set('Cookie', global.signin())
    .send({
      name: 'New geometry',
      points: [{ lat: 1, lng: 2 }],
    })
    .expect(201);
  geometries = await Geometry.find({});
  expect(geometries.length).toEqual(1);
  expect(geometries[0].name).toEqual('New geometry');
});

it('disallows geometries with the same name', async () => {
  let geometries = await Geometry.find({});
  expect(geometries.length).toEqual(0);
  const { city } = await getCity();
  await request(app)
    .post(`/api/locations/cities/${city.id}/geometries`)
    .set('Cookie', global.signin())
    .send({
      name: 'New geometry',
      points: [{ lat: 1, lng: 2 }],
    })
    .expect(201);
  geometries = await Geometry.find({});
  expect(geometries.length).toEqual(1);
  expect(geometries[0].name).toEqual('New geometry');

  await request(app)
    .post(`/api/locations/cities/${city.id}/geometries`)
    .set('Cookie', global.signin())
    .send({
      name: 'New geometry',
      points: [{ lat: 1, lng: 2 }],
    })
    .expect(400);

  geometries = await Geometry.find({});
  expect(geometries.length).toEqual(1);
  expect(geometries[0].name).toEqual('New geometry');
});
