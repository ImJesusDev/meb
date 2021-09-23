import { Message } from 'node-nats-streaming';
import { Subjects, Listener, UserCreatedEvent } from '@movers/common';
import { queueGroupName } from './queue-group-name';
import { User } from '../../models/user';

export class UserCreatedListener extends Listener<UserCreatedEvent> {
  subject: Subjects.UserCreated = Subjects.UserCreated;
  queueGroupName = queueGroupName;

  async onMessage(data: UserCreatedEvent['data'], msg: Message) {
    console.log(`UserCreatedEvent`);
    console.log(JSON.stringify(data, null, 2));
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
    } = data;
    const user = User.build({
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
    });
    await user.save();
    msg.ack();
  }
}
