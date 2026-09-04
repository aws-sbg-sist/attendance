import { validateFixtureToken } from "@attendance/checkin-experience/server/fixtures";
import { NextResponse } from "next/server";
import { createGateCookie, GATE_COOKIE_NAME } from "../../../../lib/gate-session.mjs";

type GateRouteContext = {
  params: Promise<{ slug: string }>;
};

export async function GET(request: Request, { params }: GateRouteContext) {
  const { slug } = await params;
  const requestUrl = new URL(request.url);
  const ticket = requestUrl.searchParams.get("ticket") ?? undefined;
  const destination = new URL(`/event/${encodeURIComponent(slug)}`, request.url);
  const response = NextResponse.redirect(destination, 303);

  try {
    const state = await validateFixtureToken(slug, ticket);
    if (state === "missing") {
      response.cookies.delete(GATE_COOKIE_NAME);
      return response;
    }
    const maxAge = state === "valid" ? 90 : 15;

    response.cookies.set({
      name: GATE_COOKIE_NAME,
      value: createGateCookie(slug, state, maxAge),
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge,
    });
  } catch {
    response.cookies.delete(GATE_COOKIE_NAME);
  }

  return response;
}
