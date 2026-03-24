import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

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
    mutationFn: async ({ courseId, courseTitle, coursePrice, userName, userEmail }: {
      courseId: string;
      courseTitle: string;
      coursePrice: string;
      userName?: string;
      userEmail?: string;
    }) => {
      // Get active payment details
      const { data: settings } = await (supabase as any)
        .from("payment_settings")
        .select("payment_details")
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      const paymentDetails = settings?.payment_details || "Реквизиты пока не настроены. Администратор скоро их добавит.";

      // Create payment request
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

      // Notify Telegram
      try {
        await supabase.functions.invoke("telegram-notify", {
          body: {
            action: "new_payment_request",
            payment_request_id: pr.id,
            course_title: courseTitle,
            course_price: coursePrice,
            user_name: userName,
            user_email: userEmail,
          },
        });
      } catch (e) {
        console.warn("Telegram notify failed:", e);
      }

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
    mutationFn: async ({ paymentRequestId, content, courseTitle, userName }: {
      paymentRequestId: string;
      content: string;
      courseTitle?: string;
      userName?: string;
    }) => {
      const { error } = await (supabase as any).from("payment_messages").insert({
        payment_request_id: paymentRequestId,
        sender_id: user!.id,
        sender_type: "client",
        message_type: "text",
        content,
      });
      if (error) throw error;

      // Notify Telegram
      try {
        await supabase.functions.invoke("telegram-notify", {
          body: {
            action: "client_message",
            payment_request_id: paymentRequestId,
            message: content,
            course_title: courseTitle,
            user_name: userName,
          },
        });
      } catch (e) {
        console.warn("Telegram notify failed:", e);
      }
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
    mutationFn: async ({ paymentRequestId, file, courseTitle, coursePrice, userName, userEmail }: {
      paymentRequestId: string;
      file: File;
      courseTitle?: string;
      coursePrice?: string;
      userName?: string;
      userEmail?: string;
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

      // Notify Telegram
      try {
        await supabase.functions.invoke("telegram-notify", {
          body: {
            action: "receipt_uploaded",
            payment_request_id: paymentRequestId,
            course_title: courseTitle,
            course_price: coursePrice,
            user_name: userName,
            user_email: userEmail,
          },
        });
      } catch (e) {
        console.warn("Telegram notify failed:", e);
      }
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["payment-request"] });
      qc.invalidateQueries({ queryKey: ["payment-messages", vars.paymentRequestId] });
    },
  });
};
