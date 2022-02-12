const express =require("express");
const router = express.Router();
const mongoose = require("mongoose");
var User = require("../db/models/users.js")

router.get("/", (req, res) => {
    User.find({}, (err, resultRes) => {
        if(err) return res.error({message: "db retrieving error"});
        else return res.success({
                result: resultRes
            });
    });
});

module.exports = router;