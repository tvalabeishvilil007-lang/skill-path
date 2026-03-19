import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
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
    admin: "bg-destructive/10 text-destructive border-destructive/20",
    moderator: "bg-warning/10 text-warning border-warning/20",
    content_manager: "bg-accent/10 text-accent border-accent/20",
    manager: "bg-primary/10 text-primary border-primary/20",
    user: "bg-muted text-muted-foreground border-border",
  };

  const openUserDialog = (user: any) => {
    setSelectedUser(user);
    const userRoles = getUserRoles(user.id);
    setNewRole(userRoles[0]?.role || "user");
    setDialogOpen(true);
  };

  const handleChangeRole = async () => {
    if (!selectedUser) return;
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
        <Input placeholder="Поиск по имени или email..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-10 rounded-xl" />
      </div>

      {isLoading ? <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto" /> : (
        <Card className="rounded-2xl overflow-hidden">
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left p-4 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Пользователь</th>
                  <th className="text-left p-4 font-semibold text-muted-foreground text-xs uppercase tracking-wider hidden md:table-cell">Email</th>
                  <th className="text-left p-4 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Роль</th>
                  <th className="text-left p-4 font-semibold text-muted-foreground text-xs uppercase tracking-wider hidden lg:table-cell">Доступ</th>
                  <th className="text-left p-4 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Статус</th>
                  <th className="text-right p-4 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Действия</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => {
                  const uRoles = getUserRoles(u.id);
                  const uAccess = getUserAccess(u.id);
                  return (
                    <tr key={u.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                      <td className="p-4">
                        <p className="font-medium">{u.name || "—"}</p>
                        <p className="text-[10px] text-muted-foreground font-mono">{u.id.slice(0, 8)}</p>
                      </td>
                      <td className="p-4 hidden md:table-cell text-muted-foreground">{u.email}</td>
                      <td className="p-4">
                        {uRoles.map((r) => (
                          <Badge key={r.id} className={`${roleCls[r.role] || ""} border text-xs`}>{r.role}</Badge>
                        ))}
                      </td>
                      <td className="p-4 hidden lg:table-cell">
                        {uAccess.length > 0 ? (
                          <span className="text-sm font-medium">{uAccess.length} курс(ов)</span>
                        ) : (
                          <span className="text-sm text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="p-4">
                        <Badge className={`border text-xs ${u.is_active ? "bg-success/10 text-success border-success/20" : "bg-destructive/10 text-destructive border-destructive/20"}`}>
                          {u.is_active ? "Активен" : "Заблокирован"}
                        </Badge>
                      </td>
                      <td className="p-4 text-right space-x-1">
                        <Button variant="ghost" size="sm" className="rounded-lg" onClick={() => openUserDialog(u)} title="Управление"><UserCog className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="sm" className="rounded-lg" onClick={() => handleToggleActive(u)} title={u.is_active ? "Заблокировать" : "Разблокировать"}>
                          <Shield className={`h-4 w-4 ${u.is_active ? "text-destructive" : "text-success"}`} />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">Нет данных</td></tr>}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl">Управление пользователем</DialogTitle>
            <DialogDescription>{selectedUser?.name || selectedUser?.email || "—"}</DialogDescription>
          </DialogHeader>
          <div className="space-y-5">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Роль</Label>
              <Select value={newRole} onValueChange={setNewRole}>
                <SelectTrigger className="h-10 rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">Пользователь</SelectItem>
                  <SelectItem value="manager">Менеджер</SelectItem>
                  <SelectItem value="moderator">Модератор</SelectItem>
                  <SelectItem value="content_manager">Контент-менеджер</SelectItem>
                  <SelectItem value="admin">Администратор</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleChangeRole} className="w-full rounded-xl h-10">Сохранить роль</Button>

            {selectedUser && (
              <div className="pt-4 border-t border-border space-y-3">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Доступ к курсам</p>
                {getUserAccess(selectedUser.id).length === 0 ? (
                  <p className="text-sm text-muted-foreground">Нет активного доступа</p>
                ) : (
                  getUserAccess(selectedUser.id).map((a: any) => (
                    <div key={a.id} className="flex items-center justify-between text-sm rounded-xl bg-muted/30 border border-border/50 p-3">
                      <span className="font-medium">{a.courses?.title || a.course_id}</span>
                      <Badge className={`border text-xs ${a.status === "active" ? "bg-success/10 text-success border-success/20" : "bg-muted text-muted-foreground"}`}>{a.status}</Badge>
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
