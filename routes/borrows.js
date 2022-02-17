const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Borrow = require('../db/models/borrows');
const Item = require('../db/models/items');

const { body, validationResult, oneOf, check, param} = require('express-validator');
const {isUserExist} = require('../utility/util');

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

 *          example:
 *              itemID: 620e76bdd7eead24fee42f81
 *              borrowerID: 6110155
 *              lenderID: 6210015
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
 *                    message:
 *                        type: string  
 *       400:
 *         description: error from bad request
 */
router.get('/borrower', (req, res) => {
    isUserExist(req, res, () => {
        Borrow.find({borrowerID: req.query.userId}, (err, resultRes) => {
            if(err) return res.badreq({errors:err.errors, message: err.message, result: result});
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
 *                    message:
 *                        type: string  
 *       400:
 *         description: error from bad request
 */
router.get('/lender', (req, res) => {
    const userId = req.query.userId;
    isUserExist(req, res, () => {
        Borrow.find({lenderID: req.query.userId}, (err, resultRes) => {
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
 *                              message:
 *                                  type: string
 */
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