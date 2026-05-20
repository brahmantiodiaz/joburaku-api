"use strict";
const { Model } = require("sequelize");
const { required, requiredInteger, urlOrEmpty } = require("../helpers/validators");

module.exports = (sequelize, DataTypes) => {
  class CvCertification extends Model {
    static associate(models) {
      CvCertification.belongsTo(models.User, { foreignKey: "UserId" });
    }
  }

  CvCertification.init(
    {
      UserId: { type: DataTypes.INTEGER, allowNull: false, validate: requiredInteger("UserId") },
      name: { type: DataTypes.STRING(150), allowNull: false, validate: required("name") },
      issuer: DataTypes.STRING(150),
      issuedDate: DataTypes.DATEONLY,
      credentialUrl: { type: DataTypes.STRING(255), validate: urlOrEmpty("credentialUrl") },
      description: DataTypes.TEXT,
    },
    { sequelize, modelName: "CvCertification" },
  );

  return CvCertification;
};
