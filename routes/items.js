const express =require("express");
const router = express.Router();
const mongoose = require("mongoose");
var Item = require("../db/models/items");
var User = require('../db/models/users');
var Transaction = require('../db/models/transactions');
var Borrow = require('../db/models/borrows');
// const { verify } = require("jsonwebtoken");
const verify = require('../middleware/tokenVerify');

/**
 * @swagger
 * components:
 *  schemas:
 *      Item:
 *          type: object
 *          required:
 *              - ownerID
 *              - pricePerDay
 *              - name
 *              - location
 *          properties:
 *              name:
 *                  type: string
 *                  description: name of item
 *              pricePerDay:
 *                  type: integer
 *                  description: price per day
 *              ownerID:
 *                  type: string
 *                  description: user's id who is own this item
 *              imageURL:
 *                  type: string
 *                  description: image url of item
 *              location:
 *                  type: string
 *                  description: location to get the item
 *              itemDesciption:
 *                  type: string
 *                  description: item's description
 *          example:
 *              name: itemName
 *              pricePerDay: 300
 *              ownerID: 6210015
 *              imageURL: https://i.gadgets360cdn.com/products/large/1549533234_635_New_Nintendo_2DS_XL.jpg?downsize=*:180&amp;output-quality=80&amp;output-format=webp
 *              location: king david
 *              itemDescription: items is good
 *              
 */

/**
 * @swagger
 * tags:
 *  name: Items
 *  desciption: Item api for dashboard and user's item
 */

/**
 * @swagger
 * /items:
 *  get:
 *   summary: get all avaliable item
 *   description: get all avaliable item data for show in the dash board or get all posted user item.
 *   parameters:
 *     - in: header
 *       name: auth-token
 *       schema:
 *         type: string
 *       required: true
 *          
 *   tags: [Items]
 *   responses:
 *    200:
 *     description: A successful response
 *     content:
 *      application/json:
 *          schema:
 *              type: object
 *              properties:
 *                  result:
 *                      type: array
 *                      items:
 *                          $ref: '#/components/schemas/Item'
 *                  code:
 *                      type: integer
 *                  message:
 *                      type: string    
 * 
 */

/**
 * @swagger
 * /items?userId=6210015:
 *  get:
 *   summary: get user's item
 *   description: get all avaliable item data for show in the dash board or get all posted user item.
 *   parameters:
 *     - in: header
 *       name: auth-token
 *       schema:
 *         type: string
 *       required: true
 *     - in: query
 *       name: userId
 *       schema:
 *          type: string
 *       required: true
 *       description: user id string to get all posted item of specific user.
 *          
 *   tags: [Items]
 *   responses:
 *    200:
 *     description: A successful response
 *     content:
 *      application/json:
 *          schema:
 *              type: object
 *              properties:
 *                  result:
 *                      type: array
 *                      items:
 *                          $ref: '#/components/schemas/Item'
 *                  code:
 *                      type: integer
 *                  message:
 *                      type: string    
 * 
 */
router.get("/", verify, (req, res) => {
    const userId = req.query.userId;
    if(userId === undefined) {
        Item.find({}, (err, resultRes) => {
            if(err) return res.error({errors: err.errors, result: resultRes, message: err.message});
            const endResult = resultRes.filter((item) => {
                return item.avaliable == true
            })
            return res.success({
                    result: endResult,
                    message: "retrieve all item successful"
                });
        });
    } else {
        User.exists({id: userId}, (err, result) => {
            if(!result) {
                return res.notfound({errors:err, message: "this user doesnot exist", result: result});
            }
            Item.find({ownerID: userId}, (err, resultRes) => {
                if(err) return res.internal({errors: err.errors, message: err.message});
                return res.success({result: resultRes, message: "get posted item success"});
            });
        });
    }
});

/**
 * @swagger
 * /items/{id}:
 *   get:
 *     summary: Get item by id
 *     tags: [Items]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The item's id
 *     responses:
 *       200:
 *         description: The item description by id
 *         content:
 *           application/json:
 *             schema:
 *                 type: object
 *                 properties:
 *                    result:
 *                        $ref: '#/components/schemas/Item'
 *                    code:
 *                        type: integer
 *                    message:
 *                        type: string  
 *       404:
 *         description: The Item was not found
 */
router.get("/:id",(req, res) => {
    const id = req.params.id;

    Item.findOne({_id: id}, (err, resultRes) => {
        if(err) return res.badreq({errors: err.errors, message: err.message});
        else return res.success({result: resultRes, message: "retrieve item detail success"});
    });
});


/**
 * @swagger
 * /items:
 *  post:
 *      summary: create Item
 *      description: create item for others to borrowing
 *      tags: [Items]
 *      parameters:
 *          - in: header
 *            name: auth-token
 *            schema:
 *              type: string
 *            required: true
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      $ref: '#/components/schemas/Item'
 *      responses:
 *          200:
 *              description: create item success
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              result:
 *                                  $ref: '#/components/schemas/Item'
 *                              code:
 *                                  type: integer  
 *                              message:
 *                                  type: string
 */
router.post("/", verify, (req, res) => {
    const itemData = req.body;
    if(itemData.ownerID == req.user._id) {
        const newItem = new Item({...itemData});
        newItem.save((err, newInstance) => {
            if(err) return res.internal({errors: err.errors, message: err.message});
            return res.success({result:newInstance, message: "create item success"});
        });
    } else {
        return res.badreq({message: "Cannot create different between ownerID and student's id"});
    }
   
});

/**
 * @swagger
 * /items/{id}:
 *   delete:
 *     summary: Remove item
 *     tags: [Items]
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
 *         description: deleted success
 *       404:
 *         description: item not found
 */
router.delete('/:itemID', verify, (req, res) => {
    const {itemID} = req.params;
    
    Item.findOneAndDelete({"_id": itemID}, (err, deleteResult) => {
        if(err) return res.error({errors:err.errors, message: err.message});
        if(!deleteResult) {
            return res.notfound({message: "item not found"});
        }
        return res.success({message: "deleted success"});
    });
});

/**
 * @swagger
 * /items/{id}:
 *  put:
 *    summary: Update the item by the id
 *    tags: [Items]
 *    parameters:
 *      - in: header
 *        name: auth-token
 *        schema:
 *          type: string
 *        required: true
 *      - in: path
 *        name: id
 *        schema:
 *          type: string
 *        required: true
 *        description: The item id
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/Item'
 *    responses:
 *      200:
 *        description: The item was updated
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                  result:
 *                      $ref: '#/components/schemas/Item'
 *                  code:
 *                      type: integer
 *                      example: 200
 *                  message:
 *                      type: string
 *                      example: update item success
 *      404:
 *        description: The book was not found
 *      500:
 *        description: Some error happened
 */
router.put('/:itemId', verify,(req, res) => {
    const {itemId} = req.params;
    const updatedItem = req.body;
    Borrow.deleteMany({itemID: itemId}).exec().then(() => {
        Item.findOneAndUpdate({_id: itemId}, updatedItem, {new: true}, (err, doc) => {
            if(!doc) return res.notfound({errors: err, message: "update fail, no item found"});
            if(err) return res.badreq({errors: err.errors, message: err.message});
            return res.success({result: doc, message: "update item success"});
        });
    }).catch((err) => res.internal({errors: err.errors, message: err.message}));
});

module.exports = router;