const mongoose = require('mongoose');

const DB_NAME = 'db__cline';
const DB_HOST = process.env.MONGO_HOST || 'localhost';
const DB_PORT = process.env.MONGO_PORT || 27017;
const DB_USER = process.env.MONGO_USER;
const DB_PASS = process.env.MONGO_PASS;

const getMongoUri = () => {
  if (process.env.MONGO_URI) return process.env.MONGO_URI;
  
  let uri = 'mongodb://';
  if (DB_USER && DB_PASS) {
    uri += `${encodeURIComponent(DB_USER)}:${encodeURIComponent(DB_PASS)}@`;
  }
  uri += `${DB_HOST}:${DB_PORT}/${DB_NAME}`;
  
  return uri;
};

const connectWithRetry = () => {
  const options = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 30000
  };

  mongoose.connect(getMongoUri(), options)
    .then(() => console.log('MongoDB connection established'))
    .catch(err => {
      console.error('MongoDB connection error:', err);
      console.log('Retrying connection in 5 seconds...');
      setTimeout(connectWithRetry, 5000);
    });
};

mongoose.connection.on('error', err => {
  console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
});

module.exports = {
  url: getMongoUri(),
  connect: connectWithRetry
};
