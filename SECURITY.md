# Security Policy

## Reporting Security Issues

We take the security of Kizuna and your homelab infrastructure very seriously.

If you discover a security vulnerability, please do **NOT** open a public GitHub issue.

Please report security concerns responsibly by emailing:
**`mdmarufsarker.mms@gmail.com`**

Include:
1. Description of the vulnerability
2. Steps to reproduce
3. Potential impact

## Docker Socket Security Notice

Mounting `/var/run/docker.sock` provides root-equivalent privileges over the host. Kizuna only requires read access for container inspection and metadata queries:
- Always mount the Docker socket in **read-only** mode (`:ro`) in production unless container lifecycle actions (start/stop/restart) are explicitly desired.
