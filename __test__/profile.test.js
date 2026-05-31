jest.mock("puppeteer", () => ({
	launch: jest.fn(),
}));

const request = require("supertest");
const app = require("../app");
const {
	UserProfile,
	CvSkill,
	CvLanguage,
	CvWorkExperience,
	CvCertification,
	CvEducation,
} = require("../models");
const {
	generateToken,
	createTestUser,
	profilePayload,
	createCompleteProfile,
	cleanupDatabase,
} = require("./helpers");

let user;
let accessToken;

beforeAll(async () => {
	await cleanupDatabase();
	user = await createTestUser({
		email: "profile-user@mail.com",
		username: "profileuser",
	});
	accessToken = generateToken(user);
});

afterEach(async () => {
	jest.restoreAllMocks();

	await CvCertification.destroy({ truncate: true, restartIdentity: true, cascade: true });
	await CvWorkExperience.destroy({ truncate: true, restartIdentity: true, cascade: true });
	await CvLanguage.destroy({ truncate: true, restartIdentity: true, cascade: true });
	await CvSkill.destroy({ truncate: true, restartIdentity: true, cascade: true });
	await CvEducation.destroy({ truncate: true, restartIdentity: true, cascade: true });
	await UserProfile.destroy({ truncate: true, restartIdentity: true, cascade: true });
});

afterAll(async () => {
	await cleanupDatabase();
});

describe("GET /profile", () => {
	test("GET /profile: positive case - should return user profile and CV collections", async () => {
		await createCompleteProfile(user.id);

		const res = await request(app)
			.get("/profile")
			.set("Authorization", `Bearer ${accessToken}`);

		expect(res.statusCode).toBe(200);
		expect(res.body).toHaveProperty("userProfile", expect.any(Object));
		expect(res.body.userProfile).toHaveProperty("UserId", user.id);
		expect(res.body.userProfile).toHaveProperty("fullName", "Brahmantio Diaz");
		expect(res.body).toHaveProperty("skills", expect.any(Array));
		expect(res.body).toHaveProperty("languages", expect.any(Array));
		expect(res.body).toHaveProperty("workExperiences", expect.any(Array));
		expect(res.body).toHaveProperty("certifications", expect.any(Array));
		expect(res.body).toHaveProperty("educations", expect.any(Array));
		expect(res.body.skills.length).toBeGreaterThan(0);
	});

	test("GET /profile: negative case - should return 401 when no token", async () => {
		const res = await request(app).get("/profile");

		expect(res.statusCode).toBe(401);
		expect(res.body).toHaveProperty("message", "Invalid token");
	});

	test("GET /profile: negative case - should return 404 when profile not found", async () => {
		const res = await request(app)
			.get("/profile")
			.set("Authorization", `Bearer ${accessToken}`);

		expect(res.statusCode).toBe(404);
		expect(res.body).toHaveProperty("message", "Profile not found");
	});

	test("GET /profile: negative case - should return 500 when server error happens", async () => {
		jest.spyOn(UserProfile, "findOne").mockRejectedValue(new Error("DB ERROR"));

		const res = await request(app)
			.get("/profile")
			.set("Authorization", `Bearer ${accessToken}`);

		expect(res.statusCode).toBe(500);
		expect(res.body).toHaveProperty("message", "Internal server error");
	});
});

describe("POST /profile", () => {
	test("POST /profile: positive case - should create profile with CV collections", async () => {
		const payload = profilePayload();

		const res = await request(app)
			.post("/profile")
			.set("Authorization", `Bearer ${accessToken}`)
			.send(payload);

		expect(res.statusCode).toBe(201);
		expect(res.body).toHaveProperty("userProfile", expect.any(Object));
		expect(res.body.userProfile).toHaveProperty("UserId", user.id);
		expect(res.body.userProfile).toHaveProperty("fullName", payload.fullName);
		expect(res.body.userProfile).toHaveProperty("targetRole", payload.targetRole);
		expect(res.body.skills).toBeInstanceOf(Array);
		expect(res.body.languages).toBeInstanceOf(Array);
		expect(res.body.workExperiences).toBeInstanceOf(Array);
		expect(res.body.certifications).toBeInstanceOf(Array);
		expect(res.body.educations).toBeInstanceOf(Array);
		expect(res.body.skills[0]).toHaveProperty("name", payload.skills[0].name);
	});

	test("POST /profile: negative case - should return 401 when no token", async () => {
		const res = await request(app).post("/profile").send(profilePayload());

		expect(res.statusCode).toBe(401);
		expect(res.body).toHaveProperty("message", "Invalid token");
	});

	test("POST /profile: negative case - should return 400 when skills is not array", async () => {
		const res = await request(app)
			.post("/profile")
			.set("Authorization", `Bearer ${accessToken}`)
			.send(profilePayload({ skills: "React" }));

		expect(res.statusCode).toBe(400);
		expect(res.body).toHaveProperty("message", "skills must be an array");
	});

	test("POST /profile: negative case - should return 400 when languages is empty array", async () => {
		const res = await request(app)
			.post("/profile")
			.set("Authorization", `Bearer ${accessToken}`)
			.send(profilePayload({ languages: [] }));

		expect(res.statusCode).toBe(400);
		expect(res.body).toHaveProperty("message", "languages is required");
	});

	test("POST /profile: negative case - should return 400 when fullName is empty", async () => {
		const res = await request(app)
			.post("/profile")
			.set("Authorization", `Bearer ${accessToken}`)
			.send(profilePayload({ fullName: "" }));

		expect(res.statusCode).toBe(400);
		expect(res.body).toHaveProperty("message", "fullName is required");
	});

	test("POST /profile: negative case - should return 400 when linkedInUrl format is invalid", async () => {
		const res = await request(app)
			.post("/profile")
			.set("Authorization", `Bearer ${accessToken}`)
			.send(profilePayload({ linkedInUrl: "linkedin.com/in/wrong" }));

		expect(res.statusCode).toBe(400);
		expect(res.body).toHaveProperty("message", "linkedInUrl format is invalid");
	});

	test("POST /profile: negative case - should return 400 when profile already exists", async () => {
		await createCompleteProfile(user.id);

		const res = await request(app)
			.post("/profile")
			.set("Authorization", `Bearer ${accessToken}`)
			.send(profilePayload());

		expect(res.statusCode).toBe(400);
		expect(res.body).toHaveProperty("message", "Profile already exists");
	});
});

describe("PUT /profile", () => {
	test("PUT /profile: positive case - should update profile and replace CV collections", async () => {
		await createCompleteProfile(user.id);
		const payload = profilePayload({
			fullName: "Updated Profile User",
			targetRole: "Backend Developer",
			skills: [{ name: "Node.js", category: "Backend" }],
		});

		const res = await request(app)
			.put("/profile")
			.set("Authorization", `Bearer ${accessToken}`)
			.send(payload);

		expect(res.statusCode).toBe(200);
		expect(res.body.userProfile).toHaveProperty("fullName", "Updated Profile User");
		expect(res.body.userProfile).toHaveProperty("targetRole", "Backend Developer");
		expect(res.body.skills).toHaveLength(1);
		expect(res.body.skills[0]).toHaveProperty("name", "Node.js");
	});

	test("PUT /profile: negative case - should return 401 when no token", async () => {
		const res = await request(app).put("/profile").send(profilePayload());

		expect(res.statusCode).toBe(401);
		expect(res.body).toHaveProperty("message", "Invalid token");
	});

	test("PUT /profile: negative case - should return 404 when profile not found", async () => {
		const res = await request(app)
			.put("/profile")
			.set("Authorization", `Bearer ${accessToken}`)
			.send(profilePayload());

		expect(res.statusCode).toBe(404);
		expect(res.body).toHaveProperty("message", "Profile not found");
	});

	test("PUT /profile: negative case - should return 400 when educations is empty array", async () => {
		await createCompleteProfile(user.id);

		const res = await request(app)
			.put("/profile")
			.set("Authorization", `Bearer ${accessToken}`)
			.send(profilePayload({ educations: [] }));

		expect(res.statusCode).toBe(400);
		expect(res.body).toHaveProperty("message", "educations is required");
	});
});
