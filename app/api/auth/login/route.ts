import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const AUTH_USER = "Superucom";
const AUTH_PASS = "Company789+";
const SESSION_COOKIE_NAME = "c2c_session";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (username !== AUTH_USER || password !== AUTH_PASS) {
      return NextResponse.json(
        { error: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" },
        { status: 401 }
      );
    }

    // Set secure HTTP-Only cookie
    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE_NAME, JSON.stringify({ username: AUTH_USER }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return NextResponse.json({
      success: true,
      user: { username: AUTH_USER },
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในระบบเข้าสู่ระบบ" },
      { status: 500 }
    );
  }
}
