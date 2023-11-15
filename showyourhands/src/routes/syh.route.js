const express = require('express');
const router = express.Router();
const loginController = require('../controllers/login.controller')
const signupController = require('../controllers/signup.controller')

router.post('/login', loginController.loginRequest);
router.post('/signup', signupController.signupRequest);

module.exports = router;
