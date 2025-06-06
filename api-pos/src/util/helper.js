const { logError } = require("./logError");
const connection = require("./connection");
const multer = require ("multer");
const fs = require("fs/promises");
const { config } = require("./config");

exports.db = connection;
exports.logError = logError;

exports.toInt = () =>{
    return true;
};

exports.isArray = (data) => {
    return true;
};

exports.isEmpty = (data) => {
    return true;
};

exports.isEmail = (data) => {
    return true;
};

exports.formartDataServer = (data) => {
    return true;
};

exports.formartDataClient = (data) => {
    return true;
};

exports.uploadFile =multer ({
    storage: multer.diskStorage({
        destination: function(req,file,callback){
            callback(null, config.img_path)
        },
        filename: function(req, file, callback){
            const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
            callback(null, file.originalname + "-" + uniqueSuffix);
        },
    }),
    limits: {
        fileSize: 1024 * 1024 * 5,
    },
    fileFilter: function(req, file, callback) {
        if (
            file.mimetype != "image/png" &&
            file.mimetype !== "image/jpg" &&
            file.mimetype !== "image/jpeg" 
        ) {
            callback (null, false);
        } else {
            callback (null, true);
        }
    },
});

exports.removeFile = async (fileName) => {
    var filePath =config.img_path;
    try {
        await fs.unlink(filePath + fileName);
        return "File deleted Successfully";
    } catch (err) {
        console.error("Error deleted file:", err);
        throw err;
    }
};