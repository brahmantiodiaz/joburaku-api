const router = require("express").Router();
const errorHandler = require("../middlewares/errorHandler");
const authRoute = require("./auth");
const userProfileRoute = require("./userProfile");

router.use(authRoute);
router.use(userProfileRoute);
router.use(errorHandler);

module.exports = router;
