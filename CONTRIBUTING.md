# Contributing to Kizuna

Thank you for your interest in contributing to **Kizuna**!

## Development Guidelines

1. **Keep it Lightweight**: Every new dependency must justify its existence. Avoid bloated third-party packages.
2. **Conventional Commits**: Format commit messages using Conventional Commits:
   - `feat: add Proxmox VE driver`
   - `fix: resolve container memory calculation overflow`
   - `docs: update deployment compose snippet`
   - `test: add incident correlation table tests`
3. **Test Everything**: Run `make test` before opening pull requests.

## Workflow

1. Fork the repository.
2. Create your feature branch (`git checkout -b feat/my-new-feature`).
3. Commit your changes (`git commit -am 'feat: add my feature'`).
4. Push to the branch (`git push origin feat/my-new-feature`).
5. Open a Pull Request.
