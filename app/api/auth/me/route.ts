import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const SESSION_COOKIE_NAME = "c2c_session";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);

    if (!sessionCookie || !sessionCookie.value) {
      return NextResponse.json({ authenticated: false, user: null });
    }

    try {
      const data = JSON.parse(sessionCookie.value);
      if (data && data.username === "Superucom") {
        return NextResponse.json({ authenticated: true, user: { username: "Superucom" } });
      }
    } catch {
      // Invalid cookie format
    }

    return NextResponse.json({ authenticated: false, user: null });
  } catch (error) {
    console.error("Auth status check error:", error);
    return NextResponse.json({ authenticated: false, user: null });
  }
}
