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
import { Plus, Pencil, Trash2, Search, Loader2 } from "lucide-react";

const empty = { lesson_id: "", title: "", file_url: "", file_type: "pdf", sort_order: 0 };
const fileTypes = [
  { value: "pdf", label: "PDF" },
  { value: "file", label: "Файл" },
  { value: "link", label: "Ссылка" },
  { value: "checklist", label: "Чек-лист" },
  { value: "additional", label: "Доп. материал" },
];

const AdminMaterials = () => {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [editItem, setEditItem] = useState<any>(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(empty);

  const { data: lessons } = useQuery({
    queryKey: ["admin-lessons-list"],
    queryFn: async () => {
      const { data } = await supabase.from("lessons").select("id, title, modules(title)").order("sort_order");
      return data || [];
    },
  });

  const { data, isLoading } = useQuery({
    queryKey: ["admin-materials"],
    queryFn: async () => {
      const { data, error } = await supabase.from("lesson_materials").select("*, lessons(title)").order("sort_order");
      if (error) throw error;
      return data;
    },
  });

  const handleSave = async () => {
    if (!form.title || !form.lesson_id || !form.file_url) { toast.error("Заполните обязательные поля"); return; }
    const payload = { lesson_id: form.lesson_id, title: form.title, file_url: form.file_url, file_type: form.file_type, sort_order: form.sort_order };
    if (editItem) {
      const { error } = await supabase.from("lesson_materials").update(payload).eq("id", editItem.id);
      if (error) { toast.error(error.message); return; }
      toast.success("Материал обновлён");
    } else {
      const { error } = await supabase.from("lesson_materials").insert(payload);
      if (error) { toast.error(error.message); return; }
      toast.success("Материал создан");
    }
    qc.invalidateQueries({ queryKey: ["admin-materials"] });
    setOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Удалить материал?")) return;
    const { error } = await supabase.from("lesson_materials").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Удалено");
    qc.invalidateQueries({ queryKey: ["admin-materials"] });
  };

  const openCreate = () => { setEditItem(null); setForm(empty); setOpen(true); };
  const openEdit = (item: any) => {
    setEditItem(item);
    setForm({ lesson_id: item.lesson_id, title: item.title, file_url: item.file_url, file_type: item.file_type || "pdf", sort_order: item.sort_order });
    setOpen(true);
  };

  const filtered = data?.filter((m) => m.title.toLowerCase().includes(search.toLowerCase())) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Материалы уроков</h1>
        <Button onClick={openCreate} className="gap-2"><Plus className="h-4 w-4" /> Добавить</Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Поиск..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>

      {isLoading ? <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto" /> : (
        <div className="rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-surface">
              <tr>
                <th className="text-left p-3 font-medium">Название</th>
                <th className="text-left p-3 font-medium hidden md:table-cell">Урок</th>
                <th className="text-left p-3 font-medium">Тип</th>
                <th className="text-right p-3 font-medium">Действия</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((m) => (
                <tr key={m.id} className="border-t border-border hover:bg-muted/30">
                  <td className="p-3 font-medium">{m.title}</td>
                  <td className="p-3 hidden md:table-cell text-muted-foreground">{(m.lessons as any)?.title || "—"}</td>
                  <td className="p-3"><Badge variant="secondary">{fileTypes.find((f) => f.value === m.file_type)?.label || m.file_type}</Badge></td>
                  <td className="p-3 text-right space-x-1">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(m)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(m.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={4} className="p-6 text-center text-muted-foreground">Нет данных</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editItem ? "Редактировать материал" : "Новый материал"}</DialogTitle>
            <DialogDescription>Прикрепите материал к уроку</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Урок</Label>
              <Select value={form.lesson_id} onValueChange={(v) => setForm({ ...form, lesson_id: v })}>
                <SelectTrigger><SelectValue placeholder="Выберите урок" /></SelectTrigger>
                <SelectContent>{lessons?.map((l) => <SelectItem key={l.id} value={l.id}>{(l.modules as any)?.title} → {l.title}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label>Название</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
            <div className="space-y-2"><Label>URL файла / ссылка</Label><Input value={form.file_url} onChange={(e) => setForm({ ...form, file_url: e.target.value })} /></div>
            <div className="space-y-2">
              <Label>Тип</Label>
              <Select value={form.file_type} onValueChange={(v) => setForm({ ...form, file_type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{fileTypes.map((ft) => <SelectItem key={ft.value} value={ft.value}>{ft.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label>Порядок</Label><Input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })} /></div>
            <Button onClick={handleSave} className="w-full">Сохранить</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminMaterials;
