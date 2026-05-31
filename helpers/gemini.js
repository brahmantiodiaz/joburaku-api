const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
	apiKey: process.env.GEMINI_API_KEY,
});

async function generateCvWithGemini({ userProfile, jobApplication, cvData }) {
	const prompt = `
Kamu adalah AI Career Assistant dan ATS CV Specialist.

Tugas kamu adalah membuat CV ATS-friendly berdasarkan DATA PROFILE, DATA CV USER, dan JOB APPLICATION di bawah.

CV yang kamu buat harus disesuaikan dengan job description, terutama pada bagian:
1. Professional Summary
2. Skills
3. Work Experience bullet points
4. Keyword Suggestions
5. Missing Keywords

WAJIB balas dalam format JSON valid saja.
Jangan gunakan markdown.
Jangan tambahkan penjelasan di luar JSON.
Jangan gunakan trailing comma.
Jangan membuat field di luar format JSON yang diminta.

ATURAN PENTING:
- Sesuaikan CV dengan posisi dan job description.
- Edit dan optimalkan professionalSummary agar lebih relevan dengan job description.
- Edit dan optimalkan workExperiences.description agar bullet points lebih ATS-friendly dan relevan dengan job description.
- Work experience boleh diperbaiki dari sisi wording, impact, keyword, dan profesionalitas.
- Jangan mengarang pengalaman, perusahaan, posisi, pendidikan, sertifikasi, atau skill yang tidak ada di data user.
- Jika ada keyword penting dari job description yang relevan dengan pengalaman user, masukkan secara natural.
- Jika keyword penting tidak ada di data user, masukkan ke missingKeywords, bukan dipaksakan ke CV.
- Gunakan bahasa Inggris profesional untuk isi CV.
- Gunakan action verbs seperti Developed, Implemented, Collaborated, Designed, Integrated, Improved, Maintained, Optimized.
- Buat bullet point work experience yang kuat, jelas, dan berorientasi impact.
- Jika memungkinkan, tambahkan konteks hasil/impact tanpa mengarang angka palsu.
- ATS score dan match score harus number 0 sampai 100.
- contentJson harus siap dipakai untuk render template CV PDF.
- fullContent harus berisi CV lengkap dalam format teks rapi.

Format JSON:
{
  "title": "string",
  "atsScore": number,
  "matchScore": number,
  "keywordSuggestions": "string",
  "missingKeywords": "string",
  "summary": "string",
  "skills": "string",
  "experience": "string",
  "education": "string",
  "certifications": "string",
  "fullContent": "string",
  "contentJson": {
  "personalInfo": {
    "fullName": "string",
    "phoneNumber": "string",
    "address": "string",
    "linkedInUrl": "string"
  },
  "professionalSummary": "string",
  "skills": [],
  "workExperiences": [
    {
      "companyName": "string",
      "position": "string",
      "period": "string",
      "description": []
    }
  ],
  "educations": [
    {
      "schoolName": "string",
      "degree": "string",
      "fieldOfStudy": "string",
      "period": "string",
      "description": "string"
    }
  ],
  "certifications": [],
  "languages": [],
  "projects": []
  }
}
  PANDUAN FIELD:
- title: gunakan format "Full Name - Target Position".
- atsScore: nilai kelengkapan dan kualitas ATS CV.
- matchScore: nilai kecocokan CV dengan job description.
- keywordSuggestions: keyword penting dari job description yang cocok untuk ditonjolkan.
- missingKeywords: keyword penting dari job description yang belum terlihat di data user.
- summary: sama dengan contentJson.professionalSummary.
- skills: string ringkasan skills yang sudah disesuaikan dengan job description.
- experience: string ringkasan work experience yang sudah disesuaikan.
- education: string ringkasan education.
- certifications: string ringkasan certifications.
- fullContent: CV lengkap dalam plain text.
- contentJson: versi structured dari CV untuk render PDF.

INSTRUKSI KHUSUS PROFESSIONAL SUMMARY:
- Buat 3 sampai 5 kalimat.
- Harus menyebut posisi target atau posisi yang dilamar.
- Harus menonjolkan pengalaman user yang paling relevan dengan job description.
- Harus memasukkan keyword penting dari job description jika memang relevan dengan data user.
- Jangan terlalu umum.

INSTRUKSI KHUSUS WORK EXPERIENCE:
- Setiap pengalaman kerja harus punya 4 sampai 7 bullet points.
- Bullet points harus disesuaikan dengan requirement dan responsibility pada job description.
- Gunakan keyword job description secara natural.
- Jangan hanya menyalin data user mentah.
- Rewrite pengalaman user agar lebih profesional, ATS-friendly, dan relevan.
- Jangan mengubah nama perusahaan, posisi, atau periode kerja.
- Jangan membuat pengalaman fiktif.

INSTRUKSI KHUSUS SKILLS:
- Prioritaskan skill yang paling relevan dengan job description.
- Skill yang ada di data user dan cocok dengan job description harus muncul di awal.
- Jangan memasukkan skill yang tidak ada di data user.
- Jika job description meminta skill yang tidak ada di data user, masukkan ke missingKeywords.


DATA PROFILE:
${JSON.stringify(userProfile, null, 2)}

DATA CV USER:
${JSON.stringify(cvData, null, 2)}

JOB APPLICATION:
${JSON.stringify(jobApplication, null, 2)}
`;
	const response = await ai.models.generateContent({
		model: "gemini-3.5-flash",
		contents: prompt,
		config: {
			// maxOutputTokens: 3000,
			temperature: 0.2,
			responseMimeType: "application/json",
		},
	});

	return JSON.parse(response.text);
}

async function generateInterviewQuestionsWithGemini({
	userProfile,
	jobApplication,
	cvData,
	category,
}) {
	const prompt = `
beraktinglah Kamu adalah seorang manager ${category} untuk sebuah posisi ${jobApplication.position} disebuah perusahaan .

Buatkan pertanyaan interview dengan category ${category} berdasarkan data CV user dan job description berikut jangan lupa kamu adalah seorang manager.

WAJIB balas dalam format JSON valid saja, tanpa markdown, tanpa penjelasan tambahan.

Format JSON:
{
  "questions": [
    {
      "category": "${category}",
      "question": "string",
      "suggestedAnswer": "string"
    }
  ]
}

Aturan:
- Buat total 5 pertanyaan.
- Semua pertanyaan wajib memiliki category "${category}".
- Pertanyaan harus relevan dengan posisi, job description, dan pengalaman user.
- suggestedAnswer gunakan bahasa Indonesia yang natural dan profesional.
- Jika category adalah "ProjectBased", hubungkan pertanyaan dengan pengalaman/project dari CV user jika ada, jika tidak tanyakan seputar project dari work experience.
- Jangan gunakan category selain "${category}".

DATA PROFILE:
${JSON.stringify(userProfile, null, 2)}

DATA CV USER:
${JSON.stringify(cvData, null, 2)}

JOB APPLICATION:
${JSON.stringify(jobApplication, null, 2)}
`;

	const response = await ai.models.generateContent({
		model: "gemini-3.5-flash",
		contents: prompt,
		config: {
			// maxOutputTokens: 3000,
			temperature: 0.2,
			responseMimeType: "application/json",
		},
	});
	const parsed = JSON.parse(response.text);

	if (Array.isArray(parsed)) {
		return parsed;
	}

	return parsed.questions || [];
}

module.exports = { generateCvWithGemini, generateInterviewQuestionsWithGemini };
