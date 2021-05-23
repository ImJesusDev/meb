import { Message } from 'node-nats-streaming';
import { Subjects, Listener, UserCreatedEvent } from '@movers/common';
import { queueGroupName } from './queue-group-name';
import { User } from '../../models/user';
import { mailer } from '../../mailer';
import path from 'path';

export class UserCreatedListener extends Listener<UserCreatedEvent> {
  subject: Subjects.UserCreated = Subjects.UserCreated;
  queueGroupName = queueGroupName;

  async onMessage(data: UserCreatedEvent['data'], msg: Message) {
    const { id, email, firstName, lastName, activationCode } = data;
    const existingUser = await User.findById(id);
    // Create new user record
    if (!existingUser) {
      const user = User.build({
        id,
        email,
        firstName,
        lastName,
        activationCode,
      });
      await user.save();
    }

    // Send Email
    const mail = {
      from: 'info@meb.dev',
      to: email,
      subject: 'Account Activation - MEB',
      template: 'account-activation',
      attachments: [
        {
          filename: 'logo-white.png',
          path: path.resolve('./src/public/images/logo-white.png'),
          cid: 'logo',
        },
      ],
      context: {
        name: `${firstName} ${lastName}`,
        link: `https://meb-admin.moversapp.co/activacion?codigo=${activationCode}`,
      },
    };
    console.log(`Sending activation email to ${email}`);
    await mailer.sendEmail(mail);
    msg.ack();
  }
}
