import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { externalApi } from "@/lib/externalApi";

export const usePaymentRequest = (courseId: string | undefined) => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["payment-request", user?.id, courseId],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("payment_requests")
        .select("*")
        .eq("user_id", user!.id)
        .eq("course_id", courseId!)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id && !!courseId,
  });
};

export const usePaymentMessages = (paymentRequestId: string | undefined) => {
  return useQuery({
    queryKey: ["payment-messages", paymentRequestId],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("payment_messages")
        .select("*")
        .eq("payment_request_id", paymentRequestId!)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!paymentRequestId,
    refetchInterval: 5000,
  });
};

export const useActivePaymentDetails = () => {
  return useQuery({
    queryKey: ["active-payment-details"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("payment_settings")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });
};

export const useCreatePaymentRequest = () => {
  const qc = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ courseId, courseTitle, coursePrice, userName, userEmail, userTelegram }: {
      courseId: string;
      courseTitle: string;
      coursePrice: string;
      userName?: string;
      userEmail?: string;
      userTelegram?: string;
    }) => {
      // Get payment details from external API first, fallback to DB
      let paymentDetails: string;
      try {
        paymentDetails = await externalApi.getPaymentDetails();
      } catch {
        const { data: settings } = await (supabase as any)
          .from("payment_settings")
          .select("payment_details")
          .eq("is_active", true)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();
        paymentDetails = settings?.payment_details || "Реквизиты пока не настроены.";
      }

      // Create payment request in DB
      const { data: pr, error } = await (supabase as any)
        .from("payment_requests")
        .insert({
          user_id: user!.id,
          course_id: courseId,
          status: "payment_details_requested",
          payment_details_snapshot: paymentDetails,
        })
        .select()
        .single();
      if (error) throw error;

      // Add system message with payment details
      await (supabase as any).from("payment_messages").insert({
        payment_request_id: pr.id,
        sender_type: "system",
        message_type: "payment_details",
        content: paymentDetails,
      });

      // Notify via external VPS API
      await externalApi.notifyOrder({
        courseTitle,
        clientName: userName || "Без имени",
        clientTelegram: userTelegram,
        orderId: pr.id,
        amount: coursePrice,
        status: "new",
        message: `Новый запрос реквизитов от ${userName || userEmail || "пользователя"}`,
        purchaseUrl: window.location.href,
      });

      return pr;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["payment-request", user?.id, vars.courseId] });
      qc.invalidateQueries({ queryKey: ["payment-messages"] });
    },
  });
};

export const useSendPaymentMessage = () => {
  const qc = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ paymentRequestId, content, courseTitle, userName, userTelegram }: {
      paymentRequestId: string;
      content: string;
      courseTitle?: string;
      userName?: string;
      userTelegram?: string;
    }) => {
      const { error } = await (supabase as any).from("payment_messages").insert({
        payment_request_id: paymentRequestId,
        sender_id: user!.id,
        sender_type: "client",
        message_type: "text",
        content,
      });
      if (error) throw error;

      // Notify via external VPS API
      await externalApi.notifyMessage({
        orderId: paymentRequestId,
        courseTitle: courseTitle || "",
        clientName: userName || "",
        clientTelegram: userTelegram,
        text: content,
        purchaseUrl: window.location.href,
      });
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["payment-messages", vars.paymentRequestId] });
    },
  });
};

export const useUploadReceipt = () => {
  const qc = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ paymentRequestId, file, courseTitle, coursePrice, userName, userEmail, userTelegram }: {
      paymentRequestId: string;
      file: File;
      courseTitle?: string;
      coursePrice?: string;
      userName?: string;
      userEmail?: string;
      userTelegram?: string;
    }) => {
      const ext = file.name.split(".").pop();
      const path = `${user!.id}/${paymentRequestId}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("payment-receipts")
        .upload(path, file, { upsert: true });
      if (uploadError) throw uploadError;

      // Update payment request
      const { error: updateError } = await (supabase as any)
        .from("payment_requests")
        .update({
          receipt_url: path,
          receipt_file_type: file.type,
          status: "receipt_uploaded",
        })
        .eq("id", paymentRequestId);
      if (updateError) throw updateError;

      // Add system message
      await (supabase as any).from("payment_messages").insert({
        payment_request_id: paymentRequestId,
        sender_id: user!.id,
        sender_type: "system",
        message_type: "receipt_uploaded",
        content: "Чек загружен и отправлен на проверку",
      });

      // Notify via external VPS API
      await externalApi.uploadReceipt({
        file,
        courseTitle: courseTitle || "",
        clientName: userName || "Без имени",
        clientTelegram: userTelegram,
        orderId: paymentRequestId,
        purchaseUrl: window.location.href,
      });
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["payment-request"] });
      qc.invalidateQueries({ queryKey: ["payment-messages", vars.paymentRequestId] });
    },
  });
};
