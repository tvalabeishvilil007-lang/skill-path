import { useState, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  Plus, Pencil, Trash2, Search, Loader2, Upload, Video, X,
  FolderOpen, Film, FileText, Paperclip,
} from "lucide-react";
import { slugify } from "@/lib/slugify";
import { uploadFile } from "@/lib/storage";
import StorageFileBrowser from "@/components/admin/StorageFileBrowser";
import LessonMaterials, { type LessonMaterialsHandle, type PendingMaterial } from "@/components/admin/LessonMaterials";

const empty = {
  module_id: "", title: "", description: "",
  content_type: "video" as string,
  is_published: true, is_free_preview: false,
  video_storage_path: "",
};

const typeLbl: Record<string, string> = { video: "Видео", text: "Текст", pdf: "PDF", mixed: "Смешанный" };

const AdminLessons = () => {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");
  const [editItem, setEditItem] = useState<any>(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(empty);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const videoRef = useRef<HTMLInputElement>(null);
  const [videoBrowserOpen, setVideoBrowserOpen] = useState(false);
  const materialsRef = useRef<LessonMaterialsHandle>(null);

  const { data: courses } = useQuery({
    queryKey: ["admin-courses-list"],
    queryFn: async () => { const { data } = await supabase.from("courses").select("id, title").order("title"); return data || []; },
  });

  const { data: modules } = useQuery({
    queryKey: ["admin-modules-list"],
    queryFn: async () => {
      const { data } = await supabase.from("modules").select("id, title, course_id, courses(title)").order("sort_order");
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

  // Fetch material counts per lesson
  const { data: materialCounts } = useQuery({
    queryKey: ["admin-lesson-material-counts"],
    queryFn: async () => {
      const { data } = await supabase.from("lesson_materials").select("lesson_id");
      const counts: Record<string, number> = {};
      data?.forEach((m) => { counts[m.lesson_id] = (counts[m.lesson_id] || 0) + 1; });
      return counts;
    },
  });

  const savePendingMaterials = async (lessonId: string) => {
    const pending = materialsRef.current?.getPendingMaterials() || [];
    for (let i = 0; i < pending.length; i++) {
      const pm = pending[i];
      let fileUrl = pm.url;
      let detectedType = pm.type;
      if (pm.file) {
        const path = `materials/${Date.now()}-${pm.file.name}`;
        fileUrl = await uploadFile("course-materials", pm.file, path);
        const ext = pm.file.name.split(".").pop()?.toLowerCase();
        if (ext === "pdf") detectedType = "pdf";
      }
      await supabase.from("lesson_materials").insert({
        lesson_id: lessonId, title: pm.title, file_url: fileUrl, file_type: detectedType, sort_order: i,
      });
    }
    materialsRef.current?.clearPending();
  };

  const handleSave = async () => {
    if (!form.title || !form.module_id) { toast.error("Введите название и выберите модуль"); return; }

    setUploading(true);
    try {
      let videoUrl = form.video_storage_path;

      if (videoFile) {
        const path = `lessons/${Date.now()}-${videoFile.name}`;
        videoUrl = await uploadFile("course-videos", videoFile, path);
        toast.success("Видео загружено");
      }

      const slug = slugify(form.title);

      // Auto-calculate sort_order for new lessons
      let sortOrder = 0;
      if (!editItem) {
        const existing = data?.filter(l => l.module_id === form.module_id) || [];
        sortOrder = existing.length > 0 ? Math.max(...existing.map(l => l.sort_order)) + 1 : 0;
      }

      const payload = {
        module_id: form.module_id, title: form.title, slug,
        description: form.description || null,
        video_url: videoUrl || null,
        content_type: form.content_type as any,
        is_published: form.is_published, is_free_preview: form.is_free_preview,
        ...(editItem ? {} : { sort_order: sortOrder }),
      };

      if (editItem) {
        if (editItem.title === form.title) payload.slug = editItem.slug;
        const { error } = await supabase.from("lessons").update(payload).eq("id", editItem.id);
        if (error) { toast.error(error.message); return; }
        toast.success("Урок обновлён");
      } else {
        const { data: inserted, error } = await supabase.from("lessons").insert(payload).select("id").single();
        if (error) {
          if (error.message.includes("duplicate") || error.message.includes("unique")) {
            payload.slug = slug + "-" + Date.now().toString(36);
            const { data: inserted2, error: e2 } = await supabase.from("lessons").insert(payload).select("id").single();
            if (e2) { toast.error(e2.message); return; }
            if (inserted2) await savePendingMaterials(inserted2.id);
          } else { toast.error(error.message); return; }
        } else if (inserted) {
          await savePendingMaterials(inserted.id);
        }
        toast.success("Урок создан");
      }
      qc.invalidateQueries({ queryKey: ["admin-lessons"] });
      qc.invalidateQueries({ queryKey: ["admin-lesson-material-counts"] });
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
      content_type: item.content_type,
      is_published: item.is_published,
      is_free_preview: item.is_free_preview,
      video_storage_path: item.video_url || "",
    });
    setVideoFile(null);
    setOpen(true);
  };

  const handleVideoBrowserSelect = (path: string) => {
    setForm((f) => ({ ...f, video_storage_path: path }));
  };

  const filteredModules = selectedCourseId ? modules?.filter(m => (m as any).course_id === selectedCourseId) : modules;

  const filtered = data?.filter((l) => {
    const matchesSearch = l.title.toLowerCase().includes(search.toLowerCase());
    const matchesCourse = selectedCourseId ? filteredModules?.some(m => m.id === l.module_id) : true;
    return matchesSearch && matchesCourse;
  }) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Уроки</h1>
        <Button onClick={openCreate} className="gap-2"><Plus className="h-4 w-4" />Добавить</Button>
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
            <thead className="bg-muted/40">
              <tr>
                <th className="text-left p-3 font-medium">Название</th>
                <th className="text-left p-3 font-medium hidden lg:table-cell">Модуль / Курс</th>
                <th className="text-left p-3 font-medium">Тип</th>
                <th className="text-center p-3 font-medium w-16">
                  <Film className="h-3.5 w-3.5 mx-auto" />
                </th>
                <th className="text-center p-3 font-medium w-16">
                  <Paperclip className="h-3.5 w-3.5 mx-auto" />
                </th>
                <th className="text-center p-3 font-medium">Статус</th>
                <th className="text-right p-3 font-medium">Действия</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((l) => {
                const matCount = materialCounts?.[l.id] || 0;
                return (
                  <tr key={l.id} className="border-t border-border hover:bg-muted/20 transition-colors">
                    <td className="p-3">
                      <p className="font-medium">{l.title}</p>
                      {l.is_free_preview && <Badge className="bg-success/10 text-success text-[10px] mt-1">Free Preview</Badge>}
                    </td>
                    <td className="p-3 hidden lg:table-cell text-muted-foreground text-xs">
                      {(l.modules as any)?.title} / {(l.modules as any)?.courses?.title}
                    </td>
                    <td className="p-3"><Badge variant="secondary" className="text-[11px]">{typeLbl[l.content_type] || l.content_type}</Badge></td>
                    <td className="p-3 text-center">
                      {l.video_url ? (
                        <Badge className="bg-primary/10 text-primary text-[10px] px-1.5"><Film className="h-3 w-3" /></Badge>
                      ) : (
                        <span className="text-muted-foreground/40">—</span>
                      )}
                    </td>
                    <td className="p-3 text-center">
                      {matCount > 0 ? (
                        <Badge variant="secondary" className="text-[10px] px-1.5">{matCount}</Badge>
                      ) : (
                        <span className="text-muted-foreground/40">—</span>
                      )}
                    </td>
                    <td className="p-3 text-center">
                      <Badge className={l.is_published ? "bg-success/10 text-success text-[10px]" : "bg-muted text-muted-foreground text-[10px]"}>
                        {l.is_published ? "Опубл." : "Скрыт"}
                      </Badge>
                    </td>
                    <td className="p-3 text-right space-x-1">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(l)}><Pencil className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(l.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && <tr><td colSpan={7} className="p-6 text-center text-muted-foreground">Нет данных</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {/* ===== Lesson Dialog ===== */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto p-0">
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-border sticky top-0 bg-background z-10">
            <DialogTitle>{editItem ? "Редактировать урок" : "Новый урок"}</DialogTitle>
            <DialogDescription>Slug генерируется автоматически</DialogDescription>
          </DialogHeader>

          <div className="px-6 py-5 space-y-6">
            {/* ── Section: Основное ── */}
            <section className="space-y-4">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Основное</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Модуль</Label>
                  <Select value={form.module_id} onValueChange={(v) => setForm({ ...form, module_id: v })}>
                    <SelectTrigger><SelectValue placeholder="Выберите модуль" /></SelectTrigger>
                    <SelectContent>
                      {(selectedCourseId ? filteredModules : modules)?.map((m) => (
                        <SelectItem key={m.id} value={m.id}>
                          {selectedCourseId ? m.title : `${(m.courses as any)?.title} → ${m.title}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedCourseId && filteredModules?.length === 0 && (
                    <p className="text-xs text-muted-foreground">Нет модулей для выбранного курса</p>
                  )}
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
                <div className="space-y-2 md:col-span-2">
                  <Label>Название</Label>
                  <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Введение в тему" />
                </div>
              </div>
            </section>

            {/* ── Section: Видео ── */}
            <section className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Видео</h3>
              <input ref={videoRef} type="file" accept="video/*" className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) setVideoFile(f); }} />

              {videoFile ? (
                <div className="flex items-center gap-3 p-3 bg-muted/40 rounded-xl border border-border">
                  <Film className="h-5 w-5 text-primary shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{videoFile.name}</p>
                    <p className="text-xs text-muted-foreground">{(videoFile.size / 1024 / 1024).toFixed(1)} МБ</p>
                  </div>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setVideoFile(null)}><X className="h-3.5 w-3.5" /></Button>
                </div>
              ) : form.video_storage_path ? (
                <div className="flex items-center gap-3 p-3 bg-primary/5 rounded-xl border border-primary/20">
                  <Film className="h-5 w-5 text-primary shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">Видео привязано</p>
                    <p className="text-xs text-muted-foreground truncate">{form.video_storage_path.split("/").pop()}</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => videoRef.current?.click()}>Заменить</Button>
                  <Button variant="ghost" size="sm" onClick={() => setForm((f) => ({ ...f, video_storage_path: "" }))}>Удалить</Button>
                </div>
              ) : (
                <div className="flex gap-3">
                  <button onClick={() => videoRef.current?.click()}
                    className="flex-1 h-20 border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center gap-1.5 text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors">
                    <Upload className="h-5 w-5" />
                    <span className="text-xs">Загрузить видео</span>
                  </button>
                  <button onClick={() => setVideoBrowserOpen(true)}
                    className="flex-1 h-20 border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center gap-1.5 text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors">
                    <FolderOpen className="h-5 w-5" />
                    <span className="text-xs">Выбрать с сервера</span>
                  </button>
                </div>
              )}
            </section>

            {/* ── Section: Описание ── */}
            <section className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Описание</h3>
              <Textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Описание урока, ссылки, инструкции для учеников..."
                rows={6}
                className="resize-y leading-relaxed"
              />
            </section>

            {/* ── Section: Файлы урока ── */}
            <section className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <FileText className="h-4 w-4" />Файлы урока
              </h3>
              <LessonMaterials ref={materialsRef} lessonId={editItem?.id || null} />
            </section>

            {/* ── Section: Настройки ── */}
            <section className="space-y-4">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Настройки</h3>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2.5">
                  <Switch id="les-pub" checked={form.is_published} onCheckedChange={(v) => setForm({ ...form, is_published: v })} />
                  <Label htmlFor="les-pub" className="cursor-pointer">Опубликован</Label>
                </div>
                <div className="flex items-center gap-2.5">
                  <Switch id="les-free" checked={form.is_free_preview} onCheckedChange={(v) => setForm({ ...form, is_free_preview: v })} />
                  <Label htmlFor="les-free" className="cursor-pointer">Бесплатный превью</Label>
                </div>
              </div>
            </section>
          </div>

          {/* ── Footer ── */}
          <div className="px-6 py-4 border-t border-border sticky bottom-0 bg-background">
            <Button onClick={handleSave} disabled={uploading} className="w-full">
              {uploading ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Загрузка...</> : "Сохранить"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Video file browser */}
      <StorageFileBrowser
        open={videoBrowserOpen}
        onOpenChange={setVideoBrowserOpen}
        bucket="course-videos"
        onSelect={handleVideoBrowserSelect}
        title="Выбрать видео с сервера"
      />
    </div>
  );
};

export default AdminLessons;
