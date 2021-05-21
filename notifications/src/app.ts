import express from 'express';

const app = express();

app.set('trust proxy', true);

/* k8s Liveness / Readiness probes */
app.get('/api/notifications/healthz', (req, res) => {
  res.status(200).send({
    message: `I'm just fine...`,
  });
});

export { app };
