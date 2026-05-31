"use strict";

module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.createTable("GeneratedCVs", {
			id: {
				type: Sequelize.INTEGER,
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
			},

			UserId: {
				type: Sequelize.INTEGER,
				allowNull: false,
				references: {
					model: "Users",
					key: "id",
				},
				onUpdate: "CASCADE",
				onDelete: "CASCADE",
			},

			JobApplicationId: {
				type: Sequelize.INTEGER,
				allowNull: false,
				references: {
					model: "JobApplications",
					key: "id",
				},
				onUpdate: "CASCADE",
				onDelete: "CASCADE",
			},

			title: {
				type: Sequelize.STRING(150),
				allowNull: false,
			},

			atsScore: {
				type: Sequelize.INTEGER,
			},

			matchScore: {
				type: Sequelize.INTEGER,
			},

			keywordSuggestions: {
				type: Sequelize.TEXT,
			},

			missingKeywords: {
				type: Sequelize.TEXT,
			},

			summary: {
				type: Sequelize.TEXT,
			},

			skills: {
				type: Sequelize.TEXT,
			},

			experience: {
				type: Sequelize.TEXT,
			},

			education: {
				type: Sequelize.TEXT,
			},

			certifications: {
				type: Sequelize.TEXT,
			},

			fullContent: {
				type: Sequelize.TEXT,
				allowNull: false,
			},

			contentJson: {
				type: Sequelize.JSONB,
				allowNull: false,
			},

			createdAt: {
				type: Sequelize.DATE,
				allowNull: false,
				defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
			},

			updatedAt: {
				type: Sequelize.DATE,
				allowNull: false,
				defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
			},
		});
	},

	async down(queryInterface, Sequelize) {
		await queryInterface.dropTable("GeneratedCVs");
	},
};
