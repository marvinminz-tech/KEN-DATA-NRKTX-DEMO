import { useAuth } from "@/context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LogOut, LayoutGrid, Users, Eye } from "lucide-react";

export default function TopNav() {
  const { currentUser, logout, isManager, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (!currentUser) return null;

  const initials = currentUser.name
    .split(" ")
    .map((n) => n[0])
    .join("");

  const navLink = (path: string, label: string, icon: React.ReactNode) => (
    <button
      onClick={() => navigate(path)}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-medium transition-colors ${
        location.pathname === path
          ? "bg-primary/10 text-primary"
          : "text-foreground/70 hover:text-foreground hover:bg-muted"
      }`}
    >
      {icon}
      {label}
    </button>
  );

  return (
    <header className="h-14 border-b border-border bg-card px-4 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate(isAdmin ? "/settings" : isManager ? "/consolidated" : "/dashboard")}>
          <div className="w-8 h-8 rounded bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">K</span>
          </div>
          <div>
            <span className="font-semibold text-sm text-foreground">TPM</span>
            <span className="text-muted-foreground text-sm ml-1">— Promotion Lite</span>
          </div>
        </div>
        <div className="h-6 w-px bg-border mx-2" />
        {!isManager && !isAdmin && navLink("/dashboard", "My Accounts", <LayoutGrid className="w-4 h-4" />)}
        {isManager && navLink("/consolidated", "Consolidated View", <Eye className="w-4 h-4" />)}
        {isAdmin && navLink("/settings", "Settings", <Users className="w-4 h-4" />)}
      </div>
      <div className="flex items-center gap-3">
        <div className="text-right">
          <p className="text-sm font-medium leading-none">{currentUser.name}</p>
          <p className="text-xs text-muted-foreground">{currentUser.role}</p>
        </div>
        <Avatar className="h-8 w-8">
          <AvatarFallback className="bg-primary text-primary-foreground text-xs">{initials}</AvatarFallback>
        </Avatar>
        <Button variant="ghost" size="icon" onClick={() => { logout(); navigate("/login"); }} className="h-8 w-8">
          <LogOut className="w-4 h-4" />
        </Button>
      </div>
    </header>
  );
}
