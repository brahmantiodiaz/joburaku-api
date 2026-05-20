const bcrypt = require("bcryptjs");

function hashPassword(password) {
  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync(password, salt);

  return hash;
}

function checkPassword(inputPassword, hashedPassword) {
  return bcrypt.compareSync(inputPassword, hashedPassword);
}

module.exports = { hashPassword, checkPassword };
