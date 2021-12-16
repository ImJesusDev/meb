import { Message } from "node-nats-streaming";
import { Subjects, Listener, UserUpdatedEvent } from "@movers/common";
import { queueGroupName } from "./queue-group-name";
import { User } from "../../models/user";

export class UserUpdatedListener extends Listener<UserUpdatedEvent> {
  subject: Subjects.UserUpdated = Subjects.UserUpdated;
  queueGroupName = queueGroupName;

  async onMessage(data: UserUpdatedEvent["data"], msg: Message) {
    const user = await User.findByEvent(data);
    console.log(`[Clients] UserUpdatedEvent`);
    console.log(JSON.stringify(data, null, 2));
    if (!user) {
      return console.log(`User not found id: ${data.id} version: ${data.version}`);
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
      email: email ? email : user.email,
      firstName: firstName ? firstName : user.firstName,
      lastName: lastName ? lastName : user.lastName,
      client: client ? client : user.client,
      office: office ? office : user.office,
      photo: photo ? photo : user.photo,
      documentNumber: documentNumber ? documentNumber : user.documentNumber,
      weight: weight ? weight : user.weight,
      emergencyContactName: emergencyContactName
        ? emergencyContactName
        : user.emergencyContactName,
      emergencyContactPhone: emergencyContactPhone
        ? emergencyContactPhone
        : user.emergencyContactPhone,
      bloodType: bloodType ? bloodType : user.bloodType,
      gender: gender ? gender : user.gender,
      phone: phone ? phone : user.phone,
      eps: eps ? eps : user.eps,
      deletedAt: deletedAt ? deletedAt : user.deletedAt,
    });
    await user.save();
    msg.ack();
  }
}
