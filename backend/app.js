const express = require('express');
const helmet = require('helmet');
const path = require('path');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');

const helpers = require('./utils/helpers');
const { isValidToken } = require('./controllers/coreControllers/authJwtController');
const { isValidSignature } = require('./controllers/coreControllers/authJwtController');
const errorHandlers = require('./handlers/errorHandlers');

const coreAuthRouter = require('./routes/coreRoutes/coreAuth');
const erpApiRouter = require('./routes/appRoutes/appApi');
const publicProjectRoutes = require('./routes/publicRoutes/projectRoutes');
const reportRoutes = require('./routes/reportRoutes');
const serviceProviderRequirementController = require('./controllers/appControllers/serviceProviderRequirementController');
// Register RequirementTemplate model so mongoose.model() calls resolve correctly
require('./models/appModels/RequirementTemplate');

const app = express();

// CORS — allow local dev frontend and any configured backend origin
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'http://localhost:8282',
    process.env.FRONTEND_URL,
  ].filter(Boolean),
  allowedHeaders: 'Content-Type, Authorization',
  credentials: true,
};

app.use(function (req, res, next) {
  if (req.headers.origin && req.headers.origin.includes('localhost')) {
    cors(corsOptions)(req, res, next);
  } else {
    cors()(req, res, next);
  }
});

// Security headers
app.use(helmet());

// Cookie parser
app.use(cookieParser());

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json({ limit: '5mb' }));
app.use(bodyParser.urlencoded({ limit: '5mb', extended: true }));

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// Attach helpers and request metadata to response locals
app.use((req, res, next) => {
  res.locals.h = helpers;
  res.locals.user = req.user || null;
  res.locals.currentPath = req.path;
  next();
});

// ─── Routes ───────────────────────────────────────────────────────────────────

// Public routes — no auth required
app.use('/api/public', publicProjectRoutes);
app.post('/api/serviceprovider-requirement/login', serviceProviderRequirementController.login);

// Core auth routes — signature check only (login)
app.use('/api', isValidSignature, coreAuthRouter);

// App routes — signature + JWT required
app.use('/api', isValidSignature, isValidToken, erpApiRouter);

// Report routes
app.use('/api/reports', isValidSignature, isValidToken, reportRoutes);

// ─── Error Handlers ───────────────────────────────────────────────────────────

// Global error handler
app.use((err, req, res, next) => {
  console.error('An error occurred:', err);
  res.status(500).json({ error: 'Internal Server Error' });
});

if (app.get('env') === 'development') {
  app.use(errorHandlers.developmentErrors);
}

app.use(errorHandlers.productionErrors);

module.exports = app;
