import express from 'express';
import 'express-async-errors';
import { json } from 'body-parser';
import cookieSession from 'cookie-session';
const cors = require('cors');
/* Commons */
import { errorHandler, NotFoundError, currentUser } from '@movers/common';
/* Routers */
import { newClientRouter } from './routes/new';
import { showClientRouter } from './routes/show';
import { deleteClientRouter } from './routes/delete';
import { indexClientRouter } from './routes/index';
import { updateClientRouter } from './routes/update';
import { addOfficeRouter } from './routes/new-office';
import { updateOfficeRouter } from './routes/update-office';
import { deleteOfficeRouter } from './routes/delete-office';
import { availableResourcesRouter } from './routes/available-resources';
import { disableClientsRouter } from './routes/archive-clients';
import { disableOfficesRouter } from './routes/archive-offices';
import { enableClientsRouter } from './routes/enable-clients';
import { enableOfficesRouter } from './routes/enable-offices';
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
app.use(json({ limit: '2mb' }));
app.use(
  cookieSession({
    signed: false,
    secure: process.env.NODE_ENV !== 'test',
  })
);
app.use(currentUser);
/* New Client */
app.use(newClientRouter);
/* List Clients */
app.use(indexClientRouter);
/* Update Client */
app.use(updateClientRouter);
/* Available Resources */
app.use(availableResourcesRouter);
/* Add office */
app.use(addOfficeRouter);
app.use(updateOfficeRouter);
app.use(disableClientsRouter);
app.use(disableOfficesRouter);
app.use(enableClientsRouter);
app.use(enableOfficesRouter);
/* k8s Liveness / Readiness probes */
app.get('/api/clients/healthz', (req, res) => {
  res.status(200).send({
    message: `I'm just fine...`,
  });
});
/* Show Client */
app.use(showClientRouter);
/* Delete Client */
app.use(deleteClientRouter);
/* Delete Office */
app.use(deleteOfficeRouter);
/* Not found error handler */
app.get('*', async () => {
  throw new NotFoundError();
});
/* Error handler middleware */
app.use(errorHandler);

export { app };
