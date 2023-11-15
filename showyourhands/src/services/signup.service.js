const connection = require('../config/db.config');
async function responseSignup(id, password, nickname, email){
    const query = `
        INSERT INTO capstone."user" (user_id, user_password, user_name, user_email)
        VALUES ($1, $2, $3, $4);
    `;
    let result = null;
    try{
        result = connection.query(query, [id, password, nickname, email]);
    } catch (err) {
        return {
            status: 401,
            message: "signup failed"
        }
    }
    return {
        status: 200,
        message: "signup success"
    }
}

module.exports = {
    responseSignup
}