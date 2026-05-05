import { describe, expect, it } from "vitest";
import { activityOptions, handleSessionRequest } from "./session";

describe("handleSessionRequest", () => {
  it("returns a baseline room snapshot", async () => {
    const response = await handleSessionRequest(new Request("http://example.com/api/session?room=unit-baseline"));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      ok: true,
      session: {
        roomId: "unit-baseline",
        activeStepIndex: 0,
        revealedStepIndex: 0,
        selectedActivity: null,
        lecturerClaimed: false,
      },
      hasLecturerAccess: false,
      activityOptions,
    });
  });

  it("lets a lecturer claim a room and reveal the next step", async () => {
    const claimResponse = await handleSessionRequest(
      new Request("http://example.com/api/session?room=unit-reveal", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ role: "lecturer", action: "claimLecturer" }),
      }),
    );
    const claimPayload = await claimResponse.json();
    expect(claimPayload).toMatchObject({
      hasLecturerAccess: true,
      session: {
        lecturerClaimed: true,
      },
    });
    expect(claimPayload.lecturerToken).toEqual(expect.any(String));

    const response = await handleSessionRequest(
      new Request("http://example.com/api/session?room=unit-reveal", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ role: "lecturer", action: "revealNext", lecturerToken: claimPayload.lecturerToken }),
      }),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      hasLecturerAccess: true,
      session: {
        activeStepIndex: 1,
        revealedStepIndex: 1,
      },
    });
  });

  it("lets the lecturer select a revealed step and reset the room", async () => {
    const roomUrl = "http://example.com/api/session?room=unit-reset";
    const claimResponse = await handleSessionRequest(
      new Request(roomUrl, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ role: "lecturer", action: "claimLecturer" }),
      }),
    );
    const claimPayload = await claimResponse.json();
    const lecturerToken = claimPayload.lecturerToken as string;

    await handleSessionRequest(
      new Request(roomUrl, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ role: "lecturer", action: "revealNext", lecturerToken }),
      }),
    );
    await handleSessionRequest(
      new Request(roomUrl, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ role: "lecturer", action: "setStep", stepIndex: 0, lecturerToken }),
      }),
    );

    const resetResponse = await handleSessionRequest(
      new Request(roomUrl, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ role: "lecturer", action: "reset", lecturerToken }),
      }),
    );

    await expect(resetResponse.json()).resolves.toMatchObject({
      session: {
        activeStepIndex: 0,
        revealedStepIndex: 0,
        selectedActivity: null,
        activityVotes: {},
        lecturerClaimed: true,
      },
      hasLecturerAccess: true,
    });
  });

  it("lets a claimed lecturer release the room claim", async () => {
    const roomUrl = "http://example.com/api/session?room=unit-release";
    const claimResponse = await handleSessionRequest(
      new Request(roomUrl, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ role: "lecturer", action: "claimLecturer" }),
      }),
    );
    const claimPayload = await claimResponse.json();

    const releaseResponse = await handleSessionRequest(
      new Request(roomUrl, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ role: "lecturer", action: "releaseLecturer", lecturerToken: claimPayload.lecturerToken }),
      }),
    );

    await expect(releaseResponse.json()).resolves.toMatchObject({
      hasLecturerAccess: false,
      session: {
        lecturerClaimed: false,
      },
    });
  });

  it("blocks lecturer commands without a matching room claim", async () => {
    const roomUrl = "http://example.com/api/session?room=unit-blocked";
    await handleSessionRequest(
      new Request(roomUrl, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ role: "lecturer", action: "claimLecturer" }),
      }),
    );

    const revealResponse = await handleSessionRequest(
      new Request(roomUrl, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ role: "lecturer", action: "revealNext", lecturerToken: "wrong-token" }),
      }),
    );

    await expect(revealResponse.json()).resolves.toMatchObject({
      hasLecturerAccess: false,
      session: {
        activeStepIndex: 0,
        revealedStepIndex: 0,
        lecturerClaimed: true,
      },
    });
  });

  it("ignores student attempts to reveal steps but accepts votes", async () => {
    const activity = activityOptions[0] ?? "";
    const otherActivity = activityOptions[1] ?? "";
    const revealResponse = await handleSessionRequest(
      new Request("http://example.com/api/session?room=unit-student", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ role: "student", action: "revealNext" }),
      }),
    );

    await expect(revealResponse.json()).resolves.toMatchObject({
      session: {
        activeStepIndex: 0,
        revealedStepIndex: 0,
      },
    });

    const voteResponse = await handleSessionRequest(
      new Request("http://example.com/api/session?room=unit-student", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ role: "student", action: "voteActivity", activity }),
      }),
    );

    await expect(voteResponse.json()).resolves.toMatchObject({
      session: {
        selectedActivity: activity,
        activityVotes: {
          [activity]: 1,
        },
      },
    });

    const otherVoteResponse = await handleSessionRequest(
      new Request("http://example.com/api/session?room=unit-student", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ role: "student", action: "voteActivity", activity: otherActivity, voteDelta: 1 }),
      }),
    );

    await expect(otherVoteResponse.json()).resolves.toMatchObject({
      session: {
        selectedActivity: activity,
        activityVotes: {
          [activity]: 1,
          [otherActivity]: 1,
        },
      },
    });

    const leadingVoteResponse = await handleSessionRequest(
      new Request("http://example.com/api/session?room=unit-student", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ role: "student", action: "voteActivity", activity: otherActivity, voteDelta: 1 }),
      }),
    );

    await expect(leadingVoteResponse.json()).resolves.toMatchObject({
      session: {
        selectedActivity: otherActivity,
        activityVotes: {
          [activity]: 1,
          [otherActivity]: 2,
        },
      },
    });

    const removedVoteResponse = await handleSessionRequest(
      new Request("http://example.com/api/session?room=unit-student", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ role: "student", action: "voteActivity", activity: otherActivity, voteDelta: -1 }),
      }),
    );

    await expect(removedVoteResponse.json()).resolves.toMatchObject({
      session: {
        selectedActivity: activity,
        activityVotes: {
          [activity]: 1,
          [otherActivity]: 1,
        },
      },
    });
  });

  it("rejects unsupported methods and invalid JSON commands", async () => {
    const methodResponse = await handleSessionRequest(
      new Request("http://example.com/api/session?room=unit-errors", {
        method: "PUT",
      }),
    );
    expect(methodResponse.status).toBe(405);

    const jsonResponse = await handleSessionRequest(
      new Request("http://example.com/api/session?room=unit-errors", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: "not-json",
      }),
    );
    expect(jsonResponse.status).toBe(400);
  });

  it("normalizes room ids and ignores unknown activities", async () => {
    const baselineResponse = await handleSessionRequest(new Request("http://example.com/api/session?room= Demo Room! "));
    await expect(baselineResponse.json()).resolves.toMatchObject({
      session: {
        roomId: "demo-room-",
      },
    });

    const voteResponse = await handleSessionRequest(
      new Request("http://example.com/api/session?room=unit-unknown-vote", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ role: "student", action: "voteActivity", activity: "Unknown option" }),
      }),
    );

    await expect(voteResponse.json()).resolves.toMatchObject({
      session: {
        selectedActivity: null,
        activityVotes: {},
      },
    });
  });

  it("falls back to the default room id and clamps lecturer step selection", async () => {
    const claimResponse = await handleSessionRequest(
      new Request("http://example.com/api/session", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ role: "lecturer", action: "claimLecturer" }),
      }),
    );
    const claimPayload = await claimResponse.json();

    await handleSessionRequest(
      new Request("http://example.com/api/session", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ role: "lecturer", action: "revealNext", lecturerToken: claimPayload.lecturerToken }),
      }),
    );
    const response = await handleSessionRequest(
      new Request("http://example.com/api/session", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ role: "lecturer", action: "setStep", stepIndex: 99, lecturerToken: claimPayload.lecturerToken }),
      }),
    );

    await expect(response.json()).resolves.toMatchObject({
      session: {
        roomId: "classroom",
        activeStepIndex: 1,
        revealedStepIndex: 1,
      },
    });
  });
});
