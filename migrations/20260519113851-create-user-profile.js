"use strict";

module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.createTable("UserProfiles", {
			id: {
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
				type: Sequelize.INTEGER,
			},
			UserId: {
				type: Sequelize.INTEGER,
				allowNull: false,
				unique: true,
				references: { model: "Users", key: "id" },
				onUpdate: "CASCADE",
				onDelete: "CASCADE",
			},
			fullName: { type: Sequelize.STRING(150), allowNull: false },
			phoneNumber: { type: Sequelize.STRING(30) },
			address: { type: Sequelize.STRING(150) },
			linkedInUrl: { type: Sequelize.STRING(255) },
			imageUrl: { type: Sequelize.STRING(255) },
			professionalSummary: { type: Sequelize.TEXT },
			createdAt: { allowNull: false, type: Sequelize.DATE },
			updatedAt: { allowNull: false, type: Sequelize.DATE },
		});
	},

	async down(queryInterface) {
		await queryInterface.dropTable("UserProfiles");
	},
};
