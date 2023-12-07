const signupService = require('../services/signup.service')

async function signupRequest(req, res, next) {
    try {
        console.log(req.body);
        const result = await signupService.responseSignup(req.body.id, req.body.password, req.body.nickname, req.body.email);
        res.status(result.status).json(result);
    } catch (err) {
        console.error('Error on signup', err.message);
        next(err)
    }
}
 
module.exports = {
    signupRequest
}