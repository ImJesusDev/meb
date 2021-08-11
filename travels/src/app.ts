import express from 'express';
import 'express-async-errors';
import { json } from 'body-parser';
import cookieSession from 'cookie-session';
import { newTravelRouter } from './routes/new-travel';

const cors = require('cors');

/* Commons */
import { errorHandler, NotFoundError } from '@movers/common';

/* Cors configuration */
const corsOptions = {
  origin: [
    'https://meb-admin.moversapp.co',
    'https://admin.meb.dev:4200',
    'https://meb-admin-demo.moversapp.co:4200',
  ],
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
app.use(json({ limit: '2mb' }));
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

app.use(newTravelRouter);

/* k8s Liveness / Readiness probes */
app.get('/api/travels/healthz', (req, res) => {
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
