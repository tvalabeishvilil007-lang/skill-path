import { useState, useRef, useImperativeHandle, forwardRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Plus, Trash2, Upload, FileText, FileSpreadsheet, File, Film, Loader2, X, FolderOpen, Link2 } from "lucide-react";
import { uploadFile } from "@/lib/storage";
import StorageFileBrowser from "./StorageFileBrowser";

const materialIcon = (name: string, fileType?: string) => {
  const ext = name.split(".").pop()?.toLowerCase() || fileType || "";
  if (["pdf"].includes(ext)) return <FileText className="h-4 w-4 text-destructive shrink-0" />;
  if (["xls", "xlsx", "csv"].includes(ext)) return <FileSpreadsheet className="h-4 w-4 text-success shrink-0" />;
  if (["doc", "docx"].includes(ext)) return <FileText className="h-4 w-4 text-primary shrink-0" />;
  if (["ppt", "pptx"].includes(ext)) return <FileText className="h-4 w-4 text-accent shrink-0" />;
  if (["mp4", "mov", "avi", "mkv", "webm"].includes(ext)) return <Film className="h-4 w-4 text-primary shrink-0" />;
  return <File className="h-4 w-4 text-muted-foreground shrink-0" />;
};

const titleFromFile = (name: string) => name.replace(/\.[^.]+$/, "").replace(/[-_]/g, " ");

const titleFromUrl = (url: string) => {
  try {
    const u = new URL(url);
    const host = u.hostname.replace("www.", "");
    if (host.includes("docs.google.com")) return "Google Документ";
    if (host.includes("sheets.google.com")) return "Google Таблица";
    if (host.includes("drive.google.com")) return "Google Диск";
    if (host.includes("notion.so") || host.includes("notion.site")) return "Notion";
    if (host.includes("figma.com")) return "Figma";
    if (host.includes("miro.com")) return "Miro";
    if (host.includes("youtube.com") || host.includes("youtu.be")) return "YouTube";
    if (host.includes("canva.com")) return "Canva";
    const path = u.pathname.split("/").filter(Boolean).pop();
    if (path && path.length > 2) return decodeURIComponent(path).replace(/[-_]/g, " ");
    return host;
  } catch {
    return url.slice(0, 40);
  }
};

const detectFileType = (name: string) => {
  const ext = name.split(".").pop()?.toLowerCase() || "";
  if (ext === "pdf") return "pdf";
  return "file";
};

export interface PendingMaterial {
  file: File | null;
  url: string;
  title: string;
  type: string;
}

export interface LessonMaterialsHandle {
  getPendingMaterials: () => PendingMaterial[];
  clearPending: () => void;
}

interface LessonMaterialsProps {
  lessonId: string | null;
}

const LessonMaterials = forwardRef<LessonMaterialsHandle, LessonMaterialsProps>(({ lessonId }, ref) => {
  const qc = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [browserOpen, setBrowserOpen] = useState(false);
  const [pendingMaterials, setPendingMaterials] = useState<PendingMaterial[]>([]);

  useImperativeHandle(ref, () => ({
    getPendingMaterials: () => pendingMaterials,
    clearPending: () => setPendingMaterials([]),
  }));

  const { data: materials, isLoading } = useQuery({
    queryKey: ["lesson-materials-inline", lessonId],
    queryFn: async () => {
      if (!lessonId) return [];
      const { data } = await supabase.from("lesson_materials").select("*").eq("lesson_id", lessonId).order("sort_order");
      return data || [];
    },
    enabled: !!lessonId,
  });

  // Upload multiple files at once
  const handleFilesSelected = async (files: FileList) => {
    const fileArray = Array.from(files);

    if (!lessonId) {
      // Queue as pending
      const newPending: PendingMaterial[] = fileArray.map(f => ({
        file: f, url: "", title: titleFromFile(f.name), type: detectFileType(f.name),
      }));
      setPendingMaterials(prev => [...prev, ...newPending]);
      toast.success(`${fileArray.length} файл(ов) добавлено`);
      return;
    }

    // Save directly
    setUploading(true);
    try {
      const baseOrder = (materials?.length || 0);
      for (let i = 0; i < fileArray.length; i++) {
        const f = fileArray[i];
        const path = `materials/${Date.now()}-${f.name}`;
        const fileUrl = await uploadFile("course-materials", f, path);
        await supabase.from("lesson_materials").insert({
          lesson_id: lessonId,
          title: titleFromFile(f.name),
          file_url: fileUrl,
          file_type: detectFileType(f.name),
          sort_order: baseOrder + i,
        });
      }
      toast.success(`${fileArray.length} файл(ов) загружено`);
      qc.invalidateQueries({ queryKey: ["lesson-materials-inline", lessonId] });
    } finally {
      setUploading(false);
    }
  };

  // Add link
  const handleAddLink = async () => {
    if (!linkUrl.trim()) return;
    const title = titleFromUrl(linkUrl);

    if (!lessonId) {
      setPendingMaterials(prev => [...prev, { file: null, url: linkUrl, title, type: "link" }]);
      toast.success("Ссылка добавлена");
      setLinkUrl("");
      setShowLinkInput(false);
      return;
    }

    setUploading(true);
    try {
      await supabase.from("lesson_materials").insert({
        lesson_id: lessonId,
        title,
        file_url: linkUrl,
        file_type: "link",
        sort_order: (materials?.length || 0),
      });
      toast.success("Ссылка добавлена");
      qc.invalidateQueries({ queryKey: ["lesson-materials-inline", lessonId] });
      setLinkUrl("");
      setShowLinkInput(false);
    } finally {
      setUploading(false);
    }
  };

  const handleBrowserSelect = async (path: string, name: string) => {
    const title = titleFromFile(name);
    const type = detectFileType(name);

    if (!lessonId) {
      setPendingMaterials(prev => [...prev, { file: null, url: path, title, type }]);
      toast.success("Файл выбран");
      return;
    }

    setUploading(true);
    try {
      await supabase.from("lesson_materials").insert({
        lesson_id: lessonId, title, file_url: path, file_type: type,
        sort_order: (materials?.length || 0),
      });
      toast.success("Файл прикреплён");
      qc.invalidateQueries({ queryKey: ["lesson-materials-inline", lessonId] });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Удалить материал?")) return;
    const { error } = await supabase.from("lesson_materials").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Удалено");
    qc.invalidateQueries({ queryKey: ["lesson-materials-inline", lessonId] });
  };

  const removePending = (index: number) => {
    setPendingMaterials(prev => prev.filter((_, i) => i !== index));
  };

  const allItems = [
    ...(materials || []).map(m => ({ id: m.id, title: m.title, subtitle: m.file_type || "", icon: m.file_url || "", saved: true })),
    ...pendingMaterials.map((pm, i) => ({ id: `pending-${i}`, title: pm.title, subtitle: "Ожидает сохранения", icon: pm.file?.name || pm.url, saved: false, pendingIndex: i })),
  ];

  return (
    <div className="space-y-3">
      {isLoading && lessonId ? (
        <Loader2 className="h-4 w-4 animate-spin text-primary mx-auto" />
      ) : (
        <>
          {/* Material list */}
          {allItems.length > 0 && (
            <div className="space-y-1.5">
              {allItems.map((item) => (
                <div key={item.id} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border group ${item.saved ? 'bg-muted/40 border-border/60' : 'bg-accent/10 border-accent/30'}`}>
                  {item.subtitle === "link" || (!item.saved && pendingMaterials[(item as any).pendingIndex]?.type === "link")
                    ? <Link2 className="h-4 w-4 text-primary shrink-0" />
                    : materialIcon(item.icon)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.title}</p>
                    {!item.saved && <p className="text-[11px] text-muted-foreground">Ожидает сохранения</p>}
                  </div>
                  <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => item.saved ? handleDelete(item.id) : removePending((item as any).pendingIndex)}>
                    {item.saved ? <Trash2 className="h-3.5 w-3.5 text-destructive" /> : <X className="h-3.5 w-3.5" />}
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Actions */}
          {uploading && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> Загрузка...
            </div>
          )}

          {showLinkInput && (
            <div className="flex gap-2">
              <Input
                placeholder="https://docs.google.com/..."
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                className="h-9 flex-1"
                onKeyDown={(e) => e.key === "Enter" && handleAddLink()}
              />
              <Button size="sm" onClick={handleAddLink} disabled={!linkUrl.trim()}>Добавить</Button>
              <Button size="sm" variant="ghost" onClick={() => { setShowLinkInput(false); setLinkUrl(""); }}>
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          )}

          <input ref={fileRef} type="file" className="hidden" multiple
            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.rar,.txt,.jpg,.jpeg,.png,.webp,.mp4,.mov"
            onChange={(e) => { if (e.target.files?.length) handleFilesSelected(e.target.files); e.target.value = ""; }} />

          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="flex-1 gap-1.5" onClick={() => fileRef.current?.click()} disabled={uploading}>
              <Upload className="h-3.5 w-3.5" />Загрузить файлы
            </Button>
            <Button variant="outline" size="sm" className="flex-1 gap-1.5" onClick={() => setBrowserOpen(true)} disabled={uploading}>
              <FolderOpen className="h-3.5 w-3.5" />С сервера
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setShowLinkInput(true)} disabled={uploading || showLinkInput}>
              <Link2 className="h-3.5 w-3.5" />Ссылка
            </Button>
          </div>
        </>
      )}

      <StorageFileBrowser
        open={browserOpen}
        onOpenChange={setBrowserOpen}
        bucket="course-materials"
        onSelect={handleBrowserSelect}
        title="Выбрать материал с сервера"
      />
    </div>
  );
});

LessonMaterials.displayName = "LessonMaterials";

export default LessonMaterials;
