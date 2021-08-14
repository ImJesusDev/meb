import request from 'supertest';
import { app } from '../../app';
import mongoose from 'mongoose';
import { Resource } from '../../models/resource';
import { ResourceType } from '../../models/resource-type';
import { Component } from '../../models/component';
import { Maintenance } from '../../models/maintenance';
import { MaintenanceStatus, ResourceStatus } from '@movers/common';
import { natsClient } from '../../nats';
const getMaintenance = async () => {
  const maintenance = Maintenance.build({
    resourceRef: '0001',
    createdAt: new Date(),
    status: MaintenanceStatus.Pending,
  });
  await maintenance.save();
  return maintenance;
};
const getResource = async () => {
  const resourceType = ResourceType.build({
    resourceTypeBrand: 'Marca',
    resourceTypeModel: 'Modelo',
    checkupTime: 20,
    photo: 'Photo',
    type: 'Bicicleta',
    measureIndicators: true,
  });
  await resourceType.save();
  const resource = Resource.build({
    type: 'Bicicleta',
    reference: '0001',
    qrCode: 'https://meb.moversapp.co',
    lockerPassword: 123456,
    client: 'Claro',
    office: 'Sede principal',
    loanTime: 24,
    status: ResourceStatus.Available,
  });
  await resource.save();
  return resource;
};
const getComponent = async () => {
  const component = Component.build({
    name: 'Frenos',
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
  await component.save();
  return component;
};
it('has a PUT route handler for /api/resources/:id/maintenances ', async () => {
  const resource = await getResource();
  const response = await request(app)
    .put(`/api/resources/${resource.id}/maintenances`)
    .send({});
  expect(response.status).not.toEqual(404);
});

it('can only be accessed by logged users', async () => {
  const resource = await getResource();
  const response = await request(app)
    .put(`/api/resources/${resource.id}/maintenances`)
    .send({});
  expect(response.status).toEqual(401);
});

it('returns status other than 401 if the user is logged in', async () => {
  const cookie = global.signin();
  const resource = await getResource();
  const response = await request(app)
    .put(`/api/resources/${resource.id}/maintenances`)
    .set('Cookie', cookie)
    .send({});
  expect(response.status).not.toEqual(401);
});

it('returns an error when the resource does not exists', async () => {
  const cookie = global.signin();
  const id = mongoose.Types.ObjectId().toHexString();
  const response = await request(app)
    .put(`/api/resources/${id}/maintenances`)
    .set('Cookie', cookie)
    .send({});
  expect(response.status).toEqual(400);
});

it('returns an error when the components param is not provided', async () => {
  const cookie = global.signin();
  const resource = await getResource();
  const maintenance = await getMaintenance();
  const response = await request(app)
    .put(`/api/resources/${resource.id}/maintenances`)
    .set('Cookie', cookie)
    .send({
      maintenanceId: maintenance.id,
    });
  expect(response.status).toEqual(400);
});

it('returns an error when the components param is invalid', async () => {
  const cookie = global.signin();
  const resource = await getResource();
  const maintenance = await getMaintenance();
  const response = await request(app)
    .put(`/api/resources/${resource.id}/maintenances`)
    .set('Cookie', cookie)
    .send({
      maintenanceId: maintenance.id,
      components: 'invalid',
    });
  expect(response.status).toEqual(400);
});

it('returns an error when the components param does not includes component id', async () => {
  const cookie = global.signin();
  const resource = await getResource();
  const maintenance = await getMaintenance();
  const response = await request(app)
    .put(`/api/resources/${resource.id}/maintenances`)
    .set('Cookie', cookie)
    .send({
      maintenanceId: maintenance.id,
      components: [
        {
          status: 'Bueno',
          componentName: 'Frenos',
        },
      ],
    });
  expect(response.status).toEqual(400);
});

it('returns an error when the components param does not includes status', async () => {
  const cookie = global.signin();
  const resource = await getResource();
  const component = await getComponent();
  const maintenance = await getMaintenance();
  const response = await request(app)
    .put(`/api/resources/${resource.id}/maintenances`)
    .set('Cookie', cookie)
    .send({
      maintenanceId: maintenance.id,
      components: [
        {
          componentId: component.id,
          componentName: 'Frenos',
        },
      ],
    });
  expect(response.status).toEqual(400);
});

it('returns an error when the components param does not includes component name', async () => {
  const cookie = global.signin();
  const resource = await getResource();
  const component = await getComponent();
  const maintenance = await getMaintenance();
  const response = await request(app)
    .put(`/api/resources/${resource.id}/maintenances`)
    .set('Cookie', cookie)
    .send({
      maintenanceId: maintenance.id,
      components: [
        {
          componentId: component.id,
          status: 'Bueno',
        },
      ],
    });
  expect(response.status).toEqual(400);
});

it('returns an error when the component does not exists', async () => {
  const cookie = global.signin();
  const resource = await getResource();
  const maintenance = await getMaintenance();
  const id = mongoose.Types.ObjectId().toHexString();
  const response = await request(app)
    .put(`/api/resources/${resource.id}/maintenances`)
    .set('Cookie', cookie)
    .send({
      maintenanceId: maintenance.id,
      components: [
        {
          componentId: id,
          status: 'Bueno',
          componentName: 'Frenos',
        },
      ],
    });
  expect(response.status).toEqual(400);
});

it('returns an error when the maintenanceId param is not provide', async () => {
  const cookie = global.signin();
  const resource = await getResource();
  const component = await getComponent();
  const response = await request(app)
    .put(`/api/resources/${resource.id}/maintenances`)
    .set('Cookie', cookie)
    .send({
      components: [
        {
          componentId: component.id,
          status: 'Bueno',
          componentName: 'Frenos',
        },
      ],
    });

  expect(response.status).toEqual(400);
});

it('returns status 201 and creates maintenance when given valid params', async () => {
  let maintenances = await Maintenance.find({});
  expect(maintenances.length).toEqual(0);
  const maintenance = await getMaintenance();
  const cookie = global.signin();
  const resource = await getResource();
  const component = await getComponent();
  const response = await request(app)
    .put(`/api/resources/${resource.id}/maintenances`)
    .set('Cookie', cookie)
    .send({
      maintenanceId: maintenance.id,
      components: [
        {
          componentId: component.id,
          status: 'Bueno',
          componentName: 'Frenos',
        },
      ],
    });
  expect(response.status).toEqual(201);
  maintenances = await Maintenance.find({});
  expect(maintenances.length).toEqual(1);
  expect(natsClient.client.publish).toHaveBeenCalled();
});
