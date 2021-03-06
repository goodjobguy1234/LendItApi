const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Borrow = require('../db/models/borrows');
const Item = require('../db/models/items');

const { body, validationResult, oneOf, check, param} = require('express-validator');
const {isUserExist} = require('../utility/util');
const verify = require('../middleware/tokenVerify');
const userVerify = require('../middleware/userAccessVerify');

/**
 * @swagger
 * components:
 *  schemas:
 *      Borrow:
 *          type: object
 *          required:
 *              - itemID
 *              - borrowerID
 *              - lenderID
 *              - borrowDuration
 *          properties:
 *              itemID:
 *                  type: string
 *                  description: id to reference to item
 *              borrowerID:
 *                  type: string
 *                  description: student id of borrower
 *              lenderID:
 *                  type: string
 *                  description: student id of owner of item
 *              pendingStat:
 *                  type: boolean
 *                  description: pending status when ask for borrow item (wait for owner to accept)
 *              borrowDuration:
 *                  type: Integer
 *                  description: duration that borrow the item.

 *          example:
 *              itemID: 620e76bdd7eead24fee42f81
 *              borrowerID: 6110155
 *              lenderID: 6210015
 *              borrowDuration: 1
 *              pendingStat: false
 *              
 */

/**
 * @swagger
 * tags:
 *  name: Borrows
 *  desciption: api used for borrow item
 */


/**
 * @swagger
 * /borrows/borrower?userId=6210015:
 *   get:
 *     summary: Get borrow of that user
 *     tags: [Borrows]
 *     parameters:
 *       - in: header
 *         name: auth-token
 *         schema:
 *           type: string
 *         required: true
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: The user's student id
 *     responses:
 *       200:
 *         description: all user borrow item to show with status
 *         content:
 *           application/json:
 *             schema:
 *                 type: object
 *                 properties:
 *                    result:
 *                        $ref: '#/components/schemas/Borrow'
 *                    code:
 *                        type: integer
 *                        example: 200
 *                    message:
 *                        type: string  
 *                        example: retrieve all user's borrower from 6210015 success
 *       400:
 *         description: error from bad request
 */
router.get('/borrower', verify,(req, res) => {
    isUserExist(req, res, () => {
        Borrow.find({borrowerID: req.query.userId}).populate({
            path: 'itemID',
            model: "Items",
            select: 'name imageURL pricePerDay -_id'
        }).exec((err, resultRes) => {
            if(err) return res.badreq({errors:err.errors, message: err.message, result: resultRes});
            return res.success({message: `retrieve all user's borrower from ${req.query.userId} success`, result: resultRes});
        });
    });
});

/**
 * @swagger
 * /borrows/lender?userId=6210015:
 *   get:
 *     summary: information who you lend item to
 *     tags: [Borrows]
 *     parameters:
 *       - in: header
 *         name: auth-token
 *         schema:
 *           type: string
 *         required: true
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: The user's student id
 *     responses:
 *       200:
 *         description: all user borrow item to show with status
 *         content:
 *           application/json:
 *             schema:
 *                 type: object
 *                 properties:
 *                    result:
 *                        $ref: '#/components/schemas/Borrow'
 *                    code:
 *                        type: integer
 *                        example: 200
 *                    message:
 *                        type: string
 *                        example: retrieve all user's lenderID from 6210015 success
 *       400:
 *         description: error from bad request
 */
router.get('/lender', verify, (req, res) => {
    const userId = req.query.userId;
    isUserExist(req, res, () => {
        Borrow.find({lenderID: req.query.userId}).populate({
            path: 'itemID',
            model: "Items",
            select: 'name imageURL pricePerDay -_id'
        }).exec((err, resultRes) => {
            if(err) return res.badreq({errors:err.errors, message: err.message, result: result});
            return res.success({message: `retrieve all user's lenderID from ${req.query.userId} success`, result: resultRes});
        });
    });
});

/**
 * @swagger
 * /borrows/create-borrow:
 *  post:
 *      summary: create Borrow
 *      description: when user click to borrow smt
 *      tags: [Borrows]
 *      parameters:
 *      - in: header
 *        name: auth-token
 *        schema:
 *          type: string
 *        required: true
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      $ref: '#/components/schemas/Borrow'
 *      responses:
 *          200:
 *              description: create borrow success
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              result:
 *                                  $ref: '#/components/schemas/Borrow'
 *                              code:
 *                                  type: integer  
 *                                  example: 200
 *                              message:
 *                                  type: string
 *                                  example: request borrow success
 */

router.post('/create-borrow', verify,  (req, res) => {
    Item.findById({_id: req.body.itemID},(err, item) => {
        if(!item) return res.notfound({message: "item not found"});
        if(err) return res.badreq({errors:err.errors, meesage: err.meesage});
        console.log(item)
        if(item.ownerID == req.body.lenderID && item.avaliable == true) {
            const newBorrow = new Borrow({...req.body});
            console.log(newBorrow);
            newBorrow.save().then((resultRes) => {
                item.avaliable = false;
                item.save((err, result) => {
                    if(err) return res.internal({errors: err.errors, meesage: err.meesage});
                    return res.success({result: resultRes, message: "request borrow success"});
                });
            }).catch(err => {
                return res.internal({message: err.meesage, errors: err.errors})
            })
        } else if (item.ownerID != req.body.lenderID){
            return res.badreq({message: "the owner id different person"});
        } else {
            return res.badreq({message: "this item is not avaliable"});
        } 
    });
});


/**
 * @swagger
 * /borrows/lender/accept:
 *  patch:
 *    summary: update pending status
 *    description: when lender accept borrow request from borrower
 *    tags: [Borrows]
 *    parameters:
 *      - in: header
 *        name: auth-token
 *        schema:
 *          type: string
 *        required: true
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *              type: object
 *              properties:
 *                  borrowID:
 *                      type: string
 *    responses:
 *      200:
 *        description: borrow request accept
 *      404:
 *        description: borrow request not found
 *      500:
 *        description: Something went wrong
 */
//lender accept for borrow --> then create transaction(p.crate by himself)
router.patch('/lender/accept', verify,(req, res) => {
    const borrowID = req.body.borrowID;
    Borrow.findById(borrowID).exec().then(borrowItem => {
        if(req.user._id == borrowItem.lenderID) {
            borrowItem.pendingStat = true;
            borrowItem.save().then(saveResult => {
                if(!saveResult) return res.internal({message: "cannot update borrow status"});
                return res.success({message: "borrow request accepted"});
            }).catch(err => {
                return res.badreq({errors:err.meesage, message: err.message});
            })
        } else {
            return res.unauth({message: "This user don't have authorize to change status"});
        }
    }).catch(err => {
        return res.badreq({errors:err.meesage, message: err.message});
    });
    // Borrow.findByIdAndUpdate(borrowID, {pendingStat: true}, {new: true}).exec().then((value) => {
    //     if(!value) return res.notfound({message: "borrow request not found"})
    //     return res.success({message: "borrow request accepted"});
    // }).catch((err) => {
    //     return res.badreq({errors:err.meesage, message: err.message});
    // });
});

/**
 * @swagger
 * /borrows/{id}:
 *   get:
 *     summary: get detail borrow request
 *     tags: [Borrows]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: borrow request id
 *     responses:
 *       200:
 *         description: all user borrow item to show with status
 *         content:
 *           application/json:
 *             schema:
 *                 type: object
 *                 properties:
 *                    result:
 *                        $ref: '#/components/schemas/Borrow'
 *                    code:
 *                        type: integer
 *                        example: 200
 *                    message:
 *                        type: string  
 *                        example: retrieve detail of borrow request successful
 *       400:
 *         description: error from bad request
 *       404:
 *         description: borrow request not found
 */
router.get('/:id', (req, res) => {
    Borrow.findById(req.params.id)
    .populate({
        path: 'itemID',
        model: "Items"
    }).exec((err, resultRes) => {
        if(err) return res.internal({errors:err.errors, message:err.meesage});
        if(!resultRes) return res.notfound({message: "borrow request not found"});
        return res.success({result: resultRes, message: "retrieve detail of borrow request successful"});
    });
});

/**
 * @swagger
 * /borrows/{id}:
 *   delete:
 *     summary: Remove borrow request
 *     tags: [Borrows]
 *     parameters:
 *          - in: header
 *            name: auth-token
 *            schema:
 *              type: string
 *            required: true
 *          - in: path
 *            name: id
 *            schema:
 *              type: string
 *            required: true
 *            description: The item's id
 *     responses:
 *       200:
 *         description: borrow request declined
 *       404:
 *         description: not found this borrow request
 *       401:
 *         description: this user don't have permission to decline this borrow request
 *       500:
 *         description: something went wrong
 */

//call after update transaction complete or call when decline the borrow request
router.delete('/:id', verify, (req, res) => {
    Borrow.findById(req.params.id).exec().then(value => {
        if(!value) return res.notfound({message: `not found borrow request id ${req.params.id}`});
        if(req.user._id == value.lenderID) {
            Item.findById(value.itemID).exec().then((item) => {
                item.avaliable = true;
                item.save().then(() => {
                    value.delete().then(() => {
                        return res.success({message: "borrow request declined"});
                    });
                });
            }); 
        } else {
            return res.unauth({message: `This ${req.params.id} don't have permission to decline this borrow request`});
        }
    }).catch(err => {
        return res.internal({errors: err.errors, message: err.meesage});
    })
});

module.exports = router;