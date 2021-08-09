import request from 'supertest';
import { app } from '../../app';
import mongoose from 'mongoose';
import { ResourceType } from '../../models/resource-type';
import { DocumentType } from '../../models/document-type';

const getResourceType = async () => {
  const resourceType = ResourceType.build({
    resourceTypeBrand: 'Marca',
    resourceTypeModel: 'Modelo',
    checkupTime: 20,
    photo: 'Photo',
    type: 'Bicicleta',
    measureIndicators: true,
  });

  await resourceType.save();

  return resourceType;
};

it('has a post route handles from /api/resources/resource-types/:id/document-types', async () => {
  const resourceType = await getResourceType();

  const response = await request(app)
    .post(`/api/resources/resource-types/${resourceType.id}/document-types`)
    .send({});
  expect(response.status).not.toEqual(404);
});

it('can only be accessed by signed in users', async () => {
  const resourceType = await getResourceType();

  const response = await request(app)
    .post(`/api/resources/resource-types/${resourceType.id}/document-types`)
    .send({});
  expect(response.status).toEqual(401);
});

it('returns status code other than 401 if teh user is logged in', async () => {
  const resourceType = await getResourceType();
  const cookie = global.signin();
  const response = await request(app)
    .post(`/api/resources/resource-types/${resourceType.id}/document-types`)
    .set('Cookie', cookie)
    .send({});
  expect(response.status).not.toEqual(401);
});

it('returns an error when no name is provided', async () => {
  const resourceType = await getResourceType();
  const cookie = global.signin();
  const response = await request(app)
    .post(`/api/resources/resource-types/${resourceType.id}/document-types`)
    .set('Cookie', cookie)
    .send({
      disables: true,
      expires: true,
      requiresPhoto: false,
    });
  expect(response.status).toEqual(400);
});

it('returns an error when no disables value is provided', async () => {
  const resourceType = await getResourceType();
  const cookie = global.signin();
  const response = await request(app)
    .post(`/api/resources/resource-types/${resourceType.id}/document-types`)
    .set('Cookie', cookie)
    .send({
      name: 'Tarjeta de propiedad',
      requiresPhoto: false,
      expires: false,
    });
  expect(response.status).toEqual(400);
});

it('returns an error when invalid disables value is provided', async () => {
  const resourceType = await getResourceType();
  const cookie = global.signin();
  const response = await request(app)
    .post(`/api/resources/resource-types/${resourceType.id}/document-types`)
    .set('Cookie', cookie)
    .send({
      name: 'Tarjeta de propiedad',
      requiresPhoto: false,
      expires: false,
      disables: 'invalid',
    });
  expect(response.status).toEqual(400);
});

it('returns an error when no requiresPhoto value is provided', async () => {
  const resourceType = await getResourceType();
  const cookie = global.signin();
  const response = await request(app)
    .post(`/api/resources/resource-types/${resourceType.id}/document-types`)
    .set('Cookie', cookie)
    .send({
      name: 'Tarjeta de propiedad',
      disables: true,
      expires: true,
    });
  expect(response.status).toEqual(400);
});
it('returns an error when invalid requiresPhoto value is provided', async () => {
  const resourceType = await getResourceType();
  const cookie = global.signin();
  const response = await request(app)
    .post(`/api/resources/resource-types/${resourceType.id}/document-types`)
    .set('Cookie', cookie)
    .send({
      name: 'Tarjeta de propiedad',
      disables: true,
      expires: true,
      requiresPhoto: 'invalid',
    });
  expect(response.status).toEqual(400);
});

it('returns an error when no expires value is provided', async () => {
  const resourceType = await getResourceType();
  const cookie = global.signin();
  const response = await request(app)
    .post(`/api/resources/resource-types/${resourceType.id}/document-types`)
    .set('Cookie', cookie)
    .send({
      name: 'Tarjeta de propiedad',
      disables: true,
      requiresPhoto: true,
    });
  expect(response.status).toEqual(400);
});
it('returns an error when invalid expires value is provided', async () => {
  const resourceType = await getResourceType();
  const cookie = global.signin();
  const response = await request(app)
    .post(`/api/resources/resource-types/${resourceType.id}/document-types`)
    .set('Cookie', cookie)
    .send({
      name: 'Tarjeta de propiedad',
      disables: true,
      expires: 'invalid',
      requiresPhoto: true,
    });
  expect(response.status).toEqual(400);
});

it('returns an error with an nonexistent resource type', async () => {
  const id = mongoose.Types.ObjectId().toHexString();
  const cookie = global.signin();
  const response = await request(app)
    .post(`/api/resources/resource-types/${id}/document-types`)
    .set('Cookie', cookie)
    .send({
      name: 'Tarjeta de propiedad',
      disables: true,
      expires: true,
      requiresPhoto: true,
    });
  expect(response.status).toEqual(400);
});

it('returns 201 status code and creates document type when given valid params', async () => {
  let documentTypes = await DocumentType.find({});
  expect(documentTypes.length).toEqual(0);
  const resourceType = await getResourceType();
  const cookie = global.signin();
  const response = await request(app)
    .post(`/api/resources/resource-types/${resourceType.id}/document-types`)
    .set('Cookie', cookie)
    .send({
      name: 'Tarjeta de propiedad',
      disables: true,
      expires: true,
      requiresPhoto: true,
    });
  expect(response.status).toEqual(201);
  documentTypes = await DocumentType.find({});
  expect(documentTypes.length).toEqual(1);
});
