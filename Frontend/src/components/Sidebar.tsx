import {
  LayoutDashboard,
  Users,
  GraduationCap,
  School,
  BookOpen,
  CalendarCheck,
  ClipboardList,
  Award,
  CreditCard,
  Bell,
  CalendarDays,
  BarChart3,
  Settings,
  UserCog,
  LogOut,
  ChevronDown,
  Home,
  Building2,
  MessageSquare,
  FileText,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const currentPath = location.pathname;

  // Get dynamic menu items based on user role
  const getMenuItems = () => {
    const baseItems = [];

    // Dashboard is common for all roles
    baseItems.push({
      name: "Dashboard",
      icon: LayoutDashboard,
      path: "/dashboard",
    });

    switch (user?.role) {
      case 'super_admin':
        return [
          ...baseItems,
          { name: "Schools", icon: Building2, path: "/schools" },
          { name: "Users", icon: Users, path: "/users" },
          { name: "Reports", icon: BarChart3, path: "/reports" },
          { name: "Settings", icon: Settings, path: "/settings" },
        ];

      case 'school_admin':
        return [
          ...baseItems,
          { name: "Students", icon: Users, path: "/students" },
          { name: "Teachers", icon: GraduationCap, path: "/teachers" },
          { name: "Classes & Sections", icon: School, path: "/classes" },
          { name: "Subjects", icon: BookOpen, path: "/subjects" },
          { name: "Attendance", icon: CalendarCheck, path: "/attendance" },
          { name: "Exams", icon: ClipboardList, path: "/exams" },
          { name: "Results", icon: Award, path: "/results" },
          { name: "Fees", icon: CreditCard, path: "/fees" },
          { name: "Notices", icon: Bell, path: "/notices" },
          { name: "Calendar", icon: CalendarDays, path: "/calendar" },
          { name: "Reports", icon: BarChart3, path: "/reports" },
        ];

      case 'teacher':
        return [
          ...baseItems,
          { name: "My Students", icon: Users, path: "/students" },
          { name: "My Classes", icon: School, path: "/my-classes" },
          { name: "Attendance", icon: CalendarCheck, path: "/attendance" },
          { name: "Exams", icon: ClipboardList, path: "/exams" },
          { name: "Results", icon: Award, path: "/results" },
          { name: "Notices", icon: Bell, path: "/notices" },
          { name: "Calendar", icon: CalendarDays, path: "/calendar" },
        ];

      case 'student':
        return [
          ...baseItems,
          { name: "My Classes", icon: School, path: "/classes" },
          { name: "Attendance", icon: CalendarCheck, path: "/attendance" },
          { name: "Exams", icon: ClipboardList, path: "/exams" },
          { name: "Results", icon: Award, path: "/results" },
          { name: "Fees", icon: CreditCard, path: "/fees" },
          { name: "Notices", icon: Bell, path: "/notices" },
          { name: "Calendar", icon: CalendarDays, path: "/calendar" },
        ];

      case 'parent':
        return [
          ...baseItems,
          { name: "My Children", icon: Users, path: "/parent" },
          { name: "Attendance", icon: CalendarCheck, path: "/attendance" },
          { name: "Exams", icon: ClipboardList, path: "/exams" },
          { name: "Results", icon: Award, path: "/results" },
          { name: "Fees", icon: CreditCard, path: "/fees" },
          { name: "Notices", icon: Bell, path: "/notices" },
          { name: "Calendar", icon: CalendarDays, path: "/calendar" },
          { name: "Messages", icon: MessageSquare, path: "/messages" },
        ];

      default:
        return baseItems;
    }
  };

  // Get admin menu items (only for super_admin and school_admin)
  const getAdminMenu = () => {
    if (user?.role === 'school_admin') {
      return [
        { name: "Settings", icon: Settings, path: "/settings" },
        { name: "Users & Roles", icon: UserCog, path: "/users" },
      ];
    }
    return [];
  };

  const mainMenu = getMenuItems();
  const adminMenu = getAdminMenu();

  useEffect(() => {
    const syncSidebarState = () => {
      const isOpen = document.body.dataset.mobileSidebar === "open";
      setIsMobileOpen(isOpen);
    };

    syncSidebarState();
    window.addEventListener("sidebar-toggle", syncSidebarState);

    return () => {
      window.removeEventListener("sidebar-toggle", syncSidebarState);
    };
  }, []);

  const closeMobileSidebar = () => {
    document.body.dataset.mobileSidebar = "closed";
    setIsMobileOpen(false);
    window.dispatchEvent(new CustomEvent("sidebar-toggle"));
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    closeMobileSidebar();
  };

  const handleLogout = async () => {
    if (isLoggingOut) return;
    
    if (!confirm("Are you sure you want to logout?")) {
      return;
    }

    setIsLoggingOut(true);
    console.log("🚪 Logout clicked from sidebar");
    
    try {
      await logout();
    } catch (error) {
      console.error("❌ Logout failed:", error);
      localStorage.clear();
      sessionStorage.clear();
      window.location.href = "/login";
    } finally {
      setIsLoggingOut(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(word => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const isActive = (path: string) => {
    return currentPath === path || currentPath.startsWith(path + "/");
  };

  // Show/hide menu items based on role
  const shouldShowMenuItem = (itemName: string) => {
    const role = user?.role;
    
    // Super Admin sees everything
    if (role === 'super_admin') return true;
    
    // School Admin sees everything except Schools
    if (role === 'school_admin') {
      return itemName !== 'Schools';
    }
    
    // Teacher sees limited items
    if (role === 'teacher') {
      const teacherItems = ['Dashboard', 'My Students', 'My Classes', 'Attendance', 'Exams', 'Results', 'Notices', 'Calendar'];
      return teacherItems.includes(itemName);
    }
    
    // Student sees limited items
    if (role === 'student') {
      const studentItems = ['Dashboard', 'My Classes', 'Attendance', 'Exams', 'Results', 'Fees', 'Notices', 'Calendar'];
      return studentItems.includes(itemName);
    }
    
    // Parent sees limited items
    if (role === 'parent') {
      const parentItems = ['Dashboard', 'My Children', 'Attendance', 'Exams', 'Results', 'Fees', 'Notices', 'Calendar', 'Messages'];
      return parentItems.includes(itemName);
    }
    
    return false;
  };

  // Filter main menu based on role
  const filteredMainMenu = mainMenu.filter(item => {
    // Always show Dashboard
    if (item.name === 'Dashboard') return true;
    return shouldShowMenuItem(item.name);
  });

  return (
    <>
      <div
        className={`fixed inset-0 z-30 bg-slate-900/40 transition-opacity duration-200 md:hidden ${isMobileOpen ? "opacity-100" : "pointer-events-none opacity-0"}`}
        onClick={closeMobileSidebar}
        aria-hidden="true"
      />

      <aside
        className={`fixed left-0 top-16 z-40 flex h-[calc(100vh-4rem)] w-64 -translate-x-full flex-col border-r border-slate-200 bg-white transition-transform duration-200 md:top-0 md:h-screen md:translate-x-0 ${isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
      >
        {/* Logo */}
        <div className="flex h-20 items-center gap-3 border-b border-slate-100 px-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-lg font-bold text-white">
          S
        </div>
        <div>
          <h1 className="text-lg font-bold text-slate-900">SchoolOS</h1>
          <p className="text-[11px] text-slate-500">
            Smart School Management
          </p>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto px-4 py-5">
        <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
          Main Menu
        </p>

        <nav className="space-y-1">
          {filteredMainMenu.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);

            return (
              <button
                key={item.name}
                onClick={() => handleNavigation(item.path)}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                  active
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <Icon size={18} strokeWidth={1.8} />
                <span>{item.name}</span>
              </button>
            );
          })}
        </nav>

        {/* Admin Menu - Only for super_admin and school_admin */}
        {adminMenu.length > 0 && (
          <>
            <div className="my-6 border-t border-slate-100" />

            <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Administration
            </p>

            <nav className="space-y-1">
              {adminMenu.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);

                return (
                  <button
                    key={item.name}
                    onClick={() => handleNavigation(item.path)}
                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                      active
                        ? "bg-blue-600 text-white shadow-sm"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    <Icon size={18} strokeWidth={1.8} />
                    <span>{item.name}</span>
                  </button>
                );
              })}
            </nav>
          </>
        )}
      </div>

      {/* School selector and Logout */}
      <div className="border-t border-slate-100 p-4">
        {/* School Selector - Hide for super_admin */}
        {user?.role !== 'super_admin' && (
          <button className="flex w-full items-center gap-3 rounded-xl border border-slate-200 p-3 text-left hover:bg-slate-50 transition-colors">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-sm font-bold text-blue-600">
              {user?.schoolName?.charAt(0).toUpperCase() || "GS"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-slate-800">
                {user?.schoolName || "Greenfield School"}
              </p>
              <p className="text-[10px] text-slate-500">
                Session: 2026-27
              </p>
            </div>
            <ChevronDown size={15} className="text-slate-400" />
          </button>
        )}

        {/* User Info */}
        {user && (
          <div className="mt-3 flex items-center gap-3 rounded-xl bg-slate-50 p-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
              {getInitials(user.name)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-slate-800">
                {user.name}
              </p>
              <p className="text-[10px] text-slate-500 capitalize">
                {user.role?.replace("_", " ")}
              </p>
            </div>
          </div>
        )}

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="mt-2 flex w-full items-center gap-3 rounded-xl p-2.5 text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoggingOut ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-red-600 border-t-transparent" />
              <span className="text-xs font-medium">Logging out...</span>
            </>
          ) : (
            <>
              <LogOut size={17} />
              <span className="text-xs font-medium">Logout</span>
            </>
          )}
        </button>
        </div>
      </aside>
    </>
  );
}