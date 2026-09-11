const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const pmaSchema = new Schema({
  nupma: String,
  codepma: String,
  name: String,
  startdate: Date,
  warranty: String,
  enddate: Date,
  status: String,
  lease: String,
  document: String,
  sla: String,
  note: String,
  
});

module.exports = mongoose.model('Pma', pmaSchema);
