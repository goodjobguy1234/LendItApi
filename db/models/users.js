//Require Mongoose
var mongoose = require("mongoose");

//Define a schema
var Schema = mongoose.Schema;

var UserSchema = new Schema({
  id: {type: String, required: true, unique: true},
  firstname: {type: String, required: true},
  lastname: {type: String, required: true},
  email: {type: String, default: ""},
  phoneNumber: {type: String, required: true},
  dormLocation: {type: String, required: true},
  imageURL: {type: String, default: null},
  password: {type: String, required: true}
});

//Export function to create "CustomerSchema" model class

module.exports = mongoose.model("Users", UserSchema, "users", { strict: true });
