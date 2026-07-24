require('module-alias/register');
require('dotenv').config({ path: '.env' });

const mongoose = require('mongoose');
const glob = require('glob');
const path = require('path');

// Node.js version check — require version 14 or greater
const [major, minor] = process.versions.node.split('.').map(parseFloat);
if (major < 14 || (major === 14 && minor <= 0)) {
  console.log('Please go to nodejs.org and download version 8 or greater. 👌\n ');
  process.exit();
}

// Connect to MongoDB
mongoose.set('strictQuery', false);
mongoose.connect(process.env.DATABASE);
mongoose.Promise = global.Promise;

mongoose.connection.on('error', (err) => {
  console.error('🚫 Error → : ' + err.message);
});

// Auto-load all Mongoose models
glob.sync('./models/**/*.js').forEach(function (file) {
  require(path.resolve(file));
});

const app = require('./app');

// Set port
const defaultPort = parseInt(process.env.PORT, 10) || 8181;
app.set('port', defaultPort);

// Start the server with fallback if the port is already in use
const startServer = (port) => {
  const server = app.listen(port, () => {
    console.log('Server running → On PORT : ' + server.address().port);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      const nextPort = port + 1;
      console.warn(`Port ${port} is already in use. Trying port ${nextPort} instead.`);
      startServer(nextPort);
    } else {
      console.error('Server failed to start:', err);
      process.exit(1);
    }
  });
};

startServer(defaultPort);
