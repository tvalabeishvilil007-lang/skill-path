const API_BASE = "http://82.38.135.152:4010";

export const externalApi = {
  async getPaymentDetails(): Promise<string> {
    const res = await fetch(`${API_BASE}/payment-details`);
    if (!res.ok) throw new Error("Failed to fetch payment details");
    const data = await res.json();
    const raw = data.paymentDetails || data.details || data.payment_details;
    if (!raw) return JSON.stringify(data);
    return String(raw).replace(/\\n/g, "\n");
  },

  async notifyOrder(body: {
    courseTitle: string;
    clientName: string;
    clientTelegram?: string;
    orderId: string;
    amount: string;
    status: string;
    message?: string;
  }) {
    try {
      await fetch(`${API_BASE}/notify-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    } catch (e) {
      console.warn("External notify-order failed:", e);
    }
  },

  async uploadReceipt(body: {
    file: File;
    courseTitle: string;
    clientName: string;
    clientTelegram?: string;
    orderId: string;
  }) {
    try {
      const formData = new FormData();
      formData.append("file", body.file);
      formData.append("courseTitle", body.courseTitle);
      formData.append("clientName", body.clientName);
      if (body.clientTelegram) formData.append("clientTelegram", body.clientTelegram);
      formData.append("orderId", body.orderId);

      await fetch(`${API_BASE}/upload-receipt`, {
        method: "POST",
        body: formData,
      });
    } catch (e) {
      console.warn("External upload-receipt failed:", e);
    }
  },

  async notifyMessage(body: {
    orderId: string;
    courseTitle: string;
    clientName: string;
    clientTelegram?: string;
    text: string;
  }) {
    try {
      await fetch(`${API_BASE}/notify-message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    } catch (e) {
      console.warn("External notify-message failed:", e);
    }
  },
};
