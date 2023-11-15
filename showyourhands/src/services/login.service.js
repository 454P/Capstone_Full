const connection = require('../config/db.config');

async function responseLogin(id, password) {
    const query = `
        SELECT user_id, user_login_id, user_password, user_name
        FROM capstone."user"
        WHERE user_login_id = $1;
    `;
    let result = null;
    connection.query(query, [id])
        .then(r => {
            let row = r.rows[0];
            if (row.user_password === password) {
                result = {
                    status: 200,
                    message: "login success",
                    data: {
                        id: row.user_id,
                        nickname: row.user_name
                    }
                }
            }
            else {
                result = {
                    status: 401,
                    message: "login failed due to wrong password"
                }
            }
        })
        .catch(e => {
            console.log(e);
            result = {
                status: 204,
                message: "login failed due to wrong id"
            }
        });

    return result;
}

module.exports = {
    responseLogin
}