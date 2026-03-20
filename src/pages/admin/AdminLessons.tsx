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
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Search, Loader2, Upload, Video, X } from "lucide-react";
import { slugify } from "@/lib/slugify";
import { uploadFile } from "@/lib/storage";

const empty = {
  module_id: "", title: "", description: "",
  content_type: "video" as string, duration_seconds: 0, sort_order: 0,
  is_published: true, is_free_preview: false,
  video_storage_path: "",
};

const AdminLessons = () => {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [editItem, setEditItem] = useState<any>(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(empty);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const videoRef = useRef<HTMLInputElement>(null);

  const { data: modules } = useQuery({
    queryKey: ["admin-modules-list"],
    queryFn: async () => {
      const { data } = await supabase.from("modules").select("id, title, courses(title)").order("sort_order");
      return data || [];
    },
  });

  const { data, isLoading } = useQuery({
    queryKey: ["admin-lessons"],
    queryFn: async () => {
      const { data, error } = await supabase.from("lessons").select("*, modules(title, courses(title))").order("sort_order");
      if (error) throw error;
      return data;
    },
  });

  const handleSave = async () => {
    if (!form.title || !form.module_id) { toast.error("Введите название и выберите модуль"); return; }
    
    setUploading(true);
    try {
      let videoUrl = form.video_storage_path;
      
      // Upload video if new file selected
      if (videoFile) {
        const path = `lessons/${Date.now()}-${videoFile.name}`;
        videoUrl = await uploadFile('course-videos', videoFile, path);
        toast.success("Видео загружено");
      }

      const slug = slugify(form.title);
      
      const payload = {
        module_id: form.module_id, title: form.title, slug,
        description: form.description || null,
        video_url: videoUrl || null,
        content_type: form.content_type as any,
        duration_seconds: form.duration_seconds || null, sort_order: form.sort_order,
        is_published: form.is_published, is_free_preview: form.is_free_preview,
      };

      if (editItem) {
        if (editItem.title === form.title) payload.slug = editItem.slug;
        const { error } = await supabase.from("lessons").update(payload).eq("id", editItem.id);
        if (error) { toast.error(error.message); return; }
        toast.success("Урок обновлён");
      } else {
        const { error } = await supabase.from("lessons").insert(payload);
        if (error) {
          if (error.message.includes('duplicate') || error.message.includes('unique')) {
            payload.slug = slug + '-' + Date.now().toString(36);
            const { error: e2 } = await supabase.from("lessons").insert(payload);
            if (e2) { toast.error(e2.message); return; }
          } else { toast.error(error.message); return; }
        }
        toast.success("Урок создан");
      }
      qc.invalidateQueries({ queryKey: ["admin-lessons"] });
      setOpen(false);
      setVideoFile(null);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Удалить урок?")) return;
    const { error } = await supabase.from("lessons").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Удалено");
    qc.invalidateQueries({ queryKey: ["admin-lessons"] });
  };

  const openCreate = () => { setEditItem(null); setForm(empty); setVideoFile(null); setOpen(true); };
  const openEdit = (item: any) => {
    setEditItem(item);
    setForm({
      module_id: item.module_id, title: item.title,
      description: item.description || "",
      content_type: item.content_type, duration_seconds: item.duration_seconds || 0,
      sort_order: item.sort_order, is_published: item.is_published,
      is_free_preview: item.is_free_preview,
      video_storage_path: item.video_url || "",
    });
    setVideoFile(null);
    setOpen(true);
  };

  const filtered = data?.filter((l) => l.title.toLowerCase().includes(search.toLowerCase())) || [];
  const typeLbl: Record<string, string> = { video: "Видео", text: "Текст", pdf: "PDF", mixed: "Смешанный" };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Уроки</h1>
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
                <th className="text-left p-3 font-medium hidden lg:table-cell">Модуль / Курс</th>
                <th className="text-left p-3 font-medium">Тип</th>
                <th className="text-left p-3 font-medium">Видео</th>
                <th className="text-left p-3 font-medium">Статус</th>
                <th className="text-right p-3 font-medium">Действия</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((l) => (
                <tr key={l.id} className="border-t border-border hover:bg-muted/30">
                  <td className="p-3">
                    <p className="font-medium">{l.title}</p>
                    {l.is_free_preview && <Badge className="bg-success/10 text-success text-[10px] mt-1">Free Preview</Badge>}
                  </td>
                  <td className="p-3 hidden lg:table-cell text-muted-foreground text-xs">
                    {(l.modules as any)?.title} / {(l.modules as any)?.courses?.title}
                  </td>
                  <td className="p-3"><Badge variant="secondary">{typeLbl[l.content_type] || l.content_type}</Badge></td>
                  <td className="p-3">
                    {l.video_url ? (
                      <Badge className="bg-primary/10 text-primary text-[10px]"><Video className="h-3 w-3 mr-1" />Есть</Badge>
                    ) : (
                      <span className="text-muted-foreground text-xs">—</span>
                    )}
                  </td>
                  <td className="p-3"><Badge className={l.is_published ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"}>{l.is_published ? "Опубл." : "Скрыт"}</Badge></td>
                  <td className="p-3 text-right space-x-1">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(l)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(l.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={6} className="p-6 text-center text-muted-foreground">Нет данных</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editItem ? "Редактировать урок" : "Новый урок"}</DialogTitle>
            <DialogDescription>Slug генерируется автоматически из названия</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Модуль</Label>
              <Select value={form.module_id} onValueChange={(v) => setForm({ ...form, module_id: v })}>
                <SelectTrigger><SelectValue placeholder="Выберите модуль" /></SelectTrigger>
                <SelectContent>{modules?.map((m) => <SelectItem key={m.id} value={m.id}>{(m.courses as any)?.title} → {m.title}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Тип контента</Label>
              <Select value={form.content_type} onValueChange={(v) => setForm({ ...form, content_type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="video">Видео</SelectItem>
                  <SelectItem value="text">Текст</SelectItem>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="mixed">Смешанный</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 md:col-span-2"><Label>Название</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Например: Введение в тему" /></div>
            <div className="space-y-2 md:col-span-2"><Label>Описание</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} /></div>
            
            {/* Video upload */}
            <div className="space-y-2 md:col-span-2">
              <Label>Видеофайл</Label>
              <input ref={videoRef} type="file" accept="video/*" className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) setVideoFile(f); }} />
              
              {videoFile ? (
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl border border-border">
                  <Video className="h-5 w-5 text-primary shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{videoFile.name}</p>
                    <p className="text-xs text-muted-foreground">{(videoFile.size / 1024 / 1024).toFixed(1)} МБ</p>
                  </div>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setVideoFile(null)}><X className="h-3.5 w-3.5" /></Button>
                </div>
              ) : form.video_storage_path ? (
                <div className="flex items-center gap-3 p-3 bg-primary/5 rounded-xl border border-primary/20">
                  <Video className="h-5 w-5 text-primary shrink-0" />
                  <p className="text-sm flex-1">Видео загружено</p>
                  <Button variant="outline" size="sm" onClick={() => videoRef.current?.click()}>Заменить</Button>
                  <Button variant="ghost" size="sm" onClick={() => setForm(f => ({ ...f, video_storage_path: "" }))}>Удалить</Button>
                </div>
              ) : (
                <button onClick={() => videoRef.current?.click()}
                  className="w-full h-24 border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center gap-1.5 text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors">
                  <Upload className="h-5 w-5" />
                  <span className="text-sm">Загрузить видео</span>
                </button>
              )}
            </div>

            <div className="space-y-2"><Label>Длительность (сек)</Label><Input type="number" value={form.duration_seconds} onChange={(e) => setForm({ ...form, duration_seconds: Number(e.target.value) })} /></div>
            <div className="space-y-2"><Label>Порядок</Label><Input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })} /></div>
            <div className="flex items-center gap-4 md:col-span-2">
              <div className="flex items-center gap-2">
                <input type="checkbox" id="les-pub" checked={form.is_published} onChange={(e) => setForm({ ...form, is_published: e.target.checked })} className="rounded" />
                <Label htmlFor="les-pub">Опубликован</Label>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="les-free" checked={form.is_free_preview} onChange={(e) => setForm({ ...form, is_free_preview: e.target.checked })} className="rounded" />
                <Label htmlFor="les-free">Бесплатный превью</Label>
              </div>
            </div>
          </div>
          <Button onClick={handleSave} disabled={uploading} className="w-full mt-4">
            {uploading ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Загрузка...</> : "Сохранить"}
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminLessons;
