"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

const MOCK_USER = {
  name: "Hardik R",
  email: "hardik.r@ciright.com",
  initials: "HR",
};

export function UserMenu() {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const user = useMemo(() => MOCK_USER, []);

  async function signOut() {
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => null);
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-900/10 bg-white text-sm font-semibold text-slate-800 shadow-sm transition hover:border-primary/25"
        aria-haspopup="menu"
        aria-expanded={open}
        title="Account"
      >
        {user.initials}
      </button>

      {open ? (
        <>
          <button
            type="button"
            className="fixed inset-0 z-30 cursor-default bg-transparent"
            aria-label="Close account menu"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 z-40 mt-2 flex w-max max-w-[min(100vw-2rem,22rem)] flex-col items-stretch overflow-hidden rounded-2xl border border-slate-900/10 bg-white shadow-glass">
            <div className="w-full min-w-0 px-4 py-3">
              <p className="whitespace-nowrap text-sm font-semibold text-slate-900">{user.name}</p>
              <p className="mt-1 whitespace-nowrap text-sm text-slate-500">{user.email}</p>
            </div>
            <div className="h-px w-full shrink-0 bg-slate-200/90" aria-hidden />
            <div className="w-full min-w-0 p-2">
              <button
                type="button"
                onClick={signOut}
                className="flex w-full min-w-0 items-center gap-2 whitespace-nowrap rounded-xl px-3 py-2 text-sm font-semibold text-slate-800 transition hover:bg-slate-900/[0.04]"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden
                >
                  <path
                    d="M10 7V6a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-6a2 2 0 0 1-2-2v-1"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                  <path
                    d="M3 12h9"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                  <path
                    d="M9 9l3 3-3 3"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span>Sign out</span>
              </button>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}

