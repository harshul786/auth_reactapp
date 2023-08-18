const jwt = require("jsonwebtoken");
const User = require("../models/users");
require("dotenv").config();

const jwt_secret = process.env.JWTSECRET;

const auth = async (req, res, next) => {
  try {
    const token = req.header("Authentication").replace("Bearer ", "");
    const decoded = jwt.verify(token, jwt_secret);

    const user = await User.findOne({
      _id: decoded._id,
      "tokens.token": token,
    });

    if (!user) {
      throw new Error();
    }

    req.token = token;
    req.user = user;
    next();
  } catch (e) {
    res.status(401).send({ error: "Please Authenticate", e });
  }
};

module.exports = auth;
