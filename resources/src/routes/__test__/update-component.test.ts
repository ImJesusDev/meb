import request from 'supertest';
import { app } from '../../app';
import { ResourceType } from '../../models/resource-type';
import { Component } from '../../models/component';

it('returns 200 code and updates component', async () => {
  const resourceType = ResourceType.build({
    resourceTypeBrand: 'brand',
    resourceTypeModel: 'model',
    checkupTime: 20,
    kmToMaintenance: 20,
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
  const cookie = global.signin();
  const response = await request(app)
    .put(
      `/api/resources/resource-types/${resourceType.id}/components/${component.id}`
    )
    .set('Cookie', cookie)
    .send({
      name: 'Componente 2',
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
  expect(response.status).toEqual(200);
  let existingComponent = await Component.findById(component.id);
  expect(existingComponent!.name).toEqual('Componente 2');
});
