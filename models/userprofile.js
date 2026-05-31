"use strict";
const { Model } = require("sequelize");
const {
	required,
	requiredInteger,
	urlOrEmpty,
} = require("../helpers/validators");

module.exports = (sequelize, DataTypes) => {
	class UserProfile extends Model {
		static associate(models) {
			UserProfile.belongsTo(models.User, { foreignKey: "UserId" });
		}
	}

	UserProfile.init(
		{
			UserId: {
				type: DataTypes.INTEGER,
				allowNull: false,
				unique: { msg: "User profile already exists" },
				validate: requiredInteger("UserId"),
			},
			fullName: {
				type: DataTypes.STRING(150),
				allowNull: false,
				validate: required("fullName"),
			},
			phoneNumber: DataTypes.STRING(30),
			address: DataTypes.STRING(150),
			linkedInUrl: {
				type: DataTypes.STRING(255),
				validate: urlOrEmpty("linkedInUrl"),
			},
			imageUrl: {
				type: DataTypes.STRING(255),
				validate: urlOrEmpty("imageUrl"),
			},
			professionalSummary: DataTypes.TEXT,
			targetRole: {
				type: DataTypes.STRING(100),
				allowNull: false,
				validate: required("targetRole"),
			},
		},
		{ sequelize, modelName: "UserProfile" },
	);

	return UserProfile;
};
