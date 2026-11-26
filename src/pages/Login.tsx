import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UserRole } from "@/data/mockData";
import { useState } from "react";
import { Shield, User, Eye } from "lucide-react";

const ROLES: { role: UserRole; label: string; desc: string; icon: React.ReactNode }[] = [
  { role: "KAM", label: "Key Account Manager", desc: "Plan promotions for assigned PPGs", icon: <User className="w-5 h-5" /> },
  { role: "Manager", label: "Manager", desc: "View consolidated plans across all users", icon: <Eye className="w-5 h-5" /> },
  { role: "Admin", label: "Admin", desc: "Manage users, roles, and assignments", icon: <Shield className="w-5 h-5" /> },
];

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [selectedRole, setSelectedRole] = useState<UserRole>("KAM");

  const handleLogin = () => {
    login(selectedRole);
    if (selectedRole === "Admin") navigate("/settings");
    else if (selectedRole === "Manager") navigate("/consolidated");
    else navigate("/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center space-y-3">
          <div className="mx-auto w-12 h-12 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-xl">K</span>
          </div>
          <CardTitle className="text-xl">Kenvue TPM — Promotion Lite</CardTitle>
          <CardDescription>Select a role to demo, then sign in</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            {ROLES.map((r) => (
              <button
                key={r.role}
                onClick={() => setSelectedRole(r.role)}
                className={`w-full flex items-center gap-3 p-3 rounded-lg border text-left transition-all ${
                  selectedRole === r.role
                    ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                    : "border-border hover:border-primary/30"
                }`}
              >
                <div className={`p-2 rounded-md ${selectedRole === r.role ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                  {r.icon}
                </div>
                <div>
                  <p className="text-sm font-medium">{r.label}</p>
                  <p className="text-xs text-muted-foreground">{r.desc}</p>
                </div>
              </button>
            ))}
          </div>
          <Button onClick={handleLogin} className="w-full h-11 text-sm font-semibold" size="lg">
            Sign in with Kenvue SSO
          </Button>
          <p className="text-center text-xs text-muted-foreground">Demo mode — no credentials required</p>
        </CardContent>
      </Card>
    </div>
  );
}
