import { Message } from 'node-nats-streaming';
import { Subjects, Listener, DomainAuthorizedEvent } from '@movers/common';
import { queueGroupName } from './queue-group-name';
import { Domain } from '../../models/domain';

export class DomainAuthorizedListener extends Listener<DomainAuthorizedEvent> {
  subject: Subjects.DomainAuthorized = Subjects.DomainAuthorized;
  queueGroupName = queueGroupName;

  async onMessage(data: DomainAuthorizedEvent['data'], msg: Message) {
    const { id, domain, client, active } = data;
    const newDomain = Domain.build({
      id,
      domain,
      client,
      active,
    });
    await newDomain.save();
    msg.ack();
  }
}
