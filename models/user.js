"use strict";
const { Model } = require("sequelize");
const { required } = require("../helpers/validators");
const { hashPassword } = require("../helpers/bcrypt");

module.exports = (sequelize, DataTypes) => {
	class User extends Model {
		static associate(models) {
			User.hasOne(models.UserProfile, { foreignKey: "UserId" });
			User.hasMany(models.CvEducation, { foreignKey: "UserId" });
			User.hasMany(models.CvSkill, { foreignKey: "UserId" });
			User.hasMany(models.CvLanguage, { foreignKey: "UserId" });
			User.hasMany(models.CvWorkExperience, { foreignKey: "UserId" });
			User.hasMany(models.CvCertification, { foreignKey: "UserId" });
		}
	}

	User.init(
		{
			name: {
				type: DataTypes.STRING(100),
				allowNull: false,
				validate: required("name"),
			},
			email: {
				type: DataTypes.STRING(150),
				allowNull: false,
				unique: { msg: "Email already exists" },
				validate: {
					isEmail: { msg: "email format is invalid" },
					...required("email"),
				},
			},
			username: {
				type: DataTypes.STRING(150),
				allowNull: false,
				unique: { msg: "Username already exists" },
				validate: required("username"),
			},
			password: {
				type: DataTypes.STRING(255),
				allowNull: false,
				validate: {
					len: { args: [5], msg: "Password minimum 5 characters" },
					...required("Password"),
				},
			},
		},
		{ sequelize, modelName: "User" },
	);

	User.beforeCreate((user) => {
		user.password = hashPassword(user.password);
	});

	User.beforeUpdate((user) => {
		if (user.changed("password")) {
			user.password = hashPassword(user.password);
		}
	});

	return User;
};
