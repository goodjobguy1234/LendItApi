const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    const token = req.header('auth-token');
    if(!token) return res.status(401).send({errors:{}, code:401, message:"Access Denied", result:{}});

    try {
        const verified = jwt.verify(token, process.env.TOKEN_SECRET);
        req.user = verified;
        next();
    } catch (err) {
        res.status(400).send({ errors: {}, code: 400, message: "Invalid Token", result: {}});
    }
}