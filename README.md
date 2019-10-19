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
  transport: 'smtps://username:password@smtp-server.com',
  from: 'noreply@example.com',
  to: 'exapmle@example.com',
  viewPath: './views'
});

app.use('/mail', express.json());
app.post('/mail', endpoint);

app.listen(8080, function () {
  console.log('App listening on port 8080!');
});
```

## Deploy on Heroku

The button below will deploy this application to Heroku. You will be guided to fill in the configuration variables this application needs to function correctly.
[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy)

## License

MIT


