const express = require('express');
const router = express.Router();
const loginController = require('../controllers/login.controller')
const signupController = require('../controllers/signup.controller')
const gameController = require('../controllers/game.controller')
const mainController = require('../controllers/main.controller')

router.post('/login', loginController.loginRequest);
router.post('/signup', signupController.signupRequest);

router.post('/game/start', gameController.gameStartRequest);
router.post('/game/next', gameController.gameNextRequest);
router.post('/game/finish', gameController.gameNextRequest);

router.post('/main/signRequest', mainController.signRequest);

module.exports = router;
