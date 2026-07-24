/* KMBA Elite Program 2026 — smart FAQ engine (fuzzy + semantic matching, static) */
(function (global) {
  'use strict';

  const FALLBACK = {
    zh: '此問題目前需要由 KMBA 總部專人協助確認，請聯繫您的區域業務 🙏',
    en: 'This question requires confirmation from KMBA headquarters. Please contact your regional sales representative.',
  };

  const FOOTER = {
    zh: '如需進一步協助，請聯繫您的區域業務 📞',
    en: 'For further assistance, please contact your regional sales representative.',
  };

  const ANSWERS = {
    overview: {
      zh: [
        'KMBA菁英計畫 2026 是 KT&G 大韓菸草針對全台 HORECA 夜間通路推出的年度會員經營計畫 ✨',
        '📅 活動期間：2026 年 8 月～12 月',
        '🎯 從「單次實體活動」轉向「全年數位賦能」，打造 HORECA 高價值同盟生態圈',
      ],
      en: [
        "KMBA Elite Program 2026 is KT&G's annual member engagement program for Taiwan's HORECA night-trade channel.",
        'Program period: August – December 2026.',
        'Shifting from one-off events to year-round digital engagement for the HORECA alliance.',
      ],
    },
    daily: {
      zh: [
        '📋 常態任務（每月上限 300 分）',
        '',
        '⏱️ 日常任務以「提交／回覆時間」為加分項目，越早完成越有優勢',
        '📢 因此任務會不定時透過 LINE 官方帳號發布，請即時關注通知喔！',
        '',
        '• 品牌隨堂考問券（Google 問券）100 分 → 3 張抽獎券 📝',
        '• 客人推薦照片（SurveyCake）100 分 → 1 張抽獎券 📸',
        '• 新品陳列照片（SurveyCake）100 分 → 2 張抽獎券 🖼️',
        '',
        '🎫 積分兌換：100 分→1 張｜200 分→2 張｜300 分以上→3 張',
        '※ 問券每店只取最高分；同分以提交時間較早者優先',
      ],
      en: [
        'Regular missions (max 300 pts/month):',
        '',
        'Submission/response time is a bonus factor — complete early for an advantage.',
        'Missions are released irregularly via LINE — please follow the official account in real time.',
        '',
        '• Brand quiz (Google Form): 100 pts → 3 tickets',
        '• Customer recommendation photo (SurveyCake): 100 pts → 1 ticket',
        '• New product display photo (SurveyCake): 100 pts → 2 tickets',
        '',
        'Points to tickets: 100→1 | 200→2 | 300+→3',
        'Highest quiz score per store counts; ties broken by earlier submission.',
      ],
    },
    tickets: {
      zh: [
        '🎫 取得抽獎券的方式',
        '',
        '📋【常態任務】',
        '100 分→1 張｜200 分→2 張｜300 分以上→3 張（每月上限）',
        '雙月累積上限：6 張',
        '',
        '🤝【拜訪任務】',
        '每拜訪 1 間 KMBA 簽約店→1 張（每月上限 5 張）',
        '雙月累積上限：10 張',
        '',
        '📊 單店雙月最高可累積 16 張抽獎券',
      ],
      en: [
        'How to earn raffle tickets:',
        '',
        'Regular missions: 100→1 | 200→2 | 300+→3 (max 6 per bimonthly period)',
        'Visit missions: 1 per store (max 5/month, 10 bimonthly)',
        '',
        'Max 16 tickets per store per bimonthly period.',
      ],
    },
    voucher: {
      zh: [
        '🎁 商品卡／獎勵說明',
        '',
        '⚠️ 「商品卡」≠「抽獎券」',
        '• 🎫 抽獎券：參加雙月抽獎用的資格券',
        '• 💳 商品卡：統一超商商品卡，依每月排行發放',
        '',
        '📊【每月排行商品卡】依當月積分排名：',
        '• 🥇 TOP 1–20：500 元商品卡 ＋ 3 張抽獎券',
        '• 🥈 TOP 21–40：200 元商品卡 ＋ 2 張抽獎券',
        '• 🥉 TOP 41–100：100 元商品卡 ＋ 1 張抽獎券',
        '※ 當月至少完成 1 項任務才有領獎資格；每月月底結算 ✉️',
        '',
        '🎉【雙月抽獎】',
        '• 8–9 月累積→10 月抽（15 位 × 1,000 元）',
        '• 10–11 月累積→12 月抽（15 位 × 2,000 元）',
        '• 10／12 月 15 日公布得獎名單，抽完歸零 🎊',
      ],
      en: [
        'Gift card / reward info:',
        '',
        'Gift cards ≠ raffle tickets.',
        '',
        'Monthly ranking (Uni-President gift cards):',
        '• TOP 1–20: NT$500 + 3 tickets',
        '• TOP 21–40: NT$200 + 2 tickets',
        '• TOP 41–100: NT$100 + 1 ticket',
        'Must complete at least 1 mission that month to qualify.',
        '',
        'Bi-monthly draw: Oct 15×NT$1,000 | Dec 15×NT$2,000; tickets reset after each draw.',
      ],
    },
    visit: {
      zh: [
        '🤝 拜訪任務（社群交流）',
        '1. 拜訪其他 KMBA 簽約夜間通路店家 🏪',
        '2. 與店內大韓菸草陳列架合照 📸',
        '3. 透過 LINE 官方帳號上傳 📤',
        '4. 每月 20 日統一人工審核 ✅',
        '',
        '🎫 每拜訪 1 間店＝1 張抽獎券',
        '• 每月上限 5 張｜雙月上限 10 張',
      ],
      en: [
        'Visit mission (community engagement):',
        '1. Visit another KMBA partner store',
        '2. Photo with KT&G in-store display',
        '3. Upload via LINE Official Account',
        '4. Reviewed on the 20th of each month',
        '',
        '1 ticket per visit; max 5/month, 10 bimonthly.',
      ],
    },
    regional: {
      zh: [
        '📢 北中南區域競賽已取消，目前沒有區域排名競賽',
        '',
        '現僅保留「拜訪任務」作為社群交流機制 🤝',
        '1. 拜訪其他 KMBA 簽約夜間通路店家 🏪',
        '2. 與店內大韓菸草陳列架合照 📸',
        '3. 透過 LINE 官方帳號上傳 📤',
        '4. 每月 20 日統一人工審核 ✅',
        '',
        '🎫 每拜訪 1 間店＝1 張抽獎券（每月上限 5 張｜雙月上限 10 張）',
      ],
      en: [
        'The North/Central/South regional competition has been discontinued.',
        '',
        'Only visit missions remain for community engagement:',
        'Visit a partner store → photo with display → upload via LINE → reviewed on the 20th.',
        '1 ticket per visit; max 5/month, 10 bimonthly.',
      ],
    },
    reward: {
      zh: [
        '🎁 獎勵制度（V0723）',
        '📊 每月排行商品卡：TOP 1–20 五百元｜21–40 兩百元｜41–100 一百元',
        '🎫 排行加碼抽獎券：3 張／2 張／1 張',
        '🗓️ 雙月抽：8–9→10 月（1,000 元×15）｜10–11→12 月（2,000 元×15），抽完歸零',
        '✅ 當月至少完成 1 項任務才有領獎資格',
      ],
      en: [
        'Reward system (V0723):',
        'Monthly ranking gift cards: TOP 1–20 NT$500 | 21–40 NT$200 | 41–100 NT$100',
        'Bi-monthly draw: Oct 15×NT$1,000 | Dec 15×NT$2,000; reset after each draw.',
        'At least 1 mission required that month to qualify.',
      ],
    },
    line: {
      zh: [
        '💬 LINE 官方帳號提供：',
        '• 📢 常態任務公告（不定時發布，請即時關注）',
        '• ⏱️ 提交／回覆時間為加分項目，任務一發布請盡快完成',
        '• 📝 問券／SurveyCake 回傳入口',
        '• 🤝 拜訪任務照片上傳',
        '• 🤖 線上智慧客服（圖文選單右側）',
        '• 左側選單：本月新品資訊',
      ],
      en: [
        'LINE Official Account provides:',
        '• Irregular mission announcements — follow in real time',
        '• Submission time counts as a bonus — complete tasks promptly',
        '• Quiz/SurveyCake submission links',
        '• Visit mission photo uploads',
        '• AI FAQ chatbot (rich menu right side)',
        '• New product info (rich menu left side)',
      ],
    },
    persona: {
      zh: [
        '您好，我是 KMBA菁英計畫官方智慧客服 👋',
        '我可以協助您了解常態任務、拜訪任務、抽獎券、商品卡與雙月抽獎 😊',
        '請直接輸入問題，或點選下方快捷問題 👇',
      ],
      en: [
        "Hello! I'm the official AI assistant for the KMBA Elite Program.",
        'I can help with regular missions, visit missions, raffle tickets, gift cards, and bi-monthly draws.',
        'Type your question or tap a quick prompt below.',
      ],
    },
  };

  const GUARDRAIL = {
    price: {
      zh: '關於價格資訊，請洽詢您的區域業務，客服無法提供喔 🙏',
      en: 'For pricing information, please contact your regional sales representative.',
    },
    legal: {
      zh: '⚖️ 法規相關問題請洽 KMBA 總部或區域業務，客服無法提供法規判定。',
      en: 'For legal or regulatory questions, please contact KMBA headquarters or your regional sales representative.',
    },
  };

  const SUGGESTIONS = [
    '常態任務說明',
    '抽獎規則',
    '商品卡說明',
    '拜訪任務說明',
  ];

  const GREETINGS_ZH = ['你好', '您好', '在嗎', '嗨', '哈囉', '早安', '午安', '晚安'];
  const GREETINGS_EN = ['hi', 'hello', 'hey', 'good morning', 'good afternoon', 'good evening'];

  /** Intent library: keywords + paraphrased example questions for fuzzy matching */
  const INTENTS = [
    {
      id: 'overview',
      keywords: ['kmba', '菁英', '計畫', 'club', 'elite', 'horeca', 'ktg', '大韓', '菸草', '活動', '什麼', '介绍', '介紹', '概述'],
      examples: [
        'kmba菁英計畫是什麼', '這是什麼活動', '計畫內容', '活動期間', '什麼時候開始',
        'what is kmba', 'program overview', 'when does it start',
      ],
    },
    {
      id: 'daily',
      keywords: ['日常', '常態', '任務', '積分', '分數', '點數', '推薦', '陳列', '陈列', 'qa', '挑戰', '客人', '新品', '隨堂考', '問券', 'google', '100', '200', '300', '照片', 'mission', 'point', 'points', 'task', 'tasks', '說明', '介绍', '介紹', '提交', '回覆', '回复', '時間', '加分', '不定時', '不定时', '即時', '即时', '通知'],
      examples: [
        '常態任務說明', '日常任務說明', '本月有哪些任務', '任務清單', '怎麼賺積分',
        '積分怎麼算', '100分幾張', '300分上限', '品牌隨堂考', '客人推薦怎麼做',
        '陳列照要拍什麼', 'google問券', '每月任務', 'daily mission',
        '任務什麼時候發', '為什麼不定時', '提交時間加分', '要怎麼即時關注',
        'how many points', 'what are daily tasks', 'earn points',
      ],
    },
    {
      id: 'voucher',
      keywords: ['超商', '礼券', '禮券', '商品卡', 'gift', 'voucher', 'vouchers', 'convenience', '7-11', '711', '全家', 'ok', '面額', '發放', '发放', '多少錢', '多少钱', '獎金', '奖金', '五百', '兩百', '一百'],
      examples: [
        '商品卡說明', '超商禮券', '商品卡多少錢', '排行商品卡', '500元', '200元', '100元',
        '高額禮券', '參與獎', '每月獎勵', 'gift voucher', 'ranking gift card',
      ],
    },
    {
      id: 'tickets',
      keywords: ['抽獎', '抽奖', '抽獎券', '抽奖券', '抽獎卷', '抽奖卷', 'ticket', 'tickets', 'raffle', '換券', '换券', '拿券', '領券', '领券', '抽獎規則', '抽奖规则'],
      examples: [
        '抽獎規則', '怎麼取得抽獎券', '抽獎券怎麼拿', '如何獲得抽獎券', '多少分可以換券', '抽獎券從哪來',
        '可以拿幾張券', '怎麼換抽獎券', 'get raffle tickets', 'how to earn tickets', 'how many tickets',
      ],
    },
    {
      id: 'visit',
      keywords: ['拜訪', '拜访', '拜仿', '跨店', '簽約店', '签约店', '合照', 'line', '上傳', '上传', '交流', 'visit', 'store', 'partner', '社群', '說明', '介绍', '介紹', '20日', '20号'],
      examples: [
        '拜訪任務說明', '拜訪任務怎麼完成', '拜訪要怎麼做', '跨店任務', '去別店拍照', '合照要拍什麼',
        'survey cake怎麼傳', '每月上限幾張', '拜訪5間', 'visit mission', 'how to complete visit',
        'photo with display', 'partner store',
      ],
    },
    {
      id: 'regional',
      keywords: ['區域競賽', '区域竞赛', '區域賽', '北中南', '北部', '中部', '南部', '北區', '中區', '南區', '冠軍區', 'regional competition'],
      examples: [
        '區域競賽還有嗎', '北中南競賽', '北區比賽', '區域賽取消了吗',
        'regional challenge', 'north central south',
      ],
    },
    {
      id: 'reward',
      keywords: ['獎勵', '奖励', '排行', '排名', '榜', '雙月', '双月', '1000', '2000', '一千', '兩千', 'top', 'ranking', 'rank', 'prize', 'draw', '開獎', '开奖', '中獎', '中奖', '15', '獎品', '奖品', '分類', '分类', '級距', '级距', '歸零'],
      examples: [
        '雙月抽獎什麼時候', '10月抽獎', '12月抽獎', '1000元', '2000元', '排行獎勵',
        'top20多少', '41到100名', '抽完歸零嗎', 'when is the draw',
        'monthly ranking reward',
      ],
    },
    {
      id: 'line',
      keywords: ['line', '賴', '赖', '官方', '帳號', '账号', '加好友', '好友', '回傳', '回传', '公告'],
      examples: [
        'line官方帳號可以做什麼', 'line要加誰', '任務在哪裡回傳', 'survey入口',
        'line account features', 'where to submit', 'official account',
      ],
    },
    {
      id: 'persona',
      keywords: ['客服', '你是誰', '你是', '機器人', '机器人', 'assistant', 'bot', 'help'],
      examples: [
        '你是誰', '你是什麼客服', '你能幫我什麼', 'who are you', 'what can you do',
      ],
    },
  ];

  const VARIANT_TO_CANON = {
    卷: '券', 劵: '券', 奖券: '獎券', 抽奖: '抽獎',
    仿: '訪', 区: '區', 积: '積', 获: '獲', 问: '問', 传: '傳',
    台: '臺', 陈: '陳', 业: '業', 计: '計', 画: '畫', 竞: '競',
    赖: '賴', 账号: '帳號', 上传: '上傳', 拜访: '拜訪', 冠军: '冠軍',
    礼券: '禮券', 开奖: '開獎', 中奖: '中獎', 双月: '雙月',
  };

  function normalizeVariants(text) {
    let s = text;
    Object.keys(VARIANT_TO_CANON).sort((a, b) => b.length - a.length).forEach((from) => {
      s = s.split(from).join(VARIANT_TO_CANON[from]);
    });
    return s;
  }

  const STOPWORDS = /請問|請教|想问|想問|可以|能不能|可否|帮我|幫我|告诉我|告訴我|想知道|怎么|怎麼|如何|什么|什麼|甚么|哪些|哪一些|一下|吗|嗎|呢|啊|呀|喔|哦|吧|的|了|在|有|是|吗|嘛|么|嗎/g;

  function detectLanguage(text) {
    const cjk = (text.match(/[\u4e00-\u9fff]/g) || []).length;
    const latin = (text.match(/[a-zA-Z]/g) || []).length;
    if (latin >= 8 && cjk <= 2) return 'en';
    if (latin > cjk * 2 && latin >= 4) return 'en';
    const lower = text.trim().toLowerCase();
    if (GREETINGS_EN.includes(lower)) return 'en';
    return 'zh';
  }

  function normalize(text) {
    return normalizeVariants(
      (text || '')
        .toLowerCase()
        .replace(/[\u3000\s]+/g, '')
        .replace(/[？?！!。．，,、；;：:""''「」『』【】（）()[\]{}<>~`@#$%^&*+=|\\/_-]/g, '')
        .replace(STOPWORDS, '')
    );
  }

  function tokenize(text) {
    const n = normalize(text);
    const set = new Set();
    const en = n.match(/[a-z0-9]{2,}/g) || [];
    en.forEach((t) => set.add(t));
    const cjk = n.match(/[\u4e00-\u9fff]/g) || [];
    cjk.forEach((ch) => set.add(ch));
    for (let i = 0; i < cjk.length - 1; i++) set.add(cjk[i] + cjk[i + 1]);
    for (let i = 0; i < cjk.length - 2; i++) set.add(cjk[i] + cjk[i + 1] + cjk[i + 2]);
    return set;
  }

  function bigrams(text) {
    const n = normalize(text);
    const set = new Set();
    for (let i = 0; i < n.length - 1; i++) set.add(n.slice(i, i + 2));
    return set;
  }

  function jaccard(a, b) {
    if (!a.size && !b.size) return 0;
    let inter = 0;
    a.forEach((x) => { if (b.has(x)) inter++; });
    const union = new Set([...a, ...b]).size;
    return union ? inter / union : 0;
  }

  function levenshtein(a, b) {
    if (a === b) return 0;
    if (!a.length) return b.length;
    if (!b.length) return a.length;
    const row = new Array(b.length + 1);
    for (let j = 0; j <= b.length; j++) row[j] = j;
    for (let i = 1; i <= a.length; i++) {
      let prev = row[0];
      row[0] = i;
      for (let j = 1; j <= b.length; j++) {
        const tmp = row[j];
        const cost = a[i - 1] === b[j - 1] ? 0 : 1;
        row[j] = Math.min(row[j] + 1, row[j - 1] + 1, prev + cost);
        prev = tmp;
      }
    }
    return row[b.length];
  }

  function similarityRatio(a, b) {
    const maxLen = Math.max(a.length, b.length, 1);
    return 1 - levenshtein(a, b) / maxLen;
  }

  function fuzzyContains(haystack, needle, threshold) {
    const h = normalize(haystack);
    const n = normalize(needle);
    if (!n.length) return false;
    if (h.includes(n)) return true;
    if (n.length <= 2) {
      return h.includes(n) || similarityRatio(h, n) >= (threshold || 0.72);
    }
    if (h.length < n.length) {
      return similarityRatio(h, n) >= (threshold || 0.68);
    }
    const win = n.length;
    for (let size = Math.max(2, win - 1); size <= win + 1; size++) {
      for (let i = 0; i + size <= h.length; i++) {
        if (similarityRatio(h.slice(i, i + size), n) >= (threshold || 0.72)) return true;
      }
    }
    return false;
  }

  function keywordScore(queryNorm, keyword) {
    const kw = normalize(keyword);
    if (!kw.length) return 0;
    if (queryNorm.includes(kw)) return 1;
    if (kw.includes(queryNorm) && queryNorm.length >= 2) return 0.88;
    if (queryNorm.length >= 2 && kw.startsWith(queryNorm)) return 0.82;
    if (queryNorm.length >= 2 && queryNorm.startsWith(kw.slice(0, Math.min(2, kw.length)))) return 0.55;
    if (fuzzyContains(queryNorm, kw, 0.74)) return 0.78;
    return Math.max(0, similarityRatio(queryNorm, kw) - 0.15);
  }

  function exampleScore(queryNorm, example) {
    const ex = normalize(example);
    if (!ex.length) return 0;
    let score = 0;
    const ratio = similarityRatio(queryNorm, ex);
    score += ratio * 0.55;
    score += jaccard(tokenize(queryNorm), tokenize(ex)) * 0.35;
    score += jaccard(bigrams(queryNorm), bigrams(ex)) * 0.35;
    if (queryNorm.includes(ex) || ex.includes(queryNorm)) score += 0.25;
    if (fuzzyContains(queryNorm, ex, 0.65)) score += 0.2;
    return score;
  }

  function scoreIntent(query, intent) {
    const qn = normalize(query);
    if (!qn.length) return 0;
    let score = 0;
    let keywordHits = 0;

    intent.keywords.forEach((kw) => {
      const ks = keywordScore(qn, kw);
      if (ks >= 0.55) keywordHits++;
      score += ks * 0.42;
    });

    intent.examples.forEach((ex) => {
      score += exampleScore(qn, ex);
    });

    if (keywordHits >= 2) score += 0.18;
    if (keywordHits >= 3) score += 0.12;
    return score;
  }

  function isGiftVoucherQuery(query) {
    const q = query.toLowerCase();
    const n = normalize(query);
    const hasVoucher = /超商|礼券|禮券|商品卡|gift.?voucher|voucher|711|7-11|全家/.test(q + n);
    const hasRaffleTicket = /抽獎券|抽奖券|抽獎卷|抽奖卷|raffle.?ticket/.test(q + n);
    const hasRanking = /排行|排名|top|級距|级距|高額|中額|參與獎|参与奖/.test(q + n);
    if (hasVoucher && !hasRaffleTicket) return true;
    if (hasRanking && /禮券|礼券|超商|獎勵|奖励|獎品|奖品/.test(q + n)) return true;
    if (/獎品分類|奖品分类|商品卡說明|超商禮券說明/.test(q + n)) return true;
    return false;
  }

  function isRaffleTicketQuery(query) {
    const q = query.toLowerCase();
    const n = normalize(query);
    if (/抽獎券|抽奖券|抽獎卷|抽奖卷|raffle.?ticket/.test(q + n)) return true;
    if (/抽獎|抽奖|raffle/.test(q + n) && !/超商|礼券|禮券|gift.?voucher/.test(q + n)) return true;
    if (/多少分.*券|換券|换券|拿券|領券|领券/.test(q + n)) return true;
    return false;
  }

  function resolveIntentConflict(scores, query) {
    if (isGiftVoucherQuery(query)) return 'voucher';
    if (isRaffleTicketQuery(query)) {
      const ticketScore = scores.find((s) => s.id === 'tickets');
      const dailyScore = scores.find((s) => s.id === 'daily');
      if (ticketScore || dailyScore) return 'tickets';
    }

    scores.sort((a, b) => b.score - a.score);
    const best = scores[0];
    const second = scores[1];
    if (!best) return null;
    if (!second || best.score - second.score >= 0.12) return best.id;

    const pair = new Set([best.id, second.id]);
    if (pair.has('voucher') && pair.has('tickets')) return 'voucher';
    if (pair.has('voucher') && pair.has('reward')) return 'voucher';
    if (pair.has('reward') && pair.has('tickets')) {
      return isGiftVoucherQuery(query) ? 'voucher' : 'tickets';
    }
    if (pair.has('tickets') && pair.has('daily')) return 'tickets';
    if (pair.has('tickets') && pair.has('visit')) return 'tickets';
    return best.id;
  }

  function matchIntent(query) {
    if (isGiftVoucherQuery(query)) return 'voucher';

    const scored = INTENTS.map((intent) => ({
      id: intent.id,
      score: scoreIntent(query, intent),
    })).filter((x) => x.score > 0);

    if (!scored.length) return null;
    const top = scored.sort((a, b) => b.score - a.score)[0];
    if (top.score < 0.38) return null;
    return resolveIntentConflict(scored, query);
  }

  function formatReply(lines, lang) {
    return lines.join('\n').trim() + '\n' + FOOTER[lang];
  }

  function guardrailBlock(query, lang) {
    const q = query.toLowerCase();
    const rewardContext = /超商|礼券|禮券|獎勵|奖励|排行|獎品|奖品|禮券|voucher|gift|5000|雙月|抽獎/.test(q + normalize(query));
    if (['售價', '批发', '批發', '價格', 'price', 'wholesale', 'cost'].some((k) => q.includes(k))) {
      return formatReply([GUARDRAIL.price[lang]], lang);
    }
    if (!rewardContext && ['多少錢', '多少钱'].some((k) => q.includes(k))) {
      return formatReply([GUARDRAIL.price[lang]], lang);
    }
    if (['法令', '法規', '违法', '違法', 'legal', 'regulation', 'law'].some((k) => q.includes(k))) {
      return formatReply([GUARDRAIL.legal[lang]], lang);
    }
    return null;
  }

  function replyForTopic(topic, lang) {
    if (ANSWERS[topic]) return formatReply(ANSWERS[topic][lang], lang);
    return formatReply([FALLBACK[lang]], lang);
  }

  function isGreeting(query, lang) {
    const q = query.trim();
    const lower = q.toLowerCase();
    if (lang === 'en') return GREETINGS_EN.includes(lower);
    return GREETINGS_ZH.includes(q) || GREETINGS_ZH.some((g) => q.startsWith(g));
  }

  function isRegionalCompetitionQuery(query) {
    const q = normalize(query);
    return /區域競賽|区域竞赛|區域賽|北中南|北區|中區|南區|冠軍區|regional competition|north central south/i.test(q);
  }

  function answer(query) {
    query = (query || '').trim();
    const lang = detectLanguage(query);

    if (!query) {
      return { reply: formatReply(ANSWERS.persona.zh, 'zh'), lang: 'zh', intent: 'persona' };
    }

    const blocked = guardrailBlock(query, lang);
    if (blocked) return { reply: blocked, lang, intent: 'guardrail' };

    if (isGreeting(query, lang)) {
      return { reply: replyForTopic('persona', lang), lang, intent: 'persona' };
    }

    if (isRegionalCompetitionQuery(query)) {
      return { reply: replyForTopic('regional', lang), lang, intent: 'regional' };
    }

    const intent = matchIntent(query);
    if (intent) {
      return { reply: replyForTopic(intent, lang), lang, intent };
    }

    return { reply: formatReply([FALLBACK[lang]], lang), lang, intent: null };
  }

  function getSuggestions() {
    return SUGGESTIONS.slice();
  }

  global.KB = { answer, getSuggestions, matchIntent, _debug: { normalize, scoreIntent, INTENTS } };
})(window);
