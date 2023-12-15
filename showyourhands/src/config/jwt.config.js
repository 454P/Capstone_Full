const env = process.env;

const secret = env.JWT_SECRET;
const options = {
    algorithm: "HS256",
    expiresIn: "1h",
    issuer: "showyourhands",
};

module.exports = {
    secret,
    options,
}