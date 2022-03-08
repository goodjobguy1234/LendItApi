module.exports = (userID) => {
    return (req,res, next) => {
        if(userID == req.user) {
            req.userAccessStatus = true
        } else {
            req.userAccessStatus = false
        }
        next();
    };
}