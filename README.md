# JusticeTrack - Karnataka CCMS Extension

JusticeTrack is an AI-assisted governance application designed for the Government of Karnataka to automate the extraction of legal obligations, action plans, deadlines, and operational directives from High Court judgment PDFs. It integrates via local Express APIs and focuses strongly on human-in-the-loop verification, embodying the absolute governance principle: **"AI assists. Government officials decide."**

## Core Features
1. **Judgment Intake & Ingestion**: Upload CCMS-tagged High Court judgments (PDF) directly to the system.
2. **AI Action Plan Generation**: Uses Gemini to syntactically analyze raw legal judgment text, structuring it into standard metadata (judges, parties, deadlines) and department-specific compliance actions.
3. **Verification Workspace**: A split-pane view linking the raw AI extraction directly to a built-in interactive PDF viewer, complete with source context highlights and text-jumping.
4. **Immutable Audit Trails**: Actions across the platform (such as "APPROVE_CASE" or "LOGIN") are rigorously tracked, assigning granular responsibility back to the specific government official.
5. **Executive Visibility**: Dashboards specifically crafted out of department workloads and High Urgency appeals designed to surface the most immediate legal risks.
6. **Built-in Presentation Deck**: Access the interactive hackathon presentation via the `/presentation` endpoint.

## Architecture

```text
Frontend (React + Vite + Tailwind CSS)
         ↓
Express APIs (tRPC structured REST)
         ↓
OCR & Generative Pipeline (Google Gemini)
         ↓
Verification Workspace (Human Review)
         ↓
Local Relational DB (SQLite `justice_track.db`)
```

*Note: For the purpose of the demonstration, SQLite is used persistently on the local filesystem.*

## Setup & Deployment

### Prerequisites
- Node.js (v18+)
- npm (v9+)
- A Google Gemini API Key

### Installation

1. Clean install dependencies:
```bash
npm install
```

2. Environment Configuration:
Create a `.env` file from the `.env.example`:
```bash
cp .env.example .env
```
Ensure `GEMINI_API_KEY` is set to a valid API Key in `.env`.

3. Dev Startup:
```bash
npm run dev
```

The application will be exposed via `http://localhost:3000`. 
Logins are simulated to emulate single-sign on via standard Karnataka NIC email structures.

Using `admin@kar.nic.in` will map to 'Super Admin'.
Using `review@kar.nic.in` will map to 'Reviewing Officer'.

### Build for Production
To simulate the deployment build:
```bash
npm run build
npm run start
```

## Hackathon Flow
For presentation purposes, follow the standard lifecycle:
1. Log in.
2. View the unified Dashboard.
3. Navigate to **Upload Judgment** and upload any sample case PDF.
4. Click through to **Pending Verification**.
5. Emphasize the highlight and bounding features inside the PDF viewer pane while editing JSON metadata.
6. **Approve** the record.
7. Return to the **Dashboard** and **Audit Logs** to view the resulting changes.

## Philosophy & Governance Impact
While modern software rushes toward fully autonomous agents, this project takes the opposite approach out of legal necessity. An autonomous agent misinterpreting a deadline by 48 hours could lead to the State's Chief Secretary being held in contempt of court.

JusticeTrack is built to *surface* operational intelligence. It identifies the 3 key sentences out of 60 pages of legalese and highlights them on the screen, prompting a Reviewing Officer to merely double-check and dispatch the workflow smoothly. 

## Roadmap
- Full migration to PostgreSQL.
- Enhanced NLP integration via specialized legal models (InLegalBERT).
- S3 Bucket/Cloud Storage transition for filesystem persistence.
- Deep CCMS two-way integration.
