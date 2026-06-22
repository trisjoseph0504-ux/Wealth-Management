"use server";

/** Site-password gate: verify the password, set the gate cookie, and redirect.
 *  Plus a logout that clears the cookie. */
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { GATE_COOKIE, gateToken } from "@/lib/gate";

export async function gateLoginAction(formData: FormData) {
  const password = String(formData.get("password") ?? "");
  const fromRaw = String(formData.get("from") ?? "/");
  const from = fromRaw.startsWith("/") && !fromRaw.startsWith("/sign-in") ? fromRaw : "/";
  const expected = process.env.SITE_PASSWORD;

  if (!expected || password !== expected) {
    redirect(`/sign-in?error=1${from !== "/" ? `&from=${encodeURIComponent(from)}` : ""}`);
  }

  const jar = await cookies();
  jar.set(GATE_COOKIE, await gateToken(expected), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
    secure: process.env.NODE_ENV === "production",
  });

  redirect(from);
}

export async function gateLogoutAction() {
  const jar = await cookies();
  jar.delete(GATE_COOKIE);
  redirect("/sign-in");
}
