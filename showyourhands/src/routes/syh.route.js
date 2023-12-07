const express = require('express');
const router = express.Router();
const loginController = require('../controllers/login.controller')
const signupController = require('../controllers/signup.controller')
const gameController = require('../controllers/game.controller')
const mainController = require('../controllers/main.controller')
const settingController = require('../controllers/setting.controller')

router.post('/login', loginController.loginRequest);
router.post('/signup', signupController.signupRequest);

router.post('/game/start', gameController.gameStartRequest);
router.post('/game/next', gameController.gameNextRequest);
router.post('/game/end', gameController.gameEndRequest);

router.post('/main/userInfo', mainController.userInfoRequest);

router.post('/setting/review', settingController.reviewRequest);

module.exports = router;
