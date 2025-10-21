// const mongoose = require('mongoose');

// const doctorSchema = mongoose.Schema({
//   name: {
//     type: String,
//     required: true
//   },
//   email: {
//     type: String,
//     required: true,
//     unique: true
//   },
//   password: {
//     type: String,
//     required: true
//   },
//   number: {
//     type: String,
//     required: true
//   },
//   gender: {
//     type: String,
//     required: true
//   },
//   qua: {
//     type: String,
//     required: true
//   },
//   exp: {
//     type: String,
//     required: true
//   },
//   spe: {
//     type: String,
//     required: true
//   },
//   address: {
//     type: String,
//     required: true
//   }
// }, {
//   timestamps: true
// });

// const doctorModel = mongoose.model('doctor', doctorSchema);

// module.exports = doctorModel;

// models/Doctor.js


const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  number: { type: String, required: true },
  gender: { type: String, required: true },
  qua: { type: String, required: true }, // qualification
  exp: { type: String, required: true }, // experience
  spe: { type: String, required: true }, // specialization
  address: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Doctor', doctorSchema);
