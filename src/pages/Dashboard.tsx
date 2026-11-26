import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import TopNav from "@/components/TopNav";
import { PPGS } from "@/data/mockData";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowUpDown, Search } from "lucide-react";

type SortKey = "customer" | "category" | "brand" | "ppgName" | "lastEdited" | "status";

export default function Dashboard() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [customerFilter, setCustomerFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [brandFilter, setBrandFilter] = useState<string>("all");
  const [sortKey, setSortKey] = useState<SortKey>("customer");
  const [sortAsc, setSortAsc] = useState(true);

  const userPPGs = useMemo(() => PPGS.filter((p) => p.assignedUser === currentUser?.id), [currentUser]);

  const filterOptions = useMemo(() => ({
    customers: [...new Set(userPPGs.map((p) => p.customer))].sort(),
    categories: [...new Set(userPPGs.map((p) => p.category))].sort(),
    brands: [...new Set(userPPGs.map((p) => p.brand))].sort(),
  }), [userPPGs]);

  const ppgs = useMemo(() => {
    let filtered = [...userPPGs];
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.customer.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.ppgName.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== "all") filtered = filtered.filter((p) => p.status === statusFilter);
    if (customerFilter !== "all") filtered = filtered.filter((p) => p.customer === customerFilter);
    if (categoryFilter !== "all") filtered = filtered.filter((p) => p.category === categoryFilter);
    if (brandFilter !== "all") filtered = filtered.filter((p) => p.brand === brandFilter);
    filtered.sort((a, b) => {
      const av = a[sortKey] || "";
      const bv = b[sortKey] || "";
      return sortAsc ? av.localeCompare(bv) : bv.localeCompare(av);
    });
    return filtered;
  }, [userPPGs, search, statusFilter, customerFilter, categoryFilter, brandFilter, sortKey, sortAsc]);

  const counts = useMemo(() => {
    const all = PPGS.filter((p) => p.assignedUser === currentUser?.id);
    return {
      notStarted: all.filter((p) => p.status === "Not Started").length,
      saved: all.filter((p) => p.status === "Saved").length,
      published: all.filter((p) => p.status === "Published").length,
      total: all.length,
    };
  }, [currentUser]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(true); }
  };

  const statusBadge = (status: string) => {
    const colors: Record<string, string> = {
      "Not Started": "bg-muted text-muted-foreground",
      Saved: "bg-kenvue-yellow/20 text-kenvue-yellow border-kenvue-yellow/30",
      Published: "bg-status-published/15 text-status-published border-status-published/30",
    };
    return <Badge variant="outline" className={`text-xs ${colors[status] || ""}`}>{status}</Badge>;
  };

  const SortHeader = ({ label, field }: { label: string; field: SortKey }) => (
    <TableHead className="cursor-pointer select-none" onClick={() => toggleSort(field)}>
      <div className="flex items-center gap-1">
        {label}
        <ArrowUpDown className="w-3 h-3 text-muted-foreground" />
      </div>
    </TableHead>
  );

  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      <TopNav />
      <main className="flex-1 p-6 max-w-[1400px] mx-auto w-full">
        <h1 className="text-xl font-semibold mb-4">My Accounts</h1>

        {/* Summary Cards */}
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

        {/* Filters */}
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <div className="relative flex-1 max-w-xs min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search PPGs..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-9" />
          </div>
          <Select value={customerFilter} onValueChange={setCustomerFilter}>
            <SelectTrigger className="w-[150px] h-9 bg-card">
              <SelectValue placeholder="All Customers" />
            </SelectTrigger>
            <SelectContent className="bg-popover z-50">
              <SelectItem value="all">All Customers</SelectItem>
              {filterOptions.customers.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[160px] h-9 bg-card">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent className="bg-popover z-50">
              <SelectItem value="all">All Categories</SelectItem>
              {filterOptions.categories.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={brandFilter} onValueChange={setBrandFilter}>
            <SelectTrigger className="w-[150px] h-9 bg-card">
              <SelectValue placeholder="All Brands" />
            </SelectTrigger>
            <SelectContent className="bg-popover z-50">
              <SelectItem value="all">All Brands</SelectItem>
              {filterOptions.brands.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px] h-9 bg-card">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent className="bg-popover z-50">
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="Not Started">Not Started</SelectItem>
              <SelectItem value="Saved">Saved</SelectItem>
              <SelectItem value="Published">Published</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* PPG Table */}
        <Card className="overflow-auto max-h-[calc(100vh-320px)]">
          <table className="w-full caption-bottom text-sm">
            <TableHeader className="sticky top-0 z-10 bg-card">
              <TableRow>
                <SortHeader label="Customer" field="customer" />
                <SortHeader label="Category" field="category" />
                <SortHeader label="Brand" field="brand" />
                <SortHeader label="PPG Name" field="ppgName" />
                <SortHeader label="Last Edited" field="lastEdited" />
                <SortHeader label="Status" field="status" />
                <TableHead className="w-[100px]">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ppgs.map((ppg) => (
                <TableRow key={ppg.id} className="h-10">
                  <TableCell className="py-2 text-sm">{ppg.customer}</TableCell>
                  <TableCell className="py-2 text-sm">{ppg.category}</TableCell>
                  <TableCell className="py-2 text-sm">{ppg.brand}</TableCell>
                  <TableCell className="py-2 text-sm font-medium">{ppg.ppgName}</TableCell>
                  <TableCell className="py-2 text-sm text-muted-foreground">{ppg.lastEdited || "—"}</TableCell>
                  <TableCell className="py-2">{statusBadge(ppg.status)}</TableCell>
                  <TableCell className="py-2">
                    <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => navigate(`/plan/${ppg.id}`)}>
                      Open Plan
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {ppgs.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    No PPGs found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </table>
        </Card>
      </main>
    </div>
  );
}
