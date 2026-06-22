/**
 * Settings page. Appearance + regional preferences persist through the data seam
 * (mock in-memory, or Postgres when DATA_SOURCE=db); account info is read-only.
 */
import { getPreferencesAction } from "@/server/actions/preferences";
import { getCurrentUser } from "@/server/auth/current-user";
import { SettingsClient } from "@/components/settings/settings-client";
import { SectionLabel } from "@/components/ui/primitives";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const [prefs, user] = await Promise.all([getPreferencesAction(), getCurrentUser()]);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <SectionLabel>Workspace</SectionLabel>
        <h1 className="mt-1 text-xl font-semibold tracking-tight text-fg">Settings</h1>
        <p className="text-[13px] text-fg-subtle">Appearance, regional formatting, and account.</p>
      </div>

      <SettingsClient prefs={prefs} user={{ name: user.name, email: user.email }} />
    </div>
  );
}
