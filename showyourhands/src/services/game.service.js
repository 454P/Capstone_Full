const connection = require('../config/db.config');
async function responseGameStart(api){
    let result = null;

    try {
        const word = await __wordFetch();
        result = {
            status: 200,
            message: "gameStart success",
            word: word.sign_language_word,
            count: 1
        }
    } catch (err) {
        console.error('Error on gameStart', err.message);
        result = {
            status: 400,
            message: "gameStart failed",
            word: "null",
            count: 999
        }
        return result;
    }
    return result;
}

async function responseGameNext(api, count) {
    if (count >= 2) {
        return {
            status: 401,
            message: "Game End",
            word: "null",
            count: count
        }
    }
    let result = null;

    try {
        const word = await __wordFetch();
        result = {
            status: 200,
            message: "gameNext success",
            word: word.sign_language_word,
            count: count + 1
        }
    } catch (err) {
        console.error('Error on gameStart', err.message);
        result = {
            status: 400,
            message: "gameNext failed",
            word: "null",
            count: 999
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

module.exports = {
    responseGameStart,
    responseGameNext
}