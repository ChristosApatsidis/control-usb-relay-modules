const mongoose = require('mongoose');

// Database uri
const mongo_uri = process.env.MONGO_URI;

mongoose.connect(mongo_uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

mongoose.connection.on('error', err => {
  console.log('Database connection error')
});

mongoose.connection.on('connected', () => {
  console.log('Connected to database')
});

mongoose.connection.on('disconnected', () => {
  console.log('Disconnected from mongo server')
});

mongoose.connection.on('reconnect', () => {
  console.log('Reconnect to mongo server')
});