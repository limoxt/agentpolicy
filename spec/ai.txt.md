# ai.txt Specification — v1.0 (Draft)

## Overview

`ai.txt` is a plain-text companion to `agent-policy.json`. It is served from `/ai.txt` and follows conventions familiar to anyone who has read a `robots.txt` file.

`ai.txt` is NOT a replacement for `agent-policy.json`. When both files are present, `agent-policy.json` is authoritative.

## File Location

```
https://example.com/ai.txt
```

## Format

```
# ai.txt — AI Agent Access Policy
# Full machine-readable policy: /.well-known/agent-policy.json

AI-Agent: *
Read-Access: allowed
Form-Submission: disallowed
Data-Collection: disallowed
Purchase-Authority: disallowed
Rate-Limit: 30 requests/minute

Contact: policy@example.com
Last-Updated: 2025-01-01
```

## Directives

| Directive | Values | Description |
|-----------|--------|-------------|
| `AI-Agent` | `*` or agent name | Target agent (`*` = all) |
| `Read-Access` | `allowed` / `disallowed` / `conditional` | Content reading permission |
| `Form-Submission` | `allowed` / `disallowed` / `conditional` | Form interaction permission |
| `Data-Collection` | `allowed` / `disallowed` / `conditional` | Data extraction permission |
| `Purchase-Authority` | `allowed` / `disallowed` / `conditional` | Transaction permission |
| `Rate-Limit` | `N requests/minute` | Voluntary crawl rate guidance |
| `Contact` | email or URL | Policy contact |
| `Last-Updated` | ISO 8601 date | Last revision date |

## Multiple Agent Rules

```
AI-Agent: GPTBot
Read-Access: disallowed

AI-Agent: *
Read-Access: allowed
Rate-Limit: 20 requests/minute
```

Rules are evaluated top-to-bottom. The first matching `AI-Agent` block wins.

Lines beginning with `#` are comments and MUST be ignored by parsers.
