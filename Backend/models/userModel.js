const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  name1: { type: String, required: true },
  mobile1: { type: String, required: true },
  city1: { type: String, required: true },
  address1: { type: String, required: true },
  locality1: { type: String, required: true },
});

module.exports = mongoose.model('User', userSchema);
