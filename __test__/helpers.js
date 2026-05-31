const {
	User,
	UserProfile,
	CvSkill,
	CvLanguage,
	CvWorkExperience,
	CvCertification,
	CvEducation,
	JobApplication,
	GeneratedCV,
	InterviewQuestion,
} = require("../models");
const { createToken } = require("../helpers/jwt");
const { ApplicationStatus, InterviewCategory, LanguageLevel } = require("../helpers/enums");

function generateToken(user) {
	return createToken({
		id: user.id,
		email: user.email,
		username: user.username,
	});
}

function userPayload(overrides = {}) {
	const unique = `${Date.now()}-${Math.floor(Math.random() * 100000)}`;

	return {
		name: "Test User",
		email: `test-user-${unique}@mail.com`,
		username: `testuser${unique}`.replace(/[^a-zA-Z0-9]/g, ""),
		password: "123456",
		...overrides,
	};
}

async function createTestUser(overrides = {}) {
	return await User.create(userPayload(overrides));
}

function profilePayload(overrides = {}) {
	return {
		fullName: "Brahmantio Diaz",
		phoneNumber: "08123456789",
		address: "Jakarta",
		linkedInUrl: "https://linkedin.com/in/brahmantiodiaz",
		imageUrl: "https://example.com/profile.jpg",
		professionalSummary: "Full Stack Developer with React and Express experience.",
		targetRole: "Full Stack Developer",
		skills: [
			{ name: "React", category: "Frontend" },
			{ name: "Express", category: "Backend" },
		],
		languages: [
			{ language: "Indonesian", level: LanguageLevel.NATIVE },
			{ language: "English", level: LanguageLevel.INTERMEDIATE },
		],
		workExperiences: [
			{
				companyName: "PT Test",
				position: "Full Stack Developer",
				startDate: "2025-01-01",
				endDate: "2025-12-31",
				isCurrent: false,
				description: "Built web applications using React and Express.",
			},
		],
		certifications: [
			{
				name: "Full Stack JavaScript",
				issuer: "Hacktiv8",
				issuedDate: "2026-05-01",
				credentialUrl: "https://example.com/certificate",
				description: "Bootcamp certificate.",
			},
		],
		educations: [
			{
				schoolName: "Hacktiv8",
				degree: "Bootcamp",
				fieldOfStudy: "Full Stack JavaScript",
				score: "A",
				startDate: "2026-01-01",
				endDate: "2026-05-01",
				description: "Intensive full stack program.",
			},
		],
		...overrides,
	};
}

async function createCompleteProfile(UserId, overrides = {}) {
	const payload = profilePayload(overrides);

	const userProfile = await UserProfile.create({
		UserId,
		fullName: payload.fullName,
		phoneNumber: payload.phoneNumber,
		address: payload.address,
		linkedInUrl: payload.linkedInUrl,
		imageUrl: payload.imageUrl,
		professionalSummary: payload.professionalSummary,
		targetRole: payload.targetRole,
	});

	const [skills, languages, workExperiences, certifications, educations] =
		await Promise.all([
			CvSkill.bulkCreate(payload.skills.map((item) => ({ ...item, UserId }))),
			CvLanguage.bulkCreate(
				payload.languages.map((item) => ({ ...item, UserId })),
			),
			CvWorkExperience.bulkCreate(
				payload.workExperiences.map((item) => ({ ...item, UserId })),
			),
			CvCertification.bulkCreate(
				payload.certifications.map((item) => ({ ...item, UserId })),
			),
			CvEducation.bulkCreate(
				payload.educations.map((item) => ({ ...item, UserId })),
			),
		]);

	return { userProfile, skills, languages, workExperiences, certifications, educations };
}

function applicationPayload(overrides = {}) {
	return {
		companyName: "Tokopedia",
		position: "Frontend Developer",
		jobDescription: "Build responsive UI using React and integrate REST API.",
		jobUrl: "https://example.com/jobs/frontend-developer",
		location: "Jakarta",
		salaryRange: "Rp8.000.000 - Rp12.000.000",
		status: ApplicationStatus.APPLIED,
		appliedDate: "2026-05-21",
		notes: "Apply via LinkedIn",
		...overrides,
	};
}

async function createApplication(UserId, overrides = {}) {
	return await JobApplication.create({
		UserId,
		...applicationPayload(overrides),
	});
}

function contentJsonPayload(overrides = {}) {
	return {
		personalInfo: {
			fullName: "Brahmantio Diaz",
			targetRole: "Full Stack Developer",
			email: "test@mail.com",
			phoneNumber: "08123456789",
			address: "Jakarta",
			linkedInUrl: "https://linkedin.com/in/brahmantiodiaz",
			image: null,
		},
		summary: "Full Stack Developer with React and Express experience.",
		skills: ["React", "Express", "PostgreSQL"],
		experience: [
			{
				companyName: "PT Test",
				position: "Full Stack Developer",
				period: "2025 - 2026",
				description: ["Built REST APIs", "Built React pages"],
			},
		],
		education: [
			{
				schoolName: "Hacktiv8",
				degree: "Bootcamp",
				period: "2026",
				description: "Full Stack JavaScript",
			},
		],
		certifications: [],
		...overrides,
	};
}

function generatedCvPayload(UserId, JobApplicationId, overrides = {}) {
	return {
		UserId,
		JobApplicationId,
		title: "CV Frontend Developer - Tokopedia",
		atsScore: 85,
		matchScore: 80,
		keywordSuggestions: "React, REST API, Git",
		missingKeywords: "TypeScript",
		summary: "Full Stack Developer with React and Express experience.",
		skills: "React, Express, PostgreSQL",
		experience: "Built REST APIs and React pages.",
		education: "Hacktiv8 Full Stack JavaScript",
		certifications: "Full Stack JavaScript",
		fullContent: "Professional Summary\nSkills\nExperience",
		contentJson: contentJsonPayload(),
		...overrides,
	};
}

async function createGeneratedCv(UserId, JobApplicationId, overrides = {}) {
	return await GeneratedCV.create(generatedCvPayload(UserId, JobApplicationId, overrides));
}

async function cleanupDatabase() {
	await InterviewQuestion.destroy({ truncate: true, restartIdentity: true, cascade: true });
	await GeneratedCV.destroy({ truncate: true, restartIdentity: true, cascade: true });
	await JobApplication.destroy({ truncate: true, restartIdentity: true, cascade: true });
	await CvCertification.destroy({ truncate: true, restartIdentity: true, cascade: true });
	await CvWorkExperience.destroy({ truncate: true, restartIdentity: true, cascade: true });
	await CvLanguage.destroy({ truncate: true, restartIdentity: true, cascade: true });
	await CvSkill.destroy({ truncate: true, restartIdentity: true, cascade: true });
	await CvEducation.destroy({ truncate: true, restartIdentity: true, cascade: true });
	await UserProfile.destroy({ truncate: true, restartIdentity: true, cascade: true });
	await User.destroy({ truncate: true, restartIdentity: true, cascade: true });
}

module.exports = {
	generateToken,
	userPayload,
	createTestUser,
	profilePayload,
	createCompleteProfile,
	applicationPayload,
	createApplication,
	contentJsonPayload,
	generatedCvPayload,
	createGeneratedCv,
	cleanupDatabase,
};
