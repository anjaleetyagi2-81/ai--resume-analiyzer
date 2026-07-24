const OpenAI = require('openai');

let client = null;

function getClient() {
  if (!client) {
    if (!process.env.OPENAI_API_KEY) {
      const err = new Error(
        'Server is missing OPENAI_API_KEY configuration. Please contact the administrator.'
      );
      err.status = 500;
      throw err;
    }
   client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_BASE_URL,
});
  }
  return client;
}

const SYSTEM_PROMPT = `You are an expert technical recruiter and resume coach with 15+ years of experience
screening resumes for Applicant Tracking Systems (ATS) at Fortune 500 companies.

You will be given the plain-text content of a candidate's resume, and optionally a target job description.
Analyze it carefully and respond with STRICT JSON ONLY (no markdown fences, no prose outside the JSON object)
matching exactly this schema:

{
  "summary": "string - a 2-3 sentence overview of the candidate's profile and overall impression",
  "atsCompatibilityNotes": "string - 2-3 sentences on how well this resume would parse in a typical ATS",
  "strengths": ["string", "..."],
  "weaknesses": ["string", "..."],
  "detectedSkills": ["string", "..."],
  "missingSkills": ["string", "..."],
  "suggestions": [
    { "title": "string - short suggestion headline", "detail": "string - actionable explanation" }
  ],
  "improvedBulletExamples": [
    { "original": "string - a weak bullet point found or implied in the resume", "improved": "string - a stronger rewritten version" }
  ],
  "estimatedAtsScore": number (0-100, your own independent estimate),
  "roleFitSummary": "string - if a job description was provided, how well the candidate fits it; otherwise a general seniority/role assessment"
}

Rules:
- Be specific and reference actual content from the resume where possible.
- suggestions should have between 4 and 8 items, ordered by impact (highest first).
- improvedBulletExamples should have between 2 and 5 items.
- strengths and weaknesses should have between 3 and 6 items each.
- Do not invent facts not implied by the resume; ground your feedback in the actual text.
- Keep language professional, constructive, and encouraging even when critical.
- Output ONLY the JSON object, nothing else.`;

/**
 * Sends resume text (and optional job description) to OpenAI and
 * returns a parsed, structured analysis object.
 */
async function analyzeResumeWithAI(resumeText, jobDescription) {
  const openai = getClient();
  const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';

   console.log("Base URL:", process.env.OPENAI_BASE_URL);
  console.log("Model:", process.env.OPENAI_MODEL);

  const userPrompt = [
    'RESUME TEXT:',
    '"""',
    resumeText,
    '"""',
    '',
    jobDescription
      ? `TARGET JOB DESCRIPTION:\n"""\n${jobDescription}\n"""`
      : 'No target job description was provided. Give general, role-agnostic feedback based on the candidate\'s apparent field.',
  ].join('\n');

  let completion;
  try {
    completion = await openai.chat.completions.create({
      model,
      temperature: 0.4,
      max_tokens: 2000,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userPrompt },
      ],
    });
  } catch (apiErr) {
  console.log("========== FULL ERROR ==========");
  console.dir(apiErr, { depth: null });
  console.log("================================");

  throw apiErr;
}
  const raw = completion.choices?.[0]?.message?.content;
  if (!raw) {
    const err = new Error('AI service returned an empty response.');
    err.status = 502;
    throw err;
  }

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (parseErr) {
    const err = new Error('Failed to parse AI response. Please try again.');
    err.status = 502;
    throw err;
  }

  return normalizeAiResult(parsed);
}

/**
 * Ensures the AI's JSON response always has safe, well-typed defaults
 * even if the model omits a field.
 */
function normalizeAiResult(parsed) {
  return {
    summary: parsed.summary || '',
    atsCompatibilityNotes: parsed.atsCompatibilityNotes || '',
    strengths: Array.isArray(parsed.strengths) ? parsed.strengths : [],
    weaknesses: Array.isArray(parsed.weaknesses) ? parsed.weaknesses : [],
    detectedSkills: Array.isArray(parsed.detectedSkills) ? parsed.detectedSkills : [],
    missingSkills: Array.isArray(parsed.missingSkills) ? parsed.missingSkills : [],
    suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions : [],
    improvedBulletExamples: Array.isArray(parsed.improvedBulletExamples)
      ? parsed.improvedBulletExamples
      : [],
    estimatedAtsScore:
      typeof parsed.estimatedAtsScore === 'number'
        ? Math.max(0, Math.min(100, Math.round(parsed.estimatedAtsScore)))
        : null,
    roleFitSummary: parsed.roleFitSummary || '',
  };
}

module.exports = { analyzeResumeWithAI };
