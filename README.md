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
## Configuration

The `mailEndpoint()` function expects a configuration object as its first argument. The following options are available:

### `transport`

The `transport` property can either be an object or a string which is passed down to the `createTransport` `nodemailer` function. Alternatively, you can provide a transport instance.

### `from`

The `from` property is an email address that is being used as the `From` email field. Some SMTPs expect a specific sender address, so be aware.

### `to`

The `to` property is an email address where all submissions are going to be sent to.

### `viewPath`

The `viewPath` property is a directory path pointing to a directory which contains the `html.dot` and `text.dot` doT.js templates.

## Deploy on Heroku

The button below will deploy this application to Heroku. You will be guided to fill in the configuration variables this application needs to function correctly. The deployed app exposes the `/mail` endpoint.
[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy)

## License

MIT


