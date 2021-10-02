import { Message } from "node-nats-streaming";
import {
  TravelCreatedEvent,
  TravelStatus,
  UserRole,
  UserStatus,
  ResourceStatus,
} from "@movers/common";
import mongoose from "mongoose";
import { natsClient } from "../../../nats";
import { TravelCreatedListener } from "../travel-created-listener";
import { Resource } from "../../../models/resource";
import { Travel } from "../../../models/travel";

const setup = async () => {
  const resource = Resource.build({
    type: "Bicicleta",
    reference: "0001",
    qrCode: "qrCode",
    lockerPassword: 12345,
    client: "Claro",
    office: "Bogota",
    loanTime: 20,
    status: ResourceStatus.Available,
    clientNumber: "123",
  });
  await resource.save();
  // Create instance of listener
  const listener = new TravelCreatedListener(natsClient.client);
  // Create fake data for event
  const data: TravelCreatedEvent["data"] = {
    version: 0,
    id: new mongoose.Types.ObjectId().toHexString(),
    resourceRef: "0001",
    reservationId: new mongoose.Types.ObjectId().toHexString(),
    userId: new mongoose.Types.ObjectId().toHexString(),
    status: TravelStatus.Pending,
    origin: "Calle 80",
    destination: "Calle 100",
  };
  // Create a fake message event
  // @ts-ignore
  const message: Message = {
    ack: jest.fn(),
  };

  return { listener, data, message };
};

it("create the travel", async () => {
  const { listener, data, message } = await setup();
  // Call the on message method with fake data and event
  await listener.onMessage(data, message);
  // Make assertions
  const travel = await Travel.findById(data.id);
  expect(travel).toBeDefined();
});
it("ack the message", async () => {
  const { listener, data, message } = await setup();
  // Call the on message method with fake data and event
  await listener.onMessage(data, message);
  // Make assertions
  expect(message.ack).toHaveBeenCalled();
});
