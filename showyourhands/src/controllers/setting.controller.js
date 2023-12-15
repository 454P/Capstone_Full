const settingService = require('../services/setting.service');

async function reviewRequest(req, res, next) {
    try {
        console.log(req.body);
        const result = await settingService.responseReview(req.body.api);
        res.status(result.status).json(result);
    } catch (err) {
        console.error('Error on login', err.message);
        next(err)
    }
}

module.exports = {
    reviewRequest
}