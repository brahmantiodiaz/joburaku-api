const {
	JobApplication,
	UserProfile,
	CvSkill,
	CvLanguage,
	CvWorkExperience,
	CvCertification,
	CvEducation,
	InterviewQuestion,
} = require("../models");
const { errorName, InterviewCategory } = require("../helpers/enums");
const { AppError } = require("../models/utils/class");
const { generateInterviewQuestionsWithGemini } = require("../helpers/gemini");

async function findOwnedApplication(id, UserId) {
	const jobApplication = await JobApplication.findOne({
		where: {
			id,
			UserId,
		},
	});

	if (!jobApplication) {
		throw new AppError(errorName.NotFound, "Job application not found");
	}

	return jobApplication;
}

async function getUserCvData(UserId) {
	const userProfile = await UserProfile.findOne({
		where: { UserId },
		raw: true,
	});

	if (!userProfile) {
		throw new AppError(
			errorName.BadRequest,
			"Please complete your profile first",
		);
	}

	const [
		cvSkills,
		cvLanguages,
		cvWorkExperiences,
		cvCertifications,
		cvEducations,
	] = await Promise.all([
		CvSkill.findAll({ where: { UserId }, raw: true }),
		CvLanguage.findAll({ where: { UserId }, raw: true }),
		CvWorkExperience.findAll({ where: { UserId }, raw: true }),
		CvCertification.findAll({ where: { UserId }, raw: true }),
		CvEducation.findAll({ where: { UserId }, raw: true }),
	]);

	return {
		userProfile,
		cvData: {
			cvSkills,
			cvLanguages,
			cvWorkExperiences,
			cvCertifications,
			cvEducations,
		},
	};
}

function normalizeQuestions(aiQuestions, UserId, JobApplicationId) {
	if (!Array.isArray(aiQuestions) || aiQuestions.length === 0) {
		throw new AppError(
			errorName.BadRequest,
			"Failed to generate interview questions",
		);
	}

	return aiQuestions.map((item) => {
		const category = item.category;

		if (!Object.values(InterviewCategory).includes(category)) {
			throw new AppError(
				errorName.BadRequest,
				"Generated interview category is invalid",
			);
		}

		return {
			UserId,
			JobApplicationId,
			category,
			question: item.question,
			suggestedAnswer: item.suggestedAnswer,
			userAnswer: null,
		};
	});
}

class InterviewQuestionController {
	static async generateInterviewQuestions(req, res, next) {
		try {
			const { id } = req.params;
			const UserId = req.user.id;
			const { category } = req.body;
			const jobApplication = await findOwnedApplication(id, UserId);
			const { userProfile, cvData } = await getUserCvData(UserId);
			if (!category) {
				throw new AppError(
					errorName.BadRequest,
					"Interview category is required",
				);
			}

			if (!Object.values(InterviewCategory).includes(category)) {
				throw new AppError(
					errorName.BadRequest,
					"Interview category is invalid",
				);
			}

			const aiQuestions = await generateInterviewQuestionsWithGemini({
				userProfile,
				jobApplication,
				cvData,
				category,
			});

			const payload = normalizeQuestions(
				aiQuestions,
				UserId,
				jobApplication.id,
			);

			const interviewQuestions = await InterviewQuestion.bulkCreate(payload, {
				validate: true,
				returning: true,
			});

			res.status(201).json(interviewQuestions);
		} catch (error) {
			next(error);
		}
	}

	static async getInterviewQuestionsByApplication(req, res, next) {
		try {
			const { id } = req.params;
			const UserId = req.user.id;

			const jobApplication = await findOwnedApplication(id, UserId);

			const interviewQuestions = await InterviewQuestion.findAll({
				where: {
					UserId,
					JobApplicationId: jobApplication.id,
				},
				order: [["createdAt", "DESC"]],
			});

			res.status(200).json(interviewQuestions);
		} catch (error) {
			next(error);
		}
	}

	static async updateInterviewAnswer(req, res, next) {
		try {
			const { id } = req.params;
			const UserId = req.user.id;
			const { userAnswer } = req.body;

			if (!userAnswer) {
				throw new AppError(errorName.BadRequest, "User answer is required");
			}

			const interviewQuestion = await InterviewQuestion.findOne({
				where: {
					id,
					UserId,
				},
			});

			if (!interviewQuestion) {
				throw new AppError(errorName.NotFound, "Interview question not found");
			}

			await interviewQuestion.update({ userAnswer });

			res.status(200).json(interviewQuestion);
		} catch (error) {
			next(error);
		}
	}
}

module.exports = InterviewQuestionController;
