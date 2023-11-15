const server = require("./config/express");

const PORTNUM = "8080";

server().listen(PORTNUM, () => {
    console.log(`check it out at here --> http://locolhost:${PORTNUM}`);
});
