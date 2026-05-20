"use strict";

module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.createTable("CvWorkExperiences", {
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
			companyName: { type: Sequelize.STRING(150), allowNull: false },
			position: { type: Sequelize.STRING(150), allowNull: false },
			startDate: { type: Sequelize.DATEONLY },
			endDate: { type: Sequelize.DATEONLY },
			isCurrent: {
				type: Sequelize.BOOLEAN,
				allowNull: false,
				defaultValue: false,
			},
			description: { type: Sequelize.TEXT },
			createdAt: { allowNull: false, type: Sequelize.DATE },
			updatedAt: { allowNull: false, type: Sequelize.DATE },
		});
	},

	async down(queryInterface) {
		await queryInterface.dropTable("CvWorkExperiences");
	},
};
