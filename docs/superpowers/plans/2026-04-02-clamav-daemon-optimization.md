# ClamAV Daemon Optimization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transition virus scanning from slow binary execution to high-performance daemon streaming to reduce scan times from ~10s to <500ms.

**Architecture:** Use the `clamscan` npm package to stream file buffers over TCP to a running ClamAV daemon (`clamd`).

**Tech Stack:** Node.js, `clamscan` library, ClamAV Daemon.

---

### Task 1: Configuration and Dependency

**Files:**
- Modify: `.env`
- Modify: `package.json`

- [ ] **Step 1: Install `clamscan` package**
Run: `npm install clamscan`
Expected: Package added to dependencies.

- [ ] **Step 2: Update `.env` with ClamAV settings**
Add host, port, and timeout settings.

- [ ] **Step 3: Commit**
```bash
git add package.json package-lock.json
git commit -m "chore: add clamscan dependency"
```

---

### Task 2: Implement ClamAV Daemon Scanner

**Files:**
- Modify: `src/modules/chat/infrasctructure/virus_scanner/clamav_scanner.ts`

- [ ] **Step 1: Rewrite ClamAVScanner to use the daemon**
Implement lazy initialization and stream-based scanning using the `clamscan` library. Remove the old `exec` and temporary file logic.

- [ ] **Step 2: Commit**
```bash
git add src/modules/chat/infrasctructure/virus_scanner/clamav_scanner.ts
git commit -m "feat: implement high-performance ClamAV daemon scanner"
```

---

### Task 3: Update and Verify Tests

**Files:**
- Modify: `__tests__/chat/infrastructure/virus_scanner/clamav_scanner.spec.ts`

- [ ] **Step 1: Update tests to mock `clamscan` library**
Ensure tests verify the stream-based scanning and correct handling of results.

- [ ] **Step 2: Run tests**
Run: `npm run build && npx jest __tests__/chat/infrastructure/virus_scanner/clamav_scanner.spec.ts`
Expected: All tests pass.

- [ ] **Step 3: Commit**
```bash
git add __tests__/chat/infrastructure/virus_scanner/clamav_scanner.spec.ts
git commit -m "test: update clamav scanner tests for daemon integration"
```
