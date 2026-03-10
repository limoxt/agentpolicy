# agent-policy.json Specification — v1.0 (Draft)

## Overview

`agent-policy.json` is a structured, machine-readable file that declares how AI agents are permitted to interact with a website. It is served from the well-known URI `/.well-known/agent-policy.json` and is intended to be fetched by compliant AI agents before initiating any interaction.

## File Location

```
https://example.com/.well-known/agent-policy.json
```

Servers MUST respond with `Content-Type: application/json`.

## Schema

```json
{
  "version": "1.0",
  "read_access": "allowed | disallowed | conditional",
  "form_submission": "allowed | disallowed | conditional",
  "data_collection": "allowed | disallowed | conditional",
  "purchase_authority": "allowed | disallowed | conditional",
  "rate_limit": {
    "requests_per_minute": 30,
    "requests_per_day": 1000,
    "crawl_delay_seconds": 2
  },
  "contact": "policy@example.com",
  "last_updated": "2025-01-01"
}
```

## Field Semantics

### `version` (required)
String. MUST be `"1.0"` for this revision of the spec.

### `read_access`
Controls whether an AI agent may read, parse, or extract content from pages.

| Value | Meaning |
|-------|---------|
| `allowed` | Agent may freely read public content |
| `disallowed` | Agent MUST NOT index or extract content |
| `conditional` | Agent may read subject to `read_access_conditions` |

### `form_submission`
Controls whether an AI agent may autonomously submit forms (search, contact, checkout, login).

### `data_collection`
Controls whether an AI agent may extract, store, or process personal data encountered on the site.

### `purchase_authority`
Controls whether an AI agent may initiate or complete financial transactions on behalf of a user.

### `rate_limit`
Voluntary rate-limit guidance. Compliant agents SHOULD respect these values.

- `requests_per_minute` — maximum requests per agent per minute
- `requests_per_day` — maximum requests per agent per day
- `crawl_delay_seconds` — minimum pause between consecutive requests

### `contact`
Email address or URL for policy questions.

### `last_updated`
ISO 8601 date string indicating when the policy was last revised.

## `conditional` modifier

When a field is set to `conditional`, include a sibling `_conditions` key:

```json
{
  "form_submission": "conditional",
  "form_submission_conditions": "Search and contact forms only. No checkout or account creation."
}
```

## Compliance

This spec uses RFC 2119 key words: MUST, MUST NOT, SHOULD, MAY.

Agents that cannot retrieve `agent-policy.json` (network error, 404) SHOULD apply conservative defaults: `read_access: allowed`, all other fields `disallowed`.

## Versioning

Minor versions (`1.1`, `1.2`) for additive changes. Major versions (`2.0`) for breaking changes.
