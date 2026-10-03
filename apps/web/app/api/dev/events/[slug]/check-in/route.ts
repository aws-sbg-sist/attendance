import { submitFixtureAttendance } from "@attendance/checkin-experience/server/fixtures";
import { cookies } from "next/headers";
import { parseCheckInRequest } from "../../../../../../lib/check-in-request.mjs";
import { GATE_COOKIE_NAME, readGateCookie } from "../../../../../../lib/gate-session.mjs";

type CheckInRouteContext = { params: Promise<{ slug: string }> };

const responseHeaders = { "Cache-Control": "no-store", "Content-Type": "application/json" };

function json(body: unknown, status: number) {
  return Response.json(body, { status, headers: responseHeaders });
}

export async function POST(request: Request, { params }: CheckInRouteContext) {
  if (process.env.NODE_ENV === "production") return json({ ok: false }, 404);
  if (!request.headers.get("content-type")?.startsWith("application/json")) return json({ ok: false }, 415);

  const contentLength = Number(request.headers.get("content-length") ?? "0");
  if (contentLength > 1024) return json({ ok: false }, 413);

  const { slug } = await params;
  const cookieStore = await cookies();
  if (readGateCookie(cookieStore.get(GATE_COOKIE_NAME)?.value, slug) !== "valid") {
    return json({ ok: false }, 403);
  }

  let submission;
  try {
    submission = parseCheckInRequest(await request.json());
  } catch {
    return json({ ok: false }, 400);
  }
  if (!submission) return json({ ok: false }, 400);

  try {
    const result = await submitFixtureAttendance(slug, submission.registrationId, submission.location);
    if (result.status === "invalid") return json({ status: "invalid" }, 400);
    if (result.status === "locked") return json(result, 429);
    if (result.status === "location-rejected") return json(result, 422);

    // This development adapter returns the shared response shape but does not persist attendance.
    return json(result, result.status === "already-recorded" ? 409 : 200);
  } catch {
    return json({ status: "unavailable" }, 503);
  }
}
