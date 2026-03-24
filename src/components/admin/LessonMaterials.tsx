import { useState, useRef, useImperativeHandle, forwardRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, Trash2, Upload, FileText, FileSpreadsheet, File, Film, Loader2, X, FolderOpen } from "lucide-react";
import { uploadFile } from "@/lib/storage";
import StorageFileBrowser from "./StorageFileBrowser";

const fileTypes = [
  { value: "pdf", label: "PDF" },
  { value: "file", label: "Файл" },
  { value: "link", label: "Ссылка" },
  { value: "checklist", label: "Чек-лист" },
  { value: "additional", label: "Доп. материал" },
];

const materialIcon = (name: string, fileType?: string) => {
  const ext = name.split(".").pop()?.toLowerCase() || fileType || "";
  if (["pdf"].includes(ext)) return <FileText className="h-4 w-4 text-destructive shrink-0" />;
  if (["xls", "xlsx", "csv"].includes(ext)) return <FileSpreadsheet className="h-4 w-4 text-success shrink-0" />;
  if (["doc", "docx"].includes(ext)) return <FileText className="h-4 w-4 text-primary shrink-0" />;
  if (["ppt", "pptx"].includes(ext)) return <FileText className="h-4 w-4 text-accent shrink-0" />;
  if (["mp4", "mov", "avi", "mkv", "webm"].includes(ext)) return <Film className="h-4 w-4 text-primary shrink-0" />;
  return <File className="h-4 w-4 text-muted-foreground shrink-0" />;
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
  const [addTitle, setAddTitle] = useState("");
  const [addType, setAddType] = useState("file");
  const [addFile, setAddFile] = useState<File | null>(null);
  const [addUrl, setAddUrl] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [browserOpen, setBrowserOpen] = useState(false);
  // Pending materials for new lessons (before save)
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

  const addPendingOrSave = async () => {
    if (!addTitle) { toast.error("Введите название"); return; }
    if (!addFile && !addUrl) { toast.error("Загрузите файл или укажите ссылку"); return; }

    if (!lessonId) {
      // Queue for later
      setPendingMaterials(prev => [...prev, { file: addFile, url: addUrl, title: addTitle, type: addType }]);
      toast.success("Материал добавлен (сохранится вместе с уроком)");
      resetAddForm();
      return;
    }

    // Save directly
    setUploading(true);
    try {
      let fileUrl = addUrl;
      let detectedType = addType;

      if (addFile) {
        const path = `materials/${Date.now()}-${addFile.name}`;
        fileUrl = await uploadFile("course-materials", addFile, path);
        const ext = addFile.name.split(".").pop()?.toLowerCase();
        if (ext === "pdf") detectedType = "pdf";
      }

      const { error } = await supabase.from("lesson_materials").insert({
        lesson_id: lessonId,
        title: addTitle,
        file_url: fileUrl,
        file_type: detectedType,
        sort_order: (materials?.length || 0) + 1,
      });
      if (error) { toast.error(error.message); return; }
      toast.success("Материал добавлен");
      qc.invalidateQueries({ queryKey: ["lesson-materials-inline", lessonId] });
      resetAddForm();
    } finally {
      setUploading(false);
    }
  };

  const resetAddForm = () => {
    setAddTitle("");
    setAddFile(null);
    setAddUrl("");
    setShowAdd(false);
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

  const handleBrowserSelect = (path: string, name: string) => {
    setAddUrl(path);
    if (!addTitle) setAddTitle(name.replace(/\.[^.]+$/, ""));
  };

  return (
    <div className="space-y-3">
      {isLoading && lessonId ? (
        <Loader2 className="h-4 w-4 animate-spin text-primary mx-auto" />
      ) : (
        <>
          {/* Saved materials */}
          {materials && materials.length > 0 && (
            <div className="space-y-1.5">
              {materials.map((m) => (
                <div key={m.id} className="flex items-center gap-3 px-3 py-2.5 bg-muted/40 rounded-lg border border-border/60 group">
                  {materialIcon(m.file_url || "", m.file_type || "")}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{m.title}</p>
                    <p className="text-[11px] text-muted-foreground truncate">{fileTypes.find(f => f.value === m.file_type)?.label || m.file_type}</p>
                  </div>
                  <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleDelete(m.id)}>
                    <Trash2 className="h-3.5 w-3.5 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Pending materials (not yet saved) */}
          {pendingMaterials.length > 0 && (
            <div className="space-y-1.5">
              {pendingMaterials.map((pm, i) => (
                <div key={i} className="flex items-center gap-3 px-3 py-2.5 bg-accent/10 rounded-lg border border-accent/30 group">
                  {materialIcon(pm.file?.name || pm.url, pm.type)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{pm.title}</p>
                    <p className="text-[11px] text-muted-foreground">Ожидает сохранения</p>
                  </div>
                  <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => removePending(i)}>
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {showAdd ? (
            <div className="space-y-3 p-4 bg-muted/30 rounded-xl border border-border">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Новый материал</Label>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={resetAddForm}>
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
              <Input placeholder="Название материала" value={addTitle} onChange={(e) => setAddTitle(e.target.value)} className="h-9" />
              <Select value={addType} onValueChange={setAddType}>
                <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                <SelectContent>{fileTypes.map((ft) => <SelectItem key={ft.value} value={ft.value}>{ft.label}</SelectItem>)}</SelectContent>
              </Select>

              <input ref={fileRef} type="file" className="hidden"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.rar,.txt,.jpg,.jpeg,.png,.webp"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) {
                    setAddFile(f);
                    if (!addTitle) setAddTitle(f.name.replace(/\.[^.]+$/, ""));
                  }
                }} />

              {addFile ? (
                <div className="flex items-center gap-2 p-2.5 bg-background rounded-lg border border-border">
                  {materialIcon(addFile.name)}
                  <p className="text-sm truncate flex-1">{addFile.name}</p>
                  <span className="text-xs text-muted-foreground">{(addFile.size / 1024 / 1024).toFixed(1)} МБ</span>
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setAddFile(null)}><X className="h-3 w-3" /></Button>
                </div>
              ) : addUrl ? (
                <div className="flex items-center gap-2 p-2.5 bg-background rounded-lg border border-border">
                  {materialIcon(addUrl)}
                  <p className="text-sm truncate flex-1">{addUrl}</p>
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setAddUrl("")}><X className="h-3 w-3" /></Button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <button onClick={() => fileRef.current?.click()}
                    className="flex-1 h-16 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center gap-1 text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors text-xs">
                    <Upload className="h-4 w-4" />
                    Загрузить файл
                  </button>
                  <button onClick={() => setBrowserOpen(true)}
                    className="flex-1 h-16 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center gap-1 text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors text-xs">
                    <FolderOpen className="h-4 w-4" />
                    Выбрать с сервера
                  </button>
                </div>
              )}

              {!addFile && !addUrl && (
                <Input placeholder="Или вставьте ссылку..." value={addUrl} onChange={(e) => setAddUrl(e.target.value)} className="h-9" />
              )}

              <Button size="sm" onClick={addPendingOrSave} disabled={uploading} className="w-full">
                {uploading ? <><Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />Загрузка...</> : "Добавить материал"}
              </Button>
            </div>
          ) : (
            <Button variant="outline" size="sm" onClick={() => setShowAdd(true)} className="w-full gap-1.5">
              <Plus className="h-3.5 w-3.5" />Добавить материал
            </Button>
          )}
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
