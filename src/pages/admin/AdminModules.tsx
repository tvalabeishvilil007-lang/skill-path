import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Search, Loader2 } from "lucide-react";

const empty = { course_id: "", title: "", description: "", sort_order: 0, is_published: true };

const AdminModules = () => {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");
  const [editItem, setEditItem] = useState<any>(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(empty);

  const { data: courses } = useQuery({
    queryKey: ["admin-courses-list"],
    queryFn: async () => { const { data } = await supabase.from("courses").select("id, title").order("title"); return data || []; },
  });

  const { data, isLoading } = useQuery({
    queryKey: ["admin-modules"],
    queryFn: async () => {
      const { data, error } = await supabase.from("modules").select("*, courses(title)").order("sort_order");
      if (error) throw error;
      return data;
    },
  });

  const handleSave = async () => {
    if (!form.title || !form.course_id) { toast.error("Заполните обязательные поля"); return; }
    const payload = { course_id: form.course_id, title: form.title, description: form.description, sort_order: form.sort_order, is_published: form.is_published };
    if (editItem) {
      const { error } = await supabase.from("modules").update(payload).eq("id", editItem.id);
      if (error) { toast.error(error.message); return; }
      toast.success("Модуль обновлён");
    } else {
      const { error } = await supabase.from("modules").insert(payload);
      if (error) { toast.error(error.message); return; }
      toast.success("Модуль создан");
    }
    qc.invalidateQueries({ queryKey: ["admin-modules"] });
    setOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Удалить модуль?")) return;
    const { error } = await supabase.from("modules").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Удалено");
    qc.invalidateQueries({ queryKey: ["admin-modules"] });
  };

  const openCreate = () => { setEditItem(null); setForm({ ...empty, course_id: selectedCourseId }); setOpen(true); };
  const openEdit = (item: any) => {
    setEditItem(item);
    setForm({ course_id: item.course_id, title: item.title, description: item.description || "", sort_order: item.sort_order, is_published: item.is_published });
    setOpen(true);
  };

  const filtered = data?.filter((m) => {
    const matchesSearch = m.title.toLowerCase().includes(search.toLowerCase());
    const matchesCourse = selectedCourseId ? m.course_id === selectedCourseId : true;
    return matchesSearch && matchesCourse;
  }) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Модули</h1>
        <Button onClick={openCreate} className="gap-2"><Plus className="h-4 w-4" /> Добавить</Button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="w-64">
          <Select value={selectedCourseId || "all"} onValueChange={(v) => setSelectedCourseId(v === "all" ? "" : v)}>
            <SelectTrigger><SelectValue placeholder="Все курсы" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все курсы</SelectItem>
              {courses?.map((c) => <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Поиск..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
      </div>

      {isLoading ? <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto" /> : (
        <div className="rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-surface">
              <tr>
                <th className="text-left p-3 font-medium">Название</th>
                <th className="text-left p-3 font-medium hidden md:table-cell">Курс</th>
                <th className="text-left p-3 font-medium">Порядок</th>
                <th className="text-left p-3 font-medium">Статус</th>
                <th className="text-right p-3 font-medium">Действия</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((m) => (
                <tr key={m.id} className="border-t border-border hover:bg-muted/30">
                  <td className="p-3 font-medium">{m.title}</td>
                  <td className="p-3 hidden md:table-cell text-muted-foreground">{(m.courses as any)?.title || "—"}</td>
                  <td className="p-3">{m.sort_order}</td>
                  <td className="p-3"><Badge className={m.is_published ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"}>{m.is_published ? "Опубликован" : "Скрыт"}</Badge></td>
                  <td className="p-3 text-right space-x-1">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(m)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(m.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={5} className="p-6 text-center text-muted-foreground">Нет данных</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editItem ? "Редактировать модуль" : "Новый модуль"}</DialogTitle>
            <DialogDescription>Заполните данные модуля</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Курс</Label>
              <Select value={form.course_id} onValueChange={(v) => setForm({ ...form, course_id: v })}>
                <SelectTrigger><SelectValue placeholder="Выберите курс" /></SelectTrigger>
                <SelectContent>{courses?.map((c) => <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label>Название</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
            <div className="space-y-2"><Label>Описание</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} /></div>
            <div className="space-y-2"><Label>Порядок</Label><Input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })} /></div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="mod-pub" checked={form.is_published} onChange={(e) => setForm({ ...form, is_published: e.target.checked })} className="rounded" />
              <Label htmlFor="mod-pub">Опубликован</Label>
            </div>
            <Button onClick={handleSave} className="w-full">Сохранить</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminModules;
