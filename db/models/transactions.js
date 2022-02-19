//Require Mongoose
var mongoose = require("mongoose");
const Borrow = require('./borrows');
const Item = require('./items')
const validateRef = require("../../middleware/validateRef");
const User = require('./users');
//Define a schema
var Schema = mongoose.Schema;

var TransactionSchema = new Schema({
    totalPrice: {type: Number, required: [true, 'Please Specify Total Price'], min: [50, 'Minimum Total Price is 50 Please given more price']},
    returnStatus:{type: Boolean, default: false},
    borrowID: {type: mongoose.Schema.Types.ObjectId, required: [true, 'Please Specify borrowID'], ref: 'Borrows'}
  });

const TransactionModel = mongoose.model("Transactions", TransactionSchema, "transactions", { strict: true });


TransactionSchema.path('borrowID').validate(function(value) {
  return validateRef(value, Borrow);
}, "Invalid borrow id");


module.exports = TransactionModel
