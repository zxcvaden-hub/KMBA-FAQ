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
        '📅 活動期間：2026 年 8 月～2027 年 1 月',
        '🎯 核心目標：提升寶亨新品曝光、建立新品教育、強化業務互動、建立主理人交流圈',
      ],
      en: [
        "KMBA Elite Program 2026 is KT&G's annual member engagement program for Taiwan's HORECA night-trade channel.",
        'Program period: August 2026 – January 2027.',
        'Goals include product exposure, education, sales engagement, and building the owner community.',
      ],
    },
    daily: {
      zh: [
        '📋 日常任務（每月上限 1000 分）',
        '• 客人推薦紀錄（250 分）📝',
        '• 新品陳列照（250 分）📸',
        '• 新品 QA 挑戰（250 分）❓',
        '• 業務 QA 挑戰（250 分）🎯',
        '',
        '🎫 積分兌換抽獎券：500 分→1 張｜750 分→2 張｜1000 分→3 張（每月上限）',
      ],
      en: [
        'Daily missions (max 1,000 points/month):',
        '• Customer recommendation (250 pts)',
        '• New product display photo (250 pts)',
        '• New product QA challenge (250 pts)',
        '• Sales rep QA challenge (250 pts)',
        '',
        'Points to tickets: 500→1 | 750→2 | 1,000→3 (monthly max)',
      ],
    },
    tickets: {
      zh: [
        '🎫 取得抽獎券的方式',
        '',
        '📋【日常任務】',
        '積分 500 分→1 張｜750 分→2 張｜1000 分→3 張（每月上限）',
        '',
        '🤝【拜訪任務】',
        '每拜訪 1 間 KMBA 簽約店→1 張（每月上限 5 張）',
      ],
      en: [
        'How to earn raffle tickets:',
        '',
        'Daily missions: 500 pts→1 | 750 pts→2 | 1,000 pts→3 (monthly max)',
        'Visit missions: 1 ticket per partner store (max 5/month)',
      ],
    },
    voucher: {
      zh: [
        '🎁 超商禮券說明',
        '',
        '⚠️ 「超商禮券」≠「抽獎券」',
        '• 🎫 抽獎券：參加雙月抽獎用的資格券（由日常／拜訪任務累積）',
        '• 💰 超商禮券：實際發放的現金禮券獎勵',
        '',
        '📊【每月排行禮券】依當月積分排名發放：',
        '• 🥇 TOP 1–10：新台幣 1,000 元超商禮券',
        '• 🥈 TOP 11–30：新台幣 500 元超商禮券',
        '• 🥉 TOP 31–100：新台幣 200 元超商禮券',
        '※ 完成日常任務累積積分、進入排名後，由總部安排發放 ✉️',
        '',
        '🎉【雙月抽獎禮券】',
        '• 8–9 月累積抽獎券→10 月抽｜10–12 月累積→2027/1 抽',
        '• 每次 15 位店家，每位 5,000 元超商禮券 🎊',
      ],
      en: [
        'Convenience store gift vouchers:',
        '',
        'Note: Gift vouchers ≠ raffle tickets.',
        '• Raffle tickets: entries for the bi-monthly draw (earned via daily/visit missions)',
        '• Gift vouchers: actual cash vouchers awarded as prizes',
        '',
        'Monthly ranking vouchers (by points ranking):',
        '• TOP 1–10: NT$1,000 convenience store voucher',
        '• TOP 11–30: NT$500 convenience store voucher',
        '• TOP 31–100: NT$200 convenience store voucher',
        'Issued by headquarters after ranking based on monthly points.',
        '',
        'Bi-monthly draw: 15 winners, NT$5,000 voucher each',
      ],
    },
    visit: {
      zh: [
        '🤝 拜訪任務流程',
        '1. 拜訪其他 KMBA 簽約店 🏪',
        '2. 與寶亨／KT&G 陳列架合照（本人需入鏡）📸',
        '3. 透過 SurveyCake 上傳 📤',
        '4. 每月固定審核，通過後發放抽獎券 ✅',
        '',
        '🎫 每拜訪 1 間店＝1 張抽獎券，每月上限 5 張',
      ],
      en: [
        'Visit mission steps:',
        '1. Visit another KMBA partner store',
        '2. Photo with Bohem/KT&G display (owner must appear)',
        '3. Upload via SurveyCake',
        '4. Monthly review; raffle ticket issued upon approval',
        '',
        '1 store visit = 1 ticket, max 5 tickets/month.',
      ],
    },
    regional: {
      zh: [
        '🏆 北中南區域競賽',
        '📈 各區依「任務完成率」競賽，不比積分、不比進貨量',
        '🎫 冠軍區域：所有符合資格店家額外獲得 1 張抽獎券',
      ],
      en: [
        'Regional challenge (North / Central / South):',
        'Regions compete by task completion rate—not points or purchase volume.',
        'Winning region: all eligible stores receive 1 extra raffle ticket.',
      ],
    },
    reward: {
      zh: [
        '🎁 獎勵制度',
        '📊 每月排行：TOP 1–10 新台幣 1,000 元｜11–30 新台幣 500 元｜31–100 新台幣 200 元（超商禮券）',
        '🗓️ 雙月抽：8–9 月累積→10 月抽｜10–12 月累積→2027/1 抽，抽完歸零',
        '🎉 每次 15 位店家，每位 5,000 元超商禮券',
      ],
      en: [
        'Reward system:',
        '• Monthly ranking: TOP 1–10 NT$1,000 | 11–30 NT$500 | 31–100 NT$200 (gift vouchers)',
        '• Bi-monthly raffle: Aug–Sep→Oct | Oct–Dec→Jan 2027; tickets reset after each draw',
        '• 15 winners per draw, NT$5,000 gift voucher each',
      ],
    },
    line: {
      zh: [
        '💬 LINE 官方帳號提供：',
        '• 📢 每月任務公告、任務回傳',
        '• 📋 SurveyCake 與 Visit 回傳入口',
        '• 🤖 AI 智慧客服、活動公告、抽獎資訊',
      ],
      en: [
        'LINE Official Account provides:',
        '• Monthly mission announcements and submissions',
        '• SurveyCake and Visit mission uploads',
        '• AI assistant, event updates, and raffle information',
      ],
    },
    persona: {
      zh: [
        '您好，我是 KMBA菁英計畫官方智慧客服 👋',
        '我可以協助您了解日常任務、拜訪任務、抽獎券、區域競賽與雙月抽獎 😊',
        '請直接輸入問題，或點選下方快捷問題 👇',
      ],
      en: [
        "Hello! I'm the official AI assistant for the KMBA Elite Program.",
        'I can help with daily missions, visit missions, raffle tickets, regional challenges, and bi-monthly raffles.',
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
    '日常任務說明',
    '抽獎規則',
    '超商禮券說明',
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
      keywords: ['日常', '任務', '積分', '分數', '點數', '推薦', '陳列', '陈列', 'qa', '挑戰', '客人', '新品', '業務', '神秘', '1000', '500', '750', '250', '照片', '問卷', 'mission', 'point', 'points', 'task', 'tasks', '說明', '介绍', '介紹'],
      examples: [
        '日常任務說明', '本月有哪些日常任務', '日常任務有哪些', '任務清單', '要做什麼任務', '怎麼賺積分',
        '積分怎麼算', '多少分換券', '500分幾張', '750分', '1000分上限', '客人推薦怎麼做',
        '陳列照要拍什麼', '新品qa', '業務qa', '神秘任務', '每月任務', 'daily mission',
        'how many points', 'what are daily tasks', 'earn points',
      ],
    },
    {
      id: 'voucher',
      keywords: ['超商', '礼券', '禮券', 'gift', 'voucher', 'vouchers', 'convenience', '7-11', '711', '全家', 'ok', '面額', '發放', '发放', '多少錢', '多少钱', '獎金', '奖金'],
      examples: [
        '超商禮券', '超商礼券', '禮券怎麼發', '礼券怎么发', '禮券多少錢', '排行禮券',
        '高額禮券', '中額禮券', '參與獎禮券', '每月禮券', '獎品分類', 'gift voucher',
        'how much voucher', 'ranking gift voucher', 'convenience store voucher',
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
      keywords: ['拜訪', '拜访', '拜仿', '跨店', '簽約店', '签约店', '合照', '合照', 'survey', 'surveycake', 'upload', '上傳', '上传', '交流', 'visit', 'store', 'partner', '說明', '介绍', '介紹'],
      examples: [
        '拜訪任務說明', '拜訪任務怎麼完成', '拜訪要怎麼做', '跨店任務', '去別店拍照', '合照要拍什麼',
        'survey cake怎麼傳', '每月上限幾張', '拜訪5間', 'visit mission', 'how to complete visit',
        'photo with display', 'partner store',
      ],
    },
    {
      id: 'regional',
      keywords: ['區域', '区域', '北中南', '北部', '中部', '南部', '北區', '中區', '南區', '冠軍', '冠军', '競賽', '竞赛', '完成率', 'regional', 'north', 'central', 'south', 'challenge'],
      examples: [
        '區域競賽怎麼算', '北中南怎麼比', '完成率是什麼', '冠軍區域有什麼獎', '我們區贏了有什麼',
        'regional challenge', 'how is region ranked', 'winning region bonus',
      ],
    },
    {
      id: 'reward',
      keywords: ['獎勵', '奖励', '排行', '排名', '榜', '雙月', '双月', '5000', '五千元', 'top', 'ranking', 'rank', 'prize', 'draw', '開獎', '开奖', '中獎', '中奖', '15', '獎品', '奖品', '分類', '分类', '級距', '级距'],
      examples: [
        '雙月抽獎什麼時候', '什麼時候開獎', '10月抽嗎', '2027年1月', '排行獎勵',
        'top10多少', '31到100名', '抽完歸零嗎', 'bi monthly raffle', 'when is the draw',
        'monthly ranking reward', '5000 voucher',
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
    const hasVoucher = /超商|礼券|禮券|gift.?voucher|voucher|711|7-11|全家/.test(q + n);
    const hasRaffleTicket = /抽獎券|抽奖券|抽獎卷|抽奖卷|raffle.?ticket/.test(q + n);
    const hasRanking = /排行|排名|top|級距|级距|高額|中額|參與獎|参与奖/.test(q + n);
    if (hasVoucher && !hasRaffleTicket) return true;
    if (hasRanking && /禮券|礼券|超商|獎勵|奖励|獎品|奖品/.test(q + n)) return true;
    if (/獎品分類|奖品分类/.test(q + n)) return true;
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
