# Data Import Package (MVP)

This folder defines the CSV contract for organization-provided data and the first CLI importer behavior.

## Import Strategy

- Import mode: multi-file CSV package, one run.
- Failure mode: reject invalid rows, continue importing other rows.
- Execution mode: CLI script (no API upload yet).
- Run order:
  1. `users.csv`
  2. `partners.csv`
  3. `donation_projects.csv`
  4. `donation_project_objectives.csv`
  5. `donation_transactions.csv`
  6. `volunteer_projects.csv`
  7. `project_positions.csv`
  8. `project_skills.csv`
  9. `sessions.csv`
  10. `volunteer_project_objectives.csv`
  11. `volunteer_applications.csv`
  12. `volunteer_sessions.csv`

## File Formats

- Encoding: UTF-8
- Delimiter: comma `,`
- Header row required: yes
- Empty optional value: empty string
- Date format: ISO 8601 (`2026-03-21` or `2026-03-21T09:00:00Z`)
- Boolean values: `true` or `false` (case-insensitive)
- Multi-value list fields: pipe-separated (`value1|value2|value3`)

## Required vs Optional Rules

Required/optional status below follows DB constraints first (Prisma models), then API semantics.

Complete consolidated matrix is in `docs/data-import/field-matrix.csv`.

`field-matrix.csv` now includes both technical and collection policy columns:

- `prisma_requirement` (DB/model constraint)
- `org_requirement` (what we request from organization)
- `auto_generation_policy` + `default_value` (importer behavior when org leaves fields blank)

`prisma_requirement` values are now explicitly prefixed by enforcement source:

- `db_required`, `db_optional`, `db_optional_default` → enforced by DB/schema constraints
- `import_required`, `import_foreign_key`, `import_multi_value_relation`, `import_all_or_none_group` → enforced by importer logic

Optional policy override file remains in `docs/data-import/field-policy.csv` for quick policy experiments.

### `users.csv`

| Column         | Required      | Notes                                                 |
| -------------- | ------------- | ----------------------------------------------------- |
| external_id    | Yes           | Source key used by this import run to link child rows |
| first_name     | Yes           | Maps to `User.firstName`                              |
| last_name      | Yes           | Maps to `User.lastName`                               |
| email          | Yes           | Unique natural key in DB                              |
| password_plain | Conditionally | Required if `password_hash` empty                     |
| password_hash  | Conditionally | Required if `password_plain` empty                    |
| title          | No            | Optional                                              |
| role           | No            | Defaults to `partner`                                 |
| is_active      | No            | Defaults to `true`                                    |

### `partners.csv`

| Column                         | Required | Notes                                                                                                                                              |
| ------------------------------ | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| external_id                    | Yes      | Partner source key                                                                                                                                 |
| user_external_id               | Yes      | Must reference `users.csv.external_id`                                                                                                             |
| dob                            | No       | ISO date                                                                                                                                           |
| country_code                   | Yes      | `Partner.countryCode`                                                                                                                              |
| contact_number                 | Yes      | `Partner.contactNumber`                                                                                                                            |
| emergency_country_code         | Yes      | DB-required                                                                                                                                        |
| emergency_contact_number       | Yes      | DB-required                                                                                                                                        |
| identification_number          | Yes      | DB-required                                                                                                                                        |
| nationality                    | Yes      | DB-required                                                                                                                                        |
| occupation                     | Yes      | DB-required                                                                                                                                        |
| gender                         | Yes      | Enum: `male`, `female`, `others`                                                                                                                   |
| residential_address            | No       | Optional                                                                                                                                           |
| other_interests                | No       | Optional                                                                                                                                           |
| other_referrers                | No       | Optional                                                                                                                                           |
| other_contact_modes            | No       | Optional                                                                                                                                           |
| has_volunteer_experience       | No       | Defaults `false`                                                                                                                                   |
| volunteer_availability         | Yes      | DB-required                                                                                                                                        |
| consent_updates_communications | Yes      | DB-required                                                                                                                                        |
| subscribe_newsletter_events    | No       | Defaults `false`                                                                                                                                   |
| skills                         | No       | Pipe-separated strings                                                                                                                             |
| languages                      | No       | Pipe-separated strings                                                                                                                             |
| contact_modes                  | No       | Enum list: `email`, `whatsapp`, `telegram`, `messenger`, `phoneCall`                                                                               |
| interests                      | No       | Enum list: `fundraise`, `planTrips`, `missionTrips`, `longTerm`, `admin`, `publicity`, `teaching`, `training`, `agriculture`, `building`, `others` |
| referrers                      | No       | Enum list: `friend`, `socialMedia`, `church`, `website`, `event`, `other`                                                                          |
| trip_full_name                 | No       | If set, trip fields must be complete                                                                                                               |
| trip_passport_number           | No       | If set, trip fields must be complete                                                                                                               |
| trip_passport_expiry           | No       | If set, trip fields must be complete                                                                                                               |
| trip_health_declaration        | No       | Optional                                                                                                                                           |

## Stage status

Implemented stages:

- `users.csv`
- `partners.csv`
- `donation_projects.csv`
- `donation_project_objectives.csv`
- `donation_transactions.csv`

All listed stages are implemented and executed by the CLI importer.

## Row Rejection Contract

Every rejected row produces:

- `stage`: logical import stage (`users`, `partners`, ...)
- `rowNumber`: CSV row number (header is row 1)
- `externalId`: if provided
- `field`: column causing failure
- `code`: machine-friendly code (`MISSING_REQUIRED`, `INVALID_ENUM`, ...)
- `message`: human-readable reason

## How to Run

From backend root:

- Dry run: `npm run import:data -- --dir docs/data-import/templates --dry-run`
- Live run: `npm run import:data -- --dir docs/data-import/templates`

The script writes a report file to `docs/data-import/reports/`.
