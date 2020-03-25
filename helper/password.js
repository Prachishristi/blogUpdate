const bcrypt = require("bcrypt");
const { SALT_ROUNDS } = require("../config");

async function hash(password) {
  try {
    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    const hashedPassword = await bcrypt.hash(password, salt);
    return hashedPassword;
  } catch (error) {
    throw error;
  }
}
async function decode(originalPassword, hashedPassword) {
  try {
    const result = await bcrypt.compare(originalPassword, hashedPassword);
    return result;
  } catch (error) {
    return false;
  }
}

module.exports = { hash, decode };
