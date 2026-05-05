import { DEFAULT_ROOM_ID, activityOptionsByStep } from "../api/session";
import { escapeHtml } from "./shared";

const appTitle = "Agentic Workflow Classroom";
const appDescription =
  "A guided classroom demo that shows why agents need clear jobs, explicit handoffs, and checks before the final answer.";

interface DemoStep {
  id: string;
  label: string;
  title: string;
  goal: string;
  roomQuestion: string;
  notice: string;
  timebox: string;
}

interface DemoAgent {
  name: string;
  job: string;
  input: string;
  output: string;
}

interface WorkflowAction {
  time: string;
  agent: string;
  work: string;
  handoff: string;
}

const steps: DemoStep[] = [
  {
    id: "baseline",
    label: "Baseline",
    title: "Start With One Human Request",
    goal: "Students see the hidden decisions inside a simple request.",
    roomQuestion: "What must the system know before it can plan a useful beginner workshop?",
    notice:
      "The request names the final product, but not the audience, constraints, success criteria, or checks. Those missing decisions become work for the system.",
    timebox: "60 sec",
  },
  {
    id: "agents",
    label: "Step 1",
    title: "Give Each Agent One Job",
    goal: "Students see an agent as a bounded responsibility, not a smarter chatbot.",
    roomQuestion: "Which part of the work would be easier to trust if one agent owned it?",
    notice: "A useful agent has a named job, a specific input, and an output another part of the workflow can inspect.",
    timebox: "2 min",
  },
  {
    id: "workflow",
    label: "Step 2",
    title: "Arrange Sequential And Parallel Work",
    goal: "Students distinguish dependency from convenience.",
    roomQuestion: "Which task needs the clarified goal first, and which tasks can happen at the same time after that?",
    notice:
      "Clarification must happen first. Resource research and activity design can then run in parallel because both use the clarified goal.",
    timebox: "3 min",
  },
  {
    id: "handoffs",
    label: "Step 3",
    title: "Inspect Packets And Handoffs",
    goal: "Students see that the handoff is the contract between agents.",
    roomQuestion: "What must be in the packet so the next agent does not have to guess?",
    notice: "Boxes and arrows are not enough. The packet must carry the assumptions, evidence, and decisions the next agent needs.",
    timebox: "3 min",
  },
  {
    id: "evaluation",
    label: "Step 4",
    title: "Evaluate The Workflow, Not Just The Answer",
    goal: "Students learn to judge the trace, not only the polished output.",
    roomQuestion: "Which trace evidence would make you trust or reject the workshop plan?",
    notice: "The evaluator checks whether the path is traceable, the trade-offs are visible, and weak or unsupported claims are rejected.",
    timebox: "2 min",
  },
];

const agents: DemoAgent[] = [
  {
    name: "Clarifier",
    job: "Turns the vague workshop request into learning goals, audience assumptions, and constraints.",
    input: "One vague request",
    output: "Learning goal, audience, constraints",
  },
  {
    name: "Resource Researcher",
    job: "Finds examples, materials, and timing limits that fit the clarified goal.",
    input: "Clarified need",
    output: "Useful resources, limits, and gaps",
  },
  {
    name: "Activity Designer",
    job: "Turns the goal and evidence into a teachable workshop sequence.",
    input: "Goal plus evidence",
    output: "Activity sequence and handoffs",
  },
  {
    name: "Evaluator",
    job: "Checks whether the plan is supported by the trace and safe to use in class.",
    input: "Trace plus final answer",
    output: "Passes, risks, and revisions",
  },
];

const workflowActions: WorkflowAction[] = [
  {
    time: "T1",
    agent: "Clarifier",
    work: "Ask what beginners should understand, what the class already knows, and what constraints matter.",
    handoff: "Learning goal, audience assumptions, constraints, likely confusion, and success criteria.",
  },
  {
    time: "T2",
    agent: "Resource Researcher",
    work: "Collect examples, materials, time limits, and room constraints that fit the clarified goal.",
    handoff: "Resource list with fit notes, assumptions, source notes, and gaps.",
  },
  {
    time: "T2",
    agent: "Activity Designer",
    work: "Sketch the learner journey and mark where preparation can happen in parallel.",
    handoff: "Draft workshop flow with activity purpose, timing, and handoff needs.",
  },
  {
    time: "T3",
    agent: "Evaluator",
    work: "Check the trace for missing inputs, hidden assumptions, weak evidence, and unsafe claims.",
    handoff: "Visible review notes, rejected claims, and a safer workshop plan.",
  },
];

export function renderHomePage(): string {
  const stepButtons = steps.map(renderStepButton).join("");
  const agentCards = agents.map(renderAgentCard).join("");
  const workflowRows = workflowActions.map(renderWorkflowAction).join("");
  const activityButtons = activityOptionsByStep
    .map((options, stepIndex) => options.map((option) => renderActivityButton(option, stepIndex)).join(""))
    .join("");

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${escapeHtml(appTitle)}</title>
    <link rel="stylesheet" href="/styles.css">
  </head>
  <body class="min-h-screen bg-app-canvas text-app-text antialiased">
    <main class="px-4 py-5 sm:px-8 sm:py-8 lg:px-10">
      <div class="mx-auto grid max-w-7xl gap-5 lg:grid-cols-[18rem_minmax(0,1fr)] lg:items-start 2xl:max-w-[90rem] 2xl:grid-cols-[18rem_minmax(0,1fr)_18rem]">
        <header class="lg:col-span-2 2xl:col-span-3">
          <p class="text-[0.72rem] font-semibold uppercase tracking-[0.28em] text-app-accent">Classroom Demo</p>
          <div class="mt-3 grid gap-4 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-end">
            <div class="min-w-0">
              <h1 class="max-w-4xl break-words text-[2.35rem] font-semibold leading-[0.95] tracking-normal text-app-text sm:text-6xl">${escapeHtml(appTitle)}</h1>
              <p class="mt-4 max-w-3xl text-base leading-7 text-app-text-soft sm:text-lg">${escapeHtml(appDescription)}</p>
            </div>
            <section class="border-l-4 border-app-accent bg-white/82 px-4 py-3 shadow-panel">
              <p class="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-app-text-soft">Demo Request</p>
              <p class="mt-2 text-lg leading-7 text-app-text">Plan a 45-minute beginner AI workshop where students learn what agents do, how handoffs work, and when to trust the result.</p>
            </section>
          </div>
          <section class="mt-5 grid gap-3 border border-app-line bg-white/82 p-4 shadow-panel lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
            <div class="min-w-0">
              <p class="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-app-text-soft">Shared Classroom Room</p>
              <p class="mt-2 text-sm leading-6 text-app-text-soft">
                <span id="room-status">Joining room...</span>
                <span class="mx-2 text-app-line">/</span>
                <span id="role-status">Detecting role...</span>
                <span class="mx-2 text-app-line" data-lecturer-status-separator>/</span>
                <span id="lecturer-claim-status" data-lecturer-status>Controls not claimed</span>
              </p>
            </div>
            <div class="flex flex-wrap gap-2">
              <a id="lecturer-link" class="border border-app-accent bg-app-accent px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-white" href="/?room=${escapeHtml(DEFAULT_ROOM_ID)}&role=lecturer">Lecturer view</a>
              <a id="student-link" class="border border-app-line bg-app-surface px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-app-text" href="/?room=${escapeHtml(DEFAULT_ROOM_ID)}&role=student">Student view</a>
            </div>
          </section>
        </header>

        <aside class="lg:sticky lg:top-6">
          <section>
            <p class="text-[0.72rem] font-semibold uppercase tracking-[0.28em] text-app-accent">Lesson Path</p>
            <div class="mt-4 grid gap-3" role="group" aria-label="Choose lesson step">${stepButtons}</div>
            <div data-lecturer-controls>
              <button id="claim-room" type="button" class="mt-4 w-full border border-app-accent bg-app-accent px-4 py-3 text-sm font-semibold uppercase tracking-[0.14em] text-white transition hover:bg-app-accent-strong">Claim room</button>
              <button id="release-room" type="button" class="mt-3 w-full border border-app-line bg-white/78 px-4 py-3 text-sm font-semibold uppercase tracking-[0.14em] text-app-text transition hover:border-app-accent">Release room</button>
              <button id="next-step" type="button" class="mt-4 w-full border border-app-accent bg-app-accent px-4 py-3 text-sm font-semibold uppercase tracking-[0.14em] text-white transition hover:bg-app-accent-strong">Reveal next step</button>
              <button id="reset-room" type="button" class="mt-3 w-full border border-app-line bg-white/78 px-4 py-3 text-sm font-semibold uppercase tracking-[0.14em] text-app-text transition hover:border-app-accent">Reset room</button>
            </div>
            <p id="student-visibility-note" class="mt-4 border border-app-line bg-white/78 px-4 py-3 text-sm leading-6 text-app-text-soft" hidden>Waiting for the lecturer to reveal the next step.</p>
          </section>
        </aside>

        <div class="grid min-w-0 gap-5">
          <section class="min-w-0 border border-app-line bg-white/88 p-4 shadow-panel sm:p-5">
            <div class="flex flex-wrap items-start justify-between gap-4">
              <div class="min-w-0 flex-1">
                <p id="step-label" class="text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-app-accent">Baseline</p>
                <h2 id="step-title" class="mt-2 text-3xl font-semibold leading-none tracking-normal text-app-text">Start With One Human Request</h2>
              </div>
              <p id="step-timebox" class="shrink-0 border border-app-line px-3 py-2 text-sm font-semibold text-app-text-soft" data-lecturer-only hidden>60 sec</p>
            </div>
            <p id="step-goal" class="mt-4 max-w-3xl text-base leading-7 text-app-text-soft" data-lecturer-only hidden>Students see the hidden decisions inside a simple request.</p>
            <div class="mt-5 grid gap-3 sm:grid-cols-2" data-lecturer-only hidden>
              <div class="border border-app-line bg-app-surface px-4 py-3">
                <p class="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-app-text-soft">Ask The Room</p>
                <p id="room-question" class="mt-2 leading-7 text-app-text">What must the system know before it can plan a useful beginner workshop?</p>
              </div>
              <div class="border border-app-line bg-app-surface px-4 py-3">
                <p class="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-app-text-soft">What To Notice</p>
                <p id="step-notice" class="mt-2 leading-7 text-app-text">The request names the final product, but not the audience, constraints, success criteria, or checks. Those missing decisions become work for the system.</p>
              </div>
            </div>
          </section>

          <section class="grid min-w-0 gap-5 2xl:grid-cols-[minmax(0,1fr)_18rem]">
            <div class="min-w-0 border border-app-line bg-white/88 p-4 shadow-panel sm:p-5">
              <div class="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <p class="text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-app-accent">Workflow Board</p>
                  <h2 class="mt-2 text-2xl font-semibold leading-none tracking-normal">From agents to trace</h2>
                </div>
                <p id="workflow-mode" class="text-sm font-semibold text-app-text-soft">Showing classroom baseline</p>
              </div>
              <div class="mt-5 grid gap-3 md:grid-cols-2">${agentCards}</div>
              <div class="mt-5 max-w-full overflow-x-auto border border-app-line">
                <div class="grid min-w-[42rem] grid-cols-[4rem_minmax(10rem,1fr)_minmax(14rem,1.4fr)] bg-app-accent-ghost text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-app-accent-strong">
                  <div class="px-3 py-3">Time</div>
                  <div class="px-3 py-3">Agent Work</div>
                  <div class="px-3 py-3">Handoff Packet</div>
                </div>
                <ol id="workflow-actions" class="min-w-[42rem] divide-y divide-app-line">${workflowRows}</ol>
              </div>
            </div>

            <section class="min-w-0 border border-app-line bg-white/88 p-4 shadow-panel sm:p-5">
              <p class="text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-app-accent">Student Activity</p>
              <p id="activity-topic" class="mt-2 text-lg font-semibold leading-tight tracking-normal text-app-text">Baseline choice</p>
              <p id="activity-help" class="mt-2 text-sm leading-6 text-app-text-soft">Students vote together on one improvement. The lecturer uses the group choice to explain what changes in the workflow.</p>
              <div id="activity-choices" class="mt-4 grid gap-2" role="group" aria-label="Classroom activity choices">${activityButtons}</div>
              <p id="activity-result" class="mt-4 border-t border-app-line pt-4 text-sm leading-6 text-app-text-soft" aria-live="polite">No group choice selected yet.</p>
            </section>
          </section>

          <section class="min-w-0 border border-app-line bg-white/88 p-4 shadow-panel sm:p-5">
            <p class="text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-app-accent">Trace View</p>
            <div class="mt-4 grid gap-3 md:grid-cols-3">
              <div class="border border-app-line bg-app-surface px-4 py-3">
                <p class="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-app-text-soft">Input Packet</p>
                <p class="mt-2 text-sm leading-6 text-app-text">Vague workshop request plus the current learning goal.</p>
              </div>
              <div class="border border-app-line bg-app-surface px-4 py-3">
                <p class="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-app-text-soft">Agent Transform</p>
                <p class="mt-2 text-sm leading-6 text-app-text">One agent rewrites, researches, designs, or evaluates the packet.</p>
              </div>
              <div class="border border-app-line bg-app-surface px-4 py-3">
                <p class="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-app-text-soft">Output Packet</p>
                <p class="mt-2 text-sm leading-6 text-app-text">A named artifact that the next agent can inspect and use.</p>
              </div>
            </div>
          </section>
        </div>

        <aside class="lg:col-start-2 2xl:sticky 2xl:top-6 2xl:col-start-auto" data-lecturer-only hidden>
          <section class="border border-app-line bg-white/88 p-4 shadow-panel sm:p-5">
            <p class="text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-app-accent">Pedagogy Lens</p>
            <h2 class="mt-3 text-2xl font-semibold leading-none tracking-normal">Keep it concrete</h2>
            <ul class="mt-4 grid gap-3 text-sm leading-6 text-app-text-soft">
              <li><strong class="text-app-text">One new concept per step:</strong> request, role, order, handoff, evaluation.</li>
              <li><strong class="text-app-text">No hidden model magic:</strong> every output names the input it used.</li>
              <li><strong class="text-app-text">Human control stays visible:</strong> the lecturer reveals steps and frames trade-offs.</li>
              <li><strong class="text-app-text">Failure is teachable:</strong> missing packets and unchecked answers become discussion material.</li>
            </ul>
          </section>
        </aside>
      </div>
    </main>
    <script>
      const steps = ${JSON.stringify(steps)};
      const defaultRoomId = ${JSON.stringify(DEFAULT_ROOM_ID)};
      const buttons = [...document.querySelectorAll("[data-step]")];
      const activityButtons = [...document.querySelectorAll("[data-activity]")];
      const activityOptionsByStep = ${JSON.stringify(activityOptionsByStep)};
      const claimButton = document.querySelector("#claim-room");
      const releaseButton = document.querySelector("#release-room");
      const nextButton = document.querySelector("#next-step");
      const resetButton = document.querySelector("#reset-room");
      const lecturerLink = document.querySelector("#lecturer-link");
      const studentLink = document.querySelector("#student-link");
      const params = new URLSearchParams(window.location.search);
      const roomId = normalizeRoomId(params.get("room") || defaultRoomId);
      const role = params.get("role") === "student" ? "student" : "lecturer";
      let activeIndex = -1;
      let revealedIndex = -1;
      let selectedActivity = null;
      let lecturerToken = role === "lecturer" ? window.localStorage.getItem(lecturerTokenKey(roomId)) : "";
      let localActivityVotes = readLocalActivityVotes(roomId);
      let hasLecturerAccess = false;

      document.querySelector("#room-status").textContent = "Room: " + roomId;
      document.querySelector("#role-status").textContent = role === "lecturer" ? "Lecturer controls enabled" : "Student view";
      document.querySelectorAll("[data-lecturer-only]").forEach((element) => {
        element.hidden = role !== "lecturer";
      });
      document.querySelectorAll("[data-lecturer-status], [data-lecturer-status-separator]").forEach((element) => {
        element.hidden = role !== "lecturer";
      });
      lecturerLink.href = "/?room=" + encodeURIComponent(roomId) + "&role=lecturer";
      studentLink.href = "/?room=" + encodeURIComponent(roomId) + "&role=student";
      lecturerLink.hidden = role === "student";
      document.querySelectorAll("[data-lecturer-controls]").forEach((element) => {
        element.hidden = role !== "lecturer";
      });
      document.querySelector("#student-visibility-note").hidden = role === "lecturer";

      function setActiveStep(index, nextRevealedIndex) {
        activeIndex = index;
        revealedIndex = nextRevealedIndex;
        const step = steps[index];
        document.querySelector("#step-label").textContent = step.label;
        document.querySelector("#step-title").textContent = step.title;
        document.querySelector("#step-goal").textContent = step.goal;
        document.querySelector("#room-question").textContent = step.roomQuestion;
        document.querySelector("#step-notice").textContent = step.notice;
        document.querySelector("#step-timebox").textContent = step.timebox;
        document.querySelector("#workflow-mode").textContent = index === 0 ? "Showing classroom baseline" : "Showing " + step.label.toLowerCase() + " changes";

        buttons.forEach((button, buttonIndex) => {
          const isActive = buttonIndex === index;
          button.hidden = buttonIndex > nextRevealedIndex;
          button.disabled = role !== "lecturer";
          button.classList.toggle("border-app-accent", isActive);
          button.classList.toggle("bg-app-accent-ghost", isActive);
          button.setAttribute("aria-pressed", String(isActive));
        });

        document.querySelectorAll("[data-action-index]").forEach((row) => {
          const actionIndex = Number(row.getAttribute("data-action-index"));
          row.classList.toggle("bg-app-accent-ghost", index > 1 && actionIndex <= index - 1);
        });

        nextButton.disabled = !hasLecturerAccess || nextRevealedIndex >= steps.length - 1;
        nextButton.textContent = nextRevealedIndex >= steps.length - 1 ? "All steps revealed" : "Reveal next step";
        nextButton.classList.toggle("opacity-70", !hasLecturerAccess || nextRevealedIndex >= steps.length - 1);
        document.querySelector("#student-visibility-note").textContent =
          nextRevealedIndex >= steps.length - 1 ? "All lesson steps are visible." : "Waiting for the lecturer to reveal the next step.";
      }

      async function loadSession() {
        const response = await fetch(sessionUrl());
        if (!response.ok) return;
        const payload = await response.json();
        applySession(payload);
      }

      function applySession(payload) {
        const session = payload?.session;
        if (!session) return;
        hasLecturerAccess = Boolean(payload.hasLecturerAccess);
        if (payload.lecturerToken && role === "lecturer") {
          lecturerToken = payload.lecturerToken;
          window.localStorage.setItem(lecturerTokenKey(roomId), lecturerToken);
        } else if (role === "lecturer" && !session.lecturerClaimed) {
          lecturerToken = "";
          window.localStorage.removeItem(lecturerTokenKey(roomId));
        }

        setActiveStep(session.activeStepIndex, session.revealedStepIndex);
        updateRoleLinkUi(session);
        updateLecturerClaimUi(session);
        pruneLocalActivityVotes(session.activityVotes);
        selectedActivity = selectedActivityForStep(session.activityVotes, session.activeStepIndex);
        activityButtons.forEach((button) => {
          const activity = button.dataset.activity || "";
          const stepIndex = Number(button.dataset.activityStep || "0");
          button.hidden = stepIndex !== session.activeStepIndex;
          button.disabled = role === "lecturer";
          const count = session.activityVotes?.[activity] || 0;
          const countElement = button.querySelector("[data-vote-count]");
          if (countElement) countElement.textContent = formatVoteCount(count);
          const isSelected = activity === selectedActivity;
          const hasLocalVote = activity === localActivityVotes[String(session.activeStepIndex)];
          button.classList.toggle("border-app-accent", isSelected || hasLocalVote);
          button.classList.toggle("bg-app-accent-ghost", isSelected || hasLocalVote);
          button.classList.toggle("cursor-default", role === "lecturer");
          button.setAttribute("aria-pressed", String(hasLocalVote));
        });

        const activityTopic = steps[session.activeStepIndex]?.title || "Current step";
        document.querySelector("#activity-topic").textContent = activityTopic + " choice";
        document.querySelector("#activity-choices").setAttribute("aria-label", "Activity choices for " + activityTopic);
        document.querySelector("#activity-help").textContent =
          role === "lecturer"
            ? "Students vote together on the current lesson point. Use the group choice as the next discussion prompt."
            : "Choose one option for the current lesson point.";
        document.querySelector("#activity-result").textContent = activityResultText(selectedActivity);
      }

      function updateRoleLinkUi(session) {
        lecturerLink.hidden = role === "student" && session.lecturerClaimed;
      }

      function activityResultText(activity) {
        if (!activity) {
          return "No group choice selected yet.";
        }

        if (role === "lecturer") {
          return "Group choice: " + activity + ". Use this as the next discussion prompt.";
        }

        return "Group choice: " + activity + ".";
      }

      function formatVoteCount(count) {
        return count + " " + (count === 1 ? "vote" : "votes");
      }

      function selectedActivityForStep(activityVotes, stepIndex) {
        const options = activityOptionsByStep[stepIndex] || [];
        const maxVotes = Math.max(0, ...options.map((activity) => activityVotes?.[activity] || 0));
        if (maxVotes <= 0) {
          return null;
        }

        return options.find((activity) => (activityVotes?.[activity] || 0) === maxVotes) || null;
      }

      async function postCommand(command) {
        const response = await fetch("/api/session?room=" + encodeURIComponent(roomId), {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ role, lecturerToken, ...command }),
        });
        if (!response.ok) return;
        const payload = await response.json();
        applySession(payload);
      }

      function updateLecturerClaimUi(session) {
        if (role !== "lecturer") return;
        const claimStatus = document.querySelector("#lecturer-claim-status");
        if (hasLecturerAccess) {
          claimStatus.textContent = "You control this room";
        } else if (session.lecturerClaimed) {
          claimStatus.textContent = "Claimed by another lecturer device";
        } else {
          claimStatus.textContent = "Controls not claimed";
        }

        claimButton.disabled = hasLecturerAccess || session.lecturerClaimed;
        releaseButton.disabled = !hasLecturerAccess;
        resetButton.disabled = !hasLecturerAccess;
        nextButton.disabled = !hasLecturerAccess || session.revealedStepIndex >= steps.length - 1;
        claimButton.classList.toggle("opacity-70", claimButton.disabled);
        releaseButton.classList.toggle("opacity-70", releaseButton.disabled);
        resetButton.classList.toggle("opacity-70", resetButton.disabled);
      }

      function sessionUrl() {
        const url = new URL("/api/session", window.location.origin);
        url.searchParams.set("room", roomId);
        if (role === "lecturer" && lecturerToken) {
          url.searchParams.set("lecturerToken", lecturerToken);
        }
        return url.toString();
      }

      function lecturerTokenKey(room) {
        return "agentic-workflow-classroom/lecturer-token/" + room;
      }

      function activityVoteKey(room) {
        return "agentic-workflow-classroom/activity-vote/" + room;
      }

      function readLocalActivityVotes(room) {
        if (role !== "student") {
          return {};
        }

        try {
          const value = JSON.parse(window.localStorage.getItem(activityVoteKey(room)) || "{}");
          return value && typeof value === "object" ? value : {};
        } catch {
          return {};
        }
      }

      function writeLocalActivityVotes(room) {
        window.localStorage.setItem(activityVoteKey(room), JSON.stringify(localActivityVotes));
      }

      function pruneLocalActivityVotes(activityVotes) {
        if (role !== "student") {
          return;
        }

        const nextLocalVotes = {};
        for (const [stepIndex, activity] of Object.entries(localActivityVotes)) {
          if ((activityVotes?.[activity] || 0) > 0) {
            nextLocalVotes[stepIndex] = activity;
          }
        }

        if (Object.keys(nextLocalVotes).length !== Object.keys(localActivityVotes).length) {
          localActivityVotes = nextLocalVotes;
          writeLocalActivityVotes(roomId);
        }
      }

      buttons.forEach((button, index) => {
        button.addEventListener("click", () => {
          if (role === "lecturer" && index <= revealedIndex) {
            void postCommand({ action: "setStep", stepIndex: index });
          }
        });
      });

      nextButton.addEventListener("click", () => {
        if (role === "lecturer" && hasLecturerAccess) {
          void postCommand({ action: "revealNext" });
        }
      });

      resetButton.addEventListener("click", () => {
        if (role === "lecturer" && hasLecturerAccess) {
          void postCommand({ action: "reset" });
        }
      });

      claimButton.addEventListener("click", () => {
        if (role === "lecturer") {
          void postCommand({ action: "claimLecturer" });
        }
      });

      releaseButton.addEventListener("click", () => {
        if (role === "lecturer" && hasLecturerAccess) {
          void postCommand({ action: "releaseLecturer" });
        }
      });

      activityButtons.forEach((button) => {
        button.addEventListener("click", () => {
          const activity = button.dataset.activity || "";
          if (!activity) return;
          void handleActivityVote(activity);
        });
      });

      async function handleActivityVote(activity) {
        if (role !== "student") {
          return;
        }

        const voteStepIndex = String(activeIndex);
        const previousActivity = localActivityVotes[voteStepIndex] || "";
        if (previousActivity === activity) {
          delete localActivityVotes[voteStepIndex];
          writeLocalActivityVotes(roomId);
          await postCommand({ action: "voteActivity", activity, voteDelta: -1 });
          return;
        }

        localActivityVotes = { ...localActivityVotes, [voteStepIndex]: activity };
        writeLocalActivityVotes(roomId);
        await postCommand({ action: "voteActivity", activity, voteDelta: 1 });
        if (previousActivity) {
          await postCommand({ action: "voteActivity", activity: previousActivity, voteDelta: -1 });
        }
      }

      function normalizeRoomId(value) {
        const room = String(value || "").trim().toLowerCase().replace(/[^a-z0-9-]/g, "-").slice(0, 48);
        return room || defaultRoomId;
      }

      void loadSession();
      window.setInterval(loadSession, 1500);
    </script>
  </body>
</html>`;
}

function renderStepButton(step: DemoStep, index: number): string {
  const isActive = index === 0;
  const hiddenAttribute = index === 0 ? "" : " hidden";
  const activeClasses = isActive ? " border-app-accent bg-app-accent-ghost" : "";

  return `<button type="button" class="border border-app-line bg-white/78 px-4 py-3 text-left transition hover:border-app-accent${activeClasses}" data-step="${escapeHtml(step.id)}" aria-pressed="${String(isActive)}"${hiddenAttribute}>
    <span class="block text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-app-accent">${escapeHtml(step.label)}</span>
    <span class="mt-2 block text-base font-semibold leading-5 text-app-text">${escapeHtml(step.title)}</span>
    <span class="mt-2 block text-sm leading-6 text-app-text-soft">${escapeHtml(step.goal)}</span>
  </button>`;
}

function renderAgentCard(agent: DemoAgent): string {
  return `<article class="min-w-0 border border-app-line bg-app-surface px-4 py-3" data-agent-card>
    <h3 class="text-base font-semibold leading-6 text-app-text">${escapeHtml(agent.name)}</h3>
    <p class="mt-2 text-sm leading-6 text-app-text-soft">${escapeHtml(agent.job)}</p>
    <dl class="mt-3 grid gap-2 text-xs leading-5 text-app-text-soft">
      <div><dt class="font-semibold uppercase tracking-[0.14em] text-app-accent-strong">Input</dt><dd>${escapeHtml(agent.input)}</dd></div>
      <div><dt class="font-semibold uppercase tracking-[0.14em] text-app-accent-strong">Output</dt><dd>${escapeHtml(agent.output)}</dd></div>
    </dl>
  </article>`;
}

function renderWorkflowAction(action: WorkflowAction, index: number): string {
  return `<li class="grid grid-cols-[4rem_minmax(10rem,1fr)_minmax(14rem,1.4fr)] transition" data-action-index="${index}">
    <div class="px-3 py-4 font-semibold text-app-accent-strong">${escapeHtml(action.time)}</div>
    <div class="px-3 py-4">
      <p class="font-semibold text-app-text">${escapeHtml(action.agent)}</p>
      <p class="mt-1 text-sm leading-6 text-app-text-soft">${escapeHtml(action.work)}</p>
    </div>
    <div class="px-3 py-4 text-sm leading-6 text-app-text-soft">${escapeHtml(action.handoff)}</div>
  </li>`;
}

function renderActivityButton(label: string, stepIndex: number): string {
  const hiddenAttribute = stepIndex === 0 ? "" : " hidden";
  return `<button type="button" class="flex items-start justify-between gap-3 border border-app-line bg-app-surface px-3 py-2 text-left text-sm leading-5 text-app-text transition hover:border-app-accent" data-activity="${escapeHtml(label)}" data-activity-step="${stepIndex}" aria-pressed="false"${hiddenAttribute}>
    <span>${escapeHtml(label)}</span>
    <span class="shrink-0 font-semibold text-app-accent-strong" data-vote-count>0 votes</span>
  </button>`;
}
