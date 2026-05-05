# Feature: Agentic Workflow Classroom

## Blueprint

### Context

The app teaches agentic workflow basics to students who do not yet know the topic. It intentionally avoids the free-form complexity of a workflow studio and instead borrows the classroom structure from the French cheese shop requirements demo: one concrete request, staged reveals, lecturer prompts, and visible student activity choices.

### Architecture

- **Entry points:** `GET /` renders the classroom demo from `src/views/home.ts`. `GET /api/session?room=...&lecturerToken=...` returns shared room state and lecturer access status. `POST /api/session?room=...` accepts lecturer claim, release, reveal, reset commands and student activity votes. `GET /styles.css` serves the generated Tailwind stylesheet. `GET /api/health` remains available for smoke tests and tooling.
- **Teaching model:** The demo progresses through `Baseline`, `Step 1`, `Step 2`, `Step 3`, and `Step 4`.
- **Concept order:** The steps introduce request ambiguity, agent roles, workflow sequencing and parallelism, handoff packets, and evaluation.
- **State model:** Room state is in-memory Worker state keyed by room id. It is suitable for local classroom rehearsal and short demos, but it is not durable storage. Lecturer claims use a local browser token stored in `localStorage`. No account, remote AI call, KV, Durable Object, or secret is required.
- **Role model:** `role=lecturer` exposes controls for claiming and releasing room control. Only the lecturer device holding the claim can reveal steps, select active steps, or reset the room. `role=student` hides lecturer controls, lecturer-only teaching notes, and the lecturer view switcher while the room is claimed, shows only revealed steps, and lets students contribute activity votes.
- **Voting model:** Student activity options follow the French cheese shop demo pattern for the active lesson step: each student browser keeps one local vote in the current step's activity group, switching choices removes the previous vote for that step, pressing the same choice again removes that vote, visible counts update for the room, and the leading option for the current step becomes the group choice.
- **Visual model:** Wider screens use a three-column classroom layout: lesson path on the left, workflow board in the middle, and pedagogy lens on the right. Smaller screens stack the same sections.
- **Domain anchor:** The visible classroom request is a 45-minute beginner AI workshop plan because it naturally exposes clarification, resource research, activity design, handoffs, and evaluation.

### Anti-Patterns

- Do not turn the first-run classroom demo into a free-form workflow editor.
- Do not require students to create agents before they can understand the staged example.
- Do not present the deterministic classroom trace as a live model call.
- Do not hide agent inputs, outputs, or handoff packets behind abstract labels.
- Do not treat lecturer/student role separation as security. It is classroom scaffolding, not authentication.
- Do not add remote services, accounts, or durable persistence to the teaching path without a new spec and ADR.

## Contract

### Definition of Done

- [ ] `GET /` opens with the classroom title and the beginner AI workshop planning request.
- [ ] `GET /` exposes a progressive `Reveal next step` control.
- [ ] `GET /` supports lecturer and student URLs through `role=lecturer` and `role=student`.
- [ ] Baseline is visible by default while later steps are hidden until revealed.
- [ ] Lecturer browsers can claim an unclaimed room.
- [ ] A claimed room blocks other lecturer devices from reveal/reset controls until the claim is released.
- [ ] The claiming lecturer can release the room claim.
- [ ] The claiming lecturer can reset the room while keeping the room claimed.
- [ ] Student browsers hide lecturer reveal/reset controls.
- [ ] Student browsers hide lecturer-only teaching notes such as room prompts, notice notes, timeboxes, and the pedagogy lens.
- [ ] Student browsers hide the lecturer view option while the room is claimed.
- [ ] Student browsers see later steps only after the lecturer reveals them for the shared room.
- [ ] Each step includes a learning goal, a room question, a notice prompt, and a timebox.
- [ ] The workflow board shows named agents with explicit jobs, inputs, and outputs.
- [ ] The workflow board shows time-slot actions where two `T2` actions demonstrate parallel work.
- [ ] The workflow board shows a handoff packet for every action.
- [ ] The trace view distinguishes input packet, agent transform, and output packet.
- [ ] Student activity choices let the lecturer turn class input into a visible workflow discussion.
- [ ] Student activity choices post room-level votes that other joined browsers can see.
- [ ] Student activity choices match the active lesson step instead of showing future-step concepts early.
- [ ] Student activity voting lets a browser switch or remove its vote without inflating counts.
- [ ] The pedagogy lens keeps the lesson concrete and warns against hidden model magic.
- [ ] Automated tests cover page rendering, health response, and step reveal behavior.

### Regression Guardrails

- The app must stay usable without external accounts or remote AI calls.
- Room state may be in-memory and non-durable, but that limitation must stay visible in docs until a Durable Object or other persistent room model is intentionally added.
- Lecturer claim tokens are classroom coordination, not a security boundary.
- Lecturer controls must stay hidden from student URLs.
- Lecturer-only teaching notes must stay hidden from student URLs.
- The lecturer view option must stay hidden from student URLs while another device holds the room claim.
- Reveal, step selection, reset, and release commands must require the current room claim token.
- The first screen must not require students to understand a builder UI before seeing the staged example.
- Later steps must stay hidden until the lecturer reveals them.
- Every agent card should continue to show an input and output, not only a name.
- Parallelism must remain visible through shared time slots rather than only explanatory prose.
- Handoff packet labels must stay visible in the main workflow board.
- The activity choices should remain optional classroom prompts, not a second hidden source of workflow state.
- The activity choices should be scoped to the active step so students vote on the concept currently being taught.
- Student votes should stay visible as group activity, not as private per-browser state.
- Student vote controls should show vote counts, preserve each browser's local vote for each step, clear stale local votes after shared reset, and derive the group choice from the leading room count for the active step.
- The classroom surface should not create page-level horizontal scrolling on phone-sized viewports; wide workflow tables should scroll inside their own container.
- Agent cards should not allow headings or body copy to overflow their card boundaries on common desktop classroom projector widths.
- The health endpoint should remain stable for smoke tests.

### Verification

- **Unit tests:** `src/views/home.test.ts` and `src/worker.test.ts`
- **Browser tests:** `src/worker.e2e.ts`
- **Baseline gate:** `npm run quality:gate`
- **Local workflow:** `npm run ci:local`

### Scenarios

**Scenario: Lecturer starts the demo**

- Given: the class opens the app
- When: the page loads
- Then: students see the classroom title, the concrete beginner AI workshop request, and only the baseline step

**Scenario: Lecturer reveals agent roles**

- Given: the baseline is visible
- When: the lecturer claims the room and presses `Reveal next step`
- Then: Step 1 becomes visible and active, and the teaching panel explains why agents need distinct jobs

**Scenario: Lecturer releases a room claim**

- Given: a lecturer has claimed the room
- When: the lecturer releases the room
- Then: the room keeps its current teaching state and another lecturer device can claim controls

**Scenario: Lecturer resets a claimed room**

- Given: a lecturer has claimed the room and revealed later steps
- When: the lecturer resets the room
- Then: revealed steps and activity votes return to baseline while the same lecturer keeps room control

**Scenario: Second lecturer joins a claimed room**

- Given: one lecturer device has claimed the room
- When: another lecturer opens the same room
- Then: the second lecturer sees that the room is claimed and cannot reveal, reset, or release controls

**Scenario: Student joins a controlled room**

- Given: the lecturer and a student open the same room id
- When: the student opens the app with `role=student`
- Then: the student cannot see reveal/reset controls, lecturer-only teaching notes, or the lecturer view option while the room is claimed, and only sees steps the lecturer has revealed

**Scenario: Lecturer reveals content to students**

- Given: the lecturer and a student are in the same room
- When: the lecturer reveals Step 1
- Then: the student browser receives the shared room state and Step 1 becomes visible

**Scenario: Lecturer demonstrates parallel work**

- Given: workflow steps have been revealed
- When: the class inspects the workflow board
- Then: two actions share `T2`, showing that resource research and activity design can run in parallel after clarification

**Scenario: Lecturer discusses handoffs**

- Given: the workflow board is visible
- When: the lecturer asks what packet would break downstream work if missing
- Then: students can point to the handoff packet column and connect packet quality to workflow quality

**Scenario: Students choose an improvement**

- Given: the student activity panel is visible
- When: a student selects one activity choice for the active step
- Then: the room vote count updates and the leading improvement appears as a visible prompt for deciding which workflow artifact changes next

**Scenario: Student switches an activity vote**

- Given: a student has voted for one activity choice
- When: the student chooses a different activity choice
- Then: the previous choice loses that student's vote, the new choice gains it, and the room choice follows the updated counts

**Scenario: Lecturer advances to the next voting topic**

- Given: students are voting on the baseline activity choices
- When: the lecturer reveals Step 1
- Then: the student activity panel hides baseline choices and shows Step 1 choices about agent responsibilities
