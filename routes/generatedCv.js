const GeneratedCvController = require("../controllers/GenerateCvController");
const authentication = require("../middlewares/authentication");

const router = require("express").Router();

router.post(
	"/applications/:id/generated-cvs",
	authentication,
	GeneratedCvController.createGeneratedCv,
);

router.get(
	"/applications/:id/generated-cvs",
	authentication,
	GeneratedCvController.getGeneratedCvsByApplication,
);

router.get(
	"/generated-cvs/:id",
	authentication,
	GeneratedCvController.getGeneratedCvById,
);
router.get(
	"/generated-cvs/:id/download",
	authentication,
	GeneratedCvController.downloadGeneratedCv,
);

router.delete(
	"/generated-cvs/:id",
	authentication,
	GeneratedCvController.deleteGeneratedCv,
);
module.exports = router;
