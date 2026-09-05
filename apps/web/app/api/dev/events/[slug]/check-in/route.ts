import { verifyFixtureRegistration } from "@attendance/checkin-experience/server/fixtures";
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
    const registration = await verifyFixtureRegistration(slug, submission.registrationId);
    if (!registration.ok) return json({ ok: false }, 400);

    // This development adapter confirms only the local flow. The shared backend owns persistence.
    return json({ ok: true }, 200);
  } catch {
    return json({ ok: false, unavailable: true }, 503);
  }
}
