const express =require("express");
const router = express.Router();
const mongoose = require("mongoose");
const User = require("../db/models/users.js");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const {registerValidation,  loginValidation} = require('../middleware/authValidate');

/**
 * @swagger
 * tags:
 *  name: Auths
 *  desciption: login and register api to get token 
 */

/**
 * @swagger
 * /auth/register:
 *  post:
 *      summary: register new user
 *      description: create new user using student's id and password
 *      tags: [Auths]
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      $ref: '#/components/schemas/User'
 *      responses:
 *          200:
 *              description: register new user success
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              result:
 *                                  $ref: '#/components/schemas/User'
 *                              code:
 *                                  type: integer  
 *                                  example: 200
 *                              message:
 *                                  type: string
 *                                  example: register new user success
 */
router.post('/register', async (req,res) => {
    const userAcc = req.body;
    const {error} = registerValidation(userAcc);
    if (error) return res.badreq({errors: error, message: error.details[0].message});

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(req.body.password, salt);

    //create a new user
    const newUser = new User({
        id: req.body.id,
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        email: req.body.email,
        phoneNumber: req.body.phoneNumber,
        dormLocation: req.body.dormLocation,
        imageURL: req.body.imageURL,
        password: hashPassword
    });

    newUser.save((err, newInstance) => {
        if(err) return res.internal({errors:err.errors, message: err.message});
        return res.success({result: newInstance, message: "register new user success"});
    }); 
});

/**
 * @swagger
 * /auth/login:
 *  post:
 *      summary: login new user
 *      description: login new user using student's id and password
 *      tags: [Auths]
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      properties:
 *                          id:
 *                              type: string
 *                              example: 6210015
 *                          password:
 *                              type: string
 *                              example: $2a$10$IXjWdg.MkSUFsX7A1rDh7ORqBrzRyrmB3P5m8z1RS.zq46s47Jf3W
 *      responses:
 *          200:
 *              description: register new user success
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              result:
 *                                  type: object
 *                                  properties:
 *                                      auth-token:
 *                                          type: string
 *                                          format: uuid
 *                                      id:
 *                                          type: string
 *                                          example: 6210015
 *                              code:
 *                                  type: integer
 *                                  example: 200  
 *                              message:
 *                                  type: string
 *                                  example: register new user success
 */
router.post('/login', async(req, res) => {
    const {error} = loginValidation(req.body);
    if (error) return res.badreq({message: error.details[0].message});

    const user = await User.findOne({id: req.body.id});
    if(!user) return res.badreq({message: "Email or password is wrong"});

    const validPass = await bcrypt.compare(req.body.password, user.password);
    if(!validPass) return res.badreq({message: "Invalid password"});

    //create and assign token
    const token = jwt.sign({_id: user.id}, process.env.TOKEN_SECRET);
    return res.success({result: {"auth-token": token, "id": user.id}, message: "User Login success"})
});

module.exports = router;