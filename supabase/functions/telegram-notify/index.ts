import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const GATEWAY_URL = 'https://connector-gateway.lovable.dev/telegram';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
  if (!LOVABLE_API_KEY) return new Response(JSON.stringify({ error: 'LOVABLE_API_KEY not configured' }), { status: 500, headers: corsHeaders });

  const TELEGRAM_API_KEY = Deno.env.get('TELEGRAM_API_KEY');
  if (!TELEGRAM_API_KEY) return new Response(JSON.stringify({ error: 'TELEGRAM_API_KEY not configured' }), { status: 500, headers: corsHeaders });

  const ADMIN_CHAT_ID = Deno.env.get('TELEGRAM_ADMIN_CHAT_ID');
  if (!ADMIN_CHAT_ID) return new Response(JSON.stringify({ error: 'TELEGRAM_ADMIN_CHAT_ID not configured' }), { status: 500, headers: corsHeaders });

  // Auth
  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
    { global: { headers: { Authorization: authHeader } } }
  );

  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(authHeader.replace('Bearer ', ''));
  if (claimsError || !claimsData?.claims) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders });
  }

  const userId = claimsData.claims.sub as string;

  try {
    const body = await req.json();
    const { action, payment_request_id, message, course_title, course_price, user_name, user_email } = body;

    const sendTelegram = async (text: string, reply_markup?: any) => {
      const payload: any = {
        chat_id: ADMIN_CHAT_ID,
        text,
        parse_mode: 'HTML',
      };
      if (reply_markup) payload.reply_markup = JSON.stringify(reply_markup);

      const resp = await fetch(`${GATEWAY_URL}/sendMessage`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
          'X-Connection-Api-Key': TELEGRAM_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(`Telegram API failed [${resp.status}]: ${JSON.stringify(data)}`);
      return data;
    };

    if (action === 'new_payment_request') {
      const text = `🆕 <b>Новый запрос реквизитов</b>\n\n` +
        `👤 ${user_name || 'Без имени'} (${user_email})\n` +
        `📚 Курс: <b>${course_title}</b>\n` +
        `💰 Стоимость: ${course_price}\n` +
        `🔑 Заявка: <code>${payment_request_id}</code>\n` +
        `⏰ ${new Date().toLocaleString('ru-RU', { timeZone: 'Europe/Moscow' })}`;

      await sendTelegram(text);
    } else if (action === 'client_message') {
      const text = `💬 <b>Сообщение от клиента</b>\n\n` +
        `👤 ${user_name || 'Без имени'}\n` +
        `📚 Курс: <b>${course_title}</b>\n` +
        `🔑 Заявка: <code>${payment_request_id}</code>\n\n` +
        `${message}`;

      await sendTelegram(text);
    } else if (action === 'receipt_uploaded') {
      const text = `🧾 <b>Загружен чек</b>\n\n` +
        `👤 ${user_name || 'Без имени'} (${user_email})\n` +
        `📚 Курс: <b>${course_title}</b>\n` +
        `💰 Стоимость: ${course_price}\n` +
        `🔑 Заявка: <code>${payment_request_id}</code>\n\n` +
        `⏳ Ожидает проверки`;

      await sendTelegram(text);
    }

    return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (error: unknown) {
    console.error('Error:', error);
    const msg = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: msg }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
