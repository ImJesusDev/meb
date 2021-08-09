import Queue from 'bull';
import { Resource } from '../models/resource';
import { Checkup } from '../models/checkup';
import { CheckupStatus, ResourceStatus } from '@movers/common';

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
    const checkup = Checkup.build({
      resourceRef: resource.reference,
      createdAt: new Date(),
      status: CheckupStatus.Pending,
    });
    await checkup.save();
    console.log(checkup);
    resource.set({
      status: ResourceStatus.PendingCheckup,
    });
    await resource.save();
  }
});

export { checkupQueue };
