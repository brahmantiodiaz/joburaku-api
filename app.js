const express = require("express");
const cors = require("cors");
const routes = require("./routes");
const errorHandler = require("./middlewares/errorHandler");
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./swagger.json");

const app = express();
const apiBaseUrl = String(
	process.env.API_BASE_URL || "https://joburaku-api.brahmantiodiaz.com",
).replace(/\/+$/, "");

const swaggerDocumentWithServers = {
	...swaggerDocument,
	servers: [
		{
			url: apiBaseUrl,
			description: "Production server",
		},
		{
			url: "http://localhost:3000",
			description: "Local development server",
		},
	],
};

app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(
	"/docs",
	swaggerUi.serve,
	swaggerUi.setup(swaggerDocumentWithServers, {
		customSiteTitle: "Joburaku API Documentation",
	}),
);

app.get("/health", (req, res) => {
	res.status(200).json({
		status: "ok",
		service: "joburaku-api",
		docs: `${apiBaseUrl}/docs/`,
	});
});

app.get("/", (req, res) => {
	res.redirect(302, "/docs/");
});

app.use(routes);

app.use(errorHandler);

module.exports = app;
