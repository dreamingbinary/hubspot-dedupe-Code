const { Schema, model } = require('mongoose');

const companySchema = new Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  properties: {
    type: Object
  },
});

const Company = model('companies', companySchema);

module.exports = Company;