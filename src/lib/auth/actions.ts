"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/server";
import type { AuthActionResult } from "@/lib/auth/domain";

export async function signInAction(
  _prev: AuthActionResult,
  formData: FormData,
): Promise<AuthActionResult> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { status: "error", message: "Email and password are required." };
  }

  try {
    const headerList = await headers();
    const res = await auth.api.signInEmail({
      body: {
        email,
        password,
      },
      headers: headerList,
      asResponse: false,
    });

    if (!res) {
      return { status: "error", message: "Invalid email or password." };
    }
  } catch (err: unknown) {
    console.error("[auth] signIn error:", err);
    const errorMsg =
      err instanceof Error ? err.message : "Failed to sign in. Please try again.";
    return { status: "error", message: errorMsg };
  }

  redirect("/session");
}

export async function signUpAction(
  _prev: AuthActionResult,
  formData: FormData,
): Promise<AuthActionResult> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!name || !email || !password) {
    return { status: "error", message: "Name, email, and password are required." };
  }

  if (password.length < 8) {
    return { status: "error", message: "Password must be at least 8 characters." };
  }

  try {
    const headerList = await headers();
    const res = await auth.api.signUpEmail({
      body: {
        name,
        email,
        password,
      },
      headers: headerList,
      asResponse: false,
    });

    if (!res) {
      return { status: "error", message: "Could not create account." };
    }
  } catch (err: unknown) {
    console.error("[auth] signUp error:", err);
    const errorMsg =
      err instanceof Error ? err.message : "Failed to sign up. Email may already be in use.";
    return { status: "error", message: errorMsg };
  }

  redirect("/session");
}

export async function signOutAction(): Promise<void> {
  try {
    const headerList = await headers();
    await auth.api.signOut({
      headers: headerList,
    });
  } catch (err) {
    console.error("Sign out error:", err);
  }

  redirect("/sign-in");
}
