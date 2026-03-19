import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Loader2, Star } from "lucide-react";

interface Plan {
  id: string; name: string; slug: string; price: number; period_days: number | null;
  description: string | null; features: string[]; excluded_features: string[];
  is_active: boolean; is_recommended: boolean; categories_open: number;
  materials_open: number; sort_order: number;
}

const emptyForm = {
  name: "", slug: "", price: 0, period_days: null as number | null,
  description: "", features: "[]", excluded_features: "[]",
  is_active: true, is_recommended: false, categories_open: 0,
  materials_open: 0, sort_order: 0,
};

const AdminPlans = () => {
  const qc = useQueryClient();
  const [editItem, setEditItem] = useState<Plan | null>(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-plans"],
    queryFn: async () => {
      // plans table may not be in generated types yet, use type assertion
      const { data, error } = await (supabase as any).from("plans").select("*").order("sort_order");
      if (error) throw error;
      return data as Plan[];
    },
  });

  const handleSave = async () => {
    if (!form.name || !form.slug) { toast.error("Заполните название и slug"); return; }
    let features: string[], excluded: string[];
    try { features = JSON.parse(form.features); } catch { toast.error("Неверный JSON в преимуществах"); return; }
    try { excluded = JSON.parse(form.excluded_features); } catch { toast.error("Неверный JSON в исключениях"); return; }

    const payload = {
      name: form.name, slug: form.slug, price: form.price,
      period_days: form.period_days, description: form.description,
      features, excluded_features: excluded,
      is_active: form.is_active, is_recommended: form.is_recommended,
      categories_open: form.categories_open, materials_open: form.materials_open,
      sort_order: form.sort_order,
    };

    if (editItem) {
      const { error } = await (supabase as any).from("plans").update(payload).eq("id", editItem.id);
      if (error) { toast.error(error.message); return; }
      toast.success("Тариф обновлён");
    } else {
      const { error } = await (supabase as any).from("plans").insert(payload);
      if (error) { toast.error(error.message); return; }
      toast.success("Тариф создан");
    }
    qc.invalidateQueries({ queryKey: ["admin-plans"] });
    setOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Удалить тариф?")) return;
    const { error } = await (supabase as any).from("plans").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Удалено");
    qc.invalidateQueries({ queryKey: ["admin-plans"] });
  };

  const openCreate = () => { setEditItem(null); setForm(emptyForm); setOpen(true); };
  const openEdit = (item: Plan) => {
    setEditItem(item);
    setForm({
      name: item.name, slug: item.slug, price: item.price,
      period_days: item.period_days, description: item.description || "",
      features: JSON.stringify(item.features, null, 2),
      excluded_features: JSON.stringify(item.excluded_features, null, 2),
      is_active: item.is_active, is_recommended: item.is_recommended,
      categories_open: item.categories_open, materials_open: item.materials_open,
      sort_order: item.sort_order,
    });
    setOpen(true);
  };

  const formatPrice = (n: number) => new Intl.NumberFormat("ru-RU").format(n) + " ₽";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Тарифы</h1>
        <Button onClick={openCreate} className="gap-2"><Plus className="h-4 w-4" /> Добавить</Button>
      </div>

      {isLoading ? <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto" /> : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {(data || []).map((plan) => (
            <div key={plan.id} className={`rounded-xl border p-6 space-y-4 ${plan.is_recommended ? "border-primary/50 bg-card" : "border-border bg-card"}`}>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold">{plan.name}</h3>
                {plan.is_recommended && <Badge className="bg-primary/10 text-primary gap-1"><Star className="h-3 w-3" /> Рекомендуемый</Badge>}
              </div>
              <p className="text-3xl font-bold">{formatPrice(plan.price)}</p>
              <p className="text-sm text-muted-foreground">{plan.period_days ? `${plan.period_days} дней` : "Бессрочный"}</p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="rounded-lg bg-surface border border-border p-2 text-center">
                  <p className="font-bold text-primary">{plan.categories_open}</p>
                  <p className="text-[10px] text-muted-foreground">категорий</p>
                </div>
                <div className="rounded-lg bg-surface border border-border p-2 text-center">
                  <p className="font-bold text-accent">{plan.materials_open}</p>
                  <p className="text-[10px] text-muted-foreground">материалов</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={plan.is_active ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"}>{plan.is_active ? "Активен" : "Неактивен"}</Badge>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1 gap-1" onClick={() => openEdit(plan)}><Pencil className="h-3.5 w-3.5" /> Редактировать</Button>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(plan.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editItem ? "Редактировать тариф" : "Новый тариф"}</DialogTitle>
            <DialogDescription>Настройте параметры тарифа</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2"><Label>Название</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div className="space-y-2"><Label>Slug</Label><Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} /></div>
            <div className="space-y-2"><Label>Цена (₽)</Label><Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} /></div>
            <div className="space-y-2"><Label>Срок (дней, пусто = бессрочно)</Label><Input type="number" value={form.period_days || ""} onChange={(e) => setForm({ ...form, period_days: e.target.value ? Number(e.target.value) : null })} /></div>
            <div className="space-y-2 md:col-span-2"><Label>Описание</Label><Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
            <div className="space-y-2"><Label>Категорий открыто</Label><Input type="number" value={form.categories_open} onChange={(e) => setForm({ ...form, categories_open: Number(e.target.value) })} /></div>
            <div className="space-y-2"><Label>Материалов открыто</Label><Input type="number" value={form.materials_open} onChange={(e) => setForm({ ...form, materials_open: Number(e.target.value) })} /></div>
            <div className="space-y-2 md:col-span-2"><Label>Преимущества (JSON массив строк)</Label><Textarea value={form.features} onChange={(e) => setForm({ ...form, features: e.target.value })} rows={4} className="font-mono text-xs" /></div>
            <div className="space-y-2 md:col-span-2"><Label>Исключения (JSON массив строк)</Label><Textarea value={form.excluded_features} onChange={(e) => setForm({ ...form, excluded_features: e.target.value })} rows={3} className="font-mono text-xs" /></div>
            <div className="space-y-2"><Label>Порядок сортировки</Label><Input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })} /></div>
            <div className="flex flex-col gap-3 justify-center">
              <div className="flex items-center gap-2">
                <input type="checkbox" id="plan-active" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="rounded" />
                <Label htmlFor="plan-active">Активен</Label>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="plan-rec" checked={form.is_recommended} onChange={(e) => setForm({ ...form, is_recommended: e.target.checked })} className="rounded" />
                <Label htmlFor="plan-rec">Рекомендуемый</Label>
              </div>
            </div>
          </div>
          <Button onClick={handleSave} className="w-full mt-4">Сохранить</Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminPlans;
