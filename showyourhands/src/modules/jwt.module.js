const randToken = require('rand-token');
const jwt = require('jsonwebtoken');
const secretKey = require('../config/jwt.config').secret;
const options = require('../config/jwt.config').options;

const TOKEN_EXPIRED = -3;
const TOKEN_INVALID = -2;

async function signupToken(id, login_id, email) {
    const payload = {
        idx: id,
        login_id: login_id,
        email: email,
    };
    return {
        token: jwt.sign(payload, secretKey, options),
        refreshToken: randToken.uid(256)
    };
}

async function verifyToken(token) {
    let decoded;
    try {
        decoded = jwt.verify(token, secretKey);
    } catch (e) {
        if (e.message === 'jwt expired') {
            console.log('expired token');
            return TOKEN_EXPIRED;
        } else if (e.message === 'invalid token') {
            console.log('invalid token');
            return TOKEN_INVALID;
        } else {
            console.log("invalid token");
            return TOKEN_INVALID;
        }
    }
    return decoded;
}

module.exports = {
    signupToken,
    verifyToken
}