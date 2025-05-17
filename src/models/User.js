const mongoose = require('mongoose');

const { v4: uuidv4 } = require('uuid');

const userSchema = new mongoose.Schema({
  userId: { 
    type: String, 
    required: true, 
    unique: true,
    default: () => uuidv4()
  },
  fullName: { type: String, required: true },
  accountNumber: { type: String, required: true, unique: true },
  emailAddress: { type: String, required: true, unique: true },
  registrationNumber: { type: String, required: true, unique: true }
});

userSchema.index({ accountNumber: 1 });
userSchema.index({ registrationNumber: 1 });

module.exports = mongoose.model('User', userSchema);
