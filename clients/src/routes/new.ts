import express, { Request, Response } from 'express';
import { body } from 'express-validator';
/* Commons */
import { requireAuth, validateRequest, BadRequestError } from '@movers/common';
/* Models */
import { Client } from '../models/client';
import { User } from '../models/user';
import { s3Client } from '../s3';
import { natsClient } from '../nats';
import { ClientCreatedPublisher } from '../events/publishers/client-created-publisher';
const router = express.Router();

router.post(
  '/api/clients',
  requireAuth(),
  [
    body('name').not().isEmpty().withMessage('Name is required'),
    body('nit').not().isEmpty().withMessage('Nit is required'),
    body('logo').not().isEmpty().withMessage('Logo is required'),
    // body('mebAdmin').not().isEmpty().withMessage('MEB admin is required'),
    // body('superAdminClient')
    //   .not()
    //   .isEmpty()
    //   .withMessage('Super admin client is required'),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { name, nit, logo, mebAdmin, superAdminClient, mebSuperAdmin } =
      req.body;
    let clientLogo = '';
    // const existingMebAdmin = await User.findById(mebAdmin);
    // if (!existingMebAdmin) {
    //   throw new BadRequestError('El administrador Mejor en Bici no existe');
    // }
    // const existingSuperAdminClient = await User.findById(superAdminClient);
    // if (!existingSuperAdminClient) {
    //   throw new BadRequestError('El super administrador del cliente no existe');
    // }
    if (logo && logo.includes('data:image')) {
      // Create Buffer
      const buffer = Buffer.from(
        logo.replace(/^data:image\/\w+;base64,/, ''),
        'base64'
      );
      // Get MimeType
      const mimeType = logo.match(/[^:]\w+\/[\w-+\d.]+(?=;|,)/)[0];
      const imageKey = `images/clients/${Date.now()}`;
      // Params to upload file
      const uploadParams = {
        Bucket: 'meb-images',
        Key: imageKey,
        Body: buffer,
        ContentEncoding: 'base64',
        ContentType: mimeType,
        ACL: 'public-read',
      };
      await s3Client.client.upload(uploadParams).promise();
      clientLogo = `https://meb-images.${process.env.SPACES_ENDPOINT}/${imageKey}`;
    } else if (logo) {
      clientLogo = logo;
    }

    const client = Client.build({
      name,
      nit,
      logo: clientLogo,
      // mebAdmin,
      // superAdminClient,
      // mebSuperAdmin,
    });
    await client.save();
    await new ClientCreatedPublisher(natsClient.client).publish({
      id: client.id,
      name: client.name,
      nit: client.nit,
      logo: client.logo,
      // mebAdmin: client.mebAdmin,
      // superAdminClient: client.superAdminClient,
      // mebSuperAdmin: client.mebSuperAdmin,
    });

    // const populatedClient = await Client.findById(client.id).populate([
    //   'meb_admin',
    //   'super_admin_client',
    // ]);

    res.status(201).send(client);
  }
);

export { router as newClientRouter };
