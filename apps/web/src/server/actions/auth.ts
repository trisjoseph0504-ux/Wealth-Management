"use server";

/**
 * Auth server actions (Backend B1). Gated: no-ops in demo mode. When enabled,
 * they dynamically load the DB-backed instance and start the Auth.js flow.
 */
import { authEnabled } from "@/server/auth";

export async function signInWithEmail(formData: FormData): Promise<void> {
  if (!authEnabled) return;
  const email = String(formData.get("email") ?? "").trim();
  if (!email) return;
  const { signIn } = await import("@/server/auth/instance");
  await signIn("resend", { email, redirectTo: "/" });
}

export async function signInWithGoogle(): Promise<void> {
  if (!authEnabled) return;
  const { signIn } = await import("@/server/auth/instance");
  await signIn("google", { redirectTo: "/" });
}

export async function signOutAction(): Promise<void> {
  if (!authEnabled) return;
  const { signOut } = await import("@/server/auth/instance");
  await signOut({ redirectTo: "/sign-in" });
}
