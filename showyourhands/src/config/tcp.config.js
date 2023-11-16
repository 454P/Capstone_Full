const net = require('net');

const eof = Buffer.from("0000000000", "utf-8"); // "0000000000
//eof as byte

const client = net.connect({port: 8080}, () => {
    console.log('connected to server!');
    const startUpJson = {
        type: 4,
        api: "api",
    }

    client.write(JSON.stringify(startUpJson));
    client.write(eof);
});

module.exports = {
    client,
    eof
}