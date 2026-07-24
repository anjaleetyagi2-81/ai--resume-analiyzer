# 🩻 AI Resume Analyzer — ResumeScan -

An end-to-end, production-ready web application that analyzes resumes (PDF/DOCX) using AI with the help of open router,
scoring ATS (Applicant Tracking System) compatibility, detecting skills, finding gaps against a
target job description, and generating actionable, AI-written suggestions — with a downloadable
PDF report.

**Live features:** resume upload → text extraction → deterministic ATS scoring → OpenAI-powered
qualitative analysis → skills/gap detection → suggestions & bullet rewrites → PDF report export.

---

## Table of contents

1. [Tech stack](#tech-stack)
2. [Project structure](#project-structure)
3. [Features](#features)
4. [Local setup](#local-setup)
5. [Environment variables](#environment-variables)
6. [Running with Docker](#running-with-docker)
7. [API reference](#api-reference)
8. [Deploying to AWS App Runner](#deploying-to-aws-app-runner)
9. [Design notes](#design-notes)
10. [Troubleshooting](#troubleshooting)

---

## Tech stack

| Layer      | Technology |
|------------|------------|
| Frontend   | React 18, Vite, Tailwind CSS, lucide-react, jsPDF, axios |
| Backend    | Node.js 18, Express, Multer, pdf-parse, mammoth |
| AI         | OpenAI Chat Completions API (`gpt-4o-mini` by default) |
| Containers | Docker, docker-compose |
| Deployment | AWS App Runner (source or container-image based) |

---

## Project structure

```
ai-resume-analyzer/
├── frontend/                     # React + Vite + Tailwind SPA
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── FileUpload.jsx        # drag-and-drop + job description input
│   │   │   ├── Loader.jsx            # analysis progress state
│   │   │   ├── ScoreGauge.jsx        # signature circular ATS score dial
│   │   │   ├── AnalysisResult.jsx    # results page orchestrator
│   │   │   ├── SkillsPanel.jsx       # detected / missing skills
│   │   │   └── SuggestionsPanel.jsx  # ranked suggestions + bullet rewrites
│   │   ├── services/api.js           # axios client for backend calls
│   │   ├── utils/pdfReport.js        # jsPDF report generator
│   │   ├── App.jsx, main.jsx, index.css
│   ├── index.html
│   ├── package.json, vite.config.js, tailwind.config.js, postcss.config.js
│   ├── Dockerfile, nginx.conf, apprunner.yaml, .env.example
├── backend/                      # Node.js + Express API
│   ├── src/
│   │   ├── routes/resume.routes.js
│   │   ├── controllers/resume.controller.js
│   │   ├── services/
│   │   │   ├── openai.service.js     # OpenAI prompt + call + response normalization
│   │   │   └── parser.service.js     # PDF/DOCX text extraction
│   │   ├── middleware/
│   │   │   ├── upload.middleware.js  # multer config + file validation
│   │   │   └── error.middleware.js   # centralized error handling
│   │   ├── utils/atsScore.js         # deterministic ATS scoring + skills dictionary
│   │   └── server.js
│   ├── package.json, .env.example, Dockerfile, apprunner.yaml
├── docker-compose.yml
├── apprunner.yaml                # monorepo deployment notes
├── README.md
├── PROJECT_REPORT.md
├── CONCEPT_NOTE.md
└── .gitignore
```

---

## Features

- **Resume upload** — drag-and-drop or click-to-browse, supports **PDF and DOCX**, up to 5MB.
- **ATS Score** — a blended score (0–100) combining:
  - a deterministic, explainable rule-based engine (contact info, section structure, action
    verbs, quantified impact, skills density, length, formatting cleanliness), and
  - the AI model's own independent estimate.
- **Resume Analysis** — AI-generated summary, ATS compatibility notes, and role-fit assessment.
- **Skills Detection** — merges a curated 80+ term technical/soft-skills dictionary with the
  AI's own detected skills.
- **Missing Skills** — cross-references detected skills against an optional target job
  description to surface keyword gaps.
- **Suggestions** — 4–8 ranked, actionable suggestions plus concrete bullet-point rewrites
  ("before" vs "after").
- **Download PDF Report** — a polished, multi-page report generated client-side with jsPDF,
  no server round-trip needed.
- **Responsive UI** — fully responsive from mobile to desktop, with a distinctive
  "document scanner" visual identity (see [Design notes](#design-notes)).
- **Dockerized** — separate multi-stage Dockerfiles for frontend (nginx) and backend (Node),
  orchestrated locally via `docker-compose`.
- **AWS App Runner ready** — `apprunner.yaml` for both services, supporting both source-based
  and container-image-based deployment.

---

## Local setup

### Prerequisites

- Node.js 18+ and npm
- An OpenAI API key ([platform.openai.com](https://platform.openai.com/api-keys))

### 1. Clone and install

```bash
git clone <your-repo-url> ai-resume-analyzer
cd ai-resume-analyzer

# Backend
cd backend
npm install
cp .env.example .env
# edit .env and paste your OPENAI_API_KEY

# Frontend
cd ../frontend
npm install
cp .env.example .env
```

### 2. Run in development

```bash
# Terminal 1 — backend (http://localhost:5000)
cd backend
npm run dev

# Terminal 2 — frontend (http://localhost:5173)
cd frontend
npm run dev
```

Open **http://localhost:5173** and upload a resume.

---

## Environment variables

### Backend (`backend/.env`)

| Variable | Description | Default |
|---|---|---|
| `PORT` | Server port | `5000` |
| `NODE_ENV` | `development` \| `production` | `development` |
| `CLIENT_ORIGIN` | Comma-separated allowed CORS origins | `http://localhost:5173` |
| `OPENAI_API_KEY` | **Required.** Your OpenAI secret key | — |
| `OPENAI_MODEL` | Chat completions model | `gpt-4o-mini` |
| `MAX_FILE_SIZE_MB` | Max upload size | `5` |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window | `900000` (15 min) |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window per IP | `100` |

### Frontend (`frontend/.env`)

| Variable | Description | Default |
|---|---|---|
| `VITE_API_BASE_URL` | Backend API base URL | `http://localhost:5000/api` |

> ⚠️ Vite inlines `VITE_*` variables **at build time**. For production, set this before running
> `npm run build`, or pass it as a Docker `--build-arg`.

---

## Running with Docker

```bash
# From the project root
export OPENAI_API_KEY=sk-your-key-here
docker compose up --build
```

- Frontend: **http://localhost:8080**
- Backend: **http://localhost:5000**

To stop: `docker compose down`.

### Building images individually

```bash
docker build -t resume-analyzer-backend ./backend
docker build -t resume-analyzer-frontend \
  --build-arg VITE_API_BASE_URL=http://localhost:5000/api \
  ./frontend
```

---

## API reference

Base path: `/api/resume`

### `GET /api/resume/health`

Liveness/readiness probe.

```json
{ "success": true, "status": "ok", "timestamp": "...", "openaiConfigured": true }
```

### `POST /api/resume/analyze`

`multipart/form-data` body:

| Field | Type | Required | Description |
|---|---|---|---|
| `resume` | File | ✅ | PDF or DOCX file, max 5MB |
| `jobDescription` | Text | ❌ | Target job description for tailored gap analysis |

**Response `200`:**

```json
{
  "success": true,
  "analysisId": "uuid",
  "fileMeta": { "originalName": "resume.pdf", "sizeBytes": 123456, "mimeType": "application/pdf" },
  "atsScore": 78,
  "atsBreakdown": { "contactInfo": 10, "sectionStructure": 17, "...": "..." },
  "atsStats": { "wordCount": 480, "hasEmail": true, "...": "..." },
  "summary": "...",
  "atsCompatibilityNotes": "...",
  "roleFitSummary": "...",
  "strengths": ["..."],
  "weaknesses": ["..."],
  "detectedSkills": ["react", "node.js", "..."],
  "missingSkills": ["kubernetes", "..."],
  "suggestions": [{ "title": "...", "detail": "..." }],
  "improvedBulletExamples": [{ "original": "...", "improved": "..." }],
  "jobDescriptionProvided": true,
  "generatedAt": "2026-07-16T12:00:00.000Z"
}
```

**Error responses** follow the shape `{ "success": false, "message": "..." }` with appropriate
HTTP status codes (`400` bad input, `422` unparseable file, `429` rate-limited, `502` AI service
error, `500` unexpected).

---

## Deploying to AWS App Runner

This app deploys as **two separate App Runner services** (frontend + backend). Two deployment
paths are supported:

### Option A — Source-based (App Runner builds from your repo)

1. Push this project to GitHub/GitLab/CodeCommit.
2. In the AWS Console → **App Runner** → **Create service** → connect your repository.
3. **Backend service**: set the source directory to `backend/` (App Runner will pick up
   `backend/apprunner.yaml`). Add environment variables/secrets: `OPENAI_API_KEY` (as a
   Secrets Manager secret), `OPENAI_MODEL`, `CLIENT_ORIGIN` (your frontend's App Runner URL).
4. **Frontend service**: set the source directory to `frontend/` (uses `frontend/apprunner.yaml`).
   Set `VITE_API_BASE_URL` to your backend service's public URL + `/api` as a **build-time**
   environment variable.
5. Deploy both; App Runner gives each a public HTTPS URL automatically.

### Option B — Container image-based (recommended for full control)

```bash
# 1. Authenticate to ECR
aws ecr get-login-password --region <region> | docker login --username AWS \
  --password-stdin <account-id>.dkr.ecr.<region>.amazonaws.com

# 2. Create repositories (one-time)
aws ecr create-repository --repository-name resume-analyzer-backend
aws ecr create-repository --repository-name resume-analyzer-frontend

# 3. Build & push backend
docker build -t <account-id>.dkr.ecr.<region>.amazonaws.com/resume-analyzer-backend:latest ./backend
docker push <account-id>.dkr.ecr.<region>.amazonaws.com/resume-analyzer-backend:latest

# 4. Build & push frontend (point VITE_API_BASE_URL at your backend's future App Runner URL)
docker build \
  --build-arg VITE_API_BASE_URL=https://<backend-service>.<region>.awsapprunner.com/api \
  -t <account-id>.dkr.ecr.<region>.amazonaws.com/resume-analyzer-frontend:latest ./frontend
docker push <account-id>.dkr.ecr.<region>.amazonaws.com/resume-analyzer-frontend:latest
```

Then in the AWS Console: **App Runner → Create service → Container registry → Amazon ECR**,
select each image, set the port (`5000` for backend, `8080` for frontend), configure
environment variables/secrets (backend only needs `OPENAI_API_KEY`, `OPENAI_MODEL`,
`CLIENT_ORIGIN`), and deploy.

> 💡 Because the frontend is a static SPA, `VITE_API_BASE_URL` must be known **before** the
> Docker build (it's compiled into the JS bundle) — build the backend first, note its URL, then
> build the frontend image.

---

## Design notes

The UI's visual identity ("document scanner") is intentional: a warm paper background, deep ink
navy for structure, a highlighter-amber accent for emphasis, and a teal "scan" accent for
AI/data moments. Scores and stats use a monospace face (`JetBrains Mono`) to feel like a
scanner readout, headlines use `Space Grotesk`, and body copy uses `Inter`. The signature
element is the animated circular **ATS Score Gauge**, styled like a scanner dial with tick
marks that light up proportionally to the score, plus a scan-line sweep animation on the
upload dropzone and loading state.

---

## Troubleshooting

| Problem | Likely cause / fix |
|---|---|
| `Server is missing OPENAI_API_KEY configuration` | Set `OPENAI_API_KEY` in `backend/.env` (or App Runner secrets). |
| `CORS blocked for origin` | Add your frontend's origin to `CLIENT_ORIGIN` in the backend env. |
| `Could not extract any text from the PDF` | The PDF is likely a scanned image with no text layer — export a text-based PDF instead. |
| Upload fails instantly with 400 | Check file type (PDF/DOCX only) and size (≤5MB, configurable via `MAX_FILE_SIZE_MB`). |
| Frontend can't reach backend in production | Confirm `VITE_API_BASE_URL` was set at **build time**, not just runtime. |

---

Built as a complete, deployable reference implementation for an AI-powered resume analysis
product. Contributions and forks welcome.
