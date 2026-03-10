# agentpolicy

**The AI Agent Access Control Standard**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Contributors Welcome](https://img.shields.io/badge/contributions-welcome-brightgreen.svg)](CONTRIBUTING.md)
[![Status: Draft](https://img.shields.io/badge/status-draft-orange.svg)]()

> Define what AI agents are allowed to do on your site — before they do it.

**🛠 Generator + Scanner → [agentpolicy.vercel.app](https://agentpolicy.vercel.app)**

---

## The Problem

AI agents — crawlers, shopping bots, voice assistants, autonomous research tools — interact with websites in ways `robots.txt` was never designed to govern. They submit forms, extract PII, initiate purchases, and operate at machine speed. Site operators have no standard way to express intent, and agents have no standard way to ask for permission.

`agent-policy.json` and `ai.txt` fill that gap: a machine-readable contract between operators and AI systems, designed for the agentic web.

---

## Two Complementary Formats

| Format | Location | Purpose |
|--------|----------|---------|
| `agent-policy.json` | `/.well-known/agent-policy.json` | Structured, machine-readable policy with granular per-capability controls |
| `ai.txt` | `/ai.txt` | Human-readable plain-text summary; mirrors `robots.txt` conventions |

**Use both.** `agent-policy.json` is the authoritative source. `ai.txt` is the human-scannable companion.

---

## Quick Start

### Option 1 — Generate automatically

Visit **[agentpolicy.vercel.app](https://agentpolicy.vercel.app)**, enter your URL and industry, and download a ready-made `agent-policy.json` + `ai.txt` pair in seconds.

### Option 2 — Write manually

Create `/.well-known/agent-policy.json` on your server:

```json
{
  "version": "1.0",
  "read_access": "allowed",
  "form_submission": "disallowed",
  "data_collection": "disallowed",
  "purchase_authority": "disallowed",
  "rate_limit": { "requests_per_minute": 30 }
}
```

---

## Field Reference

| Field | Type | Values | Description |
|-------|------|--------|-------------|
| `version` | string | `"1.0"` | Spec version (required) |
| `read_access` | string | `allowed` \| `disallowed` \| `conditional` | Whether agents may read page content |
| `form_submission` | string | `allowed` \| `disallowed` \| `conditional` | Whether agents may submit forms |
| `data_collection` | string | `allowed` \| `disallowed` \| `conditional` | Whether agents may extract or store user data |
| `purchase_authority` | string | `allowed` \| `disallowed` \| `conditional` | Whether agents may initiate or complete purchases |
| `rate_limit` | object | — | Request frequency controls (`requests_per_minute`, `requests_per_day`, `crawl_delay_seconds`) |
| `contact` | string | email or URL | Policy contact |
| `last_updated` | string | ISO 8601 | When this policy was last revised |

When a field is `conditional`, add a sibling `_conditions` key with a plain-text explanation:

```json
{
  "form_submission": "conditional",
  "form_submission_conditions": "Search forms only. Checkout and account creation are disallowed."
}
```

---

## Industry Examples

See [`examples/`](examples/) for ready-to-use configurations:

| Industry | File |
|----------|------|
| E-commerce | [examples/ecommerce/agent-policy.json](examples/ecommerce/agent-policy.json) |
| SaaS | [examples/saas/agent-policy.json](examples/saas/agent-policy.json) |
| Healthcare | [examples/healthcare/agent-policy.json](examples/healthcare/agent-policy.json) |
| Media / Publishing | [examples/media/agent-policy.json](examples/media/agent-policy.json) |

---

## Spec

Full format specifications:

- [`spec/agent-policy.json.md`](spec/agent-policy.json.md) — JSON format, field semantics, compliance rules
- [`spec/ai.txt.md`](spec/ai.txt.md) — Plain-text companion format

---

## Roadmap

- [x] v1.0 core field set
- [x] Generator + scanner at [agentpolicy.vercel.app](https://agentpolicy.vercel.app)
- [x] Industry presets (e-commerce, SaaS, healthcare, media, finance)
- [ ] JSON Schema for validation tooling
- [ ] CLI validator: `npx check-agent-policy https://example.com`
- [ ] Per-path policy overrides (`path_overrides`)
- [ ] Agent identity assertions (`agent_allowlist`, `agent_blocklist`)
- [ ] Cryptographic signing support

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). Open an issue to discuss spec changes before submitting a PR.

---

## License

MIT — see [LICENSE](LICENSE).
