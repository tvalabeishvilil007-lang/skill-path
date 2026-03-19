import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Search, Loader2, Eye } from "lucide-react";

const statuses = [
  { value: "created", label: "Создан" },
  { value: "pending_payment", label: "Ожидает оплаты" },
  { value: "waiting_admin", label: "На проверке" },
  { value: "paid", label: "Оплачен" },
  { value: "rejected", label: "Отклонён" },
  { value: "refunded", label: "Возврат" },
  { value: "canceled", label: "Отменён" },
];

const statusCls: Record<string, string> = {
  paid: "bg-success/10 text-success",
  created: "bg-muted text-muted-foreground",
  pending_payment: "bg-warning/10 text-warning",
  waiting_admin: "bg-warning/10 text-warning",
  rejected: "bg-destructive/10 text-destructive",
  refunded: "bg-muted text-muted-foreground",
  canceled: "bg-muted text-muted-foreground",
};

const AdminOrders = () => {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [adminComment, setAdminComment] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: async () => {
      const { data, error } = await supabase.from("orders").select("*, courses(title)").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const handleUpdateStatus = async () => {
    if (!selectedOrder || !newStatus) return;
    const update: any = { payment_status: newStatus, admin_comment: adminComment };
    if (newStatus === "paid") update.paid_at = new Date().toISOString();
    const { error } = await supabase.from("orders").update(update).eq("id", selectedOrder.id);
    if (error) { toast.error(error.message); return; }

    // If paid, create access_right
    if (newStatus === "paid") {
      await supabase.from("access_rights").insert({
        user_id: selectedOrder.user_id,
        course_id: selectedOrder.course_id,
        source_order_id: selectedOrder.id,
        status: "active",
      });
    }

    toast.success("Статус обновлён");
    qc.invalidateQueries({ queryKey: ["admin-orders"] });
    setDialogOpen(false);
  };

  const openOrder = (order: any) => {
    setSelectedOrder(order);
    setNewStatus(order.payment_status);
    setAdminComment(order.admin_comment || "");
    setDialogOpen(true);
  };

  const filtered = (data || []).filter((o) => {
    const matchSearch = (o.courses as any)?.title?.toLowerCase().includes(search.toLowerCase()) || o.id.includes(search);
    const matchStatus = statusFilter === "all" || o.payment_status === statusFilter;
    return matchSearch && matchStatus;
  });

  const formatPrice = (n: number) => new Intl.NumberFormat("ru-RU").format(n) + " ₽";

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Заказы</h1>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Поиск..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48"><SelectValue placeholder="Все статусы" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все статусы</SelectItem>
            {statuses.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto" /> : (
        <div className="rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-surface">
              <tr>
                <th className="text-left p-3 font-medium">Программа</th>
                <th className="text-left p-3 font-medium hidden md:table-cell">Дата</th>
                <th className="text-left p-3 font-medium">Сумма</th>
                <th className="text-left p-3 font-medium">Статус</th>
                <th className="text-left p-3 font-medium hidden lg:table-cell">Метод</th>
                <th className="text-right p-3 font-medium">Действия</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((o) => (
                <tr key={o.id} className="border-t border-border hover:bg-muted/30">
                  <td className="p-3">
                    <p className="font-medium">{(o.courses as any)?.title || "—"}</p>
                    <p className="text-[10px] text-muted-foreground font-mono">{o.id.slice(0, 8)}</p>
                  </td>
                  <td className="p-3 hidden md:table-cell text-muted-foreground">{new Date(o.created_at).toLocaleDateString("ru-RU")}</td>
                  <td className="p-3 font-medium">{formatPrice(Number(o.amount))}</td>
                  <td className="p-3"><Badge className={statusCls[o.payment_status] || ""}>{statuses.find((s) => s.value === o.payment_status)?.label || o.payment_status}</Badge></td>
                  <td className="p-3 hidden lg:table-cell text-muted-foreground">{o.payment_method || "—"}</td>
                  <td className="p-3 text-right">
                    <Button variant="ghost" size="icon" onClick={() => openOrder(o)}><Eye className="h-4 w-4" /></Button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={6} className="p-6 text-center text-muted-foreground">Нет данных</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Управление заказом</DialogTitle>
            <DialogDescription>ID: {selectedOrder?.id?.slice(0, 12)}…</DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-lg bg-surface border border-border p-3">
                  <p className="text-xs text-muted-foreground">Программа</p>
                  <p className="font-medium">{(selectedOrder.courses as any)?.title}</p>
                </div>
                <div className="rounded-lg bg-surface border border-border p-3">
                  <p className="text-xs text-muted-foreground">Сумма</p>
                  <p className="font-medium">{formatPrice(Number(selectedOrder.amount))}</p>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Статус</Label>
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{statuses.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Комментарий администратора</Label>
                <Textarea value={adminComment} onChange={(e) => setAdminComment(e.target.value)} rows={3} />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleUpdateStatus} className="flex-1">Сохранить</Button>
                {selectedOrder.payment_status !== "paid" && (
                  <Button variant="outline" className="text-success border-success/30" onClick={() => { setNewStatus("paid"); }}>
                    Подтвердить оплату
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

export default AdminOrders;
