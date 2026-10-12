"use server";

import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";

export async function login(formData: FormData) {
  const rawEmail = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!rawEmail || !password) {
    return { error: "Email and password are required" };
  }

  const email = rawEmail.trim().toLowerCase();

  // Find user by email
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    return { error: "Invalid email or password" };
  }

  // Compare using bcrypt (works with $2y$ legacy hashes)
  const isValid = await bcrypt.compare(password, user.password_hash);

  if (!isValid) {
    return { error: "Invalid email or password" };
  }

  // Set session
  const session = await getSession();
  session.userId = user.id;
  session.email = user.email;
  session.name = user.name;
  session.isLoggedIn = true;
  await session.save();

  // Redirect to admin dashboard
  redirect("/admin");
}

export async function logout() {
  const session = await getSession();
  session.destroy();
  redirect("/admin/login");
}
