const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Borrow = require('../db/models/borrows');
const Item = require('../db/models/items');

const { body, validationResult, oneOf, check, param} = require('express-validator');
const {isUserExist} = require('../utility/util');

// borrower side 
// *** fin not test ***
router.get('/borrower', (req, res) => {
    isUserExist(req, res, () => {
        Borrow.find({borrowerID: req.query.userId}, (err, resultRes) => {
            if(err) return res.badreq({errors:err.errors, message: err.message, result: result});
            return res.success({message: `retrieve all user's borrower from ${req.query.userId} success`, result: resultRes});
        });
    });
});

//lenderSide fin for checking
router.get('/lender', (req, res) => {
    const userId = req.query.userId;
    isUserExist(req, res, () => {
        Borrow.find({lenderID: req.query.userId}, (err, resultRes) => {
            if(err) return res.badreq({errors:err.errors, message: err.message, result: result});
            return res.success({message: `retrieve all user's lenderID from ${req.query.userId} success`, result: resultRes});
        });
    });
});

//create borrow ** fin for checking
router.post('/create-borrow', (req, res) => {
    console.log(req.body.itemID)
    Item.findById({_id: req.body.itemID},(err, item) => {
        if(!item) return res.notfound({message: "item not found"});
        if(err) return res.badreq({errors:err.errors, meesage: err.meesage});
        console.log(item)
        if(item.ownerID == req.body.lenderID && item.avaliable == true) {
            const newBorrow = new Borrow({...req.body});
            newBorrow.save((err, resultRes) => {
                item.avaliable = false;
                item.save((err, result) => {
                    if(err) return res.internal({errors: err.errors, meesage: err.meesage});
                    return res.success({result: resultRes, message: "request borrow success"});
                });
            });
        } else if (item.ownerID != req.body.lenderID){
            return res.badreq({message: "the owner id different person"});
        } else {
            return res.badreq({message: "this item is not avaliable"});
        } 
    });
});

//lender accept for borrow 
router.put('', (req, res) => {

});





module.exports = router;