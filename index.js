const fs = require('fs'),
      path = require('path'),
      express = require('express'),
      nodemailer = require('nodemailer'),
      cors = require('cors'),
      bodyParser = require('body-parser');
const { check, validationResult } = require('express-validator');

const port = process.env.PORT || 8080;

const app = express();
app.use(bodyParser.json());
app.use(cors({ origin: '*', optionsSuccessStatus: 200 }));

const transport = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT),
  secure: !!parseInt(process.env.SMTP_SECURE),
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

const from = process.env.FROM_EMAIL,
      to = process.env.TO_EMAIL;

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

  const mail = {
    from,
    to: 'v.wochnik@protonmail.com',
    subject: subject, // Subject line
    html: `<h1>${subject}</h1><p>${message}</p>`
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
