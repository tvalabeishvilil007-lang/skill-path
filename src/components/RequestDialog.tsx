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
import { CheckCircle, Send, MessageCircle } from "lucide-react";

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
  const [success, setSuccess] = useState(false);

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
      setSuccess(true);
      qc.invalidateQueries({ queryKey: ["user-requests"] });
    }
  };

  const handleClose = (isOpen: boolean) => {
    if (!isOpen) {
      setSuccess(false);
      setTelegram("");
      setPhone("");
      setComment("");
    }
    onOpenChange(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        {success ? (
          <div className="flex flex-col items-center text-center py-6">
            <div className="rounded-2xl bg-success/10 p-4 mb-5">
              <CheckCircle className="h-10 w-10 text-success" />
            </div>
            <h3 className="text-xl font-bold mb-2">Заявка отправлена!</h3>
            <p className="text-muted-foreground mb-6 max-w-xs">Наш менеджер свяжется с вами в Telegram для подтверждения и оплаты.</p>
            <Button onClick={() => handleClose(false)} className="rounded-xl px-8">Понятно</Button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-xl">Оформить заявку</DialogTitle>
              <DialogDescription className="text-sm">
                <span className="font-medium text-foreground">{courseTitle}</span>
                <br />
                <span className="flex items-center gap-1.5 mt-2 text-muted-foreground">
                  <MessageCircle className="h-3.5 w-3.5" />
                  После заявки менеджер свяжется с вами в Telegram
                </span>
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-5 mt-2">
              <div className="space-y-2">
                <Label htmlFor="req-telegram" className="text-sm font-medium">Telegram <span className="text-destructive">*</span></Label>
                <Input id="req-telegram" placeholder="@username" value={telegram} onChange={e => setTelegram(e.target.value)} required className="h-11 rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="req-phone" className="text-sm font-medium">Телефон <span className="text-muted-foreground font-normal">(необязательно)</span></Label>
                <Input id="req-phone" placeholder="+7 (999) 000-00-00" value={phone} onChange={e => setPhone(e.target.value)} className="h-11 rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="req-comment" className="text-sm font-medium">Комментарий</Label>
                <Textarea id="req-comment" placeholder="Дополнительная информация..." value={comment} onChange={e => setComment(e.target.value)} className="rounded-xl min-h-[80px]" />
              </div>
              <Button type="submit" className="w-full h-11 rounded-xl gap-2" disabled={loading}>
                <Send className="h-4 w-4" />
                {loading ? "Отправка..." : "Отправить заявку"}
              </Button>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default RequestDialog;
