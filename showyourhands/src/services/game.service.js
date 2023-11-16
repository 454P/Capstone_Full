async function responseGameStart(){
    const query = `
    SELECT * FROM capstone."sign_language"
    ORDER BY RANDOM()
    LIMIT 1;
    `;

    let result = null;

    await connection.query(query)
        .then(r => {
            const row = r.rows[0];
            result = {
                status: 200,
                message: "game start",
                word: row.sign_language_word
            }
        })
        .catch(e => {
            console.log(e);
            result = {
                status: 401,
                message: "game start failed"
            }
        })

    return result;
}