import { Message } from 'node-nats-streaming';
import { Subjects, Listener, EmailAuthorizedEvent } from '@movers/common';
import { queueGroupName } from './queue-group-name';
import { Email } from '../../models/email';

export class EmailAuthorizedListener extends Listener<EmailAuthorizedEvent> {
  subject: Subjects.EmailAuthorized = Subjects.EmailAuthorized;
  queueGroupName = queueGroupName;

  async onMessage(data: EmailAuthorizedEvent['data'], msg: Message) {
    const { id, email, client, active, office } = data;
    const newEmail = Email.build({
      id,
      email,
      client,
      office,
      active,
    });
    await newEmail.save();
    msg.ack();
  }
}
