jest.mock("puppeteer", () => ({
	launch: jest.fn(),
}));

jest.mock("axios", () => ({
	request: jest.fn(),
}));

const request = require("supertest");
const app = require("../app");
const axios = require("axios");
const { JobApplication, UserProfile } = require("../models");
const { ApplicationStatus } = require("../helpers/enums");
const {
	generateToken,
	createTestUser,
	createCompleteProfile,
	applicationPayload,
	createApplication,
	cleanupDatabase,
} = require("./helpers");

let user;
let otherUser;
let accessToken;
let otherAccessToken;

beforeAll(async () => {
	await cleanupDatabase();

	user = await createTestUser({
		email: "application-user@mail.com",
		username: "applicationuser",
	});

	otherUser = await createTestUser({
		email: "other-application-user@mail.com",
		username: "otherapplicationuser",
	});

	accessToken = generateToken(user);
	otherAccessToken = generateToken(otherUser);
});

afterEach(async () => {
	jest.restoreAllMocks();
	jest.clearAllMocks();

	await JobApplication.destroy({ truncate: true, restartIdentity: true, cascade: true });
	await UserProfile.destroy({ truncate: true, restartIdentity: true, cascade: true });
	delete process.env.RAPIDAPI_KEY;
	delete process.env.RAPIDAPI_HOST;
});

afterAll(async () => {
	await cleanupDatabase();
});

describe("POST /applications", () => {
	test("POST /applications: positive case - should create job application", async () => {
		const payload = applicationPayload();

		const res = await request(app)
			.post("/applications")
			.set("Authorization", `Bearer ${accessToken}`)
			.send(payload);

		expect(res.statusCode).toBe(201);
		expect(res.body).toHaveProperty("id", expect.any(Number));
		expect(res.body).toHaveProperty("UserId", user.id);
		expect(res.body).toHaveProperty("companyName", payload.companyName);
		expect(res.body).toHaveProperty("position", payload.position);
		expect(res.body).toHaveProperty("jobDescription", payload.jobDescription);
		expect(res.body).toHaveProperty("status", payload.status);
	});

	test("POST /applications: negative case - should return 401 when no token", async () => {
		const res = await request(app).post("/applications").send(applicationPayload());

		expect(res.statusCode).toBe(401);
		expect(res.body).toHaveProperty("message", "Invalid token");
	});

	test("POST /applications: negative case - should return 400 when companyName is empty", async () => {
		const res = await request(app)
			.post("/applications")
			.set("Authorization", `Bearer ${accessToken}`)
			.send(applicationPayload({ companyName: "" }));

		expect(res.statusCode).toBe(400);
		expect(res.body).toHaveProperty("message", "companyName is required");
	});

	test("POST /applications: negative case - should return 400 when status is invalid", async () => {
		const res = await request(app)
			.post("/applications")
			.set("Authorization", `Bearer ${accessToken}`)
			.send(applicationPayload({ status: "Screening" }));

		expect(res.statusCode).toBe(400);
		expect(res.body).toHaveProperty("message", "Status is invalid");
	});

	test("POST /applications: negative case - should return 400 when jobUrl format is invalid", async () => {
		const res = await request(app)
			.post("/applications")
			.set("Authorization", `Bearer ${accessToken}`)
			.send(applicationPayload({ jobUrl: "wrong-url" }));

		expect(res.statusCode).toBe(400);
		expect(res.body).toHaveProperty("message", "jobUrl format is invalid");
	});

	test("POST /applications: negative case - should return 500 when server error happens", async () => {
		jest.spyOn(JobApplication, "create").mockRejectedValue(new Error("DB ERROR"));

		const res = await request(app)
			.post("/applications")
			.set("Authorization", `Bearer ${accessToken}`)
			.send(applicationPayload());

		expect(res.statusCode).toBe(500);
		expect(res.body).toHaveProperty("message", "Internal server error");
	});
});

describe("GET /applications", () => {
	test("GET /applications: positive case - should return only logged in user's applications", async () => {
		const application = await createApplication(user.id, {
			companyName: "Tokopedia",
			position: "Frontend Developer",
		});
		await createApplication(otherUser.id, {
			companyName: "Other Company",
			position: "Backend Developer",
		});

		const res = await request(app)
			.get("/applications")
			.set("Authorization", `Bearer ${accessToken}`);

		expect(res.statusCode).toBe(200);
		expect(res.body).toBeInstanceOf(Array);
		expect(res.body).toHaveLength(1);
		expect(res.body[0]).toHaveProperty("id", application.id);
		expect(res.body[0]).toHaveProperty("UserId", user.id);
	});

	test("GET /applications: positive case - should filter by status and search", async () => {
		await createApplication(user.id, {
			companyName: "Tokopedia",
			position: "Frontend Developer",
			status: ApplicationStatus.APPLIED,
		});
		await createApplication(user.id, {
			companyName: "Gojek",
			position: "Backend Developer",
			status: ApplicationStatus.WISHLIST,
		});

		const res = await request(app)
			.get("/applications?status=Applied&search=toko&sort=oldest")
			.set("Authorization", `Bearer ${accessToken}`);

		expect(res.statusCode).toBe(200);
		expect(res.body).toHaveLength(1);
		expect(res.body[0]).toHaveProperty("companyName", "Tokopedia");
		expect(res.body[0]).toHaveProperty("status", ApplicationStatus.APPLIED);
	});

	test("GET /applications: negative case - should return 401 when no token", async () => {
		const res = await request(app).get("/applications");

		expect(res.statusCode).toBe(401);
		expect(res.body).toHaveProperty("message", "Invalid token");
	});

	test("GET /applications: negative case - should return 400 when status query is invalid", async () => {
		const res = await request(app)
			.get("/applications?status=Screening")
			.set("Authorization", `Bearer ${accessToken}`);

		expect(res.statusCode).toBe(400);
		expect(res.body).toHaveProperty("message", "Status is invalid");
	});

	test("GET /applications: negative case - should return 500 when server error happens", async () => {
		jest.spyOn(JobApplication, "findAll").mockRejectedValue(new Error("DB ERROR"));

		const res = await request(app)
			.get("/applications")
			.set("Authorization", `Bearer ${accessToken}`);

		expect(res.statusCode).toBe(500);
		expect(res.body).toHaveProperty("message", "Internal server error");
	});
});

describe("GET /applications/:id", () => {
	test("GET /applications/:id: positive case - should return application detail", async () => {
		const application = await createApplication(user.id);

		const res = await request(app)
			.get(`/applications/${application.id}`)
			.set("Authorization", `Bearer ${accessToken}`);

		expect(res.statusCode).toBe(200);
		expect(res.body).toHaveProperty("id", application.id);
		expect(res.body).toHaveProperty("UserId", user.id);
		expect(res.body).toHaveProperty("companyName", application.companyName);
	});

	test("GET /applications/:id: negative case - should return 401 when no token", async () => {
		const application = await createApplication(user.id);

		const res = await request(app).get(`/applications/${application.id}`);

		expect(res.statusCode).toBe(401);
		expect(res.body).toHaveProperty("message", "Invalid token");
	});

	test("GET /applications/:id: negative case - should return 404 when application not found", async () => {
		const res = await request(app)
			.get("/applications/999999")
			.set("Authorization", `Bearer ${accessToken}`);

		expect(res.statusCode).toBe(404);
		expect(res.body).toHaveProperty("message", "Application not found");
	});

	test("GET /applications/:id: negative case - should return 404 when accessing another user's application", async () => {
		const otherApplication = await createApplication(otherUser.id);

		const res = await request(app)
			.get(`/applications/${otherApplication.id}`)
			.set("Authorization", `Bearer ${accessToken}`);

		expect(res.statusCode).toBe(404);
		expect(res.body).toHaveProperty("message", "Application not found");
	});
});

describe("PUT /applications/:id", () => {
	test("PUT /applications/:id: positive case - should update application", async () => {
		const application = await createApplication(user.id);
		const payload = applicationPayload({
			companyName: "Updated Company",
			position: "Backend Developer",
			status: ApplicationStatus.INTERVIEW,
		});

		const res = await request(app)
			.put(`/applications/${application.id}`)
			.set("Authorization", `Bearer ${accessToken}`)
			.send(payload);

		expect(res.statusCode).toBe(200);
		expect(res.body).toHaveProperty("id", application.id);
		expect(res.body).toHaveProperty("companyName", "Updated Company");
		expect(res.body).toHaveProperty("position", "Backend Developer");
		expect(res.body).toHaveProperty("status", ApplicationStatus.INTERVIEW);
	});

	test("PUT /applications/:id: negative case - should return 404 when application not found", async () => {
		const res = await request(app)
			.put("/applications/999999")
			.set("Authorization", `Bearer ${accessToken}`)
			.send(applicationPayload());

		expect(res.statusCode).toBe(404);
		expect(res.body).toHaveProperty("message", "Application not found");
	});

	test("PUT /applications/:id: negative case - should return 400 when validation error", async () => {
		const application = await createApplication(user.id);

		const res = await request(app)
			.put(`/applications/${application.id}`)
			.set("Authorization", `Bearer ${accessToken}`)
			.send(applicationPayload({ position: "" }));

		expect(res.statusCode).toBe(400);
		expect(res.body).toHaveProperty("message", "position is required");
	});
});

describe("PATCH /applications/:id/status", () => {
	test("PATCH /applications/:id/status: positive case - should update status only", async () => {
		const application = await createApplication(user.id, {
			status: ApplicationStatus.APPLIED,
		});

		const res = await request(app)
			.patch(`/applications/${application.id}/status`)
			.set("Authorization", `Bearer ${accessToken}`)
			.send({ status: ApplicationStatus.OFFERING });

		expect(res.statusCode).toBe(200);
		expect(res.body).toHaveProperty("id", application.id);
		expect(res.body).toHaveProperty("status", ApplicationStatus.OFFERING);
	});

	test("PATCH /applications/:id/status: negative case - should return 400 when status is empty", async () => {
		const application = await createApplication(user.id);

		const res = await request(app)
			.patch(`/applications/${application.id}/status`)
			.set("Authorization", `Bearer ${accessToken}`)
			.send({});

		expect(res.statusCode).toBe(400);
		expect(res.body).toHaveProperty("message", "Status is required");
	});

	test("PATCH /applications/:id/status: negative case - should return 400 when status is invalid", async () => {
		const application = await createApplication(user.id);

		const res = await request(app)
			.patch(`/applications/${application.id}/status`)
			.set("Authorization", `Bearer ${accessToken}`)
			.send({ status: "Screening" });

		expect(res.statusCode).toBe(400);
		expect(res.body).toHaveProperty("message", "Status is invalid");
	});
});

describe("DELETE /applications/:id", () => {
	test("DELETE /applications/:id: positive case - should delete application", async () => {
		const application = await createApplication(user.id);

		const res = await request(app)
			.delete(`/applications/${application.id}`)
			.set("Authorization", `Bearer ${accessToken}`);

		expect(res.statusCode).toBe(200);
		expect(res.body).toHaveProperty("message", "Application deleted successfully");

		const deletedApplication = await JobApplication.findByPk(application.id);
		expect(deletedApplication).toBe(null);
	});

	test("DELETE /applications/:id: negative case - should return 404 when application not found", async () => {
		const res = await request(app)
			.delete("/applications/999999")
			.set("Authorization", `Bearer ${accessToken}`);

		expect(res.statusCode).toBe(404);
		expect(res.body).toHaveProperty("message", "Application not found");
	});
});

describe("GET /applications/jobs", () => {
	test("GET /applications/jobs: positive case - should fetch jobs from JSearch API", async () => {
		process.env.RAPIDAPI_KEY = "test-key";
		process.env.RAPIDAPI_HOST = "jsearch.p.rapidapi.com";
		axios.request.mockResolvedValue({
			data: {
				data: {
					cursor: "next-cursor",
					jobs: [
						{
							job_id: "job-1",
							employer_name: "Tokopedia",
							job_title: "Frontend Developer",
							job_description: "React Developer",
							job_apply_link: "https://example.com/apply",
							job_location: "Jakarta",
							job_salary_string: "Rp8.000.000",
							job_publisher: "LinkedIn",
							job_employment_type: "FULLTIME",
							job_is_remote: false,
							job_posted_at: "2026-05-20",
							employer_logo: "https://example.com/logo.png",
						},
					],
				},
			},
		});

		const res = await request(app)
			.get("/applications/jobs?query=React%20Developer")
			.set("Authorization", `Bearer ${accessToken}`);

		expect(res.statusCode).toBe(200);
		expect(res.body).toHaveProperty("message", "Jobs fetched successfully");
		expect(res.body).toHaveProperty("query", "React Developer");
		expect(res.body).toHaveProperty("cursor", "next-cursor");
		expect(res.body).toHaveProperty("total", 1);
		expect(res.body.data[0]).toHaveProperty("externalId", "job-1");
		expect(res.body.data[0]).toHaveProperty("companyName", "Tokopedia");
		expect(axios.request).toHaveBeenCalledTimes(1);
	});

	test("GET /applications/jobs: positive case - should use targetRole from profile when query is empty", async () => {
		process.env.RAPIDAPI_KEY = "test-key";
		process.env.RAPIDAPI_HOST = "jsearch.p.rapidapi.com";
		await createCompleteProfile(user.id, { targetRole: "Backend Developer" });
		axios.request.mockResolvedValue({ data: { data: { cursor: null, jobs: [] } } });

		const res = await request(app)
			.get("/applications/jobs")
			.set("Authorization", `Bearer ${accessToken}`);

		expect(res.statusCode).toBe(200);
		expect(res.body).toHaveProperty("query", "Backend Developer");
	});

	test("GET /applications/jobs: negative case - should return 400 when API config is missing", async () => {
		const res = await request(app)
			.get("/applications/jobs?query=React")
			.set("Authorization", `Bearer ${accessToken}`);

		expect(res.statusCode).toBe(400);
		expect(res.body).toHaveProperty("message", "JSearch API config is missing");
	});

	test("GET /applications/jobs: negative case - should return 400 when query empty and profile target role not found", async () => {
		process.env.RAPIDAPI_KEY = "test-key";
		process.env.RAPIDAPI_HOST = "jsearch.p.rapidapi.com";

		const res = await request(app)
			.get("/applications/jobs")
			.set("Authorization", `Bearer ${otherAccessToken}`);

		expect(res.statusCode).toBe(400);
		expect(res.body).toHaveProperty(
			"message",
			"Query is required or complete your target role in profile",
		);
	});
});
