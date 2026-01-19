---
trigger: always_on
---

# hydric Gateway API: Git & Version Control Protocol

## 1. Branch Protection & Authority

The `main` branch is the source of truth for the production API.

- **No Direct Commits:** You are strictly prohibited from committing or pushing directly to the `main` branch without explicit, per-instance confirmation from the user.
- **Feature Branching:** Always propose creating a new feature branch (e.g., `feat/api-auth` or `fix/indexer-lag`) for significant changes.

## 2. Irreversible Operations (The "Red Line" Rule)

Safety is paramount. Any operation that modifies the Git history or risks data loss requires a manual override.

- **Explicit Consent Required:** You must ask for permission before executing any of the following:
  - `git push --force` or `--force-with-lease`.
  - `git reset --hard`.
  - `git rebase`.
  - Deleting local or remote branches.
  - `git clean -fd` (Removing untracked files).

## 3. Commit Standards (Atomic & Descriptive)

To ensure the project history is readable and easy to debug:

- **Atomic Commits:** Each commit should represent a single logical change. Do not bundle unrelated fixes and features into one commit.
- **Conventional Commits:** Use the following prefix format for all commit messages:
  - `feat:` (new feature)
  - `fix:` (bug fix)
  - `refactor:` (code change that neither fixes a bug nor adds a feature)
  - `docs:` (documentation changes)
  - `chore:` (updating build tasks, package dependencies, etc.)
- **Imperative Mood:** Write commit messages in the imperative (e.g., `feat: add Unkey authentication` instead of `feat: added Unkey authentication`).

## 4. Pre-Commit Verification

Before proposing a commit or push, you must:

1. **Self-Review:** Ensure no "dead code," logs, or secrets (API keys) are included in the staged changes.
2. **Consistency Check:** Verify that all new files follow the **1:1 Mapping** and **Interface Naming** rules established in the Coding Rules.
