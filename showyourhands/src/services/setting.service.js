const connection = require('../config/db.config');

async function responseReview(api) {
    let words = [];
    let query = `
        SELECT sign_language_word, success_count, fail_count, i.image_path
        FROM capstone."user_sign_stat"
        INNER JOIN capstone."sign_language" sl ON sl.sign_language_id = "user_sign_stat".sign_language_id
        INNER JOIN capstone."image" i on i.image_id = sl.sign_language_image_id
        WHERE user_id = (
            SELECT user_id
            FROM capstone."user"
            WHERE user_api_key = $1
        );
    `;
    await connection.query(query, [api])
        .then(r => {
            if (r.rows.length === 0) {
                return {
                    status: 400,
                    message: "User does not exist"
                }
            }
            for (let i = 0; i < r.rows.length; i++) {
                words.push({
                    word: r.rows[i].sign_language_word,
                    success_count: r.rows[i].success_count,
                    fail_count: r.rows[i].fail_count,
                    image_path: r.rows[i].image_path
                });
            }
        })
        .catch(e => {
            console.log(e);
        });
    // sort words by fail_count - success_count
    // if same, sort by lesser success_count
    words.sort((a, b) => {
        if (a.fail_count - a.success_count === b.fail_count - b.success_count) {
            return a.success_count - b.success_count;
        } else {
            return a.fail_count - a.success_count - (b.fail_count - b.success_count);
        }
    });

    return {
        status: 200,
        message: "success",
        words: words
    }
}

module.exports = {
    responseReview
}

