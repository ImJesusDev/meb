import request from 'supertest';
import { app } from '../../app';
import { Travel } from '../../models/travel';
import mongoose from 'mongoose';

it('has a POST route handler for /api/travels ', async () => {
  const response = await request(app).post('/api/travels').send({});
  expect(response.status).not.toEqual(404);
});

it('can only access by signed in users', async () => {
  const response = await request(app).post('/api/travels').send({}).expect(401);
});

it('returns a status other than 401 if the user is signed in', async () => {
  const response = await request(app)
    .post('/api/travels')
    .set('Cookie', global.signin())
    .send({});
  expect(response.status).not.toEqual(401);
});
it('returns an error with invalid origin', async () => {
  const reservationId = mongoose.Types.ObjectId().toString();
  await request(app)
    .post('/api/travels')
    .set('Cookie', global.signin())
    .send({
      origin: '',
      destination: 'Calle 80',
      resourceRef: '0001',
      reservationId: reservationId,
    })
    .expect(400);
});
it('returns an error with invalid destination', async () => {
  const reservationId = mongoose.Types.ObjectId().toString();
  await request(app)
    .post('/api/travels')
    .set('Cookie', global.signin())
    .send({
      origin: 'Calle 100',
      destination: '',
      resourceRef: '0001',
      reservationId: reservationId,
    })
    .expect(400);
});

it('returns an error with invalid destination', async () => {
  const reservationId = mongoose.Types.ObjectId().toString();
  const response = await request(app)
    .post('/api/travels')
    .set('Cookie', global.signin())
    .send({
      origin: 'Calle 100',
      destination: 'Calle 80',
      resourceRef: '',
      reservationId: reservationId,
    })
    .expect(400);
});

it('returns 201 and creates a new travel', async () => {
  const reservationId = mongoose.Types.ObjectId().toString();
  let travels = await Travel.find({});
  expect(travels.length).toEqual(0);
  const response = await request(app)
    .post('/api/travels')
    .set('Cookie', global.signin())
    .send({
      origin: 'Calle 100',
      destination: 'Calle 80',
      resourceRef: '001',
      reservationId: reservationId,
    });
  expect(response.status).toEqual(201);
  travels = await Travel.find({});
  expect(travels.length).toEqual(1);
});
