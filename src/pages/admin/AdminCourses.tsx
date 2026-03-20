import { useState, useRef } from "react";
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
import { Plus, Pencil, Trash2, Search, Loader2, Upload, X, Image } from "lucide-react";
import { slugify } from "@/lib/slugify";
import { uploadFile, getPublicUrl } from "@/lib/storage";

const emptyForm = {
  title: "", short_description: "", full_description: "",
  category_id: "", price: 0, old_price: null as number | null,
  status: "draft" as string, is_featured: false, level: "",
  duration: "", access_type: "forever", author_name: "",
  cover_url: "" as string,
};

const AdminCourses = () => {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [editItem, setEditItem] = useState<any>(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

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

  const handleCoverUpload = async (file: File) => {
    setUploading(true);
    try {
      const path = await uploadFile('course-covers', file, `covers/${Date.now()}-${file.name}`);
      const url = getPublicUrl('course-covers', path);
      setForm(f => ({ ...f, cover_url: url }));
      toast.success("Обложка загружена");
    } catch (e: any) {
      toast.error(e.message || "Ошибка загрузки");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!form.title) { toast.error("Введите название курса"); return; }
    
    const slug = slugify(form.title);
    
    const payload = {
      title: form.title, slug, short_description: form.short_description,
      full_description: form.full_description, category_id: form.category_id || null,
      price: form.price, old_price: form.old_price, status: form.status as any,
      is_featured: form.is_featured, level: form.level, duration: form.duration,
      access_type: form.access_type, author_name: form.author_name,
      cover_url: form.cover_url || null,
    };
    if (editItem) {
      // Keep existing slug if title hasn't changed
      if (editItem.title === form.title) {
        payload.slug = editItem.slug;
      }
      const { error } = await supabase.from("courses").update(payload).eq("id", editItem.id);
      if (error) { toast.error(error.message); return; }
      toast.success("Курс обновлён");
    } else {
      const { error } = await supabase.from("courses").insert(payload);
      if (error) {
        if (error.message.includes('duplicate') || error.message.includes('unique')) {
          // Auto-add suffix
          payload.slug = slug + '-' + Date.now().toString(36);
          const { error: e2 } = await supabase.from("courses").insert(payload);
          if (e2) { toast.error(e2.message); return; }
        } else {
          toast.error(error.message); return;
        }
      }
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
      title: item.title, short_description: item.short_description || "",
      full_description: item.full_description || "", category_id: item.category_id || "",
      price: Number(item.price), old_price: item.old_price ? Number(item.old_price) : null,
      status: item.status, is_featured: item.is_featured, level: item.level || "",
      duration: item.duration || "", access_type: item.access_type, author_name: item.author_name || "",
      cover_url: item.cover_url || "",
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
                      <div className="flex items-center gap-3">
                        {c.cover_url ? (
                          <img src={c.cover_url} alt="" className="w-10 h-10 rounded-lg object-cover" />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                            <Image className="h-4 w-4 text-muted-foreground" />
                          </div>
                        )}
                        <p className="font-medium">{c.title}</p>
                      </div>
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
            <DialogDescription>Slug генерируется автоматически из названия</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
            {/* Cover upload */}
            <div className="md:col-span-2 space-y-2">
              <Label className="text-sm font-medium">Обложка курса</Label>
              <input ref={fileRef} type="file" accept="image/*" className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleCoverUpload(f); }} />
              {form.cover_url ? (
                <div className="relative w-full h-40 rounded-xl overflow-hidden border border-border">
                  <img src={form.cover_url} alt="" className="w-full h-full object-cover" />
                  <Button variant="destructive" size="icon" className="absolute top-2 right-2 h-7 w-7 rounded-full"
                    onClick={() => setForm(f => ({ ...f, cover_url: "" }))}>
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ) : (
                <button
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  className="w-full h-32 border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors"
                >
                  {uploading ? <Loader2 className="h-6 w-6 animate-spin" /> : <Upload className="h-6 w-6" />}
                  <span className="text-sm">{uploading ? "Загрузка..." : "Нажмите для загрузки обложки"}</span>
                </button>
              )}
            </div>

            <div className="space-y-2"><Label className="text-sm font-medium">Название</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Например: WB с нуля" className="h-10 rounded-xl" /></div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Категория</Label>
              <Select value={form.category_id} onValueChange={(v) => setForm({ ...form, category_id: v })}>
                <SelectTrigger className="h-10 rounded-xl"><SelectValue placeholder="Выберите" /></SelectTrigger>
                <SelectContent>
                  {categories?.map((cat) => <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 md:col-span-2"><Label className="text-sm font-medium">Краткое описание</Label><Textarea value={form.short_description} onChange={(e) => setForm({ ...form, short_description: e.target.value })} rows={2} className="rounded-xl" /></div>
            <div className="space-y-2 md:col-span-2"><Label className="text-sm font-medium">Полное описание</Label><Textarea value={form.full_description} onChange={(e) => setForm({ ...form, full_description: e.target.value })} rows={4} className="rounded-xl" /></div>
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
