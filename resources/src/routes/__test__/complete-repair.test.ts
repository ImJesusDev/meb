import request from "supertest";
import { app } from "../../app";
import mongoose from "mongoose";
import { Resource } from "../../models/resource";
import { ResourceType } from "../../models/resource-type";
import { Component } from "../../models/component";
import { Repair } from "../../models/repair";
import { RepairStatus, ResourceStatus } from "@movers/common";
import { natsClient } from "../../nats";
import { Office } from "../../models/office";
const getRepair = async () => {
  const office = Office.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    name: "Sede principal",
    client: "Claro",
    repairAdmin: new mongoose.Types.ObjectId().toHexString(),
    maintenanceAdmin: new mongoose.Types.ObjectId().toHexString(),
    inventoryAdmin: new mongoose.Types.ObjectId().toHexString(),
  });
  await office.save();
  const repair = Repair.build({
    resourceRef: "0001",
    createdAt: new Date(),
    status: RepairStatus.Pending,
    assignee: new mongoose.Types.ObjectId().toHexString(),
  });
  await repair.save();
  return repair;
};
const getResource = async () => {
  const resourceType = ResourceType.build({
    resourceTypeBrand: "Marca",
    resourceTypeModel: "Modelo",
    checkupTime: 20,
    kmToMaintenance: 20,
    photo: "Photo",
    type: "Bicicleta",
    measureIndicators: true,
  });
  await resourceType.save();
  const resource = Resource.build({
    type: "Bicicleta",
    reference: "0001",
    qrCode: "https://meb.moversapp.co",
    lockerPassword: 123456,
    client: "Claro",
    office: "Sede principal",
    loanTime: 24,
    status: ResourceStatus.Available,
    clientNumber: "123",
  });
  await resource.save();
  return resource;
};
const getComponent = async () => {
  const component = Component.build({
    name: "Frenos",
    resourceType: "Bicicleta",
    componentBrand: "Marca",
    componentModel: "Modelo",
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
it("has a PUT route handler for /api/resources/:id/repairs ", async () => {
  const resource = await getResource();
  const response = await request(app)
    .put(`/api/resources/${resource.id}/repairs`)
    .send({});
  expect(response.status).not.toEqual(404);
});

it("can only be accessed by logged users", async () => {
  const resource = await getResource();
  const response = await request(app)
    .put(`/api/resources/${resource.id}/repairs`)
    .send({});
  expect(response.status).toEqual(401);
});

it("returns status other than 401 if the user is logged in", async () => {
  const cookie = global.signin();
  const resource = await getResource();
  const response = await request(app)
    .put(`/api/resources/${resource.id}/repairs`)
    .set("Cookie", cookie)
    .send({});
  expect(response.status).not.toEqual(401);
});

it("returns an error when the resource does not exists", async () => {
  const cookie = global.signin();
  const id = new mongoose.Types.ObjectId().toHexString();
  const response = await request(app)
    .put(`/api/resources/${id}/repairs`)
    .set("Cookie", cookie)
    .send({});
  expect(response.status).toEqual(400);
});

it("returns an error when the components param is not provided", async () => {
  const cookie = global.signin();
  const resource = await getResource();
  const repair = await getRepair();
  const response = await request(app)
    .put(`/api/resources/${resource.id}/repairs`)
    .set("Cookie", cookie)
    .send({
      repairId: repair.id,
    });
  expect(response.status).toEqual(400);
});

it("returns an error when the components param is invalid", async () => {
  const cookie = global.signin();
  const resource = await getResource();
  const repair = await getRepair();
  const response = await request(app)
    .put(`/api/resources/${resource.id}/repairs`)
    .set("Cookie", cookie)
    .send({
      repairId: repair.id,
      components: "invalid",
    });
  expect(response.status).toEqual(400);
});

it("returns an error when the components param does not includes component id", async () => {
  const cookie = global.signin();
  const resource = await getResource();
  const repair = await getRepair();
  const response = await request(app)
    .put(`/api/resources/${resource.id}/repairs`)
    .set("Cookie", cookie)
    .send({
      repairId: repair.id,
      components: [
        {
          status: "Bueno",
          componentName: "Frenos",
        },
      ],
    });
  expect(response.status).toEqual(400);
});

it("returns an error when the components param does not includes status", async () => {
  const cookie = global.signin();
  const resource = await getResource();
  const component = await getComponent();
  const repair = await getRepair();
  const response = await request(app)
    .put(`/api/resources/${resource.id}/repairs`)
    .set("Cookie", cookie)
    .send({
      repairId: repair.id,
      components: [
        {
          componentId: component.id,
          componentName: "Frenos",
        },
      ],
    });
  expect(response.status).toEqual(400);
});

it("returns an error when the components param does not includes component name", async () => {
  const cookie = global.signin();
  const resource = await getResource();
  const component = await getComponent();
  const repair = await getRepair();
  const response = await request(app)
    .put(`/api/resources/${resource.id}/repairs`)
    .set("Cookie", cookie)
    .send({
      repairId: repair.id,
      components: [
        {
          componentId: component.id,
          status: "Bueno",
        },
      ],
    });
  expect(response.status).toEqual(400);
});

it("returns an error when the component does not exists", async () => {
  const cookie = global.signin();
  const resource = await getResource();
  const repair = await getRepair();
  const id = mongoose.Types.ObjectId().toHexString();
  const response = await request(app)
    .put(`/api/resources/${resource.id}/repairs`)
    .set("Cookie", cookie)
    .send({
      repairId: repair.id,
      components: [
        {
          componentId: id,
          status: "Bueno",
          componentName: "Frenos",
        },
      ],
    });
  expect(response.status).toEqual(400);
});

it("returns an error when the repairId param is not provide", async () => {
  const cookie = global.signin();
  const resource = await getResource();
  const component = await getComponent();
  const response = await request(app)
    .put(`/api/resources/${resource.id}/repairs`)
    .set("Cookie", cookie)
    .send({
      components: [
        {
          componentId: component.id,
          status: "Bueno",
          componentName: "Frenos",
        },
      ],
    });

  expect(response.status).toEqual(400);
});

it("returns status 201 and creates repair when given valid params", async () => {
  let repairs = await Repair.find({});
  expect(repairs.length).toEqual(0);
  const repair = await getRepair();
  const cookie = global.signin();
  const resource = await getResource();
  const component = await getComponent();
  const response = await request(app)
    .put(`/api/resources/${resource.id}/repairs`)
    .set("Cookie", cookie)
    .send({
      repairId: repair.id,
      components: [
        {
          componentId: component.id,
          status: "Bueno",
          componentName: "Frenos",
        },
      ],
    });
  expect(response.status).toEqual(201);
  repairs = await Repair.find({});
  expect(repairs.length).toEqual(1);
  expect(natsClient.client.publish).toHaveBeenCalled();
});
