/**
 * Sign-in screen. Standalone (no app shell). Branded with the logo. When a site
 * password is configured it shows a password field gated by the middleware; when
 * not configured (local/open mode) it just offers a way into the workspace.
 */
import Link from "next/link";
import { gateLoginAction } from "@/server/actions/gate";
import { LwLogo } from "@/components/shell/logo";
import { Button } from "@/components/ui/primitives";
import { IconChevronRight, IconShield } from "@/components/ui/icons";

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; from?: string }>;
}) {
  const sp = await searchParams;
  const configured = Boolean(process.env.SITE_PASSWORD);
  const from = typeof sp.from === "string" && sp.from.startsWith("/") ? sp.from : "/";

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10">
      <div className="pointer-events-none absolute -top-32 left-1/2 size-[460px] -translate-x-1/2 rounded-full bg-emerald/10 blur-[130px]" />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.4]"
        style={{ background: "radial-gradient(120% 80% at 50% -10%, color-mix(in oklab, var(--color-emerald) 6%, transparent), transparent 60%)" }}
      />

      <div className="relative w-full max-w-[400px]">
        <div className="mb-7 flex flex-col items-center gap-3.5 text-center">
          <span className="flex size-14 items-center justify-center rounded-[14px] border border-hairline bg-surface/80 shadow-[var(--shadow-elevation)] backdrop-blur">
            <LwLogo size={34} />
          </span>
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-fg">Lewis Wealth Intelligence</h1>
            <p className="mt-1 text-[12.5px] text-fg-subtle">Institutional Intelligence Platform</p>
          </div>
        </div>

        <div className="rounded-[12px] border border-hairline bg-surface/80 p-6 shadow-[var(--shadow-elevation)] backdrop-blur">
          {configured ? (
            <>
              <h2 className="text-[15px] font-semibold tracking-tight text-fg">Enter password</h2>
              <p className="mt-0.5 text-[12.5px] text-fg-subtle">This workspace is private.</p>

              {sp.error && (
                <div className="mt-4 rounded-[8px] border border-neg/30 bg-neg/10 px-3 py-2.5 text-[12px] text-neg">
                  Incorrect password — try again.
                </div>
              )}

              <form action={gateLoginAction} className="mt-5 space-y-3">
                <input type="hidden" name="from" value={from} />
                <label className="block">
                  <span className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.12em] text-fg-subtle">
                    Password
                  </span>
                  <input
                    type="password"
                    name="password"
                    required
                    autoFocus
                    autoComplete="current-password"
                    className="w-full rounded-[6px] border border-hairline bg-inset px-3 py-2.5 text-[13px] text-fg placeholder:text-fg-subtle transition focus:border-emerald/40 focus:outline-none"
                  />
                </label>
                <Button type="submit" variant="primary" className="w-full justify-center py-2.5">
                  <IconShield size={14} /> Sign in
                </Button>
              </form>
            </>
          ) : (
            <>
              <h2 className="text-[15px] font-semibold tracking-tight text-fg">Welcome</h2>
              <p className="mt-0.5 text-[12.5px] text-fg-subtle">
                Open mode — no site password is set, so the workspace is unlocked.
              </p>
              <Link
                href="/"
                className="reduce-motion-safe mt-5 flex w-full items-center justify-center gap-1.5 rounded-[6px] bg-emerald px-3 py-2.5 text-[13px] font-semibold text-accent-contrast transition hover:bg-emerald-bright"
              >
                Enter the workspace
                <IconChevronRight size={15} />
              </Link>
            </>
          )}
        </div>

        <p className="mt-5 text-center text-[10px] leading-relaxed text-fg-subtle">
          A research tool — not personalized investment advice.
        </p>
      </div>
    </div>
  );
}
