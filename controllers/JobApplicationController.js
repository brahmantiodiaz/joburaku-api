const { Op } = require("sequelize");
const { JobApplication } = require("../models");
const { errorName } = require("../helpers/enums");
const { AppError } = require("../models/utils/class");

const allowedApplicationStatuses = [
  "Wishlist",
  "Applied",
  "Interview",
  "Offering",
  "Rejected",
  "Accepted",
];

function pickApplicationPayload(body, UserId) {
  const {
    companyName,
    position,
    jobDescription,
    jobUrl,
    location,
    salaryRange,
    status,
    appliedDate,
    notes,
  } = body;

  return {
    UserId,
    companyName,
    position,
    jobDescription,
    jobUrl,
    location,
    salaryRange,
    status,
    appliedDate,
    notes,
  };
}

function validateStatus(status) {
  if (status && !allowedApplicationStatuses.includes(status)) {
    throw new AppError(errorName.BadRequest, "Status is invalid");
  }
}

async function findUserApplication(id, UserId) {
  const application = await JobApplication.findOne({
    where: {
      id,
      UserId,
    },
  });

  if (!application) {
    throw new AppError(errorName.NotFound, "Application not found");
  }

  return application;
}

class JobApplicationController {
  static async getApplications(req, res, next) {
    try {
      const UserId = req.user.id;
      const { search, status, sort } = req.query;

      validateStatus(status);

      const where = { UserId };

      if (status) {
        where.status = status;
      }

      if (search) {
        where[Op.or] = [
          { companyName: { [Op.iLike]: `%${search}%` } },
          { position: { [Op.iLike]: `%${search}%` } },
        ];
      }

      const order = sort === "oldest" ? [["createdAt", "ASC"]] : [["createdAt", "DESC"]];

      const applications = await JobApplication.findAll({
        where,
        order,
      });

      res.status(200).json(applications);
    } catch (error) {
      next(error);
    }
  }

  static async createApplication(req, res, next) {
    try {
      const UserId = req.user.id;

      validateStatus(req.body.status);

      const application = await JobApplication.create(
        pickApplicationPayload(req.body, UserId),
      );

      res.status(201).json(application);
    } catch (error) {
      next(error);
    }
  }

  static async getApplicationById(req, res, next) {
    try {
      const UserId = req.user.id;
      const { id } = req.params;

      const application = await findUserApplication(id, UserId);

      res.status(200).json(application);
    } catch (error) {
      next(error);
    }
  }

  static async updateApplication(req, res, next) {
    try {
      const UserId = req.user.id;
      const { id } = req.params;

      validateStatus(req.body.status);

      const application = await findUserApplication(id, UserId);

      await application.update(pickApplicationPayload(req.body, UserId));

      res.status(200).json(application);
    } catch (error) {
      next(error);
    }
  }

  static async updateApplicationStatus(req, res, next) {
    try {
      const UserId = req.user.id;
      const { id } = req.params;
      const { status } = req.body;

      if (!status) {
        throw new AppError(errorName.BadRequest, "Status is required");
      }

      validateStatus(status);

      const application = await findUserApplication(id, UserId);

      await application.update({ status });

      res.status(200).json(application);
    } catch (error) {
      next(error);
    }
  }

  static async deleteApplication(req, res, next) {
    try {
      const UserId = req.user.id;
      const { id } = req.params;

      const application = await findUserApplication(id, UserId);

      await application.destroy();

      res.status(200).json({ message: "Application deleted successfully" });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = JobApplicationController;
