const jwt = require("jsonwebtoken");
const UserModel = require("../models/UserModel");
const { SECRET } = require("../config");

function sign(user) {
  const token = jwt.sign({ userId: user._id }, SECRET, {
    expiresIn: "7d"
  });
  return token;
}

function decode(token) {
  const decoded = jwt.verify(token, SECRET);
  return decoded;
}

async function authenticate(token) {
  const decoded = decode(token);
  const { userId } = decoded;
  const user = await UserModel.findOne({ _id: userId });
  if (!user) {
    return {
      err: true,
      err_msg: "user does not exist in our system"
    };
  } else {
    return {
      err: false,
      userId
    };
  }
}

// const token = sign({ _id: "5e563de2e5b2f9be6abdd96a" });
// console.log("token : ", token);

module.exports = { sign, decode, authenticate };
