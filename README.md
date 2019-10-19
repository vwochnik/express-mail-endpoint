# express-mail-endpoint

> A simple mail endpoint for your express.js app

## Installation

```sh
npm i express-mail-endpoint -S
```

## Usage

```js
const express = require('express'),
      mailEndpoint = require('express-mail-endpoint');

const app = express();

const endpoint = mailEndpoint({
  smtp: 'smtps://username:password@smtp-server.com',
  from: 'noreply@example.com',
  to: 'exapmle@example.com',
  viewPath: './views'
});

endpoint.verify(function(err) {
  if (err) {
    process.stdout.write("Could not verify SMTP server.\n");
    process.exit(1);
  }
});

app.use('/mail', express.json());
app.post('/mail', endpoint);

app.listen(8080, function () {
  console.log('App listening on port 8080!');
});
```

# License

MIT


