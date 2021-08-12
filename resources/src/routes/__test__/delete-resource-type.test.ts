import request from 'supertest';
import { app } from '../../app';
import { ResourceType } from '../../models/resource-type';

it('returns 204 code and deletes resource type', async () => {
  const resourceType = ResourceType.build({
    resourceTypeBrand: 'brand',
    resourceTypeModel: 'model',
    checkupTime: 20,
    photo: 'no photo',
    type: 'type',
    measureIndicators: true,
  });
  await resourceType.save();
  let resourceTypes = await ResourceType.find({});
  expect(resourceTypes.length).toEqual(1);
  const cookie = global.signin();
  const response = await request(app)
    .delete(`/api/resources/resource-types/${resourceType.id}`)
    .set('Cookie', cookie)
    .send({});
  expect(response.status).toEqual(204);
  resourceTypes = await ResourceType.find({});
  expect(resourceTypes.length).toEqual(0);
});
