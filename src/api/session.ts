export const DEFAULT_ROOM_ID = "classroom";

export const activityOptions = [
  "Make the Clarifier ask one question first",
  "Run Resource Researcher and Activity Designer in parallel",
  "Require every handoff to name its input and output",
  "Ask the Evaluator to reject answers without evidence",
];

export interface ClassroomSession {
  roomId: string;
  activeStepIndex: number;
  revealedStepIndex: number;
  selectedActivity: string | null;
  activityVotes: Record<string, number>;
  lecturerClaimed: boolean;
  version: number;
}

interface SessionCommand {
  role?: string;
  action?: string;
  stepIndex?: number;
  activity?: string;
  lecturerToken?: string;
}

interface StoredClassroomSession extends Omit<ClassroomSession, "lecturerClaimed"> {
  lecturerToken: string | null;
}

interface SessionPayload {
  ok: true;
  session: ClassroomSession;
  activityOptions: string[];
  hasLecturerAccess: boolean;
  lecturerToken?: string;
}

const sessions = new Map<string, StoredClassroomSession>();
const maxStepIndex = 4;

export async function handleSessionRequest(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const roomId = normalizeRoomId(url.searchParams.get("room"));
  const lecturerToken = url.searchParams.get("lecturerToken");

  if (request.method === "GET") {
    const session = getSession(roomId);
    return sessionResponse(session, hasLecturerAccess(session, lecturerToken));
  }

  if (request.method !== "POST") {
    return Response.json({ ok: false, error: "Method not allowed" }, { status: 405 });
  }

  const command = await readCommand(request);
  if (!command) {
    return Response.json({ ok: false, error: "Invalid JSON command" }, { status: 400 });
  }

  const session = getSession(roomId);
  const payload = applyCommand(session, command);
  return sessionResponse(session, payload.hasLecturerAccess, payload.lecturerToken);
}

function getSession(roomId: string): StoredClassroomSession {
  const existing = sessions.get(roomId);
  if (existing) {
    return existing;
  }

  const session: StoredClassroomSession = {
    roomId,
    activeStepIndex: 0,
    revealedStepIndex: 0,
    selectedActivity: null,
    activityVotes: {},
    lecturerToken: null,
    version: 1,
  };
  sessions.set(roomId, session);
  return session;
}

function applyCommand(session: StoredClassroomSession, command: SessionCommand): { hasLecturerAccess: boolean; lecturerToken?: string } {
  if (command.action === "voteActivity" && isKnownActivity(command.activity)) {
    session.activityVotes[command.activity] = (session.activityVotes[command.activity] ?? 0) + 1;
    session.selectedActivity = command.activity;
    session.version += 1;
    return { hasLecturerAccess: hasLecturerAccess(session, command.lecturerToken) };
  }

  if (command.role !== "lecturer") {
    return { hasLecturerAccess: false };
  }

  if (command.action === "claimLecturer") {
    if (!session.lecturerToken) {
      session.lecturerToken = createLecturerToken();
      session.version += 1;
      return { hasLecturerAccess: true, lecturerToken: session.lecturerToken };
    }

    const hasAccess = hasLecturerAccess(session, command.lecturerToken);
    return hasAccess ? { hasLecturerAccess: true, lecturerToken: session.lecturerToken } : { hasLecturerAccess: false };
  }

  const hasAccess = hasLecturerAccess(session, command.lecturerToken);
  if (!hasAccess) {
    return { hasLecturerAccess: false };
  }

  if (command.action === "releaseLecturer") {
    session.lecturerToken = null;
    session.version += 1;
    return { hasLecturerAccess: false };
  }

  if (command.action === "revealNext") {
    session.revealedStepIndex = Math.min(session.revealedStepIndex + 1, maxStepIndex);
    session.activeStepIndex = session.revealedStepIndex;
    session.version += 1;
  } else if (command.action === "setStep" && typeof command.stepIndex === "number") {
    session.activeStepIndex = clampStep(command.stepIndex, session.revealedStepIndex);
    session.version += 1;
  } else if (command.action === "reset") {
    session.activeStepIndex = 0;
    session.revealedStepIndex = 0;
    session.selectedActivity = null;
    session.activityVotes = {};
    session.version += 1;
  }

  return session.lecturerToken ? { hasLecturerAccess: true, lecturerToken: session.lecturerToken } : { hasLecturerAccess: true };
}

async function readCommand(request: Request): Promise<SessionCommand | null> {
  try {
    const value = await request.json();
    return typeof value === "object" && value !== null ? (value as SessionCommand) : null;
  } catch {
    return null;
  }
}

function sessionResponse(session: StoredClassroomSession, hasLecturerAccess: boolean, lecturerToken?: string): Response {
  const payload: SessionPayload = {
    ok: true,
    session: toPublicSession(session),
    activityOptions,
    hasLecturerAccess,
  };

  if (lecturerToken) {
    payload.lecturerToken = lecturerToken;
  }

  return Response.json(payload);
}

function toPublicSession(session: StoredClassroomSession): ClassroomSession {
  return {
    roomId: session.roomId,
    activeStepIndex: session.activeStepIndex,
    revealedStepIndex: session.revealedStepIndex,
    selectedActivity: session.selectedActivity,
    activityVotes: session.activityVotes,
    lecturerClaimed: Boolean(session.lecturerToken),
    version: session.version,
  };
}

function normalizeRoomId(value: string | null): string {
  const roomId =
    value
      ?.trim()
      .toLowerCase()
      .replaceAll(/[^a-z0-9-]/g, "-") ?? "";
  return roomId.length > 0 ? roomId.slice(0, 48) : DEFAULT_ROOM_ID;
}

function clampStep(value: number, revealedStepIndex: number): number {
  return Math.max(0, Math.min(Math.trunc(value), revealedStepIndex, maxStepIndex));
}

function isKnownActivity(value: string | undefined): value is string {
  return typeof value === "string" && activityOptions.includes(value);
}

function hasLecturerAccess(session: StoredClassroomSession, lecturerToken: string | null | undefined): boolean {
  return Boolean(session.lecturerToken && lecturerToken && session.lecturerToken === lecturerToken);
}

function createLecturerToken(): string {
  return globalThis.crypto.randomUUID();
}
