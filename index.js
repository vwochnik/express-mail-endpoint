const fs = require('fs'),
      path = require('path'),
      express = require('express'),
      cors = require('cors'),
      bodyParser = require('body-parser');

const schemas = [
  { id: 'product-list', name: 'Product List'},
  { id: 'recommendations', name: 'Recommendations'}
];

const port = process.env.PORT || 8080;

const app = express();
app.use(bodyParser());

app.use(cors({
  origin: '*',
  optionsSuccessStatus: 200
}));

app.get('/schema/', (req, res) => {
  return res.json(schemas);
});

app.get('/schema/:name', (req, res) => {
  const schemaName = req.params.name,
        fileName = path.join('schema', `${schemaName}.json`);

  if (!fs.existsSync(fileName)) {
    return res.status(404).send('Not found');
  }

  const obj = JSON.parse(fs.readFileSync(fileName, 'utf8'));
  return res.json(obj);
});

app.post('/output/', (req, res) => {
  const config = req.body;

  const out = Object.keys(config.Endpoints)
    .map(endpoint => {
      return {
        Endpoint: endpoint,
        Fields: JSON.parse(fs.readFileSync('output.json', 'utf8'))
      };
    });

  return res.json(out);
});

app.listen(port, function () {
  console.log('App listening on port 8080!');
});
