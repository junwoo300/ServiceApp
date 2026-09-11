const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb://127.0.0.1:27017/ServiceTeam';

const connectDB = async () => {
  await mongoose.connect(MONGODB_URI);
  console.log(`MongoDB connected: ${mongoose.connection.host}/${mongoose.connection.name}`);
};

module.exports = connectDB;