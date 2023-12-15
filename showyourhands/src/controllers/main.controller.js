const mainService = require('../services/main.service');


async function userInfoRequest(req, res, next) {
    try {
        console.log(req.body);
        const result = await mainService.responseUserInfo(req.body.api);
        res.status(result.status).json(result);
    } catch (err) {
        console.error('Error on login', err.message);
        next(err)
    }
}

module.exports = {
    userInfoRequest
}