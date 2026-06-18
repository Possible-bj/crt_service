# Creator Card API — Assessment Implementation

This document describes the **Creator Card microservice** built for the Node.js Backend Engineer 2026 assessment. It follows the project template architecture documented in [documentation.md](../documentation.md).

For the original requirements and test cases, see [instruction.md](./instruction.md).

---

## Table of Contents

- [Overview](#overview)
- [Architecture & Data Flow](#architecture--data-flow)
- [Project Structure](#project-structure)
- [Data Model](#data-model)
- [API Endpoints](#api-endpoints)
- [Business Rules & Error Codes](#business-rules--error-codes)
- [Supporting Services](#supporting-services)
- [Response Serialization](#response-serialization)
- [Extensions Beyond the Spec](#extensions-beyond-the-spec)
- [Testing](#testing)
- [Deployment](#deployment)
- [Submission Checklist](#submission-checklist)

---

## Overview

The Creator Card API lets creators publish a shareable profile card with links and service rates. The implementation exposes three root-level REST endpoints (no versioning, no authentication):

| Method | Path | Purpose |
|--------|------|---------|
| `POST` | `/creator-cards` | Create a card after VSL validation and business-rule checks |
| `GET` | `/creator-cards/:slug` | Public retrieval with draft and private access controls |
| `DELETE` | `/creator-cards/:slug` | Soft-delete a card by slug |

All endpoints follow the template layering:

```
Client → Endpoint → Service → Repository → MongoDB
```

---

## Architecture & Data Flow

### Create flow

```
POST /creator-cards
  → endpoints/creator-cards/create.js
  → services/creator-cards/create.js
      1. VSL validate payload
      2. Default access_type to "public"
      3. validateAccessCode() — AC01, AC05
      4. executeSlugEngine() — auto-generate or enforce uniqueness (SL02)
      5. CreatorCards.create()
      6. serializeCreatorCard({ context: 'create' })
```

### Retrieve flow

```
GET /creator-cards/:slug?access_code=
  → endpoints/creator-cards/retrieve.js
  → services/creator-cards/retrieve.js
      1. CreatorCards.findOne({ slug })
      2. Apply access rules in order: NF01 → NF02 → AC03 → AC04
      3. serializeCreatorCard(card, { context: 'retrieve' }) — omits access_code
```

### Delete flow

```
DELETE /creator-cards/:slug
  Body: { creator_reference }
  Query (optional): ?access_code=
  → endpoints/creator-cards/delete.js
  → services/creator-cards/delete.js
      1. VSL validate creator_reference
      2. CreatorCards.findOne({ slug })
      3. NF01 if missing; CR02 if creator_reference mismatch
      4. AC03/AC04 for private cards (extension)
      5. Soft-delete via updateOne({ deleted: timestamp })
      6. serializeCreatorCard(card, { context: 'delete' })
```

Endpoints are registered in `app.js` under `./endpoints/creator-cards/`. Errors are formatted via `services/errors/custom-error.js` wired in both `app.js` and the test mock server.

---

## Project Structure

```
models/
  creator-cards.js              # MongoDB schema (ULID _id, unique slug, paranoid soft delete)

repository/
  creator-cards/
    index.js                    # Repository factory binding

services/creator-cards/
  create.js                     # Create service + VSL spec
  retrieve.js                   # Public retrieval + access rules
  delete.js                     # Soft delete + ownership checks
  slug-engine.js                # Slug normalization, auto-generation, uniqueness
  access-code.js                # Conditional access_code validation on create
  serialize-card.js             # _id → id mapping, context-aware access_code

endpoints/creator-cards/
  create.js                     # POST /creator-cards
  retrieve.js                   # GET /creator-cards/:slug
  delete.js                     # DELETE /creator-cards/:slug

messages/
  creator-cards.js              # Human-readable messages for all error/success codes

core/errors/
  constants.js                  # ERROR_CODE + HTTP status mapping (SL02, AC01, …)

test/creator-cards/
  create.test.js                # Test cases 1, 2, 3, 7–10
  retrieve.test.js              # Test cases 4, 5, 11–14
  delete.test.js                # Test cases 6, 15–16 + extensions 17–20
  fixtures/                     # Stub payloads per scenario
```

---

## Data Model

**Collection:** `creator_cards`  
**Identifier:** ULID stored as `_id`, always serialized as `id` in API responses.

| Field | Storage notes |
|-------|---------------|
| `slug` | Unique index; used as public lookup key |
| `creator_reference` | Exactly 20 characters; indexed |
| `access_type` | Defaults to `public` |
| `access_code` | Stored for private cards; never returned on retrieve |
| `deleted` | Soft-delete timestamp (ms); `null` when active |

The model uses `paranoid: true`, so soft-deleted records are excluded from `findOne` in production. The retrieve service also checks `deleted` explicitly for mock-model test compatibility.

---

## API Endpoints

### POST `/creator-cards`

**Validation:** VSL spec in `services/creator-cards/create.js` handles types, lengths, enums, and required fields (HTTP 400 on failure).

**Business logic after validation:**

| Rule | Implementation |
|------|----------------|
| `access_type` defaults to `public` | Set in create service when omitted |
| `access_code` required for private cards | `access-code.js` → `AC01` |
| `access_code` forbidden on public cards | `access-code.js` → `AC05` |
| Slug auto-generation from title | `slug-engine.js` |
| Client-provided slug must be unique | `slug-engine.js` → `SL02` |
| Alphanumeric 6-char access code | Validated in `access-code.js` |

**Success response:** HTTP 200 with `access_code` included (create/delete contexts only).

### GET `/creator-cards/:slug`

**Query parameter:** `access_code` (required for private cards).

**Access rules (evaluated in order):**

1. No card → `NF01` (404)
2. Card is draft → `NF02` (404)
3. Private, no `access_code` → `AC03` (403)
4. Private, wrong `access_code` → `AC04` (403)
5. Otherwise → HTTP 200; `access_code` omitted from response

### DELETE `/creator-cards/:slug`

**Request body:** `{ "creator_reference": "<20 chars>" }`  
**Query parameter (extension):** `access_code` — required when deleting a private card.

**Behavior:**

- Card not found → `NF01` (404)
- Wrong `creator_reference` → `CR02` (403) — extension
- Private card without/wrong `access_code` → `AC03` / `AC04` (403) — extension
- Success → HTTP 200 with deleted card (same shape as create, `deleted` set to timestamp)

---

## Business Rules & Error Codes

Required assessment codes (from `core/errors/constants.js` and `messages/creator-cards.js`):

| Code | HTTP | When |
|------|------|------|
| `SL02` | 400 | Client-provided slug already taken |
| `AC01` | 400 | Private card created without `access_code` |
| `AC05` | 400 | `access_code` set on a public card |
| `NF01` | 404 | Card not found (missing, deleted, or soft-deleted) |
| `NF02` | 404 | Card exists but status is `draft` |
| `AC03` | 403 | Private card viewed/deleted without `access_code` |
| `AC04` | 403 | Private card viewed/deleted with wrong `access_code` |

Code Extension
| Code | HTTP | When |
|------|------|------|
| `SL03` | 400 | When the API caller provides a slug with length < 5 filled with invalid characters
| `CR02` | 403 | Deleting a card with the wrong creator_reference

Field-level VSL failures return HTTP 400 with the framework's validation response (no custom code required).

---

## Supporting Services

### `slug-engine.js`

Implements the assessment slug rules:

1. Lowercase
2. Whitespace → hyphens
3. Strip disallowed characters
4. If omitted: generate from title; append `-<6 alnum>` when length &lt; 5 or slug is taken
5. If provided and taken: throw `SL02` (never silently modify)

### `access-code.js`

Enforces conditional `access_code` rules on create that VSL cannot express alone:

- Required when `access_type` is `private` (`AC01`)
- Forbidden when `access_type` is `public` (`AC05`)
- Must be exactly 6 alphanumeric characters

### `serialize-card.js`

Single serialization layer for all response contexts:

- Maps `_id` → `id`
- Normalizes `deleted` (`0` / missing → `null`)
- Includes `access_code` only for `create` and `delete` contexts
- Deep-copies `links` and `service_rates` to avoid leaking Mongoose internals

---

## Extensions Beyond the Spec

The assessment permits additional logic that does not conflict with required contracts. This implementation adds:

| Addition | Code | Rationale |
|----------|------|-----------|
| Invalid slug after normalization | `SL03` (400) | Rejects slugs that become &lt; 5 chars after stripping invalid characters |
| `creator_reference` check on delete | `CR02` (403) | Prevents deleting another creator's card |
| `access_code` required to delete private cards | `AC03` / `AC04` | Mirrors retrieve access control for destructive operations |
| Explicit `deleted` check in retrieve | `NF01` | Ensures deleted cards are not returned when mock stubs bypass paranoid filtering |
| Request completion logging | — | `onResponseEnd` hooks on all three endpoints |

---

## Testing

Integration tests use the template mock server (`core/mock-server`) with stubbed `CreatorCards` repository (`USE_MOCK_MODEL=1`).

```bash
yarn test
```

See [test/README.md](../test/README.md) for macOS vs Windows `package.json` script notes.

### Coverage map

| Test cases | File | Scenarios |
|------------|------|-----------|
| 1, 2, 3, 7, 8, 9, 10 | `test/creator-cards/create.test.js` | Full create, slug generation, private card, duplicate slug, access_code rules, VSL failure |
| 4, 5, 11, 12, 13, 14 | `test/creator-cards/retrieve.test.js` | Public/private retrieve, not found, draft, missing/wrong pin |
| 6, 15, 16, 17–20 | `test/creator-cards/delete.test.js` | Delete success, not found, deleted retrieve, creator_reference and access_code guards |

Test inventory is summarized in `test/index.js`.

---

## Deployment

- **Database:** MongoDB (Atlas or equivalent) via `MONGODB_URI`
- **Platform:** Heroku / Render (or similar)
- **Base URL:** Endpoints live at the root — `POST {BASE_URL}/creator-cards`, not `/v1/...` or `/api/...`
- **Auth:** None required

> Replace with your deployed base URL when submitting the assessment form.

---

## Submission Checklist

| Requirement | Status |
|-------------|--------|
| Template structure (services, endpoints, messages) | ✅ |
| MongoDB persistence with `_id` → `id` serialization | ✅ |
| Three root-level endpoints, no auth, no versioning | ✅ |
| VSL field validation → HTTP 400 | ✅ |
| Custom business error codes and HTTP statuses | ✅ |
| Drafts return NF02; access_code never in retrieve responses | ✅ |
| Delete returns deleted card; deleted cards return NF01 on GET | ✅ |
| Slug auto-generation and uniqueness | ✅ |
| Integration tests for assessment test cases | ✅ |
| Documented implementation (this file) | ✅ |

---

## Related Documentation

- [documentation.md](../documentation.md) — Full template architecture guide
- [instruction.md](./instruction.md) — Assessment requirements and official test cases
- [test/README.md](../test/README.md) — Running the test suite locally
