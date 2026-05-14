"use client";

import { clsx } from "clsx";
import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRightFromBracket, faGlobe } from "@fortawesome/free-solid-svg-icons";

const MOCK_USER = {
  name: "Hardik R",
  email: "hardik.r@ciright.com",
  initials: "HR",
};

type UserMenuProps = {
  /** Dark surfaces for pages such as My Personal Sites. */
  variant?: "light" | "dark";
};

export function UserMenu({ variant = "light" }: UserMenuProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const dark = variant === "dark";

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
        className={clsx(
          "flex h-10 w-10 items-center justify-center rounded-full border text-sm font-semibold shadow-sm transition",
          dark
            ? "border-white/15 bg-white/10 text-white hover:border-primary/40 hover:bg-white/[0.14]"
            : "border-slate-900/10 bg-white text-slate-800 hover:border-primary/25"
        )}
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
          <div
            className={clsx(
              "absolute right-0 z-40 mt-2 flex w-max max-w-[min(100vw-2rem,22rem)] flex-col items-stretch overflow-hidden rounded-2xl border shadow-glass",
              dark
                ? "border-white/10 bg-[#151b2a] text-white"
                : "border-slate-900/10 bg-white"
            )}
          >
            <div className="w-full min-w-0 px-4 py-3">
              <p
                className={clsx(
                  "whitespace-nowrap text-sm font-semibold",
                  dark ? "text-white" : "text-slate-900"
                )}
              >
                {user.name}
              </p>
              <p
                className={clsx("mt-1 whitespace-nowrap text-sm", dark ? "text-slate-400" : "text-slate-500")}
              >
                {user.email}
              </p>
            </div>
            <div
              className={clsx("h-px w-full shrink-0", dark ? "bg-white/10" : "bg-slate-200/90")}
              aria-hidden
            />
            <div className="w-full min-w-0 p-2">
              <Link
                href="/dashboard/sites"
                onClick={() => setOpen(false)}
                className={clsx(
                  "flex w-full min-w-0 items-center gap-2 whitespace-nowrap rounded-xl px-3 py-2 text-sm font-semibold transition",
                  dark
                    ? "text-white hover:bg-white/[0.06]"
                    : "text-slate-800 hover:bg-slate-900/[0.04]"
                )}
              >
                <FontAwesomeIcon
                  icon={faGlobe}
                  className="h-[18px] w-[18px] shrink-0 opacity-90"
                  aria-hidden
                />
                <span>My Personal Sites</span>
              </Link>
              <button
                type="button"
                onClick={signOut}
                className={clsx(
                  "flex w-full min-w-0 items-center gap-2 whitespace-nowrap rounded-xl px-3 py-2 text-sm font-semibold transition",
                  dark
                    ? "text-white hover:bg-white/[0.06]"
                    : "text-slate-800 hover:bg-slate-900/[0.04]"
                )}
              >
                <FontAwesomeIcon
                  icon={faArrowRightFromBracket}
                  className="h-[18px] w-[18px] shrink-0 opacity-90"
                  aria-hidden
                />
                <span>Sign out</span>
              </button>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}

