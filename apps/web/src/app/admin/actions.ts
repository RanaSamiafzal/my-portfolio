"use server";

import { AuthError } from "next-auth";
import { revalidatePath } from "next/cache";
import { deleteMessage, markMessageRead } from "@repo/db";
import { auth, signIn, signOut } from "@/auth";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.isAdmin) throw new Error("Not authorised");
}

export async function toggleRead(id: number, read: boolean) {
  await requireAdmin();
  await markMessageRead(id, read);
  revalidatePath("/admin");
}

export async function removeMessage(id: number) {
  await requireAdmin();
  await deleteMessage(id);
  revalidatePath("/admin");
}

export type AdminLoginState = { error?: string };

export async function adminLogin(_prev: AdminLoginState, formData: FormData): Promise<AdminLoginState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) return { error: "Email and password are required." };

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: "/admin",
    });
  } catch (error) {
    // NextAuth throws NEXT_REDIRECT on success — rethrow so the redirect happens.
    if (error instanceof AuthError) {
      return { error: "Wrong email or password." };
    }
    throw error;
  }

  return {};
}

export async function adminSignOut() {
  await signOut({ redirectTo: "/admin/login" });
}
