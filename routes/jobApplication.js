const router = require("express").Router();
const JobApplicationController = require("../controllers/JobApplicationController");
const authentication = require("../middlewares/authentication");

router.get("/applications", authentication, JobApplicationController.getApplications);
router.post("/applications", authentication, JobApplicationController.createApplication);
router.get("/applications/:id", authentication, JobApplicationController.getApplicationById);
router.put("/applications/:id", authentication, JobApplicationController.updateApplication);
router.patch("/applications/:id/status", authentication, JobApplicationController.updateApplicationStatus);
router["delete"]("/applications/:id", authentication, JobApplicationController.deleteApplication);

module.exports = router;
