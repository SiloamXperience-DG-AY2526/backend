# February 2026 feature and handover status

Last audited: **23 August 2026** against `main` in both the backend and frontend repositories, the supplied February timeline, the earlier requirements text, current GitHub issues, and merged/open pull requests.

This is a source and history audit, not a full end-to-end acceptance test. Dependencies were not installed in the provided workspace, so lint, tests, and production builds must still be run after `npm ci`.

## Status key

| Status | Meaning |
| --- | --- |
| Implemented | Frontend and backend code paths are present on `main` where both are required |
| Partial | Some code is present, but a required flow, integration, or wording is incomplete |
| PR open | Implemented on a branch but not merged into `main` |
| Pending | No complete implementation was found on `main` |
| External / verify | Outside these two repositories or cannot be confirmed from source |

## February 2026 timeline

| Category | Feature | Frontend | Backend | Overall status and evidence |
| --- | --- | --- | --- | --- |
| Bug fixing | Fix bugs in each assigned area | Several merged fixes | Several merged fixes | Ongoing. The issue audit below separates completed fixes from remaining work. |
| Data management | Import partner data templates and parser | Pending | PR open | [Backend issue #88](https://github.com/SiloamXperience-DG-AY2526/backend/issues/88); implementation is in [backend PR #145](https://github.com/SiloamXperience-DG-AY2526/backend/pull/145), not `main`. Password handling still needs a decision. |
| Data management | Export partner data | Pending | Pending | [Backend issue #87](https://github.com/SiloamXperience-DG-AY2526/backend/issues/87). No export route or UI was found. |
| Role management | Add sub-admin role | Implemented | Implemented | Role, layouts, sidebar, staff-management view, Prisma enum/migration, hierarchy, and permissions are on `main` via backend PR #141 and frontend PR #55. |
| Finance emails | Configure thank-you and receipt templates | Implemented | Implemented | Finance-manager configuration UI and email-template endpoints are present. |
| Finance emails | Automated payment follow-up email | Partial | Partial | Follow-up action and endpoint exist via backend PR #147 / frontend PR #63, but no automatic scheduler was found. |
| Finance emails | Generate/update receipt and email it | Partial | Partial | Staff can enter receipt data and send the receipt email. PDF/file receipt generation and download remain TODO. |
| Donation | Replace “successful” with “we will get in touch” | Pending | Implemented | Backend response was fixed in backend PR #143 and backend issue #142 was closed on 23 August 2026. The frontend still displays “Donation Successful” and a simulated result; keep [frontend issue #48](https://github.com/SiloamXperience-DG-AY2526/frontend/issues/48) open. |
| Donation | Rename “brick size” to “brick cost” | Pending | Implemented at API boundary | Backend maps the legacy DB field to `brickCost`. Finance-manager forms still label and validate `brickSize`, so the user-facing rename is incomplete. |
| Projects | Duplicate volunteer or donation project | Implemented | Implemented | Both project types have duplicate routes, services, confirmation UI, and edit redirect. Frontend issue #47 was closed on 23 August 2026. |
| Homepage numbers | Staff can manually edit volunteer and donor numbers | Pending | Pending | Current dashboards calculate values from data; no manual override model, route, or form was found. Keep backend issues [#90](https://github.com/SiloamXperience-DG-AY2526/backend/issues/90) and [#99](https://github.com/SiloamXperience-DG-AY2526/backend/issues/99) open. |
| Authentication | Forgot/reset password for users and staff | Implemented | Implemented | Request email, reset form, token validation, and backend routes exist. Frontend issue #51 was closed on 23 August 2026. |
| Authentication | Force first-login password change for staff | Implemented | Implemented | `mustChangePassword`, first-login token, redirect, update form, and migration exist. Frontend issue #58 was closed on 23 August 2026. |
| Infrastructure | Continue AWS setup | External / verify | External / verify | No infrastructure-as-code or deployment configuration was found in these repositories. |
| Handover | Handover without a domain by March | External / verify | External / verify | Operational decision; document the temporary hosting URL and DNS handover separately. |
| Security/compliance | Data security and Singapore/Cambodia compliance | Partial | Partial | Authentication and role permissions exist, but this audit is not a legal/security assessment. Token revocation remains open in backend issue #115. |
| Continuity | Support by another DG team for one more AY | External / verify | External / verify | Programme decision, not a code feature. |
| Data management | Decide project export/removal and auto-backup | Pending | Pending | No project export or automated backup implementation was found. |
| Infrastructure | Check AWS limits and upgrade point | External / verify | External / verify | Requires the live AWS account and usage data. |
| Design | Coordinate required design changes | Partial | Not applicable | Many screens exist; final design acceptance still needs stakeholder review. |

## Other implemented features found on `main`

| Area | Implemented capability | Notes |
| --- | --- | --- |
| Authentication | Partner sign-up, login/logout proxy, onboarding, role-based home routing | Partner onboarding is separated from basic account creation. |
| Profiles | Partner and staff profile views/updates | Comprehensive partner detail views are available to managers. |
| Staff management | List, create, activate, and deactivate staff | Deactivation is a soft state change; project reassignment semantics are marked incomplete in the backend. |
| Volunteer projects | Browse, view, create, edit, propose, withdraw, approve/reject, and duplicate | General-manager and partner journeys are present. |
| Volunteer applications | Apply, list own/all applications, match a volunteer, and change approval status | Attendance/session selection remains incomplete. |
| Volunteer feedback | Submit and view project/peer feedback | General-manager, project-manager, partner, super-admin, and sub-admin views exist. |
| Partner management | List partners, view details/proposals/applications, and mark inactive | Import/export are separate outstanding items. |
| General-manager emails | Draft campaigns, filter audiences, preview, test, schedule/publish, list, edit, and delete | Backend currently sends on publish even when a future scheduled date is selected. |
| Donation projects | Browse, view, create, edit, propose, withdraw/cancel, and duplicate | Proposed-donation approval routes are commented out in the active backend router. |
| Donations | Submit donation intention, view history/details, finance review, and receipt status | Payment instructions and finance-manager notification emails are TODO; frontend completion is simulated. |
| Donor management | List/search donors, view donation history, and edit active status/details | Finance-manager and inherited admin views exist. |
| Finance email workflow | Configure thank-you/follow-up/receipt templates and trigger email actions | Follow-up is manual; generated PDF receipt is not implemented. |
| Dashboards | Finance donation statistics/top-funded projects and role home pages | Values are computed, not manually configurable. Some analytics are still demo/placeholder values. |

## Important pending or partial work from the earlier requirements

| Feature or risk | Current finding |
| --- | --- |
| Volunteer attendance by volunteering day | No complete attendance UI/API flow found; application schema still notes missing date/time selection. |
| Volunteer and donor data export | Not implemented. |
| Partner data import | Open backend PR #145; not merged. |
| Donation payment instructions | QR/bank-account email and finance-manager notification are backend TODOs. |
| Receipt generation/download | Receipt metadata/email exists; PDF or file generation does not. |
| Proposed donation project approval | Permissions exist, but the relevant backend routes are commented out. |
| Recurring donations | A data model exists, but no confirmed end-to-end product flow was found; the original requirement awaited NPO confirmation. |
| Project proposal attachments/images | Frontend contains temporary placeholders pending storage/S3 integration. |
| Project-manager feature set | Some project and feedback screens exist, but edit/delete actions in the proposed-project manager page are explicitly not implemented. |
| Homepage manual number overrides | Not implemented; backend issues #90 and #99 remain open. |
| Currency consistency | Requirements say USD, but partner donation/contribution screens currently format amounts as SGD. |
| Donation success result | Frontend calls the API, then randomly simulates success/failure and creates a fake receipt ID. Remove this demo behavior before production. |
| Frontend authentication | `src/contexts/AuthContext.tsx` contains a temporary hard-coded token. Remove it before deployment. |
| JWT logout invalidation | Not implemented; keep backend issue #115 open. |

## GitHub issue audit

### Backend

| Issue | Finding | Recommended action |
| --- | --- | --- |
| [#142 Modify Donation Success Page](https://github.com/SiloamXperience-DG-AY2526/backend/issues/142) | Backend wording changed in merged backend PR #143 / commit `72750c7`. | Closed on 23 August 2026. Frontend issue #48 remains separate and open. |
| [#115 Secure expired JWTs](https://github.com/SiloamXperience-DG-AY2526/backend/issues/115) | Normal expiry validation exists, but logout does not revoke an otherwise valid token. | Keep open. |
| [#99 Edit donor homepage numbers](https://github.com/SiloamXperience-DG-AY2526/backend/issues/99) | No manual override implementation found. | Keep open. |
| [#90 Edit volunteer homepage numbers](https://github.com/SiloamXperience-DG-AY2526/backend/issues/90) | No manual override implementation found. | Keep open. |
| [#88 Import volunteer details](https://github.com/SiloamXperience-DG-AY2526/backend/issues/88) | Related implementation is in open PR #145. | Keep open and link PR #145. |
| [#87 Export volunteer details](https://github.com/SiloamXperience-DG-AY2526/backend/issues/87) | No export implementation found. | Keep open. |

### Frontend

| Issue | Finding | Recommended action |
| --- | --- | --- |
| [#58 Update password page](https://github.com/SiloamXperience-DG-AY2526/frontend/issues/58) | Implemented in merged frontend PR #57. | Closed on 23 August 2026. |
| [#51 Forgot Password Page](https://github.com/SiloamXperience-DG-AY2526/frontend/issues/51) | Implemented in merged frontend PR #57; earlier PR #52 was closed without merge. | Closed on 23 August 2026. |
| [#48 Modify Donation Success Page](https://github.com/SiloamXperience-DG-AY2526/frontend/issues/48) | Page still says “Donation Successful” and simulates success/failure. | Keep open. |
| [#47 Duplicate a project](https://github.com/SiloamXperience-DG-AY2526/frontend/issues/47) | Implemented in merged frontend PR #65. | Closed on 23 August 2026. |
| [#45 Inconsistent Donation and Donors view](https://github.com/SiloamXperience-DG-AY2526/frontend/issues/45) | Donor list still originates from partner records; no direct issue-closing evidence or end-to-end verification was found. | Keep open until tested with a donor who does not otherwise qualify as a partner. |
| [#42 Inconsistent status badge](https://github.com/SiloamXperience-DG-AY2526/frontend/issues/42) | Fixed changes from closed PR #46 were included in merged PR #55; shared status badges are now used. | Already closed when the authenticated issue list was refreshed. |
| [#41 Edit Donor button](https://github.com/SiloamXperience-DG-AY2526/frontend/issues/41) | Donor edit route, button navigation, form, and backend PATCH integration are on `main` via frontend PR #55 and backend PR #141. | Already closed when the authenticated issue list was refreshed. |
| [#40 Missing `Textarea` module](https://github.com/SiloamXperience-DG-AY2526/frontend/issues/40) | `src/components/ui/Textarea.tsx` exists and imports use matching casing. Fixes from PR #46 were included in merged PR #55. | Closed on 23 August 2026. |
| [#39 Project Edit/Delete buttons](https://github.com/SiloamXperience-DG-AY2526/frontend/issues/39) | Edit navigation and cancel confirmation/action are on `main` via merged PR #55. | Already closed when the authenticated issue list was refreshed. |
| [#37 Module casing from “apply here”](https://github.com/SiloamXperience-DG-AY2526/frontend/issues/37) | Current file/import casing is consistent, including deployment casing fixes in frontend PR #57. | Closed on 23 August 2026. |

## Open pull request

As of the audit, the only open PR across these repositories is [backend PR #145 — import data templates and script](https://github.com/SiloamXperience-DG-AY2526/backend/pull/145).

- Target: `main`
- Branch: `feat/import-data`
- Related tracker: [backend issue #88](https://github.com/SiloamXperience-DG-AY2526/backend/issues/88), updated with the PR and handover context on 23 August 2026
- Current decision needed: whether imported partner passwords are generated for forced first-login reset or partners create their own accounts and are matched to imported records
- Before merge: resolve review threads, document required/optional columns for every CSV, add tests, run the import against a disposable database, and replace the PR placeholder with `Fixes #88` if merging should close the issue

No frontend pull request was open at the time of the audit.

## Recommended next handover actions

1. Install dependencies in both repositories and run backend lint/tests/build plus frontend lint/build.
2. Smoke-test the previously closed finance-manager fixes in issues #39, #41, and #42 before deployment.
3. Link backend PR #145 from issue #88 and finish its open decisions before merging.
4. Remove the frontend hard-coded token and random donation result before deployment.
5. Finish frontend issue #48 and the brick-cost labels so the February donation wording is consistent end to end.
6. Prioritise import/export, receipt generation, payment instruction emails, manual homepage numbers, and deployment/storage work for the next team.
