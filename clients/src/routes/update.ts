import express, { Request, Response } from 'express';
import { body } from 'express-validator';
/* Commons */
import {
  requireAuth,
  validateRequest,
  NotFoundError,
  BadRequestError,
} from '@movers/common';
/* Models */
import { Client } from '../models/client';
import { User } from '../models/user';
import { s3Client } from '../s3';

const router = express.Router();

router.put(
  '/api/clients/:id',
  requireAuth(),
  [
    body('name').not().isEmpty().withMessage('Name is required'),
    body('nit').not().isEmpty().withMessage('Nit is required'),
    body('logo').not().isEmpty().withMessage('Logo is required'),
    body('mebAdmin').not().isEmpty().withMessage('MEB admin is required'),
    body('superAdminClient')
      .not()
      .isEmpty()
      .withMessage('Super admin client is required'),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const client = await Client.findById(req.params.id);
    let clientLogo = '';
    if (!client) {
      throw new NotFoundError();
    }
    const { name, nit, logo, mebAdmin, superAdminClient } = req.body;

    const existingMebAdmin = await User.findById(mebAdmin);
    if (!existingMebAdmin) {
      throw new BadRequestError('El administrador Mejor en Bici no existe');
    }

    const existingSuperAdminClient = await User.findById(superAdminClient);
    if (!existingSuperAdminClient) {
      throw new BadRequestError('El super administrador del cliente no existe');
    }
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
    client.set({
      name,
      nit,
      logo: clientLogo,
      mebAdmin,
      superAdminClient,
    });

    await client.save();
    const populatedClient = await Client.findById(client.id).populate([
      'meb_admin',
      'super_admin_client',
    ]);
    res.send(populatedClient);
  }
);

export { router as updateClientRouter };
