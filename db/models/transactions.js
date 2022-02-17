//Require Mongoose
var mongoose = require("mongoose");
const Borrow = require('./borrows');
const Item = require('./items')
const validateRef = require("../../middleware/validateRef");
const User = require('./users');
//Define a schema
var Schema = mongoose.Schema;

var TransactionSchema = new Schema({
    borrowID: {type: String, required: true},
    lenderID: {type: String, required: true},
    totalPrice: {type: Number, required: true, min: 50},
    pending:{type: Boolean, default: false},
    borrowedDuration: {type: Number, required: true},
    itemID: {type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Items'}
  });

const TransactionModel = mongoose.model("Transactions", TransactionSchema, "transactions", { strict: true });

TransactionSchema.path('itemID').validate(function (value) {
 return validateRef(value, Item);
}, "Invalid transaction id");

TransactionSchema.path('borrowID').validate(function (value) {
  return User.findOne({id: value}).exec().then((value) => {
    if(!value) return false
    else return true
  })
}, '`{VALUE}` is not exist');

TransactionSchema.path('lenderID').validate(function (value) {
  return User.findOne({id: value}).exec().then((value) => {
    if(!value) return false
    else return true
  })
}, '`{VALUE}` is not exist');

module.exports = TransactionModel
