import express, { Request, Response } from 'express';
import { body } from 'express-validator';
/* Commons */
import {
  validateRequest,
  UserStatus,
  UserRole,
  BadRequestError,
} from '@movers/common';
/* Models */
import { User } from '../models/user';
/* Publishers */
import { UserCreatedPublisher } from '../events/publishers/user-created-publisher';
/* NATS Client */
import { natsClient } from '../nats';
/* S3 Client */
import { s3Client } from '../s3';
const router = express.Router();

router.post(
  '/api/users/admin/signup',
  [
    body('email').isEmail().withMessage('Email inválido'),
    body('firstName').not().isEmpty().withMessage('El nombre es requerido'),
    body('lastName').not().isEmpty().withMessage('El apellido es requerido'),
    body('documentType')
      .not()
      .isEmpty()
      .withMessage('El tipo de documento es requerido'),
    body('documentNumber')
      .not()
      .isEmpty()
      .withMessage('El número de documento es requerido'),
    body('phone')
      .not()
      .isEmpty()
      .withMessage('El número de documento es requerido'),
    body('role').not().isEmpty().withMessage('El rol es requerido'),
    body('password')
      .trim()
      .isLength({ min: 4, max: 20 })
      .withMessage('La contraseña debe de tener entre 4 y 20 caracteres'),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const {
      email,
      password,
      firstName,
      lastName,
      documentType,
      documentNumber,
      phone,
      photo,
    } = req.body;

    const role = req.body.role as UserRole;
    let userPhoto = '';

    // Validate existing email
    let existingUser = await User.findOne({ email });

    if (existingUser) {
      throw new BadRequestError('El correo se encuentra en uso');
    }
    // Validate existing phone
    existingUser = await User.findOne({ phone });

    if (existingUser) {
      throw new BadRequestError('El teléfono se encuentra en uso');
    }
    // Validate existing document number
    existingUser = await User.findOne({ documentNumber });

    if (existingUser) {
      throw new BadRequestError('El número de documento se encuentra en uso');
    }
    const activationCode = User.generateActivationCode();
    if (photo) {
      // Create Buffer
      const buffer = Buffer.from(
        photo.replace(/^data:image\/\w+;base64,/, ''),
        'base64'
      );
      // Get MimeType
      const mimeType = photo.match(/[^:]\w+\/[\w-+\d.]+(?=;|,)/)[0];
      const imageKey = `images/users/${Date.now()}`;
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
      userPhoto = `https://meb-images.${process.env.SPACES_ENDPOINT}/${imageKey}`;
    }
    const user = User.build({
      email,
      password,
      firstName,
      lastName,
      activationCode,
      documentType,
      documentNumber,
      phone,
      role,
      status: UserStatus.Unverified,
      photo: userPhoto,
    });

    await user.save();
    await new UserCreatedPublisher(natsClient.client).publish({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      version: user.version,
      activationCode: user.activationCode,
      client: '',
      office: '',
      photo: user.photo,
    });

    res.status(201).send(user);
  }
);

export default router;
