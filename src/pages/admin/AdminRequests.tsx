import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, Eye, CheckCircle } from "lucide-react";
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
  new: "bg-blue-100 text-blue-800",
  in_progress: "bg-yellow-100 text-yellow-800",
  awaiting_payment: "bg-orange-100 text-orange-800",
  paid: "bg-emerald-100 text-emerald-800",
  access_granted: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
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

  if (isLoading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Заявки</h1>

      <div className="flex gap-4 flex-wrap">
        <Input placeholder="Поиск..." value={search} onChange={e => setSearch(e.target.value)} className="max-w-xs" />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все статусы</SelectItem>
            {Object.entries(STATUS_LABELS).map(([val, label]) => (
              <SelectItem key={val} value={val}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Пользователь</TableHead>
            <TableHead>Курс</TableHead>
            <TableHead>Telegram</TableHead>
            <TableHead>Статус</TableHead>
            <TableHead>Дата</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered?.map((req: any) => {
            const profile = getProfile(req.user_id);
            return (
              <TableRow key={req.id}>
                <TableCell>
                  <div>{profile?.name || "—"}</div>
                  <div className="text-xs text-muted-foreground">{profile?.email}</div>
                </TableCell>
                <TableCell>{req.courses?.title || "—"}</TableCell>
                <TableCell>{req.telegram}</TableCell>
                <TableCell>
                  <Badge className={STATUS_CLASSES[req.status] || ""}>{STATUS_LABELS[req.status] || req.status}</Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {new Date(req.created_at).toLocaleDateString("ru-RU")}
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="icon" onClick={() => { setSelected(req); setNewStatus(req.status); }}>
                    <Eye className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {!filtered?.length && <p className="text-center text-muted-foreground py-8">Заявок нет</p>}

      <Dialog open={!!selected} onOpenChange={open => !open && setSelected(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Заявка</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-muted-foreground">Пользователь:</span> {getProfile(selected.user_id)?.name || "—"}</div>
                <div><span className="text-muted-foreground">Email:</span> {getProfile(selected.user_id)?.email || "—"}</div>
                <div><span className="text-muted-foreground">Курс:</span> {selected.courses?.title}</div>
                <div><span className="text-muted-foreground">Telegram:</span> {selected.telegram}</div>
                {selected.phone && <div><span className="text-muted-foreground">Телефон:</span> {selected.phone}</div>}
                {selected.comment && <div className="col-span-2"><span className="text-muted-foreground">Комментарий:</span> {selected.comment}</div>}
              </div>

              <div className="space-y-2">
                <Label>Статус</Label>
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(STATUS_LABELS).map(([val, label]) => (
                      <SelectItem key={val} value={val}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2">
                <Button onClick={() => handleUpdateStatus(newStatus)} className="flex-1">
                  Сохранить статус
                </Button>
                {selected.status !== "access_granted" && (
                  <Button onClick={handleGrantAccess} variant="default" className="flex-1 gap-1">
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
