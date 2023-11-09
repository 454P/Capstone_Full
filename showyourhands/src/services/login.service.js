async function responseLogin(id, pw){
    const result = {
        status: 200,
        nickname: "test",
        token: "lol"
    }

    return result;
}

module.exports = {
    responseLogin
}