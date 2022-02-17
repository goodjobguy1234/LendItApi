const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
var Transaction = require('../db/models/transactions');
const { body, validationResult, oneOf, check, param} = require('express-validator');
require('../utility/util');
//create transaction
router.post('/', (req,res) => {
    console.log('from /')
    const body = req.body;
    const newTransaction = new Transaction({...(body)});
    newTransaction.save((err, result) => {
        if(err) {
            return res.badreq({errors: err.errors, result: result, message: err.message})
        }
        return res.success({errors:err, result: result, message: "create transaction successful"});
    })
});

// get transaction of that user
router.get('/:userId', async (req, res) => {
    
    const lenderRole = await Transaction.find({lenderID: req.params.userId}).exec().then((value) => {
        return value
    }).catch(err => res.internal({errors: err, message: "something went wrong"}))

    const borrowRole = await Transaction.find({borrowID: req.params.userId}).exec().then(value => value).catch((err) => res.internal({errors: err, message: "something went wrong"}));

    const result = [
        ...lenderRole,
        ...borrowRole
    ]
    return res.success({result: result, message: `retrieve ${req.params.userId} all transaction successful`})
});

//update transaction status to complete




module.exports = router;