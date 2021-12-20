import Queue from 'bull';
import { Resource } from '../models/resource';
import { Checkup, ComponentCheckupAttrs } from '../models/checkup';
import { ResourceType } from '../models/resource-type';

import { CheckupStatus, ResourceStatus } from '@movers/common';
import { Office } from '../models/office';
interface Payload {
  resourceId: string;
}

const checkupQueue = new Queue<Payload>('resource:checkup', {
  redis: {
    host: process.env.REDIS_HOST,
  },
});

checkupQueue.process(async (job) => {
  const resource = await Resource.findById(job.data.resourceId);
  if (resource) {
    const office = await Office.findOne({ name: resource.office });
    if (office) {
      const existingType = await ResourceType.findOne({
        type: resource.type,
      }).populate(['components']);
      const components: ComponentCheckupAttrs[] = [];
      if (existingType && existingType.components) {
        for (const component of existingType.components) {
          components.push({
            componentId: component.id,
            componentName: component.name,
          });
        }
      }
      const checkup = Checkup.build({
        resourceRef: resource.reference,
        createdAt: new Date(),
        components,
        status: CheckupStatus.Pending,
        assignee: office.inventoryAdmin,
      });
      await checkup.save();
      console.log(checkup);
      resource.set({
        status: ResourceStatus.PendingCheckup,
      });
      await resource.save();
    }
  }
});

export { checkupQueue };
