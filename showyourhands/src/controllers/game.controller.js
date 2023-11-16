const gameService = require('../services/game.service');


async function gameStartRequest(req, res, next) {
    try {
        console.log(req.body);
        const result = await gameService.responseGameStart(req.body.api);
        res.status(result.status).json(result);
    } catch (err) {
        console.error('Error on login', err.message);
        next(err)
    }
}