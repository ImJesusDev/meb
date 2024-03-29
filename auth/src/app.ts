import express from 'express';
import 'express-async-errors';
import path from 'path';
import fs from 'fs';
import { json } from 'body-parser';
import cookieSession from 'cookie-session';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec, cssOptions } from './docs/swagger-spec';
const cors = require('cors');
/* Specify directory with route files */
const routePath = path.join(__dirname, 'routes');
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

/* Docs */
app.use(
  '/api/users/docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, cssOptions)
);

/* Read all files from routePath to dynamically load routes */
fs.readdirSync(routePath).forEach(async (filename) => {
  // Get current file
  let route = path.join(routePath, filename);
  // Validate if it's a folder
  const isFolder = fs.lstatSync(route).isDirectory();
  // If it's not a folder, import and use route
  if (!isFolder) {
    try {
      // Import route
      const importedRoute = require(route);
      // Attach to app
      app.use(importedRoute.default);
    } catch (error) {
      console.log(error);
    }
  }
});

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
