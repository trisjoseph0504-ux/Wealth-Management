/**
 * Sign-in screen. Standalone (rendered without the app shell). Branded with the
 * logo mark; passwordless magic-link + Google for real auth (gated server
 * actions). In demo mode (AUTH_ENABLED unset) it shows a notice and a direct
 * "Enter the workspace" action — the app is fully usable without signing in.
 */
import Link from "next/link";
import { authEnabled } from "@/server/auth";
import { signInWithEmail, signInWithGoogle } from "@/server/actions/auth";
import { LwLogo } from "@/components/shell/logo";
import { Button } from "@/components/ui/primitives";
import { IconSparkles, IconChevronRight } from "@/components/ui/icons";

export default function SignInPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10">
      {/* Ambient brand glow */}
      <div className="pointer-events-none absolute -top-32 left-1/2 size-[460px] -translate-x-1/2 rounded-full bg-emerald/10 blur-[130px]" />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.4]"
        style={{ background: "radial-gradient(120% 80% at 50% -10%, color-mix(in oklab, var(--color-emerald) 6%, transparent), transparent 60%)" }}
      />

      <div className="relative w-full max-w-[400px]">
        {/* Brand lockup */}
        <div className="mb-7 flex flex-col items-center gap-3.5 text-center">
          <span className="flex size-14 items-center justify-center rounded-[14px] border border-hairline bg-surface/80 shadow-[var(--shadow-elevation)] backdrop-blur">
            <LwLogo size={34} />
          </span>
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-fg">Lewis Wealth Intelligence</h1>
            <p className="mt-1 text-[12.5px] text-fg-subtle">Private wealth · institutional intelligence</p>
          </div>
        </div>

        {/* Card */}
        <div className="rounded-[12px] border border-hairline bg-surface/80 p-6 shadow-[var(--shadow-elevation)] backdrop-blur">
          <h2 className="text-[15px] font-semibold tracking-tight text-fg">Sign in</h2>
          <p className="mt-0.5 text-[12.5px] text-fg-subtle">Access your workspace.</p>

          {!authEnabled && (
            <>
              <div className="mt-4 flex items-start gap-2 rounded-[8px] border border-info/30 bg-info/10 px-3 py-2.5 text-[12px] text-info">
                <IconSparkles size={14} className="mt-0.5 shrink-0" />
                <span>Demo mode — sign-in is optional. Enter directly, or use the form below once auth is enabled.</span>
              </div>
              <Link
                href="/"
                className="reduce-motion-safe mt-4 flex w-full items-center justify-center gap-1.5 rounded-[6px] bg-emerald px-3 py-2.5 text-[13px] font-semibold text-accent-contrast transition hover:bg-emerald-bright"
              >
                Enter the workspace
                <IconChevronRight size={15} />
              </Link>
              <div className="my-4 flex items-center gap-3 text-[10px] uppercase tracking-[0.14em] text-fg-subtle">
                <span className="h-px flex-1 bg-hairline" /> or sign in <span className="h-px flex-1 bg-hairline" />
              </div>
            </>
          )}

          <form action={signInWithEmail} className={authEnabled ? "mt-5 space-y-3" : "space-y-3"}>
            <label className="block">
              <span className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.12em] text-fg-subtle">Email</span>
              <input
                type="email"
                name="email"
                required
                placeholder="you@firm.com"
                className="w-full rounded-[6px] border border-hairline bg-inset px-3 py-2.5 text-[13px] text-fg placeholder:text-fg-subtle transition focus:border-emerald/40 focus:outline-none"
              />
            </label>
            <Button type="submit" variant={authEnabled ? "primary" : "outline"} className="w-full justify-center py-2.5">
              Email me a magic link
            </Button>
          </form>

          <div className="my-4 flex items-center gap-3 text-[10px] uppercase tracking-[0.14em] text-fg-subtle">
            <span className="h-px flex-1 bg-hairline" /> or <span className="h-px flex-1 bg-hairline" />
          </div>

          <form action={signInWithGoogle}>
            <Button type="submit" variant="outline" className="w-full justify-center py-2.5">
              Continue with Google
            </Button>
          </form>
        </div>

        <p className="mt-5 text-center text-[10px] leading-relaxed text-fg-subtle">
          Passwordless and secure. By continuing you agree this is a research tool —
          <br className="hidden sm:inline" /> not personalized investment advice.
        </p>
      </div>
    </div>
  );
}
