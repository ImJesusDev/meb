import { Message } from 'node-nats-streaming';
import { Subjects, Listener, PasswordResetEvent } from '@movers/common';
import { queueGroupName } from './queue-group-name';
import { User } from '../../models/user';
import { mailer } from '../../mailer';
import path from 'path';

export class PasswordResetListener extends Listener<PasswordResetEvent> {
  subject: Subjects.PasswordReset = Subjects.PasswordReset;
  queueGroupName = queueGroupName;

  async onMessage(data: PasswordResetEvent['data'], msg: Message) {
    const { userId, code } = data;
    const existingUser = await User.findById(userId);
    if (existingUser) {
      // Send Email
      const mail = {
        from: 'info@meb.dev',
        to: existingUser.email,
        subject: 'Password Reset - MEB',
        template: 'password-reset',
        attachments: [
          {
            filename: 'logo-white.png',
            path: path.resolve('./src/public/images/logo-white.png'),
            cid: 'logo',
          },
        ],
        context: {
          name: `${existingUser.firstName} ${existingUser.lastName}`,
          link: `https://meb-admin.moversapp.co/auth/recuperar-clave?codigo=${code}&email=${existingUser.email}`,
        },
      };
      console.log(`Sending password reset email to ${existingUser.email}`);
      await mailer.sendEmail(mail);
    }

    msg.ack();
  }
}
