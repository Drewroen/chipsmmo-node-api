import * as express from 'express';
import * as dotenv from 'dotenv';

const app = express()
    .use('/account', require('./routes/account'));

const http = require('http');
const https = require('https');
const fs = require('fs');

dotenv.config();

const server = process.env.environment === 'dev' ?
  http.createServer(app) :
  https.createServer({
    key: fs.readFileSync('/etc/letsencrypt/live/api.chipsmmo.cc/privkey.pem'),
    cert: fs.readFileSync('/etc/letsencrypt/live/api.chipsmmo.cc/fullchain.pem')
  }, app);

const port = process.env.environment === 'dev' ?
  (process.env.PORT || 5000) : 443;

server.listen(port, () => console.log(`Listening on port ${port}. Environment is set to ${process.env.ENVIRONMENT}`));