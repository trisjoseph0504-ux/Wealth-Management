/** Alerts — demonstrates a clean, premium empty state (Phase 1 ships no fake rows). */
import { alerts } from "@/data/mock";
import { Card, CardHeader, CardLink } from "@/components/ui/card";
import { Button, EmptyState } from "@/components/ui/primitives";
import { IconBell, IconPlus } from "@/components/ui/icons";

export function AlertsPanel() {
  const hasAlerts = alerts.length > 0;
  return (
    <Card className="flex h-full flex-col">
      <CardHeader
        title="Alerts"
        subtitle="Price & risk triggers"
        icon={<IconBell size={16} />}
        action={hasAlerts ? <CardLink label="Manage" /> : undefined}
      />
      <div className="flex flex-1 items-center justify-center">
        {hasAlerts ? null : (
          <EmptyState
            icon={<IconBell size={18} />}
            title="No active alerts"
            description="Set price targets, drawdown limits, or volatility thresholds to be notified the moment conditions change."
            action={
              <Button variant="outline">
                <IconPlus size={14} />
                Create alert
              </Button>
            }
          />
        )}
      </div>
    </Card>
  );
}
