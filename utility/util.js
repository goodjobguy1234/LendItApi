var User = require('../db/models/users')

module.exports.isUserExist  = (req, res, callback) => {
    let userId = (req.params.userId === undefined)? req.query.userId : req.params.userId; 
    User.exists({id: userId}, (err, result) => {
        if(!result) {
            return res.notfound({errors:err, message: "this user doesnot exist", result: result});
        }
        
        callback();
    });
}

