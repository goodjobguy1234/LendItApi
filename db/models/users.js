//Require Mongoose
var mongoose = require("mongoose");

//Define a schema
var Schema = mongoose.Schema;

var UserSchema = new Schema({
  id: String,
  firstname: String,
  lastname: String,
  email: String,
  phoneNumber: String,
  dormLocation: String,
  imageURL: String
});

//Export function to create "CustomerSchema" model class
module.exports = mongoose.model("Users", UserSchema);
