require('dotenv').config();
require('./config/database');
const path = require('path');
const fs = require('fs');
const http = require('http');
const https = require('https');
const colors = require('colors');
const helmet = require("helmet");
const express = require('express');
const app = express();

const key = fs.readFileSync(__dirname + '/config/ssl/server.key');
const cert = fs.readFileSync(__dirname + '/config/ssl/server.cert');
const ssloptions = { key, cert };

const port = process.env.PORT;
const routes = require('./routes');

const httpServer = http.createServer(app);
const httpsServer = https.createServer(ssloptions, app);

// Allow the app accepts incoming json request
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Helmet setting various HTTP headers
app.use(helmet.hidePoweredBy());
app.use(helmet.dnsPrefetchControl());
app.use(helmet.expectCt());
app.use(helmet.frameguard());
app.use(helmet.hsts());
app.use(helmet.ieNoOpen());
app.use(helmet.noSniff());
app.use(helmet.permittedCrossDomainPolicies());
app.use(helmet.referrerPolicy());
app.use(helmet.xssFilter());
// Static files folder
app.use(express.static(path.resolve(process.cwd(), 'build')));

// Routes
app.use('/', routes);

httpServer.listen(port, "0.0.0.0", () => {
  console.log("Controll USB Relay modules".green);
  console.log("github.com/ChristosApatsidis".green);
  console.log(`App listening on port ${port}`.green);
});

httpsServer.listen(443, () => {
  console.log(`App listening on port 443`.green);
});
