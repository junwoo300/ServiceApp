const mongoose = require('mongoose');

const billforpmSchema = new mongoose.Schema({
  name: String,
  status: String,
  link1: String,
  link2: String,
  link3: String
}, { timestamps: true });

module.exports = mongoose.model('Billforpm', billforpmSchema);
