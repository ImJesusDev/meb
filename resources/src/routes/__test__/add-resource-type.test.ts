import request from 'supertest';
import { app } from '../../app';
import { ResourceType } from '../../models/resource-type';

it('has a POST route handler for /api/resources/resource-types ', async () => {
  const response = await request(app)
    .post('/api/resources/resource-types')
    .send({});
  expect(response.status).not.toEqual(404);
});

it('can only be accessed by logged users', async () => {
  const response = await request(app)
    .post('/api/resources/resource-types')
    .send({});
  expect(response.status).toEqual(401);
});

it('returns status other than 401 if the user is logged in', async () => {
  const cookie = global.signin();
  const response = await request(app)
    .post('/api/resources/resource-types')
    .set('Cookie', cookie)
    .send({});
  expect(response.status).not.toEqual(401);
});

it('returns an error when no type is provided', async () => {
  const cookie = global.signin();
  const response = await request(app)
    .post('/api/resources/resource-types')
    .set('Cookie', cookie)
    .send({
      brand: 'Marca',
      model: 'Modelo',
      checkupTime: 20,
      kmToMaintenance: 20,
      measureIndicators: true,
      photo: 'https://myimages.com/brand.png',
    });
  expect(response.status).toEqual(400);
});

it('returns an error when no brand is provided', async () => {
  const cookie = global.signin();
  const response = await request(app)
    .post('/api/resources/resource-types')
    .set('Cookie', cookie)
    .send({
      type: 'Tipo',
      model: 'Modelo',
      checkupTime: 20,
      kmToMaintenance: 20,
      measureIndicators: true,
      photo: 'https://myimages.com/brand.png',
    });
  expect(response.status).toEqual(400);
});

it('returns an error when no model is provided', async () => {
  const cookie = global.signin();
  const response = await request(app)
    .post('/api/resources/resource-types')
    .set('Cookie', cookie)
    .send({
      type: 'Tipo',
      brand: 'Marca',
      checkupTime: 20,
      kmToMaintenance: 20,
      measureIndicators: true,
      photo: 'https://myimages.com/brand.png',
    });
  expect(response.status).toEqual(400);
});

it('returns an error when no checkupTime is provided', async () => {
  const cookie = global.signin();
  const response = await request(app)
    .post('/api/resources/resource-types')
    .set('Cookie', cookie)
    .send({
      type: 'Tipo',
      brand: 'Marca',
      model: 'Modelo',
      measureIndicators: true,
      kmToMaintenance: 20,
      photo: 'https://myimages.com/brand.png',
    });
  expect(response.status).toEqual(400);
});
it('returns an error when invalid checkupTime is provided', async () => {
  const cookie = global.signin();
  const response = await request(app)
    .post('/api/resources/resource-types')
    .set('Cookie', cookie)
    .send({
      type: 'Tipo',
      brand: 'Marca',
      model: 'Modelo',
      measureIndicators: true,
      checkupTime: 'Invalid',
      kmToMaintenance: 20,
      photo: 'https://myimages.com/brand.png',
    });
  expect(response.status).toEqual(400);
});
it('returns an error when no kmToMaintenance is provided', async () => {
  const cookie = global.signin();
  const response = await request(app)
    .post('/api/resources/resource-types')
    .set('Cookie', cookie)
    .send({
      type: 'Tipo',
      brand: 'Marca',
      model: 'Modelo',
      measureIndicators: true,
      checkupTime: 20,
      photo: 'https://myimages.com/brand.png',
    });
  expect(response.status).toEqual(400);
});
it('returns an error when invalid kmToMaintenance is provided', async () => {
  const cookie = global.signin();
  const response = await request(app)
    .post('/api/resources/resource-types')
    .set('Cookie', cookie)
    .send({
      type: 'Tipo',
      brand: 'Marca',
      model: 'Modelo',
      measureIndicators: true,
      checkupTime: 20,
      kmToMaintenance: 'invalid',
      photo: 'https://myimages.com/brand.png',
    });
  expect(response.status).toEqual(400);
});

it('returns an error when no measureIndicators is provided', async () => {
  const cookie = global.signin();
  const response = await request(app)
    .post('/api/resources/resource-types')
    .set('Cookie', cookie)
    .send({
      type: 'Tipo',
      brand: 'Marca',
      model: 'Modelo',
      checkupTime: 20,
      kmToMaintenance: 20,
      photo: 'https://myimages.com/brand.png',
    });
  expect(response.status).toEqual(400);
});

it('returns an error when invalid measureIndicators is provided', async () => {
  const cookie = global.signin();
  const response = await request(app)
    .post('/api/resources/resource-types')
    .set('Cookie', cookie)
    .send({
      type: 'Tipo',
      brand: 'Marca',
      model: 'Modelo',
      measureIndicators: 'Invalid',
      checkupTime: 20,
      kmToMaintenance: 20,
      photo: 'https://myimages.com/brand.png',
    });
  expect(response.status).toEqual(400);
});

it('returns an error when no photo is provided', async () => {
  const cookie = global.signin();
  const response = await request(app)
    .post('/api/resources/resource-types')
    .set('Cookie', cookie)
    .send({
      type: 'Tipo',
      brand: 'Marca',
      model: 'Modelo',
      measureIndicators: true,
      checkupTime: 20,
      kmToMaintenance: 20,
    });
  expect(response.status).toEqual(400);
});

it('returns 201 code and creates resource type when provided valid params', async () => {
  let resourceTypes = await ResourceType.find({});
  expect(resourceTypes.length).toEqual(0);
  const cookie = global.signin();
  const response = await request(app)
    .post('/api/resources/resource-types')
    .set('Cookie', cookie)
    .send({
      type: 'Tipo',
      brand: 'Marca',
      model: 'Modelo',
      checkupTime: 20,
      kmToMaintenance: 20,
      measureIndicators: true,
      photo: 'https://myimages.com/brand.png',
    });
  expect(response.status).toEqual(201);
  resourceTypes = await ResourceType.find({});
  expect(resourceTypes.length).toEqual(1);
});

it('disallows duplicate types', async () => {
  const resourceType = {
    type: 'Tipo',
    brand: 'Marca',
    model: 'Modelo',
    checkupTime: 20,
    kmToMaintenance: 20,
    measureIndicators: true,
    photo: 'https://myimages.com/brand.png',
  };
  let resourceTypes = await ResourceType.find({});
  expect(resourceTypes.length).toEqual(0);
  const cookie = global.signin();
  let response = await request(app)
    .post('/api/resources/resource-types')
    .set('Cookie', cookie)
    .send(resourceType);
  expect(response.status).toEqual(201);
  resourceTypes = await ResourceType.find({});
  expect(resourceTypes.length).toEqual(1);

  response = await request(app)
    .post('/api/resources/resource-types')
    .set('Cookie', cookie)
    .send(resourceType);
  expect(response.status).toEqual(400);
  resourceTypes = await ResourceType.find({});
  expect(resourceTypes.length).toEqual(1);
});
