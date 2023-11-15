const loginService = require('../services/login.service')

async function loginRequest(req, res, next) {
    try {
        res.json(await loginService.responseLogin("a", "b"));
    } catch (err) {
        console.error('Error on login', err.message);
        next(err)
    }
}
 
module.exports = {
    loginRequest
}