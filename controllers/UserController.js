const { User } = require("../models");
const { checkPassword } = require("../helpers/bycrypt");
const { createToken } = require("../helpers/jwt");
const { errorName } = require("../helpers/enums");
const { AppError } = require("../models/utils/class");

class UserController {
  static async register(req, res, next) {
    try {
      const { name, email, username, password } = req.body;

      const user = await User.create({ name, email, username, password });

      res.status(201).json({
        id: user.id,
        name: user.name,
        email: user.email,
        username: user.username,
      });
    } catch (error) {
      next(error);
    }
  }

  static async login(req, res, next) {
    try {
      const { email, password } = req.body;

      if (!email) throw new AppError(errorName.BadRequest, "email is required");
      if (!password) throw new AppError(errorName.BadRequest, "password is required");

      const user = await User.findOne({ where: { email } });
      if (!user) throw new AppError(errorName.Unauthorized, "invalid email/password");

      const isValid = checkPassword(password, user.password);
      if (!isValid) throw new AppError(errorName.Unauthorized, "invalid email/password");

      const access_token = createToken({ id: user.id, email: user.email, username: user.username });

      res.status(200).json({
        access_token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          username: user.username,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async getCurrentUser(req, res, next) {
    try {
      res.status(200).json(req.user);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = UserController;
