import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Search, Loader2, Shield, UserCog } from "lucide-react";

const AdminUsers = () => {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newRole, setNewRole] = useState("user");

  const { data: users, isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: roles } = useQuery({
    queryKey: ["admin-all-roles"],
    queryFn: async () => {
      const { data, error } = await supabase.from("user_roles").select("*");
      if (error) throw error;
      return data;
    },
  });

  const { data: access } = useQuery({
    queryKey: ["admin-all-access"],
    queryFn: async () => {
      const { data, error } = await supabase.from("access_rights").select("*, courses(title)");
      if (error) throw error;
      return data;
    },
  });

  const getUserRoles = (userId: string) => roles?.filter((r) => r.user_id === userId) || [];
  const getUserAccess = (userId: string) => access?.filter((a) => a.user_id === userId) || [];

  const roleCls: Record<string, string> = {
    admin: "bg-destructive/10 text-destructive",
    moderator: "bg-warning/10 text-warning",
    content_manager: "bg-accent/10 text-accent",
    user: "bg-muted text-muted-foreground",
  };

  const openUserDialog = (user: any) => {
    setSelectedUser(user);
    const userRoles = getUserRoles(user.id);
    setNewRole(userRoles[0]?.role || "user");
    setDialogOpen(true);
  };

  const handleChangeRole = async () => {
    if (!selectedUser) return;
    // Delete existing roles and insert new one
    await supabase.from("user_roles").delete().eq("user_id", selectedUser.id);
    const { error } = await supabase.from("user_roles").insert({ user_id: selectedUser.id, role: newRole as any });
    if (error) { toast.error(error.message); return; }
    toast.success("Роль обновлена");
    qc.invalidateQueries({ queryKey: ["admin-all-roles"] });
    setDialogOpen(false);
  };

  const handleToggleActive = async (user: any) => {
    const { error } = await supabase.from("profiles").update({ is_active: !user.is_active }).eq("id", user.id);
    if (error) { toast.error(error.message); return; }
    toast.success(user.is_active ? "Пользователь заблокирован" : "Пользователь разблокирован");
    qc.invalidateQueries({ queryKey: ["admin-users"] });
  };

  const filtered = users?.filter((u) =>
    (u.name || "").toLowerCase().includes(search.toLowerCase()) ||
    (u.email || "").toLowerCase().includes(search.toLowerCase())
  ) || [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Пользователи</h1>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Поиск по имени или email..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>

      {isLoading ? <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto" /> : (
        <div className="rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-surface">
              <tr>
                <th className="text-left p-3 font-medium">Пользователь</th>
                <th className="text-left p-3 font-medium hidden md:table-cell">Email</th>
                <th className="text-left p-3 font-medium">Роль</th>
                <th className="text-left p-3 font-medium hidden lg:table-cell">Доступ</th>
                <th className="text-left p-3 font-medium">Статус</th>
                <th className="text-right p-3 font-medium">Действия</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => {
                const uRoles = getUserRoles(u.id);
                const uAccess = getUserAccess(u.id);
                return (
                  <tr key={u.id} className="border-t border-border hover:bg-muted/30">
                    <td className="p-3">
                      <p className="font-medium">{u.name || "—"}</p>
                      <p className="text-[10px] text-muted-foreground font-mono">{u.id.slice(0, 8)}</p>
                    </td>
                    <td className="p-3 hidden md:table-cell text-muted-foreground">{u.email}</td>
                    <td className="p-3">
                      {uRoles.map((r) => (
                        <Badge key={r.id} className={roleCls[r.role] || ""}>{r.role}</Badge>
                      ))}
                    </td>
                    <td className="p-3 hidden lg:table-cell">
                      {uAccess.length > 0 ? (
                        <span className="text-xs text-muted-foreground">{uAccess.length} прог.</span>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="p-3">
                      <Badge className={u.is_active ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}>
                        {u.is_active ? "Активен" : "Заблокирован"}
                      </Badge>
                    </td>
                    <td className="p-3 text-right space-x-1">
                      <Button variant="ghost" size="icon" onClick={() => openUserDialog(u)} title="Управление"><UserCog className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => handleToggleActive(u)} title={u.is_active ? "Заблокировать" : "Разблокировать"}>
                        <Shield className={`h-4 w-4 ${u.is_active ? "text-destructive" : "text-success"}`} />
                      </Button>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && <tr><td colSpan={6} className="p-6 text-center text-muted-foreground">Нет данных</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Управление пользователем</DialogTitle>
            <DialogDescription>{selectedUser?.name || selectedUser?.email || "—"}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Роль</Label>
              <Select value={newRole} onValueChange={setNewRole}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">Пользователь</SelectItem>
                  <SelectItem value="moderator">Модератор</SelectItem>
                  <SelectItem value="content_manager">Контент-менеджер</SelectItem>
                  <SelectItem value="admin">Администратор</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleChangeRole} className="w-full">Сохранить роль</Button>

            {selectedUser && (
              <div className="pt-4 border-t border-border space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase">Доступ к программам</p>
                {getUserAccess(selectedUser.id).length === 0 ? (
                  <p className="text-sm text-muted-foreground">Нет активного доступа</p>
                ) : (
                  getUserAccess(selectedUser.id).map((a: any) => (
                    <div key={a.id} className="flex items-center justify-between text-sm rounded-lg bg-surface border border-border p-3">
                      <span>{a.courses?.title || a.course_id}</span>
                      <Badge className={a.status === "active" ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"}>{a.status}</Badge>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminUsers;
