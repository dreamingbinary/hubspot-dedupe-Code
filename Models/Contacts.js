const { Schema, model } = require('mongoose');

const contactSchema = new Schema({
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

const Contact = model('contacts', contactSchema);

module.exports = Contact;