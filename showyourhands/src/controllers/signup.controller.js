const signupService = require('../services/signup.service')

async function signupRequest(req, res, next) {
    try {
        res.json(await signupService.responseSignup(req.body.id, req.body.password, req.body.nickname, req.body.email));
    } catch (err) {
        console.error('Error on login', err.message);
        next(err)
    }
}
 
module.exports = {
    signupRequest
}