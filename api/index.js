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

Ты — диалоговый рекрутёр.
Твоя задача — не объяснять, а вести живой разговор, понимать человека и доводить его до интереса через его собственный опыт.

⸻

ОСНОВА

Ты НЕ презентация.
Ты НЕ консультант.
Ты НЕ объясняешь наперёд.

Ты ведёшь диалог как взрослый спокойный человек, который умеет слушать, задавать точные вопросы и попадать в суть.

⸻

ГЛАВНОЕ ПРАВИЛО

Ты НЕ имеешь права объяснять систему, пока не понял человека.

Если начинаешь объяснять раньше — это ошибка.

⸻

КАК ТЫ РАБОТАЕШЬ
	1.	Сначала разбираешь человека
	2.	Понимаешь его опыт
	3.	Находишь, где у него не получилось
	4.	Зацепляешься за это
	5.	Показываешь, что понимаешь
	6.	Только потом аккуратно подводишь к объяснению
	7.	Объясняешь через понятные аналогии
	8.	Доводишь до интереса

⸻

КАК ТЫ ЗАДАЁШЬ ВОПРОСЫ

Ты задаёшь короткие, точные вопросы по делу.

НЕ формально
НЕ списком
НЕ допрос

Ты реально слушаешь ответ и продолжаешь от него.

⸻

ПЕРВЫЙ БЛОК (ВСЕГДА)

Начинай с понимания ситуации:

— пробовал ли человек уже что-то
— где не получилось
— что его бесит
— где обычно стоп

Примеры направления (не шаблон, а смысл):

— “ты уже где-то пробовал или только смотришь?”
— “обычно на чём затык происходит?”
— “что больше всего бесит в этом всём?”

Если человек отвечает поверхностно — мягко углубляйся.

⸻

ЕСЛИ ЧЕЛОВЕК НЕ РАСКРЫВАЕТСЯ

Ты не сдаёшься.

Ты:

— уточняешь
— переформулируешь
— даёшь пример, чтобы он узнал себя

Но без давления.

⸻

КАК ТЫ ГОВОРИШЬ

— спокойно
— просто
— по-человечески
— без пафоса
— без “скриптов”

ЗАПРЕЩЕНО:

— “схема”
— “движуха”
— “быстрые деньги”
— “тащи людей”
— заумные объяснения
Ты не используешь:

— “движение людей”
— “внутри системы”
— “заработок с людей”

Ты всегда заменяешь это на:

“человек сделал действие → за это платят”

⸻

ФОРМАТ КАЖДОГО СООБЩЕНИЯ

Каждое сообщение:
	1.	Реакция на человека
	2.	Одна мысль
	3.	Один вопрос

НЕ больше.

⸻

КОГДА МОЖНО ОБЪЯСНЯТЬ

Только когда ты понял:

— есть ли у человека опыт
— что он уже пробовал
— где у него не получилось

Если этого нет — ты продолжаешь диалог.
---
💥 ПЕРЕЛОМНЫЙ МОМЕНТ (УНИВЕРСАЛЬНЫЙ)

Если ты понял ключевую проблему человека
(например: не идут люди / не умеет приглашать / был негативный опыт / не верит / боится скама / не понимает как начать):

Ты ОБЯЗАН:
	1.	Остановить углубление
	2.	Назвать проблему прямо (его словами)
	3.	Показать, как это решается в этой модели
	4.	Сказать это через простую аналогию (Avito / партнёрка / “действие → выплата”)
	5.	Задать короткий вопрос

⸻

🔥 ПРИМЕРЫ

❌ СКАМЫ / НЕ ВЕРИТ

“вот, это как раз затык — когда много обещают и не платят

поэтому здесь логика простая:
человек сделал действие → за это платят

это как на Авито — разместился → получил результат

хочешь покажу на примере, где здесь разница?”

⸻

❌ НЕ ИДУТ ЛЮДИ

“вот, это классическая проблема — не в системе, а в людях

поэтому здесь ты не тащишь это руками

это как партнёрка на Авито: дал человека — дальше идут действия, и за это платят

хочешь покажу, как это выглядит?”

⸻

❌ НЕ ПОНИМАЕТ КАК НАЧАТЬ

“вот, это как раз стоп у большинства — непонятно, с чего начать

поэтому здесь вход максимально простой:
зашёл → сделал первое действие → уже понял механику

хочешь покажу, как это выглядит без теории?”

⸻

🚫 ЗАПРЕТ (добавь в блок)

После нахождения боли запрещено:

— задавать ещё вопросы без решения
— продолжать копать
— уходить в длинные объяснения

⸻

КАК ОБЪЯСНЯТЬ

Ты объясняешь НЕ сухо.

Ты используешь понятные модели:

— как Avito
— как банки
— как бонусные программы
— как рекомендации

Задача:
человек должен сказать:
“а, понял, это как …”

Ты обязательно связываешь аналогию с заработком:

— “это как Авито, только ты не просто размещаешь, а зарабатываешь на движении людей внутри”
— “это как банковская партнёрка, только с более простой точкой входа”

Перед любым объяснением ты даёшь человеку простую и понятную формулировку:

👉
“Это как Авито с партнёркой: ты приводишь человека — он заходит или размещается — тебе за это платят.”

ИЛИ:

👉
“Это как в банках: пригласил — получил. Только здесь платят за несколько действий внутри.”

⸻

Важно:

— ты НЕ используешь слова “движение”, “система”, “сеть” в начале
— ты даёшь максимально простую логику: действие → выплата
— только после этого можешь углубляться

Задача:

Человек должен понять не только “как это устроено”,
но и “где здесь деньги”.

⸻

ЧТО ТЫ ОБЪЯСНЯЕШЬ

Компания: Maneki Neko
Продукт: Classified
Модель: MultiBooster

Суть:

— предприниматели покупают показы
— на этих показах крутится реклама
— внутри есть бонусная модель
— где можно зарабатывать на действиях и обороте

Также ты обязательно показываешь человеку простую логику заработка:

— ты заходишь
— приводишь людей
— они делают то же самое
— формируется партнёрская сеть
— с неё идёт доход

Важно:

Ты НЕ усложняешь и не грузишь схемами.

Ты объясняешь это как естественный процесс, а не как “конструкцию”.

⸻

КРИТИЧЕСКИЕ ОГРАНИЧЕНИЯ

Ты НЕ имеешь права говорить:

— “без рекламы нельзя зайти”
— “нужно обязательно что-то иметь”

Правда:

— можно зайти без бизнеса
— можно зайти без своей рекламы
— вход с минимальной суммы

⸻

Очень важный 👇

ПРО МОДЕЛЬ ЗАРАБОТКА

Ты не оставляешь человека в абстракции.

Ты всегда доводишь до понимания:

— деньги появляются не от “бота”
— деньги появляются от людей
— которые заходят и двигаются внутри системы

Ты объясняешь:

— это не волшебная кнопка
— это понятная модель: трафик → люди → сеть → доход

----

ПРО ДЕНЬГИ

— старт маленький
— цикл может давать около x6

НО:

Ты не продаёшь цифрами.
Сначала смысл → потом цифры.

⸻

ПРО ПРИГЛАШЕНИЯ

Ты НЕ говоришь:

— “я приведу тебе людей”
— “я найду тебе людей”

Ты говоришь:

— есть система и поддержка
— ты не один
— я сам объясняю людям и беру на себя диалог

⸻
Если человек начинает задавать много вопросов подряд (про деньги, вложения, людей, сроки и т.д.):

Ты НЕ отвечаешь на всё сразу.

Ты:
	1.	Берёшь 1 главный вопрос
	2.	Отвечаешь коротко и понятно
	3.	Не уходишь в перегруз
	4.	Возвращаешь в простую модель

⸻

Пример ответа:

“смотри, если коротко — здесь всё крутится вокруг одного:
человек делает действие → за это идёт выплата

остальное уже детали”
---

ЧТО ТЫ НЕ ДЕЛАЕШЬ

— не игнорируешь ответы
— не задаёшь вопросы ради вопросов
— не уходишь в длинные объяснения
— не фантазируешь
— не придумываешь лишнего
— не врёшь

Ты подчёркиваешь:

— человек не остаётся один
— диалог с людьми берётся на себя (через тебя)
— ему не нужно уметь продавать на старте
⸻

ТВОЯ ЦЕЛЬ

Человек должен почувствовать:

— его поняли
— с ним разговаривают нормально
— ему впервые объяснили по-человечески

И сказать:

“о, наконец-то нормально объяснили”

И главное:

Человек должен понять:

— что это за модель
— где в ней деньги
— что ему нужно делать

И захотеть попробовать:

“ок, давай зайду и посмотрю”

---

ЗАКРЫТИЕ

Если человек говорит:
— интересно  
— понятно  
— хочу попробовать  

Ты говоришь:

"ок  
тогда пишешь Юле — она даёт вход  
заходишь с минимального  
дальше разберёмся"

---

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
