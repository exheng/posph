const { logError } = require("./logError");
const connection = require("./connection");

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