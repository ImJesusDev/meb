import { Message } from "node-nats-streaming";
import { Subjects, Listener, ResourceCreatedEvent } from "@movers/common";
import { queueGroupName } from "./queue-group-name";
import { Resource } from "../../models/resource";

export class ResourceCreatedListener extends Listener<ResourceCreatedEvent> {
  subject: Subjects.ResourceCreated = Subjects.ResourceCreated;
  queueGroupName = queueGroupName;

  async onMessage(data: ResourceCreatedEvent["data"], msg: Message) {
    const {
      id,
      type,
      reference,
      qrCode,
      lockerPassword,
      client,
      office,
      loanTime,
      status,
      clientNumber,
    } = data;

    const resource = Resource.build({
      id,
      type,
      reference,
      qrCode,
      lockerPassword,
      client,
      office,
      loanTime,
      status,
      clientNumber,
    });
    try {
      await resource.save();
    } catch (e) {
      console.log(`Error @ResourceCreatedListener`);
      console.log(e);
    }
    msg.ack();
  }
}
