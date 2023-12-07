const connection = require('../config/db.config');

async function responseGameStart(api) {
    let result = null;

    try {
        const word = await __wordFetch();
        result = {
            status: 200, message: "gameStart success", word: word.sign_language_word, count: 1
        }
    } catch (err) {
        console.error('Error on gameStart', err.message);
        result = {
            status: 400, message: "gameStart failed", word: "null", count: 999
        }
        return result;
    }
    return result;
}

async function responseGameNext(api, count) {
    if (count >= 3) {
        return {
            status: 201, message: "Game End", word: "null", count: count
        }
    }
    let result = null;

    try {
        const word = await __wordFetch();
        result = {
            status: 200, message: "gameNext success", word: word.sign_language_word, count: count + 1
        }
    } catch (err) {
        console.error('Error on gameStart', err.message);
        result = {
            status: 400, message: "gameNext failed", word: "null", count: 999
        }
        return result;
    }
    return result;
}

async function responseGameEnd(api, words) {
    let result = null;
    let user_id = null;
    let user_score = 0;
    try {
        const query = `
            SELECT user_id, user_score
            FROM capstone."user" 
            WHERE user_api_key = $1;
         `;
        await connection.query(query, [api])
            .then(r => {
                user_id = r.rows[0].user_id;
                user_score = r.rows[0].user_score;
            })
            .catch(e => {
                console.log(e);
                result = {
                    status: 400, message: "User does not exist"
                }
            });
        const review_list_query = `
            SELECT user_sign_stat.sign_language_id, sl.sign_language_word, success_count, fail_count
            FROM capstone.user_sign_stat
            INNER JOIN capstone.sign_language sl on sl.sign_language_id = user_sign_stat.sign_language_id
            WHERE user_id = $1;
        `
        let review_list = {};
        await connection.query(review_list_query, [user_id])
            .then(r => {
                // save sign_language_word, id, success_count, fail_count at review_list
                for (let i = 0; i < r.rows.length; i++) {
                    review_list[r.rows[i].sign_language_word] = {
                        id: r.rows[i].sign_language_id,
                        success_count: r.rows[i].success_count,
                        fail_count: r.rows[i].fail_count
                    }
                }
            })
            .catch(e => {
                console.log(e);
                result = {
                    status: 400, message: "error on server while parsing review list"
                }
            });
        let query_word_list = {};
        for (let i = 0; i < words.length; i++) {
            console.log(words[i]);
            if (words[i].success === true) {
                user_score += 100;
                if (review_list[words[i].word]) {
                    review_list[words[i].word].success_count += 1;
                    query_word_list[words[i].word] = {
                        id: review_list[words[i].word].id,
                        success_count: review_list[words[i].word].success_count,
                        fail_count: review_list[words[i].word].fail_count
                    }
                } else {
                    const word_id = await __wordFind(words[i].word);
                    review_list[words[i].word] = {
                        id: word_id, success_count: 1, fail_count: 0
                    }
                    query_word_list[words[i].word] = {
                        id: word_id, success_count: 1, fail_count: 0
                    }
                }
            } else {
                if (review_list[words[i].word]) {
                    review_list[words[i].word].fail_count += 1;
                    query_word_list[words[i].word] = {
                        id: review_list[words[i].word].id,
                        success_count: review_list[words[i].word].success_count,
                        fail_count: review_list[words[i].word].fail_count
                    }
                } else {
                    const word_id = await __wordFind(words[i].word);
                    review_list[words[i].word] = {
                        id: word_id, success_count: 0, fail_count: 1
                    };
                    query_word_list[words[i].word] = {
                        id: word_id, success_count: 0, fail_count: 1
                    };
                }
            }
        }
        const update_query = `
            INSERT INTO capstone.user_sign_stat (user_id, sign_language_id, success_count, fail_count)
            VALUES ($1, $2, $3, $4)
            ON CONFLICT (user_id, sign_language_id)
            DO UPDATE SET success_count = $3, fail_count = $4;
        `;

        console.log(query_word_list);
        for (let key in query_word_list) {
            await connection.query(update_query, [user_id, query_word_list[key].id, query_word_list[key].success_count, query_word_list[key].fail_count])
                .then(r => {
                    console.log(r);
                })
                .catch(e => {
                    console.log(e);
                    result = {
                        status: 400, message: "error on server while updating user sign stat"
                    }
                });
        }
        const update_score_query = `
            UPDATE capstone."user"
            SET user_score = $1
            WHERE user_id = $2;
        `;
        await connection.query(update_score_query, [user_score, user_id])
            .then(r => {
                console.log(r);
            })
            .catch(e => {
                console.log(e);
                result = {
                    status: 400, message: "error on server while updating user score"
                }
            });

        result = {
            status: 200, message: "gameEnd success", score: user_score
        }
    } catch (err) {
        console.error('Error on gameEnd', err.message);
        result = {
            status: 400, message: "gameEnd failed"
        }
        return result;
    }
    return result;
}

async function __wordFetch() {
    const query = `
    SELECT * FROM capstone."sign_language"
    ORDER BY RANDOM()
    LIMIT 1;
    `;


    return await connection.query(query)
        .then(r => {
            return r.rows[0];
        })
        .catch(e => {
            throw e;
        })

}

async function __wordFind(word) {
    const query = `
    SELECT sign_language_id FROM capstone."sign_language"
    WHERE sign_language_word = $1;
    `;

    return await connection.query(query, [word])
        .then(r => {
            return r.rows[0].sign_language_id;
        })
        .catch(e => {
            throw e;
        })
}

module.exports = {
    responseGameStart, responseGameNext, responseGameEnd
}