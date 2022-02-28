//Require Mongoose
var mongoose = require("mongoose");

//Define a schema
var Schema = mongoose.Schema;
const User = require('./users');
const validateRef = require("../../middleware/validateRef");

var ItemSchema = new Schema({
  name: {type: String, required: [true, "Please specify item name"]},
  pricePerDay: {type: Number, min: [50, "Price must more than 50"], required: [true, "Please specify price"]},
  imageURL: String,
  ownerID: {type: String, required: [true, "Please specify owner id"]},
  location: {type: String, required: [true, "Please specify location"]},
  itemDesciption: String,
  avaliable: {type: Boolean, default: true}
});

const ItemModel = mongoose.model("Items", ItemSchema, "items", { strict: true });

ItemSchema.path('ownerID').validate(function (value) {
  return User.findOne({id: value}).exec().then((value) => {
    if(!value) return false
    else return true
  })
}, '`{VALUE}` is not exist');

module.exports = ItemModel;
