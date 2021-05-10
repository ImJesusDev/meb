import { Message } from 'node-nats-streaming';
import { Subjects, Listener, UserCreatedEvent } from '@movers/common';
import { queueGroupName } from './queue-group-name';
import { User } from '../../models/user';

export class UserCreatedListener extends Listener<UserCreatedEvent> {
  subject: Subjects.UserCreated = Subjects.UserCreated;
  queueGroupName = queueGroupName;

  async onMessage(data: UserCreatedEvent['data'], msg: Message) {
    const { id, email } = data;
    const user = User.build({
      id,
      email,
    });
    await user.save();
    msg.ack();
  }
}
