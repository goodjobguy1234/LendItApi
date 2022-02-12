//Require Mongoose
var mongoose = require("mongoose");

//Define a schema
var Schema = mongoose.Schema;

var ItemSchema = new Schema({
  "name": String,
  "price/day": {type: Number, min: 50},
  "imageURL": String,
  "ownerID": String,
  "location": String,
  "itemDesciption": String
});

//Export function to create "CustomerSchema" model class
module.exports = mongoose.model("Items", ItemSchema);
