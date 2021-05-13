import { Message } from 'node-nats-streaming';
import { Subjects, Listener, UserCreatedEvent } from '@movers/common';
import { queueGroupName } from './queue-group-name';
import { User } from '../../models/user';
import { mailer } from '../../mailer';

export class UserCreatedListener extends Listener<UserCreatedEvent> {
  subject: Subjects.UserCreated = Subjects.UserCreated;
  queueGroupName = queueGroupName;

  async onMessage(data: UserCreatedEvent['data'], msg: Message) {
    const { id, email, firstName, lastName, activationCode } = data;
    // Create new user record
    const user = User.build({
      id,
      email,
      firstName,
      lastName,
      activationCode,
    });
    await user.save();

    // Send Email
    const mail = {
      from: 'info@meb.dev',
      to: email,
      subject: 'Account Activation - MEB',
      template: 'account-activation',
      context: {
        name: email,
        code: activationCode,
      },
    };
    console.log(`Sending email to ${email}`);
    await mailer.sendEmail(mail);
    msg.ack();
  }
}
