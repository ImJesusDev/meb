import request from 'supertest';
import { app } from '../../app';
import { ResourceType } from '../../models/resource-type';
import { Component } from '../../models/component';

it('returns 204 code and deletes component type', async () => {
  const resourceType = ResourceType.build({
    resourceTypeBrand: 'brand',
    resourceTypeModel: 'model',
    checkupTime: 20,
    photo: 'no photo',
    type: 'type',
    measureIndicators: true,
  });
  await resourceType.save();

  const component = Component.build({
    resourceType: resourceType.type,
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
  await component.save();

  let components = await Component.find({});
  expect(components.length).toEqual(1);
  const cookie = global.signin();
  const response = await request(app)
    .delete(
      `/api/resources/resource-types/${resourceType.id}/components/${component.id}`
    )
    .set('Cookie', cookie)
    .send({});
  expect(response.status).toEqual(204);
  components = await Component.find({});
  expect(components.length).toEqual(0);
});
