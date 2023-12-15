const express = require('express')
// simple express server

const app = express()

app.get('/', (req, res) => {
    res.send('Hello World');
})

app.listen(4549, () => {
    console.log('Server is up on port 4549');
})