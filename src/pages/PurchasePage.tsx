import { useParams, Link, Navigate } from "react-router-dom";
import { useCourseBySlug } from "@/hooks/useCourses";
import { useAuth } from "@/contexts/AuthContext";
import { usePaymentRequest, useCreatePaymentRequest, useUploadReceipt } from "@/hooks/usePayment";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PaymentChat from "@/components/PaymentChat";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Loader2, ArrowLeft, CreditCard, Upload, CheckCircle2, Clock,
  MessageSquare, FileText, BookOpen, ShieldCheck, AlertCircle,
} from "lucide-react";
import { useRef, useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient, useQuery } from "@tanstack/react-query";

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any; progress: number }> = {
  created: { label: "Создана", color: "bg-muted text-muted-foreground", icon: Clock, progress: 10 },
  payment_details_requested: { label: "Реквизиты отправлены", color: "bg-primary/10 text-primary border-primary/20", icon: CreditCard, progress: 25 },
  waiting_for_payment: { label: "Ожидает оплату", color: "bg-warning/10 text-warning border-warning/20", icon: Clock, progress: 40 },
  receipt_uploaded: { label: "Чек загружен", color: "bg-info/10 text-info border-info/20", icon: FileText, progress: 60 },
  under_review: { label: "На проверке", color: "bg-warning/10 text-warning border-warning/20", icon: AlertCircle, progress: 75 },
  access_granted: { label: "Доступ открыт", color: "bg-success/10 text-success border-success/20", icon: CheckCircle2, progress: 100 },
  rejected: { label: "Отклонена", color: "bg-destructive/10 text-destructive border-destructive/20", icon: AlertCircle, progress: 0 },
  cancelled: { label: "Отменена", color: "bg-muted text-muted-foreground", icon: AlertCircle, progress: 0 },
};

const PurchasePage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { user, loading: authLoading } = useAuth();
  const { data: course, isLoading: courseLoading } = useCourseBySlug(slug || "");
  const { data: userProfile } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("name, email").eq("id", user!.id).maybeSingle();
      return data;
    },
    enabled: !!user?.id,
  });
  const { data: paymentRequest, refetch: refetchPR } = usePaymentRequest(course?.id);
  const createPR = useCreatePaymentRequest();
  const uploadReceipt = useUploadReceipt();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const qc = useQueryClient();

  // Realtime for payment_requests status changes
  useEffect(() => {
    if (!paymentRequest?.id) return;
    const channel = supabase
      .channel(`pr-status-${paymentRequest.id}`)
      .on("postgres_changes", {
        event: "UPDATE",
        schema: "public",
        table: "payment_requests",
        filter: `id=eq.${paymentRequest.id}`,
      }, () => {
        refetchPR();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [paymentRequest?.id, refetchPR]);

  if (authLoading || courseLoading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }
  if (!user) return <Navigate to="/login" replace />;
  if (!course) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <h1 className="text-2xl font-bold">Курс не найден</h1>
            <Button asChild variant="outline" className="rounded-xl">
              <Link to="/dashboard"><ArrowLeft className="mr-2 h-4 w-4" />Вернуться</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const status = paymentRequest?.status;
  const statusConfig = STATUS_CONFIG[status || ""] || STATUS_CONFIG.created;
  const StatusIcon = statusConfig.icon;
  const priceFormatted = `${Number(course.price).toLocaleString("ru-RU")} ${course.currency || "₽"}`;

  const handleRequestDetails = async () => {
    try {
      await createPR.mutateAsync({
        courseId: course.id,
        courseTitle: course.title,
        coursePrice: priceFormatted,
        userName: userProfile?.name || user.email,
        userEmail: user.email!,
      });
      toast.success("Реквизиты отправлены в чат!");
    } catch (e: any) {
      toast.error("Ошибка: " + e.message);
    }
  };

  const handleUploadReceipt = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !paymentRequest) return;

    const allowed = ["image/jpeg", "image/png", "image/jpg", "application/pdf"];
    if (!allowed.includes(file.type)) {
      toast.error("Поддерживаются только JPG, PNG и PDF");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Максимальный размер файла — 10 МБ");
      return;
    }

    setUploading(true);
    try {
      await uploadReceipt.mutateAsync({
        paymentRequestId: paymentRequest.id,
        file,
        courseTitle: course.title,
        coursePrice: priceFormatted,
        userName: userProfile?.name || user.email,
        userEmail: user.email!,
      });
      toast.success("Чек загружен!");
    } catch (e: any) {
      toast.error("Ошибка загрузки: " + e.message);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const isAccessGranted = status === "access_granted";

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container py-6 px-4 max-w-6xl">
        <Link to={`/course/${course.slug}`} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
          <ArrowLeft className="h-4 w-4" /> Назад к курсу
        </Link>

        <div className="grid lg:grid-cols-5 gap-6">
          {/* Left: Course info + Actions */}
          <div className="lg:col-span-2 space-y-4">
            {/* Course card */}
            <Card className="rounded-2xl overflow-hidden">
              {course.cover_url && (
                <img src={course.cover_url} alt={course.title} className="w-full h-40 object-cover" />
              )}
              <CardContent className="p-5 space-y-3">
                <h1 className="text-xl font-bold leading-tight">{course.title}</h1>
                {course.short_description && (
                  <p className="text-sm text-muted-foreground leading-relaxed">{course.short_description}</p>
                )}
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-extrabold">{priceFormatted}</span>
                </div>
              </CardContent>
            </Card>

            {/* Status & Progress */}
            {paymentRequest && (
              <Card className="rounded-2xl">
                <CardContent className="p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">Статус заявки</span>
                    <Badge className={`${statusConfig.color} border text-xs gap-1.5`}>
                      <StatusIcon className="h-3 w-3" />
                      {statusConfig.label}
                    </Badge>
                  </div>
                  <Progress value={statusConfig.progress} className="h-2" />
                  <div className="flex justify-between text-[10px] text-muted-foreground">
                    <span>Запрос</span>
                    <span>Оплата</span>
                    <span>Проверка</span>
                    <span>Доступ</span>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Actions */}
            <Card className="rounded-2xl">
              <CardContent className="p-5 space-y-3">
                {!paymentRequest ? (
                  <Button
                    onClick={handleRequestDetails}
                    disabled={createPR.isPending}
                    className="w-full rounded-xl h-12 text-base gap-2"
                    size="lg"
                  >
                    {createPR.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4" />}
                    Запросить реквизиты
                  </Button>
                ) : isAccessGranted ? (
                  <Button asChild className="w-full rounded-xl h-12 text-base gap-2 bg-success hover:bg-success/90" size="lg">
                    <Link to={`/course/${course.slug}`}>
                      <BookOpen className="h-4 w-4" /> Перейти к курсу
                    </Link>
                  </Button>
                ) : (
                  <>
                    {status !== "receipt_uploaded" && status !== "under_review" && (
                      <>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept=".jpg,.jpeg,.png,.pdf"
                          className="hidden"
                          onChange={handleUploadReceipt}
                        />
                        <Button
                          onClick={() => fileInputRef.current?.click()}
                          disabled={uploading}
                          variant="outline"
                          className="w-full rounded-xl h-11 gap-2"
                        >
                          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                          Загрузить чек
                        </Button>
                      </>
                    )}
                    {(status === "receipt_uploaded" || status === "under_review") && (
                      <div className="flex items-center gap-3 p-3 rounded-xl bg-info/5 border border-info/20">
                        <ShieldCheck className="h-5 w-5 text-info shrink-0" />
                        <div>
                          <p className="text-sm font-medium">Чек на проверке</p>
                          <p className="text-xs text-muted-foreground">Администратор проверит оплату и откроет доступ</p>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right: Chat */}
          <div className="lg:col-span-3">
            <Card className="rounded-2xl h-[600px] flex flex-col overflow-hidden">
              <CardHeader className="pb-3 pt-4 px-5 border-b border-border/60 shrink-0">
                <CardTitle className="text-base flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-primary" />
                  Чат с поддержкой
                </CardTitle>
              </CardHeader>
              <div className="flex-1 min-h-0">
                {paymentRequest ? (
                  <PaymentChat
                    paymentRequestId={paymentRequest.id}
                    courseTitle={course.title}
                    userName={userProfile?.name || user.email}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center space-y-3">
                      <div className="rounded-2xl bg-muted/30 p-4 inline-block">
                        <MessageSquare className="h-6 w-6 text-muted-foreground/40" />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Запросите реквизиты, чтобы начать общение
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PurchasePage;
