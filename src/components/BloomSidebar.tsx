import { NavLink, useLocation } from "react-router-dom";
import { MessageSquare, ListChecks, Calendar, Users, BarChart3, Flower2, Copy } from "lucide-react";
import { useBloom } from "@/contexts/BloomContext";
import { toast } from "sonner";

const navItems = [
  { label: "Chat", path: "/chat", icon: MessageSquare, step: 0 },
  { label: "Plan Assignment", path: "/plan", icon: ListChecks, step: 1 },
  { label: "Personal Calendar", path: "/calendar", icon: Calendar, step: 2 },
  { label: "Delegate Tasks", path: "/delegate", icon: Users, step: 3 },
  { label: "Gantt Chart", path: "/gantt", icon: BarChart3, step: 4 },
  { label: "Flower Progress", path: "/flower", icon: Flower2, step: 5 },
];

const BloomSidebar = () => {
  const { projectName, currentUser, groupCode } = useBloom();
  const location = useLocation();

  return (
    <aside className="w-64 min-h-screen bg-sidebar flex flex-col border-r border-sidebar-border shrink-0">
      {/* Logo */}
      <div className="p-5 border-b border-sidebar-border">
        <div className="flex items-center gap-2">
          <Flower2 className="w-7 h-7 text-sidebar-primary" />
          <span className="font-display text-xl font-bold text-sidebar-foreground">Bloom</span>
        </div>
        <p className="text-xs text-sidebar-foreground/50 mt-1">{projectName}</p>
      </div>

      {/* User */}
      <div className="px-5 py-3 border-b border-sidebar-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-sidebar-primary flex items-center justify-center text-sidebar-primary-foreground text-sm font-bold">
            {currentUser[0]}
          </div>
          <div>
            <p className="text-sm font-medium text-sidebar-foreground">{currentUser} Smith</p>
            <p className="text-xs text-sidebar-foreground/50">Online</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`bloom-nav-item ${isActive ? "bloom-nav-item-active" : ""}`}
            >
              <item.icon className="w-4 h-4" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Group Code */}
      <div className="p-4 border-t border-sidebar-border">
        <p className="text-xs text-sidebar-foreground/50 mb-1">Group Code</p>
        <button
          onClick={() => { navigator.clipboard.writeText(groupCode); toast.success("Code copied!"); }}
          className="flex items-center gap-2 text-sm font-mono text-sidebar-primary hover:text-sidebar-primary/80 transition-colors"
        >
          {groupCode}
          <Copy className="w-3 h-3" />
        </button>
      </div>
    </aside>
  );
};

export default BloomSidebar;
