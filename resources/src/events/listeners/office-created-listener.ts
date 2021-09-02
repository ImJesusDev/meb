import { Message } from 'node-nats-streaming';
import { Subjects, Listener, OfficeCreatedEvent } from '@movers/common';
import { queueGroupName } from './queue-group-name';
import { Office } from '../../models/office';

export class OfficeCreatedListener extends Listener<OfficeCreatedEvent> {
  subject: Subjects.OfficeCreated = Subjects.OfficeCreated;
  queueGroupName = queueGroupName;

  async onMessage(data: OfficeCreatedEvent['data'], msg: Message) {
    console.log(`OfficeCreatedEvent`);
    console.log(JSON.stringify(data, null, 2));
    const { id, name, client, repairAdmin, maintenanceAdmin, inventoryAdmin } =
      data;
    const office = Office.build({
      id,
      name,
      client,
      repairAdmin,
      maintenanceAdmin,
      inventoryAdmin,
    });
    await office.save();
    msg.ack();
  }
}
