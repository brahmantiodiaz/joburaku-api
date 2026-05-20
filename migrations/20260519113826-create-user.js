"use strict";

module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.createTable("Users", {
			id: {
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
				type: Sequelize.INTEGER,
			},
			name: { type: Sequelize.STRING(100), allowNull: false },
			email: { type: Sequelize.STRING(150), allowNull: false, unique: true },
			username: { type: Sequelize.STRING(150), allowNull: false, unique: true },
			password: { type: Sequelize.STRING(255), allowNull: false },
			createdAt: { allowNull: false, type: Sequelize.DATE },
			updatedAt: { allowNull: false, type: Sequelize.DATE },
		});
	},

	async down(queryInterface) {
		await queryInterface.dropTable("Users");
	},
};
