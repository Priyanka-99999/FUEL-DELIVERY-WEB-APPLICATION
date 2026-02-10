const mongoose = require('mongoose');

const BunkSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  bunkName: { type: String, required: true },
  area: { type: String },
  address: { type: String },
  city: { type: String },
  pincode: { type: String },
  landmark: { type: String },
  mobile: { type: String },
  fuelType: { type: String, enum: ['Diesel', 'Petrol', 'Gas', 'PetrolandDiesel'] },
  fuelQuantity: { type: Number },
  latitude: { type: String },
  longitude: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Bunk', BunkSchema);
