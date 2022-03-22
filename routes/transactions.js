const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
var Transaction = require('../db/models/transactions');
const { body, validationResult, oneOf, check, param} = require('express-validator');
require('../utility/util');
const { isUserExist } = require("../utility/util");
var Item = require('../db/models/items');
var Borrow = require('../db/models/borrows');
const verify = require('../middleware/tokenVerify');

/**
 * @swagger
 * components:
 *  schemas:
 *      Transaction:
 *          type: object
 *          required:
 *              - totalPrice
 *          properties:
 *              totalPrice:
 *                  type: integer
 *                  description: total price calculate from duration and price per day
 *              returnStatus:
 *                  type: boolean
 *                  description: borrower returning item status false mean not return yet
 *              itemInfo:
 *                  type: object
 *                  properties:
 *                      name:
 *                          type: string
 *                          description: name of item
 *                      pricePerDay:
 *                          type: integer
 *                          description: price per day for borrowing item
 *                      itemDescription:
 *                          type: string
 *                      imageURL:
 *                          type: string
 *                      location:
 *                          type: string
 *                          description: location to retrieve and return the item
 *                  required:
 *                      - name
 *                      - pricePerDay
 *                      - location
 *                  example:
 *                      name: Asus mouse
 *                      pricePerDay: 400
 *                      imageURL: someURL
 *                      location: king david
 *                      itemDescription: some description here
 * 
 *                  
 *              borrowInfo:
 *                  type: object
 *                  properties:
 *                      borrowerID:
 *                          type: string
 *                          description: borrower's user id
 *                      lenderID:
 *                          type: string
 *                          description: lender's user id (owner of item)
 *                      borrowDuration:
 *                          type: integer
 *                          description: duration borrower's borrow the item
 *                      borrowID:
 *                          type: string
 *                          description: id to reference to borrow
 *                  required:
 *                      - borrowerID
 *                      - lenderID
 *                      - borrowDuration
 *                      - borrowID
 *                  example:
 *                      borrowID: 6211146f0a7700f3a751db18
 *                      borrowerID: 6210015
 *                      lenderID: 6110155
 *                      borrowDuration: 2
 *          example:
 *              totalPrice: 1300
 *              returnStatus: false
 *              itemInfo:
 *                  name: Asus mouse
 *                  pricePerDay: 400
 *                  imageURL: someURL
 *                  location: king david
 *                  itemDescription: some description here
 *              borrowInfo:
 *                  borrowID: 6211146f0a7700f3a751db18
 *                  borrowerID: 6210015
 *                  lenderID: 6110155
 *                  borrowDuration: 2
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
 *      parameters:
 *       - in: header
 *         name: auth-token
 *         schema:
 *           type: string
 *         required: true
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      properties:
 *                          borrowID:
 *                              type: string
 *                              example: 6211146f0a7700f3a751db18
 *                          totalPrice:
 *                              type: integer
 *                              example: 5000
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
 *                                  example: 200
 *                              message:
 *                                  type: string
 *                                  example: create transaction successful
 */
router.post('/', verify, async (req,res) => {
    const {borrowID, totalPrice} = req.body;
    // const newTransaction = new Transaction({...(body)});
    // newTransaction.save((err, result) => {
    //     if(err) {
    //         return res.badreq({errors: err.errors, result: result, message: err.message})
    //     }
    //     return res.success({errors:err, result: result, message: "create transaction successful"});
    // })
    
    const borrowRequest = await Borrow.findById(borrowID);
    if(borrowRequest) {
        const item = await Item.findById(borrowRequest.itemID)
        if(item) {
            const newTransaction = new Transaction({
                totalPrice: totalPrice,
                itemInfo: {
                    name: item.name,
                    pricePerDay: item.pricePerDay,
                    imageURL: item.imageURL,
                    location: item.location,
                    itemDesciption: item.itemDesciption
                },
                borrowInfo: {
                    borrowID: borrowID,
                    borrowerID: borrowRequest.borrowerID,
                    lenderID: borrowRequest.lenderID,
                    borrowDuration: borrowRequest.borrowDuration
                }
            });

             newTransaction.save((err, result) => {
            if(err) {
                return res.badreq({errors: err.errors, result: result, message: err.message})
            }
            return res.success({errors:err, result: result, message: "create transaction successful"});
            });
        }
    }else {
        return res.badreq({message: "borrow request is not found"});
    }
});

/**
 * @swagger
 * /transactions:
 *   get:
 *     summary: get all transaction
 *     tags: [Transactions]
 *     parameters:
 *       - in: header
 *         name: auth-token
 *         schema:
 *           type: string
 *         required: true
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
 *                        example: 200
 *                    message:
 *                        type: string  
 *                        example: retrieve users transaction
 *       400:
 *         description: error from bad request
 */

/**
 * @swagger
 * /transactions/{userId}:
 *   get:
 *     summary: get current user transaction
 *     tags: [Transactions]
 *     parameters:
 *       - in: header
 *         name: auth-token
 *         schema:
 *           type: string
 *         required: true
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
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
 *                        example: 200
 *                    message:
 *                        type: string  
 *                        example: retrieve all users transactions
 *       400:
 *         description: error from bad request
 */
// get transaction of that user
router.get('/:userId?', verify, (req, res) => {
    // if(req.params.userId !== undefined) {
    //     isUserExist(req, res, () => {
    //         Transaction.find({}).populate({
    //             path: 'borrowID',
    //             model: "Borrows",
    //             match: {$or: [{borrowerID: req.params.userId}, {lenderID: req.params.userId}]},
    //         }).then(value => {  
    //             const result = value.filter(borrow => {
    //                 return borrow.borrowID !== null
    //             });

    //             const endResult = result.map(doc => {
    //                 return {
    //                     _id: doc._id,
    //                     totalPrice: doc.totalPrice,
    //                     returnStatus: doc.returnStatus,
    //                     borrowID: doc.borrowID._id
    //                 }
    //             });
    //             res.success({result: endResult, message: "retrieve users transaction"});
    //         })
    //     });
    // } else {
    //     Transaction.find().exec((err, resultRes) => {
    //         if(err) return res.internal({errors:err.errors, message: err.message});
    //         return res.success({result: resultRes, message: "retrieve all users transactions"});
    //     })
    // }
    if(req.params.userId !== undefined) {
        if(req.params.userId == req.user._id) {
            isUserExist(req, res, () => {
                Transaction.find({$or: [{borrowerID: req.params.userId}, {lenderID: req.params.userId}]}).then((value) => {  
                    res.success({result: value, message: "retrieve users transaction"});
                }).catch(err => res.internal());
            });
        }else {return res.unauth({message: `${req.params.userId} don't have permission to access transaction`});}
        
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
 *       - in: header
 *         name: auth-token
 *         schema:
 *           type: string
 *         required: true
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
router.patch('/:id', verify, (req,res) => {

    // Transaction.findByIdAndUpdate(req.params.id, {returnStatus: true}, {new: true}, (err, doc) => {
    //     if(!doc) return res.notfound({message: "Transaction is not found"});
    //     if(err) return res.badreq({errors:err.errors, message: err.message});
        
    //     Borrow.findById(doc.borrowID, (err, resResult) => {
    //         Item.findByIdAndUpdate(resResult.itemID, {avaliable: true}, {new: true}).exec().then((value) => {
    //             if (!value) return res.internal({message: "cannot update item avaliable status"});
    //             return res.success({message: "Trabsaction is complete, user have return the item"});
    //         }).catch((err) => {
    //             return res.internal({errors: err.errors, message: err.message});
    //         });
    //     });
    // });
    console.log(req.user._id)
    Transaction.findById(req.params.id).exec().then(doc => {
        console.log(doc)
      if(!doc) return res.notfound({message: "Transaction is not found"});
      Borrow.findById(doc.borrowInfo.borrowID).exec().then(resResult => {
          if(!resResult) return res.notfound({message: "borrow request not exist"});
          if(resResult.borrowerID == req.user._id) {
            Item.findById(resResult.itemID).exec().then(async (itemValue) => {
                if(!itemValue) return res.internal({message: "cannot update item avaliable status"});
                else {
                    doc.returnStatus = true;
                    await doc.save();
                    itemValue.avaliable = true;
                    await itemValue.save();
                    await resResult.remove();
                    return res.success({message: "Trabsaction is complete, user have return the item"});
                }
            }).catch(err => {
                res.badreq({errors: err.errors, message: err.message});
            });
          } else {
              return res.unauth({message: "This user don't have authorize to change status"})
          }
      });
    }).catch(err => res.badreq({message: "bad request"}));
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
    // Transaction.findById(req.params.id)
    // .populate({
    //     path: 'borrowID',
    //     model: "Borrows",
    //     populate: {
    //         path: 'itemID',
    //         model: "Items"
    //     }
    // }).exec((err, resultRes) => {
    //         if(err) return res.internal({errors:err.errors, message: err.message});
    //         if(!resultRes) return res.notfound({message: "transaction not found"});
    //         return res.success({result: resultRes, message: "retrieve transaction detail success"});
    //     });
    Transaction.findById(req.params.id).exec((err, resultRes) => {
            if(err) return res.internal({errors:err.errors, message: err.message});
            if(!resultRes) return res.notfound({message: "transaction not found"});
            return res.success({result: resultRes, message: "retrieve transaction detail success"});
        });
})

module.exports = router;