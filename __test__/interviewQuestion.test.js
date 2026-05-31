jest.mock("puppeteer", () => ({
	launch: jest.fn(),
}));

jest.mock("../helpers/gemini", () => ({
	generateCvWithGemini: jest.fn(),
	generateInterviewQuestionsWithGemini: jest.fn(),
}));

const request = require("supertest");
const app = require("../app");
const { generateInterviewQuestionsWithGemini } = require("../helpers/gemini");
const { InterviewQuestion, JobApplication, UserProfile } = require("../models");
const { InterviewCategory } = require("../helpers/enums");
const {
	generateToken,
	createTestUser,
	createCompleteProfile,
	createApplication,
	cleanupDatabase,
} = require("./helpers");

let user;
let otherUser;
let accessToken;

function aiQuestions(overrides = {}) {
	return [
		{
			category: InterviewCategory.TECHNICAL,
			question: "How do you manage state in React?",
			suggestedAnswer: "I use useState for local state and Context or Redux for global state.",
			...overrides,
		},
	];
}

beforeAll(async () => {
	await cleanupDatabase();

	user = await createTestUser({
		email: "interview-user@mail.com",
		username: "interviewuser",
	});

	otherUser = await createTestUser({
		email: "other-interview-user@mail.com",
		username: "otherinterviewuser",
	});

	accessToken = generateToken(user);
});

afterEach(async () => {
	jest.clearAllMocks();
	jest.restoreAllMocks();

	await InterviewQuestion.destroy({ truncate: true, restartIdentity: true, cascade: true });
	await JobApplication.destroy({ truncate: true, restartIdentity: true, cascade: true });
	await UserProfile.destroy({ truncate: true, restartIdentity: true, cascade: true });
});

afterAll(async () => {
	await cleanupDatabase();
});

describe("POST /applications/:id/interview-questions", () => {
	test("POST /applications/:id/interview-questions: positive case - should generate and save interview questions", async () => {
		await createCompleteProfile(user.id);
		const application = await createApplication(user.id);
		generateInterviewQuestionsWithGemini.mockResolvedValue(aiQuestions());

		const res = await request(app)
			.post(`/applications/${application.id}/interview-questions`)
			.set("Authorization", `Bearer ${accessToken}`)
			.send({ category: InterviewCategory.TECHNICAL });

		expect(res.statusCode).toBe(201);
		expect(res.body).toBeInstanceOf(Array);
		expect(res.body).toHaveLength(1);
		expect(res.body[0]).toHaveProperty("UserId", user.id);
		expect(res.body[0]).toHaveProperty("JobApplicationId", application.id);
		expect(res.body[0]).toHaveProperty("category", InterviewCategory.TECHNICAL);
		expect(res.body[0]).toHaveProperty("question", "How do you manage state in React?");
		expect(res.body[0]).toHaveProperty("userAnswer", null);
		expect(generateInterviewQuestionsWithGemini).toHaveBeenCalledTimes(1);
	});

	test("POST /applications/:id/interview-questions: negative case - should return 401 when no token", async () => {
		const application = await createApplication(user.id);

		const res = await request(app)
			.post(`/applications/${application.id}/interview-questions`)
			.send({ category: InterviewCategory.TECHNICAL });

		expect(res.statusCode).toBe(401);
		expect(res.body).toHaveProperty("message", "Invalid token");
	});

	test("POST /applications/:id/interview-questions: negative case - should return 404 when job application not found", async () => {
		await createCompleteProfile(user.id);

		const res = await request(app)
			.post("/applications/999999/interview-questions")
			.set("Authorization", `Bearer ${accessToken}`)
			.send({ category: InterviewCategory.TECHNICAL });

		expect(res.statusCode).toBe(404);
		expect(res.body).toHaveProperty("message", "Job application not found");
	});

	test("POST /applications/:id/interview-questions: negative case - should return 404 when accessing another user's application", async () => {
		await createCompleteProfile(user.id);
		const otherApplication = await createApplication(otherUser.id);

		const res = await request(app)
			.post(`/applications/${otherApplication.id}/interview-questions`)
			.set("Authorization", `Bearer ${accessToken}`)
			.send({ category: InterviewCategory.TECHNICAL });

		expect(res.statusCode).toBe(404);
		expect(res.body).toHaveProperty("message", "Job application not found");
	});

	test("POST /applications/:id/interview-questions: negative case - should return 400 when profile is not completed", async () => {
		const application = await createApplication(user.id);

		const res = await request(app)
			.post(`/applications/${application.id}/interview-questions`)
			.set("Authorization", `Bearer ${accessToken}`)
			.send({ category: InterviewCategory.TECHNICAL });

		expect(res.statusCode).toBe(400);
		expect(res.body).toHaveProperty("message", "Please complete your profile first");
	});

	test("POST /applications/:id/interview-questions: negative case - should return 400 when category is empty", async () => {
		await createCompleteProfile(user.id);
		const application = await createApplication(user.id);

		const res = await request(app)
			.post(`/applications/${application.id}/interview-questions`)
			.set("Authorization", `Bearer ${accessToken}`)
			.send({});

		expect(res.statusCode).toBe(400);
		expect(res.body).toHaveProperty("message", "Interview category is required");
	});

	test("POST /applications/:id/interview-questions: negative case - should return 400 when category is invalid", async () => {
		await createCompleteProfile(user.id);
		const application = await createApplication(user.id);

		const res = await request(app)
			.post(`/applications/${application.id}/interview-questions`)
			.set("Authorization", `Bearer ${accessToken}`)
			.send({ category: "Coding" });

		expect(res.statusCode).toBe(400);
		expect(res.body).toHaveProperty("message", "Interview category is invalid");
	});

	test("POST /applications/:id/interview-questions: negative case - should return 400 when AI returns empty questions", async () => {
		await createCompleteProfile(user.id);
		const application = await createApplication(user.id);
		generateInterviewQuestionsWithGemini.mockResolvedValue([]);

		const res = await request(app)
			.post(`/applications/${application.id}/interview-questions`)
			.set("Authorization", `Bearer ${accessToken}`)
			.send({ category: InterviewCategory.TECHNICAL });

		expect(res.statusCode).toBe(400);
		expect(res.body).toHaveProperty("message", "Failed to generate interview questions");
	});

	test("POST /applications/:id/interview-questions: negative case - should return 400 when AI returns invalid category", async () => {
		await createCompleteProfile(user.id);
		const application = await createApplication(user.id);
		generateInterviewQuestionsWithGemini.mockResolvedValue(
			aiQuestions({ category: "Coding" }),
		);

		const res = await request(app)
			.post(`/applications/${application.id}/interview-questions`)
			.set("Authorization", `Bearer ${accessToken}`)
			.send({ category: InterviewCategory.TECHNICAL });

		expect(res.statusCode).toBe(400);
		expect(res.body).toHaveProperty("message", "Generated interview category is invalid");
	});
});

describe("GET /applications/:id/interview-questions", () => {
	test("GET /applications/:id/interview-questions: positive case - should return interview questions by application", async () => {
		const application = await createApplication(user.id);
		await InterviewQuestion.create({
			UserId: user.id,
			JobApplicationId: application.id,
			category: InterviewCategory.TECHNICAL,
			question: "What is React?",
			suggestedAnswer: "React is a JavaScript library.",
		});

		const res = await request(app)
			.get(`/applications/${application.id}/interview-questions`)
			.set("Authorization", `Bearer ${accessToken}`);

		expect(res.statusCode).toBe(200);
		expect(res.body).toBeInstanceOf(Array);
		expect(res.body).toHaveLength(1);
		expect(res.body[0]).toHaveProperty("UserId", user.id);
		expect(res.body[0]).toHaveProperty("JobApplicationId", application.id);
		expect(res.body[0]).toHaveProperty("question", "What is React?");
	});

	test("GET /applications/:id/interview-questions: negative case - should return 404 when job application not found", async () => {
		const res = await request(app)
			.get("/applications/999999/interview-questions")
			.set("Authorization", `Bearer ${accessToken}`);

		expect(res.statusCode).toBe(404);
		expect(res.body).toHaveProperty("message", "Job application not found");
	});
});

describe("PATCH /interview-questions/:id/answer", () => {
	test("PATCH /interview-questions/:id/answer: positive case - should update user answer", async () => {
		const application = await createApplication(user.id);
		const interviewQuestion = await InterviewQuestion.create({
			UserId: user.id,
			JobApplicationId: application.id,
			category: InterviewCategory.BEHAVIORAL,
			question: "Tell me about yourself.",
			suggestedAnswer: "Use STAR method.",
		});

		const res = await request(app)
			.patch(`/interview-questions/${interviewQuestion.id}/answer`)
			.set("Authorization", `Bearer ${accessToken}`)
			.send({ userAnswer: "I am a Full Stack Developer." });

		expect(res.statusCode).toBe(200);
		expect(res.body).toHaveProperty("id", interviewQuestion.id);
		expect(res.body).toHaveProperty("userAnswer", "I am a Full Stack Developer.");
	});

	test("PATCH /interview-questions/:id/answer: negative case - should return 401 when no token", async () => {
		const application = await createApplication(user.id);
		const interviewQuestion = await InterviewQuestion.create({
			UserId: user.id,
			JobApplicationId: application.id,
			category: InterviewCategory.HR,
			question: "Why should we hire you?",
		});

		const res = await request(app)
			.patch(`/interview-questions/${interviewQuestion.id}/answer`)
			.send({ userAnswer: "Because I can contribute." });

		expect(res.statusCode).toBe(401);
		expect(res.body).toHaveProperty("message", "Invalid token");
	});

	test("PATCH /interview-questions/:id/answer: negative case - should return 400 when userAnswer is empty", async () => {
		const application = await createApplication(user.id);
		const interviewQuestion = await InterviewQuestion.create({
			UserId: user.id,
			JobApplicationId: application.id,
			category: InterviewCategory.HR,
			question: "Why should we hire you?",
		});

		const res = await request(app)
			.patch(`/interview-questions/${interviewQuestion.id}/answer`)
			.set("Authorization", `Bearer ${accessToken}`)
			.send({ userAnswer: "" });

		expect(res.statusCode).toBe(400);
		expect(res.body).toHaveProperty("message", "User answer is required");
	});

	test("PATCH /interview-questions/:id/answer: negative case - should return 404 when question not found", async () => {
		const res = await request(app)
			.patch("/interview-questions/999999/answer")
			.set("Authorization", `Bearer ${accessToken}`)
			.send({ userAnswer: "My answer" });

		expect(res.statusCode).toBe(404);
		expect(res.body).toHaveProperty("message", "Interview question not found");
	});
});
