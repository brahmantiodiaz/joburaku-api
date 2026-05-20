"use strict";

module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.createTable("CvCertifications", {
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
			name: { type: Sequelize.STRING(150), allowNull: false },
			issuer: { type: Sequelize.STRING(150) },
			issuedDate: { type: Sequelize.DATEONLY },
			credentialUrl: { type: Sequelize.STRING(255) },
			description: { type: Sequelize.TEXT },
			createdAt: { allowNull: false, type: Sequelize.DATE },
			updatedAt: { allowNull: false, type: Sequelize.DATE },
		});
	},

	async down(queryInterface) {
		await queryInterface.dropTable("CvCertifications");
	},
};
