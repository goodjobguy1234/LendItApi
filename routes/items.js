const express =require("express");
const router = express.Router();
const mongoose = require("mongoose");
var Item = require("../db/models/items");
var User = require('../db/models/users');

/**
 * @swagger
 * components:
 *  schemas:
 *      Item:
 *          type: object
 *          required:
 *              - ownerID
 *              - price/day
 *              - name
 *          properties:
 *              name:
 *                  type: string
 *                  description: name of item
 *              price/day:
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
 *              price/day: 300
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
 *  desciption: Item api for dashboard
 */

/**
 * @swagger
 * /items:
 *  get:
 *   description: get all item data for show in the dash board.
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
router.get("/", (req, res) => {
    const userId= req.query.userId;
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
                const endResult = resultRes.filter((item) => {
                    return item.avaliable == true
                })
                return res.success({result: endResult, message: "get posted item success"});
            });
        });
    }
});

/**
 * @swagger
 * /items/{id}:
 *   get:
 *     summary: Get the item by id
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
 *               $ref: '#/components/schemas/Item'
 *       404:
 *         description: The Item was not found
 */
router.get("/:id", (req, res) => {
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
 *      description: create item for others to borrowing
 *      tags: [Items]
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
router.post("/", (req, res) => {
    const itemData = req.body;

    const newItem = new Item({...itemData});
    newItem.save((err, newInstance) => {
        if(err) return res.internal({errors: err.errors, message: err.message});
        return res.success({result:newInstance, message: "create item success"});
    })
});


router.delete('/:itemID', (req, res) => {
    const {itemID} = req.params;
    Item.findOneAndDelete({"_id": itemID}, (err, deleteResult) => {
        if(err) return res.error({errors:err.errors, message: err.message});
        if(!deleteResult) {
            return res.notfound({message: "item not found"});
        }
        return res.success({message: "deleted success"});
    })
});


router.put('/:itemId', (req, res) => {
    const {itemId} = req.params;
    const updatedItem = req.body;
    Item.findOneAndUpdate({_id: itemId}, updatedItem, {new: true}, (err, doc) => {
        if(!doc) return res.notfound({errors: err, message: "update fail, no item found"});
        if(err) return res.badreq({errors: err.errors, message: err.message});
        return res.success({result: doc, message: "update item success"});
    });
});

module.exports = router;