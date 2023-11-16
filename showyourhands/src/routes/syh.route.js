const express = require('express');
const router = express.Router();
const loginController = require('../controllers/login.controller')
const signupController = require('../controllers/signup.controller')
const gameController = require('../controllers/game.controller')

router.post('/login', loginController.loginRequest);
router.post('/signup', signupController.signupRequest);

router.post('/game/start', gameController.gameStartRequest);
router.post('/game/next', gameController.gameNextRequest);

module.exports = router;
