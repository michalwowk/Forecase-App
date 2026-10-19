---
name: change
description: Drive one change end to end — intent, spec, plan, build, verify, close — with human approval between artifacts. Use for any non-trivial work in this repo, or to resume an open change.
argument-hint: <slug> | <NNNN-slug>
---

# /change

One change = one folder in `docs/changes/NNNN-slug/` + one branch `change/NNNN-slug`.
Human approves every artifact. You never skip a gate.

## 0. Start or resume

- Folder exists for the slug → resume at the first step not marked approved.
- Approval is tracked in each file's front line: `Status: draft | approved`.
- New change:
  - Next number = highest `NNNN` in `docs/changes/` + 1, zero-padded.
  - Copy `docs/changes/_template/` to `docs/changes/NNNN-slug/`.
  - Create branch `change/NNNN-slug` from `main`.
  - In `docs/plan.md`: add or update the row, status `doing`.

## 1. Intent

- Ask questions in small sets (max 4), wait for answers, repeat until the problem, outcome and constraints are clear.
- Number each question and recommend an answer, in the `grilling` format (❓ Q1 … ➡️ …). Don't ask what the code or docs already answer.
- Write `intent.md` in the user's terms. Short.
- **STOP.** Ask for approval. On approval set `Status: approved`.

## 2. Spec

- Read approved intent, `docs/product/*`, relevant `docs/research/*`.
- Grill with the `grilling` skill: edge cases, failure modes, what we leave out.
- Write `spec.md`: requirements, behaviour, interface shape, acceptance criteria (checkable).
- **STOP.** Approval → `Status: approved`.

## 3. Plan

- Open technical choices (libraries, structure, trade-offs) → grill with `grilling` first. None → skip.
- Write `plan.md`: files to touch, order of work, risks, tests that prove it.
- **STOP.** Approval → `Status: approved`.

## 4. Build

- Follow the plan. Small commits, message `<type>(NNNN): <what>`.
- Every commit needs the user's explicit approval. Show files + message, wait.
- Divergence → update `plan.md` in the same commit, note why.
- New business/product call → ask, then log in `docs/product/decisions.md`.

## 5. Verify

- Run tests, lint, typecheck (whatever exists).
- Launch the `verifier` subagent with the change folder path.
- Show the user its findings. Fix only what the user agrees to.

## 6. Close

- `plan.md` matches what was built.
- Decisions made in this change are in `decisions.md`, linked to the change.
- Append a `docs/worklog.md` entry: what was done, how, what went wrong, what was cut and why.
- `docs/plan.md`: status `done` (or `cut` + one-line reason).
- Update `README.md` if run steps, assumptions or the repo map changed.
- PR body follows `.github/pull_request_template.md`. Fill only what applies; keep it short.
- Ask before commit. Ask before push. Ask before opening the PR. Never merge.

## Style

- English. Short sentences. Bullets. Each section ≤ 5 bullets where possible.
