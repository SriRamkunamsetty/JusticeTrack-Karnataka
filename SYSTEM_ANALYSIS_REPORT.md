# JusticeTrack - System Analysis & Architecture Report
Date: 2026-05-07

## 1. Project Overview
JusticeTrack is a customized governance application designed for the Government of Karnataka (CCMS pipeline extension) to automate the extraction of legal obligations, action plans, and deadlines from High Court judgment PDFs. It utilizes an AI assistant for extraction but mandates systematic human-in-the-loop verification, embodying the core governance principle: **"AI assists. Government officials decide."**

The platform transitions unstructured legal PDFs into verifiable, structured action plans, integrating persistent audit trails to ensure compliance.

## 2. Overall System Architecture
The application runs as a monolith configured with an Express backend and a React/Vite (TypeScript) frontend.

```text
Frontend (React/Vite)
         ↓
Express/tRPC Backend
         ↓
OCR & Extraction Layer
         ↓
Verification Workflow
         ↓
SQLite Database
         ↓
Dashboard & Audit Logs
```

### Verification Workflow Diagram
```text
PDF Upload
         ↓
AI Extraction
         ↓
Human Review
         ↓
Approve / Reject
         ↓
Audit Log Creation
         ↓
Dashboard Visibility
```

### Action Plan Workflow Diagram
```text
Judgment PDF
         ↓
Extract Deadlines & Directives
         ↓
Generate Action Plan
         ↓
Assign Department
         ↓
Track Compliance
```

## 3. Database Architecture
The persistent SQLite database consists of four central tables:

1. **`users`:** Stores system users with explicit roles (`Super Admin`, `Department Admin`, `Reviewing Officer`, `Legal Officer`, `Read-only Viewer`). Passwords are mock-hashed for development.
2. **`cases`:** Stores uploaded judgments. Tracks `case_number`, `file_path`, `status` (processing, pending_review, approved, rejected), and timestamps.
3. **`extracted_data`:** Stores AI extraction results. Key fields: `raw_json` (stringified Gemini output), `actions`, `urgency`, `reviewer_notes`. This separates the raw document tracking from its metadata interpretations.
4. **`audit_logs`:** Absolute log of all workflow actions (`LOGIN`, `APPROVE_CASE`, `REJECT_CASE`, etc.) tracking `user_id`, `entity_id`, and a `timestamp` for institutional accountability.

## 4. Governance Impact
This system is architected to directly resolve critical legal bottlenecks within the Government of Karnataka's CCMS workflows:

- **Reduced Manual Legal Workload:** Officers no longer read 60-page PDFs just to find a single deadline.
- **Fewer Missed Compliance Deadlines:** Automated extraction flags urgent timelines and creates actionable priorities.
- **Improved Accountability:** Every decision is traced to the specific officer who approved it via immutable audit logs.
- **Explainable AI Assistance:** The system highlights verbatim quotes inside the original source PDF, ensuring that AI reasoning is transparent.
- **Faster Departmental Coordination:** Action plans are automatically routed to relevant departments.
- **Structured Governance Workflows:** A rigid, formal process guarantees that nothing bypasses human verification.
- **Operational Transparency:** Executive dashboards provide a precise view of the entire government legal apparatus in real time.

## 5. Why Human Verification is Mandatory
"AI assists. Government officials decide."

This philosophical and architectural constraint exists for vital reasons:
- **Legal Accountability:** A machine cannot be held liable for compliance failures or contempt of court.
- **Prevention of Hallucinated Actions:** Generative AI is prone to hallucinations; allowing it independent operational control over legal responses is fundamentally unsafe.
- **Trust in Government Systems:** Institutional protocols demand official sign-offs before public funds or legal actions are deployed.
- **Officer Oversight & Explainability:** A Reviewing Officer must be able to click on an AI-generated field and instantly verify its source within the PDF geometry.

## 6. Audit & Accountability
Governance systems require enterprise-grade accountability. The platform features an **Immutable Audit History**, heavily tracked through the `audit_logs` table.
- **Workflow Traceability:** Every status change (e.g., transition from `pending` to `approved`) is permanently logged.
- **Reviewer Identity:** The exact identity of the official making a decision is intrinsically tied to the action.
- **Timestamps & History:** A complete forensics chain proves exactly when an officer viewed and approved a document.

This capability is critical in legal and government environments, providing a definitive defense against claims of negligence or procedural violation.

## 7. Feature Status Matrix
Below is the transparent implementation status of the system features. 

| Feature                | Status          | Notes                                 |
| ---------------------- | --------------- | ------------------------------------- |
| Dashboard              | Complete        | Government-themed executive dashboard |
| Verification Workspace | Complete        | PDF review + backend workflow         |
| PDF Viewer             | Complete        | Navigation + zoom + highlight jumps   |
| Audit Logs             | Complete        | Persistent workflow tracking          |
| Gemini Extraction      | Partial         | Demo-oriented structured extraction   |
| Source Highlighting    | Partial         | UI structure exists, jumps implemented|
| PostgreSQL Migration   | Not Implemented | Future roadmap                        |
| InLegalBERT / LayoutLM | Not Implemented | Future roadmap                        |

## 8. Implementation Clarity

### Fully Implemented
- **Government Dashboard:** Real-time visibility, urgency notifications, and specialized KPI widgets based on dynamic user roles.
- **Verification Workspace:** A dual-pane workspace that pairs interactive extracted data against native PDF documents.
- **PDF Viewer & Highlights:** Includes smooth scrolling highlight interactions via `@react-pdf-viewer`.
- **Audit Logs:** Immutable and fully hooked into API transitions.
- **Action Plans:** Extracted elements construct highly structured action cards automatically.
- **Routing & Backend Workflows:** Complete logic cycle between React frontend and Express APIs mapped to local persistent SQLite.

### Partially Implemented
- **Gemini Extraction Logic:** Gemini-assisted structured extraction architecture has been partially integrated for demo-oriented workflows. Fallback data functions provide a safety net for failed API calls.
- **Live Analytics:** Aggregations pull real counts, but some specific data cuts (e.g., historical confidence curves) incorporate mocked data.
- **Source Overlays/Highlighting:** Basic text jump behaviors exist. Geometrically aware bounding boxes are rudimentary.
- **Extraction Editing:** The user interface allows editing text in the UI during verification.

### Future Roadmap
- **Advanced NLP:** Advanced legal NLP integrations such as `InLegalBERT` and `LayoutLMv3` remain future roadmap enhancements. We prioritize Gemini for flexible hackathon MVP capabilities.
- **PostgreSQL / Cloud SQL Migration:** Migration from local SQLite for reliable cloud persistence.
- **Multi-Agent Orchestration:** Upgrading from a single zero-shot prompt to a chain-of-thought routing architecture.
- **Cloud Deployment/S3 Storage:** Resolving local FS dependencies (`/uploads`) by routing to specialized blob stores.

## 9. Architectural Decisions & Tradeoffs
- **Why React/Vite:** Extremely fast iteration loops for hackathon deliverables; seamless integration with complex component libraries like shadcn.
- **Why Express:** Provides a lightweight standard API server natively handling `multer` uploads without configuration bloat.
- **Why SQLite during Hackathon:** Requires zero cloud configuration, allowing reviewers/judges to run the prototype instantly and retaining local persistence across restarts.
- **Why Government-Style UX:** Legal professionals mistrust overly modern "SaaS startup" aesthetics. The design uses subdued branding and institutional layouts to increase cognitive acceptance.
- **Why Modular Workflows:** Clearly separating "Upload," "Extraction," and "Verification" forces the end user to acknowledge step-by-step governance compliance conceptually.
- **Why Human-Supervised AI:** Fully autonomous extraction violates legal prudence protocols.

## 10. Recommended Demo Flow
**1. Login:** Use default generated accounts (e.g., `admin@kar.nic.in` for Super Admin) to display role-based restrictions.
**2. Upload Judgment PDF:** Upload a sample case via the Upload Center. Explain that this represents the start of ingestion.
**3. AI Extraction:** Let the system run the mock/Gemini pipeline. Discuss how it transforms raw PDFs into a structured object.
**4. Action Plan Generation:** Show how the system interprets the legal text to formulate clear departmental tasks and extract deadlines.
**5. Human Verification:** Enter the Verification Workspace. Click on extracted deadlines to demonstrate the PDF highlight and smooth scrolling.
**6. Dashboard Tracking:** Return to the Dashboard and show how the new approved action dynamically modifies organizational queues and high-urgency notifications.
**7. Audit Trail Review:** Open the Audit Logs to prove that an immutable record of verification was immediately generated, closing the loop on institutional compliance.