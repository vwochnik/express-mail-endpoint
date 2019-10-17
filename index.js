const fs = require('fs'),
      path = require('path'),
      express = require('express'),
      nodemailer = require('nodemailer'),
      cors = require('cors'),
      bodyParser = require('body-parser'),
      rateLimit = require('express-rate-limit');
      dot = require('dot');
const { check, validationResult } = require('express-validator');

const html = (s) => '<p>' + s.replace(/\n{2,}/g, "</p><p>").replace(/\n/g, "<br>") + '</p>';

const from = process.env.FROM_EMAIL,
      to = process.env.TO_EMAIL,
      port = process.env.PORT || 8080;

const transport = nodemailer.createTransport(process.env.SMTP);
const dots = dot.process({ path: "./views"});

const app = express();
app.use(bodyParser.json());
app.use(cors({ origin: process.env.CORS_ORIGIN, optionsSuccessStatus: 200 }));

transport.verify(function(err) {
  if (err) {
    process.stdout.write("Could not verify SMTP server.\n");
    process.exit(1);
  }
});

app.use('/mail', rateLimit({ windowMs: 3600000, max: 5, message: { errors: ['Too many requests.'] } }));
app.post('/mail', [
  check('name').isLength({ min: 5 }),
  check('email').isEmail(),
  check('message').isLength({ min: 10 })
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array().map(e => `${e.msg} for ${e.param}`) });
  }

  const { name, email, subject, message } = req.body;
  const sent = (new Date()).toGMTString();

  const mail = {
    from, to,
    replyTo: email,
    subject: subject,
    text: dots.text({ name, email, subject, message: message, sent }),
    html: dots.html({ name, email, subject, message: html(message), sent })
  };

  transport.sendMail(mail, function(err, info) {
    if (err) {
      return res.status(500).json({ errors: [err.response] });
    }

    res.json({ success: true });
  });
});

app.listen(port, function () {
  console.log('App listening on port 8080!');
});
