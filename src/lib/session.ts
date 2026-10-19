import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { connection } from "next/server";

export interface SessionData {
  userId?: number;
  email?: string;
  name?: string;
  isLoggedIn: boolean;
}

export const defaultSession: SessionData = {
  isLoggedIn: false,
};

export const sessionOptions = {
  // Use SECRET_COOKIE_PASSWORD, JWT_SECRET, or default fallback
  password: process.env.SECRET_COOKIE_PASSWORD || process.env.JWT_SECRET || "complex_password_at_least_32_characters_long",
  cookieName: "gci_admin_session",
  cookieOptions: {
    // Only enforce secure: true if COOKIE_SECURE is explicitly true or NEXT_PUBLIC_SITE_URL is https
    // This allows login to work on direct server IPs or HTTP domains without dropping cookies
    secure: process.env.COOKIE_SECURE === "true" || (process.env.NEXT_PUBLIC_SITE_URL ? process.env.NEXT_PUBLIC_SITE_URL.startsWith("https://") : false),
    sameSite: "lax" as const,
    httpOnly: true,
    path: "/",
  },
};

export async function getSession() {
  await connection();
  const cookieStore = await cookies();
  const session = await getIronSession<SessionData>(cookieStore, sessionOptions);

  if (!session.isLoggedIn) {
    session.isLoggedIn = defaultSession.isLoggedIn;
  }

  return session;
}
