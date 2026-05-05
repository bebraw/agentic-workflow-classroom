import { expect, test } from "@playwright/test";

test("renders the classroom home page", async ({ page }) => {
  await page.goto("/?room=e2e-render&role=lecturer");

  await expect(page.getByRole("heading", { level: 1, name: "Agentic Workflow Classroom" })).toBeVisible();
  await expect(page.getByRole("button", { name: /Claim room/i })).toBeVisible();
  await expect(page.getByRole("button", { name: /Reveal next step/i })).toBeVisible();
  await expect(page.getByText("Lecturer controls enabled")).toBeVisible();
  await expect(page.getByText("Student Activity")).toBeVisible();
  await expect(page.getByText("Handoff Packet")).toBeVisible();
});

test("reveals classroom steps progressively", async ({ page }) => {
  await page.goto("/?room=e2e-progress&role=lecturer");

  await expect(page.getByRole("button", { name: /Give Each Agent One Job/i })).toBeHidden();
  await page.getByRole("button", { name: /Claim room/i }).click();
  await expect(page.getByText("You control this room")).toBeVisible();
  await page.getByRole("button", { name: /Reveal next step/i }).click();
  await expect(page.getByRole("button", { name: /Give Each Agent One Job/i })).toBeVisible();
  await expect(page.getByRole("heading", { level: 2, name: "Give Each Agent One Job" })).toBeVisible();
});

test("keeps student view controlled by lecturer reveal state", async ({ browser }) => {
  const room = "e2e-shared-visibility";
  const lecturer = await browser.newPage();
  const student = await browser.newPage();

  await lecturer.goto(`/?room=${room}&role=lecturer`);
  await student.goto(`/?room=${room}&role=student`);

  await expect(student.locator("#role-status")).toHaveText("Student view");
  await expect(student.getByRole("button", { name: /Claim room/i })).toBeHidden();
  await expect(student.getByRole("button", { name: /Reveal next step/i })).toBeHidden();
  await expect(student.getByRole("button", { name: /Give Each Agent One Job/i })).toBeHidden();

  await lecturer.getByRole("button", { name: /Claim room/i }).click();
  await lecturer.getByRole("button", { name: /Reveal next step/i }).click();
  await expect(student.getByRole("button", { name: /Give Each Agent One Job/i })).toBeVisible({ timeout: 3000 });

  await lecturer.close();
  await student.close();
});

test("lets a lecturer claim, release, and reset a room", async ({ page }) => {
  const room = "e2e-claim-release-reset";
  await page.goto(`/?room=${room}&role=lecturer`);

  await expect(page.getByRole("button", { name: /Reveal next step/i })).toBeDisabled();
  await page.getByRole("button", { name: /Claim room/i }).click();
  await expect(page.getByText("You control this room")).toBeVisible();
  await expect(page.getByRole("button", { name: /Reveal next step/i })).toBeEnabled();

  await page.getByRole("button", { name: /Reveal next step/i }).click();
  await expect(page.getByRole("button", { name: /Give Each Agent One Job/i })).toBeVisible();

  await page.getByRole("button", { name: /Reset room/i }).click();
  await expect(page.getByRole("button", { name: /Give Each Agent One Job/i })).toBeHidden();
  await expect(page.getByText("You control this room")).toBeVisible();

  await page.getByRole("button", { name: /Release room/i }).click();
  await expect(page.getByText("Controls not claimed")).toBeVisible();
  await expect(page.getByRole("button", { name: /Reveal next step/i })).toBeDisabled();
});

test("blocks a second lecturer device while a room is claimed", async ({ browser }) => {
  const room = "e2e-claimed-by-other";
  const firstLecturer = await browser.newPage();
  const secondLecturer = await browser.newPage();

  await firstLecturer.goto(`/?room=${room}&role=lecturer`);
  await secondLecturer.goto(`/?room=${room}&role=lecturer`);

  await firstLecturer.getByRole("button", { name: /Claim room/i }).click();
  await expect(firstLecturer.getByText("You control this room")).toBeVisible();
  await expect(secondLecturer.getByText("Claimed by another lecturer device")).toBeVisible({ timeout: 3000 });
  await expect(secondLecturer.getByRole("button", { name: /Reveal next step/i })).toBeDisabled();

  await firstLecturer.close();
  await secondLecturer.close();
});

test("shares student activity votes across the room", async ({ browser }) => {
  const room = "e2e-shared-votes";
  const lecturer = await browser.newPage();
  const student = await browser.newPage();

  await lecturer.goto(`/?room=${room}&role=lecturer`);
  await student.goto(`/?room=${room}&role=student`);
  await student.getByRole("button", { name: /Require every handoff/ }).click();

  await expect(lecturer.getByText("Group choice: Require every handoff to name its input and output")).toBeVisible({
    timeout: 3000,
  });

  await lecturer.close();
  await student.close();
});

test("keeps workflow board cards inside their containers", async ({ page }) => {
  await page.setViewportSize({ width: 1365, height: 768 });
  await page.goto("/?room=e2e-layout&role=lecturer");

  const overflowingCards = await page.locator("[data-agent-card]").evaluateAll(
    (cards) =>
      cards
        .map((card) => {
          const cardBox = card.getBoundingClientRect();
          const overflowingChildren = [...card.querySelectorAll("*")].filter((child) => {
            const childBox = child.getBoundingClientRect();
            return childBox.left < cardBox.left - 1 || childBox.right > cardBox.right + 1;
          });

          return overflowingChildren.length;
        })
        .filter((count) => count > 0).length,
  );

  expect(overflowingCards).toBe(0);
});

test("keeps the mobile page within the viewport", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/?room=e2e-mobile&role=lecturer");

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);

  expect(overflow).toBeLessThanOrEqual(1);
});

test("serves the health endpoint", async ({ request }) => {
  const response = await request.get("/api/health");

  expect(response.ok()).toBe(true);
  await expect(response.json()).resolves.toEqual({
    ok: true,
    name: "agentic-workflow-classroom",
    routes: ["/", "/api/session", "/api/health"],
  });
});

test("serves the generated stylesheet", async ({ request }) => {
  const response = await request.get("/styles.css");

  expect(response.ok()).toBe(true);
  expect(response.headers()["content-type"]).toContain("text/css");
  await expect(response.text()).resolves.toContain("--color-app-canvas:#f3eee6");
});
