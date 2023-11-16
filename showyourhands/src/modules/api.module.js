const randToken = require('rand-token');

async function generateAPIkey(){
    return randToken.uid(256);
}

module.exports = {
    generateAPIkey
}