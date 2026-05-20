"use strict";
const { Model } = require("sequelize");
const { required, requiredInteger } = require("../helpers/validators");

module.exports = (sequelize, DataTypes) => {
  class CvWorkExperience extends Model {
    static associate(models) {
      CvWorkExperience.belongsTo(models.User, { foreignKey: "UserId" });
    }
  }

  CvWorkExperience.init(
    {
      UserId: { type: DataTypes.INTEGER, allowNull: false, validate: requiredInteger("UserId") },
      companyName: { type: DataTypes.STRING(150), allowNull: false, validate: required("companyName") },
      position: { type: DataTypes.STRING(150), allowNull: false, validate: required("position") },
      startDate: DataTypes.DATEONLY,
      endDate: DataTypes.DATEONLY,
      isCurrent: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
      description: DataTypes.TEXT,
    },
    { sequelize, modelName: "CvWorkExperience" },
  );

  return CvWorkExperience;
};
