async function responseGameStart(api){
    let result = null;

    try {
        const word = await wordFetch();
        result = {
            status: 200,
            message: "gameStart success",
            word: word.sign_language_word,
            count: 1
        }
    } catch (err) {
        console.error('Error on gameStart', err.message);
        result = {
            status: 401,
            message: "gameStart failed",
            word: "null"
        }
        return result;
    }
    return result;
}

async function gameNext() {

}

async function wordFetch() {
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