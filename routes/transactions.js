const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
var Transaction = require('../db/models/transactions');
const { body, validationResult, oneOf, check, param} = require('express-validator');
require('../utility/util');
const { isUserExist } = require("../utility/util");
var Item = require('../db/models/items');

/**
 * @swagger
 * components:
 *  schemas:
 *      Transaction:
 *          type: object
 *          required:
 *              - borrowID
 *              - totalPrice
 *          properties:
 *              borrowID:
 *                  type: string
 *                  description: id to reference to borrow
 *              totalPrice:
 *                  type: integer
 *                  description: total price calculate from duration and price per day
 *              returnStatus:
 *                  type: boolean
 *                  description: borrower returning item status false mean not return yet

 *          example:
 *              borrowID: 6211146f0a7700f3a751db18
 *              totalPrice: 200
 *              
 */

/**
 * @swagger
 * tags:
 *  name: Transactions
 *  desciption: transaction api mostly called after borrow success
 */

/**
 * @swagger
 * /transactions:
 *  post:
 *      summary: create Transaction
 *      description: after lender accept borrow request please fire this api
 *      tags: [Transactions]
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      $ref: '#/components/schemas/Transaction'
 *      responses:
 *          200:
 *              description: create borrow success
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              result:
 *                                  $ref: '#/components/schemas/Transaction'
 *                              code:
 *                                  type: integer  
 *                              message:
 *                                  type: string
 */
router.post('/', (req,res) => {
    const body = req.body;
    const newTransaction = new Transaction({...(body)});
    newTransaction.save((err, result) => {
        if(err) {
            return res.badreq({errors: err.errors, result: result, message: err.message})
        }
        return res.success({errors:err, result: result, message: "create transaction successful"});
    })
});


/**
 * @swagger
 * /transactions/{userId}:
 *   get:
 *     summary: get all transaction or get current user transaction
 *     tags: [Transactions]
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *         required: false
 *         description: The user's student id
 *     responses:
 *       200:
 *         description: all transaction or all user transaction retrieve
 *         content:
 *           application/json:
 *             schema:
 *                 type: object
 *                 properties:
 *                    result:
 *                        type: array
 *                        items:
 *                          $ref: '#/components/schemas/Transaction'
 *                    code:
 *                        type: integer
 *                    message:
 *                        type: string  
 *       400:
 *         description: error from bad request
 */
// get transaction of that user
router.get('/:userId?', (req, res) => {
    if(req.params.userId !== undefined) {
        isUserExist(req, res, () => {
            Transaction.find({}).populate({
                path: 'borrowID',
                model: "Borrows",
                match: {$or: [{borrowerID: req.params.userId}, {lenderID: req.params.userId}]},
            }).then(value => {  
                const result = value.filter(borrow => {
                    return borrow.borrowID !== null
                })

                const endResult = result.map(doc => {
                    return {
                        _id: doc._id,
                        totalPrice: doc.totalPrice,
                        returnStatus: doc.returnStatus,
                        borrowID: doc.borrowID._id
                    }
                })
                res.success({result: endResult, message: "retrieve users transaction"});
            })
        });
    } else {
        Transaction.find().exec((err, resultRes) => {
            if(err) return res.internal({errors:err.errors, message: err.message});
            return res.success({result: resultRes, message: "retrieve all users transactions"});
        })
    }
    
});


/**
 * @swagger
 * /transactions/{id}:
 *   patch:
 *     summary: update transaction return status
 *     tags: [Transactions]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: transaction id
 *     responses:
 *       200:
 *         description: Trabsaction is complete, user have return the item 
 *       400:
 *         description: error from bad request
 *       404:
 *         description: Transaction is not found
 */

//update transaction status to complete
// after user return and that lender accept
router.patch('/:id', (req,res) => {
    Transaction.findByIdAndUpdate(req.params.id, {returnStatus: true}, {new: true}, (err, doc) => {
        if(!doc) return res.notfound({message: "Transaction is not found"});
        if(err) return res.badreq({errors:err.errors, message: err.message});

        Item.findByIdAndUpdate(doc.itemID, {avaliable: true}).exec().then(() => {
            return res.success({message: "Trabsaction is complete, user have return the item"});
        }).catch((err) => {
            return res.internal({errors: err.errors, message: err.message});
        });
    });
});


/**
 * @swagger
 * /transactions/detail/{id}:
 *   get:
 *     summary: get detail transaction
 *     tags: [Transactions]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: transaction id
 *     responses:
 *       200:
 *         description: all transaction or all user transaction retrieve
 *         content:
 *           application/json:
 *             schema:
 *                 type: object
 *                 properties:
 *                    result:
 *                        $ref: '#/components/schemas/Transaction'
 *                    code:
 *                        type: integer
 *                    message:
 *                        type: string  
 *       400:
 *         description: error from bad request
 */
router.get('/detail/:id', (req, res) => {
    Transaction.findById(req.params.id)
    .populate({
        path: 'borrowID',
        model: "Borrows"}).exec((err, resultRes) => {
            if(err) return res.internal({errors:err.errors, message: err.message});
            if(!resultRes) return res.notfound({message: "transaction not found"});
            return res.success({result: resultRes, message: "retrieve transaction detail success"});
        })
})

module.exports = router;