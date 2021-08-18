import request from 'supertest';
import { app } from '../../app';
import { Resource } from '../../models/resource';
import { ResourceType } from '../../models/resource-type';
import { checkupQueue } from '../../queues/checkup-queue';
import { natsClient } from '../../nats';

beforeEach(async () => {
  const resourceType = ResourceType.build({
    resourceTypeBrand: 'Marca',
    resourceTypeModel: 'Modelo',
    checkupTime: 20,
    kmToMaintenance: 20,
    photo: 'photo',
    type: 'Bicicleta',
    measureIndicators: true,
  });
  await resourceType.save();
});
it('has a POST route handler for /api/resources ', async () => {
  const response = await request(app).post('/api/resources').send({});
  expect(response.status).not.toEqual(404);
});

it('can only be accessed by logged users', async () => {
  const response = await request(app).post('/api/resources').send({});
  expect(response.status).toEqual(401);
});

it('returns status other than 401 if the user is logged in', async () => {
  const cookie = global.signin();
  const response = await request(app)
    .post('/api/resources')
    .set('Cookie', cookie)
    .send({});
  expect(response.status).not.toEqual(401);
});

it('returns an error when no type is provided', async () => {
  const cookie = global.signin();
  const response = await request(app)
    .post('/api/resources')
    .set('Cookie', cookie)
    .send({
      // type: 'Bicicleta',
      reference: '0001',
      qrCode: 'https://meb.moversapp.co',
      lockerPassword: 123456,
      client: 'Claro',
      office: 'Sede principal',
      loanTime: 24,
    });
  expect(response.status).toEqual(400);
});

it('returns an error when no reference is provided', async () => {
  const cookie = global.signin();
  const response = await request(app)
    .post('/api/resources')
    .set('Cookie', cookie)
    .send({
      type: 'Bicicleta',
      // reference: '0001',
      qrCode: 'https://meb.moversapp.co',
      lockerPassword: 123456,
      client: 'Claro',
      office: 'Sede principal',
      loanTime: 24,
    });
  expect(response.status).toEqual(400);
});

it('returns an error when no qrCode is provided', async () => {
  const cookie = global.signin();
  const response = await request(app)
    .post('/api/resources')
    .set('Cookie', cookie)
    .send({
      type: 'Bicicleta',
      reference: '0001',
      // qrCode: 'https://meb.moversapp.co',
      lockerPassword: 123456,
      client: 'Claro',
      office: 'Sede principal',
      loanTime: 24,
    });
  expect(response.status).toEqual(400);
});

it('returns an error when no lockerPassword is provided', async () => {
  const cookie = global.signin();
  const response = await request(app)
    .post('/api/resources')
    .set('Cookie', cookie)
    .send({
      type: 'Bicicleta',
      reference: '0001',
      qrCode: 'https://meb.moversapp.co',
      // lockerPassword: 123456,
      client: 'Claro',
      office: 'Sede principal',
      loanTime: 24,
    });
  expect(response.status).toEqual(400);
});

it('returns an error when no client is provided', async () => {
  const cookie = global.signin();
  const response = await request(app)
    .post('/api/resources')
    .set('Cookie', cookie)
    .send({
      type: 'Bicicleta',
      reference: '0001',
      qrCode: 'https://meb.moversapp.co',
      lockerPassword: 123456,
      // client: 'Claro',
      office: 'Sede principal',
      loanTime: 24,
    });
  expect(response.status).toEqual(400);
});

it('returns an error when no office is provided', async () => {
  const cookie = global.signin();
  const response = await request(app)
    .post('/api/resources')
    .set('Cookie', cookie)
    .send({
      type: 'Bicicleta',
      reference: '0001',
      qrCode: 'https://meb.moversapp.co',
      lockerPassword: 123456,
      client: 'Claro',
      // office: 'Sede principal',
      loanTime: 24,
    });
  expect(response.status).toEqual(400);
});

it('returns an error when no loanTime is provided', async () => {
  const cookie = global.signin();
  const response = await request(app)
    .post('/api/resources')
    .set('Cookie', cookie)
    .send({
      type: 'Bicicleta',
      reference: '0001',
      qrCode: 'https://meb.moversapp.co',
      lockerPassword: 123456,
      client: 'Claro',
      office: 'Sede principal',
      // loanTime: 24,
    });
  expect(response.status).toEqual(400);
});

it('returns an error when the type does not exists', async () => {
  const cookie = global.signin();
  const response = await request(app)
    .post('/api/resources')
    .set('Cookie', cookie)
    .send({
      type: 'non existent',
      reference: '0001',
      qrCode: 'https://meb.moversapp.co',
      lockerPassword: 123456,
      client: 'Claro',
      office: 'Sede principal',
      loanTime: 24,
    });
  expect(response.status).toEqual(400);
});

it('returns 201 code and creates resource when provided valid params', async () => {
  let resources = await Resource.find({});
  expect(resources.length).toEqual(0);
  const cookie = global.signin();
  const response = await request(app)
    .post('/api/resources')
    .set('Cookie', cookie)
    .send({
      type: 'Bicicleta',
      reference: '0001',
      qrCode: 'https://meb.moversapp.co',
      lockerPassword: 123456,
      client: 'Claro',
      office: 'Sede principal',
      loanTime: 24,
      documents: [
        {
          type: 'Tarjeta',
          expeditionDate: new Date(),
          expirationDate: new Date(),
          resourceReference: '0001',
        },
      ],
    });
  expect(response.status).toEqual(201);
  resources = await Resource.find({});
  expect(resources.length).toEqual(1);
  expect(checkupQueue.add).toHaveBeenCalled();
  expect(natsClient.client.publish).toHaveBeenCalled();
});

it('disallows duplicate resources', async () => {
  const resource = {
    type: 'Bicicleta',
    reference: '0001',
    qrCode: 'https://meb.moversapp.co',
    lockerPassword: 123456,
    client: 'Claro',
    office: 'Sede principal',
    loanTime: 24,
  };
  let resources = await Resource.find({});
  expect(resources.length).toEqual(0);
  const cookie = global.signin();
  let response = await request(app)
    .post('/api/resources')
    .set('Cookie', cookie)
    .send(resource);
  expect(response.status).toEqual(201);
  resources = await Resource.find({});
  expect(resources.length).toEqual(1);

  response = await request(app)
    .post('/api/resources')
    .set('Cookie', cookie)
    .send(resource);
  expect(response.status).toEqual(400);
  resources = await Resource.find({});
  expect(resources.length).toEqual(1);
});
