const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4.1-mini";
const BOT_TOKEN = process.env.BOT_TOKEN;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SHOP_ID = process.env.SHOP_ID;
const SECRET_KEY = process.env.SECRET_KEY;
const BUY_CODE_URL = process.env.BUY_CODE_URL || "";
const SUPPORT_TEXT = process.env.SUPPORT_TEXT || "Если что-то сломалось — напиши Юле.";
const ADMIN_IDS = new Set(
  (process.env.ADMIN_IDS || "")
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean)
);

const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`;
const SUPABASE_REST = `${SUPABASE_URL}/rest/v1`;

async function createUser(telegramId) {
  return await sbFetch("/users", {
    method: "POST",
    body: [
      {
        telegram_id: telegramId
      }
    ]
  });
}

const SYSTEM_PROMPT_BEFORE_REF = `
SYSTEM PROMPT
Ты Толик — диалоговый рекрутёр.

Твоя задача — не читать скрипт, а нормально поговорить с человеком и довести его до интереса.

---

ГЛАВНОЕ

Ты в первую очередь живой человек.

Если правила мешают нормальному разговору —
говори по-человечески.

Твоя цель:
чтобы человек сказал «понял» или «покажи»

---

ЧТО ТЫ ЗНАЕШЬ (И НЕ ПРИДУМЫВАЕШЬ)

— компания Maneki Neko  

— есть игровая рекламная площадка (классифайд)  
— туда можно зайти бесплатно: играть, смотреть рекламу, получать небольшие вознаграждения  

— деньги за рекламу и действия в игре — это деньги рекламодателей  

— внутри есть партнёрская программа (MultiBooster)  
— в ней работает маркетинг: за выполнение условий в структуре выплачивается вознаграждение  

— если ты предприниматель:  
покупаешь показы → получаешь трафик → автоматически участвуешь в партнёрской модели  

— если ты НЕ предприниматель:  
можешь сразу зайти в партнёрскую программу  

---

ВАЖНО (НЕ ПУТАТЬ)

есть два режима:

1) просто посмотреть  
зайти бесплатно, поиграть, разобраться  

2) заработать  
это партнёрская программа (маркетинг)  

— это разные вещи  
— основные деньги — в партнёрке  

---

ПРО ЗАРАБОТОК

— старт от 6 долларов  
— это не «вложить и ждать»  
— это участие в механике  

— при работе в команде по стратегии  
можно получать кратный результат (до x6 от входа)  

— скорость зависит от структуры и движения людей  

---

ПРО ЛЮДЕЙ

— тебе самому не нужно искать и уговаривать  

— ты просто делишься ссылкой  
— дальше диалог веду я  

— как мы сейчас разговариваем  
так же я буду говорить с твоими людьми  

ПРО ССЫЛКУ (ОБЪЯСНЯЙ ПРОСТО):

смотри  

ты получаешь свою ссылку после входа  

когда человек по ней заходит — он попадает ко мне  

дальше я с ним разговариваю, объясняю и довожу  

вот как мы с тобой сейчас

ЗАПРЕТ:

ты НЕ ищешь людей  
ты НЕ говоришь «выкладывай в соцсети»  
ты НЕ объясняешь трафик  

твоя задача — разговор  

человек даёт свою ссылку знакомым / тем, с кем уже общается  
они заходят и попадают ко мне в диалог
---

ПРО ВЫПЛАТЫ

— это вознаграждение по маркетингу  
— за выполнение условий внутри структуры  

---

ПРО ДОВЕРИЕ

— это не инвестиции и не проценты  

— если бы были стабильные проценты  
это был бы скам  

— деньги не из воздуха:  
либо от рекламодателей  
либо из маркетинга  

---

ТЫ НЕ ИМЕЕШЬ ПРАВА

— придумывать цифры  
— обещать доход  
— давать гарантии  
— усложнять объяснения  

если не знаешь:

«это лучше уточнить у Юли, она разложит под тебя»

---

КАК ТЫ НАЧИНАЕШЬ

ты всегда сначала понимаешь, кто перед тобой  

даже если человек пишет «расскажи» — ты не начинаешь объяснение сразу  

сначала 1 короткий вопрос, чтобы понять ситуацию  

пример:

скажи честно  
ты сейчас ищешь заработок  
или уже пробовал и не пошло?

---

после ответа:

если человек ответил — ты подстраиваешься и только потом объясняешь

---

если человек пишет:

«расскажи» / «что это» / «дали бот»

👉 не задаёшь вопросов  
👉 сразу объясняешь  

пример:

ок, давай на пальцах  
ты видел, как банки платят за приглашения?

---

КАК ТЫ ОБЪЯСНЯЕШЬ

это как партнёрка  

привёл человека  
он сделал действие  
тебе заплатили  

---

смотри, тут важно не путать  

есть площадка  
там можно бесплатно посмотреть  

а есть партнёрская программа  
вот там заработок  

---

в игре — небольшие деньги  

основные деньги — в маркетинге  

---

если человек тупит:

давай проще  

зайди просто посмотри площадку  
там бесплатно разберёшься  

дальше сам решишь  

---
если человек отвечает коротко:
«да», «понятно», «ну ок»

👉 ты НЕ останавливаешься  

👉 ты продолжаешь и даёшь следующий шаг  

пример:

вот смотри дальше  

или  

самое интересное дальше  

или  

сейчас покажу суть
---

ДАЛЬШЕ ДАЁШЬ СМЫСЛ

не один платёж  
а несколько внутри  

поэтому не нужен большой поток людей  

---

ПРО ДЕНЬГИ

не начинаешь с цифр  

если спросили:

смотри коротко  

старт от 6$  
сначала возвращаешь своё  
дальше плюс  

пример:  
6 → 36  
100 → 600  

---

ПРО САМОЕ ВАЖНОЕ

тебе самому не нужно уговаривать  

я веду диалог  
объясняю  
довожу до входа  

ты просто делишься ссылкой  

---

ВОПРОС

хочешь покажу как это выглядит?

---

ЗАКРЫТИЕ

если человек сказал «да»:

ок  
тогда дам контакт Юли  
она заведёт и разберёт  

идёшь?

---

СТИЛЬ

коротко  
просто  
как в мессенджере  

если не понял — объясни по-другому  

---

ФОРМАТ

1 мысль  
1 действие  
1 вопрос  

максимум 3–4 строки
----
ЧАСТЫЕ ВОПРОСЫ (ОТВЕЧАЙ КОРОТКО И ПО ДЕЛУ)

---

ЕСЛИ СПРОСИЛИ: «это скам?»

если бы тут обещали проценты  
я бы сам не заходил  

здесь платят за действия  
не за ожидание  

---

ЕСЛИ: «откуда деньги?»

деньги либо от рекламодателей  
либо из маркетинга  

не из воздуха  

---

ЕСЛИ: «что нужно делать?»

ничего сложного  

делишься ссылкой  
дальше я веду диалог  

---

ЕСЛИ: «сколько людей надо?»

немного  

2–4 человека достаточно  
дальше повторяется  

---

ЕСЛИ: «сколько можно заработать?»

зависит от движения  

но логика простая:  
вошёл → вернул своё → дальше плюс  

---

ЕСЛИ: «это инвестиции?»

нет  

ты не вкладываешь и ждёшь  
ты участвуешь в механике  

---

ЕСЛИ: «у меня нет денег»

поэтому и заходят с минималки  

или сначала просто смотри площадку бесплатно  

---

ЕСЛИ: «я подумаю»

ок  

просто не затягивай  
тут важно самому посмотреть  

---

ЕСЛИ: «скинь инфу»

если скинуть — будет как везде  

лучше покажу на примере  
так быстрее поймёшь  

---

ЕСЛИ: «как ты будешь приглашать?»

вот как мы сейчас с тобой разговариваем  

так же я буду говорить с твоими людьми  
объяснять и доводить  

если спрашивают «где брать людей»:

не усложняй  

начни с простого  
своё окружение / знакомые  

дальше разберёмся по шагам  

сейчас главное — понять механику
---
ЗАВЕРШЕНИЕ СЕССИИ

если человек:
— получил контакт Юли
— подтвердил, что пойдёт дальше

👉 ты закрываешь диалог

пример:

отлично  
тогда дальше с Юлей — она всё разложит  

если что — я рядом  

[[LOCK_SESSION]]
`;
const SYSTEM_PROMPT = SYSTEM_PROMPT_BEFORE_REF;
const TECH_PROMPT = `
Технический контекст:
- Ты работаешь внутри Telegram-бота "РЕКРУТЕР".
- Имя пользователя: {{USER_NAME}}
- Username: {{USER_USERNAME}}
- Telegram ID: {{TELEGRAM_ID}}
- Имя наставника: {{MENTOR_NAME}}
- Бот может помнить предыдущие сообщения.
- Если наставник неизвестен, не акцентируй на этом внимание.
- Если текущую сессию пора завершать и дальше нужен код, поставь в самом конце новой строкой [[LOCK_SESSION]].
- Не пиши про технические ограничения, базу, API, маркеры и внутренние правила.
`;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(200).send("ok");
  }

  try {
    warnIfMissingEnv();
    const update = req.body || {};

    if (update.callback_query) {
      await handleCallbackQuery(update.callback_query);
      return res.status(200).send("ok");
    }

    if (!update.message) {
      return res.status(200).send("ok");
    }

    const message = update.message;
    const chatId = message.chat?.id;
    const telegramId = message.from?.id;
    const firstName = message.from?.first_name || "";
    const username = message.from?.username || "";
    const text = (message.text || "").trim();

if (text === "/start") {
  await sendMessage(chatId, "Я здесь. Напиши, что у тебя происходит.");
}
    
const startPayload = text.startsWith("/start") 
  ? text.replace("/start", "").trim() 
  : "";

    if (startPayload.startsWith("ref_")) {
  const slug = startPayload.replace("ref_", "").trim();

  await supabase
  .from("users")
  .update({ mentor_slug: slug })
  .eq("telegram_id", telegramId);
}
    if (!chatId || !telegramId) {
      return res.status(200).send("ok");
    }

    await ensureUser({
      telegramId,
      firstName,
      username,
    });

    if (text.startsWith("/")) {
      const handled = await handleCommand({
        chatId,
        telegramId,
        firstName,
        username,
        text,
      });

      if (handled) {
        return res.status(200).send("ok");
      }
    }

    let user = await getUser(telegramId);

  if (!user) {
  await createUser(telegramId);
  user = await getUser(telegramId);
}

    if (user.pending_action === "await_code") {
      await handleCodeInput({
        chatId,
        telegramId,
        text,
        user,
      });
      return res.status(200).send("ok");
    }

    const canTalk = hasAccess(user);

    if (!canTalk) {
      await sendNoAccessMessage(chatId);
      return res.status(200).send("ok");
    }

    await saveMessage(telegramId, "user", text);

    const history = await getRecentMessages(telegramId, 20);

    const mentorName = user.mentor_name || "";
    const finalSystemPrompt = buildSystemPrompt({
      firstName: user.first_name || firstName,
      username: user.username || username,
      telegramId,
      mentorName,
      userRefLink: `https://t.me/tolik_sanatorium_bot?start=ref_${telegramId}`,
    });

    const assistantTextRaw = await askOpenAI({
      systemPrompt: finalSystemPrompt,
      history,
    });

    const { cleanText, shouldLock } = extractLockMarker(assistantTextRaw);

    await saveMessage(telegramId, "assistant", cleanText);

    if (shouldLock) {
      await lockSessionForUser(user);
    }

    await sendMessage(chatId, cleanText);

    // Показываем меню после закрытия сессии всегда: локальный `user` может быть устаревшим,
    // т.к. lockSessionForUser меняет доступ в базе.
    if (shouldLock) {
      await sendInlineMenu(chatId);
    }

    return res.status(200).send("ok");
  } catch (error) {
    console.error("HANDLER_ERROR:", error);
    return res.status(200).send("ok");
  }
}

function buildSystemPrompt({ firstName, username, telegramId, mentorName, userRefLink }) {
  const safeName = firstName || "";
  const safeUsername = username ? `@${username}` : "";
  const safeMentor = mentorName || "не указан";

  return (
    SYSTEM_PROMPT_BEFORE_REF +
    userRefLink +
    "\n\n" +
    TECH_PROMPT.replaceAll("{{USER_NAME}}", safeName)
      .replaceAll("{{USER_USERNAME}}", safeUsername)
      .replaceAll("{{TELEGRAM_ID}}", String(telegramId))
      .replaceAll("{{MENTOR_NAME}}", safeMentor)
  );
}

function extractLockMarker(text) {
  const marker = "[[LOCK_SESSION]]";
  const shouldLock = text.includes(marker);
  const cleanText = text.replaceAll(marker, "").trim();
  return { cleanText, shouldLock };
}

function hasAccess(user) {
  if (!user.has_used_free) return true;
  if (user.access_active) return true;
  return false;
}

async function handleCommand({ chatId, telegramId, firstName, username, text }) {
  const [command, ...rest] = text.split(" ");
  const args = rest.join(" ").trim();

  if (command === "/start") {
    await handleStartCommand({ chatId, telegramId, firstName, username, text });
    return true;
  }

  if (command === "/help") {
    await sendMessage(chatId, SUPPORT_TEXT);
    return true;
  }

  if (command === "/code") {
    await setUserPendingAction(telegramId, "await_code");
    await sendMessage(chatId, "Вводи код. Без пробелов и лишней драмы 🙂");
    return true;
  }

  if (command === "/buy") {
    await sendBuyMessage(chatId);
    return true;
  }

  if (command === "/ref") {
    const link = `https://t.me/tolik_sanatorium_bot?start=ref_${telegramId}`;
    await sendMessage(chatId, link);
    return true;
  }

  if (!ADMIN_IDS.has(String(telegramId))) {
    return false;
  }

  if (command === "/admin") {
    await sendMessage(
      chatId,
      [
        "Админ-команды:",
        "/gencode 1",
        "/gencode 5",
        "/addcode SAN-123456",
        "/codes",
        "/stats",
        "/broadcast текст",
        "/mentor slug|Имя наставника",
        "/myref slug",
      ].join("\n")
    );
    return true;
  }

  if (command === "/gencode") {
    const count = Math.max(1, Math.min(50, Number(args || "1")));
    const codes = [];
    for (let i = 0; i < count; i += 1) {
      const code = generateCode();
      await createCode({
        code,
        createdBy: telegramId,
      });
      codes.push(code);
    }
    await sendMessage(chatId, `Готово.\n\n${codes.join("\n")}`);
    return true;
  }

  if (command === "/addcode") {
    if (!args) {
      await sendMessage(chatId, "Формат: /addcode SAN-123456");
      return true;
    }
    const code = args.toUpperCase().trim();
    await createCode({
      code,
      createdBy: telegramId,
    });
    await sendMessage(chatId, `Код добавлен: ${code}`);
    return true;
  }

  if (command === "/codes") {
    const codes = await getLastCodes(30);
    if (!codes.length) {
      await sendMessage(chatId, "Кодов пока нет.");
      return true;
    }

    const lines = codes.map((c) => {
      const used = c.is_used ? "used" : "free";
      const who = c.used_by ? ` → ${c.used_by}` : "";
      return `${c.code} [${used}]${who}`;
    });

    await sendMessage(chatId, lines.join("\n"));
    return true;
  }

  if (command === "/stats") {
    const stats = await getStats();
    await sendMessage(
      chatId,
      [
        `Пользователи: ${stats.users}`,
        `Сообщения: ${stats.messages}`,
        `Коды всего: ${stats.codes}`,
        `Коды использованы: ${stats.usedCodes}`,
      ].join("\n")
    );
    return true;
  }

  if (command === "/broadcast") {
    if (!args) {
      await sendMessage(chatId, "Формат: /broadcast текст");
      return true;
    }

    const users = await getAllUsers(1000);
    let sent = 0;

    for (const user of users) {
      try {
        await sendMessage(user.telegram_id, args);
        sent += 1;
      } catch (e) {
        console.error("BROADCAST_ERROR:", user.telegram_id, e);
      }
    }

    await sendMessage(chatId, `Рассылка ушла: ${sent}`);
    return true;
  }

  if (command === "/mentor") {
    const [slugRaw, nameRaw] = args.split("|");
    const slug = (slugRaw || "").trim().toLowerCase();
    const name = (nameRaw || "").trim();

    if (!slug || !name) {
      await sendMessage(chatId, "Формат: /mentor yulia|Юлия");
      return true;
    }

    await upsertMentor({
      slug,
      name,
      telegramId,
    });

    await sendMessage(chatId, `Наставник сохранён: ${name} (${slug})`);
    return true;
  }

  if (command === "/myref") {
    const slug = args.trim().toLowerCase();
    if (!slug) {
      await sendMessage(chatId, "Формат: /myref yulia");
      return true;
    }

    const botInfo = await getMe();
    const link = `https://t.me/${botInfo.username}?start=ref_${slug}`;
    await sendMessage(chatId, link);
    return true;
  }

  return false;
}

async function handleStartCommand({ chatId, telegramId, firstName, username, text }) {
  const startPayload = extractStartPayload(text);

  await ensureUser({
    telegramId,
    firstName,
    username,
  });

  if (startPayload && startPayload.startsWith("ref_")) {
    const slug = startPayload.replace(/^ref_/, "").trim().toLowerCase();
    const mentor = await getMentorBySlug(slug);

    await updateUserFields(telegramId, {
      ref_code: slug,
      mentor_name: mentor?.name || null,
    });
  }

  const user = await getUser(telegramId);
  const mentorName = user?.mentor_name || "";

  const finalSystemPrompt = buildSystemPrompt({
    firstName: user?.first_name || firstName,
    username: user?.username || username,
    telegramId,
    mentorName,
    userRefLink: `https://t.me/tolik_sanatorium_bot?start=ref_${telegramId}`,
  });

  const syntheticStartMessage =
    "Пользователь нажал /start. Начни разговор первым сообщением, в стиле промпта. Если имя уместно — используй.";

  await saveMessage(telegramId, "user", syntheticStartMessage);

  const history = await getRecentMessages(telegramId, 20);

  const assistantTextRaw = await askOpenAI({
    systemPrompt: finalSystemPrompt,
    history,
  });

  const { cleanText, shouldLock } = extractLockMarker(assistantTextRaw);

  await saveMessage(telegramId, "assistant", cleanText);

  if (shouldLock) {
    await lockSessionForUser(user || { telegram_id: telegramId, has_used_free: false, access_active: false });
  }

  await sendMessage(chatId, cleanText);

  if (shouldLock && !(user?.access_active)) {
    await sendInlineMenu(chatId);
  }
}

async function handleCodeInput({ chatId, telegramId, text, user }) {
  const code = (text || "").trim().toUpperCase();

  if (!code) {
    await sendMessage(chatId, "Пустой код не сработает. Вводи нормально 🙂");
    return;
  }

  const codeRow = await getCode(code);

  if (!codeRow) {
    await sendMessage(chatId, "Такого кода не вижу. Проверь ещё раз.");
    return;
  }

  if (codeRow.is_used) {
    await sendMessage(chatId, "Этот код уже использован.");
    return;
  }

  await markCodeUsed({
    code,
    usedBy: telegramId,
  });

  await updateUserFields(telegramId, {
    access_active: true,
    pending_action: null,
  });

  await sendMessage(chatId, "Код принят. Доступ открыт. Продолжай.");
}

async function handleCallbackQuery(callbackQuery) {
  const callbackId = callbackQuery.id;
  const data = callbackQuery.data || "";
  const chatId = callbackQuery.message?.chat?.id;
  const telegramId = callbackQuery.from?.id;

  if (!chatId || !telegramId) {
    return;
  }

  if (data === "enter_code") {
    await setUserPendingAction(telegramId, "await_code");
    await answerCallbackQuery(callbackId, "Жду код");
    await sendMessage(chatId, "Вводи код одним сообщением.");
    return;
  }

  if (data === "buy_code") {
    await answerCallbackQuery(callbackId, "Открываю получение кода");
    await sendBuyMessage(chatId);
    return;
  }

  if (data === "buy_1") {
    await answerCallbackQuery(callbackId, "Ок");
    const paymentUrl = await createPayment("390.00", "1 сессия", chatId);
    await sendMessage(chatId, "Оплата 1 сессии — 390₽", {
      inline_keyboard: [[{ text: "💳 Оплатить", url: paymentUrl }]],
    });
    return;
  }

  if (data === "buy_3") {
    await answerCallbackQuery(callbackId, "Ок");
    await sendMessage(chatId, "3 сессии — 790₽\n\nНапиши сюда: @yuliyakuzminova\nЯ выдам код и открою доступ");
    return;
  }

  if (data === "buy_5") {
    await answerCallbackQuery(callbackId, "Ок");
    await sendMessage(chatId, "5 сессий — 1190₽\n\nНапиши сюда: @yuliyakuzminova\nЯ выдам код и открою доступ");
    return;
  }

  if (data === "buy_10") {
    await answerCallbackQuery(callbackId, "Ок");
    await sendMessage(chatId, "10 сессий — 1990₽\n\nНапиши сюда: @yuliyakuzminova\nЯ выдам код и открою доступ");
    return;
  }

  if (data === "help_text") {
    await answerCallbackQuery(callbackId, "Помощь");
    await sendMessage(chatId, SUPPORT_TEXT);
    return;
  }

  await answerCallbackQuery(callbackId, "Ок");
}

async function sendNoAccessMessage(chatId) {
  await sendMessage(chatId, "Эта сессия уже закрыта. Введи код — и продолжим.");
  await sendInlineMenu(chatId);
}

async function sendInlineMenu(chatId) {
  await sendMessage(chatId, "Что делаем дальше?", {
    inline_keyboard: [
      [{ text: "Ввести код", callback_data: "enter_code" }],
      [{ text: "Получить код", callback_data: "buy_code" }],
      [{ text: "Помощь", url: "https://t.me/yuliyakuzminova" }],
    ],
  });
}

async function sendBuyMessage(chatId) {
  await sendMessage(chatId, "Выбери пакет:", {
    inline_keyboard: [
      [{ text: "1 сессия — 390₽", callback_data: "buy_1" }],
      [{ text: "3 сессии — 790₽", callback_data: "buy_3" }],
      [{ text: "5 сессий — 1190₽", callback_data: "buy_5" }],
      [{ text: "10 сессий — 1990₽", callback_data: "buy_10" }],
    ],
  });

  await sendBuyLink(chatId);
}

async function sendBuyLink(chatId) {
  if (!BUY_CODE_URL) {
    await sendMessage(
      chatId,
      "Ссылка на получение кода пока не настроена. Напиши в поддержку: /help"
    );
    return;
  }
  await sendMessage(chatId, `Забрать код можно здесь:\n${BUY_CODE_URL}`);
}

async function createPayment(amount, description, chatId) {
  const creds = `${SHOP_ID}:${SECRET_KEY}`;
  const auth = Buffer.from(creds, "utf8").toString("base64");
  const idempotenceKey = Date.now().toString();

  const me = await getMe();
  const returnUrl = `https://t.me/${me.username}`;

  const response = await fetch("https://api.yookassa.ru/v3/payments", {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/json",
      "Idempotence-Key": idempotenceKey,
    },
    body: JSON.stringify({
      amount: { value: amount, currency: "RUB" },
      confirmation: {
        type: "redirect",
        return_url: returnUrl,
      },
      capture: true,
      description,
      metadata: {
        chatId: String(chatId),
      },
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`YOOKASSA_ERROR: ${err}`);
  }

  const json = await response.json();
  return json.confirmation?.confirmation_url;
}

async function askOpenAI({ systemPrompt, history }) {
  const messages = [
    { role: "system", content: systemPrompt },
    ...history.map((m) => ({
      role: m.role,
      content: m.content,
    })),
  ];

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      temperature: 0.9,
      messages,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`OPENAI_ERROR: ${err}`);
  }

  const json = await response.json();
  const text = json.choices?.[0]?.message?.content || "Сейчас не ответила. Попробуй ещё раз.";
  return text;
}

async function sendMessage(chatId, text, inlineKeyboard = null) {
  const body = {
    chat_id: chatId,
    text,
  };

  if (inlineKeyboard) {
    body.reply_markup = inlineKeyboard;
  }

  const response = await fetch(`${TELEGRAM_API}/sendMessage`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`TELEGRAM_SEND_ERROR: ${err}`);
  }
}

async function answerCallbackQuery(callbackQueryId, text) {
  await fetch(`${TELEGRAM_API}/answerCallbackQuery`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      callback_query_id: callbackQueryId,
      text,
      show_alert: false,
    }),
  });
}

async function getMe() {
  const response = await fetch(`${TELEGRAM_API}/getMe`);
  const json = await response.json();
  return json.result;
}

function extractStartPayload(text) {
  const parts = text.split(" ");
  if (parts.length < 2) return "";
  return parts.slice(1).join(" ").trim();
}

function generateCode() {
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `SAN-${rand}`;
}

async function ensureUser({ telegramId, firstName, username }) {
  const now = new Date().toISOString();

  await sbFetch(
    `/users?on_conflict=telegram_id`,
    {
      method: "POST",
      body: [
        {
          telegram_id: telegramId,
          first_name: firstName || null,
          username: username || null,
          updated_at: now,
        },
      ],
      headers: {
        Prefer: "resolution=merge-duplicates,return=representation",
      },
    }
  );
}

async function getUser(telegramId) {
  const rows = await sbFetch(
    `/users?telegram_id=eq.${encodeURIComponent(String(telegramId))}&select=*`
  );
  return rows[0] || null;
}

async function updateUserFields(telegramId, fields) {
  const payload = {
    ...fields,
    updated_at: new Date().toISOString(),
  };

  await sbFetch(
    `/users?telegram_id=eq.${encodeURIComponent(String(telegramId))}`,
    {
      method: "PATCH",
      body: payload,
    }
  );
}

async function setUserPendingAction(telegramId, action) {
  await updateUserFields(telegramId, {
    pending_action: action,
  });
}

async function lockSessionForUser(user) {
  if (!user) return;

  if (!user.has_used_free) {
    await updateUserFields(user.telegram_id, {
      has_used_free: true,
      access_active: false,
    });
    return;
  }

  if (user.access_active) {
    await updateUserFields(user.telegram_id, {
      access_active: false,
    });
  }
}

async function saveMessage(telegramId, role, content) {
  await sbFetch(`/messages`, {
    method: "POST",
    body: [
      {
        telegram_id: telegramId,
        role,
        content,
      },
    ],
  });
}

async function getRecentMessages(telegramId, limit = 20) {
  const rows = await sbFetch(
    `/messages?telegram_id=eq.${encodeURIComponent(
      String(telegramId)
    )}&select=role,content,created_at&order=created_at.desc&limit=${limit}`
  );

  return rows.reverse();
}

async function createCode({ code, createdBy }) {
  await sbFetch(`/codes?on_conflict=code`, {
    method: "POST",
    body: [
      {
        code,
        created_by: createdBy || null,
        is_used: false,
      },
    ],
    headers: {
      Prefer: "resolution=merge-duplicates,return=representation",
    },
  });
}

async function getCode(code) {
  const rows = await sbFetch(
    `/codes?code=eq.${encodeURIComponent(code)}&select=*`
  );
  return rows[0] || null;
}

async function markCodeUsed({ code, usedBy }) {
  await sbFetch(`/codes?code=eq.${encodeURIComponent(code)}`, {
    method: "PATCH",
    body: {
      is_used: true,
      used_by: usedBy,
      used_at: new Date().toISOString(),
    },
  });
}

async function getLastCodes(limit = 30) {
  return await sbFetch(
    `/codes?select=code,is_used,used_by,created_at&order=created_at.desc&limit=${limit}`
  );
}

async function upsertMentor({ slug, name, telegramId }) {
  await sbFetch(`/mentors?on_conflict=slug`, {
    method: "POST",
    body: [
      {
        slug,
        name,
        telegram_id: telegramId || null,
      },
    ],
    headers: {
      Prefer: "resolution=merge-duplicates,return=representation",
    },
  });
}

async function getMentorBySlug(slug) {
  const rows = await sbFetch(
    `/mentors?slug=eq.${encodeURIComponent(slug)}&select=*`
  );
  return rows[0] || null;
}

async function getAllUsers(limit = 1000) {
  return await sbFetch(`/users?select=telegram_id&order=created_at.asc&limit=${limit}`);
}

async function getStats() {
  const [users, messages, codes, usedCodes] = await Promise.all([
    sbFetch(`/users?select=id`, { countOnly: true }),
    sbFetch(`/messages?select=id`, { countOnly: true }),
    sbFetch(`/codes?select=code`, { countOnly: true }),
    sbFetch(`/codes?select=code&is_used=eq.true`, { countOnly: true }),
  ]);

  return {
    users: users.count,
    messages: messages.count,
    codes: codes.count,
    usedCodes: usedCodes.count,
  };
}

async function sbFetch(path, options = {}) {
  const method = options.method || "GET";
  const body = options.body;
  const countOnly = options.countOnly || false;
  const customHeaders = options.headers || {};

  const headers = {
    apikey: SUPABASE_SERVICE_ROLE_KEY,
    Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
    "Content-Type": "application/json",
    ...customHeaders,
  };

  if (countOnly) {
    headers.Prefer = "count=exact,head=true";
  }

  const response = await fetch(`${SUPABASE_REST}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

 if (!response.ok) {
  const err = await response.text();
  console.log("SUPABASE ERROR IGNORED:", err);
  return [];
}

  if (countOnly) {
    const contentRange = response.headers.get("content-range") || "0/0";
    const count = Number(contentRange.split("/")[1] || 0);
    return { count };
  }

  const text = await response.text();
  return text ? JSON.parse(text) : [];
}

function warnIfMissingEnv() {
  const missing = [];
  if (!BOT_TOKEN) missing.push("BOT_TOKEN");
  if (!SUPABASE_URL) missing.push("SUPABASE_URL");
  if (!SUPABASE_SERVICE_ROLE_KEY) missing.push("SUPABASE_SERVICE_ROLE_KEY");
  if (!OPENAI_API_KEY) missing.push("OPENAI_API_KEY");

  if (missing.length) {
    console.warn(
      `CONFIG_WARNING: missing env vars: ${missing.join(", ")}`
    );
  }
}
