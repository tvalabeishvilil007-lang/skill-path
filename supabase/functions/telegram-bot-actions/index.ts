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

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    const body = await req.json();
    const { action, payment_request_id, callback_data } = body;

    // Handle Telegram callback (inline button presses)
    if (action === 'process_callback') {
      const parts = (callback_data || '').split(':');
      const cmd = parts[0];
      const prId = parts[1];

      if (!prId) {
        return new Response(JSON.stringify({ error: 'Invalid callback' }), { status: 400, headers: corsHeaders });
      }

      if (cmd === 'grant_access') {
        // Get payment request
        const { data: pr } = await supabase.from('payment_requests').select('*').eq('id', prId).single();
        if (!pr) {
          return new Response(JSON.stringify({ error: 'Payment request not found' }), { status: 404, headers: corsHeaders });
        }

        // Grant access
        await supabase.from('access_rights').insert({
          user_id: pr.user_id,
          course_id: pr.course_id,
          status: 'active',
        });

        await supabase.from('payment_requests').update({
          status: 'access_granted',
          access_source: 'telegram_bot',
        }).eq('id', prId);

        // Add system message
        await supabase.from('payment_messages').insert({
          payment_request_id: prId,
          sender_type: 'system',
          message_type: 'access_granted',
          content: 'Доступ к курсу открыт! Перейдите на страницу курса, чтобы начать обучение.',
        });

        // Notify admin
        await fetch(`${GATEWAY_URL}/sendMessage`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${LOVABLE_API_KEY}`,
            'X-Connection-Api-Key': TELEGRAM_API_KEY,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            chat_id: ADMIN_CHAT_ID,
            text: `✅ Доступ открыт для заявки <code>${prId}</code>`,
            parse_mode: 'HTML',
          }),
        });

        return new Response(JSON.stringify({ ok: true, action: 'access_granted' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      if (cmd === 'reject') {
        await supabase.from('payment_requests').update({ status: 'rejected' }).eq('id', prId);

        await supabase.from('payment_messages').insert({
          payment_request_id: prId,
          sender_type: 'system',
          message_type: 'text',
          content: 'Заявка на оплату отклонена.',
        });

        await fetch(`${GATEWAY_URL}/sendMessage`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${LOVABLE_API_KEY}`,
            'X-Connection-Api-Key': TELEGRAM_API_KEY,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            chat_id: ADMIN_CHAT_ID,
            text: `❌ Заявка <code>${prId}</code> отклонена`,
            parse_mode: 'HTML',
          }),
        });

        return new Response(JSON.stringify({ ok: true, action: 'rejected' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
    }

    // Handle setting payment details
    if (action === 'set_payment_details') {
      const { details } = body;
      if (!details) {
        return new Response(JSON.stringify({ error: 'details required' }), { status: 400, headers: corsHeaders });
      }

      // Deactivate old
      await supabase.from('payment_settings').update({ is_active: false }).eq('is_active', true);

      // Insert new
      await supabase.from('payment_settings').insert({
        payment_details: details,
        is_active: true,
      });

      await fetch(`${GATEWAY_URL}/sendMessage`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
          'X-Connection-Api-Key': TELEGRAM_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: ADMIN_CHAT_ID,
          text: `💳 <b>Реквизиты обновлены</b>\n\n${details}`,
          parse_mode: 'HTML',
        }),
      });

      return new Response(JSON.stringify({ ok: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    return new Response(JSON.stringify({ error: 'Unknown action' }), { status: 400, headers: corsHeaders });
  } catch (error: unknown) {
    console.error('Error:', error);
    const msg = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: msg }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
