import { Message } from "node-nats-streaming";
import { Subjects, Listener, UserUpdatedEvent } from "@movers/common";
import { queueGroupName } from "./queue-group-name";
import { User } from "../../models/user";

export class UserUpdatedListener extends Listener<UserUpdatedEvent> {
  subject: Subjects.UserUpdated = Subjects.UserUpdated;
  queueGroupName = queueGroupName;

  async onMessage(data: UserUpdatedEvent["data"], msg: Message) {
    const user = await User.findByEvent(data);
    console.log("user updated event");
    console.log(JSON.stringify(data, null, 2));
    if (!user) {
      return console.log(`User not found id: ${data.id}`);
    }

    const {
      id,
      email,
      firstName,
      lastName,
      client,
      office,
      photo,
      documentNumber,
      weight,
      emergencyContactName,
      emergencyContactPhone,
      bloodType,
      gender,
      phone,
      eps,
      deletedAt,
    } = data;

    user.set({
      id,
      email,
      firstName: firstName ? firstName : user.firstName,
      lastName: lastName ? lastName : user.lastName,
      client,
      office,
      photo,
      documentNumber,
      weight,
      emergencyContactName,
      emergencyContactPhone,
      bloodType,
      gender,
      phone,
      eps,
      deletedAt,
    });
    await user.save();
    msg.ack();
  }
}
