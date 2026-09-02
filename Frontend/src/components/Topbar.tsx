import {
  Bell,
  Menu,
} from "lucide-react";

export default function Topbar() {
  const toggleSidebar = () => {
    const nextState = document.body.dataset.mobileSidebar !== "open";
    document.body.dataset.mobileSidebar = nextState ? "open" : "closed";
    window.dispatchEvent(new CustomEvent("sidebar-toggle"));
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6">
      {/* Left */}
      <div className="flex items-center gap-3 md:gap-4">
        <button
          type="button"
          onClick={toggleSidebar}
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 md:hidden"
          aria-label="Toggle sidebar"
        >
          <Menu size={20} />
        </button>

        <div className="hidden items-center gap-2.5 md:flex">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-sm font-bold text-white shadow-sm">
            S
          </div>

          <div className="leading-tight">
            <div className="text-sm font-bold text-slate-900">SchoolOS</div>
            <div className="text-[10px] text-slate-500">Smart School Management</div>
          </div>
        </div>

        <div className="hidden items-center gap-2 pl-1.5 text-sm md:flex">
          <span className="font-semibold text-slate-800">Admin</span>

          <span className="text-slate-300">/</span>

          <span className="text-slate-400">Dashboard</span>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-3">
        <button className="relative rounded-lg p-2 text-slate-500 hover:bg-slate-100">
          <Bell size={20} />

          <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500" />
        </button>
      </div>
    </header>
  );
}