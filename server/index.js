const server = require("./config/express");

const PORTNUM = "45491";

server().listen(PORTNUM, () => {
    console.log(`check it out at here --> http://localhost:${PORTNUM}`);
});
