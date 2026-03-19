import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Search, Loader2 } from "lucide-react";

const emptyForm = {
  title: "", slug: "", short_description: "", full_description: "",
  category_id: "", price: 0, old_price: null as number | null,
  status: "draft" as string, is_featured: false, level: "",
  duration: "", access_type: "forever", author_name: "",
};

const AdminCourses = () => {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [editItem, setEditItem] = useState<any>(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const { data: categories } = useQuery({
    queryKey: ["admin-categories"],
    queryFn: async () => { const { data } = await supabase.from("categories").select("*").order("sort_order"); return data || []; },
  });

  const { data, isLoading } = useQuery({
    queryKey: ["admin-courses"],
    queryFn: async () => {
      const { data, error } = await supabase.from("courses").select("*, categories(name)").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const handleSave = async () => {
    if (!form.title || !form.slug) { toast.error("Заполните название и slug"); return; }
    const payload = {
      title: form.title, slug: form.slug, short_description: form.short_description,
      full_description: form.full_description, category_id: form.category_id || null,
      price: form.price, old_price: form.old_price, status: form.status as any,
      is_featured: form.is_featured, level: form.level, duration: form.duration,
      access_type: form.access_type, author_name: form.author_name,
    };
    if (editItem) {
      const { error } = await supabase.from("courses").update(payload).eq("id", editItem.id);
      if (error) { toast.error(error.message); return; }
      toast.success("Курс обновлён");
    } else {
      const { error } = await supabase.from("courses").insert(payload);
      if (error) { toast.error(error.message); return; }
      toast.success("Курс создан");
    }
    qc.invalidateQueries({ queryKey: ["admin-courses"] });
    setOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Удалить курс?")) return;
    const { error } = await supabase.from("courses").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Удалено");
    qc.invalidateQueries({ queryKey: ["admin-courses"] });
  };

  const openCreate = () => { setEditItem(null); setForm(emptyForm); setOpen(true); };
  const openEdit = (item: any) => {
    setEditItem(item);
    setForm({
      title: item.title, slug: item.slug, short_description: item.short_description || "",
      full_description: item.full_description || "", category_id: item.category_id || "",
      price: Number(item.price), old_price: item.old_price ? Number(item.old_price) : null,
      status: item.status, is_featured: item.is_featured, level: item.level || "",
      duration: item.duration || "", access_type: item.access_type, author_name: item.author_name || "",
    });
    setOpen(true);
  };

  const filtered = data?.filter((c) => c.title.toLowerCase().includes(search.toLowerCase())) || [];
  const statusCls: Record<string, string> = {
    published: "bg-success/10 text-success border-success/20",
    draft: "bg-muted text-muted-foreground border-border",
    hidden: "bg-warning/10 text-warning border-warning/20",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Курсы</h1>
        <Button onClick={openCreate} className="gap-2 rounded-xl"><Plus className="h-4 w-4" /> Добавить</Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Поиск..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-10 rounded-xl" />
      </div>

      {isLoading ? <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto" /> : (
        <Card className="rounded-2xl overflow-hidden">
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left p-4 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Название</th>
                  <th className="text-left p-4 font-semibold text-muted-foreground text-xs uppercase tracking-wider hidden md:table-cell">Категория</th>
                  <th className="text-left p-4 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Цена</th>
                  <th className="text-left p-4 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Статус</th>
                  <th className="text-right p-4 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Действия</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr key={c.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                    <td className="p-4">
                      <p className="font-medium">{c.title}</p>
                      <p className="text-xs text-muted-foreground font-mono">{c.slug}</p>
                    </td>
                    <td className="p-4 hidden md:table-cell text-muted-foreground">{(c.categories as any)?.name || "—"}</td>
                    <td className="p-4 font-semibold">{new Intl.NumberFormat("ru-RU").format(Number(c.price))} ₽</td>
                    <td className="p-4"><Badge className={`${statusCls[c.status] || ""} border text-xs`}>{c.status}</Badge></td>
                    <td className="p-4 text-right space-x-1">
                      <Button variant="ghost" size="sm" className="rounded-lg" onClick={() => openEdit(c)}><Pencil className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="sm" className="rounded-lg" onClick={() => handleDelete(c.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">Нет данных</td></tr>}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">{editItem ? "Редактировать курс" : "Новый курс"}</DialogTitle>
            <DialogDescription>Заполните данные курса</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
            <div className="space-y-2"><Label className="text-sm font-medium">Название</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="h-10 rounded-xl" /></div>
            <div className="space-y-2"><Label className="text-sm font-medium">Slug</Label><Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="h-10 rounded-xl" /></div>
            <div className="space-y-2 md:col-span-2"><Label className="text-sm font-medium">Краткое описание</Label><Textarea value={form.short_description} onChange={(e) => setForm({ ...form, short_description: e.target.value })} rows={2} className="rounded-xl" /></div>
            <div className="space-y-2 md:col-span-2"><Label className="text-sm font-medium">Полное описание</Label><Textarea value={form.full_description} onChange={(e) => setForm({ ...form, full_description: e.target.value })} rows={4} className="rounded-xl" /></div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Категория</Label>
              <Select value={form.category_id} onValueChange={(v) => setForm({ ...form, category_id: v })}>
                <SelectTrigger className="h-10 rounded-xl"><SelectValue placeholder="Выберите" /></SelectTrigger>
                <SelectContent>
                  {categories?.map((cat) => <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Статус</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                <SelectTrigger className="h-10 rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Черновик</SelectItem>
                  <SelectItem value="published">Опубликован</SelectItem>
                  <SelectItem value="hidden">Скрыт</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label className="text-sm font-medium">Цена (₽)</Label><Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} className="h-10 rounded-xl" /></div>
            <div className="space-y-2"><Label className="text-sm font-medium">Старая цена</Label><Input type="number" value={form.old_price || ""} onChange={(e) => setForm({ ...form, old_price: e.target.value ? Number(e.target.value) : null })} className="h-10 rounded-xl" /></div>
            <div className="space-y-2"><Label className="text-sm font-medium">Уровень</Label><Input value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })} placeholder="Начинающий / Средний" className="h-10 rounded-xl" /></div>
            <div className="space-y-2"><Label className="text-sm font-medium">Длительность</Label><Input value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} placeholder="12 часов" className="h-10 rounded-xl" /></div>
            <div className="space-y-2"><Label className="text-sm font-medium">Автор</Label><Input value={form.author_name} onChange={(e) => setForm({ ...form, author_name: e.target.value })} className="h-10 rounded-xl" /></div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Тип доступа</Label>
              <Select value={form.access_type} onValueChange={(v) => setForm({ ...form, access_type: v })}>
                <SelectTrigger className="h-10 rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="forever">Бессрочный</SelectItem>
                  <SelectItem value="limited">Ограниченный</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2 md:col-span-2">
              <input type="checkbox" id="featured" checked={form.is_featured} onChange={(e) => setForm({ ...form, is_featured: e.target.checked })} className="rounded" />
              <Label htmlFor="featured" className="text-sm">Рекомендуемый</Label>
            </div>
          </div>
          <Button onClick={handleSave} className="w-full mt-4 h-10 rounded-xl">Сохранить</Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminCourses;
