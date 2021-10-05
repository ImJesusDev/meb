import mongoose from "mongoose";
import { app } from "./app";
import { natsClient } from "./nats";
import { UserCreatedListener } from "./events/listeners/user-created-listener";
import { PasswordResetListener } from "./events/listeners/password-reset-listener";
const start = async () => {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI must be defined");
  }
  if (!process.env.NATS_CLIENT_ID) {
    throw new Error("NATS_CLIENT_ID must be defined");
  }
  if (!process.env.NATS_CLUSTER_ID) {
    throw new Error("NATS_CLUSTER_ID must be defined");
  }
  if (!process.env.NATS_URL) {
    throw new Error("NATS_URL must be defined");
  }
  if (!process.env.EMAIL_USERNAME) {
    throw new Error("EMAIL_USERNAME must be defined");
  }
  if (!process.env.EMAIL_PASSWORD) {
    throw new Error("EMAIL_PASSWORD must be defined");
  }

  try {
    await natsClient.connect(
      process.env.NATS_CLUSTER_ID,
      process.env.NATS_CLIENT_ID,
      process.env.NATS_URL
    );
    natsClient.client.on("close", () => {
      console.log("NATS connection closed");
      process.exit();
    });
    process.on("SIGINT", () => natsClient.client.close());
    process.on("SIGTERM", () => natsClient.client.close());
    // Listen for user created event
    new UserCreatedListener(natsClient.client).listen();
    // Listen for password reset event
    new PasswordResetListener(natsClient.client).listen();
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    });
    console.log("Connected to MongoDb.");
  } catch (error) {
    console.log(error);
  }
  app.listen(3000, () => {
    console.log("[Notifications] Listening on port 3000!");
  });
};

start();
