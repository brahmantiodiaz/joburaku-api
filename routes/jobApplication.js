const router = require("express").Router();
const authentication = require("../middlewares/authentication");
const controller = require("../controllers/JobApplicationController");

router.get("/applications/jobs", authentication, controller.searchJob);

router.get("/applications", authentication, controller.getApplications);
router.post("/applications", authentication, controller.createApplication);
router.get("/applications/:id", authentication, controller.getApplicationById);
router.put("/applications/:id", authentication, controller.updateApplication);
router.patch(
	"/applications/:id/status",
	authentication,
	controller.updateApplicationStatus,
);
router.delete(
	"/applications/:id",
	authentication,
	controller.deleteApplication,
);

module.exports = router;
