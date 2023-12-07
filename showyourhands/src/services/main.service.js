// const client = require('../config/tcp.config').client;
// const eof = require('../config/tcp.config').eof;
//
// async function responseSignRequest(api, word){
//     const signRequestJson = {
//         type: 4,
//         api: api,
//         word: word
//     }
//     client.write(JSON.stringify(signRequestJson));
//     client.write(eof);
//
//     await client.on('data', (data) => {
//         console.log(data.toString());
//     });
//
//     return {
//         status: 200,
//         message: "signRequest success"
//     }
// }
//
// module.exports = {
//     responseSignRequest
// }