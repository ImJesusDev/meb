import express from 'express';

const app = express();

app.set('trust proxy', true);

/* Not found error handler */
app.get('/', async (req, res) => {
  // var mail = {
  //   from: 'from@domain.com',
  //   to: 'to@domain.com',
  //   subject: 'Test',
  //   template: 'demo',
  //   context: {
  //     name: 'Jdiaz',
  //   },
  // };
  // await transporter.sendMail(mail);
  res.send('All good');
});

export { app };
