// models/User.js
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['farmer', 'buyer'], default: 'buyer' },
  location: { type: String },
  date: { type: Date, default: Date.now },
  cart: [
      {
          product: {
              type: mongoose.Schema.Types.ObjectId,
              ref: 'Product'
          },
          quantity: {
              type: Number,
              default: 1
          }
      }
  ]
});

module.exports = mongoose.model('User', UserSchema);