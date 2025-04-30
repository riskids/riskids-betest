const mongoose = require('mongoose');

const accountLoginSchema = new mongoose.Schema({
  accountId: { type: String, required: true, unique: true },
  userName: { type: String, required: true },
  password: { type: String, required: true },
  lastLoginDateTime: { type: Date, required: true, default: Date.now },
  userId: { type: String, required: true, ref: 'User' }
});

accountLoginSchema.index({ userId: 1 });
accountLoginSchema.index({ lastLoginDateTime: 1 });

module.exports = mongoose.model('AccountLogin', accountLoginSchema);
