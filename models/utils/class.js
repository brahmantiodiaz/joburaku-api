class AppError extends Error {
	constructor(name, message) {
		super(message);
		this.name = name;
	}
}
class Metadata {
	constructor(total, page, pageSize) {
		this.total = total;
		this.page = page;
		this.pageSize = pageSize;
		this.totalPages = Math.ceil(total / pageSize);
		this.hasNext = page < this.totalPages;
		this.hasPrev = page > 1;
	}
}

module.exports = { AppError, Metadata };
