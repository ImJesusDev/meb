import express from 'express';
import 'express-async-errors';
import { json } from 'body-parser';
import cookieSession from 'cookie-session';
const cors = require('cors');
/* Routers */
import { newCountryRouter } from './routes/new-country';
import { indexCountryRouter } from './routes/country-index';
import { newCityRouter } from './routes/new-city';
import { newGeometryRouter } from './routes/new-geometry';
/* Commons */
import { errorHandler, NotFoundError, currentUser } from '@movers/common';

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
app.use(cors(corsOptions));
app.use(json());
app.use(
  cookieSession({
    signed: false,
    secure: process.env.NODE_ENV !== 'test',
  })
);
/* Current */
app.use(currentUser);

/* New Country Route */
app.use(newCountryRouter);
/* List countries */
app.use(indexCountryRouter);
/* New City Route */
app.use(newCityRouter);
/* New Geometry Route */
app.use(newGeometryRouter);
/* k8s Liveness / Readiness probes */
app.get('/api/locations/healthz', (req, res) => {
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
