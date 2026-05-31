const route = require("express").Router();
const authentication = require("../middlewares/authentication");
const controller = require("../controllers/UserProfileController");
const upload = require("../helpers/multer");

route.get("/profile", authentication, controller.getProfile);
route.post("/profile", authentication, controller.createProfile);
route.put("/profile", authentication, controller.updateProfile);
route.patch(
	"/profile/updateImage",
	authentication,
	upload.single("image"),
	controller.updateUserImage,
);

module.exports = route;
