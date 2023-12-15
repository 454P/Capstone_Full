require('dotenv').config({path: './src/config/.env'});
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser')
// simple express server
const port = process.env.PORT || 8000;
const app = express();
app.use(express.static('public'));


const syhRouter = require('./src/routes/syh.route');
const configs = require('./src/config/general.config');

app.use(cors(configs.corsOptions));
app.use(express.json());
app.use(express.urlencoded( {extended : false } ));
app.use('/', syhRouter);

app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    console.error(err.message, err.stack);
    res.status(statusCode).json({'message': err.message});

    return;
});

app.listen(port, '0.0.0.0', () => {
    console.log(`Example app listening at http://localhost:${port}`);
});