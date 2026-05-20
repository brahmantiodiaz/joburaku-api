const { statusCode, errorName } = require("../helpers/enums");

function errorHandler(err, req, res, next) {
	console.log(err);
	const errorCode =
		err.name === "HttpError" ? err.statusCode : statusCode[err.name] || 500;

	let message = err.message;

	if (
		err.name === errorName.SequelizeValidationError ||
		err.name === errorName.SequelizeUniqueConstraintError
	) {
		message = err.errors[0].message;
	}

	if (err.name === errorName.JsonWebTokenError) {
		message = "Invalid token";
	}

	if (errorCode === 500) {
		message = "Internal server error";
	}

	res.status(errorCode).json({ message });
}

module.exports = errorHandler;
