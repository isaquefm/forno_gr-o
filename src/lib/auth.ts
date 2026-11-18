import crypto from "crypto";
import { cookies } from "next/headers";

const AUTH_COOKIE_NAME = "fg_admin_session";
const DEFAULT_PASSWORD = "fornograo123";

function getExpectedPassword(): string {
  return process.env.ADMIN_PASSWORD || DEFAULT_PASSWORD;
}

export function generateSessionToken(password: string): string {
  return crypto.createHash("sha256").update(`${password}_salt_fg_2024`).digest("hex");
}

export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(AUTH_COOKIE_NAME);
  if (!sessionCookie?.value) return false;

  const validToken = generateSessionToken(getExpectedPassword());
  return sessionCookie.value === validToken;
}

export function verifyPassword(password: string): boolean {
  return password.trim() === getExpectedPassword().trim();
}

export { AUTH_COOKIE_NAME };
