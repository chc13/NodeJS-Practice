const allowedOrigins = require("../config/allowedOrigins");

//if origin sending request is allowed, set header to true for CORS
const credentials = (req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.headers("Access-Control-Allow-Credentials", true);
  }
  next();
};

module.exports = credentials;
