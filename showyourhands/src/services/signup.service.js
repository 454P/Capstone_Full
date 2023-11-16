const connection = require('../config/db.config');
const jwt = require('../modules/jwt.module');
const api = require('../modules/api.module');
async function responseSignup(id, password, nickname, email){
    const hashedPassword = await jwt.hashPassword(password);
    const apikey = await api.generateAPIkey();
    const query = `
        INSERT INTO capstone."user" (user_login_id, user_password, user_name, user_email, user_api_key)
        VALUES ($1, $2, $3, $4, $5);
    `;
    let result = null;
    await connection.query(query, [id, hashedPassword, nickname, email, apikey])
        .then(r => {
            console.log(r);
            result = {
                status: 200,
                message: "signup success"
            }
        }).catch(e => {
            console.log(e);
            result = {
                status: 401,
                message: "signup failed"
            }
        });
    return result;
}

module.exports = {
    responseSignup
}