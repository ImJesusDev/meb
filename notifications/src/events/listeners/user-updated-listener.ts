import { Message } from 'node-nats-streaming';
import { Subjects, Listener, UserUpdatedEvent } from '@movers/common';
import { queueGroupName } from './queue-group-name';
import { User } from '../../models/user';

export class UserUpdatedListener extends Listener<UserUpdatedEvent> {
  subject: Subjects.UserUpdated = Subjects.UserUpdated;
  queueGroupName = queueGroupName;

  async onMessage(data: UserUpdatedEvent['data'], msg: Message) {
    const user = await User.findByEvent(data);

    if (!user) {
      return console.log(`User not found id: ${data.id}`);
    }

    const { email } = data;

    user.set({
      email,
    });
    await user.save();
    msg.ack();
  }
}
