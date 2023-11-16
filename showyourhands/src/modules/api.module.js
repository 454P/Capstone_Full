const randToken = require('rand-token');

async function generateAPIkey(){
    return randToken.uid(128);
}

module.exports = {
    generateAPIkey
}