const config = require("../util/config");
const {logError, db} = require("../util/helper")
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.getList = async (req, res) => {
    let connection;
    try {
        connection = await db.getConnection();
        let sql = "SELECT u.id, u.name, u.username, u.create_by, u.is_active, r.name AS role_name FROM user u INNER JOIN role r ON u.role_id = r.id";
        const [list] = await connection.query(sql);
        const [role] = await connection.query("SELECT id as value, name as label FROM role");
        res.json({
            list,
            role,
        });
    } catch (error) {
        await logError("auth.getList", error);
        res.status(500).json({ error: "Failed to fetch users and roles", details: error.message });
    } finally {
        if (connection) connection.release();
    }
};

exports.register = async (req,res) =>{
    try{
        let password = req.body.password;
        password = bcrypt.hashSync(password,10);
        let sql = "INSERT INTO user( role_id, name, username, password, is_active, create_by) VALUES (:role_id,:name,:username,:password,:is_active,:create_by)";
        let data =await db.query (sql,{
            role_id : req.body.role_id, 
            name : req.body.name, 
            username : req.body.username, 
            password : password, 
            is_active : req.body.is_active, 
            create_by : req.auth?.name,
        });
        res.json({ 
        message:"Create New Account Success !",
        data:data,
        }); 

    }catch (error){
        await logError("auth.register",error);
        res.status(500).json({ error: "Failed to register user", details: error.message });

    };
};

exports.login = async (req,res) => {
    try{
        let {password, username} = req.body;
        let sql ="SELECT u.*, r.name as role_name FROM user u INNER JOIN role r ON u.role_id = r.id WHERE u.username=:username";
        let [data] = await db.query(sql,{
            username: username,
        });

        if (data.length === 0){
             res.status(401).json({
                error : {
                    username : "Username doesn't exist !",
                },
             });
        } else{
            let dbPass = data[0].password;
            let isCorrectPass = bcrypt.compareSync(password, dbPass);
            if (!isCorrectPass){
                res.status(401).json({
                error : {
                    password : "Password incorrect !",
                },
                });
            } else{
                delete data[0].password;
                
                // Define permissions based on role
                let permissions = [];
                if (data[0].role_name.toLowerCase() === 'cashier') {
                    permissions = [
                        'use_pos',
                        'manage_customers',
                        'view_orders',
                        'view_inventory',
                        'view_products',
                        'view_stock_alerts'
                    ];
                } else {
                    permissions = [
                        'view_all',
                        'delete',
                        'edit',
                        'manage_users',
                        'manage_roles',
                        'manage_settings',
                        'view_reports',
                        'manage_purchases',
                        'view_dashboard'
                    ];
                }

                let obj = {
                    profile: data[0],
                    permissions: permissions
                }
                res.json({ 
                    message: "Login success",
                    ...obj,
                    access_token: await getAccessToken(obj),
                });
            }
        } 

    }catch (error){
        await logError("auth.login",error);
        res.status(500).json({ error: "Login failed", details: error.message });
    };
};
    
exports.profile = async (req,res) => {
    try{
        res.json({
            profile: req.profile,
        });
           
    }catch (error){
        await logError("auth.profile",error);
        res.status(500).json({ error: "Failed to fetch profile", details: error.message });
    };
};

exports.remove = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ error: 'User ID is required.' });
        }
        const [result] = await db.query('DELETE FROM user WHERE id = ?', [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'User not found.' });
        }
        res.json({ message: 'User deleted successfully!' });
    } catch (error) {
        await logError('auth.remove', error);
        res.status(500).json({ error: 'Failed to delete user.' });
    }
};

const getAccessToken = async (paramData) => {
    const access_token = await jwt.sign({ data: paramData }, config.config.token.access_token_key, { expiresIn: "1d" });
    return access_token;
    
};