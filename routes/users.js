const express =require("express");
const router = express.Router();
const mongoose = require("mongoose");
var User = require("../db/models/users.js");
var Item = require("../db/models/items.js");
var Borrow = require("../db/models/borrows.js");

const { body, validationResult, oneOf, check, param} = require('express-validator');
const { isUserExist } = require("../utility/util");
// const { isUserExist } = require("../utility/util");

// function isUserExist(req, res, callback) {
//     User.exists({id: req.params.userId}, (err, result) => {
//         if(!result) {
//             return res.notfound({errors:err, message: "this user doesnot exist", result: result});
//         }
        
//         callback();
//     });
// }

/**
 * @swagger
 * components:
 *  schemas:
 *      User:
 *          type: object
 *          required:
 *              - id
 *              - firstname
 *              - lastname
 *              - phoneNumber
 *          properties:
 *              id:
 *                  type: string
 *                  description: student id of the user 
 *              firstname:
 *                  type: string
 *                  description: firstname of the user
 *              lastname:
 *                  type: string
 *                  description: lastname of the user
 *              imageURL:
 *                  type: string
 *                  description: image url of the user
 *              dormLocation:
 *                  type: string
 *                  description: current living location
 *              email:
 *                  type: string
 *                  description: email of user
 *              phoneNumber:
 *                  type: string
 *                  description: phone number
 *          example:
 *              id: 6210015
 *              firstname: Thitare
 *              lastname: Nimanong
 *              imageURL: https://images.generated.photos/pRwSE6hV8UOF2oFCewI73WRzxw0KD1wg5uKFmP-y4TM/rs:fit:512:512/wm:0.95:sowe:18:18:0.33/czM6Ly9pY29uczgu/Z3Bob3Rvcy1wcm9k/LnBob3Rvcy92M18w/MDczMjk4LmpwZw.jpg
 *              dormLocation: queen sheba 8 floor
 *              email:  u6210015@au.edu
 *              phoneNumber: 063-948-9842
 *              
 */

/**
 * @swagger
 * tags:
 *  name: Users
 *  desciption: user api for show in profile and stuff
 */

/**
 * @swagger
 * /users:
 *  get:
 *   summary: get all user profile.
 *   tags: [Users]
 *   responses:
 *    200:
 *           content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      properties:
 *                          result:
 *                              type: array
 *                              items:
 *                                  $ref: '#/components/schemas/User'
 *                          code:
 *                              type: integer
 *                          message:
 *                              type: string   
 * 
 */
router.get("/", (req, res) => {
    User.find({}).select({_id:0, __v:0}).exec((err, resultRes) => {
        if(err) return res.badreq({errors: err.errors, result: resultRes, message: err.message});
        else return res.success({errors: err, result: resultRes, message: "get all users success"});
    })
});

/**
 * @swagger
 * /users/{userId}:
 *   get:
 *     summary: Get the user profile by their student id
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: The user's id
 *     responses:
 *       200:
 *         description: The profile of specific user id
 *         content:
 *          application/json:
 *              schema:
 *                  type: object
 *                  properties:
 *                      result:
 *                           $ref: '#/components/schemas/User'
 *                      code:
 *                          type: integer
 *                      message:
 *                          type: string 
 *                 
 *    
 */
router.get("/:userId", (req, res) => {
    const userId = req.params.userId;
    User.findOne({id: userId}).select({_id:0, __v:0}).exec((err, resultRes) => {
        if(err) return res.badreq({errors: err.errors, result: resultRes, message: err.message});
        if(!resultRes) return res.notfound({message: "no profile found"});
        return res.success({errors: err, result: resultRes, message: "get profile success"});
    });
});

/**
 * @swagger
 * /users/{userId}/items:
 *   get:
 *     summary: get all item that user's posted
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: The user's student id
 *     responses:
 *       200:
 *         content:
 *           application/json:
 *             schema:
 *                  type: object
 *                  properties:
 *                      result:
 *                          type: array
 *                          items:
 *                              $ref: '#/components/schemas/Item'
 *                      code:
 *                          type: integer
 *                      message:
 *                          type: string 
 *       404:
 *         description: The book was not found
 */
// router.get('/:userId/items', (req, res) => {
//     const userId = req.params.userId;
//     isUserExist(req, res, () => {
//         Item.find({ownerID: userId}, (err, resultRes) => {
//             if(err) return res.internal({errors: err.errors, message: err.message});
//             return res.success({result: resultRes, message: "get posted item success"});
//         });
//     })
   
//     // User.findOne({"id": userId}, (err, resultRes) => {
//     //     if(!resultRes) return res.badreq({errors: err, message: "no user exists"});
//     //     else {
//     //         Item.find({ownerID: userId}, (err, resultRes) => {
//     //             return res.success({result: resultRes, message: "get posted item success"});
//     //         });
//     //     }
//     // });
// });

/**
 * @swagger
 * /users/{userId}/{itemID}:
 *   delete:
 *     summary: Remove the user's item by their student id and item id
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: The user's student id
 *       - in: path
 *         name: itemID
 *         schema:
 *           type: string
 *         required: true
 *         description: The item's id
 *     responses:
 *       200:
 *         description: The book was deleted
 *       404:
 *         description: The book was not found
 */
// router.delete('/:userId/:itemID', (req, res) => {
//     const {userId, itemID} = req.params;
    
//     User.exists({id: userId}, (err, result) => {
//         if(!result) {
//             return res.notfound({message: "this user not exist"});
//         } else {
//             Item.findOneAndDelete({"_id": itemID}, (err, deleteResult) => {
//                 if(err) return res.error({errors:err, message: "error in delete"});
//                 if(!deleteResult) {
//                     return res.notfound({message: "item not found"});
//                 }
//                 return res.success({message: "deleted success"});
//             })
//         }
//     });
// });


router.put('/:userId',  
    body("id").exists().trim().isString().notEmpty(),
    body("firstname").exists().trim().isString().notEmpty(),
    body('lastname').exists().trim().isString().notEmpty(),
    body('email').exists().isEmail().isString().notEmpty(),
    body('phoneNumber').exists().trim().isString().notEmpty(), async (req, res) => {

    let validate = await validationResult(req);
    const {userId} = req.params;
    const body = req.body;

    if (!validate.isEmpty()) {
        return res.badreq({errors: validate.errors, message: "invalid body"});
    } else {
        User.findOneAndUpdate({id: userId}, {...body}, { 
            new: true
        }, (err, doc) => {
            if(!doc) return res.notfound({errors: err, message: "update profile fail"});
            if(err) return res.internal({errors: err.errors, message: err.message});
            return res.success({result: doc, message: "update profile success"});
        });
    }
});

// router.put('/:userId/:itemId', (req, res) => {
//     const {userId, itemId} = req.params;
//     const updatedItem = req.body;
//     User.exists({id: userId}, (userErr, result) => {
//         if(!result) {return res.notfound({errors: userErr, message: "user doesn't exist"});}
//         Item.findOneAndUpdate({"_id": itemId}, updatedItem, {new: true}, (err, doc) => {
//             if(!doc) return res.notfound({errors: err, message: "update fail, no item found"});
//             if(err) return res.internal({errors: err, message: "update fail, something went wrong"});
//             return res.success({result: doc, message: "update item success"});
//         });
//     });
// });
router.post('/', (req, res) => {
    const newUser = new User({...(req.body)});
    newUser.save((err, newInstance) => {
        if(err) return res.internal({errors:err.errors, message: err.message});
        return res.success({result: newInstance, message: "create new user success"});
    });    
});

module.exports = router;