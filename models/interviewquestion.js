"use strict";

const { Model } = require("sequelize");
const { required, requiredInteger } = require("../helpers/validators");
const { InterviewCategory } = require("../helpers/enums");

module.exports = (sequelize, DataTypes) => {
	class InterviewQuestion extends Model {
		static associate(models) {
			InterviewQuestion.belongsTo(models.User, {
				foreignKey: "UserId",
			});

			InterviewQuestion.belongsTo(models.JobApplication, {
				foreignKey: "JobApplicationId",
			});
		}
	}

	InterviewQuestion.init(
		{
			UserId: {
				type: DataTypes.INTEGER,
				allowNull: false,
				validate: requiredInteger("UserId"),
			},

			JobApplicationId: {
				type: DataTypes.INTEGER,
				allowNull: false,
				validate: requiredInteger("JobApplicationId"),
			},

			category: {
				type: DataTypes.ENUM(...Object.values(InterviewCategory)),
				allowNull: false,
				validate: required("category"),
			},

			question: {
				type: DataTypes.TEXT,
				allowNull: false,
				validate: required("question"),
			},

			suggestedAnswer: {
				type: DataTypes.TEXT,
			},

			userAnswer: {
				type: DataTypes.TEXT,
			},
		},
		{
			sequelize,
			modelName: "InterviewQuestion",
		},
	);

	return InterviewQuestion;
};
