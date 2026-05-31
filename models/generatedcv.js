"use strict";

const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
	class GeneratedCV extends Model {
		static associate(models) {
			GeneratedCV.belongsTo(models.User, {
				foreignKey: "UserId",
			});

			GeneratedCV.belongsTo(models.JobApplication, {
				foreignKey: "JobApplicationId",
			});
		}
	}

	GeneratedCV.init(
		{
			UserId: {
				type: DataTypes.INTEGER,
				allowNull: false,
				validate: {
					notNull: {
						msg: "UserId is required",
					},
					notEmpty: {
						msg: "UserId is required",
					},
					isInt: {
						msg: "UserId must be an integer",
					},
				},
			},

			JobApplicationId: {
				type: DataTypes.INTEGER,
				allowNull: false,
				validate: {
					notNull: {
						msg: "JobApplicationId is required",
					},
					notEmpty: {
						msg: "JobApplicationId is required",
					},
					isInt: {
						msg: "JobApplicationId must be an integer",
					},
				},
			},

			title: {
				type: DataTypes.STRING(150),
				allowNull: false,
				validate: {
					notNull: {
						msg: "Title is required",
					},
					notEmpty: {
						msg: "Title is required",
					},
				},
			},

			atsScore: {
				type: DataTypes.INTEGER,
				validate: {
					isInt: {
						msg: "ATS score must be an integer",
					},
					min: {
						args: [0],
						msg: "ATS score cannot be less than 0",
					},
					max: {
						args: [100],
						msg: "ATS score cannot be more than 100",
					},
				},
			},

			matchScore: {
				type: DataTypes.INTEGER,
				validate: {
					isInt: {
						msg: "Match score must be an integer",
					},
					min: {
						args: [0],
						msg: "Match score cannot be less than 0",
					},
					max: {
						args: [100],
						msg: "Match score cannot be more than 100",
					},
				},
			},

			keywordSuggestions: {
				type: DataTypes.TEXT,
			},

			missingKeywords: {
				type: DataTypes.TEXT,
			},

			summary: {
				type: DataTypes.TEXT,
			},

			skills: {
				type: DataTypes.TEXT,
			},

			experience: {
				type: DataTypes.TEXT,
			},

			education: {
				type: DataTypes.TEXT,
			},

			certifications: {
				type: DataTypes.TEXT,
			},

			fullContent: {
				type: DataTypes.TEXT,
				allowNull: false,
				validate: {
					notNull: {
						msg: "Full content is required",
					},
					notEmpty: {
						msg: "Full content is required",
					},
				},
			},

			contentJson: {
				type: DataTypes.JSONB,
				allowNull: false,
				validate: {
					notNull: {
						msg: "Content JSON is required",
					},
					notEmpty: {
						msg: "Content JSON is required",
					},
				},
			},
		},
		{
			sequelize,
			modelName: "GeneratedCV",
		},
	);

	return GeneratedCV;
};
