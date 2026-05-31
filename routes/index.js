const router = require("express").Router();
const authRoute = require("./auth");
const userProfileRoute = require("./userProfile");
const jobApplicationRoute = require("./jobApplication");
const generatedCvRoute = require("./generatedCv");
const interviewQuestionRoute = require("./interviewQuestion");

router.use(authRoute);
router.use(userProfileRoute);
router.use(jobApplicationRoute);
router.use(generatedCvRoute);
router.use(interviewQuestionRoute);

module.exports = router;
