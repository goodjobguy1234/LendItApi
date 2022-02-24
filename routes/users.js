const express =require("express");
const router = express.Router();
const mongoose = require("mongoose");
var User = require("../db/models/users.js");
var Item = require("../db/models/items.js");
var Borrow = require("../db/models/borrows.js");

const { body, validationResult, oneOf, check, param} = require('express-validator');
const { isUserExist } = require("../utility/util");
const verify = require('../middleware/tokenVerify');
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
 *              - dormLocation
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
 *                              example: 200
 *                          message:
 *                              type: string  
 *                              example: get all users success, use in develop only
 * 
 */
router.get("/",  (req, res) => {
    User.find({}).select({_id:0, __v:0}).exec((err, resultRes) => {
        if(err) return res.badreq({errors: err.errors, result: resultRes, message: err.message});
        else return res.success({errors: err, result: resultRes, message: "get all users success, use in develop only"});
    });
});

/**
 * @swagger
 * /users/{userId}:
 *   get:
 *     summary: Get the user profile by their student id
 *     tags: [Users]
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
 *                          example: 200
 *                      message:
 *                          type: string 
 *                          example: get profile success
 *                 
 *    
 */
router.get("/:userId", verify,(req, res) => {
    const userId = req.params.userId;

    if(userId == req.user._id) {
        User.findOne({id: userId}).select({_id:0, __v:0}).exec((err, resultRes) => {
            if(err) return res.badreq({errors: err.errors, result: resultRes, message: err.message});
            if(!resultRes) return res.notfound({message: "no profile found"});
            return res.success({errors: err, result: resultRes, message: "get profile success"});
        });
    } else {
        return res.badreq({message: "can only access your profile"});
    }
 
});

/**
 * @swagger
 * /users/{userId}:
 *  put:
 *    summary: Update user profile
 *    tags: [Users]
 *    parameters:
 *      - in: header
 *        name: auth-token
 *        schema:
 *          type: string
 *        required: true
 *      - in: path
 *        name: userId
 *        schema:
 *          type: string
 *        required: true
 *        description: The user id
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/User'
 *    responses:
 *      200:
 *        description: The user's profile was updated
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/User'
 *      404:
 *        description: This user was not found
 *      500:
 *        description: Some error happened
 */

//not Test yet new update
router.put('/:userId',  verify,
    body("id").exists().trim().isString().notEmpty(),
    body("firstname").exists().trim().isString().notEmpty(),
    body('lastname').exists().trim().isString().notEmpty(),
    body('email').exists().isEmail().isString().notEmpty(),
    body('phoneNumber').exists().trim().isString().notEmpty(), async (req, res) => {
    
    const {userId} = req.params;
    if(req.user._id == userId) {
        let validate = await validationResult(req);
    
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
    } else {
        return res.badreq({message: "Can only update your profile"});
    }
});

module.exports = router;