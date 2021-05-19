import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../app';
import { User } from '../models/user';
import { UserStatus } from '@movers/common';

declare global {
  namespace NodeJS {
    interface Global {
      signin(): Promise<string[]>;
    }
  }
}
jest.mock('../nats');
let mongo: any;
beforeAll(async () => {
  process.env.JWT_KEY = 'asdf';
  mongo = new MongoMemoryServer();
  const mongoUri = await mongo.getUri();

  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

beforeEach(async () => {
  jest.clearAllMocks();
  const collections = await mongoose.connection.db.collections();
  for (let collection of collections) {
    await collection.deleteMany({});
  }
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongo.stop();
  await mongoose.connection.close();
});

global.signin = async () => {
  const email = 'test@test.com';
  const password = 'password';
  const firstName = 'Regular';
  const lastName = 'User';
  const city = 'Bogota';
  const country = 'Colombia';
  const mainTransportationMethod = 'Carro';
  const secondaryTransportationMethod = 'Moto';
  const termsDate = true;
  const comodatoDate = true;

  // Create user
  const response1 = await request(app)
    .post('/api/users/signup')
    .send({
      email,
      password,
      firstName,
      lastName,
      city,
      country,
      mainTransportationMethod,
      secondaryTransportationMethod,
      termsDate,
      comodatoDate,
    })
    .expect(201);
  // Activate user
  const user = await User.findOne({ email: 'test@test.com' });

  if (user) {
    user.set({
      status: UserStatus.Active,
    });
    await user.save();
  }
  // Sign in
  const response = await request(app)
    .post('/api/users/signin')
    .send({ email, password })
    .expect(200);
  const cookie = response.get('Set-Cookie');

  return cookie;
};
