import { Message } from 'node-nats-streaming';
import {
  Subjects,
  Listener,
  TravelFinishedEvent,
  MaintenanceStatus,
  ResourceStatus,
} from '@movers/common';
import { queueGroupName } from './queue-group-name';
import { Resource } from '../../models/resource';
import { ResourceType } from '../../models/resource-type';
import { Travel } from '../../models/travel';
import {
  ComponentMaintenanceAttrs,
  Maintenance,
} from '../../models/maintenance';
import { ResourceUpdatedPublisher } from '../publishers/resource-updated-publisher';
import { natsClient } from '../../nats';

export class TravelFinishedListener extends Listener<TravelFinishedEvent> {
  subject: Subjects.TravelFinished = Subjects.TravelFinished;
  queueGroupName = queueGroupName;

  async onMessage(data: TravelFinishedEvent['data'], msg: Message) {
    const { userId, reservationId, indicators, status, resourceRef } = data;
    // Get the resource
    const resource = await Resource.findOne({ reference: resourceRef });
    if (!resource) {
      return console.log(`Resource not found ref: ${resourceRef}`);
    }
    // Get the type
    const type = await ResourceType.findOne({ type: resource.type }).populate([
      'components',
    ]);

    if (!type) {
      return console.log(`Resource Type not found ref: ${resource.type}`);
    }
    // Get the travel
    const travel = await Travel.findByEvent(data);

    if (!travel) {
      return console.log(`Travel not found id: ${data.id}`);
    }
    // If the travel has indicators with km
    if (
      indicators &&
      indicators.km &&
      resource.status === ResourceStatus.Available
    ) {
      // Calculate accumulated km for the resource
      const resourceKms = resource.kmSinceMaintenance + indicators.km;
      // If the resource has required km to maintenance
      if (resourceKms > type.kmToMaintenance) {
        // Create maintenance
        const components: ComponentMaintenanceAttrs[] = [];
        if (type && type.components) {
          for (const component of type.components) {
            components.push({
              componentId: component.id,
              componentName: component.name,
            });
          }
        }
        const maintenance = Maintenance.build({
          resourceRef: resource.reference,
          createdAt: new Date(),
          components,
          status: MaintenanceStatus.Pending,
        });

        await maintenance.save();

        resource.set({
          status: ResourceStatus.PendingMaintenance,
          kmSinceMaintenance: resourceKms,
        });

        await resource.save();
        await new ResourceUpdatedPublisher(natsClient.client).publish({
          id: resource.id,
          status: resource.status,
          version: resource.version,
        });
      } else {
        // If the resource is not ready for maintenance
        resource.set({
          kmSinceMaintenance: resourceKms,
        });
        await resource.save();
      }
    }

    travel.set({
      indicators,
      status,
    });

    await travel.save();

    msg.ack();
  }
}
