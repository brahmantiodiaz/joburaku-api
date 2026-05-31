const { Op } = require("sequelize");
const { JobApplication, UserProfile } = require("../models");
const { ApplicationStatus, errorName } = require("../helpers/enums");
const { AppError } = require("../models/utils/class");
const axios = require("axios");

function validateStatus(status) {
	if (status && !Object.values(ApplicationStatus).includes(status)) {
		throw new AppError(errorName.BadRequest, "Status is invalid");
	}
}

function payload(body, UserId) {
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

async function findOwnedApplication(id, UserId) {
	const application = await JobApplication.findOne({ where: { id, UserId } });
	if (!application)
		throw new AppError(errorName.NotFound, "Application not found");
	return application;
}

function cleanJobLocation(location) {
	if (!location) return null;

	return location
		.split("•")[0]
		.replace(/\s+melalui\s+.*$/i, "")
		.replace(/\s+via\s+.*$/i, "")
		.trim();
}

class JobApplicationController {
	static async getApplications(req, res, next) {
		try {
			const UserId = req.user.id;
			const { search, status, sort } = req.query;
			validateStatus(status);
			const where = { UserId };
			if (status) where.status = status;
			if (search) {
				where[Op.or] = [
					{ companyName: { [Op.iLike]: `%${search}%` } },
					{ position: { [Op.iLike]: `%${search}%` } },
				];
			}
			const order =
				sort === "oldest" ? [["createdAt", "ASC"]] : [["createdAt", "DESC"]];
			const applications = await JobApplication.findAll({ where, order });
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
				payload(req.body, UserId),
			);
			res.status(201).json(application);
		} catch (error) {
			next(error);
		}
	}

	static async getApplicationById(req, res, next) {
		try {
			const application = await findOwnedApplication(
				req.params.id,
				req.user.id,
			);
			res.status(200).json(application);
		} catch (error) {
			next(error);
		}
	}

	static async updateApplication(req, res, next) {
		try {
			validateStatus(req.body.status);
			const application = await findOwnedApplication(
				req.params.id,
				req.user.id,
			);
			await application.update(payload(req.body, req.user.id));
			res.status(200).json(application);
		} catch (error) {
			next(error);
		}
	}

	static async updateApplicationStatus(req, res, next) {
		try {
			const { status } = req.body;
			if (!status)
				throw new AppError(errorName.BadRequest, "Status is required");
			validateStatus(status);
			const application = await findOwnedApplication(
				req.params.id,
				req.user.id,
			);
			await application.update({ status });
			res.status(200).json(application);
		} catch (error) {
			next(error);
		}
	}

	static async deleteApplication(req, res, next) {
		try {
			const application = await findOwnedApplication(
				req.params.id,
				req.user.id,
			);
			await application.destroy();
			res.status(200).json({ message: "Application deleted successfully" });
		} catch (error) {
			next(error);
		}
	}

	static async searchJob(req, res, next) {
		try {
			if (!process.env.RAPIDAPI_KEY || !process.env.RAPIDAPI_HOST) {
				throw new AppError(
					errorName.BadRequest,
					"JSearch API config is missing",
				);
			}
			const {
				query,
				cursor,
				num_pages = 1,
				country = "id",
				language = "ID",
				location = "Jakarta",
				date_posted = "all",
				work_from_home,
			} = req.query;

			const UserId = req.user.id;

			let searchQuery = query;

			if (!searchQuery) {
				const profile = await UserProfile.findOne({
					where: { UserId },
				});

				if (!profile || !profile.targetRole) {
					throw new AppError(
						errorName.BadRequest,
						"Query is required or complete your target role in profile",
					);
				}

				searchQuery = `${profile.targetRole}`;
			}

			const options = {
				method: "GET",
				url: "https://jsearch.p.rapidapi.com/search-v2",
				params: {
					query: searchQuery,
					num_pages,
					country,
					language,
					location,
					date_posted,
				},
				headers: {
					"x-rapidapi-key": process.env.RAPIDAPI_KEY,
					"x-rapidapi-host": process.env.RAPIDAPI_HOST,
					"Content-Type": "application/json",
				},
			};

			if (cursor) {
				options.params.cursor = cursor;
			}

			if (work_from_home !== undefined) {
				options.params.work_from_home = work_from_home;
			}

			const response = await axios.request(options);
			// console.log(response);

			const jobs = response.data?.data?.jobs || [];

			const mappedJobs = jobs.map((job) => {
				return {
					externalId: job.job_id,
					companyName: job.employer_name,
					position: job.job_title,
					jobDescription: job.job_description,
					jobUrl: job.job_apply_link,
					location: cleanJobLocation(job.job_location),
					salaryRange: job.job_salary_string,
					source: job.job_publisher,
					employmentType: job.job_employment_type,
					isRemote: job.job_is_remote,
					postedAt: job.job_posted_at,
					companyLogo: job.employer_logo,
				};
			});

			res.status(200).json({
				message: "Jobs fetched successfully",
				query: searchQuery,
				cursor: response.data?.data?.cursor || null,
				total: mappedJobs.length,
				data: mappedJobs,
			});
		} catch (error) {
			next(error);
		}
	}
}

module.exports = JobApplicationController;
