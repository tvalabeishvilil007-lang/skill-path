import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Folder, FileText, Film, FileSpreadsheet, File, ChevronLeft, Search, Check } from "lucide-react";
import { cn } from "@/lib/utils";

type Bucket = "course-videos" | "course-materials" | "course-covers";

interface StorageFileBrowserProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bucket: Bucket;
  onSelect: (path: string, name: string) => void;
  accept?: string[];
  title?: string;
}

const fileIcon = (name: string) => {
  const ext = name.split(".").pop()?.toLowerCase() || "";
  if (["mp4", "mov", "avi", "mkv", "webm"].includes(ext)) return <Film className="h-5 w-5 text-primary" />;
  if (["pdf"].includes(ext)) return <FileText className="h-5 w-5 text-red-500" />;
  if (["xls", "xlsx", "csv"].includes(ext)) return <FileSpreadsheet className="h-5 w-5 text-green-600" />;
  if (["doc", "docx"].includes(ext)) return <FileText className="h-5 w-5 text-blue-500" />;
  if (["ppt", "pptx"].includes(ext)) return <FileText className="h-5 w-5 text-orange-500" />;
  if (["zip", "rar", "7z"].includes(ext)) return <File className="h-5 w-5 text-yellow-600" />;
  return <File className="h-5 w-5 text-muted-foreground" />;
};

const formatSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} Б`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} КБ`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} МБ`;
  return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} ГБ`;
};

const StorageFileBrowser = ({ open, onOpenChange, bucket, onSelect, title = "Выбрать файл" }: StorageFileBrowserProps) => {
  const [currentPath, setCurrentPath] = useState("");
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setCurrentPath("");
      setSearch("");
      setSelected(null);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    loadDirectory(currentPath);
  }, [open, currentPath, bucket]);

  const loadDirectory = async (path: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.storage.from(bucket).list(path || "", {
        limit: 200,
        sortBy: { column: "name", order: "asc" },
      });
      if (error) throw error;
      setItems(data || []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const navigateFolder = (folderName: string) => {
    setCurrentPath(currentPath ? `${currentPath}/${folderName}` : folderName);
    setSelected(null);
  };

  const goBack = () => {
    const parts = currentPath.split("/");
    parts.pop();
    setCurrentPath(parts.join("/"));
    setSelected(null);
  };

  const handleSelect = () => {
    if (!selected) return;
    const fullPath = currentPath ? `${currentPath}/${selected}` : selected;
    onSelect(fullPath, selected);
    onOpenChange(false);
  };

  const folders = items.filter((i) => i.id === null && i.name !== ".emptyFolderPlaceholder");
  const files = items
    .filter((i) => i.id !== null)
    .filter((f) => !search || f.name.toLowerCase().includes(search.toLowerCase()));

  const breadcrumbs = currentPath ? currentPath.split("/") : [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[75vh] flex flex-col p-0 gap-0">
        <DialogHeader className="px-5 pt-5 pb-3 border-b border-border">
          <DialogTitle className="text-base">{title}</DialogTitle>
          <div className="flex items-center gap-2 mt-2">
            {currentPath && (
              <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={goBack}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
            )}
            <div className="flex items-center gap-1 text-xs text-muted-foreground overflow-hidden">
              <button onClick={() => setCurrentPath("")} className="hover:text-foreground shrink-0">{bucket}</button>
              {breadcrumbs.map((b, i) => (
                <span key={i} className="flex items-center gap-1 shrink-0">
                  <span>/</span>
                  <button onClick={() => setCurrentPath(breadcrumbs.slice(0, i + 1).join("/"))} className="hover:text-foreground truncate max-w-[120px]">{b}</button>
                </span>
              ))}
            </div>
          </div>
        </DialogHeader>

        {files.length > 3 && (
          <div className="px-5 pt-3">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input placeholder="Поиск файлов..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-8 h-8 text-sm" />
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-3 py-2 min-h-[200px]">
          {loading ? (
            <div className="flex items-center justify-center py-12"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>
          ) : (
            <div className="space-y-0.5">
              {folders.map((f) => (
                <button key={f.name} onClick={() => navigateFolder(f.name)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted/60 transition-colors text-left">
                  <Folder className="h-5 w-5 text-primary/70 shrink-0" />
                  <span className="text-sm font-medium truncate">{f.name}</span>
                </button>
              ))}
              {files.map((f) => (
                <button key={f.name} onClick={() => setSelected(f.name)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-left",
                    selected === f.name ? "bg-primary/10 ring-1 ring-primary/30" : "hover:bg-muted/60"
                  )}>
                  {fileIcon(f.name)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate">{f.name}</p>
                    {f.metadata?.size && <p className="text-[11px] text-muted-foreground">{formatSize(f.metadata.size)}</p>}
                  </div>
                  {selected === f.name && <Check className="h-4 w-4 text-primary shrink-0" />}
                </button>
              ))}
              {folders.length === 0 && files.length === 0 && (
                <p className="text-center text-sm text-muted-foreground py-8">Папка пуста</p>
              )}
            </div>
          )}
        </div>

        <div className="px-5 py-3 border-t border-border flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>Отмена</Button>
          <Button size="sm" disabled={!selected} onClick={handleSelect}>
            <Check className="h-3.5 w-3.5 mr-1.5" />Выбрать
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StorageFileBrowser;
