const fs = require('fs'),
      path = require('path'),
      express = require('express'),
      nodemailer = require('nodemailer'),
      dns = require('dns'),
      cors = require('cors'),
      bodyParser = require('body-parser'),
      rateLimit = require('express-rate-limit');
      Joi = require('@hapi/joi'),
      dot = require('dot');

const html = (s) => '<p>' + s.replace(/\n{2,}/g, "</p><p>").replace(/\n/g, "<br>") + '</p>';
const ipaddr = (req) => {
  const forwarded = req.headers["x-forwarded-for"];
  if (forwarded) {
    return forwarded.split(/,\s*/).pop();
  } else {
    return req.connection.remoteAddress;
  }
};

const from = process.env.FROM_EMAIL,
      to = process.env.TO_EMAIL,
      origins = process.env.CORS.split(/,\s*/);
      port = process.env.PORT || 8080;

const transport = nodemailer.createTransport(process.env.SMTP);
const dots = dot.process({ path: "./views"});

const app = express();
app.use(bodyParser.json());
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

transport.verify(function(err) {
  if (err) {
    process.stdout.write("Could not verify SMTP server.\n");
    process.exit(1);
  }
});

const schema = Joi.object({
    name: Joi.string().min(5).max(30).required(),
    email: Joi.string().email({ minDomainSegments: 2 }).required(),
    subject: Joi.string().min(5).max(60).required(),
    message: Joi.string().min(5).required()
}).strict();

app.use('/mail', rateLimit({ windowMs: 3600000, max: 5, message: { errors: ['Too many requests.'] } }));
app.post('/mail', (req, res) => {
  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(500).json({ error: error.details[0].message + '.' });
  }

  const { name, email, subject, message } = req.body;
  const date = (new Date()).toGMTString();
  const agent = req.headers['user-agent'];
  const ip = ipaddr(req);

  const [, host] = email.split('@');

  dns.resolveMx(host, (err, mx) => {
    if ((err) || (!mx) || (!mx.some(x => (!!x.exchange)))) {
      return res.status(500).json({ error: '"email" must be a valid email.' });
    }

    const mail = {
      from, to,
      replyTo: email,
      subject: subject,
      text: dots.text({ name, email, subject, message: message, date, agent, ip }),
      html: dots.html({ name, email, subject, message: html(message), date, agent, ip })
    };

    transport.sendMail(mail, (err, info) => {
      if (err) {
        return res.status(500).json({ error: err.response });
      }

      res.json({ success: true });
    });
  });
});

app.listen(port, function () {
  console.log('App listening on port 8080!');
});
