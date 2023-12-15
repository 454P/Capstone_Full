const connection = require('../config/db.config');

async function responseUserInfo(api) {
    let result = null;
    let user_id = null;
    let user_score = 0;
    let user_name = null;
    let user_email = null;
    let user_created_at = null;
    try {
        const query = `
            SELECT user_id, user_name, user_email, user_created_at, user_score
            FROM capstone."user" 
            WHERE user_api_key = $1;
         `;
        await connection.query(query, [api])
            .then(r => {
                user_id = r.rows[0].user_id;
                user_score = r.rows[0].user_score;
                user_name = r.rows[0].user_name;
                user_email = r.rows[0].user_email;
                user_created_at = r.rows[0].user_created_at;
            })
            .catch(e => {
                console.log(e);
            });
        result = {
            status: 200,
            message: "userInfo success",
            data: {
                id: user_id,
                score: user_score,
                name: user_name,
                email: user_email,
                created_at: user_created_at
            }
        }
    } catch (err) {
        console.error('Error on scoreRequest', err.message);
        result = {
            status: 400,
            message: "scoreRequest failed",
            score: 0
        }
        return result;
    }
    return result;
}