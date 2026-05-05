# ADR-020: Adopt Classroom Agentic Workflow Demo

**Status:** Accepted

**Date:** 2026-05-05

## Context

The earlier `agentic-workflow-simulator` approach exposed useful concepts but asked beginners to understand a full workflow studio before they had a stable mental model for agents, handoffs, and evaluation.

The `french-cheese-shop-demo` approach works better for a classroom because it uses one concrete request, staged reveals, lecturer prompts, and visible audience activity. That structure can teach agentic workflows without requiring students to build a workflow first.

## Decision

We will make the primary app surface a deterministic classroom demo for agentic workflows.

The demo will:

- keep one concrete beginner AI workshop planning request as the anchor
- reveal one concept per step: baseline request, agent roles, workflow order, handoffs, and evaluation
- separate lecturer and student URLs so the lecturer controls what the room can see
- require a lecturer device to claim room control before reveal, reset, or release actions
- let student browsers contribute shared activity votes
- show named agents with explicit inputs and outputs
- show workflow time slots, including parallel `T2` work
- keep handoff packets visible in the main board
- keep all teaching-path behavior local, deterministic, and account-free

Room state may use lightweight in-memory Worker state for short local classroom demos. Lecturer claims use a browser-local token to coordinate control between lecturer devices. This is not durable storage and is not an authentication boundary; adding durable shared rooms requires a later explicit decision.

The health endpoint and Worker runtime baseline remain in place for smoke tests and local verification.

## Trigger

A tester found the workflow simulator too complex for students who do not know the topic yet. The classroom-oriented cheese shop demo demonstrated a better pacing model for first exposure.

## Consequences

**Positive:**

- Beginners get a guided first mental model before seeing a free-form builder.
- The lecturer can run the demo step by step and stop after any concept.
- The app remains lightweight and easy to rehearse because no remote AI or persistence is required.
- The lecturer can pace student visibility while students still work together through shared votes.

**Negative:**

- The first surface is less exploratory than the full simulator.
- Future free-form editing will need to be added as a later layer rather than assumed in the first lesson.
- The in-memory room model is not suitable for durable production collaboration.

**Neutral:**

- The app still uses the existing Worker, Tailwind, Vitest, and Playwright baseline.
- The previous Worker stub decision remains valid as a runtime baseline, but the visible root route now carries product-specific classroom behavior.

## Alternatives Considered

### Port the full agentic workflow simulator

This was rejected for the first classroom surface because it repeats the complexity problem: students must learn the tool mechanics at the same time as the concepts.

### Port the French cheese shop requirements demo unchanged

This was rejected because the learning goal is agentic workflows, not requirements engineering alone. The cheese shop scenario was useful for pacing, but workshop planning makes the agent roles, handoffs, parallel work, and evaluation checks easier for students to recognize.

### Keep the generic Worker starter page

This was rejected because it does not address the classroom teaching problem.
