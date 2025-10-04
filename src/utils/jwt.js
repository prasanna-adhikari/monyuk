const jwt = require("jsonwebtoken");

function signJwt(payload, opts = {}) {
  const secret = process.env.JWT_SECRET;
  const expiresIn = opts.expiresIn || process.env.JWT_EXPIRES || "7d";
  return jwt.sign(payload, secret, { expiresIn });
}

function verifyJwt(token) {
  const secret = process.env.JWT_SECRET;
  return jwt.verify(token, secret);
}

module.exports = { signJwt, verifyJwt };
