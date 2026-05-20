"use strict";
const { Model } = require("sequelize");
const { required, requiredInteger } = require("../helpers/validators");
const { LanguageLevel } = require("../helpers/enums");

module.exports = (sequelize, DataTypes) => {
  class CvLanguage extends Model {
    static associate(models) {
      CvLanguage.belongsTo(models.User, { foreignKey: "UserId" });
    }
  }

  CvLanguage.init(
    {
      UserId: { type: DataTypes.INTEGER, allowNull: false, validate: requiredInteger("UserId") },
      language: { type: DataTypes.STRING(100), allowNull: false, validate: required("language") },
      level: DataTypes.ENUM(...Object.values(LanguageLevel)),
    },
    { sequelize, modelName: "CvLanguage" },
  );

  return CvLanguage;
};
