require('dotenv').config()

const path = require('path');
const favicon = require('serve-favicon');
const compress = require('compression');
const helmet = require('helmet');
const cors = require('cors');
const logger = require('./logger');

const feathers = require('@feathersjs/feathers');
const configuration = require('@feathersjs/configuration');
const express = require('@feathersjs/express');
const socketio = require('@feathersjs/socketio');

const middleware = require('./middleware');
const services = require('./services');
const appHooks = require('./app.hooks');
const channels = require('./channels');

// Load swagger definitions.
// We are using jsdoc to define swagger definitions inside js files.
// As soon as @swagger appears in comments in js files, this is taken as api documentation.
const swaggerJSDoc = require('swagger-jsdoc')
const swaggerDefinition = require('./swaggerDef')
const swaggerSpec = swaggerJSDoc(swaggerDefinition)

const app = express(feathers());

// Load app configuration
app.configure(configuration());
// Enable security, CORS, compression, favicon and body parsing
app.use(helmet());
app.use(cors());
app.use(compress());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(favicon(path.join(app.get('public'), 'favicon.ico')));
// Host the public folder
app.use('/', express.static(app.get('public')));
app.use('/system/readiness', (req,res) => res.sendStatus(200))
app.use('/system/liveliness', (req,res) => res.sendStatus(200))

// serve openApi definition under the route /docs in json format.
app.use('/docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
})


// Set up Plugins and providers
app.configure(express.rest());
app.configure(socketio());

// Configure other middleware (see `middleware/index.js`)
app.configure(middleware);

app.use((req, res, next) => {
  req.feathers.authToken = req.headers['x-auth-token'] 
  req.feathers.headers = req.headers 
  next()
})
// Set up our services (see `services/index.js`)
app.configure(services);
// Set up event channels (see channels.js)
app.configure(channels);

// Configure a middleware for 404s and the error handler
app.use(express.notFound());
app.use(express.errorHandler({ logger }));

app.hooks(appHooks);

module.exports = app;
