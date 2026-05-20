const {
  sequelize,
  UserProfile,
  CvSkill,
  CvLanguage,
  CvWorkExperience,
  CvCertification,
  CvEducation,
} = require("../models");
const { errorName } = require("../helpers/enums");
const { AppError } = require("../models/utils/class");

function assertRequiredArray(payload, fieldName) {
  if (!Array.isArray(payload[fieldName])) {
    throw new AppError(errorName.BadRequest, `${fieldName} must be an array`);
  }

  if (payload[fieldName].length === 0) {
    throw new AppError(errorName.BadRequest, `${fieldName} is required`);
  }
}

function pickProfilePayload(body, UserId) {
  const {
    fullName,
    phoneNumber,
    address,
    linkedInUrl,
    imageUrl,
    professionalSummary,
  } = body;

  return {
    UserId,
    fullName,
    phoneNumber,
    address,
    linkedInUrl,
    imageUrl,
    professionalSummary,
  };
}

async function createCvCollections(body, UserId, transaction) {
  const cvSkills = await CvSkill.bulkCreate(
    body.CvSkills.map((skill) => ({ ...skill, UserId })),
    { transaction, validate: true },
  );

  const cvLanguages = await CvLanguage.bulkCreate(
    body.CvLanguages.map((language) => ({ ...language, UserId })),
    { transaction, validate: true },
  );

  const cvWorkExperiences = await CvWorkExperience.bulkCreate(
    body.CvWorkExperiences.map((workExperience) => ({ ...workExperience, UserId })),
    { transaction, validate: true },
  );

  const cvCertifications = await CvCertification.bulkCreate(
    body.CvCertifications.map((certification) => ({ ...certification, UserId })),
    { transaction, validate: true },
  );

  const cvEducations = await CvEducation.bulkCreate(
    body.CvEducations.map((education) => ({ ...education, UserId })),
    { transaction, validate: true },
  );

  return {
    CvSkills: cvSkills,
    CvLanguages: cvLanguages,
    CvWorkExperiences: cvWorkExperiences,
    CvCertifications: cvCertifications,
    CvEducations: cvEducations,
  };
}

async function getCvCollections(UserId) {
  const [
    cvSkills,
    cvLanguages,
    cvWorkExperiences,
    cvCertifications,
    cvEducations,
  ] = await Promise.all([
    CvSkill.findAll({ where: { UserId }, order: [["id", "ASC"]] }),
    CvLanguage.findAll({ where: { UserId }, order: [["id", "ASC"]] }),
    CvWorkExperience.findAll({ where: { UserId }, order: [["id", "ASC"]] }),
    CvCertification.findAll({ where: { UserId }, order: [["id", "ASC"]] }),
    CvEducation.findAll({ where: { UserId }, order: [["id", "ASC"]] }),
  ]);

  return {
    CvSkills: cvSkills,
    CvLanguages: cvLanguages,
    CvWorkExperiences: cvWorkExperiences,
    CvCertifications: cvCertifications,
    CvEducations: cvEducations,
  };
}

function validateProfilePayload(body) {
  assertRequiredArray(body, "CvSkills");
  assertRequiredArray(body, "CvLanguages");
  assertRequiredArray(body, "CvWorkExperiences");
  assertRequiredArray(body, "CvCertifications");
  assertRequiredArray(body, "CvEducations");
}

class UserProfileController {
  static async getProfile(req, res, next) {
    try {
      const UserId = req.user.id;

      const userProfile = await UserProfile.findOne({
        where: { UserId },
      });

      if (!userProfile) {
        throw new AppError(errorName.NotFound, "Profile not found");
      }

      const cvCollections = await getCvCollections(UserId);

      res.status(200).json({
        userProfile,
        ...cvCollections,
      });
    } catch (error) {
      next(error);
    }
  }

  static async createProfile(req, res, next) {
    const transaction = await sequelize.transaction();

    try {
      const UserId = req.user.id;

      validateProfilePayload(req.body);

      const existingProfile = await UserProfile.findOne({
        where: { UserId },
        transaction,
      });

      if (existingProfile) {
        throw new AppError(errorName.BadRequest, "Profile already exists");
      }

      const userProfile = await UserProfile.create(
        pickProfilePayload(req.body, UserId),
        { transaction },
      );

      const cvCollections = await createCvCollections(req.body, UserId, transaction);

      await transaction.commit();

      res.status(201).json({
        userProfile,
        ...cvCollections,
      });
    } catch (error) {
      await transaction.rollback();
      next(error);
    }
  }

  static async updateProfile(req, res, next) {
    const transaction = await sequelize.transaction();

    try {
      const UserId = req.user.id;

      validateProfilePayload(req.body);

      const userProfile = await UserProfile.findOne({
        where: { UserId },
        transaction,
      });

      if (!userProfile) {
        throw new AppError(errorName.NotFound, "Profile not found");
      }

      await userProfile.update(pickProfilePayload(req.body, UserId), { transaction });

      await Promise.all([
        CvSkill.destroy({ where: { UserId }, transaction }),
        CvLanguage.destroy({ where: { UserId }, transaction }),
        CvWorkExperience.destroy({ where: { UserId }, transaction }),
        CvCertification.destroy({ where: { UserId }, transaction }),
        CvEducation.destroy({ where: { UserId }, transaction }),
      ]);

      const cvCollections = await createCvCollections(req.body, UserId, transaction);

      await transaction.commit();

      res.status(200).json({
        userProfile,
        ...cvCollections,
      });
    } catch (error) {
      await transaction.rollback();
      next(error);
    }
  }
}

module.exports = UserProfileController;
