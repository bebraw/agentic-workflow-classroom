export function createHealthResponse(routes: string[]): Response {
  return Response.json({
    ok: true,
    name: "agentic-workflow-classroom",
    routes,
  });
}
