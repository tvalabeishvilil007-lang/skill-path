import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courseId: string;
  courseTitle: string;
}

const RequestDialog = ({ open, onOpenChange, courseId, courseTitle }: Props) => {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [telegram, setTelegram] = useState("");
  const [phone, setPhone] = useState("");
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!telegram.trim()) {
      toast.error("Укажите Telegram для связи");
      return;
    }
    setLoading(true);
    const { error } = await supabase.from("requests").insert({
      user_id: user.id,
      course_id: courseId,
      telegram: telegram.trim(),
      phone: phone.trim() || null,
      comment: comment.trim() || null,
    } as any);
    setLoading(false);
    if (error) {
      toast.error("Ошибка: " + error.message);
    } else {
      toast.success("Заявка отправлена! Менеджер свяжется с вами.");
      qc.invalidateQueries({ queryKey: ["user-requests"] });
      onOpenChange(false);
      setTelegram("");
      setPhone("");
      setComment("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Оформить заявку</DialogTitle>
          <DialogDescription>Курс: {courseTitle}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="req-telegram">Telegram *</Label>
            <Input id="req-telegram" placeholder="@username" value={telegram} onChange={e => setTelegram(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="req-phone">Телефон</Label>
            <Input id="req-phone" placeholder="+7..." value={phone} onChange={e => setPhone(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="req-comment">Комментарий</Label>
            <Textarea id="req-comment" placeholder="Дополнительная информация..." value={comment} onChange={e => setComment(e.target.value)} />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Отправка..." : "Отправить заявку"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default RequestDialog;
