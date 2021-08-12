import request from 'supertest';
import { app } from '../../app';
import { ResourceType } from '../../models/resource-type';

it('returns 200 code and updates resource type', async () => {
  const resourceType = ResourceType.build({
    resourceTypeBrand: 'brand',
    resourceTypeModel: 'model',
    checkupTime: 20,
    photo: 'no photo',
    type: 'type',
    measureIndicators: true,
  });
  await resourceType.save();
  const cookie = global.signin();
  const response = await request(app)
    .put(`/api/resources/resource-types/${resourceType.id}`)
    .set('Cookie', cookie)
    .send({
      type: 'Tipo',
      brand: 'Marca',
      model: 'Modelo',
      checkupTime: 20,
      measureIndicators: true,
      photo: 'https://myimages.com/brand.png',
    });
  expect(response.status).toEqual(200);
  let existingResourceType = await ResourceType.findById(resourceType.id);
  expect(existingResourceType!.type).toEqual('Tipo');
});
