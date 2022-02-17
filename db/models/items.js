//Require Mongoose
var mongoose = require("mongoose");

//Define a schema
var Schema = mongoose.Schema;
const User = require('./users');
const validateRef = require("../../middleware/validateRef");

var ItemSchema = new Schema({
  name: {type: String, required: true},
  pricePerDay: {type: Number, min: 50, required: true},
  imageURL: String,
  ownerID: {type: String, required: true},
  location: {type: String, required: true},
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
