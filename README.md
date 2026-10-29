# Boussole — Fiches de santé

Private member health profiles for Groupe Saint Vincent de Paul, Naccache. French/Arabic questionnaire, mobile grey/red interface, private access codes, administrator dashboard, ID/passport images and PDF downloads.

## Hosting

This version runs on **Netlify + GitHub**. It does not use Google Apps Script. The public website is built into `dist/`; only that directory is published. Netlify Functions handle authentication, authorization and document generation. Member records, credential hashes, sessions and attachments use a private site-scoped Netlify Blobs store. Git deployments do not erase that store.

The 39 questions are defined in `server/questions.mjs`. No actual member answers, initial member codes or production credentials are included in this repository or the public build. Prepared Excel import files and the administrator access document are supplied privately outside the repository.

## One-time Netlify configuration

Connect this repository to Netlify. `netlify.toml` defines the build command (`npm run build`), publish directory (`dist`) and functions directory (`netlify/functions`). Configure these **server-only** environment variables before the first working deployment:

- `AUTH_SECRET`: at least 32 characters of cryptographically random secret material.
- `ADMIN_CODE_HASH`: HMAC-SHA256 hex digest of `admin:` followed by the normalized administrator code, using `AUTH_SECRET` as the key. Normalization removes spaces/hyphens and uppercases letters.

A private `.env` import file and matching administrator access document have been prepared for the owner; never commit them or put them in a public/static directory. Without those values, the API returns a configuration error instead of allowing access. No default production administrator code exists.

The account label is `gsvnsdl2006@gmail.com`. Administrator access uses the privately supplied administrator code; no Google OAuth origin configuration is required. The administrator code is longer than member codes. Keep the access document private.

Netlify automatically provides the function's private Blobs credentials. The app uses strong-consistency reads and conditional ETag writes to prevent concurrent updates from overwriting each other. Function packaging includes the licensed DejaVu font used in French/Arabic PDF generation.

When Netlify is connected to GitHub, pushes to the configured production branch trigger a build and deployment. GitHub Actions also runs backend tests and the public-build validation. Initial account authorization, billing/plan choices and secure environment-value entry belong to the account owner. Account creation and live deployment are not established by the presence of these files; check the live site before inviting members.

## Members and existing responses

Members register with a name, requested unit and a chosen eight-character code, or use the random code suggestion. Repeated and sequential characters are allowed; there is no complexity requirement. Registration always creates a new blank profile; it cannot claim another person's existing records by name. Members with a prepared profile should receive their existing code from the administrator instead.

After administrator sign-in, use **Importer les profils préparés** to import the private JSON created from the uploaded workbook. The import retains all 39 individual answers, activates the prepared codes and is idempotent for unchanged source questionnaires. Repeated names with different answers remain separate. The private codes CSV includes the Excel row and birth date to help the administrator review repeated names before distributing codes. Reimporting does not reset existing codes or overwrite app edits.

Official units remain **À attribuer** until the administrator chooses Meute, Troupe or Clan. The original declared unit stays visible. The administrator can create members, reset codes, view and edit every profile, and download each document. A code reset revokes the old code and existing member sessions immediately. Forgotten codes are reset rather than recovered.

## Privacy and files

All data APIs require a valid server session, apart from login, registration and public logo configuration. Sessions use random 256-bit tokens in HTTP-only, Secure, SameSite=Strict cookies and are kept server-side; credentials never go in URLs or local storage. Origin checks reject cross-site API requests. Login failures are throttled per client. Member ownership is checked before records and images are read or changed. No download uses an unprotected public storage URL.

ID/passport images accept JPG/PNG up to 4 MiB. PDFs download through an authenticated URL with attachment headers and a named file. Supported phones also offer a native Enregistrer / Partager action after preparing the PDF. Saving the profile prepares the PDF without forcing a browser preview. PDFs contain all relevant question answers and bilingual labels; an optional annex includes the identity image. The PDF server embeds a font for Arabic and French. Uploading replaces the previous stored identity image. Logos can be uploaded by the administrator and appear in the interface and PDF.

**Google Drive synchronization is not connected in this Netlify version.** Current records and documents are stored privately on Netlify. Restoring automatic Drive backup requires a separate authorized Google connection; do not claim a Netlify deployment has connected Drive. The original uploaded Excel remains unchanged.

This implementation has no automatic retention policy, member-deletion UI, audit log, MFA, or production backup/restore workflow. Define retention, guardian consent and removal procedures before collecting health/ID data. Review Netlify quotas and the organization's requirements for storing these records. Those limitations do not replace the app's access-control checks.

## Local development

Node 22 or later:

```sh
npm ci
npm test
npm run build
npm run dev
```

The local HTTP server starts on port 3000 and creates credentials and storage inside ignored `.local/`. Its administrator code is in `.local/config.json`; it is not printed. This local file store is never a production fallback. Do not put production data in a public preview.

The backend suite exercises HTTP login, role/record isolation, reset/revocation, concurrent updates, imports, private uploads and actual PDF generation. Optional phone-sized browser checks require Playwright and Chromium: start the local server on port 3100 (`PORT=3100 npm run dev`), then run `npm run test:browser`. Browser checks use fictional data and the real HTTP backend, not Apps Script mocks.
