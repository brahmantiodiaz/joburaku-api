const router = require("express").Router();
const UserProfileController = require("../controllers/UserProfileController");
const authentication = require("../middlewares/authentication");

router.post("/user-profile", authentication, UserProfileController.createUserProfile);

module.exports = router;
