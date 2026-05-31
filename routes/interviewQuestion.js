const router = require("express").Router();
const authentication = require("../middlewares/authentication");
const InterviewQuestionController = require("../controllers/InterviewQuestionController");

router.post(
	"/applications/:id/interview-questions",
	authentication,
	InterviewQuestionController.generateInterviewQuestions,
);

router.get(
	"/applications/:id/interview-questions",
	authentication,
	InterviewQuestionController.getInterviewQuestionsByApplication,
);

router.patch(
	"/interview-questions/:id/answer",
	authentication,
	InterviewQuestionController.updateInterviewAnswer,
);

module.exports = router;
