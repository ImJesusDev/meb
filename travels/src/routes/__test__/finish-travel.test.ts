import request from 'supertest';
import { app } from '../../app';
import { Travel } from '../../models/travel';
import { TravelStatus } from '@movers/common';
import mongoose from 'mongoose';

const getTravel = async () => {
  const id = mongoose.Types.ObjectId().toString();
  const travel = Travel.build({
    origin: 'Calle 100',
    destination: 'Calle 80',
    resourceRef: '001',
    status: TravelStatus.Pending,
    userId: '611454639edb430d704a2b7b',
    reservationId: id,
  });
  await travel.save();
  return travel;
};

it('has a PUT route handler for /api/travels/:id/finish ', async () => {
  const id = mongoose.Types.ObjectId().toString();
  const response = await request(app).put(`/api/travels/${id}/finish`).send({});
  expect(response.status).not.toEqual(404);
});

it('can only access by signed in users', async () => {
  const id = mongoose.Types.ObjectId().toString();
  const response = await request(app)
    .put(`/api/travels/${id}/finish`)
    .send({})
    .expect(401);
});

it('returns a status other than 401 if the user is signed in', async () => {
  const id = mongoose.Types.ObjectId().toString();
  const response = await request(app)
    .put(`/api/travels/${id}/finish`)
    .set('Cookie', global.signin())
    .send({});
  expect(response.status).not.toEqual(401);
});

it('returns a 404 error if the travel does not exists', async () => {
  const id = mongoose.Types.ObjectId().toString();
  const response = await request(app)
    .put(`/api/travels/${id}/finish`)
    .set('Cookie', global.signin())
    .send({});
  expect(response.status).toEqual(404);
});

it('returns a 200 and updates the travel', async () => {
  const travel = await getTravel();
  const response = await request(app)
    .put(`/api/travels/${travel.id}/finish`)
    .set('Cookie', global.signin())
    .send({});
  expect(response.status).toEqual(200);
  expect(response.body.status).toEqual(TravelStatus.Completed);
});

it('returns a 200 and updates the travel with indicators', async () => {
  const travel = await getTravel();
  const response = await request(app)
    .put(`/api/travels/${travel.id}/finish`)
    .set('Cookie', global.signin())
    .send({
      indicators: [{ calories: 20, km: 20 }],
    });
  expect(response.status).toEqual(200);
  expect(response.body.status).toEqual(TravelStatus.Completed);
  expect(response.body.indicators[0]).toEqual({ calories: 20, km: 20 });
});

it('returns a 200 and updates the travel with tracking', async () => {
  const travel = await getTravel();
  const response = await request(app)
    .put(`/api/travels/${travel.id}/finish`)
    .set('Cookie', global.signin())
    .send({
      tracking: [{ lat: 4.1, lng: -74.1 }],
    });
  expect(response.status).toEqual(200);
  expect(response.body.status).toEqual(TravelStatus.Completed);
  expect(response.body.tracking[0]).toEqual({ lat: 4.1, lng: -74.1 });
});

it('returns a 200 and updates the travel with tracking and indicators', async () => {
  const travel = await getTravel();
  const response = await request(app)
    .put(`/api/travels/${travel.id}/finish`)
    .set('Cookie', global.signin())
    .send({
      indicators: [{ calories: 20, km: 20 }],
      tracking: [{ lat: 4.1, lng: -74.1 }],
    });
  expect(response.status).toEqual(200);
  expect(response.body.status).toEqual(TravelStatus.Completed);
  expect(response.body.tracking[0]).toEqual({ lat: 4.1, lng: -74.1 });
  expect(response.body.indicators[0]).toEqual({ calories: 20, km: 20 });
});
