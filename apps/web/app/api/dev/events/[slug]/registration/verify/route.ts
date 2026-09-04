import { verifyFixtureRegistration } from "@attendance/checkin-experience/server/fixtures";
import { cookies } from "next/headers";
import { GATE_COOKIE_NAME, readGateCookie } from "../../../../../../../lib/gate-session.mjs";

type VerificationRouteContext = {
  params: Promise<{ slug: string }>;
};

const responseHeaders = {
  "Cache-Control": "no-store",
  "Content-Type": "application/json",
};

function json(body: unknown, status: number) {
  return Response.json(body, { status, headers: responseHeaders });
}

export async function POST(request: Request, { params }: VerificationRouteContext) {
  if (process.env.NODE_ENV === "production") return json({ ok: false }, 404);
  if (request.headers.get("content-type") !== "application/json") return json({ ok: false }, 415);

  const contentLength = Number(request.headers.get("content-length") ?? "0");
  if (contentLength > 512) return json({ ok: false }, 413);

  const { slug } = await params;
  const cookieStore = await cookies();
  const gateState = readGateCookie(cookieStore.get(GATE_COOKIE_NAME)?.value, slug);
  if (gateState !== "valid") return json({ ok: false }, 403);

  let registrationId: string;
  try {
    const body = (await request.json()) as { registrationId?: unknown };
    if (typeof body.registrationId !== "string") return json({ ok: false }, 400);
    registrationId = body.registrationId.trim();
  } catch {
    return json({ ok: false }, 400);
  }

  if (!registrationId || registrationId.length > 128) return json({ ok: false }, 400);

  try {
    const result = await verifyFixtureRegistration(slug, registrationId);
    return json(result, 200);
  } catch {
    return json({ ok: false, unavailable: true }, 503);
  }
}
