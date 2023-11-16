const loginService = require("../services/login.service");


async function gameStartRequest(req, res, next) {
    try {
        console.log(req.body);
        const result = await loginService.responseLogin(req.body.id, req.body.password);
        res.status(result.status).json(result);
    } catch (err) {
        console.error('Error on login', err.message);
        next(err)
    }
}