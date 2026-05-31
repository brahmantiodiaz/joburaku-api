"use strict";

module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.addColumn("Users", "resetPasswordToken", {
			type: Sequelize.STRING,
		});

		await queryInterface.addColumn("Users", "resetPasswordExpiredAt", {
			type: Sequelize.DATE,
		});
	},

	async down(queryInterface) {
		await queryInterface.removeColumn("Users", "resetPasswordExpiredAt");
		await queryInterface.removeColumn("Users", "resetPasswordToken");
	},
};
