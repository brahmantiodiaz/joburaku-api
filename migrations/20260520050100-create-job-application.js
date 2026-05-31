"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("JobApplications", {
      id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
      UserId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "Users", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      companyName: { type: Sequelize.STRING(150), allowNull: false },
      position: { type: Sequelize.STRING(150), allowNull: false },
      jobDescription: { type: Sequelize.TEXT, allowNull: false },
      jobUrl: { type: Sequelize.STRING(255) },
      location: { type: Sequelize.STRING(150) },
      salaryRange: { type: Sequelize.STRING(100) },
      status: {
        type: Sequelize.ENUM("Wishlist", "Applied", "Interview", "Offering", "Rejected", "Accepted"),
        allowNull: false,
        defaultValue: "Wishlist",
      },
      appliedDate: { type: Sequelize.DATEONLY },
      notes: { type: Sequelize.TEXT },
      createdAt: { allowNull: false, type: Sequelize.DATE },
      updatedAt: { allowNull: false, type: Sequelize.DATE },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("JobApplications");
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_JobApplications_status";');
  },
};
