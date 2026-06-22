/** Loading screen for the security detail page (shown while live quote/profile
 *  data is fetched) — the same branded screen used across the app. */
import { LoadingScreen } from "@/components/shell/loading-screen";

export default function SecurityLoading() {
  return <LoadingScreen label="Loading security…" />;
}
