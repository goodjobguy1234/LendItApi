//Require Mongoose
var mongoose = require("mongoose");

//Define a schema
var Schema = mongoose.Schema;

var UserSchema = new Schema({
  id: {type: String, required: [true, "Please specify student id"], unique: [true, "This user is already exist"]},
  firstname: {type: String, required: [true, "Please specify firstname"]},
  lastname: {type: String, required: [true, "Please specify lastname"]},
  email: {type: String, default: ""},
  phoneNumber: {type: String, required: [true, "Please specify phone number"]},
  dormLocation: {type: String, required: [true, "Please specify your dorm location"]},
  imageURL: {type: String, default: ""},
  password: {type: String, required: [true, "Please specify password"]}
});

//Export function to create "CustomerSchema" model class

module.exports = mongoose.model("Users", UserSchema, "users", { strict: true });
