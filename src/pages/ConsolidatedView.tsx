import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import TopNav from "@/components/TopNav";
import { PPGS, USERS } from "@/data/mockData";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, FileSpreadsheet } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ConsolidatedView() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [search, setSearch] = useState("");

  const ppgs = useMemo(() => {
    if (!search) return PPGS;
    const q = search.toLowerCase();
    return PPGS.filter(
      (p) =>
        p.customer.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.ppgName.toLowerCase().includes(q)
    );
  }, [search]);

  const counts = {
    notStarted: PPGS.filter((p) => p.status === "Not Started").length,
    saved: PPGS.filter((p) => p.status === "Saved").length,
    published: PPGS.filter((p) => p.status === "Published").length,
    total: PPGS.length,
  };

  const getUserName = (id: string) => USERS.find((u) => u.id === id)?.name || id;

  const statusBadge = (status: string) => {
    const colors: Record<string, string> = {
      "Not Started": "bg-muted text-muted-foreground",
      Saved: "bg-kenvue-yellow/20 text-kenvue-yellow border-kenvue-yellow/30",
      Published: "bg-status-published/15 text-status-published border-status-published/30",
    };
    return <Badge variant="outline" className={`text-xs ${colors[status] || ""}`}>{status}</Badge>;
  };

  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      <TopNav />
      <main className="flex-1 p-6 max-w-[1400px] mx-auto w-full">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold">Consolidated View</h1>
          <Button variant="outline" size="sm" className="gap-1" onClick={() => toast({ title: "Export Started", description: "All published plans are being exported." })}>
            <FileSpreadsheet className="w-4 h-4" /> Export All
          </Button>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { label: "Not Started", value: counts.notStarted, color: "border-l-muted-foreground" },
            { label: "Saved", value: counts.saved, color: "border-l-kenvue-yellow" },
            { label: "Published", value: counts.published, color: "border-l-status-published" },
            { label: "Total PPGs", value: counts.total, color: "border-l-primary" },
          ].map((c) => (
            <Card key={c.label} className={`border-l-4 ${c.color}`}>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">{c.label}</p>
                <p className="text-2xl font-bold mt-1">{c.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="relative max-w-sm mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-9" />
        </div>

        <Card className="overflow-auto max-h-[calc(100vh-320px)]">
          <table className="w-full caption-bottom text-sm">
            <TableHeader className="sticky top-0 z-10 bg-card">
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Brand</TableHead>
                <TableHead>PPG Name</TableHead>
                <TableHead>Assigned User</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Published</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ppgs.map((ppg) => (
                <TableRow key={ppg.id} className="cursor-pointer hover:bg-muted/50" onClick={() => navigate(`/plan/${ppg.id}?readonly=true`)}>
                  <TableCell className="text-sm">{ppg.customer}</TableCell>
                  <TableCell className="text-sm">{ppg.category}</TableCell>
                  <TableCell className="text-sm">{ppg.brand}</TableCell>
                  <TableCell className="text-sm font-medium">{ppg.ppgName}</TableCell>
                  <TableCell className="text-sm">{getUserName(ppg.assignedUser)}</TableCell>
                  <TableCell>{statusBadge(ppg.status)}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{ppg.lastPublished || "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </table>
        </Card>
      </main>
    </div>
  );
}
