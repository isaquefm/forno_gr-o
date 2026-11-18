import { NextResponse } from "next/server";
import { AUTH_COOKIE_NAME, generateSessionToken, verifyPassword } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const { password } = await request.json();

    if (!password || !verifyPassword(password)) {
      return NextResponse.json(
        { error: "Senha incorreta. Tente novamente." },
        { status: 401 },
      );
    }

    const token = generateSessionToken(password);
    const response = NextResponse.json({ success: true });

    response.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 dias
    });

    return response;
  } catch (error) {
    console.error("Erro no login admin:", error);
    return NextResponse.json({ error: "Erro no servidor." }, { status: 500 });
  }
}
