const express =require("express");
const router = express.Router();
const mongoose = require("mongoose");
var Item = require("../db/models/items.js")

/**
 * @swagger
 * /items:
 *  get:
 *   description: get all item data for show in the dash board.
 *   responses:
 *    200:
 *     description: A successful response
 * 
 */
router.get("/", (req, res) => {
    Item.find({}, (err, resultRes) => {
        if(err) return res.error({message: "db retrieving error"});
        else return res.success({
                result: resultRes
            });
    });
});

module.exports = router;