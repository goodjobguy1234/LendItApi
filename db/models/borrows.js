//Require Mongoose
var mongoose = require("mongoose");

//Define a schema
var Schema = mongoose.Schema;
const User = require('./users');
const Item = require('./items');
const validateRef = require("../../middleware/validateRef");

var BorrowSchema = new Schema({ 
    itemID: {type: mongoose.Schema.Types.ObjectId, required: [true, "Please specify item id"], ref: 'Items'},
    borrowerID: {type: String, required: [true, "Please specify borrower id"]},
    lenderID: {type: String, required: [true, "Please specify lender id"]},
    pendingStat: {type: Boolean, default: false},
    borrowDuration: {type: Number, required: [true, "Please specify borrow duration"], min: [1, "minimum borrow duration is 1"]}
  });

const BorrowModel = mongoose.model("Borrows", BorrowSchema, "borrows", { strict: true });

BorrowSchema.path('itemID').validate(function (value) {
  return validateRef(value, Item);
 }, "Invalid transaction id");

BorrowSchema.path('borrowerID').validate(function (value) {
  return User.findOne({id: value}).exec().then((value) => {
    if(!value) return false
    else return true
  })
}, '`{VALUE}` is not exist');

BorrowSchema.path('lenderID').validate(function (value) {
  return User.findOne({id: value}).exec().then((value) => {
    if(!value) return false
    else return true
  })
}, '`{VALUE}` is not exist');

module.exports = BorrowModel;
