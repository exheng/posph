const fs = require("fs/promises")

exports.logError = async (controller, message_error, res = null) => {
    try {
        const path = "./logs/" + controller + ".txt";
        const logMessage = message_error + "\n";
        await fs.appendFile(path, logMessage);
    } catch (error) {
        console.error("Error writing to log file:", error);
    }
    // If a response object is provided, send a generic error response
    if (res && !res.headersSent) {
        res.status(500).json({
            error: "An internal server error occurred",
            details: message_error
        });
    }
    return message_error;
};