const mongoose = require('mongoose');

const draftEmailSchema = new mongoose.Schema({
  siteName: {
    type: String,
    required: true
  },
  recipientEmails: {
    type: [String],
    required: true
  },
  ccEmails: {
    type: [String],
    default: []
  },
  subjectTemplate: {
    type: String,
    required: true
  },
  messageTemplate: {
    type: String,
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('DraftEmail', draftEmailSchema);
