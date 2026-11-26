import { useState } from "react";
import TopNav from "@/components/TopNav";
import { USERS, User, UserRole } from "@/data/mockData";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Pencil, UserX } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Settings() {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>(USERS);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form, setForm] = useState({ name: "", email: "", role: "KAM" as UserRole });

  const openAdd = () => {
    setEditingUser(null);
    setForm({ name: "", email: "", role: "KAM" });
    setShowModal(true);
  };

  const openEdit = (u: User) => {
    setEditingUser(u);
    setForm({ name: u.name, email: u.email, role: u.role });
    setShowModal(true);
  };

  const handleSave = () => {
    if (!form.name || !form.email) return;
    if (editingUser) {
      setUsers((prev) => prev.map((u) => (u.id === editingUser.id ? { ...u, ...form } : u)));
      toast({ title: "User Updated", description: `${form.name} has been updated.` });
    } else {
      const newUser: User = {
        id: `u${Date.now()}`,
        ...form,
        assignedCustomers: ["Walmart"],
        assignedCategories: ["Skin Health"],
        assignedBrands: ["Neutrogena"],
        active: true,
      };
      setUsers((prev) => [...prev, newUser]);
      toast({ title: "User Added", description: `${form.name} has been added.` });
    }
    setShowModal(false);
  };

  const toggleActive = (id: string) => {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, active: !u.active } : u)));
  };

  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      <TopNav />
      <main className="flex-1 p-6 max-w-[1400px] mx-auto w-full">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold">User Management</h1>
          <Button size="sm" className="gap-1" onClick={openAdd}><Plus className="w-4 h-4" /> Add User</Button>
        </div>

        <Card className="overflow-auto max-h-[calc(100vh-280px)]">
          <table className="w-full caption-bottom text-sm">
            <TableHeader className="sticky top-0 z-10 bg-card">
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Customers</TableHead>
                <TableHead>Categories</TableHead>
                <TableHead>Brands</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u) => (
                <TableRow key={u.id} className={u.active ? "" : "opacity-50"}>
                  <TableCell className="text-sm font-medium">{u.name}</TableCell>
                  <TableCell className="text-sm">{u.email}</TableCell>
                  <TableCell><Badge variant="outline" className="text-xs">{u.role}</Badge></TableCell>
                  <TableCell className="text-xs">{u.assignedCustomers.join(", ")}</TableCell>
                  <TableCell className="text-xs">{u.assignedCategories.join(", ")}</TableCell>
                  <TableCell className="text-xs">{u.assignedBrands.join(", ")}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`text-xs ${u.active ? "text-status-published border-status-published/30" : "text-muted-foreground"}`}>
                      {u.active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(u)}>
                        <Pencil className="w-3 h-3" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => toggleActive(u.id)}>
                        <UserX className="w-3 h-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </table>
        </Card>

        <Dialog open={showModal} onOpenChange={setShowModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingUser ? "Edit User" : "Add User"}</DialogTitle>
              <DialogDescription>{editingUser ? "Update user details" : "Add a new user to the system"}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label className="text-sm">Name</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div>
                <Label className="text-sm">Email</Label>
                <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
              <div>
                <Label className="text-sm">Role</Label>
                <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v as UserRole })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="KAM">KAM</SelectItem>
                    <SelectItem value="Manager">Manager</SelectItem>
                    <SelectItem value="Admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
              <Button onClick={handleSave}>{editingUser ? "Update" : "Add User"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
