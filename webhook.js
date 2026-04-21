const BOT_TOKEN = process.env.BOT_TOKEN;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`;
const SUPABASE_REST = `${SUPABASE_URL}/rest/v1`;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(200).send("ok");
  }

  try {
    const event = req.body || {};

    if (event.event !== "payment.succeeded") {
      return res.status(200).send("ok");
    }

    const payment = event.object || {};
    const chatId = String(payment.metadata?.chatId || "").trim();

    if (!chatId) {
      return res.status(200).send("ok");
    }

    const user = await getUserByTelegramId(chatId);

    if (!user) {
      await sendTelegramMessage(
        chatId,
        "Оплата прошла ✅\nНо я не смог сразу открыть доступ. Напиши Юле: @yuliyakuzminova"
      );
      return res.status(200).send("ok");
    }

    await updateUserAccess(chatId, {
      access_active: true,
      pending_action: null,
      updated_at: new Date().toISOString(),
    });

    await sendTelegramMessage(
      chatId,
  text: "Вижу, оплата прошла ✅\nТеперь можно выдохнуть.\nЧто накопилось?"
    );

    return res.status(200).send("ok");
  } catch (error) {
    console.error("YOOKASSA_WEBHOOK_ERROR:", error);
    return res.status(200).send("ok");
  }
}

async function getUserByTelegramId(telegramId) {
  const rows = await sbFetch(
    `/users?telegram_id=eq.${encodeURIComponent(String(telegramId))}&select=*`
  );
  return rows[0] || null;
}

async function updateUserAccess(telegramId, fields) {
  await sbFetch(
    `/users?telegram_id=eq.${encodeURIComponent(String(telegramId))}`,
    {
      method: "PATCH",
      body: fields,
    }
  );
}

async function sendTelegramMessage(chatId, text) {
  const response = await fetch(`${TELEGRAM_API}/sendMessage`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      chat_id: chatId,
      text,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`TELEGRAM_SEND_ERROR: ${err}`);
  }
}

async function sbFetch(path, options = {}) {
  const method = options.method || "GET";
  const body = options.body;

  const response = await fetch(`${SUPABASE_REST}${path}`, {
    method,
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`SUPABASE_ERROR ${method} ${path}: ${err}`);
  }

  const text = await response.text();
  return text ? JSON.parse(text) : [];
}
