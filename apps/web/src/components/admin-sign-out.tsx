"use client";

export function AdminSignOut({ className = "min-h-11 font-mono text-xs text-muted-soft hover:text-accent", redirectTo = "/admin/login" }: { className?: string; redirectTo?: string }) {
  async function signOut() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = redirectTo;
  }

  return (
    <button type="button" onClick={signOut} className={className}>
      SIGN OUT
    </button>
  );
}
