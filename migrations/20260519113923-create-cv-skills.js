"use strict";

module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.createTable("CvSkills", {
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
			name: { type: Sequelize.STRING(100), allowNull: false },
			category: { type: Sequelize.STRING(100) },
			createdAt: { allowNull: false, type: Sequelize.DATE },
			updatedAt: { allowNull: false, type: Sequelize.DATE },
		});
	},

	async down(queryInterface) {
		await queryInterface.dropTable("CvSkills");
	},
};
