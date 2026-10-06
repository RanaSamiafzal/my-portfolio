"use server";

import { revalidatePath } from "next/cache";
import { createGuestbookEntry, deleteGuestbookEntry, hasDatabase, recentGuestbookCount } from "@repo/db";
import { auth, signIn, signOut } from "@/auth";
import { guestbookSchema } from "@/lib/validation";

export type GuestbookState = { error?: string; ok?: boolean };

export async function signInWith(provider: string) {
  await signIn(provider, { redirectTo: "/guestbook" });
}

export async function signOutAction() {
  await signOut({ redirectTo: "/guestbook" });
}

export async function postEntry(_prev: GuestbookState, formData: FormData): Promise<GuestbookState> {
  const session = await auth();
  if (!session?.user?.email) return { error: "Sign in to sign the guestbook." };
  if (!hasDatabase()) return { error: "The guestbook database isn't connected yet." };

  const parsed = guestbookSchema.safeParse({ body: formData.get("body") });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid message" };

  if ((await recentGuestbookCount(session.user.email)) >= 3) {
    return { error: "You've posted a few times already — try again in a bit." };
  }

  await createGuestbookEntry({
    author: session.user.name ?? session.user.email.split("@")[0]!,
    email: session.user.email,
    avatar: session.user.image ?? null,
    body: parsed.data.body,
  });
  revalidatePath("/guestbook");
  return { ok: true };
}

export async function removeEntry(id: number) {
  const session = await auth();
  if (!session?.user?.isAdmin) return;
  await deleteGuestbookEntry(id);
  revalidatePath("/guestbook");
}
