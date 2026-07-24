# Project Report: AI Resume Analyzer (ResumeScan)

## 1. Abstract

The AI Resume Analyzer is a full-stack web application designed to help job seekers understand
how their resume would be interpreted by both automated Applicant Tracking Systems (ATS) and
human recruiters. The system accepts a resume in PDF or DOCX format, extracts and analyzes its
content using a combination of deterministic heuristics and a Large Language Model (OpenAI's
GPT), and returns a comprehensive report: an ATS compatibility score, detected and missing
skills, qualitative strengths/weaknesses, and prioritized, actionable suggestions — including
rewritten bullet points. Users can export this analysis as a polished PDF report. The project
demonstrates a production-grade architecture spanning frontend, backend, AI integration,
containerization, and cloud deployment.

## 2. Problem statement

Modern hiring pipelines overwhelmingly rely on ATS software to filter resumes before a human
ever reads them. Studies commonly cited in industry literature suggest a majority of resumes
are rejected at this automated stage — often due to fixable issues like poor formatting,
missing keywords, or weak, unquantified bullet points. Job seekers rarely have access to the
tools recruiters and ATS vendors use internally, leaving them to guess why their applications
go unanswered. There is a need for an accessible, fast, and genuinely useful tool that closes
this information gap.

## 3. Objectives

1. Provide an instant, explainable ATS compatibility score for any uploaded resume.
2. Detect the candidate's technical and soft skills automatically from free-text content.
3. Compare a resume against a target job description to identify missing keywords/skills.
4. Generate qualitative, AI-powered feedback (strengths, weaknesses, and role fit) that reads
   like recruiter commentary rather than a generic checklist.
5. Turn feedback into concrete action: ranked suggestions and before/after bullet rewrites.
6. Package the entire analysis into a downloadable PDF report for offline reference.
7. Ship the application as a containerized, cloud-deployable product (AWS App Runner).

## 4. System architecture

### 4.1 High-level overview

```
┌─────────────────┐        HTTPS / REST         ┌──────────────────┐        HTTPS         ┌────────────┐
│   React (Vite)   │ ───────────────────────────▶ │  Node.js/Express  │ ───────────────────▶ │  OpenAI API │
│   Frontend SPA    │ ◀─────────────────────────── │     Backend       │ ◀─────────────────── │  (GPT model) │
└─────────────────┘        JSON response         └──────────────────┘        JSON            └────────────┘
        │                                                  │
        │ jsPDF (client-side)                              │ pdf-parse / mammoth
        ▼                                                  ▼
  Downloadable PDF report                          In-memory text extraction
```

### 4.2 Frontend

- **React 18 + Vite** for fast development and optimized production builds.
- **Tailwind CSS** with a custom design-token system (`tailwind.config.js`) for a distinctive,
  cohesive visual identity rather than default component styling.
- Component-driven architecture: `FileUpload`, `ScoreGauge`, `AnalysisResult`, `SkillsPanel`,
  `SuggestionsPanel`, `Loader`, `Navbar`, `Footer` — each with a single, well-defined
  responsibility.
- **axios** for API communication with upload-progress tracking.
- **jsPDF** for fully client-side PDF report generation (no extra backend round-trip or
  server-side rendering dependency required).
- **lucide-react** for a consistent, lightweight icon set.

### 4.3 Backend

- **Node.js + Express**, structured in a classic layered architecture:
  `routes → controllers → services/middleware/utils`.
- **Multer** (memory storage) handles file uploads without touching disk — important for
  stateless, ephemeral container deployments.
- **pdf-parse** and **mammoth** extract raw text from PDF and DOCX/DOC files respectively.
- A **deterministic ATS scoring engine** (`utils/atsScore.js`) evaluates: contact info
  presence, professional profile links, section-header coverage, action-verb usage, quantified
  achievements (metrics/percentages), skills-keyword density (against an 80+ term dictionary),
  resume length appropriateness, and formatting cleanliness (proxy for broken
  tables/columns/special characters).
- The **OpenAI service** (`services/openai.service.js`) sends the extracted resume text (and
  optional job description) to a chat-completions model with a carefully engineered system
  prompt that enforces a strict JSON response schema, covering summary, strengths, weaknesses,
  detected/missing skills, ranked suggestions, and bullet rewrites.
- The final ATS score blends the deterministic score (60% weight) with the AI's own independent
  estimate (40% weight), giving both explainability and contextual nuance.
- **Security & reliability**: Helmet (HTTP headers), CORS allow-listing, express-rate-limit
  (per-IP throttling), centralized error middleware with Multer-aware error messages, and a
  health-check endpoint for container orchestration probes.

### 4.4 AI integration design

The system prompt instructs the model to act as an experienced technical recruiter and to
return **strict JSON only**, matching an explicit schema. This design choice:

- Removes ambiguity in parsing (no markdown fences, no prose to strip).
- Makes the AI's output directly renderable by frontend components without brittle regex.
- Keeps suggestions grounded in the actual resume text (the prompt explicitly forbids
  inventing facts not implied by the document).

### 4.5 Deployment architecture

- Each service (frontend, backend) has its own multi-stage **Dockerfile**.
  - Backend: Node 18 Alpine, non-root user, health check via HTTP probe.
  - Frontend: Node build stage → static assets served by **nginx** on port 8080, with gzip and
    cache headers for static assets, and SPA fallback routing.
- **docker-compose.yml** orchestrates both services locally with a shared bridge network.
- **AWS App Runner** is supported via two paths:
  1. Source-based deployment using per-service `apprunner.yaml` build/run configuration.
  2. Container-image deployment via Amazon ECR, giving full control over the build process
     (particularly important since Vite inlines environment variables at build time).

## 5. Methodology

1. **Requirements analysis** — identified the core user journey: upload → wait → understand →
   act → export.
2. **Design-first UI approach** — established a distinct visual language ("document scanner"
   aesthetic: ink navy, paper cream, highlighter amber, scan teal) before writing components, to
   avoid a generic, templated look.
3. **API contract definition** — designed the `/api/resume/analyze` response schema early so
   frontend and backend could be built against a stable contract.
4. **Deterministic-first scoring** — built the rule-based ATS engine before AI integration,
   ensuring the app remains useful and explainable even if the AI call fails or is rate-limited.
5. **Prompt engineering** — iterated on the OpenAI system prompt to enforce strict JSON output,
   bounded list lengths, and grounded, non-hallucinated feedback.
6. **Error handling and resilience** — centralized error middleware, Multer-specific error
   translation, and user-facing error states in the UI (no silent failures).
7. **Containerization and cloud readiness** — Dockerfiles and App Runner configs written
   alongside the application code, not as an afterthought.

## 6. Key features delivered

| Feature | Status |
|---|---|
| Resume upload (PDF/DOCX, drag-and-drop) | ✅ |
| ATS compatibility score (blended deterministic + AI) | ✅ |
| Score breakdown by category | ✅ |
| AI-generated summary & ATS notes | ✅ |
| Skills detection (dictionary + AI) | ✅ |
| Missing skills vs. job description | ✅ |
| Strengths / weaknesses | ✅ |
| Ranked, actionable suggestions | ✅ |
| Bullet point rewrites (before/after) | ✅ |
| Downloadable PDF report | ✅ |
| Responsive, distinctive UI | ✅ |
| Dockerized frontend & backend | ✅ |
| AWS App Runner deployment configs | ✅ |

## 7. Testing considerations

- **Input validation**: file type/size enforced both client-side (immediate feedback) and
  server-side (authoritative, via Multer file filter and limits).
- **Failure modes covered**: empty/scanned PDFs (no text layer), oversized files, unsupported
  formats, missing OpenAI configuration, AI service errors/timeouts, and malformed AI JSON
  responses — each returns a clear, user-readable message rather than a stack trace.
- **Rate limiting**: protects the OpenAI integration from abuse and controls cost exposure.

## 8. Limitations

- Scanned/image-only PDFs without a text layer cannot be parsed (no OCR pipeline included).
- The skills dictionary, while broad, is not exhaustive and should be extended for
  specialized/niche industries.
- ATS scoring is a heuristic approximation; real-world ATS vendors (Workday, Greenhouse, Taleo,
  etc.) use proprietary, undisclosed algorithms that this tool cannot replicate exactly.
- No user accounts or history — each analysis is stateless and ephemeral by design (a
  deliberate privacy choice, not a missing feature).

## 9. Future scope

- OCR support (e.g., Tesseract) for scanned resumes.
- Multi-resume comparison and version tracking (would require persistent storage/auth).
- Resume template/formatting suggestions rendered as a live preview.
- Support for additional file formats (RTF, plain text, LinkedIn PDF export nuances).
- A/B testing different AI prompt strategies and models for scoring consistency.
- Internationalization (multi-language resume support).

## 10. Conclusion

This project demonstrates a complete, realistic product build: a clearly defined problem, a
thoughtful blend of deterministic and AI-driven analysis, a distinctive and responsive user
interface, robust error handling, and a deployment path suitable for real cloud infrastructure.
It serves as both a genuinely useful tool for job seekers and a reference architecture for
building AI-integrated full-stack applications.
