# Firebase & Cloud Run Migration Plan

## 1. Current Architecture
JusticeTrack currently runs as a monolithic Node.js/Express application integrated with React/Vite. 
- **Frontend**: React 19, Vite, Tailwind CSS, React Router, `@react-pdf-viewer/core`.
- **Backend**: Express 4 serving REST endpoints.
- **Database**: SQLite via `better-sqlite3`, persisting data locally to `justice_track.db`.
- **Storage**: User-uploaded PDFs are stored directly in the local file system using `multer` via `./uploads/` directory.
- **Auth**: A custom-implemented JWT-based authentication system storing tokens in `localStorage` and tracking login events in SQLite `audit_logs`.
- **AI Processing**: Google Gemini API integration on the express backend.

## 2. Current Data Flow
1. **Frontend** queries the Express API with an expected JWT header (`Authorization: Bearer <token>`).
2. **Backend** processes endpoints, extracting user boundaries via `authenticateToken` local middleware.
3. **Database** (SQLite `better-sqlite3`) operations are synchronous and strongly coupled with local server memory. Entity changes trigger `audit_logs` inserts natively within request handlers.

## 3. Current Storage Flow
1. File upload requests are piped to `multer` which writes locally to `/uploads/`.
2. Paths saved in DB point to native path strings (`req.file.path`).
3. File serving triggers from `express.static` mapped to `/uploads` or `/api/download/:id`.

## 4. Current Auth Flow
1. Frontend passes `email` to `/api/auth/login`.
2. Backend auto-provisions or generates simulated JWTs containing simulated user IDs and Role bindings.
3. Token stored in `localStorage('token')` alongside `localStorage('user')`.
4. Role-based Navigation dynamically filters UI elements on the client based on `localStorage('user').role`.

## 5. Firestore Collection Plan
The core premise is migrating SQLite tables directly to Firestore Collections seamlessly, reducing normalized lookups with optimized NoSQL document schemas.

- **`users`**
  - Schema: `id`, `name`, `email`, `role`, `createdAt`
  - Authored via Firebase Authentication triggers or custom admin workflows.
- **`cases`**
  - Schema: `case_number`, `file_url`, `file_name`, `status`, `upload_date`, `uploaded_by`
- **`extractedData`**
  - Schema: `case_id` (reference string), `actions` (array), `appeal_deadline`, `urgency`, `departments` (array), `raw_json` (stringified object), `status`, `reviewer_notes`, `reviewed_at`, `reviewed_by`
- **`auditLogs`**
  - Schema: `user_id`, `action`, `entity_type`, `entity_id`, `timestamp`, `details`
  - Strongly indexed on `entity_id` and `timestamp` for fast retrieval during Case Detail lookup.

## 6. Firebase Auth Plan
1. Completely remove `jsonwebtoken` from backend and local auto-provisioning login logic.
2. Integrate **Firebase Authentication** on the Frontend (`firebase/auth`). Use Email/Password or predefined accounts for the Demo.
3. Migrate `localStorage('user')` role persistence to Firestore `users` mapping or Firebase Custom User Claims via Firebase Admin SDK.
4. Pass Firebase `idToken` to Backend requests (e.g. `Authorization: Bearer <idToken>`).
5. Express Backend intercepts requests via `firebaseAdmin.auth().verifyIdToken()` middleware for secure protected routes.

## 7. Firebase Storage Plan
1. Remove `multer` dependency for disk storage. Setup `multer` configured either with `multer-firebase` or handle local memory memory-buffer mapping (`multer.memoryStorage()`).
2. Alternatively, perform Multi-part upload directly from Frontend to Firebase Storage, then pass the resolved `downloadURL` to the Backend `/api/cases/upload` endpoint. This saves memory limit issues on Cloud Run.
3. Store the Firebase Storage gs:// URI or Download URL in the Firestore `cases` collection.
4. Download logic redirects to the signed URL or direct Firebase Storage references for the PDF viewer.

## 8. Cloud Run Deployment Plan
- Containerize the application as a strict stateless service.
- Implement production build step encompassing `vite build` followed by statically serving `dist` via Express.
- Setup Cloud Run to run exclusively on HTTP Port 8080 mapping internally to Port 3000 where explicitly necessary, bypassing HMR and utilizing Node environments.

## 9. Docker Strategy
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "start"]
```

## 10. Environment Variable Plan
Requires translation of critical keys into Google Cloud Run Secrets:
- `GEMINI_API_KEY`: Generative AI Key.
- `FIREBASE_PROJECT_ID`: Used for mapping authentication and default admin scopes.
- `FIREBASE_CLIENT_EMAIL` & `FIREBASE_PRIVATE_KEY`: Service Account mapped for DB Admin integrations.
- Local `.env` must be explicitly replicated in the deployment target environment configuration.

## 11. Security Rules Plan
- Enable Read/Write constraint Rules strictly verifying `request.auth.uid`.
- Audit logs should technically be append-only (`create` permitted, `update` / `delete` rejected).
- Uploads isolated via Storage Rules.

## 12. Risk Analysis
| Risk | Mitigation |
|------|------------|
| PDF Rendering CORS issues on Cloud Run | Ensure Firebase storage buckets enable CORS rules. Avoid direct local blob logic without proxy. |
| Firebase Storage Upload Max Size | Migrate file uploading heavily to Frontend direct-upload pattern, passing only metadata payload to Backend. |
| State/Role Desynchronization | Ensure `onAuthStateChanged` comprehensively sets user contexts cleanly. Delay UI load until verification triggers. |

## 13. Migration Sequence
1. Ensure Firebase / Project settings initialized via Cloud.
2. Initialize Frontend Firebase SDK configurations.
3. Establish `users` integration + standard Auth forms.
4. Refactor Local Express `jwt` middlewares strictly to Admin SDK Identity verification.
5. Upgrade file uploading mechanism (Frontend -> Storage -> DB metadata backend sync).
6. Migrate SQLite `db.ts` to `firebase-admin/firestore`.

## 14. Rollback Considerations
- Retain branches for SQLite deployment mappings explicitly to support localized demos if network / external Cloud integrations fail suddenly during Demo execution.

## 15. Production Readiness Checklist
- [ ] No local filesystem writes exist (e.g. `mkdir`, `/uploads/`).
- [ ] SQLite (`better-sqlite3`) completely decoupled and uninstalled.
- [ ] CORS policies appropriately setup for Storage URL reads in `@react-pdf-viewer`.
- [ ] Dockerfiles validated via standard emulator workflows offline first.
- [ ] Secrets injected safely into environments instead of repository commits.

## 16. Deployment Steps
1. Build via standard `docker build` sequence.
2. Push tags pointing into GCP Artifact Registry.
3. Trigger Cloud Run revision updating, enforcing stateless boundaries.
4. Setup domains and scaling configurations safely preventing zero-scale cold-start lags for Demo usage.

## 17. Post-Deployment Validation Checklist
- [ ] Application loads without missing file bundles.
- [ ] Admin / Legal Officer standard sign-in functions seamlessly.
- [ ] PDFs successfully parse text blocks properly to Gemini (Requires Storage bucket file buffer mappings logic validation on the Express router).
- [ ] PDF Viewer renders highlights correctly utilizing fully remote storage URLs. 
- [ ] `audit_logs` correctly trace and persist between container sleep cycles.
