const router = require("express").Router();
const UserController = require("../controllers/UserController");
const authentication = require("../middlewares/authentication");

router.post("/register", UserController.register);
router.post("/login", UserController.login);
router.get("/current-user", authentication, UserController.getCurrentUser);

router.get("/google-login", UserController.googleLogin);

router.patch("/account/name", authentication, UserController.updateName);
router.patch(
	"/account/password",
	authentication,
	UserController.updatePassword,
);
router.post("/forgot-password", UserController.forgotPassword);
router.post("/reset-password", UserController.resetPassword);
router.post(
	"/check-reset-password-token",
	UserController.checkResetPasswordToken,
);
module.exports = router;
