import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Eye, CheckCircle, Search } from "lucide-react";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";

const STATUS_LABELS: Record<string, string> = {
  new: "Новая",
  in_progress: "В обработке",
  awaiting_payment: "Ожидает оплату",
  paid: "Оплачено",
  access_granted: "Доступ открыт",
  rejected: "Отклонена",
};

const STATUS_CLASSES: Record<string, string> = {
  new: "bg-primary/10 text-primary border-primary/20",
  in_progress: "bg-warning/10 text-warning border-warning/20",
  awaiting_payment: "bg-warning/10 text-warning border-warning/20",
  paid: "bg-success/10 text-success border-success/20",
  access_granted: "bg-success/10 text-success border-success/20",
  rejected: "bg-destructive/10 text-destructive border-destructive/20",
};

const AdminRequests = () => {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selected, setSelected] = useState<any>(null);
  const [newStatus, setNewStatus] = useState("");

  const { data: requests, isLoading } = useQuery({
    queryKey: ["admin-requests"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("requests")
        .select("*, courses(title)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: profiles } = useQuery({
    queryKey: ["admin-profiles"],
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("id, name, email");
      if (error) throw error;
      return data;
    },
  });

  const getProfile = (userId: string) => profiles?.find((p: any) => p.id === userId);

  const handleUpdateStatus = async (status: string) => {
    if (!selected) return;
    const { error } = await (supabase as any)
      .from("requests")
      .update({ status })
      .eq("id", selected.id);
    if (error) {
      toast.error("Ошибка: " + error.message);
      return;
    }
    toast.success("Статус обновлён");
    qc.invalidateQueries({ queryKey: ["admin-requests"] });
    setSelected(null);
  };

  const handleGrantAccess = async () => {
    if (!selected) return;
    const { error: accessError } = await supabase.from("access_rights").insert({
      user_id: selected.user_id,
      course_id: selected.course_id,
      status: "active",
    } as any);
    if (accessError) {
      toast.error("Ошибка доступа: " + accessError.message);
      return;
    }
    const { error } = await (supabase as any)
      .from("requests")
      .update({ status: "access_granted" })
      .eq("id", selected.id);
    if (error) {
      toast.error("Ошибка: " + error.message);
      return;
    }
    toast.success("Доступ открыт!");
    qc.invalidateQueries({ queryKey: ["admin-requests"] });
    setSelected(null);
  };

  const filtered = requests?.filter((r: any) => {
    const profile = getProfile(r.user_id);
    const matchSearch = !search ||
      profile?.name?.toLowerCase().includes(search.toLowerCase()) ||
      profile?.email?.toLowerCase().includes(search.toLowerCase()) ||
      r.telegram?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || r.status === statusFilter;
    return matchSearch && matchStatus;
  });

  if (isLoading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Заявки</h1>

      <div className="flex gap-3 flex-wrap">
        <div className="relative max-w-xs flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Поиск по имени, email, telegram..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-10 rounded-xl" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48 h-10 rounded-xl"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все статусы</SelectItem>
            {Object.entries(STATUS_LABELS).map(([val, label]) => (
              <SelectItem key={val} value={val}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card className="rounded-2xl overflow-hidden">
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left p-4 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Пользователь</th>
                <th className="text-left p-4 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Курс</th>
                <th className="text-left p-4 font-semibold text-muted-foreground text-xs uppercase tracking-wider hidden md:table-cell">Telegram</th>
                <th className="text-left p-4 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Статус</th>
                <th className="text-left p-4 font-semibold text-muted-foreground text-xs uppercase tracking-wider hidden sm:table-cell">Дата</th>
                <th className="p-4"></th>
              </tr>
            </thead>
            <tbody>
              {filtered?.map((req: any) => {
                const profile = getProfile(req.user_id);
                return (
                  <tr key={req.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                    <td className="p-4">
                      <p className="font-medium">{profile?.name || "—"}</p>
                      <p className="text-xs text-muted-foreground">{profile?.email}</p>
                    </td>
                    <td className="p-4 font-medium">{req.courses?.title || "—"}</td>
                    <td className="p-4 hidden md:table-cell text-muted-foreground">{req.telegram}</td>
                    <td className="p-4">
                      <Badge className={`${STATUS_CLASSES[req.status] || ""} border text-xs`}>{STATUS_LABELS[req.status] || req.status}</Badge>
                    </td>
                    <td className="p-4 text-sm text-muted-foreground hidden sm:table-cell">
                      {new Date(req.created_at).toLocaleDateString("ru-RU")}
                    </td>
                    <td className="p-4">
                      <Button variant="ghost" size="sm" className="rounded-lg" onClick={() => { setSelected(req); setNewStatus(req.status); }}>
                        <Eye className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {!filtered?.length && <p className="text-center text-muted-foreground py-12">Заявок нет</p>}
        </CardContent>
      </Card>

      <Dialog open={!!selected} onOpenChange={open => !open && setSelected(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl">Детали заявки</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "Пользователь", value: getProfile(selected.user_id)?.name || "—" },
                  { label: "Email", value: getProfile(selected.user_id)?.email || "—" },
                  { label: "Курс", value: selected.courses?.title },
                  { label: "Telegram", value: selected.telegram },
                  ...(selected.phone ? [{ label: "Телефон", value: selected.phone }] : []),
                ].map((item) => (
                  <div key={item.label} className="rounded-xl bg-muted/30 p-3">
                    <p className="text-xs text-muted-foreground mb-0.5">{item.label}</p>
                    <p className="font-medium text-sm">{item.value}</p>
                  </div>
                ))}
              </div>

              {selected.comment && (
                <div className="rounded-xl bg-muted/30 p-3">
                  <p className="text-xs text-muted-foreground mb-0.5">Комментарий</p>
                  <p className="text-sm">{selected.comment}</p>
                </div>
              )}

              <div className="space-y-2">
                <Label className="text-sm font-medium">Статус заявки</Label>
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger className="h-10 rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(STATUS_LABELS).map(([val, label]) => (
                      <SelectItem key={val} value={val}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-3">
                <Button onClick={() => handleUpdateStatus(newStatus)} className="flex-1 rounded-xl h-10">
                  Сохранить статус
                </Button>
                {selected.status !== "access_granted" && (
                  <Button onClick={handleGrantAccess} variant="default" className="flex-1 gap-1.5 rounded-xl h-10 bg-success hover:bg-success/90 text-success-foreground">
                    <CheckCircle className="h-4 w-4" /> Открыть доступ
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminRequests;
