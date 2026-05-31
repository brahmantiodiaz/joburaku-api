"use strict";

const { Op, QueryTypes } = require("sequelize");
const { hashPassword } = require("../helpers/bcrypt");

const now = new Date();

const seedEmails = ["raka.dev@mail.com", "nadia.finance@mail.com"];

const getSeedUsers = async (queryInterface) => {
	return queryInterface.sequelize.query(
		`
		SELECT id, email
		FROM "Users"
		WHERE email IN (:emails)
		`,
		{
			replacements: {
				emails: seedEmails,
			},
			type: QueryTypes.SELECT,
		},
	);
};

const deleteSeedData = async (queryInterface) => {
	const users = await getSeedUsers(queryInterface);
	const userIds = users.map((user) => user.id);

	if (!userIds.length) return;

	await queryInterface.bulkDelete("InterviewQuestions", {
		UserId: {
			[Op.in]: userIds,
		},
	});

	await queryInterface.bulkDelete("GeneratedCVs", {
		UserId: {
			[Op.in]: userIds,
		},
	});

	await queryInterface.bulkDelete("JobApplications", {
		UserId: {
			[Op.in]: userIds,
		},
	});

	await queryInterface.bulkDelete("CvCertifications", {
		UserId: {
			[Op.in]: userIds,
		},
	});

	await queryInterface.bulkDelete("CvWorkExperiences", {
		UserId: {
			[Op.in]: userIds,
		},
	});

	await queryInterface.bulkDelete("CvEducations", {
		UserId: {
			[Op.in]: userIds,
		},
	});

	await queryInterface.bulkDelete("CvLanguages", {
		UserId: {
			[Op.in]: userIds,
		},
	});

	await queryInterface.bulkDelete("CvSkills", {
		UserId: {
			[Op.in]: userIds,
		},
	});

	await queryInterface.bulkDelete("UserProfiles", {
		UserId: {
			[Op.in]: userIds,
		},
	});

	await queryInterface.bulkDelete("Users", {
		id: {
			[Op.in]: userIds,
		},
	});
};

module.exports = {
	async up(queryInterface) {
		await deleteSeedData(queryInterface);

		await queryInterface.bulkInsert("Users", [
			{
				name: "Raka Pratama Wijaya",
				email: "raka.dev@mail.com",
				username: "rakadev",
				password: hashPassword("demo123"),
				createdAt: now,
				updatedAt: now,
			},
			{
				name: "Nadia Putri Santoso",
				email: "nadia.finance@mail.com",
				username: "nadiafinance",
				password: hashPassword("demo123"),
				createdAt: now,
				updatedAt: now,
			},
		]);

		const users = await getSeedUsers(queryInterface);

		const userByEmail = users.reduce((acc, user) => {
			acc[user.email] = user;
			return acc;
		}, {});

		const developerId = userByEmail["raka.dev@mail.com"].id;
		const financeId = userByEmail["nadia.finance@mail.com"].id;

		await queryInterface.bulkInsert("UserProfiles", [
			{
				UserId: developerId,
				fullName: "Raka Pratama Wijaya",
				phoneNumber: "081234567890",
				address: "Jakarta Selatan, Indonesia",
				linkedInUrl: "https://www.linkedin.com/in/raka-pratama-demo",
				imageUrl: null,
				professionalSummary:
					"Full Stack Developer with experience building web applications using React.js, Node.js, Express.js, PostgreSQL, Sequelize, REST API, JWT authentication, and Tailwind CSS. Interested in scalable backend architecture, clean UI implementation, and AI-powered productivity tools.",
				targetRole: "Full Stack Developer",
				createdAt: now,
				updatedAt: now,
			},
			{
				UserId: financeId,
				fullName: "Nadia Putri Santoso",
				phoneNumber: "082112345678",
				address: "Bandung, Indonesia",
				linkedInUrl: "https://www.linkedin.com/in/nadia-finance-demo",
				imageUrl: null,
				professionalSummary:
					"Finance and Accounting professional with experience in payment processing, account reconciliation, tax documentation, budgeting support, financial reporting, and ERP transaction review. Detail-oriented and comfortable working with spreadsheets, accounting systems, and cross-functional teams.",
				targetRole: "Finance Staff",
				createdAt: now,
				updatedAt: now,
			},
		]);

		await queryInterface.bulkInsert("CvSkills", [
			{
				UserId: developerId,
				name: "JavaScript",
				category: "Programming Language",
				createdAt: now,
				updatedAt: now,
			},
			{
				UserId: developerId,
				name: "React.js",
				category: "Frontend",
				createdAt: now,
				updatedAt: now,
			},
			{
				UserId: developerId,
				name: "Node.js",
				category: "Backend",
				createdAt: now,
				updatedAt: now,
			},
			{
				UserId: developerId,
				name: "Express.js",
				category: "Backend",
				createdAt: now,
				updatedAt: now,
			},
			{
				UserId: developerId,
				name: "PostgreSQL",
				category: "Database",
				createdAt: now,
				updatedAt: now,
			},
			{
				UserId: developerId,
				name: "Sequelize",
				category: "ORM",
				createdAt: now,
				updatedAt: now,
			},
			{
				UserId: developerId,
				name: "JWT Authentication",
				category: "Backend",
				createdAt: now,
				updatedAt: now,
			},
			{
				UserId: developerId,
				name: "Tailwind CSS",
				category: "Frontend",
				createdAt: now,
				updatedAt: now,
			},

			{
				UserId: financeId,
				name: "Financial Reporting",
				category: "Finance",
				createdAt: now,
				updatedAt: now,
			},
			{
				UserId: financeId,
				name: "Bank Reconciliation",
				category: "Accounting",
				createdAt: now,
				updatedAt: now,
			},
			{
				UserId: financeId,
				name: "Accounts Payable",
				category: "Accounting",
				createdAt: now,
				updatedAt: now,
			},
			{
				UserId: financeId,
				name: "Accounts Receivable",
				category: "Accounting",
				createdAt: now,
				updatedAt: now,
			},
			{
				UserId: financeId,
				name: "Microsoft Excel",
				category: "Tools",
				createdAt: now,
				updatedAt: now,
			},
			{
				UserId: financeId,
				name: "Tax Documentation",
				category: "Tax",
				createdAt: now,
				updatedAt: now,
			},
		]);

		await queryInterface.bulkInsert("CvLanguages", [
			{
				UserId: developerId,
				language: "Indonesian",
				level: "Native",
				createdAt: now,
				updatedAt: now,
			},
			{
				UserId: developerId,
				language: "English",
				level: "Intermediate",
				createdAt: now,
				updatedAt: now,
			},
			{
				UserId: financeId,
				language: "Indonesian",
				level: "Native",
				createdAt: now,
				updatedAt: now,
			},
			{
				UserId: financeId,
				language: "English",
				level: "Intermediate",
				createdAt: now,
				updatedAt: now,
			},
		]);

		await queryInterface.bulkInsert("CvEducations", [
			{
				UserId: developerId,
				schoolName: "Nusantara Tech Academy",
				degree: "Full Stack Web Development Bootcamp",
				fieldOfStudy: "Web Development",
				score: "A",
				startDate: "2025-01-01",
				endDate: "2025-06-30",
				description:
					"Intensive program focused on JavaScript, React.js, Express.js, PostgreSQL, Sequelize, REST API, authentication, testing, deployment, and AI-based final projects.",
				createdAt: now,
				updatedAt: now,
			},
			{
				UserId: developerId,
				schoolName: "Universitas Garuda Indonesia",
				degree: "Bachelor Degree",
				fieldOfStudy: "Information Systems",
				score: "3.62",
				startDate: "2019-09-01",
				endDate: "2023-08-31",
				description:
					"Studied information systems, database management, software development, business process analysis, and project management.",
				createdAt: now,
				updatedAt: now,
			},
			{
				UserId: financeId,
				schoolName: "Universitas Merdeka Bandung",
				degree: "Bachelor Degree",
				fieldOfStudy: "Accounting",
				score: "3.71",
				startDate: "2018-09-01",
				endDate: "2022-08-31",
				description:
					"Studied financial accounting, taxation, auditing, management accounting, budgeting, and financial reporting.",
				createdAt: now,
				updatedAt: now,
			},
			{
				UserId: financeId,
				schoolName: "Lembaga Sertifikasi Akuntansi Indonesia",
				degree: "Accounting Short Course",
				fieldOfStudy: "Accounting and Tax",
				score: "Certified",
				startDate: "2023-01-01",
				endDate: "2023-03-31",
				description:
					"Short course covering bookkeeping, tax documentation, payment processing, and reconciliation workflow.",
				createdAt: now,
				updatedAt: now,
			},
		]);

		await queryInterface.bulkInsert("CvWorkExperiences", [
			{
				UserId: developerId,
				companyName: "Karya Digital Labs",
				position: "Full Stack Developer",
				startDate: "2025-07-01",
				endDate: null,
				isCurrent: true,
				description:
					"Built web applications using React.js, Express.js, PostgreSQL, Sequelize, JWT authentication, Tailwind CSS, and third-party APIs. Implemented CRUD features, dashboard pages, API integrations, and deployment workflows.",
				createdAt: now,
				updatedAt: now,
			},
			{
				UserId: developerId,
				companyName: "Freelance Project",
				position: "Frontend Developer",
				startDate: "2024-06-01",
				endDate: "2025-06-30",
				isCurrent: false,
				description:
					"Created responsive landing pages and dashboard UI using React.js, Tailwind CSS, DaisyUI, Axios, and React Router. Improved reusable component structure and API integration flow.",
				createdAt: now,
				updatedAt: now,
			},
			{
				UserId: financeId,
				companyName: "PT Sinar Makmur Abadi",
				position: "Finance Staff",
				startDate: "2022-09-01",
				endDate: null,
				isCurrent: true,
				description:
					"Handled payment submission, bank reconciliation, vendor invoice checking, tax document preparation, and monthly finance reporting. Worked closely with procurement, accounting, and treasury teams.",
				createdAt: now,
				updatedAt: now,
			},
			{
				UserId: financeId,
				companyName: "PT Cipta Niaga Sentosa",
				position: "Accounting Intern",
				startDate: "2021-06-01",
				endDate: "2021-12-31",
				isCurrent: false,
				description:
					"Assisted accounting team with journal entry preparation, invoice archiving, petty cash documentation, and spreadsheet-based reporting.",
				createdAt: now,
				updatedAt: now,
			},
		]);

		await queryInterface.bulkInsert("CvCertifications", [
			{
				UserId: developerId,
				name: "Full Stack Web Development Certificate",
				issuer: "Nusantara Tech Academy",
				issuedDate: "2025-06-30",
				credentialUrl: "https://example.com/certificates/fullstack-raka",
				description:
					"Certification for completing full stack web development program with React.js, Express.js, PostgreSQL, and deployment.",
				createdAt: now,
				updatedAt: now,
			},
			{
				UserId: developerId,
				name: "React Developer Fundamentals",
				issuer: "Online Learning Platform",
				issuedDate: "2025-08-15",
				credentialUrl: "https://example.com/certificates/react-raka",
				description:
					"Covered React components, hooks, routing, state management, API integration, and component architecture.",
				createdAt: now,
				updatedAt: now,
			},
			{
				UserId: financeId,
				name: "Brevet A & B Tax Course",
				issuer: "Tax Training Center",
				issuedDate: "2024-02-20",
				credentialUrl: "https://example.com/certificates/brevet-nadia",
				description:
					"Covered Indonesian income tax, withholding tax, VAT, tax reporting, and tax administration basics.",
				createdAt: now,
				updatedAt: now,
			},
			{
				UserId: financeId,
				name: "Microsoft Excel for Finance",
				issuer: "Finance Learning Center",
				issuedDate: "2023-10-10",
				credentialUrl: "https://example.com/certificates/excel-nadia",
				description:
					"Covered pivot tables, lookup formulas, reconciliation templates, and finance reporting dashboards.",
				createdAt: now,
				updatedAt: now,
			},
		]);

		await queryInterface.bulkInsert("JobApplications", [
			{
				UserId: developerId,
				companyName: "Tokopedia",
				position: "Full Stack Developer",
				jobDescription:
					"We are looking for a Full Stack Developer with experience in React.js, Node.js, Express.js, PostgreSQL, REST API design, authentication, Git workflow, testing, and scalable web application development.",
				jobUrl: "https://careers.example.com/tokopedia-fullstack",
				location: "Jakarta, Indonesia",
				salaryRange: "Rp10.000.000 - Rp18.000.000",
				status: "Applied",
				appliedDate: "2026-05-10",
				notes:
					"Applied via career page. Prepare technical interview about React, REST API, database design, JWT authentication, and testing.",
				createdAt: now,
				updatedAt: now,
			},
			{
				UserId: developerId,
				companyName: "Kalibrr",
				position: "Backend Developer",
				jobDescription:
					"Backend Developer needed to build secure REST APIs using Node.js, Express.js, PostgreSQL, Sequelize, JWT, unit testing, and integration with third-party services.",
				jobUrl: "https://careers.example.com/kalibrr-backend",
				location: "Jakarta Selatan, Indonesia",
				salaryRange: "Rp9.000.000 - Rp15.000.000",
				status: "Interview",
				appliedDate: "2026-05-12",
				notes:
					"HR contacted via email. Prepare database transaction, validation, error handling, middleware, and deployment topics.",
				createdAt: now,
				updatedAt: now,
			},
			{
				UserId: developerId,
				companyName: "Traveloka",
				position: "Frontend Engineer",
				jobDescription:
					"Frontend Engineer responsible for building responsive and accessible user interfaces with React.js, TypeScript, component-based architecture, API integration, performance optimization, and collaboration with product designers.",
				jobUrl: "https://careers.example.com/traveloka-frontend",
				location: "Tangerang, Indonesia",
				salaryRange: "Rp12.000.000 - Rp20.000.000",
				status: "Wishlist",
				appliedDate: null,
				notes:
					"Need to tailor CV with React, component architecture, responsive UI, accessibility, and performance keywords.",
				createdAt: now,
				updatedAt: now,
			},
			{
				UserId: financeId,
				companyName: "PT Astra Digital Finance",
				position: "Finance Staff",
				jobDescription:
					"Finance Staff responsible for payment processing, invoice verification, bank reconciliation, tax document checking, financial reporting, and coordination with vendors and internal departments.",
				jobUrl: "https://careers.example.com/astra-finance-staff",
				location: "Jakarta, Indonesia",
				salaryRange: "Rp6.000.000 - Rp9.000.000",
				status: "Applied",
				appliedDate: "2026-05-09",
				notes:
					"Applied via job portal. Prepare questions about payment workflow, AP process, reconciliation, and tax documentation.",
				createdAt: now,
				updatedAt: now,
			},
			{
				UserId: financeId,
				companyName: "PT Mandiri Solusi Akuntansi",
				position: "Accounting Officer",
				jobDescription:
					"Accounting Officer needed to prepare journal entries, support monthly closing, review invoices, maintain documentation, reconcile accounts, and assist tax reporting.",
				jobUrl: "https://careers.example.com/mandiri-accounting-officer",
				location: "Bandung, Indonesia",
				salaryRange: "Rp5.500.000 - Rp8.500.000",
				status: "Interview",
				appliedDate: "2026-05-11",
				notes:
					"Interview scheduled. Review journal entry, accrual, prepaid expense, reconciliation, and closing process.",
				createdAt: now,
				updatedAt: now,
			},
			{
				UserId: financeId,
				companyName: "PT Global Retail Nusantara",
				position: "Accounts Payable Staff",
				jobDescription:
					"Accounts Payable Staff responsible for vendor invoice validation, payment request preparation, document completeness checking, AP aging review, and communication with procurement team.",
				jobUrl: "https://careers.example.com/global-retail-ap",
				location: "Jakarta Barat, Indonesia",
				salaryRange: "Rp5.000.000 - Rp7.500.000",
				status: "Wishlist",
				appliedDate: null,
				notes:
					"Need to update CV with AP workflow, vendor invoice, payment request, and reconciliation keywords.",
				createdAt: now,
				updatedAt: now,
			},
		]);

		const applications = await queryInterface.sequelize.query(
			`
			SELECT id, "UserId", "companyName", position
			FROM "JobApplications"
			WHERE "UserId" IN (:userIds)
			`,
			{
				replacements: {
					userIds: [developerId, financeId],
				},
				type: QueryTypes.SELECT,
			},
		);

		const findApplicationId = (userId, companyName, position) => {
			const application = applications.find(
				(item) =>
					item.UserId === userId &&
					item.companyName === companyName &&
					item.position === position,
			);

			if (!application) {
				throw new Error(`Application not found: ${companyName} - ${position}`);
			}

			return application.id;
		};

		const tokopediaId = findApplicationId(
			developerId,
			"Tokopedia",
			"Full Stack Developer",
		);

		const kalibrrId = findApplicationId(
			developerId,
			"Kalibrr",
			"Backend Developer",
		);

		const astraFinanceId = findApplicationId(
			financeId,
			"PT Astra Digital Finance",
			"Finance Staff",
		);

		const accountingOfficerId = findApplicationId(
			financeId,
			"PT Mandiri Solusi Akuntansi",
			"Accounting Officer",
		);

		await queryInterface.bulkInsert("GeneratedCVs", [
			{
				UserId: developerId,
				JobApplicationId: tokopediaId,
				title: "CV Full Stack Developer - Tokopedia",
				atsScore: 86,
				matchScore: 89,
				keywordSuggestions:
					"React.js, Node.js, Express.js, PostgreSQL, REST API, JWT Authentication, Sequelize, Testing, Git Workflow",
				missingKeywords: "TypeScript, CI/CD, Docker, Microservices",
				summary:
					"Full Stack Developer with experience building responsive web applications and secure REST APIs using React.js, Node.js, Express.js, PostgreSQL, Sequelize, and JWT authentication.",
				skills:
					"JavaScript, React.js, Node.js, Express.js, PostgreSQL, Sequelize, JWT, REST API, Tailwind CSS, Git",
				experience:
					"Built full stack applications, implemented authentication, created REST APIs, managed PostgreSQL schemas, and integrated third-party services.",
				education:
					"Nusantara Tech Academy Full Stack Web Development Bootcamp; Bachelor Degree in Information Systems",
				certifications:
					"Full Stack Web Development Certificate, React Developer Fundamentals",
				fullContent:
					"Professional Summary\nFull Stack Developer with experience building responsive web applications and secure REST APIs using React.js, Node.js, Express.js, PostgreSQL, Sequelize, and JWT authentication.\n\nSkills\nJavaScript, React.js, Node.js, Express.js, PostgreSQL, Sequelize, JWT, REST API, Tailwind CSS, Git\n\nExperience\nBuilt full stack applications, implemented authentication, created REST APIs, managed PostgreSQL schemas, and integrated third-party services.\n\nEducation\nNusantara Tech Academy Full Stack Web Development Bootcamp\nBachelor Degree in Information Systems",
				contentJson: JSON.stringify({
					professionalSummary:
						"Full Stack Developer with experience building responsive web applications and secure REST APIs.",
					skills: [
						"JavaScript",
						"React.js",
						"Node.js",
						"Express.js",
						"PostgreSQL",
						"Sequelize",
						"JWT Authentication",
						"REST API",
					],
					experience: [
						"Built full stack applications with React.js and Express.js.",
						"Implemented JWT authentication and authorization middleware.",
						"Designed PostgreSQL schemas and Sequelize models.",
					],
					education: ["Full Stack Web Development Bootcamp"],
					certifications: ["Full Stack Web Development Certificate"],
				}),
				createdAt: now,
				updatedAt: now,
			},
			{
				UserId: financeId,
				JobApplicationId: astraFinanceId,
				title: "CV Finance Staff - Astra Digital Finance",
				atsScore: 82,
				matchScore: 85,
				keywordSuggestions:
					"Payment Processing, Invoice Verification, Bank Reconciliation, Tax Documentation, Financial Reporting, Accounts Payable",
				missingKeywords:
					"ERP System, SAP, Cash Flow Forecasting, Internal Control",
				summary:
					"Finance professional with experience in payment processing, invoice checking, bank reconciliation, tax documentation, and finance reporting.",
				skills:
					"Financial Reporting, Bank Reconciliation, Accounts Payable, Accounts Receivable, Microsoft Excel, Tax Documentation",
				experience:
					"Handled payment submissions, checked vendor invoices, prepared tax documents, reconciled bank transactions, and supported monthly finance reports.",
				education:
					"Bachelor Degree in Accounting from Universitas Merdeka Bandung",
				certifications: "Brevet A & B Tax Course, Microsoft Excel for Finance",
				fullContent:
					"Professional Summary\nFinance professional with experience in payment processing, invoice checking, bank reconciliation, tax documentation, and finance reporting.\n\nSkills\nFinancial Reporting, Bank Reconciliation, Accounts Payable, Accounts Receivable, Microsoft Excel, Tax Documentation\n\nExperience\nHandled payment submissions, checked vendor invoices, prepared tax documents, reconciled bank transactions, and supported monthly finance reports.\n\nEducation\nBachelor Degree in Accounting from Universitas Merdeka Bandung",
				contentJson: JSON.stringify({
					professionalSummary:
						"Finance professional with experience in payment processing, invoice checking, bank reconciliation, and financial reporting.",
					skills: [
						"Payment Processing",
						"Invoice Verification",
						"Bank Reconciliation",
						"Tax Documentation",
						"Financial Reporting",
						"Microsoft Excel",
					],
					experience: [
						"Handled payment submission and invoice checking.",
						"Prepared tax documents and finance reports.",
						"Performed bank reconciliation and AP documentation.",
					],
					education: ["Bachelor Degree in Accounting"],
					certifications: ["Brevet A & B Tax Course"],
				}),
				createdAt: now,
				updatedAt: now,
			},
		]);

		await queryInterface.bulkInsert("InterviewQuestions", [
			{
				UserId: developerId,
				JobApplicationId: tokopediaId,
				category: "Technical",
				question:
					"How do you design a REST API for a job application tracking feature?",
				suggestedAnswer:
					"I would identify core resources, define RESTful endpoints, apply authentication middleware, validate input, use proper status codes, and ensure data ownership through UserId checks.",
				userAnswer:
					"I would create endpoints for list, detail, create, update, delete, and status update. I would protect them with JWT authentication and validate ownership by UserId.",
				createdAt: now,
				updatedAt: now,
			},
			{
				UserId: developerId,
				JobApplicationId: tokopediaId,
				category: "Technical",
				question:
					"What is the difference between authentication and authorization?",
				suggestedAnswer:
					"Authentication verifies who the user is. Authorization checks what the authenticated user is allowed to access or modify.",
				userAnswer: null,
				createdAt: now,
				updatedAt: now,
			},
			{
				UserId: developerId,
				JobApplicationId: kalibrrId,
				category: "ProjectBased",
				question:
					"Explain one backend project you built and the most important technical decision you made.",
				suggestedAnswer:
					"Use STAR method. Explain the project context, your responsibility, the technical decision such as using JWT middleware or Sequelize associations, and the result.",
				userAnswer: null,
				createdAt: now,
				updatedAt: now,
			},
			{
				UserId: developerId,
				JobApplicationId: tokopediaId,
				category: "Behavioral",
				question:
					"Tell me about a time you had to learn a new technology quickly.",
				suggestedAnswer:
					"Use the STAR method. Explain the situation, the technology you needed to learn, the learning actions you took, and the final result.",
				userAnswer: null,
				createdAt: now,
				updatedAt: now,
			},
			{
				UserId: financeId,
				JobApplicationId: astraFinanceId,
				category: "Technical",
				question:
					"How do you verify payment documents before submitting them to finance approval?",
				suggestedAnswer:
					"I check invoice details, vendor information, tax documents, supporting attachments, payment amount, due date, approval status, and ensure the transaction follows company policy.",
				userAnswer: null,
				createdAt: now,
				updatedAt: now,
			},
			{
				UserId: financeId,
				JobApplicationId: astraFinanceId,
				category: "Behavioral",
				question:
					"Tell me about a time you had to handle urgent payment requests.",
				suggestedAnswer:
					"Use STAR method. Describe the urgent request, your responsibility to verify documents quickly, the action you took to coordinate with related teams, and the result.",
				userAnswer: null,
				createdAt: now,
				updatedAt: now,
			},
			{
				UserId: financeId,
				JobApplicationId: accountingOfficerId,
				category: "Technical",
				question: "What is the difference between accrual and prepaid expense?",
				suggestedAnswer:
					"Accrual expense is recognized before payment because the obligation already exists. Prepaid expense is payment made in advance and recognized as expense over time.",
				userAnswer: null,
				createdAt: now,
				updatedAt: now,
			},
			{
				UserId: financeId,
				JobApplicationId: accountingOfficerId,
				category: "HR",
				question: "Why are you interested in this finance and accounting role?",
				suggestedAnswer:
					"I am interested because the role matches my experience in payment processing, reconciliation, tax documentation, and financial reporting. I also want to contribute to accurate and timely finance operations.",
				userAnswer: null,
				createdAt: now,
				updatedAt: now,
			},
		]);
	},

	async down(queryInterface) {
		await deleteSeedData(queryInterface);
	},
};
