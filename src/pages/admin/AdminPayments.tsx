import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Eye, CheckCircle, Search, XCircle, CreditCard, MessageSquare, Send, Settings } from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useActivePaymentDetails } from "@/hooks/usePayment";

const STATUS_LABELS: Record<string, string> = {
  created: "Создана",
  payment_details_requested: "Реквизиты отправлены",
  waiting_for_payment: "Ожидает оплату",
  receipt_uploaded: "Чек загружен",
  under_review: "На проверке",
  access_granted: "Доступ открыт",
  rejected: "Отклонена",
  cancelled: "Отменена",
};

const STATUS_CLASSES: Record<string, string> = {
  created: "bg-muted text-muted-foreground",
  payment_details_requested: "bg-primary/10 text-primary border-primary/20",
  waiting_for_payment: "bg-warning/10 text-warning border-warning/20",
  receipt_uploaded: "bg-info/10 text-info border-info/20",
  under_review: "bg-warning/10 text-warning border-warning/20",
  access_granted: "bg-success/10 text-success border-success/20",
  rejected: "bg-destructive/10 text-destructive border-destructive/20",
  cancelled: "bg-muted text-muted-foreground",
};

const AdminPayments = () => {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selected, setSelected] = useState<any>(null);
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);
  const [tab, setTab] = useState("requests");
  const [newDetails, setNewDetails] = useState("");
  const [savingDetails, setSavingDetails] = useState(false);
  const { data: activeDetails, refetch: refetchDetails } = useActivePaymentDetails();

  const handleSaveDetails = async () => {
    if (!newDetails.trim()) return;
    setSavingDetails(true);
    try {
      // Deactivate old
      await (supabase as any).from("payment_settings").update({ is_active: false }).eq("is_active", true);
      // Insert new
      await (supabase as any).from("payment_settings").insert({ payment_details: newDetails.trim(), is_active: true });
      toast.success("Реквизиты обновлены");
      refetchDetails();
      setNewDetails("");
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSavingDetails(false);
    }
  };

  const { data: requests, isLoading } = useQuery({
    queryKey: ["admin-payment-requests"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("payment_requests")
        .select("*, courses(title, price, currency)")
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

  const { data: messages } = useQuery({
    queryKey: ["admin-payment-messages", selected?.id],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("payment_messages")
        .select("*")
        .eq("payment_request_id", selected!.id)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!selected?.id,
  });

  const getProfile = (userId: string) => profiles?.find((p: any) => p.id === userId);

  const handleGrantAccess = async () => {
    if (!selected) return;
    const { error: accessError } = await supabase.from("access_rights").insert({
      user_id: selected.user_id,
      course_id: selected.course_id,
      status: "active",
    } as any);
    if (accessError) {
      toast.error("Ошибка: " + accessError.message);
      return;
    }

    await (supabase as any).from("payment_requests").update({
      status: "access_granted",
      admin_id: (await supabase.auth.getUser()).data.user?.id,
      access_source: "site",
    }).eq("id", selected.id);

    // Add system message
    await (supabase as any).from("payment_messages").insert({
      payment_request_id: selected.id,
      sender_type: "system",
      message_type: "access_granted",
      content: "Доступ к курсу открыт! Перейдите на страницу курса, чтобы начать обучение.",
    });

    toast.success("Доступ открыт!");
    qc.invalidateQueries({ queryKey: ["admin-payment-requests"] });
    qc.invalidateQueries({ queryKey: ["admin-payment-messages", selected.id] });
  };

  const handleReject = async () => {
    if (!selected) return;
    await (supabase as any).from("payment_requests").update({ status: "rejected" }).eq("id", selected.id);

    await (supabase as any).from("payment_messages").insert({
      payment_request_id: selected.id,
      sender_type: "system",
      message_type: "text",
      content: "Заявка на оплату отклонена.",
    });

    toast.success("Заявка отклонена");
    qc.invalidateQueries({ queryKey: ["admin-payment-requests"] });
    setSelected(null);
  };

  const handleSendReply = async () => {
    if (!replyText.trim() || !selected) return;
    setSending(true);
    try {
      const userId = (await supabase.auth.getUser()).data.user?.id;
      await (supabase as any).from("payment_messages").insert({
        payment_request_id: selected.id,
        sender_id: userId,
        sender_type: "admin",
        message_type: "text",
        content: replyText.trim(),
      });
      setReplyText("");
      qc.invalidateQueries({ queryKey: ["admin-payment-messages", selected.id] });
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSending(false);
    }
  };

  const filtered = requests?.filter((r: any) => {
    const profile = getProfile(r.user_id);
    const matchSearch = !search ||
      profile?.name?.toLowerCase().includes(search.toLowerCase()) ||
      profile?.email?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || r.status === statusFilter;
    return matchSearch && matchStatus;
  });

  if (isLoading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Оплаты</h1>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="h-10 rounded-xl">
          <TabsTrigger value="requests" className="rounded-lg gap-1.5 text-sm">
            <CreditCard className="h-4 w-4" /> Заявки
          </TabsTrigger>
          <TabsTrigger value="settings" className="rounded-lg gap-1.5 text-sm">
            <Settings className="h-4 w-4" /> Реквизиты
          </TabsTrigger>
        </TabsList>

        <TabsContent value="settings" className="space-y-4 mt-4">
          <Card className="rounded-2xl">
            <CardContent className="p-5 space-y-4">
              <h3 className="font-semibold">Текущие реквизиты</h3>
              {activeDetails ? (
                <div className="rounded-xl bg-muted/30 p-4">
                  <p className="whitespace-pre-wrap text-sm">{activeDetails.payment_details}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Обновлено: {new Date(activeDetails.updated_at).toLocaleString("ru-RU")}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Реквизиты пока не настроены</p>
              )}
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Новые реквизиты</h4>
                <Textarea
                  value={newDetails}
                  onChange={(e) => setNewDetails(e.target.value)}
                  placeholder="Карта: 1234 5678 9012 3456&#10;Банк: Сбербанк&#10;ФИО: Иванов Иван&#10;USDT TRC20: T..."
                  className="rounded-xl min-h-[100px]"
                />
                <Button onClick={handleSaveDetails} disabled={!newDetails.trim() || savingDetails} className="rounded-xl">
                  {savingDetails ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Сохранить реквизиты
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="requests" className="space-y-4 mt-4">
      <div className="flex items-center justify-between">
        <Badge variant="secondary" className="text-xs">{requests?.length || 0} всего</Badge>
      </div>

      <div className="flex gap-3 flex-wrap">
        <div className="relative max-w-xs flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Поиск..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-10 rounded-xl" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-52 h-10 rounded-xl"><SelectValue /></SelectTrigger>
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
                    <td className="p-4">
                      <Badge className={`${STATUS_CLASSES[req.status] || ""} border text-xs`}>
                        {STATUS_LABELS[req.status] || req.status}
                      </Badge>
                    </td>
                    <td className="p-4 text-sm text-muted-foreground hidden sm:table-cell">
                      {new Date(req.created_at).toLocaleDateString("ru-RU")}
                    </td>
                    <td className="p-4">
                      <Button variant="ghost" size="sm" className="rounded-lg" onClick={() => setSelected(req)}>
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

      {/* Detail Dialog */}
      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" />
              Заявка на оплату
            </DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="flex-1 min-h-0 space-y-4 overflow-y-auto">
              {/* Info grid */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Пользователь", value: getProfile(selected.user_id)?.name || "—" },
                  { label: "Email", value: getProfile(selected.user_id)?.email || "—" },
                  { label: "Курс", value: selected.courses?.title },
                  { label: "Сумма", value: `${selected.courses?.price} ${selected.courses?.currency || "₽"}` },
                  { label: "Статус", value: STATUS_LABELS[selected.status] || selected.status },
                  { label: "Чек", value: selected.receipt_url ? "Загружен ✓" : "Нет" },
                ].map((item) => (
                  <div key={item.label} className="rounded-xl bg-muted/30 p-3">
                    <p className="text-xs text-muted-foreground mb-0.5">{item.label}</p>
                    <p className="font-medium text-sm">{item.value}</p>
                  </div>
                ))}
              </div>

              {/* Chat messages */}
              <div className="rounded-xl border border-border overflow-hidden">
                <div className="px-4 py-2.5 bg-muted/30 border-b border-border flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">История чата</span>
                </div>
                <ScrollArea className="h-48 p-3">
                  <div className="space-y-2">
                    {messages?.map((msg: any) => (
                      <div key={msg.id} className={`text-sm p-2 rounded-lg ${
                        msg.sender_type === "client" ? "bg-primary/5 border border-primary/10" :
                        msg.sender_type === "admin" ? "bg-card border border-border" :
                        "bg-muted/30"
                      }`}>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                            {msg.sender_type === "client" ? "Клиент" : msg.sender_type === "admin" ? "Админ" : "Система"}
                          </span>
                          <span className="text-[10px] text-muted-foreground/60">
                            {new Date(msg.created_at).toLocaleString("ru-RU")}
                          </span>
                        </div>
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                      </div>
                    ))}
                    {!messages?.length && <p className="text-sm text-muted-foreground text-center py-4">Нет сообщений</p>}
                  </div>
                </ScrollArea>
                {/* Admin reply */}
                <div className="p-3 border-t border-border flex gap-2">
                  <Input
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSendReply()}
                    placeholder="Ответить клиенту..."
                    className="rounded-xl h-9 text-sm"
                  />
                  <Button onClick={handleSendReply} disabled={!replyText.trim() || sending} size="sm" className="rounded-xl h-9 px-3">
                    <Send className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                {selected.status !== "access_granted" && (
                  <>
                    <Button onClick={handleGrantAccess} className="flex-1 gap-1.5 rounded-xl h-10 bg-success hover:bg-success/90 text-success-foreground">
                      <CheckCircle className="h-4 w-4" /> Открыть доступ
                    </Button>
                    <Button onClick={handleReject} variant="destructive" className="flex-1 gap-1.5 rounded-xl h-10">
                      <XCircle className="h-4 w-4" /> Отклонить
                    </Button>
                  </>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminPayments;
