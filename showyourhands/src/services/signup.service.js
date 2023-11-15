const connection = require('../config/db.config');
async function responseSignup(id, password, nickname, email){
    const query = `
        INSERT INTO capstone."user" (user_login_id, user_password, user_name, user_email)
        VALUES ($1, $2, $3, $4);
    `;
    let result = null;
    await connection.query(query, [id, password, nickname, email])
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