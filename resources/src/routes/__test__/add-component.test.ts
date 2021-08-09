import request from 'supertest';
import { app } from '../../app';
import { ResourceType } from '../../models/resource-type';

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
it('has a POST route handler for /api/resources/resource-types/:id/components ', async () => {
  const resourceType = await getResourceType();
  const response = await request(app)
    .post(`/api/resources/resource-types/${resourceType.id}/components`)
    .send({});
  expect(response.status).not.toEqual(404);
});

it('can only be accessed by logged users', async () => {
  const resourceType = await getResourceType();
  const response = await request(app)
    .post(`/api/resources/resource-types/${resourceType.id}/components`)
    .send({});
  expect(response.status).toEqual(401);
});

it('returns status other than 401 if the user is logged in', async () => {
  const cookie = global.signin();
  const resourceType = await getResourceType();
  const response = await request(app)
    .post(`/api/resources/resource-types/${resourceType.id}/components`)
    .set('Cookie', cookie)
    .send({});
  expect(response.status).not.toEqual(401);
});

it('returns an error when no name is provided', async () => {
  const cookie = global.signin();
  const resourceType = await getResourceType();
  const response = await request(app)
    .post(`/api/resources/resource-types/${resourceType.id}/components`)
    .set('Cookie', cookie)
    .send({
      resourceType: 'Bicicleta',
      componentBrand: 'Marca',
      componentModel: 'Modelo',
      regularCondition: {
        disables: false,
        ticket: false,
      },
      badCondition: {
        disables: false,
        ticket: false,
      },
    });
  expect(response.status).toEqual(400);
});

it('returns an error when no brand is provided', async () => {
  const cookie = global.signin();
  const resourceType = await getResourceType();
  const response = await request(app)
    .post(`/api/resources/resource-types/${resourceType.id}/components`)
    .set('Cookie', cookie)
    .send({
      name: 'Componente 1',
      componentModel: 'Modelo',
      regularCondition: {
        disables: false,
        ticket: false,
      },
      badCondition: {
        disables: false,
        ticket: false,
      },
    });
  expect(response.status).toEqual(400);
});

it('returns an error when no model is provided', async () => {
  const cookie = global.signin();
  const resourceType = await getResourceType();
  const response = await request(app)
    .post(`/api/resources/resource-types/${resourceType.id}/components`)
    .set('Cookie', cookie)
    .send({
      name: 'Componente 1',
      componentBrand: 'Marca',
      regularCondition: {
        disables: false,
        ticket: false,
      },
      badCondition: {
        disables: false,
        ticket: false,
      },
    });
  expect(response.status).toEqual(400);
});

it('returns an error when no regularCondition object is provided', async () => {
  const cookie = global.signin();
  const resourceType = await getResourceType();
  const response = await request(app)
    .post(`/api/resources/resource-types/${resourceType.id}/components`)
    .set('Cookie', cookie)
    .send({
      name: 'Componente 1',
      componentBrand: 'Marca',
      componentModel: 'Modelo',
      badCondition: {
        disables: false,
        ticket: false,
      },
    });
  expect(response.status).toEqual(400);
});

it('returns an error when no regularCondition disables property is provided', async () => {
  const cookie = global.signin();
  const resourceType = await getResourceType();
  const response = await request(app)
    .post(`/api/resources/resource-types/${resourceType.id}/components`)
    .set('Cookie', cookie)
    .send({
      name: 'Componente 1',
      componentBrand: 'Marca',
      componentModel: 'Modelo',
      regularCondition: {
        ticket: false,
      },
      badCondition: {
        disables: false,
        ticket: false,
      },
    });
  expect(response.status).toEqual(400);
});

it('returns an error when invalid regularCondition disables property is provided', async () => {
  const cookie = global.signin();
  const resourceType = await getResourceType();
  const response = await request(app)
    .post(`/api/resources/resource-types/${resourceType.id}/components`)
    .set('Cookie', cookie)
    .send({
      name: 'Componente 1',
      componentBrand: 'Marca',
      componentModel: 'Modelo',
      regularCondition: {
        disables: 'invalid',
        ticket: false,
      },
      badCondition: {
        disables: false,
        ticket: false,
      },
    });
  expect(response.status).toEqual(400);
});

it('returns an error when no regularCondition ticket property is provided', async () => {
  const cookie = global.signin();
  const resourceType = await getResourceType();
  const response = await request(app)
    .post(`/api/resources/resource-types/${resourceType.id}/components`)
    .set('Cookie', cookie)
    .send({
      name: 'Componente 1',
      componentBrand: 'Marca',
      componentModel: 'Modelo',
      regularCondition: {
        disables: false,
      },
      badCondition: {
        disables: false,
        ticket: false,
      },
    });
  expect(response.status).toEqual(400);
});

it('returns an error when invalid regularCondition ticket property is provided', async () => {
  const cookie = global.signin();
  const resourceType = await getResourceType();
  const response = await request(app)
    .post(`/api/resources/resource-types/${resourceType.id}/components`)
    .set('Cookie', cookie)
    .send({
      name: 'Componente 1',
      componentBrand: 'Marca',
      componentModel: 'Modelo',
      regularCondition: {
        disables: false,
        ticket: 'invalid',
      },
      badCondition: {
        disables: false,
        ticket: false,
      },
    });
  expect(response.status).toEqual(400);
});

it('returns an error when invalid regularCondition object is provided', async () => {
  const cookie = global.signin();
  const resourceType = await getResourceType();
  const response = await request(app)
    .post(`/api/resources/resource-types/${resourceType.id}/components`)
    .set('Cookie', cookie)
    .send({
      name: 'Componente 1',
      componentBrand: 'Marca',
      componentModel: 'Modelo',
      regularCondition: 'Invalid',
      badCondition: {
        disables: false,
        ticket: false,
      },
    });
  expect(response.status).toEqual(400);
});

it('returns an error when no badCondition object is provided', async () => {
  const cookie = global.signin();
  const resourceType = await getResourceType();
  const response = await request(app)
    .post(`/api/resources/resource-types/${resourceType.id}/components`)
    .set('Cookie', cookie)
    .send({
      name: 'Componente 1',
      componentBrand: 'Marca',
      componentModel: 'Modelo',
      regularCondition: {
        disables: false,
        ticket: false,
      },
    });
  expect(response.status).toEqual(400);
});

it('returns an error when invalid badCondition object is provided', async () => {
  const cookie = global.signin();
  const resourceType = await getResourceType();
  const response = await request(app)
    .post(`/api/resources/resource-types/${resourceType.id}/components`)
    .set('Cookie', cookie)
    .send({
      name: 'Componente 1',
      componentBrand: 'Marca',
      componentModel: 'Modelo',
      regularCondition: {
        disables: false,
        ticket: false,
      },
      badCondition: 'invalid',
    });
  expect(response.status).toEqual(400);
});

it('returns an error when no badCondition disables property is provided', async () => {
  const cookie = global.signin();
  const resourceType = await getResourceType();
  const response = await request(app)
    .post(`/api/resources/resource-types/${resourceType.id}/components`)
    .set('Cookie', cookie)
    .send({
      name: 'Componente 1',
      componentBrand: 'Marca',
      componentModel: 'Modelo',
      regularCondition: {
        ticket: false,
        disables: false,
      },
      badCondition: {
        ticket: false,
      },
    });
  expect(response.status).toEqual(400);
});

it('returns an error when invalid badCondition disables property is provided', async () => {
  const cookie = global.signin();
  const resourceType = await getResourceType();
  const response = await request(app)
    .post(`/api/resources/resource-types/${resourceType.id}/components`)
    .set('Cookie', cookie)
    .send({
      name: 'Componente 1',
      componentBrand: 'Marca',
      componentModel: 'Modelo',
      regularCondition: {
        ticket: false,
        disables: false,
      },
      badCondition: {
        disables: 'invalid',
        ticket: false,
      },
    });
  expect(response.status).toEqual(400);
});

it('returns an error when no badCondition ticket property is provided', async () => {
  const cookie = global.signin();
  const resourceType = await getResourceType();
  const response = await request(app)
    .post(`/api/resources/resource-types/${resourceType.id}/components`)
    .set('Cookie', cookie)
    .send({
      name: 'Componente 1',
      componentBrand: 'Marca',
      componentModel: 'Modelo',
      regularCondition: {
        ticket: false,
        disables: false,
      },
      badCondition: {
        disables: false,
      },
    });
  expect(response.status).toEqual(400);
});

it('returns an error when invalid badCondition ticket property is provided', async () => {
  const cookie = global.signin();
  const resourceType = await getResourceType();
  const response = await request(app)
    .post(`/api/resources/resource-types/${resourceType.id}/components`)
    .set('Cookie', cookie)
    .send({
      name: 'Componente 1',
      componentBrand: 'Marca',
      componentModel: 'Modelo',
      regularCondition: {
        ticket: false,
        disables: false,
      },
      badCondition: {
        disables: false,
        ticket: 'invalid',
      },
    });
  expect(response.status).toEqual(400);
});

it('returns 201 status code when valid params are provided', async () => {
  const cookie = global.signin();
  const resourceType = await getResourceType();
  const response = await request(app)
    .post(`/api/resources/resource-types/${resourceType.id}/components`)
    .set('Cookie', cookie)
    .send({
      name: 'Componente 1',
      componentBrand: 'Marca',
      componentModel: 'Modelo',
      regularCondition: {
        ticket: false,
        disables: false,
      },
      badCondition: {
        disables: false,
        ticket: false,
      },
    });
  expect(response.status).toEqual(201);
});
