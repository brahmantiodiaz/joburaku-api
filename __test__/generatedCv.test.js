jest.mock("../helpers/gemini", () => ({
	generateCvWithGemini: jest.fn(),
	generateInterviewQuestionsWithGemini: jest.fn(),
}));

jest.mock("ejs", () => ({
	renderFile: jest.fn().mockResolvedValue("<html><body>Mock CV</body></html>"),
}));

jest.mock("puppeteer", () => ({
	launch: jest.fn(),
}));

const request = require("supertest");
const app = require("../app");
const ejs = require("ejs");
const puppeteer = require("puppeteer");
const { generateCvWithGemini } = require("../helpers/gemini");
const { GeneratedCV, JobApplication, UserProfile } = require("../models");
const {
	generateToken,
	createTestUser,
	createCompleteProfile,
	createApplication,
	contentJsonPayload,
	generatedCvPayload,
	createGeneratedCv,
	cleanupDatabase,
} = require("./helpers");

let user;
let otherUser;
let accessToken;
let otherAccessToken;

function aiCvResult(overrides = {}) {
	return {
		title: "CV Frontend Developer - Tokopedia",
		atsScore: 88,
		matchScore: 84,
		keywordSuggestions: "React, REST API, Git",
		missingKeywords: "TypeScript",
		summary: "Full Stack Developer with React experience.",
		skills: "React, Express, PostgreSQL",
		experience: "Built React and Express applications.",
		education: "Hacktiv8 Full Stack JavaScript",
		certifications: "Full Stack JavaScript",
		fullContent: "Professional Summary\nSkills\nExperience",
		contentJson: contentJsonPayload(),
		...overrides,
	};
}

function mockPuppeteerPdf() {
	const page = {
		setContent: jest.fn().mockResolvedValue(undefined),
		pdf: jest.fn().mockResolvedValue(Buffer.from("mock-pdf")),
	};
	const browser = {
		newPage: jest.fn().mockResolvedValue(page),
		close: jest.fn().mockResolvedValue(undefined),
	};

	puppeteer.launch.mockResolvedValue(browser);

	return { browser, page };
}

beforeAll(async () => {
	await cleanupDatabase();

	user = await createTestUser({
		email: "generated-cv-user@mail.com",
		username: "generatedcvuser",
	});

	otherUser = await createTestUser({
		email: "other-generated-cv-user@mail.com",
		username: "othergeneratedcvuser",
	});

	accessToken = generateToken(user);
	otherAccessToken = generateToken(otherUser);
});

afterEach(async () => {
	jest.clearAllMocks();
	jest.restoreAllMocks();

	await GeneratedCV.destroy({ truncate: true, restartIdentity: true, cascade: true });
	await JobApplication.destroy({ truncate: true, restartIdentity: true, cascade: true });
	await UserProfile.destroy({ truncate: true, restartIdentity: true, cascade: true });
});

afterAll(async () => {
	await cleanupDatabase();
});

describe("POST /applications/:id/generated-cvs", () => {
	test("POST /applications/:id/generated-cvs: positive case - should generate and save CV", async () => {
		await createCompleteProfile(user.id);
		const application = await createApplication(user.id);
		generateCvWithGemini.mockResolvedValue(aiCvResult());

		const res = await request(app)
			.post(`/applications/${application.id}/generated-cvs`)
			.set("Authorization", `Bearer ${accessToken}`)
			.send();

		expect(res.statusCode).toBe(201);
		expect(res.body).toHaveProperty("id", expect.any(Number));
		expect(res.body).toHaveProperty("UserId", user.id);
		expect(res.body).toHaveProperty("JobApplicationId", application.id);
		expect(res.body).toHaveProperty("title", "CV Frontend Developer - Tokopedia");
		expect(res.body).toHaveProperty("atsScore", 88);
		expect(res.body).toHaveProperty("matchScore", 84);
		expect(res.body).toHaveProperty("contentJson", expect.any(Object));
		expect(generateCvWithGemini).toHaveBeenCalledTimes(1);
	});

	test("POST /applications/:id/generated-cvs: negative case - should return 401 when no token", async () => {
		const application = await createApplication(user.id);

		const res = await request(app).post(
			`/applications/${application.id}/generated-cvs`,
		);

		expect(res.statusCode).toBe(401);
		expect(res.body).toHaveProperty("message", "Invalid token");
	});

	test("POST /applications/:id/generated-cvs: negative case - should return 404 when job application not found", async () => {
		await createCompleteProfile(user.id);

		const res = await request(app)
			.post("/applications/999999/generated-cvs")
			.set("Authorization", `Bearer ${accessToken}`);

		expect(res.statusCode).toBe(404);
		expect(res.body).toHaveProperty("message", "Job application not found");
	});

	test("POST /applications/:id/generated-cvs: negative case - should return 404 when accessing another user's job application", async () => {
		await createCompleteProfile(user.id);
		const otherApplication = await createApplication(otherUser.id);

		const res = await request(app)
			.post(`/applications/${otherApplication.id}/generated-cvs`)
			.set("Authorization", `Bearer ${accessToken}`);

		expect(res.statusCode).toBe(404);
		expect(res.body).toHaveProperty("message", "Job application not found");
	});

	test("POST /applications/:id/generated-cvs: negative case - should return 400 when profile is not completed", async () => {
		const application = await createApplication(user.id);

		const res = await request(app)
			.post(`/applications/${application.id}/generated-cvs`)
			.set("Authorization", `Bearer ${accessToken}`);

		expect(res.statusCode).toBe(400);
		expect(res.body).toHaveProperty("message", "Please complete your profile first");
	});

	test("POST /applications/:id/generated-cvs: negative case - should return 500 when server error happens", async () => {
		await createCompleteProfile(user.id);
		const application = await createApplication(user.id);
		generateCvWithGemini.mockRejectedValue(new Error("AI ERROR"));

		const res = await request(app)
			.post(`/applications/${application.id}/generated-cvs`)
			.set("Authorization", `Bearer ${accessToken}`);

		expect(res.statusCode).toBe(500);
		expect(res.body).toHaveProperty("message", "Internal server error");
	});
});

describe("GET /applications/:id/generated-cvs", () => {
	test("GET /applications/:id/generated-cvs: positive case - should return generated CV list", async () => {
		const application = await createApplication(user.id);
		await createGeneratedCv(user.id, application.id, {
			title: "First Generated CV",
		});
		await createGeneratedCv(user.id, application.id, {
			title: "Second Generated CV",
		});

		const res = await request(app)
			.get(`/applications/${application.id}/generated-cvs`)
			.set("Authorization", `Bearer ${accessToken}`);

		expect(res.statusCode).toBe(200);
		expect(res.body).toBeInstanceOf(Array);
		expect(res.body).toHaveLength(2);
		expect(res.body[0]).toHaveProperty("UserId", user.id);
		expect(res.body[0]).toHaveProperty("JobApplicationId", application.id);
	});

	test("GET /applications/:id/generated-cvs: negative case - should return 404 when job application not found", async () => {
		const res = await request(app)
			.get("/applications/999999/generated-cvs")
			.set("Authorization", `Bearer ${accessToken}`);

		expect(res.statusCode).toBe(404);
		expect(res.body).toHaveProperty("message", "Job application not found");
	});
});

describe("GET /generated-cvs/:id", () => {
	test("GET /generated-cvs/:id: positive case - should return generated CV detail", async () => {
		const application = await createApplication(user.id);
		const generatedCv = await createGeneratedCv(user.id, application.id);

		const res = await request(app)
			.get(`/generated-cvs/${generatedCv.id}`)
			.set("Authorization", `Bearer ${accessToken}`);

		expect(res.statusCode).toBe(200);
		expect(res.body).toHaveProperty("id", generatedCv.id);
		expect(res.body).toHaveProperty("UserId", user.id);
		expect(res.body).toHaveProperty("title", generatedCv.title);
	});

	test("GET /generated-cvs/:id: negative case - should return 401 when no token", async () => {
		const application = await createApplication(user.id);
		const generatedCv = await createGeneratedCv(user.id, application.id);

		const res = await request(app).get(`/generated-cvs/${generatedCv.id}`);

		expect(res.statusCode).toBe(401);
		expect(res.body).toHaveProperty("message", "Invalid token");
	});

	test("GET /generated-cvs/:id: negative case - should return 404 when generated CV not found", async () => {
		const res = await request(app)
			.get("/generated-cvs/999999")
			.set("Authorization", `Bearer ${accessToken}`);

		expect(res.statusCode).toBe(404);
		expect(res.body).toHaveProperty("message", "Generated CV not found");
	});

	test("GET /generated-cvs/:id: negative case - should return 404 when accessing another user's generated CV", async () => {
		const application = await createApplication(otherUser.id);
		const generatedCv = await createGeneratedCv(otherUser.id, application.id);

		const res = await request(app)
			.get(`/generated-cvs/${generatedCv.id}`)
			.set("Authorization", `Bearer ${accessToken}`);

		expect(res.statusCode).toBe(404);
		expect(res.body).toHaveProperty("message", "Generated CV not found");
	});
});

describe("GET /generated-cvs/:id/download", () => {
	test("GET /generated-cvs/:id/download: positive case - should return PDF buffer", async () => {
		await createCompleteProfile(user.id);
		const application = await createApplication(user.id);
		const generatedCv = await createGeneratedCv(user.id, application.id);
		const { browser, page } = mockPuppeteerPdf();

		const res = await request(app)
			.get(`/generated-cvs/${generatedCv.id}/download`)
			.set("Authorization", `Bearer ${accessToken}`);

		expect(res.statusCode).toBe(200);
		expect(res.headers["content-type"]).toMatch(/application\/pdf/);
		expect(res.headers["content-disposition"]).toContain("attachment");
		expect(ejs.renderFile).toHaveBeenCalledTimes(1);
		expect(puppeteer.launch).toHaveBeenCalledTimes(1);
		expect(browser.newPage).toHaveBeenCalledTimes(1);
		expect(page.setContent).toHaveBeenCalledTimes(1);
		expect(page.pdf).toHaveBeenCalledTimes(1);
		expect(browser.close).toHaveBeenCalledTimes(1);
	});

	test("GET /generated-cvs/:id/download: negative case - should return 404 when generated CV not found", async () => {
		const res = await request(app)
			.get("/generated-cvs/999999/download")
			.set("Authorization", `Bearer ${accessToken}`);

		expect(res.statusCode).toBe(404);
		expect(res.body).toHaveProperty("message", "Generated CV not found");
	});
});

describe("DELETE /generated-cvs/:id", () => {
	test("DELETE /generated-cvs/:id: positive case - should delete generated CV", async () => {
		const application = await createApplication(user.id);
		const generatedCv = await createGeneratedCv(user.id, application.id);

		const res = await request(app)
			.delete(`/generated-cvs/${generatedCv.id}`)
			.set("Authorization", `Bearer ${accessToken}`);

		expect(res.statusCode).toBe(200);
		expect(res.body).toHaveProperty("message", "Generated CV deleted successfully");

		const deletedGeneratedCv = await GeneratedCV.findByPk(generatedCv.id);
		expect(deletedGeneratedCv).toBe(null);
	});

	test("DELETE /generated-cvs/:id: negative case - should return 404 when generated CV not found", async () => {
		const res = await request(app)
			.delete("/generated-cvs/999999")
			.set("Authorization", `Bearer ${accessToken}`);

		expect(res.statusCode).toBe(404);
		expect(res.body).toHaveProperty("message", "Generated CV not found");
	});
});
