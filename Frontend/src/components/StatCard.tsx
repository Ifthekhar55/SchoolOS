import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  icon: LucideIcon;
  iconClass: string;
  positive?: boolean;
}

export default function StatCard({
  title,
  value,
  change,
  icon: Icon,
  iconClass,
  positive = true,
}: StatCardProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-slate-500">
            {title}
          </p>

          <h3 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
            {value}
          </h3>
        </div>

        <div
          className={`flex h-10 w-10 items-center justify-center rounded-lg ${iconClass}`}
        >
          <Icon size={20} />
        </div>
      </div>

      <div className="mt-4 flex items-center gap-1 text-xs">
        <span
          className={
            positive
              ? "font-semibold text-emerald-600"
              : "font-semibold text-red-500"
          }
        >
          {positive ? "↑" : "↓"} {change}
        </span>

        <span className="text-slate-400">
          this month
        </span>
      </div>
    </div>
  );
}