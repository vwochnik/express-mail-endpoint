const nodemailer = require('nodemailer'),
      dns = require('dns'),
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

const defaults = {
	transport: {},
	viewPath: '.',
	from: 'example@example.com',
	to: 'example@example.com',
}

const schema = Joi.object({
    name: Joi.string().min(5).max(30).required(),
    email: Joi.string().email({ minDomainSegments: 2 }).required(),
    subject: Joi.string().min(5).max(60).required(),
    message: Joi.string().min(5).required()
}).strict();

function mailEndpoint(options = {}) {
	options = { ...defaults, ...options };
  const transport = (typeof options.transport.sendMail === "function")
    ? options.transport
    : nodemailer.createTransport(options.transport);

	const dots = dot.process({ path: options.viewPath });

	return function(req, res) {
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
        from: options.from,
        to: options.to,
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
	};
}

module.exports = mailEndpoint;