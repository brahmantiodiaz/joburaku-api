# Joburaku API Documentation

> Joburaku adalah backend **AI Career Assistant** untuk membantu user membuat profile CV, tracking lamaran kerja, generate CV ATS dengan AI, generate pertanyaan interview, dan download CV dalam bentuk PDF.

---

# Konfigurasi Environment

Buat file `.env` berdasarkan `.env.example`:

```bash
cp .env.example .env
```

Isi konfigurasi berikut:

```env
PORT=3000

DB_USERNAME=<your-db-username>
DB_PASSWORD=<your-db-password>
DB_DATABASE=<your-db-name>
DB_HOST=127.0.0.1
DB_DIALECT=postgres

JWT_SECRET_KEY=<your-secret-key>

CLOUDINARY_API_KEY=<your-cloudinary-api-key>
CLOUDINARY_API_SECRET=<your-cloudinary-api-secret>
CLOUDINARY_CLOUD_NAME=<your-cloudinary-cloud-name>

GOOGLE_CLIENT_ID=<your-google-client-id>
GEMINI_API_KEY=<your-gemini-api-key>

MAIL_HOST=<your-mail-host>
MAIL_PORT=<your-mail-port>
MAIL_USER=<your-mail-user>
MAIL_PASSWORD=<your-mail-password>
CLIENT_URL=http://localhost:5173

DATABASE_URL=<your-production-database-url>

RAPIDAPI_KEY=<your-rapidapi-key>
RAPIDAPI_HOST=<your-rapidapi-host>
```

---

# Menjalankan Database

Buat database:

```bash
npx sequelize-cli db:create
```

Jalankan migration:

```bash
npx sequelize-cli db:migrate
```

Jalankan seeder jika tersedia:

```bash
npx sequelize-cli db:seed:all
```

---

# Menjalankan Aplikasi

Install dependency:

```bash
npm install
```

Jalankan mode development:

```bash
npm run dev
```

Jalankan mode production/local start:

```bash
npm start
```

---

# Base URL

```txt
dev:
http://localhost:3000

prod:
<your-production-url>
```

---

# List of Available Endpoints

### Auth

- `POST /register`
- `POST /login`
- `GET /current-user`
- `GET /google-login`
- `PATCH /account/name`
- `PATCH /account/password`
- `POST /forgot-password`
- `POST /reset-password`
- `POST /check-reset-password-token`

### Profile

- `GET /profile`
- `POST /profile`
- `PUT /profile`
- `PATCH /profile/updateImage`

### Job Applications

- `GET /applications/jobs`
- `GET /applications`
- `POST /applications`
- `GET /applications/:id`
- `PUT /applications/:id`
- `PATCH /applications/:id/status`
- `DELETE /applications/:id`

### Generated CV

- `POST /applications/:id/generated-cvs`
- `GET /applications/:id/generated-cvs`
- `GET /generated-cvs/:id`
- `GET /generated-cvs/:id/download`
- `DELETE /generated-cvs/:id`

### Interview Questions

- `POST /applications/:id/interview-questions`
- `GET /applications/:id/interview-questions`
- `PATCH /interview-questions/:id/answer`

&nbsp;

---

# Root Endpoint

## GET /

Description:

- Check API status

_Response (200 - OK)_

```json
{
	"message": "Joburaku API is running"
}
```

&nbsp;

---

# Auth Endpoints

## 1. POST /register

Description:

- Register new user

Request:

- body:

```json
{
	"name": "Brahmantio Diaz",
	"email": "brahmantio@mail.com",
	"username": "brahmantiodiaz",
	"password": "password123"
}
```

_Response (201 - Created)_

```json
{
	"id": 1,
	"name": "Brahmantio Diaz",
	"email": "brahmantio@mail.com",
	"username": "brahmantiodiaz"
}
```

_Response (400 - Bad Request)_

```json
{
	"message": "name is required"
}
```

OR

```json
{
	"message": "email format is invalid"
}
```

OR

```json
{
	"message": "Password minimum 5 characters"
}
```

OR

```json
{
	"message": "Email already exists"
}
```

OR

```json
{
	"message": "Username already exists"
}
```

&nbsp;

## 2. POST /login

Description:

- Login user using registered email and password

Request:

- body:

```json
{
	"email": "brahmantio@mail.com",
	"password": "password123"
}
```

_Response (200 - OK)_

```json
{
	"access_token": "string"
}
```

_Response (400 - Bad Request)_

```json
{
	"message": "email is required"
}
```

OR

```json
{
	"message": "password is required"
}
```

_Response (401 - Unauthorized)_

```json
{
	"message": "invalid email/password"
}
```

&nbsp;

## 3. GET /current-user

Description:

- Get current logged in user data
- Authentication is required

Request:

- headers:

```json
{
	"Authorization": "Bearer <access_token>"
}
```

_Response (200 - OK)_

```json
{
	"id": 1,
	"name": "Brahmantio Diaz",
	"email": "brahmantio@mail.com",
	"username": "brahmantiodiaz"
}
```

_Response (401 - Unauthorized)_

```json
{
	"message": "Invalid token"
}
```

&nbsp;

## 4. GET /google-login

Description:

- Login or register user using Google ID token

Request:

- headers:

```json
{
	"accessgoogle": "<google-id-token>"
}
```

_Response (200 - OK)_

```json
{
	"access_token": "string"
}
```

_Response (400 - Bad Request)_

```json
{
	"message": "Google token is required"
}
```

OR

```json
{
	"message": "Email is not verified"
}
```

&nbsp;

## 5. PATCH /account/name

Description:

- Update current user name
- Authentication is required

Request:

- headers:

```json
{
	"Authorization": "Bearer <access_token>"
}
```

- body:

```json
{
	"name": "Aulia Brahmantio Diaz"
}
```

_Response (200 - OK)_

```json
{
	"id": 1,
	"name": "Aulia Brahmantio Diaz",
	"email": "brahmantio@mail.com",
	"username": "brahmantiodiaz"
}
```

_Response (400 - Bad Request)_

```json
{
	"message": "name is required"
}
```

_Response (401 - Unauthorized)_

```json
{
	"message": "Invalid token"
}
```

&nbsp;

## 6. PATCH /account/password

Description:

- Update current user password
- Authentication is required

Request:

- headers:

```json
{
	"Authorization": "Bearer <access_token>"
}
```

- body:

```json
{
	"oldPassword": "password123",
	"newPassword": "newpassword123"
}
```

_Response (200 - OK)_

```json
{
	"message": "Password updated successfully"
}
```

_Response (400 - Bad Request)_

```json
{
	"message": "oldPassword is required"
}
```

OR

```json
{
	"message": "newPassword is required"
}
```

_Response (401 - Unauthorized)_

```json
{
	"message": "old password is invalid"
}
```

&nbsp;

## 7. POST /forgot-password

Description:

- Send reset password link to user email

Request:

- body:

```json
{
	"email": "brahmantio@mail.com"
}
```

_Response (200 - OK)_

```json
{
	"message": "Reset password link has been sent to your email"
}
```

_Response (400 - Bad Request)_

```json
{
	"message": "email is required"
}
```

_Response (404 - Not Found)_

```json
{
	"message": "User not found"
}
```

&nbsp;

## 8. POST /check-reset-password-token

Description:

- Check reset password token validity

Request:

- body:

```json
{
	"token": "reset-token-string"
}
```

_Response (200 - OK)_

```json
{
	"message": "Reset password token is valid"
}
```

_Response (400 - Bad Request)_

```json
{
	"message": "token is required"
}
```

OR

```json
{
	"message": "Invalid reset password token"
}
```

OR

```json
{
	"message": "Reset password token has expired"
}
```

&nbsp;

## 9. POST /reset-password

Description:

- Reset user password using valid reset password token

Request:

- body:

```json
{
	"token": "reset-token-string",
	"newPassword": "newpassword123"
}
```

_Response (200 - OK)_

```json
{
	"message": "Password has been reset successfully"
}
```

_Response (400 - Bad Request)_

```json
{
	"message": "token is required"
}
```

OR

```json
{
	"message": "newPassword is required"
}
```

OR

```json
{
	"message": "Invalid reset password token"
}
```

OR

```json
{
	"message": "Reset password token has expired"
}
```

&nbsp;

---

# Profile Endpoints

## 10. GET /profile

Description:

- Get current user profile with CV data collections
- Authentication is required

Request:

- headers:

```json
{
	"Authorization": "Bearer <access_token>"
}
```

_Response (200 - OK)_

```json
{
	"userProfile": {
		"id": 1,
		"UserId": 1,
		"fullName": "Brahmantio Diaz",
		"phoneNumber": "08123456789",
		"address": "Jakarta, Indonesia",
		"linkedInUrl": "https://linkedin.com/in/brahmantiodiaz",
		"imageUrl": "https://example.com/profile.jpg",
		"professionalSummary": "Junior Full Stack Developer with experience in React and Express.",
		"targetRole": "Full Stack Developer",
		"createdAt": "2026-05-20T10:00:00.000Z",
		"updatedAt": "2026-05-20T10:00:00.000Z"
	},
	"skills": [],
	"languages": [],
	"workExperiences": [],
	"certifications": [],
	"educations": []
}
```

_Response (401 - Unauthorized)_

```json
{
	"message": "Invalid token"
}
```

_Response (404 - Not Found)_

```json
{
	"message": "Profile not found"
}
```

&nbsp;

## 11. POST /profile

Description:

- Create current user profile and CV data collections
- Authentication is required
- `skills`, `languages`, `workExperiences`, `certifications`, and `educations` must be arrays

Request:

- headers:

```json
{
	"Authorization": "Bearer <access_token>"
}
```

- body:

```json
{
	"fullName": "Brahmantio Diaz",
	"phoneNumber": "08123456789",
	"address": "Jakarta, Indonesia",
	"linkedInUrl": "https://linkedin.com/in/brahmantiodiaz",
	"imageUrl": "https://example.com/profile.jpg",
	"professionalSummary": "Junior Full Stack Developer with experience in React, Express, PostgreSQL, and Sequelize.",
	"targetRole": "Full Stack Developer",
	"skills": [
		{
			"name": "React.js",
			"category": "Frontend"
		},
		{
			"name": "Express.js",
			"category": "Backend"
		}
	],
	"languages": [
		{
			"language": "English",
			"level": "Intermediate"
		}
	],
	"workExperiences": [
		{
			"companyName": "PT Example Indonesia",
			"position": "Accounting Staff",
			"startDate": "2023-01-01",
			"endDate": null,
			"isCurrent": true,
			"description": "Managed financial reports and payment documentation."
		}
	],
	"certifications": [
		{
			"name": "Full Stack JavaScript Bootcamp",
			"issuer": "Hacktiv8",
			"issuedDate": "2026-06-01",
			"credentialUrl": "https://example.com/certificate",
			"description": "Completed full stack JavaScript bootcamp."
		}
	],
	"educations": [
		{
			"schoolName": "Hacktiv8",
			"degree": "Full Stack JavaScript Bootcamp",
			"fieldOfStudy": "Web Development",
			"score": "A",
			"startDate": "2026-01-01",
			"endDate": "2026-06-01",
			"description": "Learned full stack web development using JavaScript."
		}
	]
}
```

_Response (201 - Created)_

```json
{
	"userProfile": {
		"id": 1,
		"UserId": 1,
		"fullName": "Brahmantio Diaz",
		"targetRole": "Full Stack Developer"
	},
	"skills": [],
	"languages": [],
	"workExperiences": [],
	"certifications": [],
	"educations": []
}
```

_Response (400 - Bad Request)_

```json
{
	"message": "skills must be an array"
}
```

OR

```json
{
	"message": "skills is required"
}
```

OR

```json
{
	"message": "Profile already exists"
}
```

OR

```json
{
	"message": "linkedInUrl format is invalid"
}
```

_Response (401 - Unauthorized)_

```json
{
	"message": "Invalid token"
}
```

&nbsp;

## 12. PUT /profile

Description:

- Update current user profile and replace CV data collections
- Authentication is required
- Existing skills, languages, work experiences, certifications, and educations will be replaced with new payload

Request:

- headers:

```json
{
	"Authorization": "Bearer <access_token>"
}
```

- body:

```json
{
	"fullName": "Aulia Brahmantio Diaz",
	"phoneNumber": "08123456789",
	"address": "Jakarta, Indonesia",
	"linkedInUrl": "https://linkedin.com/in/auliabrahmantiodiaz",
	"imageUrl": "https://example.com/profile.jpg",
	"professionalSummary": "Full Stack Developer focused on React, Express, PostgreSQL, and AI-powered applications.",
	"targetRole": "Full Stack Developer",
	"skills": [
		{
			"name": "React.js",
			"category": "Frontend"
		}
	],
	"languages": [
		{
			"language": "English",
			"level": "Intermediate"
		}
	],
	"workExperiences": [
		{
			"companyName": "PT Example Indonesia",
			"position": "Accounting Staff",
			"startDate": "2023-01-01",
			"endDate": null,
			"isCurrent": true,
			"description": "Managed financial reports and payment documentation."
		}
	],
	"certifications": [
		{
			"name": "Full Stack JavaScript Bootcamp",
			"issuer": "Hacktiv8",
			"issuedDate": "2026-06-01",
			"credentialUrl": "https://example.com/certificate",
			"description": "Completed full stack JavaScript bootcamp."
		}
	],
	"educations": [
		{
			"schoolName": "Hacktiv8",
			"degree": "Full Stack JavaScript Bootcamp",
			"fieldOfStudy": "Web Development",
			"score": "A",
			"startDate": "2026-01-01",
			"endDate": "2026-06-01",
			"description": "Learned full stack web development using JavaScript."
		}
	]
}
```

_Response (200 - OK)_

```json
{
	"userProfile": {
		"id": 1,
		"UserId": 1,
		"fullName": "Aulia Brahmantio Diaz",
		"targetRole": "Full Stack Developer"
	},
	"skills": [],
	"languages": [],
	"workExperiences": [],
	"certifications": [],
	"educations": []
}
```

_Response (404 - Not Found)_

```json
{
	"message": "Profile not found"
}
```

&nbsp;

## 13. PATCH /profile/updateImage

Description:

- Update current user profile image
- Authentication is required
- Request uses `multipart/form-data`
- File will be uploaded to Cloudinary

Request:

- headers:

```json
{
	"Authorization": "Bearer <access_token>"
}
```

- form-data:

```json
{
	"image": "file"
}
```

_Response (200 - OK)_

```json
{
	"message": "Your profile picture success to update"
}
```

_Response (400 - Bad Request)_

```json
{
	"message": "Image is required"
}
```

_Response (401 - Unauthorized)_

```json
{
	"message": "Invalid token"
}
```

&nbsp;

---

# Job Application Endpoints

## 14. GET /applications/jobs

Description:

- Search job vacancies from JSearch API through RapidAPI
- Authentication is required
- If `query` is not provided, backend will use current user's `targetRole` from profile

Request:

- headers:

```json
{
	"Authorization": "Bearer <access_token>"
}
```

- query params:

```txt
query=Frontend Developer
cursor=optional-cursor
num_pages=1
country=id
language=ID
location=Jakarta
date_posted=all
work_from_home=true
```

Example:

```txt
GET /applications/jobs?query=Frontend%20Developer&location=Jakarta&country=id
```

_Response (200 - OK)_

```json
{
	"message": "Jobs fetched successfully",
	"query": "Frontend Developer",
	"cursor": "next-cursor-string",
	"total": 1,
	"data": [
		{
			"externalId": "job-id",
			"companyName": "PT Example Indonesia",
			"position": "Frontend Developer",
			"jobDescription": "We are looking for a Frontend Developer...",
			"jobUrl": "https://example.com/apply",
			"location": "Jakarta",
			"salaryRange": "Rp8.000.000 - Rp12.000.000",
			"source": "LinkedIn",
			"employmentType": "FULLTIME",
			"isRemote": false,
			"postedAt": "2026-05-20T10:00:00.000Z",
			"companyLogo": "https://example.com/logo.png"
		}
	]
}
```

_Response (400 - Bad Request)_

```json
{
	"message": "JSearch API config is missing"
}
```

OR

```json
{
	"message": "Query is required or complete your target role in profile"
}
```

&nbsp;

## 15. GET /applications

Description:

- Get all job applications owned by current user
- Authentication is required
- Supports search, status filter, and sorting

Request:

- headers:

```json
{
	"Authorization": "Bearer <access_token>"
}
```

- query params:

```txt
search=tokopedia
status=Applied
sort=newest
```

Available status values:

```txt
Wishlist
Applied
Interview
Offering
Rejected
Accepted
```

Available sort values:

```txt
newest
oldest
```

_Response (200 - OK)_

```json
[
	{
		"id": 1,
		"UserId": 1,
		"companyName": "Tokopedia",
		"position": "Frontend Developer",
		"jobDescription": "We are looking for React Developer...",
		"jobUrl": "https://example.com/job/frontend",
		"location": "Jakarta",
		"salaryRange": "Rp8.000.000 - Rp12.000.000",
		"status": "Applied",
		"appliedDate": "2026-05-20",
		"notes": "Apply via LinkedIn",
		"createdAt": "2026-05-20T10:00:00.000Z",
		"updatedAt": "2026-05-20T10:00:00.000Z"
	}
]
```

_Response (400 - Bad Request)_

```json
{
	"message": "Status is invalid"
}
```

_Response (401 - Unauthorized)_

```json
{
	"message": "Invalid token"
}
```

&nbsp;

## 16. POST /applications

Description:

- Create new job application
- Authentication is required
- `UserId` is automatically taken from logged in user

Request:

- headers:

```json
{
	"Authorization": "Bearer <access_token>"
}
```

- body:

```json
{
	"companyName": "Tokopedia",
	"position": "Frontend Developer",
	"jobDescription": "We are looking for a Frontend Developer with React experience...",
	"jobUrl": "https://example.com/jobs/frontend-developer",
	"location": "Jakarta",
	"salaryRange": "Rp8.000.000 - Rp12.000.000",
	"status": "Applied",
	"appliedDate": "2026-05-20",
	"notes": "Apply via LinkedIn"
}
```

_Response (201 - Created)_

```json
{
	"id": 1,
	"UserId": 1,
	"companyName": "Tokopedia",
	"position": "Frontend Developer",
	"jobDescription": "We are looking for a Frontend Developer with React experience...",
	"jobUrl": "https://example.com/jobs/frontend-developer",
	"location": "Jakarta",
	"salaryRange": "Rp8.000.000 - Rp12.000.000",
	"status": "Applied",
	"appliedDate": "2026-05-20",
	"notes": "Apply via LinkedIn",
	"createdAt": "2026-05-20T10:00:00.000Z",
	"updatedAt": "2026-05-20T10:00:00.000Z"
}
```

_Response (400 - Bad Request)_

```json
{
	"message": "companyName is required"
}
```

OR

```json
{
	"message": "position is required"
}
```

OR

```json
{
	"message": "jobDescription is required"
}
```

OR

```json
{
	"message": "jobUrl format is invalid"
}
```

OR

```json
{
	"message": "Status is invalid"
}
```

&nbsp;

## 17. GET /applications/:id

Description:

- Get job application detail by id
- Authentication is required
- User can only access their own application

Request:

- headers:

```json
{
	"Authorization": "Bearer <access_token>"
}
```

- params:

```json
{
	"id": "integer (required)"
}
```

_Response (200 - OK)_

```json
{
	"id": 1,
	"UserId": 1,
	"companyName": "Tokopedia",
	"position": "Frontend Developer",
	"jobDescription": "We are looking for React Developer...",
	"status": "Applied"
}
```

_Response (404 - Not Found)_

```json
{
	"message": "Application not found"
}
```

&nbsp;

## 18. PUT /applications/:id

Description:

- Update job application by id
- Authentication is required
- User can only update their own application

Request:

- headers:

```json
{
	"Authorization": "Bearer <access_token>"
}
```

- params:

```json
{
	"id": "integer (required)"
}
```

- body:

```json
{
	"companyName": "Tokopedia Indonesia",
	"position": "Frontend Engineer",
	"jobDescription": "Updated job description...",
	"jobUrl": "https://example.com/jobs/frontend-engineer",
	"location": "Jakarta",
	"salaryRange": "Rp10.000.000 - Rp15.000.000",
	"status": "Interview",
	"appliedDate": "2026-05-20",
	"notes": "Interview scheduled"
}
```

_Response (200 - OK)_

```json
{
	"id": 1,
	"UserId": 1,
	"companyName": "Tokopedia Indonesia",
	"position": "Frontend Engineer",
	"status": "Interview"
}
```

_Response (404 - Not Found)_

```json
{
	"message": "Application not found"
}
```

&nbsp;

## 19. PATCH /applications/:id/status

Description:

- Update job application status only
- Authentication is required

Request:

- headers:

```json
{
	"Authorization": "Bearer <access_token>"
}
```

- params:

```json
{
	"id": "integer (required)"
}
```

- body:

```json
{
	"status": "Interview"
}
```

_Response (200 - OK)_

```json
{
	"id": 1,
	"UserId": 1,
	"companyName": "Tokopedia",
	"position": "Frontend Developer",
	"status": "Interview"
}
```

_Response (400 - Bad Request)_

```json
{
	"message": "Status is required"
}
```

OR

```json
{
	"message": "Status is invalid"
}
```

&nbsp;

## 20. DELETE /applications/:id

Description:

- Delete job application by id
- Authentication is required
- User can only delete their own application

Request:

- headers:

```json
{
	"Authorization": "Bearer <access_token>"
}
```

- params:

```json
{
	"id": "integer (required)"
}
```

_Response (200 - OK)_

```json
{
	"message": "Application deleted successfully"
}
```

_Response (404 - Not Found)_

```json
{
	"message": "Application not found"
}
```

&nbsp;

---

# Generated CV Endpoints

## 21. POST /applications/:id/generated-cvs

Description:

- Generate ATS CV using Gemini API based on user profile and job application
- Authentication is required
- Generated CV will be saved to database

Request:

- headers:

```json
{
	"Authorization": "Bearer <access_token>"
}
```

- params:

```json
{
	"id": "job application id"
}
```

_Response (201 - Created)_

```json
{
	"id": 1,
	"UserId": 1,
	"JobApplicationId": 1,
	"title": "CV Frontend Developer - Tokopedia",
	"atsScore": 82,
	"matchScore": 88,
	"keywordSuggestions": "React, REST API, Git, Responsive Design",
	"missingKeywords": "TypeScript, Unit Testing",
	"summary": "Junior Full Stack Developer with experience building responsive web applications.",
	"skills": "React.js, Express.js, PostgreSQL",
	"experience": "Accounting Staff at PT Example Indonesia",
	"education": "Hacktiv8 Full Stack JavaScript Bootcamp",
	"certifications": "Full Stack JavaScript Bootcamp",
	"fullContent": "Professional Summary...",
	"contentJson": {
		"personalInfo": {
			"fullName": "Brahmantio Diaz"
		}
	},
	"createdAt": "2026-05-20T10:00:00.000Z",
	"updatedAt": "2026-05-20T10:00:00.000Z"
}
```

_Response (400 - Bad Request)_

```json
{
	"message": "Please complete your profile first"
}
```

_Response (404 - Not Found)_

```json
{
	"message": "Job application not found"
}
```

&nbsp;

## 22. GET /applications/:id/generated-cvs

Description:

- Get all generated CVs for selected job application
- Authentication is required

Request:

- headers:

```json
{
	"Authorization": "Bearer <access_token>"
}
```

_Response (200 - OK)_

```json
[
	{
		"id": 1,
		"UserId": 1,
		"JobApplicationId": 1,
		"title": "CV Frontend Developer - Tokopedia",
		"atsScore": 82,
		"matchScore": 88
	}
]
```

_Response (404 - Not Found)_

```json
{
	"message": "Job application not found"
}
```

&nbsp;

## 23. GET /generated-cvs/:id

Description:

- Get generated CV detail by id
- Authentication is required
- User can only access their own generated CV

Request:

- headers:

```json
{
	"Authorization": "Bearer <access_token>"
}
```

_Response (200 - OK)_

```json
{
	"id": 1,
	"UserId": 1,
	"JobApplicationId": 1,
	"title": "CV Frontend Developer - Tokopedia",
	"atsScore": 82,
	"matchScore": 88,
	"fullContent": "Professional Summary...",
	"contentJson": {
		"personalInfo": {
			"fullName": "Brahmantio Diaz"
		}
	}
}
```

_Response (404 - Not Found)_

```json
{
	"message": "Generated CV not found"
}
```

&nbsp;

## 24. GET /generated-cvs/:id/download

Description:

- Download generated CV as PDF
- Authentication is required
- PDF is generated from `contentJson` using EJS template and Puppeteer

Request:

- headers:

```json
{
	"Authorization": "Bearer <access_token>"
}
```

_Response (200 - OK)_

```txt
PDF file buffer
```

Response headers:

```txt
Content-Type: application/pdf
Content-Disposition: attachment; filename="cv-frontend-developer-tokopedia.pdf"
```

_Response (400 - Bad Request)_

```json
{
	"message": "Generated CV content is empty"
}
```

_Response (404 - Not Found)_

```json
{
	"message": "Generated CV not found"
}
```

&nbsp;

## 25. DELETE /generated-cvs/:id

Description:

- Delete generated CV by id
- Authentication is required
- User can only delete their own generated CV

Request:

- headers:

```json
{
	"Authorization": "Bearer <access_token>"
}
```

_Response (200 - OK)_

```json
{
	"message": "Generated CV deleted successfully"
}
```

_Response (404 - Not Found)_

```json
{
	"message": "Generated CV not found"
}
```

&nbsp;

---

# Interview Question Endpoints

## 26. POST /applications/:id/interview-questions

Description:

- Generate interview questions using Gemini API based on user profile and selected job application
- Authentication is required

Request:

- headers:

```json
{
	"Authorization": "Bearer <access_token>"
}
```

- params:

```json
{
	"id": "job application id"
}
```

- body:

```json
{
	"category": "Technical"
}
```

Available category values:

```txt
Technical
Behavioral
HR
ProjectBased
```

_Response (201 - Created)_

```json
[
	{
		"id": 1,
		"UserId": 1,
		"JobApplicationId": 1,
		"category": "Technical",
		"question": "How do you manage state in React?",
		"suggestedAnswer": "I usually use useState for local state and Redux for global state when needed.",
		"userAnswer": null,
		"createdAt": "2026-05-20T10:00:00.000Z",
		"updatedAt": "2026-05-20T10:00:00.000Z"
	}
]
```

_Response (400 - Bad Request)_

```json
{
	"message": "Interview category is required"
}
```

OR

```json
{
	"message": "Interview category is invalid"
}
```

OR

```json
{
	"message": "Please complete your profile first"
}
```

_Response (404 - Not Found)_

```json
{
	"message": "Job application not found"
}
```

&nbsp;

## 27. GET /applications/:id/interview-questions

Description:

- Get all interview questions for selected job application
- Authentication is required

Request:

- headers:

```json
{
	"Authorization": "Bearer <access_token>"
}
```

_Response (200 - OK)_

```json
[
	{
		"id": 1,
		"UserId": 1,
		"JobApplicationId": 1,
		"category": "Technical",
		"question": "How do you manage state in React?",
		"suggestedAnswer": "I usually use useState for local state and Redux for global state when needed.",
		"userAnswer": null
	}
]
```

_Response (404 - Not Found)_

```json
{
	"message": "Job application not found"
}
```

&nbsp;

## 28. PATCH /interview-questions/:id/answer

Description:

- Update user answer for selected interview question
- Authentication is required

Request:

- headers:

```json
{
	"Authorization": "Bearer <access_token>"
}
```

- params:

```json
{
	"id": "interview question id"
}
```

- body:

```json
{
	"userAnswer": "I use useState for local state and context or Redux Toolkit for shared state depending on the project complexity."
}
```

_Response (200 - OK)_

```json
{
	"id": 1,
	"UserId": 1,
	"JobApplicationId": 1,
	"category": "Technical",
	"question": "How do you manage state in React?",
	"suggestedAnswer": "I usually use useState for local state and Redux for global state when needed.",
	"userAnswer": "I use useState for local state and context or Redux Toolkit for shared state depending on the project complexity."
}
```

_Response (400 - Bad Request)_

```json
{
	"message": "User answer is required"
}
```

_Response (404 - Not Found)_

```json
{
	"message": "Interview question not found"
}
```

&nbsp;

---

# Authentication Error Response

All protected endpoints require this header:

```json
{
	"Authorization": "Bearer <access_token>"
}
```

_Response (401 - Unauthorized)_

```json
{
	"message": "Invalid token"
}
```

---

# Global Error Response

_Response (500 - Internal Server Error)_

```json
{
	"message": "Internal server error"
}
```

---

# Enum Reference

## ApplicationStatus

```txt
Wishlist
Applied
Interview
Offering
Rejected
Accepted
```

## InterviewCategory

```txt
Technical
Behavioral
HR
ProjectBased
```

## LanguageLevel

```txt
Beginner
Intermediate
Advanced
Fluent
Native
```

---

# Main Flow

```txt
Register / Login
↓
Create Profile + CV Data
↓
Create Job Application
↓
Generate CV ATS with Gemini
↓
Save Generated CV to Database
↓
Download Generated CV as PDF
↓
Generate Interview Questions with Gemini
↓
Update User Answer
```

---

# Third Party API / Library

| Kebutuhan                    | Tool                     |
| ---------------------------- | ------------------------ |
| Generate CV ATS              | Google Gemini API        |
| Generate interview questions | Google Gemini API        |
| Google login                 | Google Auth Library      |
| Search job vacancy           | JSearch API via RapidAPI |
| Upload profile image         | Multer + Cloudinary      |
| Send reset password email    | Nodemailer               |
| Generate CV PDF              | EJS + Puppeteer          |
| Authentication               | JWT                      |
| Password hashing             | bcryptjs                 |
| Database ORM                 | Sequelize                |
| Database                     | PostgreSQL               |
