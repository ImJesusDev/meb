import request from 'supertest';
import { app } from '../../app';
import { ResourceType } from '../../models/resource-type';
import { DocumentType } from '../../models/document-type';

it('returns 200 code and updates document type', async () => {
  const resourceType = ResourceType.build({
    resourceTypeBrand: 'brand',
    resourceTypeModel: 'model',
    checkupTime: 20,
    photo: 'no photo',
    type: 'type',
    measureIndicators: true,
  });
  await resourceType.save();

  const documentType = DocumentType.build({
    resourceType: resourceType.type,
    name: 'Doc 1',
    disables: false,
    requiresPhoto: false,
    expires: false,
  });

  await documentType.save();
  const cookie = global.signin();
  const response = await request(app)
    .put(
      `/api/resources/resource-types/${resourceType.id}/document-types/${documentType.id}`
    )
    .set('Cookie', cookie)
    .send({
      resourceType: resourceType.type,
      name: 'Doc 2',
      disables: false,
      requiresPhoto: false,
      expires: false,
    });
  expect(response.status).toEqual(200);
  let existingDocument = await DocumentType.findById(documentType.id);
  expect(existingDocument!.name).toEqual('Doc 2');
});
