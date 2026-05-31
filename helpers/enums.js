const ApplicationStatus = Object.freeze({
	WISHLIST: "Wishlist",
	APPLIED: "Applied",
	INTERVIEW: "Interview",
	OFFERING: "Offering",
	REJECTED: "Rejected",
	ACCEPTED: "Accepted",
});

const InterviewCategory = Object.freeze({
	TECHNICAL: "Technical",
	BEHAVIORAL: "Behavioral",
	HR: "HR",
	PROJECT_BASED: "ProjectBased",
});

const InterviewResult = Object.freeze({
	PENDING: "Pending",
	PASSED: "Passed",
	FAILED: "Failed",
	RESCHEDULED: "Rescheduled",
});

const LanguageLevel = Object.freeze({
	BEGINNER: "Beginner",
	INTERMEDIATE: "Intermediate",
	ADVANCED: "Advanced",
	FLUENT: "Fluent",
	NATIVE: "Native",
});

const statusCode = Object.freeze({
	BadRequest: 400,
	Unauthorized: 401,
	Forbidden: 403,
	NotFound: 404,
	SequelizeValidationError: 400,
	SequelizeUniqueConstraintError: 400,
	JsonWebTokenError: 401,
});

const errorName = Object.freeze({
	BadRequest: "BadRequest",
	Unauthorized: "Unauthorized",
	Forbidden: "Forbidden",
	NotFound: "NotFound",
	SequelizeValidationError: "SequelizeValidationError",
	SequelizeUniqueConstraintError: "SequelizeUniqueConstraintError",
	JsonWebTokenError: "JsonWebTokenError",
});

module.exports = {
	ApplicationStatus,
	InterviewCategory,
	InterviewResult,
	LanguageLevel,
	statusCode,
	errorName,
};
