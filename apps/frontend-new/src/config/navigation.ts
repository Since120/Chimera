import { LuLayoutDashboard, LuListTodo, LuActivity, LuSettings, LuTrendingUp } from "react-icons/lu";

export const mainNavItems = [
  { key: 'dashboard', label: "Dashboard", href: "/dashboard", icon: LuLayoutDashboard, exact: true },
  { key: 'categories', label: "Categories", href: "/dashboard/categories", icon: LuListTodo },
  { key: 'trading', label: "Trading", href: "/dashboard/trading", icon: LuActivity },
  { key: 'tracking', label: "Tracking", href: "/dashboard/tracking", icon: LuTrendingUp },
  { key: 'settings', label: "Settings", href: "/dashboard/settings", icon: LuSettings },
];

export const defaultNavIcon = LuLayoutDashboard; // Fallback-Icon
