"use client";

/**
 * Settings — appearance (theme), regional (currency/locale), and account. Theme
 * flips instantly (data-theme + cookie) and persists through the data seam;
 * regional prefs persist via server action with a transient "Saved" confirmation.
 */
import { useEffect, useState, useTransition } from "react";
import { setThemeAction, setPreferencesAction } from "@/server/actions/preferences";
import type { UserPreferences } from "@/server/data/types";
import { cn } from "@/lib/cn";
import { Card, CardHeader } from "@/components/ui/card";
import { SectionLabel } from "@/components/ui/primitives";
import { IconSettings, IconMoon, IconSun, IconCheck } from "@/components/ui/icons";

const CURRENCIES = ["USD", "EUR", "GBP", "JPY", "CHF", "CAD", "AUD"];
const LOCALES = [
  { value: "en-US", label: "English (United States)" },
  { value: "en-GB", label: "English (United Kingdom)" },
  { value: "en-CA", label: "English (Canada)" },
  { value: "de-DE", label: "German (Germany)" },
  { value: "fr-FR", label: "French (France)" },
  { value: "ja-JP", label: "Japanese (Japan)" },
];

export function SettingsClient({
  prefs,
  user,
}: {
  prefs: UserPreferences;
  user: { name: string | null; email: string };
}) {
  const [theme, setTheme] = useState<"dark" | "light">(prefs.theme);
  const [currency, setCurrency] = useState(prefs.baseCurrency);
  const [locale, setLocale] = useState(prefs.locale);
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    const t = document.documentElement.dataset.theme;
    if (t === "light" || t === "dark") setTheme(t);
  }, []);

  function pickTheme(next: "dark" | "light") {
    document.documentElement.dataset.theme = next;
    document.cookie = `lwi-theme=${next};path=/;max-age=31536000;samesite=lax`;
    setTheme(next);
    void setThemeAction(next).catch(() => {});
  }

  function persist(patch: Partial<Pick<UserPreferences, "baseCurrency" | "locale">>) {
    setSaved(false);
    startTransition(async () => {
      await setPreferencesAction(patch);
      setSaved(true);
      setTimeout(() => setSaved(false), 1800);
    });
  }

  return (
    <div className="grid gap-6">
      {/* Appearance */}
      <Card>
        <CardHeader title="Appearance" subtitle="Theme for the entire workspace" icon={<IconSettings size={16} />} />
        <div className="px-5 py-5">
          <SectionLabel>Theme</SectionLabel>
          <div className="mt-2 inline-flex rounded-[8px] border border-hairline bg-inset p-1">
            {(["dark", "light"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => pickTheme(t)}
                className={cn(
                  "reduce-motion-safe inline-flex items-center gap-2 rounded-[6px] px-4 py-2 text-[13px] font-medium capitalize transition",
                  theme === t ? "bg-surface-2 text-fg" : "text-fg-muted hover:text-fg",
                )}
              >
                {t === "dark" ? <IconMoon size={15} /> : <IconSun size={15} />}
                {t}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Regional */}
      <Card>
        <CardHeader
          title="Regional"
          subtitle="Currency and number formatting"
          icon={<IconSettings size={16} />}
          action={
            saved ? (
              <span className="inline-flex items-center gap-1.5 text-[11px] text-emerald">
                <IconCheck size={13} /> Saved
              </span>
            ) : pending ? (
              <span className="text-[11px] text-fg-subtle">Saving…</span>
            ) : undefined
          }
        />
        <div className="grid gap-5 px-5 py-5 sm:grid-cols-2">
          <label className="block">
            <SectionLabel>Base currency</SectionLabel>
            <select
              value={currency}
              onChange={(e) => {
                setCurrency(e.target.value);
                persist({ baseCurrency: e.target.value });
              }}
              className="mt-2 w-full rounded-[6px] border border-hairline bg-surface px-3 py-2 text-[13px] text-fg transition focus:border-emerald/40 focus:outline-none"
            >
              {CURRENCIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <SectionLabel>Locale</SectionLabel>
            <select
              value={locale}
              onChange={(e) => {
                setLocale(e.target.value);
                persist({ locale: e.target.value });
              }}
              className="mt-2 w-full rounded-[6px] border border-hairline bg-surface px-3 py-2 text-[13px] text-fg transition focus:border-emerald/40 focus:outline-none"
            >
              {LOCALES.map((l) => (
                <option key={l.value} value={l.value}>
                  {l.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </Card>

      {/* Account */}
      <Card>
        <CardHeader title="Account" subtitle="Profile for the Lewis Family Holdings" icon={<IconSettings size={16} />} />
        <div className="grid gap-px bg-hairline sm:grid-cols-2">
          <div className="bg-surface px-5 py-4">
            <SectionLabel>Name</SectionLabel>
            <p className="mt-1 text-[14px] font-medium text-fg">{user.name ?? "—"}</p>
          </div>
          <div className="bg-surface px-5 py-4">
            <SectionLabel>Email</SectionLabel>
            <p className="mt-1 text-[14px] text-fg">{user.email}</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
