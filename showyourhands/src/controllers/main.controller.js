const mainService = require('../services/main.service');

async function signRequest(req, res, next) {
    try {
        console.log(req.body);
        const result = await mainService.responseSignRequest(req.body.api, req.body.word);
        res.status(result.status).json(result);
    } catch (err) {
        console.error('Error on login', err.message);
        next(err)
    }
}