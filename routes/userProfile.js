const router = require("express").Router();
const UserProfileController = require("../controllers/UserProfileController");
const authentication = require("../middlewares/authentication");

router.get("/profile", authentication, UserProfileController.getProfile);
router.post("/profile", authentication, UserProfileController.createProfile);
router.put("/profile", authentication, UserProfileController.updateProfile);

module.exports = router;
