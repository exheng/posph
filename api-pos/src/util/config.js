const path = require("path");

module.exports = {
   config : {
    app_name : "POS PH",
    app_version : "1.0",
    img_path : path.join("C:/xampp/htdocs/pos_img"),

    db : {
        HOST:"localhost",
        USER:"root",
        PASSWORD:"",
        DATABASE:"pos",
        PORT:3306,
    },
    token:{
        access_token_key:"lfabfsjfawfkjwfbj!$!$%@%!@&%@GgiaghgekyffhfgsyfgwfbGAFGEFWVSDFGAWUefgyfetFufgfuefy!@!$@%$^#%@$$163746714791185987654uygfderghredvjgfdnbc"
    },
    telegram: {
        bot_token: process.env.TELEGRAM_BOT_TOKEN || "7804835268:AAGxOTOy0OY4ISuy5_1BN_D9m4n0wqC6y6U",
        chat_id: process.env.TELEGRAM_CHAT_ID || "493970079"
    }
   },
};

