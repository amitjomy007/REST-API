const jwt = require('jsonwebtoken');


function authMiddleware(req,res,next) {
    const token = req.cookies.token;

    if(!token){
        return res.status(401).send('Access Denied. You must be logged in');
    }

    try {
        const verifiedUser = jwt.verify(token,process.env.JWT_SECRET);
        req.user = verifiedUser;
        next();
    } catch(error){
        res.status(403).send('Invalid or expired token. Please login again');
    }
}

module.exports = authMiddleware;