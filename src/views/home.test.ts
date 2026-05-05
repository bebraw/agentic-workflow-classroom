import { describe, expect, it } from "vitest";
import { renderHomePage } from "./home";

describe("renderHomePage", () => {
  it("renders the classroom demo and stylesheet wiring", () => {
    const html = renderHomePage();

    expect(html).toContain("Agentic Workflow Classroom");
    expect(html).toContain("Reveal next step");
    expect(html).toContain("Pedagogy Lens");
    expect(html).toContain('rel="stylesheet" href="/styles.css"');
  });

  it("keeps the workflow concepts visible in the initial HTML", () => {
    const html = renderHomePage();

    expect(html).toContain("Clarifier");
    expect(html).toContain("Resource Researcher");
    expect(html).toContain("Handoff Packet");
    expect(html).toContain("Evaluate The Workflow");
  });
});
