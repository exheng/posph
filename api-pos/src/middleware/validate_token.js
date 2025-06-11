const config = require("../util/config");
const jwt = require("jsonwebtoken");

exports.validate_token = ( ) => {
    return (req, res, next) => {
        var authorization = req.headers.authorization;
        var token_from_client = null;
        if (authorization != null && authorization != ""){
            token_from_client = authorization.split(" ");
            token_from_client = token_from_client[1];
;
        }
        if (token_from_client == null){
            res.status(401).send({
                message: "Unauthorized",
            });
        } else{
            jwt.verify(token_from_client, config.config.token.access_token_key, (error, result) => {
                if (error){
                    res.status(401).send({
                        message: "Unauthorized",
                        error: error,
                    });
                } else {
                    req.current_id = result.data.profile.id;
                    req.auth = result.data.profile;
                    req.permission = result.data.permission;
                    next();
                } 
            });
        }
    };
}; 