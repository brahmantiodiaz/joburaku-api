require("dotenv").config();

module.exports = {
	development: {
		username: process.env.DB_USERNAME,
		password: process.env.DB_PASSWORD || null,
		database: process.env.DB_DATABASE,
		host: process.env.DB_HOST,
		dialect: process.env.DB_DIALECT,
		logging: false,
	},
	test: {
		username: process.env.DB_USERNAME,
		password: process.env.DB_PASSWORD || null,
		database: `${process.env.DB_DATABASE}_test`,
		host: process.env.DB_HOST,
		dialect: process.env.DB_DIALECT,
		logging: false,
	},
	production: {
		use_env_variable: "DATABASE_URL",
	},
};
