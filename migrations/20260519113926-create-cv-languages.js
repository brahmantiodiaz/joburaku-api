"use strict";

module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.createTable("CvLanguages", {
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
			language: { type: Sequelize.STRING(100), allowNull: false },
			level: {
				type: Sequelize.ENUM(
					"Beginner",
					"Intermediate",
					"Advanced",
					"Fluent",
					"Native",
				),
			},
			createdAt: { allowNull: false, type: Sequelize.DATE },
			updatedAt: { allowNull: false, type: Sequelize.DATE },
		});
	},

	async down(queryInterface) {
		await queryInterface.dropTable("CvLanguages");
		await queryInterface.sequelize.query(
			'DROP TYPE IF EXISTS "enum_CvLanguages_level";',
		);
	},
};
