# Security Policy

## Supported versions

| Version | Supported |
| --- | --- |
| 1.x | ✅ |
| < 1.0 | ❌ |

## Reporting a vulnerability

Please **do not** open a public issue for security-sensitive reports. Use GitHub's **private security advisory** flow:

1. Open the repository's **Security** tab.
2. Choose **Report a vulnerability**.
3. Include reproduction steps, impact, affected version / commit, and any suggested fix.

You can expect an initial acknowledgement within 72 hours. Please allow time for a fix and coordinated disclosure before publishing details.

## Security model & deployment notes

SynapsePipe is designed as a **single-user, local-first** application:

- There is **no built-in authentication or authorization**. Do not expose it directly to the public internet.
- For remote access, put it behind a reverse proxy with authentication (or a trusted VPN / LAN) and terminate TLS there.
- API keys are encrypted at rest using AES-256-GCM with a key derived from `SYNAPSE_SECRET` or the generated `data/.secret`. The decrypted key is only used server-side when calling the user-configured provider.
- The configured LLM base URL is user-controlled. A malicious or compromised provider can read prompts sent to it; only use providers you trust.
- Uploaded files are validated by MIME type and extension (max 30 MB), stored under `data/uploads/`, and served via a controlled route. Filenames are random UUIDs.
- Asset download endpoints proxy user-provided URLs. If you run SynapsePipe on a shared network, treat external asset URLs as untrusted input.
- Back up `data/` including `data/.secret`. If the secret is lost, previously stored API keys cannot be decrypted; enter the key again in Settings.

## Dependency hygiene

- `npm audit` and Dependabot alerts are enabled for the repository.
- Keep `next`, `better-sqlite3`, and Radix packages current with security releases.
- The Docker image runs as a non-root user and stores persistent state in `/app/data`.
