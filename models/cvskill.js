"use strict";
const { Model } = require("sequelize");
const { required, requiredInteger } = require("../helpers/validators");

module.exports = (sequelize, DataTypes) => {
  class CvSkill extends Model {
    static associate(models) {
      CvSkill.belongsTo(models.User, { foreignKey: "UserId" });
    }
  }

  CvSkill.init(
    {
      UserId: { type: DataTypes.INTEGER, allowNull: false, validate: requiredInteger("UserId") },
      name: { type: DataTypes.STRING(100), allowNull: false, validate: required("name") },
      category: DataTypes.STRING(100),
    },
    { sequelize, modelName: "CvSkill" },
  );

  return CvSkill;
};
