const dbConfig = require("../config/db.js");

const mongoose = require("mongoose");
mongoose.Promise = global.Promise;

const db = {};
db.mongoose = mongoose;
db.url = dbConfig.url;
db.user = require("./User.js")(mongoose);
db.accountLogin = require("./AccountLogin.js")(mongoose);

module.exports = db;
