import mongoose from 'mongoose';
import { app } from './app';
import { natsClient } from './nats';
import { UserCreatedListener } from './events/listeners/user-created-listener';
import { DomainAuthorizedListener } from './events/listeners/domain-authorized-listener';
import { EmailAuthorizedListener } from './events/listeners/email-authorized-listener';
import { ResourceCreatedListener } from './events/listeners/resource-created-listener';
import { ResourceUpdatedListener } from './events/listeners/resource-updated-listener';
const start = async () => {
  if (!process.env.JWT_KEY) {
    throw new Error('JWT_KEY must be defined');
  }
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI must be defined');
  }
  if (!process.env.NATS_CLIENT_ID) {
    throw new Error('NATS_CLIENT_ID must be defined');
  }
  if (!process.env.NATS_CLUSTER_ID) {
    throw new Error('NATS_CLUSTER_ID must be defined');
  }
  if (!process.env.NATS_URL) {
    throw new Error('NATS_URL must be defined');
  }
  try {
    await natsClient.connect(
      process.env.NATS_CLUSTER_ID,
      process.env.NATS_CLIENT_ID,
      process.env.NATS_URL
    );
    natsClient.client.on('close', () => {
      console.log('NATS connection closed');
      process.exit();
    });
    process.on('SIGINT', () => natsClient.client.close());
    process.on('SIGTERM', () => natsClient.client.close());

    new UserCreatedListener(natsClient.client).listen();
    new DomainAuthorizedListener(natsClient.client).listen();
    new EmailAuthorizedListener(natsClient.client).listen();
    new ResourceCreatedListener(natsClient.client).listen();
    new ResourceUpdatedListener(natsClient.client).listen();

    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    });
    console.log('Connected to MongoDb.');
  } catch (error) {
    console.log(error);
  }
  app.listen(3000, () => {
    console.log('[Clients] Listening on port 3000!');
  });
};

start();
