import type { LucideIcon } from "lucide-react";

interface ControlCardProps {
  title: string;
  icon: LucideIcon;
  actions: string[];
  onAction?: (action: string) => void;
}

export default function ControlCard({
  title,
  icon: Icon,
  actions,
  onAction,
}: ControlCardProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
          <Icon size={17} />
        </div>

        <h3 className="text-xs font-semibold text-slate-800">
          {title}
        </h3>
      </div>

      <div className="space-y-2">
        {actions.map((action) => (
          <button
            key={action}
            onClick={() => onAction?.(action)}
            className="w-full rounded-md border border-slate-100 bg-slate-50 px-3 py-2 text-left text-[11px] font-medium text-slate-600 transition hover:border-blue-100 hover:bg-blue-50 hover:text-blue-600"
          >
            {action}
          </button>
        ))}
      </div>
    </div>
  );
}