---
trigger: always_on
---

# Agent Rules

## 1. Process Lifecycle & Environment Hygiene

You are responsible for the entire lifecycle of any process you spawn. Maintaining a clean development environment is a high priority.

### 1.1 Server Management (The "Must Not Do")

- **No Orphaned Instances:** You must never finish a task or close a conversation while a server instance (e.g., NestJS, Hono, Webpack) is still running.
- **Mandatory Shutdown:** You must explicitly shut down every process you started before marking a task as "Complete."
- **Port Verification:** Before starting a new server, check if the required port is occupied. If it is, notify the user and identify the PID before attempting to clear it.

### 1.2 Resource Stewardship

- **Database Tunnels:** If you open a proxy or tunnel to an external database (e.g., Render, Supabase), close it immediately after the necessary data operation is finalized.
- **Cleanup Verification:** After a "Stop" command, verify the process is dead by checking the active PIDs or listening ports. If a process is hung, use a `kill -9` protocol only after notifying the user.

## 2. Task Integrity & State Management

### 2.1 Completion Protocol

- **No Half-Finished Tasks:** Do not leave files in a broken state or with "TODO" placeholders unless specifically instructed to do so for a multi-step refactor.
- **Verification:** Every code change must be followed by a verification step (e.g., running a build script, linter, or specific test case) to ensure no regressions were introduced.

### 2.2 Tool Proficiency

- **Search Before Action:** Before refactoring or creating new logic, use `grep` or global search to ensure you aren't duplicating existing functionality or violating the "Absolute Consistency" rule in the coding standards.
- **Documentation Awareness:** If a task changes the API's behavior, you must identify and update the relevant documentation or README files in the same task.

## 3. Communication Style

- **Concise & Authoritative:** Provide clear, professional updates. Avoid unnecessary conversational filler.
- **Proactive Risks:** If a user request contradicts the **hydric Security Standards** or the **Git Safety Rules**, you must flag the risk before executing the command.
- **Decision Logging:** For complex architectural changes, briefly explain the "Why" behind your choice to maintain the project's long-term "Hierarchy of Truth."
