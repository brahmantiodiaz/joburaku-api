"use strict";

module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.createTable("InterviewQuestions", {
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

			category: {
				type: Sequelize.ENUM(
					"Technical",
					"Behavioral",
					"HR",
					"ProjectBased",
				),
				allowNull: false,
			},

			question: {
				type: Sequelize.TEXT,
				allowNull: false,
			},

			suggestedAnswer: {
				type: Sequelize.TEXT,
			},

			userAnswer: {
				type: Sequelize.TEXT,
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

	async down(queryInterface) {
		await queryInterface.dropTable("InterviewQuestions");
		await queryInterface.sequelize.query(
			'DROP TYPE IF EXISTS "enum_InterviewQuestions_category";',
		);
	},
};
