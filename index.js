const express = require('express'),
      cors = require('cors'),
      rateLimit = require('express-rate-limit');
      mailEndpoint = require('./lib');

const smtp = process.env.SMTP,
      from = process.env.FROM_EMAIL,
      to = process.env.TO_EMAIL,
      origins = process.env.CORS.split(/,\s*/);
      port = process.env.PORT || 8080;

const app = express();
app.use(cors({
  origin: (origin, callback) => {
    if (origins.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  optionsSuccessStatus: 200
}));

const endpoint = mailEndpoint({ smtp, from, to, viewPath: './views' });

endpoint.verify(function(err) {
  if (err) {
    process.stdout.write("Could not verify SMTP server.\n");
    process.exit(1);
  }
});

app.use('/mail', express.json());
app.use('/mail', rateLimit({ windowMs: 3600000, max: 5, message: { error: 'Too many requests.' } }));
app.post('/mail', endpoint);

app.listen(port, function () {
  console.log('App listening on port 8080!');
});
