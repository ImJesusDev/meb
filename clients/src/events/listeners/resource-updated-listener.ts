import { Message } from 'node-nats-streaming';
import { Subjects, Listener, ResourceUpdatedEvent } from '@movers/common';
import { queueGroupName } from './queue-group-name';
import { Resource } from '../../models/resource';

export class ResourceUpdatedListener extends Listener<ResourceUpdatedEvent> {
  subject: Subjects.ResourceUpdated = Subjects.ResourceUpdated;
  queueGroupName = queueGroupName;

  async onMessage(data: ResourceUpdatedEvent['data'], msg: Message) {
    console.log('ResourceUpdatedEvent');
    console.log(JSON.stringify(data, null, 2));
    const { id, status, version } = data;

    const resource = await Resource.findByEvent({
      id,
      version,
    });
    if (!resource) {
      console.log(`Resource id:${id} version: ${version} not found`);
      return;
    }
    resource.set({
      status,
    });
    await resource.save();

    msg.ack();
  }
}
