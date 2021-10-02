import request from "supertest";
import { app } from "../../app";
import mongoose from "mongoose";
import { Resource } from "../../models/resource";
import { Document } from "../../models/document";
import { ResourceStatus } from "@movers/common";

beforeAll(async () => {
  // Hack to register domain schema and avoid MissingSchemaError
  const documents = await Document.find({});
});

it("it can fetch a list of resources", async () => {
  const id = new mongoose.Types.ObjectId().toHexString();
  const resource = Resource.build({
    type: "Bicicleta",
    reference: "001",
    qrCode: "qrCode",
    lockerPassword: 12345,
    client: "Claro",
    office: "Bogota",
    loanTime: 20,
    status: ResourceStatus.Available,
    clientNumber: "123",
  });
  await resource.save();

  const response = await request(app).get(`/api/resources`).send().expect(200);
  expect(response.body.resources.length).toEqual(1);
});
