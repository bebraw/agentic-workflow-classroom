# Feature: Worker Runtime Shell

## Blueprint

### Context

This project needs a concrete runnable Worker shell so contributors can start the classroom app locally and exercise the existing quality-gate tools against a real surface instead of empty scaffolding.

### Architecture

- **Entry points:** `wrangler dev` via `src/worker.ts`
- **Source layout:** `src/worker.ts` routes requests, `src/api/` holds API handlers, and `src/views/` holds HTML rendering modules.
- **Styling pipeline:** `src/tailwind-input.css` compiles to `.generated/styles.css`, which the Worker serves at `/styles.css`.
- **Root UI contract:** `src/views/home.ts` renders the current classroom demo. Feature-level behavior lives in `specs/agentic-workflow-classroom/spec.md`.
- **Data models:** None yet. The stub is stateless.
- **Dependencies:** Wrangler provides the Worker runtime; Playwright and Vitest verify the behavior.

### Anti-Patterns

- Do not let the project drift back into an untestable empty shell with no runnable app surface.
- Do not add feature-specific persistence or auth behavior to the runtime shell without updating this spec and the relevant ADRs.
- Do not collapse API handling and rendered views back into one file as the app evolves.
- Do not move app styles back into large inline `<style>` blocks.

## Contract

### Definition of Done

- [ ] The app starts locally through Wrangler without extra scaffolding.
- [ ] The root route returns the current classroom demo HTML.
- [ ] The health route returns stable JSON for smoke tests and tooling.
- [ ] The spec is updated in the same change set.
- [ ] Automated tests cover the critical behavior.

### Regression Guardrails

- `GET /` must keep returning HTML with a recognizable classroom demo heading.
- `GET /styles.css` must keep returning the generated stylesheet.
- `GET /api/health` must keep returning HTTP 200 JSON with `ok: true`.
- Unknown routes must return HTTP 404.

### Verification

- **Automated tests:** colocated Vitest files under `src/**/*.test.ts` for module behavior and colocated Playwright files under `src/**/*.e2e.ts` for the browser-visible flow.
- **Coverage target:** Keep the `src/worker.ts`, `src/api/**`, and `src/views/**` branches, lines, functions, and statements above the repo coverage thresholds.

### Scenarios

**Scenario: Lecturer opens the classroom app**

- Given: the Worker is running locally
- When: the lecturer visits `/`
- Then: they see the classroom demo surface

**Scenario: Tooling checks app health**

- Given: the Worker is running locally
- When: a tool requests `/api/health`
- Then: it receives a stable JSON response with `ok: true`

**Scenario: Browser requests app stylesheet**

- Given: the Worker is running locally
- When: the browser requests `/styles.css`
- Then: it receives the generated Tailwind stylesheet through the same local runtime path used by the browser tests

**Scenario: Unknown route**

- Given: the Worker is running locally
- When: a request hits an undefined route
- Then: the Worker returns HTTP 404
