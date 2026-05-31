const {
	sequelize,
	UserProfile,
	CvSkill,
	CvLanguage,
	CvWorkExperience,
	CvCertification,
	CvEducation,
	User,
} = require("../models");
const { errorName } = require("../helpers/enums");
const cloudinary = require("../helpers/cloudinary");
const { AppError } = require("../models/utils/class");

function assertRequiredArray(payload, fieldName) {
	if (!Array.isArray(payload[fieldName]))
		throw new AppError(errorName.BadRequest, `${fieldName} must be an array`);
	if (payload[fieldName].length === 0)
		throw new AppError(errorName.BadRequest, `${fieldName} is required`);
}

function validatePayload(body) {
	assertRequiredArray(body, "skills");
	assertRequiredArray(body, "languages");
	assertRequiredArray(body, "workExperiences");
	assertRequiredArray(body, "certifications");
	assertRequiredArray(body, "educations");
}

function profilePayload(body, UserId) {
	const {
		fullName,
		phoneNumber,
		address,
		linkedInUrl,
		imageUrl,
		professionalSummary,
		targetRole,
	} = body;

	return {
		UserId,
		fullName,
		phoneNumber,
		address,
		linkedInUrl,
		imageUrl,
		professionalSummary,
		targetRole,
	};
}

async function getCollections(UserId) {
	const [skills, languages, workExperiences, certifications, educations] =
		await Promise.all([
			CvSkill.findAll({ where: { UserId }, order: [["id", "ASC"]] }),
			CvLanguage.findAll({ where: { UserId }, order: [["id", "ASC"]] }),
			CvWorkExperience.findAll({
				where: { UserId },
				order: [["id", "ASC"]],
			}),
			CvCertification.findAll({
				where: { UserId },
				order: [["id", "ASC"]],
			}),
			CvEducation.findAll({ where: { UserId }, order: [["id", "ASC"]] }),
		]);

	return {
		skills,
		languages,
		workExperiences,
		certifications,
		educations,
	};
}

async function createCollections(body, UserId, transaction) {
	const skills = await CvSkill.bulkCreate(
		body.skills.map((e) => ({ ...e, UserId })),
		{ transaction, validate: true },
	);

	const languages = await CvLanguage.bulkCreate(
		body.languages.map((e) => ({ ...e, UserId })),
		{ transaction, validate: true },
	);

	const workExperiences = await CvWorkExperience.bulkCreate(
		body.workExperiences.map((e) => ({ ...e, UserId })),
		{ transaction, validate: true },
	);

	const certifications = await CvCertification.bulkCreate(
		body.certifications.map((e) => ({ ...e, UserId })),
		{ transaction, validate: true },
	);

	const educations = await CvEducation.bulkCreate(
		body.educations.map((e) => ({ ...e, UserId })),
		{ transaction, validate: true },
	);

	return {
		skills,
		languages,
		workExperiences,
		certifications,
		educations,
	};
}

class UserProfileController {
	static async getProfile(req, res, next) {
		try {
			const UserId = req.user.id;
			const userProfile = await UserProfile.findOne({ where: { UserId } });
			if (!userProfile)
				throw new AppError(errorName.NotFound, "Profile not found");
			const collections = await getCollections(UserId);
			res.status(200).json({ userProfile, ...collections });
		} catch (error) {
			next(error);
		}
	}

	static async createProfile(req, res, next) {
		const transaction = await sequelize.transaction();
		try {
			const UserId = req.user.id;
			validatePayload(req.body);
			const exists = await UserProfile.findOne({
				where: { UserId },
				transaction,
			});
			if (exists)
				throw new AppError(errorName.BadRequest, "Profile already exists");
			const userProfile = await UserProfile.create(
				profilePayload(req.body, UserId),
				{ transaction },
			);
			const collections = await createCollections(
				req.body,
				UserId,
				transaction,
			);
			await transaction.commit();
			res.status(201).json({ userProfile, ...collections });
		} catch (error) {
			await transaction.rollback();
			next(error);
		}
	}

	static async updateProfile(req, res, next) {
		const transaction = await sequelize.transaction();
		try {
			const UserId = req.user.id;
			validatePayload(req.body);
			const userProfile = await UserProfile.findOne({
				where: { UserId },
				transaction,
			});
			if (!userProfile)
				throw new AppError(errorName.NotFound, "Profile not found");
			await userProfile.update(profilePayload(req.body, UserId), {
				transaction,
			});
			await CvSkill.destroy({ where: { UserId }, transaction });
			await CvLanguage.destroy({ where: { UserId }, transaction });
			await CvWorkExperience.destroy({ where: { UserId }, transaction });
			await CvCertification.destroy({ where: { UserId }, transaction });
			await CvEducation.destroy({ where: { UserId }, transaction });
			const collections = await createCollections(
				req.body,
				UserId,
				transaction,
			);
			await userProfile.reload({ transaction });
			await transaction.commit();
			res.status(200).json({ userProfile, ...collections });
		} catch (error) {
			await transaction.rollback();
			next(error);
		}
	}

	static async createUserProfile(req, res, next) {
		return UserProfileController.createProfile(req, res, next);
	}

	static async updateUserImage(req, res, next) {
		try {
			const { id } = req.user;
			const user = await User.findByPk(id);
			if (!user) {
				throw new AppError(errorName.NotFound, `user with id ${id} not found`);
			}
			if (!req.file) {
				throw new AppError(errorName.BadRequest, "Image is required");
			}
			const base64Img = req.file.buffer.toString("base64");
			const base64DataUri = `data:${req.file.mimetype};base64,${base64Img}`;
			const result = await cloudinary.uploader.upload(base64DataUri, {
				folder: "Joburaku/users",
				public_id: `Joburaku-user${id}`,
				overwrite: true,
				invalidate: true,
				resource_type: "image",
			});

			await UserProfile.update(
				{ imageUrl: result.secure_url },
				{ where: { UserId: id } },
			);

			res.status(200).json({
				message: `Your profile picture success to update`,
			});
		} catch (error) {
			next(error);
		}
	}
}

module.exports = UserProfileController;
