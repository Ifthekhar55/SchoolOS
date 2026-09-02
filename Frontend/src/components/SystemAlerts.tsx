import {
  AlertTriangle,
  Cloud,
  CreditCard,
  Settings,
} from "lucide-react";

const alerts = [
  {
    title: "124 Unpaid Fees",
    description: "Due date passed for 3 sections",
    icon: CreditCard,
    action: "Review",
  },
  {
    title: "Inactive Staff Detected",
    description: "3 teachers haven't logged in for 30+ days",
    icon: AlertTriangle,
    action: "Review",
  },
  {
    title: "Cloud Backup Sync",
    description: "Scheduled for today at 11:59 PM",
    icon: Cloud,
    action: "Settings",
  },
];

export default function SystemAlerts() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-sm font-bold text-slate-900">
          System Alerts
        </h2>

        <Settings size={16} className="text-slate-400" />
      </div>

      <div className="space-y-3">
        {alerts.map((alert) => {
          const Icon = alert.icon;

          return (
            <div
              key={alert.title}
              className="flex items-center gap-3 rounded-lg border border-slate-100 bg-slate-50 p-3"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-slate-500 shadow-sm">
                <Icon size={17} />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-slate-800">
                  {alert.title}
                </p>

                <p className="mt-0.5 text-[10px] leading-4 text-slate-400">
                  {alert.description}
                </p>
              </div>

              <button className="rounded-md bg-white px-2.5 py-1.5 text-[10px] font-semibold text-blue-600 shadow-sm hover:bg-blue-50">
                {alert.action}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}