import { useEffect, useRef, useState } from "react";
import { usePaymentMessages, useSendPaymentMessage } from "@/hooks/usePayment";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, CreditCard, MessageSquare, Bot, User, CheckCircle2, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface PaymentChatProps {
  paymentRequestId: string;
  courseTitle?: string;
  userName?: string;
}

const MESSAGE_ICONS: Record<string, any> = {
  payment_details: CreditCard,
  receipt_uploaded: FileText,
  access_granted: CheckCircle2,
  text: MessageSquare,
};

const PaymentChat = ({ paymentRequestId, courseTitle, userName }: PaymentChatProps) => {
  const { data: messages, refetch } = usePaymentMessages(paymentRequestId);
  const sendMessage = useSendPaymentMessage();
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel(`payment-messages-${paymentRequestId}`)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "payment_messages",
        filter: `payment_request_id=eq.${paymentRequestId}`,
      }, () => {
        refetch();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [paymentRequestId, refetch]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    sendMessage.mutate({
      paymentRequestId,
      content: input.trim(),
      courseTitle,
      userName,
    });
    setInput("");
  };

  const formatTime = (date: string) =>
    new Date(date).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-1 px-4 py-3">
        <div className="space-y-3">
          {!messages?.length && (
            <div className="text-center py-8">
              <div className="rounded-2xl bg-muted/30 p-4 inline-block mb-3">
                <MessageSquare className="h-6 w-6 text-muted-foreground/40" />
              </div>
              <p className="text-sm text-muted-foreground">Запросите реквизиты, чтобы начать</p>
            </div>
          )}
          {messages?.map((msg: any) => {
            const isClient = msg.sender_type === "client";
            const isSystem = msg.sender_type === "system";
            const isAdmin = msg.sender_type === "admin";
            const Icon = MESSAGE_ICONS[msg.message_type] || MessageSquare;

            if (isSystem) {
              return (
                <div key={msg.id} className="flex justify-center">
                  <div className={`rounded-2xl px-4 py-3 max-w-[90%] text-sm ${
                    msg.message_type === "payment_details"
                      ? "bg-primary/10 border border-primary/20 text-foreground"
                      : msg.message_type === "access_granted"
                      ? "bg-success/10 border border-success/20 text-success"
                      : "bg-muted/50 text-muted-foreground"
                  }`}>
                    <div className="flex items-center gap-2 mb-1.5">
                      <Icon className="h-4 w-4 shrink-0" />
                      <span className="font-medium text-xs uppercase tracking-wider">
                        {msg.message_type === "payment_details" ? "Реквизиты для оплаты" :
                         msg.message_type === "receipt_uploaded" ? "Чек" :
                         msg.message_type === "access_granted" ? "Доступ открыт" : "Система"}
                      </span>
                      <span className="text-[10px] text-muted-foreground ml-auto">{formatTime(msg.created_at)}</span>
                    </div>
                    <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                  </div>
                </div>
              );
            }

            return (
              <div key={msg.id} className={`flex ${isClient ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                  isClient
                    ? "bg-primary text-primary-foreground rounded-br-md"
                    : "bg-card border border-border rounded-bl-md"
                }`}>
                  <div className="flex items-center gap-1.5 mb-1">
                    {isAdmin ? <Bot className="h-3 w-3" /> : <User className="h-3 w-3" />}
                    <span className="text-[10px] font-medium opacity-70">
                      {isAdmin ? "Поддержка" : "Вы"}
                    </span>
                    <span className="text-[10px] opacity-50 ml-auto">{formatTime(msg.created_at)}</span>
                  </div>
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>
      </ScrollArea>

      <div className="border-t border-border p-3 flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
          placeholder="Написать сообщение..."
          className="rounded-xl h-10"
        />
        <Button
          onClick={handleSend}
          disabled={!input.trim() || sendMessage.isPending}
          size="icon"
          className="rounded-xl h-10 w-10 shrink-0"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default PaymentChat;
