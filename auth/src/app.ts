import express from 'express';
import 'express-async-errors';
import { json } from 'body-parser';
import cookieSession from 'cookie-session';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec, cssOptions } from './docs/swagger-spec';
const cors = require('cors');
/* Routers */
import { currentUserRouter } from './routes/current-user';
import { signinRouter } from './routes/signin';
import { signoutRouter } from './routes/signout';
import { signupRouter } from './routes/signup';
import { adminSignupRouter } from './routes/admin-signup';
import { updateUserRouter } from './routes/update';
import { activateUserRouter } from './routes/activate';
import { passwordResetRouter } from './routes/password-reset';
import { updatePasswordRouter } from './routes/update-password';
import { indexUserRouter } from './routes/index';

/* Commons */
import { errorHandler, NotFoundError } from '@movers/common';

/* Cors configuration */
const corsOptions = {
  origin: ['https://meb-admin.moversapp.co', 'https://admin.meb.dev:4200'],
  methods: ['GET', 'PUT', 'POST', 'DELETE', 'OPTIONS'],
  preflightContinue: false,
  credentials: true,
  optionsSuccessStatus: 204,
  allowedHeaders: [
    'Access-Control-Allow-Headers,X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept',
  ],
};

const app = express();
app.set('trust proxy', true);
app.use(json());
app.use(cors(corsOptions));
app.use(
  cookieSession({
    signed: false,
    secure: process.env.NODE_ENV !== 'test',
    // domain: '.meb.dev',
    domain: '.moversapp.co',
    httpOnly: false,
  })
);

/* Docs */
app.use(
  '/api/users/docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, cssOptions)
);
/* Current User */
app.use(currentUserRouter);
/* Login User */
app.use(signinRouter);
/* List Users */
app.use(indexUserRouter);
/* Password Reset */
app.use(passwordResetRouter);
/* Password Change */
app.use(updatePasswordRouter);
/* Log out User */
app.use(signoutRouter);
/* Register User */
app.use(signupRouter);
/* Register Admin */
app.use(adminSignupRouter);
/* Update User */
app.use(updateUserRouter);
/* Activate User */
app.use(activateUserRouter);
/* k8s Liveness / Readiness probes */
app.get('/api/users/healthz', (req, res) => {
  res.status(200).send({
    message: `I'm just fine...`,
  });
});
/* Not found error handler */
app.get('*', async () => {
  throw new NotFoundError();
});
/* Error handler middleware */
app.use(errorHandler);

export { app };
