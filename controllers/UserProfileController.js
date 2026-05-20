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

class UserProfileController {
  static async createUserProfile(req, res, next) {
    const transaction = await sequelize.transaction();

    try {
      const UserId = req.user.id;
      const {
        fullName,
        phoneNumber,
        address,
        linkedInUrl,
        imageUrl,
        professionalSummary,
        CvSkills,
        CvLanguages,
        CvWorkExperiences,
        CvCertifications,
        CvEducations,
      } = req.body;

      assertRequiredArray(req.body, "CvSkills");
      assertRequiredArray(req.body, "CvLanguages");
      assertRequiredArray(req.body, "CvWorkExperiences");
      assertRequiredArray(req.body, "CvCertifications");
      assertRequiredArray(req.body, "CvEducations");

      const userProfile = await UserProfile.create(
        { UserId, fullName, phoneNumber, address, linkedInUrl, imageUrl, professionalSummary },
        { transaction },
      );

      const cvSkills = await CvSkill.bulkCreate(
        CvSkills.map((skill) => ({ ...skill, UserId })),
        { transaction, validate: true },
      );

      const cvLanguages = await CvLanguage.bulkCreate(
        CvLanguages.map((language) => ({ ...language, UserId })),
        { transaction, validate: true },
      );

      const cvWorkExperiences = await CvWorkExperience.bulkCreate(
        CvWorkExperiences.map((workExperience) => ({ ...workExperience, UserId })),
        { transaction, validate: true },
      );

      const cvCertifications = await CvCertification.bulkCreate(
        CvCertifications.map((certification) => ({ ...certification, UserId })),
        { transaction, validate: true },
      );

      const cvEducations = await CvEducation.bulkCreate(
        CvEducations.map((education) => ({ ...education, UserId })),
        { transaction, validate: true },
      );

      await transaction.commit();

      res.status(201).json({
        userProfile,
        CvSkills: cvSkills,
        CvLanguages: cvLanguages,
        CvWorkExperiences: cvWorkExperiences,
        CvCertifications: cvCertifications,
        CvEducations: cvEducations,
      });
    } catch (error) {
      await transaction.rollback();
      next(error);
    }
  }
}

module.exports = UserProfileController;
