"use strict";
const { Model } = require("sequelize");
const { required, requiredInteger } = require("../helpers/validators");

module.exports = (sequelize, DataTypes) => {
  class CvEducation extends Model {
    static associate(models) {
      CvEducation.belongsTo(models.User, { foreignKey: "UserId" });
    }
  }

  CvEducation.init(
    {
      UserId: { type: DataTypes.INTEGER, allowNull: false, validate: requiredInteger("UserId") },
      schoolName: { type: DataTypes.STRING(150), allowNull: false, validate: required("schoolName") },
      degree: DataTypes.STRING(150),
      fieldOfStudy: DataTypes.STRING(150),
      score: DataTypes.STRING(30),
      startDate: DataTypes.DATEONLY,
      endDate: DataTypes.DATEONLY,
      description: DataTypes.TEXT,
    },
    { sequelize, modelName: "CvEducation" },
  );

  return CvEducation;
};
