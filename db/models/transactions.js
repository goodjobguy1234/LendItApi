//Require Mongoose
var mongoose = require("mongoose");
const Borrow = require('./borrows');
const Item = require('./items')
const validateRef = require("../../middleware/validateRef");
const User = require('./users');
//Define a schema
var Schema = mongoose.Schema;

// var TransactionSchema = new Schema({
//     totalPrice: {type: Number, required: [true, 'Please Specify Total Price'], min: [50, 'Minimum Total Price is 50 Please given more price']},
//     returnStatus:{type: Boolean, default: false},
//     borrowID: {type: mongoose.Schema.Types.ObjectId, required: [true, 'Please Specify borrowID'], ref: 'Borrows'}
//   });

var TransactionSchema = new Schema({
  totalPrice: {type: Number, required: [true, 'Please Specify Total Price'], min: [50, 'Minimum Total Price is 50 Please given more price']},
  returnStatus:{type: Boolean, default: false},
  itemInfo: {
    name: {type: String, required: true},
    pricePerDay: {type: Number, min: [50, "Price must more than 50"], required: [true, "Please specify price"]},
    imageURL: String,
    location: {type: String, required: [true, "Please specify location"]},
    itemDescription: String,
  },
  borrowInfo: {
    borrowID: {
      type: mongoose.Schema.Types.ObjectId, 
      required: [true, "Please specify borrow id"],
      ref: 'Borrows',
      validate: {
        validator: function(value) {
          return validateRef(value, Borrow);
        },
        message: props => `borrow id:${props.value} is not exist`
      }
    },
    borrowerID: {type: String, required: [true, "Please specify borrower id"]},
    lenderID: {type: String, required: [true, "Please specify lender id"]},
    borrowDuration: {type: Number, required: [true, "Please specify borrow duration"], min: [1, "minimum borrow duration is 1"]}
  }
});

const TransactionModel = mongoose.model("Transactions", TransactionSchema, "transactions", { strict: true });


// TransactionSchema.path('borrowID').validate(function(value) {
//   return validateRef(value, Borrow);
// }, "Invalid borrow id");


module.exports = TransactionModel
