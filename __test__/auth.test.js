const mockVerifyIdToken = jest.fn();

jest.mock("puppeteer", () => ({
	launch: jest.fn(),
}));

jest.mock("../helpers/mailer", () => ({
	sendMail: jest.fn().mockResolvedValue(true),
}));

jest.mock("google-auth-library", () => ({
	OAuth2Client: jest.fn().mockImplementation(() => ({
		verifyIdToken: mockVerifyIdToken,
	})),
}));

const request = require("supertest");
const app = require("../app");
const { User, UserProfile } = require("../models");
const { checkPassword } = require("../helpers/bcrypt");
const { sendMail } = require("../helpers/mailer");
const {
	generateToken,
	createTestUser,
	userPayload,
	cleanupDatabase,
} = require("./helpers");

let user;
let accessToken;

beforeAll(async () => {
	await cleanupDatabase();

	user = await createTestUser({
		name: "Auth User",
		email: "auth-user@mail.com",
		username: "authuser",
		password: "123456",
	});

	accessToken = generateToken(user);
});

afterEach(() => {
	jest.restoreAllMocks();
	mockVerifyIdToken.mockReset();
	sendMail.mockClear();
});

afterAll(async () => {
	await cleanupDatabase();
});

describe("POST /register", () => {
	test("POST /register: positive case - should create new user", async () => {
		const payload = userPayload({
			name: "New User",
			email: "new-user@mail.com",
			username: "newuser",
			password: "123456",
		});

		const res = await request(app).post("/register").send(payload);

		expect(res.statusCode).toBe(201);
		expect(res.body).toHaveProperty("id", expect.any(Number));
		expect(res.body).toHaveProperty("name", payload.name);
		expect(res.body).toHaveProperty("email", payload.email);
		expect(res.body).toHaveProperty("username", payload.username);
		expect(res.body).not.toHaveProperty("password");
	});

	test("POST /register: negative case - should return 400 when name is empty", async () => {
		const res = await request(app)
			.post("/register")
			.send(
				userPayload({
					name: "",
				}),
			);

		expect(res.statusCode).toBe(400);
		expect(res.body).toHaveProperty("message", "name is required");
	});

	test("POST /register: negative case - should return 400 when email format is invalid", async () => {
		const res = await request(app)
			.post("/register")
			.send(
				userPayload({
					email: "wrong-email-format",
				}),
			);

		expect(res.statusCode).toBe(400);
		expect(res.body).toHaveProperty("message", "email format is invalid");
	});

	test("POST /register: negative case - should return 400 when username already exists", async () => {
		const res = await request(app)
			.post("/register")
			.send(
				userPayload({
					email: "unique-username-test@mail.com",
					username: user.username,
				}),
			);

		expect(res.statusCode).toBe(400);
		expect(res.body).toHaveProperty("message", "Username already exists");
	});

	test("POST /register: negative case - should return 500 when server error happens", async () => {
		jest.spyOn(User, "create").mockRejectedValue(new Error("DB ERROR"));

		const res = await request(app).post("/register").send(userPayload());

		expect(res.statusCode).toBe(500);
		expect(res.body).toHaveProperty("message", "Internal server error");
	});
});

describe("POST /login", () => {
	test("POST /login: positive case - should return access token", async () => {
		const res = await request(app).post("/login").send({
			email: "auth-user@mail.com",
			password: "123456",
		});

		expect(res.statusCode).toBe(200);
		expect(res.body).toHaveProperty("access_token", expect.any(String));
	});

	test("POST /login: negative case - should return 400 when email is empty", async () => {
		const res = await request(app).post("/login").send({
			password: "123456",
		});

		expect(res.statusCode).toBe(400);
		expect(res.body).toHaveProperty("message", "email is required");
	});

	test("POST /login: negative case - should return 400 when password is empty", async () => {
		const res = await request(app).post("/login").send({
			email: "auth-user@mail.com",
		});

		expect(res.statusCode).toBe(400);
		expect(res.body).toHaveProperty("message", "password is required");
	});

	test("POST /login: negative case - should return 401 when email is wrong", async () => {
		const res = await request(app).post("/login").send({
			email: "wrong@mail.com",
			password: "123456",
		});

		expect(res.statusCode).toBe(401);
		expect(res.body).toHaveProperty("message", "invalid email/password");
	});

	test("POST /login: negative case - should return 401 when password is wrong", async () => {
		const res = await request(app).post("/login").send({
			email: "auth-user@mail.com",
			password: "wrong-password",
		});

		expect(res.statusCode).toBe(401);
		expect(res.body).toHaveProperty("message", "invalid email/password");
	});

	test("POST /login: negative case - should return 500 when server error happens", async () => {
		jest.spyOn(User, "findOne").mockRejectedValue(new Error("DB ERROR"));

		const res = await request(app).post("/login").send({
			email: "auth-user@mail.com",
			password: "123456",
		});

		expect(res.statusCode).toBe(500);
		expect(res.body).toHaveProperty("message", "Internal server error");
	});
});

describe("GET /current-user", () => {
	test("GET /current-user: positive case - should return logged in user", async () => {
		const res = await request(app)
			.get("/current-user")
			.set("Authorization", `Bearer ${accessToken}`);

		expect(res.statusCode).toBe(200);
		expect(res.body).toHaveProperty("id", user.id);
		expect(res.body).toHaveProperty("email", user.email);
		expect(res.body).toHaveProperty("username", user.username);
		expect(res.body).not.toHaveProperty("password");
	});

	test("GET /current-user: negative case - should return 401 when no token", async () => {
		const res = await request(app).get("/current-user");

		expect(res.statusCode).toBe(401);
		expect(res.body).toHaveProperty("message", "Invalid token");
	});

	test("GET /current-user: negative case - should return 401 when authorization type is not Bearer", async () => {
		const res = await request(app)
			.get("/current-user")
			.set("Authorization", "Basic invalidtoken");

		expect(res.statusCode).toBe(401);
		expect(res.body).toHaveProperty("message", "Invalid token");
	});

	test("GET /current-user: negative case - should return 401 when Bearer token is empty", async () => {
		const res = await request(app)
			.get("/current-user")
			.set("Authorization", "Bearer");

		expect(res.statusCode).toBe(401);
		expect(res.body).toHaveProperty("message", "Invalid token");
	});

	test("GET /current-user: negative case - should return 401 when JWT token is malformed", async () => {
		const res = await request(app)
			.get("/current-user")
			.set("Authorization", "Bearer invalid.jwt.token");

		expect(res.statusCode).toBe(401);
		expect(res.body).toHaveProperty("message", "Invalid token");
	});

	test("GET /current-user: negative case - should return 401 when token user does not exist", async () => {
		const missingUserToken = generateToken({
			id: 999999,
			email: "missing-user@mail.com",
			username: "missinguser",
		});

		const res = await request(app)
			.get("/current-user")
			.set("Authorization", `Bearer ${missingUserToken}`);

		expect(res.statusCode).toBe(401);
		expect(res.body).toHaveProperty("message", "Invalid token");
	});
});

describe("PATCH /account/name", () => {
	test("PATCH /account/name: positive case - should update user name", async () => {
		const res = await request(app)
			.patch("/account/name")
			.set("Authorization", `Bearer ${accessToken}`)
			.send({ name: "Updated Auth User" });

		expect(res.statusCode).toBe(200);
		expect(res.body).toHaveProperty("id", user.id);
		expect(res.body).toHaveProperty("name", "Updated Auth User");
		expect(res.body).not.toHaveProperty("password");
	});

	test("PATCH /account/name: negative case - should return 400 when name is empty", async () => {
		const res = await request(app)
			.patch("/account/name")
			.set("Authorization", `Bearer ${accessToken}`)
			.send({ name: "" });

		expect(res.statusCode).toBe(400);
		expect(res.body).toHaveProperty("message", "name is required");
	});

	test("PATCH /account/name: negative case - should return 404 when user not found after authentication", async () => {
		jest
			.spyOn(User, "findByPk")
			.mockResolvedValueOnce(user)
			.mockResolvedValueOnce(null);

		const res = await request(app)
			.patch("/account/name")
			.set("Authorization", `Bearer ${accessToken}`)
			.send({ name: "Should Not Update" });

		expect(res.statusCode).toBe(404);
		expect(res.body).toHaveProperty("message", "User not found");
	});
});

describe("PATCH /account/password", () => {
	test("PATCH /account/password: positive case - should update password", async () => {
		const res = await request(app)
			.patch("/account/password")
			.set("Authorization", `Bearer ${accessToken}`)
			.send({
				oldPassword: "123456",
				newPassword: "newpassword123",
			});

		expect(res.statusCode).toBe(200);
		expect(res.body).toHaveProperty("message", "Password updated successfully");

		await user.reload();
		expect(checkPassword("newpassword123", user.password)).toBe(true);
	});

	test("PATCH /account/password: negative case - should return 400 when oldPassword is empty", async () => {
		const res = await request(app)
			.patch("/account/password")
			.set("Authorization", `Bearer ${accessToken}`)
			.send({ newPassword: "newpassword123" });

		expect(res.statusCode).toBe(400);
		expect(res.body).toHaveProperty("message", "oldPassword is required");
	});

	test("PATCH /account/password: negative case - should return 400 when newPassword is empty", async () => {
		const res = await request(app)
			.patch("/account/password")
			.set("Authorization", `Bearer ${accessToken}`)
			.send({ oldPassword: "newpassword123" });

		expect(res.statusCode).toBe(400);
		expect(res.body).toHaveProperty("message", "newPassword is required");
	});

	test("PATCH /account/password: negative case - should return 401 when oldPassword is invalid", async () => {
		const res = await request(app)
			.patch("/account/password")
			.set("Authorization", `Bearer ${accessToken}`)
			.send({
				oldPassword: "wrong-password",
				newPassword: "newpassword456",
			});

		expect(res.statusCode).toBe(401);
		expect(res.body).toHaveProperty("message", "old password is invalid");
	});

	test("PATCH /account/password: negative case - should return 404 when user not found after authentication", async () => {
		jest
			.spyOn(User, "findByPk")
			.mockResolvedValueOnce(user)
			.mockResolvedValueOnce(null);

		const res = await request(app)
			.patch("/account/password")
			.set("Authorization", `Bearer ${accessToken}`)
			.send({
				oldPassword: "newpassword123",
				newPassword: "newpassword456",
			});

		expect(res.statusCode).toBe(404);
		expect(res.body).toHaveProperty("message", "User not found");
	});
});

describe("POST /forgot-password", () => {
	test("POST /forgot-password: positive case - should send reset password link", async () => {
		const res = await request(app).post("/forgot-password").send({
			email: user.email,
		});

		expect(res.statusCode).toBe(200);
		expect(res.body).toHaveProperty(
			"message",
			"Reset password link has been sent to your email",
		);
		expect(sendMail).toHaveBeenCalledTimes(1);
	});

	test("POST /forgot-password: negative case - should return 400 when email is empty", async () => {
		const res = await request(app).post("/forgot-password").send({});

		expect(res.statusCode).toBe(400);
		expect(res.body).toHaveProperty("message", "email is required");
	});

	test("POST /forgot-password: negative case - should return 404 when user not found", async () => {
		const res = await request(app).post("/forgot-password").send({
			email: "notfound@mail.com",
		});

		expect(res.statusCode).toBe(404);
		expect(res.body).toHaveProperty("message", "User not found");
	});

	test("POST /forgot-password: negative case - should return 500 when mailer throws error", async () => {
		sendMail.mockRejectedValueOnce(new Error("MAIL ERROR"));

		const res = await request(app).post("/forgot-password").send({
			email: user.email,
		});

		expect(res.statusCode).toBe(500);
		expect(res.body).toHaveProperty("message", "Internal server error");
	});
});

describe("POST /check-reset-password-token", () => {
	test("POST /check-reset-password-token: positive case - should validate token", async () => {
		await user.update({
			resetPasswordToken: "valid-token",
			resetPasswordExpiredAt: new Date(Date.now() + 1000 * 60 * 15),
		});

		const res = await request(app).post("/check-reset-password-token").send({
			token: "valid-token",
		});

		expect(res.statusCode).toBe(200);
		expect(res.body).toHaveProperty("message", "Reset password token is valid");
	});

	test("POST /check-reset-password-token: negative case - should return 400 when token is empty", async () => {
		const res = await request(app).post("/check-reset-password-token").send({});

		expect(res.statusCode).toBe(400);
		expect(res.body).toHaveProperty("message", "token is required");
	});

	test("POST /check-reset-password-token: negative case - should return 400 when token is invalid", async () => {
		const res = await request(app).post("/check-reset-password-token").send({
			token: "invalid-token",
		});

		expect(res.statusCode).toBe(400);
		expect(res.body).toHaveProperty("message", "Invalid reset password token");
	});

	test("POST /check-reset-password-token: negative case - should return 400 when token expired", async () => {
		await user.update({
			resetPasswordToken: "expired-token",
			resetPasswordExpiredAt: new Date(Date.now() - 1000 * 60),
		});

		const res = await request(app).post("/check-reset-password-token").send({
			token: "expired-token",
		});

		expect(res.statusCode).toBe(400);
		expect(res.body).toHaveProperty(
			"message",
			"Reset password token has expired",
		);
	});
});

describe("POST /reset-password", () => {
	test("POST /reset-password: positive case - should reset password", async () => {
		await user.update({
			resetPasswordToken: "reset-token",
			resetPasswordExpiredAt: new Date(Date.now() + 1000 * 60 * 15),
		});

		const res = await request(app).post("/reset-password").send({
			token: "reset-token",
			newPassword: "resetpassword123",
		});

		expect(res.statusCode).toBe(200);
		expect(res.body).toHaveProperty(
			"message",
			"Password has been reset successfully",
		);

		await user.reload();
		expect(user.resetPasswordToken).toBe(null);
		expect(user.resetPasswordExpiredAt).toBe(null);
		expect(checkPassword("resetpassword123", user.password)).toBe(true);
	});

	test("POST /reset-password: negative case - should return 400 when newPassword is empty", async () => {
		const res = await request(app).post("/reset-password").send({
			token: "reset-token",
		});

		expect(res.statusCode).toBe(400);
		expect(res.body).toHaveProperty("message", "newPassword is required");
	});

	test("POST /reset-password: negative case - should return 400 when token is empty", async () => {
		const res = await request(app).post("/reset-password").send({
			newPassword: "resetpassword123",
		});

		expect(res.statusCode).toBe(400);
		expect(res.body).toHaveProperty("message", "token is required");
	});

	test("POST /reset-password: negative case - should return 400 when token is invalid", async () => {
		const res = await request(app).post("/reset-password").send({
			token: "invalid-reset-token",
			newPassword: "resetpassword123",
		});

		expect(res.statusCode).toBe(400);
		expect(res.body).toHaveProperty("message", "Invalid reset password token");
	});

	test("POST /reset-password: negative case - should return 400 when token expired", async () => {
		await user.update({
			resetPasswordToken: "expired-reset-token",
			resetPasswordExpiredAt: new Date(Date.now() - 1000 * 60),
		});

		const res = await request(app).post("/reset-password").send({
			token: "expired-reset-token",
			newPassword: "resetpassword123",
		});

		expect(res.statusCode).toBe(400);
		expect(res.body).toHaveProperty(
			"message",
			"Reset password token has expired",
		);
	});
});

describe("GET /google-login", () => {
	test("GET /google-login: negative case - should return 400 when Google token is missing", async () => {
		const res = await request(app).get("/google-login");

		expect(res.statusCode).toBe(400);
		expect(res.body).toHaveProperty("message", "Google token is required");
	});

	test("GET /google-login: negative case - should return 400 when Google email is not verified", async () => {
		mockVerifyIdToken.mockResolvedValueOnce({
			getPayload: () => ({
				email: "google-unverified@mail.com",
				email_verified: false,
				name: "Google Unverified",
				picture: "https://example.com/avatar.jpg",
			}),
		});

		const res = await request(app)
			.get("/google-login")
			.set("accessgoogle", "fake-google-token");

		expect(res.statusCode).toBe(400);
		expect(res.body).toHaveProperty("message", "Email is not verified");
		expect(mockVerifyIdToken).toHaveBeenCalledTimes(1);
	});

	test("GET /google-login: positive case - should create new user and profile when Google account is new", async () => {
		mockVerifyIdToken.mockResolvedValueOnce({
			getPayload: () => ({
				email: "new-google-user@mail.com",
				email_verified: true,
				name: "New Google User",
				picture: "https://example.com/avatar.jpg",
			}),
		});

		const res = await request(app)
			.get("/google-login")
			.set("accessgoogle", "fake-google-token");

		expect(res.statusCode).toBe(200);
		expect(res.body).toHaveProperty("access_token", expect.any(String));

		const googleUser = await User.findOne({
			where: { email: "new-google-user@mail.com" },
		});

		expect(googleUser).toBeTruthy();
		expect(googleUser.name).toBe("New Google User");
		expect(googleUser.username).toBe("new-google-user@mail.com");

		const googleProfile = await UserProfile.findOne({
			where: { UserId: googleUser.id },
		});

		expect(googleProfile).toBeTruthy();
		expect(googleProfile.fullName).toBe("New Google User");
		expect(googleProfile.imageUrl).toBe("https://example.com/avatar.jpg");
		expect(googleProfile.targetRole).toBe("Job Seeker");
	});

	test("GET /google-login: positive case - should use default name and null image when Google payload has no name and picture", async () => {
		mockVerifyIdToken.mockResolvedValueOnce({
			getPayload: () => ({
				email: "default-name-google@mail.com",
				email_verified: true,
			}),
		});

		const res = await request(app)
			.get("/google-login")
			.set("accessgoogle", "fake-google-token");

		expect(res.statusCode).toBe(200);
		expect(res.body).toHaveProperty("access_token", expect.any(String));

		const googleUser = await User.findOne({
			where: { email: "default-name-google@mail.com" },
		});

		expect(googleUser).toBeTruthy();
		expect(googleUser.name).toBe("default-name-google");

		const googleProfile = await UserProfile.findOne({
			where: { UserId: googleUser.id },
		});

		expect(googleProfile).toBeTruthy();
		expect(googleProfile.fullName).toBe("default-name-google");
		expect(googleProfile.imageUrl).toBe(null);
	});

	test("GET /google-login: positive case - should login existing user without creating duplicate profile", async () => {
		mockVerifyIdToken.mockResolvedValueOnce({
			getPayload: () => ({
				email: user.email,
				email_verified: true,
				name: "Existing Google User",
				picture: "https://example.com/existing-avatar.jpg",
			}),
		});

		const profileBeforeLogin = await UserProfile.count({
			where: { UserId: user.id },
		});

		const res = await request(app)
			.get("/google-login")
			.set("accessgoogle", "fake-google-token");

		expect(res.statusCode).toBe(200);
		expect(res.body).toHaveProperty("access_token", expect.any(String));

		const profileAfterLogin = await UserProfile.count({
			where: { UserId: user.id },
		});

		expect(profileAfterLogin).toBe(profileBeforeLogin);
	});

	test("GET /google-login: negative case - should return 500 when Google verify token throws error", async () => {
		mockVerifyIdToken.mockRejectedValueOnce(new Error("GOOGLE ERROR"));

		const res = await request(app)
			.get("/google-login")
			.set("accessgoogle", "fake-google-token");

		expect(res.statusCode).toBe(500);
		expect(res.body).toHaveProperty("message", "Internal server error");
	});
});
