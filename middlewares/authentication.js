const { User } = require("../models");
const { verifyToken } = require("../helpers/jwt");
const { errorName } = require("../helpers/enums");
const { AppError } = require("../models/utils/class");

async function authentication(req, res, next) {
	try {
		const { authorization } = req.headers;
		if (!authorization) {
			throw new AppError(errorName.Unauthorized, "Invalid token");
		}

		const [type, token] = authorization.split(" ");

		if (type !== "Bearer" || !token) {
			throw new AppError(errorName.Unauthorized, "Invalid token");
		}

		const payload = verifyToken(token);

		const user = await User.findByPk(payload.id);

		if (!user) {
			throw new AppError(errorName.Unauthorized, "Invalid token");
		}

		req.user = {
			id: user.id,
			email: user.email,
			role: user.role,
		};

		next();
	} catch (error) {
		next(error);
	}
}

module.exports = authentication;
