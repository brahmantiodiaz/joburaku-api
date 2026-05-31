const {
	JobApplication,
	UserProfile,
	CvSkill,
	CvLanguage,
	CvWorkExperience,
	CvCertification,
	CvEducation,
	GeneratedCV,
} = require("../models");
const path = require("path");
const ejs = require("ejs");
const puppeteer = require("puppeteer");
const { errorName } = require("../helpers/enums");
const { AppError } = require("../models/utils/class");
const { generateCvWithGemini } = require("../helpers/gemini");

class GeneratedCvController {
	static async getGeneratedCvsByApplication(req, res, next) {
		try {
			const { id } = req.params;
			const UserId = req.user.id;

			const jobApplication = await JobApplication.findOne({
				where: {
					id,
					UserId,
				},
			});

			if (!jobApplication) {
				throw new AppError(errorName.NotFound, "Job application not found");
			}

			const generatedCvs = await GeneratedCV.findAll({
				where: {
					JobApplicationId: id,
					UserId,
				},
				order: [["createdAt", "DESC"]],
			});

			res.status(200).json(generatedCvs);
		} catch (error) {
			next(error);
		}
	}

	static async getGeneratedCvById(req, res, next) {
		try {
			const { id } = req.params;
			const UserId = req.user.id;

			const generatedCv = await GeneratedCV.findOne({
				where: {
					id,
					UserId,
				},
			});

			if (!generatedCv) {
				throw new AppError(errorName.NotFound, "Generated CV not found");
			}

			res.status(200).json(generatedCv);
		} catch (error) {
			next(error);
		}
	}

	static async createGeneratedCv(req, res, next) {
		try {
			const { id } = req.params;
			const UserId = req.user.id;

			const jobApplication = await JobApplication.findOne({
				where: {
					id,
					UserId,
				},
			});

			if (!jobApplication) {
				throw new AppError(errorName.NotFound, "Job application not found");
			}

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

			const cvSkills = await CvSkill.findAll({ where: { UserId }, raw: true });
			const cvLanguages = await CvLanguage.findAll({
				where: { UserId },
				raw: true,
			});
			const cvWorkExperiences = await CvWorkExperience.findAll({
				where: { UserId },
				raw: true,
			});
			const cvCertifications = await CvCertification.findAll({
				where: { UserId },
				raw: true,
			});
			const cvEducations = await CvEducation.findAll({
				where: { UserId },
				raw: true,
			});
			const aiResult = await generateCvWithGemini({
				userProfile,
				jobApplication,
				cvData: {
					cvSkills,
					cvLanguages,
					cvWorkExperiences,
					cvCertifications,
					cvEducations,
				},
			});

			const generatedCv = await GeneratedCV.create({
				UserId,
				JobApplicationId: jobApplication.id,
				title: aiResult.title,
				atsScore: aiResult.atsScore,
				matchScore: aiResult.matchScore,
				keywordSuggestions: aiResult.keywordSuggestions,
				missingKeywords: aiResult.missingKeywords,
				summary: aiResult.summary,
				skills: aiResult.skills,
				experience: aiResult.experience,
				education: aiResult.education,
				certifications: aiResult.certifications,
				fullContent: aiResult.fullContent,
				contentJson: aiResult.contentJson,
			});

			res.status(201).json(generatedCv);
		} catch (error) {
			next(error);
		}
	}

	static async downloadGeneratedCv(req, res, next) {
		let browser;

		try {
			const { id } = req.params;
			const UserId = req.user.id;

			const generatedCv = await GeneratedCV.findOne({
				where: {
					id,
					UserId,
				},
			});
			// console.log(generatedCv.dataValues);

			if (!generatedCv) {
				throw new AppError(errorName.NotFound, "Generated CV not found");
			}

			if (!generatedCv.contentJson) {
				throw new AppError(
					errorName.BadRequest,
					"Generated CV content is empty",
				);
			}

			const templatePath = path.join(__dirname, "../views/cv/template.ejs");
			const userProfile = await UserProfile.findOne({ where: { UserId } });
			if (userProfile.imageUrl) {
				generatedCv.contentJson.personalInfo.image = userProfile.imageUrl;
			}

			// console.log(generatedCv.contentJson);
			const html = await ejs.renderFile(templatePath, generatedCv.contentJson);

			const launchOptions = {
				headless: true,
				args: [
					"--no-sandbox",
					"--disable-setuid-sandbox",
					"--disable-dev-shm-usage",
				],
			};

			if (process.env.PUPPETEER_EXECUTABLE_PATH) {
				launchOptions.executablePath = process.env.PUPPETEER_EXECUTABLE_PATH;
			}

			browser = await puppeteer.launch(launchOptions);

			const page = await browser.newPage();

			await page.setContent(html, {
				waitUntil: "networkidle0",
			});

			const pdfBuffer = await page.pdf({
				format: "A4",
				printBackground: true,
				margin: {
					top: "16mm",
					right: "16mm",
					bottom: "16mm",
					left: "16mm",
				},
			});

			const safeTitle = generatedCv.title
				.replace(/[^a-z0-9]/gi, "-")
				.toLowerCase();

			res.setHeader("Content-Type", "application/pdf");
			res.setHeader(
				"Content-Disposition",
				`attachment; filename="${safeTitle || "generated-cv"}.pdf"`,
			);

			return res.send(pdfBuffer);
		} catch (error) {
			next(error);
		} finally {
			if (browser) {
				await browser.close();
			}
		}
	}

	static async deleteGeneratedCv(req, res, next) {
		try {
			const { id } = req.params;
			const UserId = req.user.id;

			const generatedCv = await GeneratedCV.findOne({
				where: {
					id,
					UserId,
				},
			});

			if (!generatedCv) {
				throw new AppError(errorName.NotFound, "Generated CV not found");
			}

			await generatedCv.destroy();

			res.status(200).json({
				message: "Generated CV deleted successfully",
			});
		} catch (error) {
			next(error);
		}
	}
}

module.exports = GeneratedCvController;
