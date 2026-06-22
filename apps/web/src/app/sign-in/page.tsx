/**
 * Sign-in page (Backend B1). Passwordless magic-link + optional Google. In demo
 * mode (AUTH_ENABLED unset) it shows a notice and the actions are no-ops; the
 * app is fully usable without signing in. The form posts to gated server actions.
 */
import { authEnabled } from "@/server/auth";
import { signInWithEmail, signInWithGoogle } from "@/server/actions/auth";
import { LwWordmark } from "@/components/shell/logo";
import { Button } from "@/components/ui/primitives";
import { IconSparkles } from "@/components/ui/icons";

export default function SignInPage() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex justify-center">
          <LwWordmark />
        </div>

        <div className="rounded-[10px] border border-hairline bg-surface p-6 shadow-[var(--shadow-elevation)]">
          <h1 className="text-lg font-semibold tracking-tight text-fg">Sign in</h1>
          <p className="mt-1 text-[13px] text-fg-subtle">
            Access your Lewis Wealth Intelligence workspace.
          </p>

          {!authEnabled && (
            <div className="mt-4 flex items-start gap-2 rounded-[8px] border border-info/30 bg-info/10 px-3 py-2.5 text-[12px] text-info">
              <IconSparkles size={14} className="mt-0.5 shrink-0" />
              <span>
                Demo mode — authentication is disabled. Set <code className="tnum">AUTH_ENABLED=true</code> with a
                database and provider keys to enable real sign-in.
              </span>
            </div>
          )}

          <form action={signInWithEmail} className="mt-5 space-y-3">
            <label className="block">
              <span className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.12em] text-fg-subtle">
                Email
              </span>
              <input
                type="email"
                name="email"
                required
                placeholder="you@firm.com"
                className="w-full rounded-[6px] border border-hairline bg-inset px-3 py-2.5 text-[13px] text-fg placeholder:text-fg-subtle transition focus:border-emerald/40 focus:outline-none"
              />
            </label>
            <Button type="submit" variant="primary" className="w-full justify-center py-2.5">
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

        <p className="mt-4 text-center text-[10px] leading-relaxed text-fg-subtle">
          Passwordless and secure. By continuing you agree this is a research tool — not
          personalized investment advice.
        </p>
      </div>
    </div>
  );
}
