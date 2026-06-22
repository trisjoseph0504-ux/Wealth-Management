/**
 * Root route-level loading screen — the fallback shown while a server-rendered
 * page (e.g. the dashboard or settings) is being prepared. Routes with their own
 * loading.tsx use those instead.
 */
import { LoadingScreen } from "@/components/shell/loading-screen";

export default function Loading() {
  return <LoadingScreen />;
}
