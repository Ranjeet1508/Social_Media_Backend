const jwt = require('jsonwebtoken');
require('dotenv').config();



const authentication = (req,res,next) => {
    let token = req.headers.authorization.split(" ")[1];
    if(!token){
        return res.status(401).json({
            message: "please login first"
        })
    }
    jwt.verify(token, process.env.SECRET_KEY, function(err, decoded) {
        if(err){
            return res.status(401).json({
                success:false,
                message:"you are not a authorised user"
            })
        }
        else{
            const {userID} = decoded;
            req.userID = userID;
            next();
        }
    });
}

module.exports = {
    authentication
}