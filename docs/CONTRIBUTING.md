# Contributing to Kizuna (絆)

Thank you for your interest in contributing to Kizuna! We welcome contributions from homelabbers, developers, and designers around the world.

---

## 🛠️ Development Setup

### Prerequisites
- **Go 1.23+**
- **Node.js 22+ & pnpm** (`corepack enable`)
- **Docker** (optional, for socket driver testing)

### Quick Start
```bash
# Clone the repository
git clone https://github.com/blackstart-labs/kizuna.git
cd kizuna

# Install frontend dependencies
cd web && pnpm install && cd ..

# Run backend in development with hot reload
make dev-backend

# Run frontend in development
make dev-frontend
```

---

## 🧪 Testing & Code Quality

Before opening a pull request, ensure all tests pass:

```bash
# Run unit tests with race detection
make test

# Build single static binary
make build
```

---

## 🌐 Contributing Documentation & Translations

We strive to make Kizuna accessible to operators worldwide.
- Documentation lives in the `docs/` directory.
- User Manual translations live in [`docs/i18n/`](docs/i18n/README.md).
- To add a new language, see the [i18n Guide](docs/i18n/README.md).

---

## 📋 Pull Request Guidelines

1. Use semantic commit messages (`feat:`, `fix:`, `docs:`, `refactor:`, `test:`).
2. Never prefix branches with internal phase numbers (e.g. use `feat/my-feature` or `fix/issue-description`).
3. Ensure single-binary builds remain under `< 25 MB` with zero CGO dependencies.
