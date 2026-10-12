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
  // Use the secret from env if available, otherwise use a fallback (in dev)
  password: process.env.SECRET_COOKIE_PASSWORD || "complex_password_at_least_32_characters_long",
  cookieName: "gci_admin_session",
  cookieOptions: {
    // secure: true should be used in production (HTTPS) but can be false in local development
    secure: process.env.NODE_ENV === "production",
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
