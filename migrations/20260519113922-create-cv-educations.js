"use strict";

module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.createTable("CvEducations", {
			id: {
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
				type: Sequelize.INTEGER,
			},
			UserId: {
				type: Sequelize.INTEGER,
				allowNull: false,
				references: { model: "Users", key: "id" },
				onUpdate: "CASCADE",
				onDelete: "CASCADE",
			},
			schoolName: { type: Sequelize.STRING(150), allowNull: false },
			degree: { type: Sequelize.STRING(150) },
			fieldOfStudy: { type: Sequelize.STRING(150) },
			score: { type: Sequelize.STRING(30) },
			startDate: { type: Sequelize.DATEONLY },
			endDate: { type: Sequelize.DATEONLY },
			description: { type: Sequelize.TEXT },
			createdAt: { allowNull: false, type: Sequelize.DATE },
			updatedAt: { allowNull: false, type: Sequelize.DATE },
		});
	},

	async down(queryInterface) {
		await queryInterface.dropTable("CvEducations");
	},
};
