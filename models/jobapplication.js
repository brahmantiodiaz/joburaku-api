"use strict";
const { Model } = require("sequelize");
const {
	required,
	requiredInteger,
	urlOrEmpty,
} = require("../helpers/validators");
const { ApplicationStatus } = require("../helpers/enums");

module.exports = (sequelize, DataTypes) => {
	class JobApplication extends Model {
		static associate(models) {
			JobApplication.belongsTo(models.User, { foreignKey: "UserId" });
			JobApplication.hasMany(models.GeneratedCV, {
				foreignKey: "JobApplicationId",
			});

			JobApplication.hasMany(models.InterviewQuestion, {
				foreignKey: "JobApplicationId",
			});
		}
	}

	JobApplication.init(
		{
			UserId: {
				type: DataTypes.INTEGER,
				allowNull: false,
				validate: requiredInteger("UserId"),
			},
			companyName: {
				type: DataTypes.STRING(150),
				allowNull: false,
				validate: required("companyName"),
			},
			position: {
				type: DataTypes.STRING(150),
				allowNull: false,
				validate: required("position"),
			},
			jobDescription: {
				type: DataTypes.TEXT,
				allowNull: false,
				validate: required("jobDescription"),
			},
			jobUrl: { type: DataTypes.STRING(255), validate: urlOrEmpty("jobUrl") },
			location: DataTypes.STRING(150),
			salaryRange: DataTypes.STRING(100),
			status: {
				type: DataTypes.ENUM(...Object.values(ApplicationStatus)),
				allowNull: false,
				defaultValue: ApplicationStatus.WISHLIST,
			},
			appliedDate: DataTypes.DATEONLY,
			notes: DataTypes.TEXT,
		},
		{ sequelize, modelName: "JobApplication" },
	);

	return JobApplication;
};
