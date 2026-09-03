/* KMBA CLUB 2026 V.09 — FAQ engine (static, no backend) */
(function (global) {
  'use strict';

  const APP_VERSION = 'V.09';

  const CAMPAIGN_DATES = {
    decemberRevealAt: '2026-10-01T00:00:00+08:00',
  };

  /** 當月活動設定（9 月）— 唯一來源 */
  const CAMPAIGN_CONFIG = {
    monthLabel: '9月',
    monthProduct: '德尼露・藍寶堅尼 8號',
    monthProductBrand: 'Tonino Lamborghini',
    productTagline: '義式超跑精神 × 頂級菸草工藝',
    productSpecs: {
      price: 'NT$ 130',
      tar: '8mg',
      nicotine: '0.8mg',
      filter: '不沾唇濾嘴',
    },
    productFeatures: [
      '不沾唇濾嘴 — 乾淨品味・舒適體驗',
      '飽滿滑順口感 — 扎實擊喉感，入口滑順純淨，毫無辛辣刺激',
      '義式超跑美學 — 來自藍寶堅尼家族，品味生活的極致象徵',
      '嚴選頂級菸草 — 精選調配工藝，香氣飽滿純淨',
    ],
    productImages: [
      { src: 'assets/sept-product-features.png', alt: '9月新品特色介紹 — 德尼露・藍寶堅尼 8號' },
      { src: 'assets/sept-product-specs.png', alt: '9月新品規格 — 建議零售價 NT$130' },
    ],
  };

  /**
   * 對外活動積分（activityPoints / publicPoints）
   * K小助 FAQ、快捷問題、首頁說明 — 唯一使用的積分規則
   */
  const ACTIVITY_POINTS = {
    quizComplete: 100,
    displayApproved: 100,
    customerApproved: 100,
    monthlyCap: 300,
    raffleThresholds: [
      { points: 300, tickets: 3 },
      { points: 200, tickets: 2 },
      { points: 100, tickets: 1 },
    ],
  };

  /**
   * 總公司內部排行榜算法（internalRankingScore）
   * 僅供後台／Excel 計算參考 — 禁止出現在一般 FAQ
   */
  const INTERNAL_RANKING = {
    useFirstQuizAttemptOnly: true,
    sortByRawScoreThenFirstAttemptTime: true,
    timeBonusStart: 1.0,
    timeBonusStep: 0.01,
    displayPoints: 100,
    customerPoints: 100,
  };

  const CHAT_CONTEXT_KEY = 'kmbaChatContext';
  const CONTEXT_TTL_MS = 5 * 60 * 1000;

  const FORBIDDEN_VISIBLE_TERMS = [
    'Google', 'SurveyCake', 'TOP', 'Passport', 'Messaging API',
    '後端API', '資料庫', '內部系統', 'HORECA', 'Survey Cake',
  ];

  const FOOTER = '如需協助請聯繫區域業務 📞';

  const RELATED_QUESTIONS = {
    giftCard: [
      '我的積分怎麼算？',
      '每月積分排行商品卡差別',
      '積分相同怎麼排名？',
    ],
    raffleTicket: [
      '200分有幾張抽獎券？',
      '300分有幾張抽獎券？',
      '雙月抽獎獎項有哪些？',
    ],
    customerPhoto: [
      '客人一定要露臉嗎？',
      '照片裡一定要有新品嗎？',
      '怎樣的照片可能不通過？',
    ],
    displayPhoto: [
      '新品要拍多清楚？',
      '陳列任務幾分？',
      '客人推薦怎麼拍？',
    ],
    visitTask: [
      '每月最多可以拜訪幾間？',
      '拜訪照片要拍到什麼？',
      '拜訪任務有積分嗎？',
    ],
    tasks: [
      '抽獎券怎麼拿？',
      '商品卡怎麼拿？',
      '我的積分怎麼算？',
    ],
    points: [
      '100分有幾張抽獎券？',
      '每月排名怎麼計算？',
      '商品卡怎麼拿？',
    ],
    general: [
      '我的積分怎麼算？',
      '商品卡怎麼拿？',
      '抽獎券怎麼拿？',
    ],
  };

  /** Contextual follow-up（每次最多 3 個） */
  const CONTEXTUAL_FOLLOWUPS = {
    points_calc: ['100分有幾張抽獎券？', '每月排名怎麼計算？', '這個月有哪些任務？'],
    raffle_100: ['200分有幾張抽獎券？', '300分有幾張抽獎券？', '雙月抽獎獎項有哪些？'],
    raffle_200: ['100分有幾張抽獎券？', '300分有幾張抽獎券？', '雙月抽獎獎項有哪些？'],
    raffle_300: ['100分有幾張抽獎券？', '200分有幾張抽獎券？', '抽獎券怎麼拿？'],
    raffle_tickets_how: ['100分有幾張抽獎券？', '200分有幾張抽獎券？', '雙月抽獎獎項有哪些？'],
    raffle_rules_full: ['100分有幾張抽獎券？', '300分有幾張抽獎券？', '雙月抽獎獎項有哪些？'],
    display_photo: ['照片怎樣才算合格？', '陳列任務幾分？', '客人推薦怎麼拍？'],
    display_photo_bare: ['新品要拍多清楚？', '陳列任務幾分？', '客人推薦怎麼拍？'],
    customer_photo: ['怎樣的照片可能不通過？', '照片裡一定要有新品嗎？', '客人一定要露臉嗎？'],
    monthly_tasks: ['9月新品是什麼？', '新品陳列怎麼拍？', '這個月有哪些任務？'],
    sept_product_info: ['這個月有哪些任務？', '新品陳列怎麼拍？', '客人推薦怎麼拍？'],
    quiz_task: ['我的積分怎麼算？', '100分有幾張抽獎券？', '這個月有哪些任務？'],
    ranking_calc: ['我的積分怎麼算？', '100分有幾張抽獎券？', '商品卡怎麼拿？'],
    rewards_guide: ['商品卡級距', '抽獎券規則', '雙月抽獎獎項有哪些？'],
  };

  const PHOTO_CHECKLIST = {
    customerPhoto: {
      required: [
        '需能辨識正在進行本月新品推薦相關情境',
        '當月新品（' + CAMPAIGN_CONFIG.monthProduct + '）需清楚可見',
      ],
      allowed: [
        'Bartender 向客人介紹新品的互動畫面',
        '依活動規定於吸菸區呈現新品供消費者體驗',
      ],
      shooting: ['畫面清楚、光線明亮'],
      reject: [
        '只有模糊商品照',
        '無法辨識推薦情境',
        '照片過暗',
        '與本月活動新品無關',
      ],
    },
    displayPhoto: {
      required: [
        '當月新品（' + CAMPAIGN_CONFIG.monthProduct + '）清楚可見',
        '商品陳列完整',
      ],
      allowed: ['店內環境可適度入鏡但非必要'],
      shooting: ['畫面清楚、明亮，不要讓雜物遮住新品'],
      reject: [
        '新品太小或無法辨識',
        '照片過暗或失焦',
        '陳列區被其他物品遮擋',
      ],
    },
    visitPhoto: {
      required: [
        '實際前往另一間 KMBA 簽約店家',
        '照片中可辨識該店家的 KT&G 陳列架',
        '有拜訪者或店家人員入鏡',
      ],
      allowed: ['畫面清楚，可確認拜訪情境'],
      shooting: [],
      reject: [
        '非簽約店家或無法辨識陳列架',
        '只有自拍或空景，看不出拜訪情境',
        '畫面模糊、過暗',
      ],
    },
  };

  const VARIANT_TO_CANON = {
    卷: '券', 劵: '券', 奖券: '獎券', 抽奖: '抽獎',
    仿: '訪', 区: '區', 积: '積', 获: '獲', 问: '問', 传: '傳',
    台: '臺', 陈: '陳', 业: '業', 计: '計', 画: '畫', 竞: '競',
    赖: '賴', 账号: '帳號', 上传: '上傳', 拜访: '拜訪', 冠军: '冠軍',
    礼券: '禮券', 开奖: '開獎', 中奖: '中獎', 双月: '雙月',
  };

  // 比對問題時剝除的語助詞（不刪「有」「哪些」，避免「獎勵有哪些」被削成「獎勵」而誤判）
  const STOPWORDS = /請問|請教|想问|想問|可以|能不能|可否|帮我|幫我|告诉我|告訴我|想知道|怎么|怎麼|如何|什么|什麼|甚么|一下|吗|嗎|呢|啊|呀|喔|哦|吧|的|了|在|是|嘛|么/g;

  function canShowDecemberReward(now) {
    const revealAt = new Date(CAMPAIGN_DATES.decemberRevealAt);
    return (now || new Date()).getTime() >= revealAt.getTime();
  }

  function normalizeVariants(text) {
    let s = text;
    Object.keys(VARIANT_TO_CANON).sort((a, b) => b.length - a.length).forEach((from) => {
      s = s.split(from).join(VARIANT_TO_CANON[from]);
    });
    return s;
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

  function applyBriefLimit(formatted, depth) {
    if (depth === 'detailed' || !formatted) return formatted;
    const copy = Object.assign({}, formatted);
    if (copy.details && copy.details.length) {
      copy.details = copy.details.filter(function (line) { return String(line).trim() !== ''; }).slice(0, 5);
    }
    copy.nextStep = '';
    if (copy.suggestions && copy.suggestions.length > 2) {
      copy.suggestions = copy.suggestions.slice(0, 2);
    }
    return copy;
  }

  function formatAnswer({ conclusion, details, reminder, nextStep, suggestions, showFeedback, images }) {
    return {
      conclusion: conclusion || '',
      details: details || [],
      reminder: reminder || '',
      nextStep: nextStep ? stripDecemberContent(nextStep) : '',
      suggestions: (suggestions || []).slice(0, 3),
      images: images || [],
      showFeedback: showFeedback,
    };
  }

  function sanitizeVisibleAnswer(text) {
    let result = text || '';
    FORBIDDEN_VISIBLE_TERMS.forEach((term) => {
      result = result.replace(new RegExp(term, 'gi'), '');
    });
    return result.replace(/\n{3,}/g, '\n\n').trim();
  }

  function stripDecemberContent(text) {
    if (canShowDecemberReward()) return text;
    let r = text;
    const patterns = [
      /10[–\-—至到]11月累積.*?抽/g,
      /12月抽[獎奖]/g,
      /12月15日公布/g,
      /12\/15 公布/g,
      /15×2[,，]?000元[^。\n]*/g,
      /15×2[,，]?000[^。\n]*/g,
      /2[,，]?000元統一超商商品卡/g,
      /2[,，]?000元/g,
      /2000元/g,
      /雙倍加碼[^。\n]*/g,
      /雙倍[^。\n]*/g,
      /加碼[^。\n]*/g,
      /10[–\-—]11月累積→12月抽[^。\n]*/g,
    ];
    patterns.forEach((p) => { r = r.replace(p, ''); });
    r = r.replace(/12月/g, '');
    return r.replace(/\n{3,}/g, '\n\n').replace(/^\s+$/gm, '').trim();
  }

  function getAnswerDepth(input) {
    const text = normalize(input);
    if (/完整|全部|詳細|详细|規則|规则|說明|说明|一覽|一览|解說|解说/.test(text)) return 'detailed';
    return 'brief';
  }

  function buildReplyText(formatted, includeFooter) {
    const parts = [];
    if (formatted.conclusion) parts.push(formatted.conclusion);
    if (formatted.details && formatted.details.length) {
      if (parts.length) parts.push('');
      parts.push(...formatted.details);
    }
    if (formatted.reminder) {
      parts.push('');
      parts.push(formatted.reminder);
    }
    if (formatted.nextStep) {
      parts.push('');
      parts.push('接下來可以：' + formatted.nextStep);
    }
    let body = sanitizeVisibleAnswer(parts.join('\n'));
    body = stripDecemberContent(body);
    if (includeFooter !== false && body) body += '\n\n' + FOOTER;
    return body;
  }

  function bimonthlyDetailsForQuery(query, detailed) {
    const lines = [
      '8–9 月累積的抽獎券，於 10 月抽（15位×1,000元商品卡），10/15 公布。',
    ];
    if (canShowDecemberReward() && detailed) {
      lines.push('10–11 月累積的抽獎券，於 12 月抽（15位×2,000元商品卡，雙倍加碼），12/15 公布。');
    }
    lines.push('每次抽完後，抽獎券會重新計算。');
    return lines;
  }

  function bimonthlyPrizeConclusion() {
    let text = '雙月抽獎獎項為統一超商商品卡：10 月場 15 位 × 1,000 元';
    if (canShowDecemberReward()) {
      text += '；12 月場 15 位 × 2,000 元（雙倍加碼）';
    }
    return text + '。';
  }

  function getChatContext() {
    try {
      const raw = sessionStorage.getItem(CHAT_CONTEXT_KEY);
      if (!raw) return null;
      const ctx = JSON.parse(raw);
      if (!ctx.expiresAt || Date.now() > ctx.expiresAt) {
        sessionStorage.removeItem(CHAT_CONTEXT_KEY);
        return null;
      }
      return ctx;
    } catch (e) {
      return null;
    }
  }

  function setChatOptions(topic, options, extra) {
    const chatContext = {
      topic: topic,
      options: options || [],
      expiresAt: Date.now() + CONTEXT_TTL_MS,
      ...(extra || {}),
    };
    sessionStorage.setItem(CHAT_CONTEXT_KEY, JSON.stringify(chatContext));
    return chatContext;
  }

  function clearChatContext() {
    sessionStorage.removeItem(CHAT_CONTEXT_KEY);
  }

  const ORDINAL_MAP = {
    第一個: 0, 第二個: 1, 第三個: 2, 第四個: 3, 第五個: 4,
    第一: 0, 第二: 1, 第三: 2, 第四: 3, 第五: 4,
    1: 0, 2: 1, 3: 2, 4: 3, 5: 4,
    一: 0, 二: 1, 三: 2, 四: 3, 五: 4,
  };

  const ALIAS_MAP = {
    隨堂考: 0, 隨堂考那個: 0, 考題那個: 0, 問卷那個: 0,
    客人那個: 1, 推薦那個: 1, 客人照那個: 1, 照片那個: 1,
    陳列那個: 2, 新品那個: 2, 陳列照那個: 2,
    拜訪那個: 3, 拜訪: 3, 訪店那個: 3,
    全部: 4, 全部任務: 4, 全部任務比較: 4,
    客人推薦照片: 1, 新品陳列照片: 2, 品牌隨堂考: 0, 拜訪任務: 3,
    拜訪任務照片: 3,
  };

  function resolveOptionInput(input, ctx) {
    if (!ctx || !ctx.options || !ctx.options.length) return null;
    const raw = (input || '').trim();
    const n = normalize(raw);

    if (/我想知道|第二個|第三個|第一個|第四個/.test(n)) {
      const stripped = n.replace(/^我/, '').replace(/我想知道/g, '');
      if (ORDINAL_MAP[stripped] !== undefined) return ctx.options[ORDINAL_MAP[stripped]];
    }

    if (ORDINAL_MAP[n] !== undefined) return ctx.options[ORDINAL_MAP[n]];
    if (ORDINAL_MAP[raw] !== undefined) return ctx.options[ORDINAL_MAP[raw]];

    for (const key of Object.keys(ALIAS_MAP)) {
      if (n.includes(normalize(key)) || raw.includes(key)) {
        const idx = ALIAS_MAP[key];
        if (ctx.options[idx]) return ctx.options[idx];
      }
    }

    for (let i = 0; i < ctx.options.length; i++) {
      const opt = ctx.options[i];
      if (raw === opt || n === normalize(opt) || n.includes(normalize(opt)) || normalize(opt).includes(n)) {
        return opt;
      }
    }
    return null;
  }

  function giftCardTierLines() {
    return [
      '第 1～20 名：500 元商品卡',
      '第 21～40 名：200 元商品卡',
      '第 41～100 名：100 元商品卡',
      '需當月完成至少 1 項任務才有排行資格。',
    ];
  }

  /** 對外：積分怎麼算 */
  function activityPointsLines() {
    const p = ACTIVITY_POINTS;
    return [
      '📝 品牌隨堂考：完成即可獲得 ' + p.quizComplete + ' 分',
      '📸 新品陳列任務：審核通過獲得 ' + p.displayApproved + ' 分',
      '🙋 客人推薦任務：審核通過獲得 ' + p.customerApproved + ' 分',
      '',
      '常態任務每月積分上限為 ' + p.monthlyCap + ' 分。',
      '',
      '積分除了影響每月排名，也會影響可獲得的抽獎券張數喔！🎟️',
    ];
  }

  /** 對外：排行榜怎麼排名 */
  function publicRankingLines() {
    const cap = ACTIVITY_POINTS.monthlyCap;
    return [
      '完成品牌隨堂考、新品陳列及客人推薦任務，都可以累積當月任務積分。',
      '常態任務每月最高可累積 ' + cap + ' 分，積分越高，排名越有優勢！',
      '如遇同分或特殊排名情況，將依活動相關規則進行排名認定。',
      '',
      ...giftCardTierLines(),
    ];
  }

  /** 對外：抽獎券門檻 */
  function raffleTicketRulesLines(includeVisit) {
    const lines = [
      '當月積分達 100 分 → 1 張',
      '當月積分達 200 分 → 2 張',
      '當月積分達 300 分 → 3 張',
    ];
    if (includeVisit) {
      lines.push('拜訪任務另行計算：每完成一間 +1 張，每月最多 5 間。');
    }
    return lines;
  }

  function septemberTasksLines() {
    const p = ACTIVITY_POINTS;
    const product = CAMPAIGN_CONFIG.monthProduct;
    return [
      '🏁 ' + CAMPAIGN_CONFIG.monthLabel + '任務',
      '',
      '📝 品牌隨堂測驗',
      '完成即可獲得 ' + p.quizComplete + ' 分。',
      '',
      '📸 新品陳列任務',
      '完成' + product + '新品陳列並上傳照片，審核通過 +' + p.displayApproved + ' 分。',
      '',
      '🙋 客人推薦任務',
      '向客人推薦本月活動新品並依規定上傳照片，審核通過 +' + p.customerApproved + ' 分。',
      '',
      '常態任務每月積分上限 ' + p.monthlyCap + ' 分。',
      '如有任務資格或特殊狀況，請洽各區業務確認。',
    ];
  }

  function checklistBlock(type) {
    const c = PHOTO_CHECKLIST[type];
    if (!c) return [];
    const lines = [];
    if (c.required && c.required.length) {
      lines.push('【必要】');
      c.required.forEach(function (item) { lines.push('• ' + item); });
    }
    if (c.allowed && c.allowed.length) {
      lines.push('');
      lines.push('【可以】');
      c.allowed.forEach(function (item) { lines.push('• ' + item); });
    }
    if (c.shooting && c.shooting.length) {
      lines.push('');
      lines.push('【拍攝】');
      c.shooting.forEach(function (item) { lines.push('• ' + item); });
    }
    if (c.reject && c.reject.length) {
      lines.push('');
      lines.push('【不建議】');
      c.reject.forEach(function (item) { lines.push('• ' + item); });
    }
    lines.push('');
    lines.push('符合以上條件，較有機會通過審核。最終仍以活動單位審核結果為準。');
    return lines;
  }

  const KNOWLEDGE = [
    {
      id: 'tasks_guide',
      topic: 'tasks',
      keywords: ['任務類型解說', '任务类型解说', '任務類型', '全部任務比較', '全部任務'],
      match(n) { return /任務類型解說|任务类型解说|全部任務比較/.test(n); },
      get(depth) {
        const details = septemberTasksLines();
        details.push(
          '',
          '【拜訪任務】前往其他 KMBA 簽約店家拍照，LINE 上傳，每月 20 日審核',
          '每完成一間店 → 1 張抽獎券（每月最多 5 間，不計一般積分）',
        );
        return formatAnswer({
          conclusion: CAMPAIGN_CONFIG.monthLabel + '主要任務包含品牌隨堂測驗、新品陳列及客人推薦；另有拜訪任務可獲抽獎券。',
          details,
          nextStep: step('tasks'),
          suggestions: RELATED_QUESTIONS.tasks,
        });
      },
    },
    {
      id: 'rewards_guide',
      topic: 'giftCard',
      keywords: ['獎勵有哪些', '奖励有哪些', '獎勵解說', '奖励解说', '有什麼獎品', '有什么奖品', '可以拿什麼', '可以拿什么'],
      match(n) { return /獎勵有哪些|奖励有哪些|獎勵解說|有什麼獎品|有什么奖品|可以拿什麼|可以拿什么/.test(n); },
      get() {
        return formatAnswer({
          conclusion: 'KMBA 菁英計畫主要獎勵包含：\n\n🎁 每月積分排行榜商品卡\n🎟️ 雙月抽獎',
          details: ['想看哪一個？請選擇下方按鈕深入了解。'],
          options: ['商品卡級距', '抽獎券規則', '雙月抽獎獎項有哪些？'],
          optionTopic: 'rewardDeepDive',
          showFeedback: false,
          suggestions: ['商品卡怎麼拿？', '抽獎券怎麼拿？', '雙月抽獎獎項有哪些？'],
        });
      },
    },
    {
      id: 'gift_card_earn',
      topic: 'giftCard',
      keywords: ['禮券怎麼獲得', '礼券怎么获得', '禮券怎麼拿', '商品卡怎麼拿', '怎麼拿禮券', '怎麼拿商品卡', '超商禮券', '統一禮券', '超商卡', '月獎', '排名獎勵', '每月獎勵'],
      match(n) {
        return /禮券.*獲|礼券.*获|禮券.*拿|商品卡.*拿|怎麼.*禮券|怎麼.*商品卡|超商禮券|統一禮券|排名獎勵|每月獎勵|月獎/.test(n)
          && !/抽獎券|抽奖券/.test(n)
          || (/商品卡|礼券|禮券/.test(n) && /發給|发给|發放|收到|怎麼領|領取/.test(n));
      },
      get(depth) {
        const brief = formatAnswer({
          conclusion: '商品卡依每月積分排行發放，需當月完成至少 1 項任務。',
          details: [
            '完成常態任務可累積積分，商品卡依每月積分排行發放。',
            '我們發放的是「商品卡」，不是禮券。',
            '',
            ...giftCardTierLines(),
          ],
          nextStep: step('giftCard'),
          suggestions: RELATED_QUESTIONS.giftCard,
        });
        if (depth === 'detailed') {
          brief.details.push(
            '',
            '【任務與積分】',
            ...activityPointsLines(),
          );
        }
        return brief;
      },
    },
    {
      id: 'gift_card_delivery',
      topic: 'giftCard',
      keywords: ['商品卡會怎麼發給我', '商品卡怎麼發給我', '商品卡如何發放', '商品卡怎麼領', '怎麼收到商品卡'],
      match(n) {
        return /商品卡|礼券|禮券/.test(n) && /發給|发给|發放|收到|怎麼領|領取|寄|通知/.test(n);
      },
      get() {
        return formatAnswer({
          conclusion: '商品卡依每月積分排行結果發放，由區域業務親送或直接發放給店家。',
          details: [
            '需當月完成至少 1 項任務才有排行資格。',
            '我們發放的是統一超商商品卡，不是禮券或現金。',
            '實際發放時間與方式請留意活動通知，或洽詢您的區域業務。',
          ],
          nextStep: step('giftCard'),
          suggestions: RELATED_QUESTIONS.giftCard.slice(0, 2),
        });
      },
    },
    {
      id: 'gift_card_rank_after_15',
      topic: 'giftCard',
      keywords: ['15名以後', '15名以后', '第16名', '16名以後', '16名以后', '100名以後', '100名以后'],
      match(n) {
        return (/15.*名|第16|16.*名|100.*名|101/.test(n) && /獎勵|奖励|商品卡|禮券|礼券|多少|面額|面额/.test(n))
          || /15名以[後后]的獎勵/.test(n);
      },
      get() {
        return formatAnswer({
          conclusion: '第 16～20 名仍為 500 元商品卡；第 21～40 名 200 元；第 41～100 名 100 元。',
          details: [
            '第 101 名起不在本次商品卡發放範圍。',
            '需當月完成至少 1 項任務才有排行資格。',
          ],
          nextStep: step('giftCard'),
          suggestions: RELATED_QUESTIONS.giftCard.slice(0, 2),
        });
      },
    },
    {
      id: 'raffle_prizes',
      topic: 'raffleTicket',
      keywords: [
        '雙月抽獎獎項', '双月抽奖奖项', '抽獎獎項', '抽奖奖项', '抽什麼獎', '抽什么奖',
        '抽獎抽什麼', '抽奖抽什么', '中獎獎品', '中奖奖品', '中獎可以拿', '獎項有哪些',
        '奖项有哪些', '獎品有哪些', '摸彩獎項', '摸彩奖项',
      ],
      match(n) {
        return (/獎項|奖项|抽什麼獎|抽什么奖|中獎.*拿|中獎.*得|中獎.*什麼|獎品.*抽|抽獎.*獎|抽奖.*奖|摸彩.*獎/.test(n)
          || /雙月.*獎|双月.*奖/.test(n))
          && !/100分|200分|300分|幾張|几张|歸零|重新計|重新计/.test(n)
          && !/公平|公正|黑箱|作弊/.test(n);
      },
      get(depth, query) {
        const showDec = canShowDecemberReward();
        const details = [
          '抽獎券完成任務累積，每兩個月抽獎一次。',
          ...bimonthlyDetailsForQuery(query, showDec || depth === 'detailed'),
        ];
        return formatAnswer({
          conclusion: bimonthlyPrizeConclusion(),
          details,
          nextStep: step('drawTime'),
          suggestions: RELATED_QUESTIONS.raffleTicket,
        });
      },
    },
    {
      id: 'raffle_fairness',
      topic: 'raffleTicket',
      keywords: [
        '抽獎公平', '抽獎公平嗎', '抽獎有黑箱嗎', '抽獎會不會作弊', '抽獎會不會內定',
        '怎麼證明抽獎公平', '抽獎機制', '公平性', '公正', '黑箱', '作弊', '內定',
        '螢幕錄影', '录屏', '抽奖公平', '抽奖机制',
      ],
      match(n) {
        const raffleCtx = /抽獎|抽奖|抽獎券|抽奖券|摸彩|雙月|双月/.test(n);
        return (raffleCtx && /公平|公正|作弊|黑箱|內定|内定|錄影|录屏|證明.*公/.test(n))
          || /抽獎機制|抽奖机制/.test(n)
          || (/抽獎|抽奖/.test(n) && /公平|公正|知道.*公|黑箱|作弊|內定|内定/.test(n))
          || /怎麼證明.*抽|抽.*公平|抽.*黑箱|抽.*作弊|抽.*內定/.test(n);
      },
      get() {
        return formatAnswer({
          conclusion: '本活動雙月抽獎會使用公開且無法事先預測的台灣彩券開獎號碼作為抽獎依據，並依各店家累積的抽獎券數計算中獎機會，抽獎過程將全程錄影並公布結果。',
          details: [
            '每張抽獎券都代表一次中獎機會，抽獎券越多，中獎機會越高。',
            '彩券開獎號碼無法事先得知，因此無法預先安排中獎名單。',
            '抽獎會透過固定程式產生結果，不是由人工挑選。',
            '同一位參加者每期最多中獎一次。',
            '抽獎時會公布使用的彩券期別、開獎號碼與中獎結果。',
          ],
          reminder: '10 月場與 12 月場皆會全程錄影，實際公布方式請以活動通知為準。',
          nextStep: '若想了解抽獎券如何累積，可查看完整抽獎規則。',
          suggestions: [
            '請完整說明抽獎規則',
            '雙月抽獎獎項有哪些？',
            '抽獎券多久會重新計算？',
          ],
        });
      },
    },
    {
      id: 'visit_partner_stores',
      topic: 'visitTask',
      keywords: ['合作店家', '合作店', '簽約店家', '可以拜訪哪些', '哪些店家', '哪些店', '會通知', '通知店家', '去哪一間', '可以拜訪誰', '店家名單', '店名單'],
      match(n) {
        return (/合作|簽約/.test(n) && /店|店家/.test(n) && /拜訪|訪店|哪些|哪幾|通知|會通知|名單|去哪/.test(n))
          || /拜訪.*哪些.*店|哪些.*簽約|去哪一間|可以拜訪誰|店家名單/.test(n)
          || (/通知/.test(n) && /拜訪|店家|店/.test(n));
      },
      get() {
        return formatAnswer({
          conclusion: '拜訪任務合作店家名單及可拜訪對象，請洽各區業務確認。K小助目前不提供合作店家名單，以各區業務提供的資訊為準。',
          details: [
            '不可拜訪自己的店，需到其他 KMBA 簽約店家完成指定拍照。',
            '每完成一間有效拜訪 → 1 張抽獎券，每月最多 5 間（不計一般積分）。',
            '須依活動規定提供佐證；特殊資格判定請洽各區業務。',
          ],
          nextStep: step('visitTask'),
          suggestions: RELATED_QUESTIONS.visitTask.slice(0, 2),
        });
      },
    },
    {
      id: 'points_calc',
      topic: 'points',
      keywords: ['我的積分怎麼算', '積分怎麼算', '积分怎么算', '積分如何計算', '分数怎么算', '分數怎麼算', '積分計算', '一個月最多幾分', '一个月最多几分', '任務幾分', '任务几分', '最多幾分'],
      match(n) {
        return (/積分|积分|分數|分数/.test(n) && /怎麼算|怎么算|如何計|如何计|計算|计算|最多幾分|最多几分|幾分|几分/.test(n)
          && !/排名|排行|券|張/.test(n))
          || /一個月最多|一个月最多|任務幾分|任务几分/.test(n);
      },
      get() {
        return formatAnswer({
          conclusion: '每月完成指定任務即可累積積分 ⭐',
          details: activityPointsLines(),
          nextStep: step('giftCard'),
          suggestions: CONTEXTUAL_FOLLOWUPS.points_calc,
        });
      },
    },
    {
      id: 'internal_ranking_redirect',
      topic: 'giftCard',
      keywords: ['時間加成', '时间加成', '時間加分', '答題排名', '原始分數', '第一次有效', '重複作答', '答題優先序'],
      match(n) {
        return /時間加成|时间加成|時間加分|答題排名|原始分數|第一次有效|重複作答|答題優先序|內部排名|小數積分/.test(n);
      },
      get() {
        return formatAnswer({
          conclusion: '排行榜將依當月任務完成狀況及積分進行排名 🏆',
          details: publicRankingLines(),
          nextStep: step('giftCard'),
          suggestions: ['我的積分怎麼算？', '100分有幾張抽獎券？', '商品卡怎麼拿？'],
        });
      },
    },
    {
      id: 'raffle_tickets_how',
      topic: 'raffleTicket',
      keywords: ['抽獎券怎麼拿', '抽奖券怎么拿', '抽獎券如何獲得', '怎麼拿抽獎券', '怎么拿抽奖券', '抽獎券規則'],
      match(n) {
        return (/抽獎券|抽奖券/.test(n) && /怎麼拿|怎么拿|如何獲|如何获|怎麼得|怎么得/.test(n))
          || n === '抽獎券規則' || n === '抽奖券规则';
      },
      get(depth, query) {
        const details = [
          ...raffleTicketRulesLines(depth === 'detailed'),
          '',
          ...bimonthlyDetailsForQuery(query, depth === 'detailed'),
        ];
        return formatAnswer({
          conclusion: '抽獎券依當月活動積分兌換，並可透過拜訪任務額外累積。',
          details,
          nextStep: step('raffleTicket'),
          suggestions: CONTEXTUAL_FOLLOWUPS.raffle_tickets_how,
        });
      },
    },
    {
      id: 'raffle_100',
      topic: 'raffleTicket',
      keywords: ['100分幾張', '100分有幾張', '一百分幾張', '100分抽獎券', '一百分抽獎券', '100分有幾張券'],
      match(n) { return /100分|一百分/.test(n) && /券|張|张|幾|几/.test(n); },
      get(depth) {
        const brief = formatAnswer({
          conclusion: '當月積分達 100 分，可獲得 1 張抽獎券。',
          details: ['200 分 → 2 張；300 分 → 3 張。'],
          nextStep: step('raffleTicket'),
          suggestions: CONTEXTUAL_FOLLOWUPS.raffle_100,
        });
        if (depth === 'detailed') {
          brief.details.push('', ...raffleTicketRulesLines(true));
        }
        return brief;
      },
    },
    {
      id: 'raffle_200',
      topic: 'raffleTicket',
      keywords: ['200分幾張', '200分有幾張'],
      match(n) { return /200分/.test(n) && /券|張|张|幾|几/.test(n); },
      get(depth) {
        return formatAnswer({
          conclusion: '當月積分達 200 分，可獲得 2 張抽獎券。',
          details: depth === 'detailed'
            ? ['100 分 → 1 張；300 分 → 3 張。', ...raffleTicketRulesLines(false)]
            : ['100 分 → 1 張；300 分 → 3 張。'],
          nextStep: step('raffleTicket'),
          suggestions: CONTEXTUAL_FOLLOWUPS.raffle_200,
        });
      },
    },
    {
      id: 'raffle_300',
      topic: 'raffleTicket',
      keywords: ['300分幾張', '300分有幾張', '300分', '300分以上幾張'],
      match(n) { return /300分/.test(n) && /券|張|张|幾|几|以上/.test(n); },
      get() {
        return formatAnswer({
          conclusion: '當月積分達 300 分，可獲得 3 張抽獎券。',
          details: ['100 分 → 1 張；200 分 → 2 張。', '常態任務每月積分上限 300 分。'],
          nextStep: step('raffleTicket'),
          suggestions: CONTEXTUAL_FOLLOWUPS.raffle_300,
        });
      },
    },
    {
      id: 'raffle_rules_full',
      topic: 'raffleTicket',
      keywords: ['完整說明抽獎', '抽獎規則', '抽奖规则', '完整抽獎', '雙月抽獎規則', '抽獎券規則'],
      match(n) { return /完整.*抽|抽獎規則|抽奖规则|雙月.*規|双月.*规|抽獎券規則/.test(n); },
      get(depth, query) {
        return formatAnswer({
          conclusion: '抽獎券依當月活動積分兌換，每兩個月抽獎一次。' + bimonthlyPrizeConclusion(),
          details: [
            ...raffleTicketRulesLines(true),
            '',
            ...bimonthlyDetailsForQuery(query, true),
          ],
          nextStep: step('drawTime'),
          suggestions: CONTEXTUAL_FOLLOWUPS.raffle_rules_full,
        });
      },
    },
    {
      id: 'raffle_reset',
      topic: 'raffleTicket',
      keywords: ['抽獎券什麼時候歸零', '抽獎券歸零', '重新計算', '重新计算', '抽完', '多久重新計算', '多久會重新計算'],
      match(n) { return /歸零|重新計|重新计|抽完.*券|券.*抽完|多久.*重新/.test(n); },
      get() {
        return formatAnswer({
          conclusion: '每次抽完後，抽獎券會重新計算。',
          details: ['不是歸零後保留舊券，而是依新週期重新累積計算。'],
          nextStep: step('raffleTicket'),
          suggestions: RELATED_QUESTIONS.raffleTicket,
        });
      },
    },
    {
      id: 'visit_points',
      topic: 'visitTask',
      keywords: ['拜訪任務有積分嗎', '拜訪有積分嗎', '拜訪積分'],
      match(n) { return /拜訪/.test(n) && /積分|分数|分數/.test(n); },
      get() {
        return formatAnswer({
          conclusion: '拜訪任務沒有積分，審核通過後獲得抽獎券。',
          details: ['每完成一間 KMBA 簽約店家 → 1 張抽獎券。'],
          nextStep: step('visitTask'),
          suggestions: RELATED_QUESTIONS.visitTask,
        });
      },
    },
    {
      id: 'visit_one_ticket',
      topic: 'visitTask',
      keywords: ['拜訪一間有幾張', '拜訪一間', '一間有幾張券'],
      match(n) { return /拜訪/.test(n) && /一間|一间/.test(n) && /券|張|张/.test(n); },
      get() {
        return formatAnswer({
          conclusion: '拜訪一間簽約店，審核通過後可獲得 1 張抽獎券。',
          nextStep: step('visitTask'),
          suggestions: RELATED_QUESTIONS.visitTask,
        });
      },
    },
    {
      id: 'visit_max',
      topic: 'visitTask',
      keywords: ['每月最多拜訪', '每個月最多拜訪', '拜訪幾間', '最多拜訪幾間'],
      match(n) { return /拜訪/.test(n) && /最多|幾間|几间|每月|每個月/.test(n); },
      get() {
        return formatAnswer({
          conclusion: '拜訪任務每月最多 5 間，每兩個月最多 10 間。',
          details: ['每完成一間店 → 1 張抽獎券，每月 20 日審核。'],
          nextStep: step('visitTask'),
          suggestions: RELATED_QUESTIONS.visitTask,
        });
      },
    },
    {
      id: 'visit_task',
      topic: 'visitTask',
      keywords: ['拜訪任務', '訪店', '去別間店', '店家拜訪', '互訪', '拜訪其他店', '去其他簽約店'],
      match(n) { return /拜訪任務|訪店|互訪|拜訪其他|去其他簽約|去別間店/.test(n) && !/照片|可以嗎|積分/.test(n); },
      get(depth) {
        const details = [
          '1. 前往其他 KMBA 簽約店家',
          '2. 與該店 KT&G 陳列架合照',
          '3. LINE 上傳',
          '4. 每月 20 日審核',
          '每完成一間店 → 1 張抽獎券',
        ];
        if (depth === 'detailed') details.push('', ...checklistBlock('visitPhoto'));
        return formatAnswer({
          conclusion: '拜訪任務需前往其他 KMBA 簽約店家完成指定拍照。',
          details,
          nextStep: step('visitTask'),
          suggestions: RELATED_QUESTIONS.visitTask,
        });
      },
    },
    {
      id: 'passport_alias',
      topic: 'visitTask',
      keywords: ['passport'],
      match(n) { return /passport/i.test(n); },
      get() {
        return formatAnswer({
          conclusion: '目前活動統一稱為「拜訪任務」。',
          details: [
            '前往其他 KMBA 簽約店家完成指定拍照，審核通過後即可獲得抽獎券。',
          ],
          nextStep: step('visitTask'),
          suggestions: RELATED_QUESTIONS.visitTask,
        });
      },
    },
    {
      id: 'customer_photo_bare',
      topic: 'customerPhoto',
      keywords: ['客人推薦照片'],
      match(n) { return n === '客人推薦照片' || n === '客人推薦照'; },
      get() {
        return formatAnswer({
          conclusion: '客人推薦照片需呈現向客人推薦當月新品的互動情境。',
          details: checklistBlock('customerPhoto'),
          nextStep: step('customerPhoto'),
          suggestions: RELATED_QUESTIONS.customerPhoto,
        });
      },
    },
    {
      id: 'display_photo_bare',
      topic: 'displayPhoto',
      keywords: ['新品陳列照片'],
      match(n) { return n === '新品陳列照片' || n === '新品陳列照'; },
      get() {
        return formatAnswer({
          conclusion: '新品陳列照片需清楚呈現當月新品的完整陳列狀況。',
          details: checklistBlock('displayPhoto'),
          nextStep: step('displayPhoto'),
          suggestions: RELATED_QUESTIONS.displayPhoto,
        });
      },
    },
    {
      id: 'visit_photo_bare',
      topic: 'visitTask',
      keywords: ['拜訪任務照片', '拜訪照片'],
      match(n) { return n === '拜訪任務照片' || n === '拜訪照片'; },
      get() {
        return formatAnswer({
          conclusion: '拜訪任務照片需可辨識該店 KT&G 陳列架，並有拜訪者或店家人員入鏡。',
          details: checklistBlock('visitPhoto'),
          nextStep: step('visitTask'),
          suggestions: RELATED_QUESTIONS.visitTask,
        });
      },
    },
    {
      id: 'customer_photo',
      topic: 'customerPhoto',
      keywords: ['客人推薦照片', '客人推薦怎麼拍', '客人照', '推薦照', 'bartender推薦', '調酒師推薦', '向客人推薦', '客人互動'],
      match(n) {
        return (/客人推薦|推薦照|客人照|向客人推薦|bartender|調酒師推薦/.test(n)
          && /怎麼拍|如何拍|規則|要求|注意|拍法|怎麼做|怎么拍/.test(n))
          || /客人推薦照片怎麼拍|客人推薦怎麼拍/.test(n);
      },
      get() {
        return formatAnswer({
          conclusion: '客人推薦照片需呈現向客人推薦當月新品的互動情境。',
          details: checklistBlock('customerPhoto'),
          nextStep: step('customerPhoto'),
          suggestions: RELATED_QUESTIONS.customerPhoto,
        });
      },
    },
    {
      id: 'display_photo',
      topic: 'displayPhoto',
      keywords: ['新品陳列照片', '陳列照', '陳列照片', '新品照', '展示照', '陳列架照片', '商品架照片'],
      match(n) {
        return /陳列照|新品陳列|新品照|展示照|陳列架|商品架/.test(n)
          && /怎麼拍|如何拍|規則|要求|注意|拍法|清楚|環境/.test(n);
      },
      get() {
        return formatAnswer({
          conclusion: '新品陳列照片需清楚呈現當月新品的完整陳列狀況。',
          details: checklistBlock('displayPhoto'),
          nextStep: step('displayPhoto'),
          suggestions: RELATED_QUESTIONS.displayPhoto,
        });
      },
    },
    {
      id: 'photo_need_new_product',
      topic: 'customerPhoto',
      keywords: [
        '照片裡一定要有新品嗎', '照片一定要有新品', '一定要有新品', '照片裡要有新品',
        '要保留新品', '照片要保留新品', '照片裡一定要有新品',
      ],
      match(n) {
        return (/照片|相片|拍照/.test(n) && /新品/.test(n))
          || /一定要有新品|要保留新品|保留新品/.test(n);
      },
      get() {
        return formatAnswer({
          conclusion: '需要保留新品。照片中需清楚呈現當月新品（' + CAMPAIGN_CONFIG.monthProduct + '）。',
          details: [
            '客人推薦照片與新品陳列照片皆需讓當月新品清楚可見。',
            '新品被遮擋、過小或無法辨識，較可能無法通過審核。',
          ],
          nextStep: step('photoReview'),
          suggestions: RELATED_QUESTIONS.customerPhoto.slice(0, 2),
        });
      },
    },
    {
      id: 'customer_photo_definition',
      topic: 'customerPhoto',
      keywords: [
        '客人推薦照片的定義', '客人推薦照片是什麼', '客人推薦照片定義',
        '推薦照片的定義', '請問客人推薦照片的定義',
      ],
      match(n) {
        return (/客人推薦|推薦照片/.test(n) && /定義|是什么|是什麼|意思|指的是/.test(n))
          || /客人推薦照片的定義/.test(n);
      },
      get() {
        return formatAnswer({
          conclusion: '客人推薦照片是指呈現向客人推薦當月新品的互動情境，不是只有產品或只有店員。',
          details: [
            '畫面中需有客人、當月新品，以及 Bartender 或主理人的推薦互動。',
            '照片需清楚明亮，主要人物與新品可辨識。',
          ],
          nextStep: step('customerPhoto'),
          suggestions: RELATED_QUESTIONS.customerPhoto.slice(0, 2),
        });
      },
    },
    {
      id: 'customer_no_face',
      topic: 'customerPhoto',
      keywords: ['客人沒露臉', '客人不露臉', '沒露臉'],
      match(n) { return /客人/.test(n) && /露臉|露脸/.test(n); },
      get() {
        return formatAnswer({
          conclusion: '客人推薦照片建議可辨識客人與推薦互動，若完全看不到客人較可能無法通過。',
          details: [
            '需有向客人推薦新品的互動感，僅產品或僅店員通常不符合。',
            '我可以依照規則協助初步判斷，最終仍以活動單位審核結果為準。',
          ],
          nextStep: step('photoReview'),
          suggestions: RELATED_QUESTIONS.customerPhoto,
        });
      },
    },
    {
      id: 'product_only',
      topic: 'customerPhoto',
      keywords: ['只有產品', '只有产品', '只有商品'],
      match(n) { return /只有/.test(n) && /產品|产品|商品/.test(n); },
      get() {
        return formatAnswer({
          conclusion: '只有產品、沒有客人的照片，通常無法通過客人推薦照片審核。',
          details: [
            '需有客人與 Bartender 或主理人推薦新品的互動情境。',
            '我可以依照規則協助初步判斷，最終仍以活動單位審核結果為準。',
          ],
          nextStep: step('photoReview'),
          suggestions: RELATED_QUESTIONS.customerPhoto,
        });
      },
    },
    {
      id: 'gift_card_tiers',
      topic: 'giftCard',
      keywords: [
        '100～500', '100-500', '500元', '200元', '100元', '差別', '区别', '面額',
        '前20', '前20名', '21~40', '21～40', '41~100', '41～100', '發放金額', '名次',
        '500元200元', '商品卡價值', '排行獎勵',
      ],
      match(n) {
        return (/100.*500|500.*100|500元|200元|100元/.test(n) && /差|别|別|面額|商品卡|禮券|礼券/.test(n))
          || /前20|21.*40|41.*100|發放金額|名次.*商品|商品卡.*名次/.test(n)
          || /每月積分排行.*差|排行.*100.*500/.test(n);
      },
      get() {
        return formatAnswer({
          conclusion: '商品卡面額依每月積分排行名次發放，名次越高，面額越高。',
          details: giftCardTierLines(),
          nextStep: step('giftCard'),
          suggestions: RELATED_QUESTIONS.giftCard,
        });
      },
    },
    {
      id: 'ranking_tie',
      topic: 'giftCard',
      keywords: ['積分相同怎麼排名'],
      match(n) { return /積分相同/.test(n) && /排名/.test(n); },
      get() {
        return formatAnswer({
          conclusion: '如遇同分或特殊排名情況，將依活動相關規則進行排名認定。',
          details: publicRankingLines(),
          nextStep: step('giftCard'),
          suggestions: RELATED_QUESTIONS.giftCard,
        });
      },
    },
    {
      id: 'ranking_calc',
      topic: 'giftCard',
      keywords: ['每月排名怎麼計算', '排名怎麼算', '排行榜怎麼排名', '積分相同怎麼排名', '同分'],
      match(n) { return /排名|排行/.test(n) && /計算|计算|怎麼|同分|相同|排名/.test(n); },
      get() {
        return formatAnswer({
          conclusion: '排行榜將依當月任務完成狀況及積分進行排名 🏆',
          details: publicRankingLines(),
          nextStep: step('giftCard'),
          suggestions: CONTEXTUAL_FOLLOWUPS.ranking_calc,
        });
      },
    },
    {
      id: 'visit_has_ticket',
      topic: 'raffleTicket',
      keywords: ['拜訪任務也有抽獎券', '拜訪也有抽獎券', '拜訪抽獎券'],
      match(n) { return /拜訪/.test(n) && /抽獎券|抽奖券/.test(n); },
      get() {
        return formatAnswer({
          conclusion: '有的，拜訪任務審核通過後每間店可獲得 1 張抽獎券。',
          details: ['每月最多 5 間，每兩個月最多 10 間。'],
          nextStep: step('raffleTicket'),
          suggestions: RELATED_QUESTIONS.visitTask,
        });
      },
    },
    {
      id: 'quiz_task',
      topic: 'tasks',
      keywords: ['品牌隨堂考', '問卷', '考題', '測驗', '小考', '答題', '產品問題', '品牌問題'],
      match(n) { return /隨堂考|問卷|考題|測驗|小考|答題/.test(n) && !/照片/.test(n); },
      get() {
        return formatAnswer({
          conclusion: '品牌隨堂考完成即可獲得 ' + ACTIVITY_POINTS.quizComplete + ' 分，計入當月常態任務積分。',
          details: [
            'LINE 不定時發布，提交越早越好。',
            '常態任務每月積分上限 ' + ACTIVITY_POINTS.monthlyCap + ' 分。',
          ],
          nextStep: step('quiz'),
          suggestions: CONTEXTUAL_FOLLOWUPS.quiz_task,
        });
      },
    },
    {
      id: 'customer_photo_fail',
      topic: 'customerPhoto',
      keywords: ['怎樣的照片可能不通過', '照片可能不通過', '不通過'],
      match(n) { return /不通過|不通过/.test(n) && /照片|推薦|客人/.test(n); },
      get() {
        return formatAnswer({
          conclusion: '客人推薦照片若缺少推薦情境、當月新品或畫面不清，較可能無法通過。',
          details: checklistBlock('customerPhoto'),
          nextStep: step('photoReview'),
          suggestions: RELATED_QUESTIONS.customerPhoto,
        });
      },
    },
    {
      id: 'display_clear',
      topic: 'displayPhoto',
      keywords: ['新品要拍多清楚', '拍多清楚'],
      match(n) { return /新品/.test(n) && /清楚|清晰/.test(n); },
      get() {
        return formatAnswer({
          conclusion: '當月新品需在照片中清楚可見、可辨識，陳列完整且不被雜物遮擋。',
          details: checklistBlock('displayPhoto'),
          nextStep: step('displayPhoto'),
          suggestions: RELATED_QUESTIONS.displayPhoto,
        });
      },
    },
    {
      id: 'display_env',
      topic: 'displayPhoto',
      keywords: ['店內環境', '店内环境'],
      match(n) { return /陳列|新品/.test(n) && /環境|环境/.test(n); },
      get() {
        return formatAnswer({
          conclusion: '重點是當月新品陳列清楚可見，店內環境可適度入鏡但非必要。',
          details: ['確保新品完整、明亮、不被遮擋即可。'],
          nextStep: step('displayPhoto'),
          suggestions: RELATED_QUESTIONS.displayPhoto,
        });
      },
    },
    {
      id: 'visit_photo_what',
      topic: 'visitTask',
      keywords: ['拜訪照片要拍到', '拜訪要拍什麼'],
      match(n) { return /拜訪/.test(n) && /拍到|拍什麼|照片/.test(n); },
      get() {
        return formatAnswer({
          conclusion: '拜訪照片需可辨識該店 KT&G 陳列架，並有拜訪者或店家人員入鏡。',
          details: checklistBlock('visitPhoto'),
          nextStep: step('visitTask'),
          suggestions: RELATED_QUESTIONS.visitTask,
        });
      },
    },
    {
      id: 'sept_product_info',
      topic: 'tasks',
      keywords: [
        '9月新品是什麼', '九月新品', '9月新品', '本月新品', '新品是什麼', '新品介绍', '新品介紹',
        '新品知識', '新品知识', '藍寶堅尼', '德尼露', 'lamborghini', 'tonino', '8號新品',
      ],
      match(n) {
        return (/九月|9月|本月/.test(n) && /新品|新產品|新产品/.test(n))
          || /藍寶堅尼|德尼露|lamborghini|tonino/.test(n)
          || /新品.*什麼|什麼新品|新品介紹|新品介绍|新品知識|新品知识/.test(n)
          || n === '9月新品是什麼';
      },
      get() {
        const specs = CAMPAIGN_CONFIG.productSpecs;
        const featureLines = CAMPAIGN_CONFIG.productFeatures.map(function (line) { return '✦ ' + line; });
        return formatAnswer({
          conclusion: CAMPAIGN_CONFIG.monthLabel + '新品為「' + CAMPAIGN_CONFIG.monthProduct + '」— ' + CAMPAIGN_CONFIG.productTagline,
          details: featureLines.concat([
            '',
            '建議零售價 ' + specs.price + '｜焦油 ' + specs.tar + '｜尼古丁 ' + specs.nicotine,
            '特色：' + specs.filter,
            '',
            '下方為官方新品知識圖，供您參考 👇',
          ]),
          images: CAMPAIGN_CONFIG.productImages.slice(),
          nextStep: step('displayPhoto'),
          suggestions: CONTEXTUAL_FOLLOWUPS.sept_product_info,
        });
      },
    },
    {
      id: 'monthly_tasks',
      topic: 'tasks',
      keywords: ['每月有哪些任務', '每月任務', '這個月有哪些任務', '这个月有哪些任务', '本月任務', '本月任务'],
      match(n) { return (/每月|本月|這個月|这个月/.test(n) && /任務|任务/.test(n)) || n === '這個月有哪些任務'; },
      get() {
        return formatAnswer({
          conclusion: CAMPAIGN_CONFIG.monthLabel + '主要任務：品牌隨堂測驗、新品陳列、客人推薦。',
          details: septemberTasksLines(),
          nextStep: step('tasks'),
          suggestions: CONTEXTUAL_FOLLOWUPS.monthly_tasks,
        });
      },
    },
    {
      id: 'display_task_points',
      topic: 'displayPhoto',
      keywords: ['陳列任務幾分', '陈列任务几分', '新品陳列幾分', '陳列照片幾分'],
      match(n) { return /陳列|陈列|新品/.test(n) && /幾分|几分|多少分/.test(n); },
      get() {
        const pts = ACTIVITY_POINTS.displayApproved;
        return formatAnswer({
          conclusion: '新品陳列任務審核通過 +' + pts + ' 分；未完成或未通過 +0 分。',
          details: ['本月新品：' + CAMPAIGN_CONFIG.monthProduct + '（' + CAMPAIGN_CONFIG.monthProductBrand + '）'],
          nextStep: step('displayPhoto'),
          suggestions: CONTEXTUAL_FOLLOWUPS.display_photo,
        });
      },
    },
  ];

  const AMBIGUOUS = {
    任務: {
      prompt: '請問你想了解哪一項？',
      options: ['品牌隨堂考', '客人推薦照片', '新品陳列照片', '拜訪任務', '全部任務比較'],
      topic: 'taskSelect',
    },
    照片: {
      prompt: '請問你想確認哪一種照片？',
      options: ['客人推薦照片', '新品陳列照片', '拜訪任務照片'],
      topic: 'photoSelect',
    },
    抽獎: {
      prompt: '請問你想了解哪一部分？',
      options: ['雙月抽獎獎項有哪些？', '100分有幾張抽獎券？', '抽獎券多久會重新計算？', '請完整說明抽獎規則'],
      topic: 'raffleSelect',
    },
    獎品: {
      prompt: '請問你想了解哪一部分？',
      options: ['商品卡怎麼拿？', '100分有幾張抽獎券？', '獎勵有哪些'],
      topic: 'rewardSelect',
    },
    商品卡: {
      prompt: '請問你想了解哪一部分？',
      options: ['商品卡怎麼拿？', '每月排名怎麼計算？', '積分相同怎麼排名？'],
      topic: 'giftCardSelect',
    },
    積分: {
      prompt: '請問你想了解哪一部分？',
      options: ['我的積分怎麼算？', '100分有幾張抽獎券？', '商品卡怎麼拿？'],
      topic: 'pointSelect',
    },
    拜訪: {
      prompt: '請問你想了解哪一部分？',
      options: ['拜訪任務怎麼做？', '每月最多可以拜訪幾間？', '拜訪任務有積分嗎？'],
      topic: 'visitSelect',
    },
    怎麼做: {
      prompt: '請問你想了解哪一項任務？',
      options: ['品牌隨堂考', '客人推薦照片', '新品陳列照片', '拜訪任務'],
      topic: 'howToSelect',
    },
    怎麼拿: {
      prompt: '請問你想了解哪一部分？',
      options: ['商品卡怎麼拿？', '100分有幾張抽獎券？', '拜訪任務也有抽獎券嗎？'],
      topic: 'howGetSelect',
    },
    規則: {
      prompt: '請問你想了解哪一部分？',
      options: ['任務類型解說', '請完整說明抽獎規則', '客人推薦照片怎麼拍？'],
      topic: 'ruleSelect',
    },
    怎麼參加: {
      prompt: '請問你想了解哪一部分？',
      options: ['任務類型解說', '商品卡怎麼拿？', '100分有幾張抽獎券？'],
      topic: 'joinSelect',
    },
  };

  function calculateMatchScore(input, item) {
    const n = normalize(input);
    let score = 0;
    if (typeof item.match === 'function' && item.match(n)) score += 20;
    (item.keywords || []).forEach((keyword) => {
      const kn = normalize(keyword);
      if (!kn) return;
      // 整句與關鍵字完全相同 → 高優先命中（完整問句）
      if (n === kn) score += 25;
      else if (n.includes(kn)) score += kn.length >= 4 ? 5 : 2;
    });
    return score;
  }

  function findExactKeywordMatch(query, depth) {
    const raw = (query || '').trim();
    if (!raw) return null;
    for (let i = 0; i < KNOWLEDGE.length; i++) {
      const item = KNOWLEDGE[i];
      for (let j = 0; j < (item.keywords || []).length; j++) {
        if (raw === item.keywords[j]) {
          return {
            formatted: item.get(depth, query),
            faqId: item.id,
            category: item.topic,
          };
        }
      }
    }
    return null;
  }

  function matchKnowledge(query, depth) {
    // 短詞應走追問，避免误觸長文規則
    if (resolveTopicClarifyId((query || '').trim())) return null;

    const exact = findExactKeywordMatch(query, depth);
    if (exact) return exact;

    const scored = KNOWLEDGE.map((item) => ({
      item,
      score: calculateMatchScore(query, item),
    })).filter((x) => x.score > 0).sort((a, b) => b.score - a.score);

    if (!scored.length) return null;
    const top = scored[0];
    const second = scored[1];
    if (second && top.score - second.score <= 2 && top.score < 15) return null;
    if (top.score < 2) return null;
    return {
      formatted: top.item.get(depth, query),
      faqId: top.item.id,
      category: top.item.topic,
    };
  }

  function isAmbiguousOnly(query) {
    const raw = (query || '').trim();
    const n = normalize(raw);
    if (n.length > 8) return null;
    if (/這樣可以嗎|可以嗎|會過嗎|我這張|我那张|昨天拍的/.test(n)) return null;

    const keys = Object.keys(AMBIGUOUS);
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      const kn = normalize(key);
      if (n === kn || raw === key) return AMBIGUOUS[key];
    }
    return null;
  }

  function isPhotoValidationQuery(query) {
    const n = normalize(query);
    return /這樣可以嗎|可以嗎|會過嗎|我這張|我那张|我這樣|我这样|幫我看|帮我看|能不能過|能不能过/.test(n);
  }

  function isUnknownHowToAsk(query) {
    const n = normalize(query);
    return /不知道怎麼問|不懂怎麼問|要問什麼|怎么问|怎麼問/.test(n);
  }

  function evaluatePhotoDescription(desc, photoType) {
    const n = normalize(desc);
    const missing = [];
    if (photoType === 'customerPhoto' || photoType === '客人推薦照片') {
      if (!/客人|顧客|customer/.test(n)) missing.push('畫面中是否有客人');
      if (!/新品|產品|产品|商品/.test(n)) missing.push('是否看得到當月新品');
      if (!/推薦|推荐|bartender|調酒師|主理|介紹|介绍/.test(n)) missing.push('是否有推薦互動情境');
      if (/只有產品|只有产品|只有商品|沒有客人|没有客人/.test(n)) {
        return formatAnswer({
          conclusion: '依你的描述，可能缺少客人或推薦互動，較有機會無法通過。',
          details: checklistBlock('customerPhoto'),
          reminder: '我可以依照規則協助初步判斷，最終仍以活動單位審核結果為準。',
          nextStep: step('photoReview'),
          suggestions: RELATED_QUESTIONS.customerPhoto,
        });
      }
    } else if (photoType === 'displayPhoto' || photoType === '新品陳列照片') {
      if (!/新品|產品|产品|陳列|陈列/.test(n)) missing.push('是否清楚呈現新品陳列');
      if (/模糊|太暗|過暗|看不清|看不清/.test(n)) {
        return formatAnswer({
          conclusion: '依你的描述，照片可能因過暗或模糊而較難通過。',
          details: checklistBlock('displayPhoto'),
          reminder: '我可以依照規則協助初步判斷，最終仍以活動單位審核結果為準。',
          nextStep: step('photoReview'),
          suggestions: RELATED_QUESTIONS.displayPhoto,
        });
      }
    } else if (photoType === 'visitPhoto' || photoType === '拜訪任務照片') {
      if (!/陳列|陈列|簽約|签约|ktg|kt&g/.test(n)) missing.push('是否可辨識 KT&G 陳列架');
      if (!/人|店員|店员|拜訪|拜访/.test(n)) missing.push('是否有人員入鏡');
    }

    if (missing.length) {
      return formatAnswer({
        conclusion: '依你的描述，以下項目可能需要再確認：',
        details: missing.map((m) => '• ' + m),
        reminder: '我可以依照規則協助初步判斷，最終仍以活動單位審核結果為準。',
        nextStep: step('photoReview'),
        suggestions: photoType === 'customerPhoto' ? RELATED_QUESTIONS.customerPhoto
          : photoType === 'displayPhoto' ? RELATED_QUESTIONS.displayPhoto
            : RELATED_QUESTIONS.visitTask,
      });
    }

    return formatAnswer({
      conclusion: '依你的描述，大致符合提交條件，較有機會通過審核。',
      reminder: '我可以依照規則協助初步判斷，最終仍以活動單位審核結果為準。',
      nextStep: step('photoReview'),
      suggestions: photoType === 'customerPhoto' ? RELATED_QUESTIONS.customerPhoto
        : photoType === 'displayPhoto' ? RELATED_QUESTIONS.displayPhoto
          : RELATED_QUESTIONS.visitTask,
    });
  }

  const NEXT_STEPS = {
    quiz: '確認本月題目內容後，依活動通知完成作答。',
    customerPhoto: '拍攝前先確認畫面中有客人、當月新品，以及 Bartender 或主理人的推薦互動。',
    displayPhoto: '拍攝前先整理陳列區，確認新品清楚可見，並避免雜物遮擋。',
    visitTask: '前往其他 KMBA 簽約店家時，記得拍下可辨識的 KT&G 陳列架與拜訪情境。',
    giftCard: '完成每月任務並累積積分，商品卡將依當月積分排名發放。',
    raffleTicket: '持續完成日常任務及拜訪任務，累積符合規則的抽獎券。',
    photoReview: '提交前依照上方條件逐項確認；最終仍以活動單位審核結果為準。',
    drawTime: '留意後續活動通知，確認抽獎結果及相關公告。',
    tasks: '留意 LINE 活動通知，依發布內容完成當月任務。',
  };

  function step(key) {
    return key && NEXT_STEPS[key] ? stripDecemberContent(NEXT_STEPS[key]) : '';
  }

  const CLARIFY_OPTION_MAP = {
    giftCard: {
      '怎麼獲得': '商品卡怎麼拿',
      '每月發放金額': '每月積分排行商品卡差別',
      '排名怎麼計算': '每月排名怎麼計算？',
      '完整規則': '獎勵有哪些',
    },
    raffle: {
      '積分怎麼換': '100分有幾張抽獎券',
      '拜訪任務有幾張': '拜訪一間有幾張券',
      '什麼時候抽獎': '請完整說明抽獎規則',
      '完整規則': '請完整說明抽獎規則',
      '雙月抽獎獎項有哪些？': '雙月抽獎獎項有哪些？',
      '獎項有哪些': '雙月抽獎獎項有哪些？',
    },
    mission: {
      '品牌隨堂考': '品牌隨堂考',
      '客人推薦照片': '客人推薦照片',
      '新品陳列照片': '新品陳列照片',
      '拜訪任務': '拜訪任務',
      '全部任務比較': '任務類型解說',
    },
    photo: {
      '客人推薦照片': '客人推薦照片',
      '新品陳列照片': '新品陳列照片',
      '拜訪任務照片': '拜訪任務照片',
    },
    visit: {
      '怎麼完成': '拜訪任務',
      '照片要拍什麼': '拜訪照片要拍到什麼',
      '每月最多幾間': '每個月最多拜訪幾間',
      '可以拿幾張抽獎券': '拜訪一間有幾張券',
    },
    points: {
      '怎麼獲得': '我的積分怎麼算？',
      '我的積分怎麼算？': '我的積分怎麼算？',
      '每月最多幾分': '我的積分怎麼算？',
      '怎麼換抽獎券': '抽獎券怎麼拿？',
      '如何影響商品卡排名': '每月排名怎麼計算？',
    },
    ranking: {
      '排名怎麼計算': '每月排名怎麼計算？',
      '積分相同怎麼排名': '積分相同怎麼排名？',
      '如何影響商品卡排名': '每月積分排行商品卡差別',
    },
    reward: {
      '日常任務獎項-商品卡怎麼拿': '商品卡怎麼拿',
      '100分有幾張抽獎券': '100分有幾張抽獎券',
      '抽獎獎項-1000元商品卡15位': '雙月抽獎獎項有哪些？',
    },
  };

  const TOPIC_CLARIFICATIONS = [
    {
      id: 'giftCard',
      terms: ['商品卡', '禮券', '礼券', '超商卡', '統一禮券'],
      question: '請問你想了解商品卡的哪一項？',
      options: ['怎麼獲得', '每月發放金額', '排名怎麼計算', '完整規則'],
      topic: 'giftCardClarify',
    },
    {
      id: 'raffle',
      terms: ['抽獎', '抽奖', '抽獎券', '抽奖券', '抽獎票', '摸彩', '摸彩券', '券'],
      question: '請問你想了解抽獎券的哪一項？',
      options: ['積分怎麼換', '拜訪任務有幾張', '雙月抽獎獎項有哪些？', '什麼時候抽獎', '完整規則'],
      topic: 'raffleClarify',
    },
    {
      id: 'mission',
      terms: ['任務', '任务'],
      question: '請問你想了解哪一項任務？',
      options: ['品牌隨堂考', '客人推薦照片', '新品陳列照片', '拜訪任務', '全部任務比較'],
      topic: 'missionClarify',
    },
    {
      id: 'photo',
      terms: ['照片', '相片', '拍照', '推薦照', '陳列', '陳列照'],
      question: '請問你想確認哪一種照片？',
      options: ['客人推薦照片', '新品陳列照片', '拜訪任務照片'],
      topic: 'photoClarify',
    },
    {
      id: 'visit',
      terms: ['拜訪', '拜访', '訪店', '互訪', '访店'],
      question: '請問你想了解拜訪任務的哪一項？',
      options: ['怎麼完成', '照片要拍什麼', '每月最多幾間', '可以拿幾張抽獎券'],
      topic: 'visitClarify',
    },
    {
      id: 'points',
      terms: ['積分', '积分', '分數', '分数'],
      question: '請問你想了解積分的哪一項？',
      options: ['我的積分怎麼算？', '怎麼換抽獎券', '如何影響商品卡排名'],
      topic: 'pointsClarify',
    },
    {
      id: 'reward',
      terms: ['獎勵', '奖励', '獎品', '奖品'],
      question: '請問你想了解哪一部分？',
      options: [
        '日常任務獎項-商品卡怎麼拿',
        '100分有幾張抽獎券',
        '抽獎獎項-1000元商品卡15位',
      ],
      topic: 'rewardClarify',
    },
    {
      id: 'ranking',
      terms: ['排名', '排行', '名次'],
      question: '請問你想了解排名的哪一項？',
      options: ['排名怎麼計算', '積分相同怎麼排名', '如何影響商品卡排名'],
      topic: 'rankingClarify',
    },
  ];

  // 短詞同義詞 → 追問主題（僅整句完全命中時生效）
  const TOPIC_ALIASES = {
    商品卡: 'giftCard',
    禮券: 'giftCard',
    礼券: 'giftCard',
    超商卡: 'giftCard',
    統一禮券: 'giftCard',
    獎勵: 'reward',
    奖励: 'reward',
    獎品: 'reward',
    奖品: 'reward',
    排名: 'ranking',
    排行: 'ranking',
    名次: 'ranking',
    積分: 'points',
    积分: 'points',
    分數: 'points',
    分数: 'points',
    抽獎: 'raffle',
    抽奖: 'raffle',
    抽獎券: 'raffle',
    抽奖券: 'raffle',
    抽獎票: 'raffle',
    摸彩: 'raffle',
    摸彩券: 'raffle',
    券: 'raffle',
    任務: 'mission',
    任务: 'mission',
    照片: 'photo',
    相片: 'photo',
    拍照: 'photo',
    推薦照: 'photo',
    陳列: 'photo',
    陳列照: 'photo',
    拜訪: 'visit',
    拜访: 'visit',
    訪店: 'visit',
    访店: 'visit',
    互訪: 'visit',
  };

  function isExactKnowledgePhrase(raw) {
    const text = (raw || '').trim();
    if (!text) return false;
    const n = normalize(text);
    for (let i = 0; i < KNOWLEDGE.length; i++) {
      const item = KNOWLEDGE[i];
      if (item.keywords) {
        for (let j = 0; j < item.keywords.length; j++) {
          const keyword = item.keywords[j];
          if (keyword === text || normalize(keyword) === n) return true;
        }
      }
      if (item.match && item.match(n)) return true;
    }
    return false;
  }

  function resolveTopicClarifyId(raw) {
    const text = (raw || '').trim();
    if (!text) return null;
    if (isExactKnowledgePhrase(text)) return null;
    const n = normalize(text);
    // 僅處理短輸入（完整句子留給知識庫）
    if (n.length > 10) return null;

    if (Object.prototype.hasOwnProperty.call(TOPIC_ALIASES, text)) {
      return TOPIC_ALIASES[text];
    }

    for (let i = 0; i < TOPIC_CLARIFICATIONS.length; i++) {
      const item = TOPIC_CLARIFICATIONS[i];
      for (let j = 0; j < item.terms.length; j++) {
        const term = item.terms[j];
        if (text === term) return item.id;
      }
    }
    return null;
  }

  function isTopicOnlyInput(input) {
    return resolveTopicClarifyId(input) !== null;
  }

  function buildOptionMap(clarifyId, options) {
    const map = CLARIFY_OPTION_MAP[clarifyId] || {};
    const result = {};
    options.forEach((opt) => {
      result[opt] = map[opt] || opt;
    });
    return result;
  }

  function handleTopicOnlyInput(query) {
    const clarifyId = resolveTopicClarifyId(query);
    if (!clarifyId) return null;
    const matched = TOPIC_CLARIFICATIONS.find((item) => item.id === clarifyId);
    if (!matched) return null;
    const optionMap = buildOptionMap(matched.id, matched.options);
    setChatOptions(matched.topic, matched.options, { optionMap, clarifyId: matched.id });
    return {
      conclusion: matched.question,
      details: [],
      reminder: '',
      suggestions: [],
      options: matched.options,
      optionTopic: matched.topic,
      showFeedback: false,
    };
  }

  function clarifyResponse(prompt, options, topic, clarifyId) {
    const optionMap = clarifyId ? buildOptionMap(clarifyId, options) : {};
    setChatOptions(topic, options, clarifyId ? { optionMap, clarifyId } : {});
    return {
      conclusion: prompt,
      details: [],
      reminder: '',
      suggestions: [],
      options: options,
      optionTopic: topic,
      showFeedback: false,
      intent: 'clarify',
    };
  }

  function resolveTracking(intent, formatted, tracking) {
    if (tracking && tracking.faqId) {
      return {
        faqId: tracking.faqId,
        category: tracking.category || 'unknown',
      };
    }
    switch (intent) {
      case 'welcome':
        return { faqId: 'welcome', category: 'system' };
      case 'greeting':
        return { faqId: 'greeting', category: 'system' };
      case 'clarify':
        return { faqId: 'clarify', category: (formatted && formatted.optionTopic) || 'clarify' };
      case 'fallback':
        return { faqId: 'fallback', category: 'unknown' };
      case 'guardrail':
        return { faqId: 'guardrail', category: 'guardrail' };
      case 'photoValidate':
        return { faqId: 'photo_validation', category: 'photo' };
      case 'feedback':
        return { faqId: 'feedback', category: 'system' };
      case 'matched':
        return { faqId: 'matched', category: 'unknown' };
      default:
        return { faqId: intent || 'unknown', category: 'unknown' };
    }
  }

  function packResult(formatted, intent, tracking) {
    const hasOptions = formatted.options && formatted.options.length;
    const noFeedbackIntents = ['clarify', 'welcome', 'greeting', 'fallback', 'guardrail', 'photoValidate', 'feedback'];
    const showFeedback = formatted.showFeedback !== false
      && !noFeedbackIntents.includes(intent)
      && !hasOptions
      && !!(formatted.conclusion);
    const reply = buildReplyText(formatted, intent !== 'feedback' && intent !== 'welcome' && intent !== 'greeting');
    const track = resolveTracking(intent, formatted, tracking);
    let suggestions = formatted.suggestions || [];
    if (track.faqId && CONTEXTUAL_FOLLOWUPS[track.faqId]) {
      suggestions = CONTEXTUAL_FOLLOWUPS[track.faqId].slice(0, 3);
    } else if (suggestions.length > 3) {
      suggestions = suggestions.slice(0, 3);
    }
    return {
      reply,
      conclusion: formatted.conclusion,
      details: formatted.details || [],
      reminder: formatted.reminder || '',
      nextStep: formatted.nextStep || '',
      suggestions: suggestions,
      images: formatted.images || [],
      options: formatted.options || [],
      optionTopic: formatted.optionTopic || null,
      showFeedback,
      intent: intent || null,
      faqId: track.faqId,
      category: track.category,
    };
  }

  function handleFeedback(type) {
    if (type === 'resolved') {
      clearChatContext();
      return packResult(formatAnswer({
        conclusion: '好的，有其他問題也可以直接問我。',
        showFeedback: false,
      }), 'feedback');
    }
    if (type === 'more') {
      clearChatContext();
      return packResult({
        conclusion: '可以直接描述你還想確認的內容，或選擇下方分類。',
        details: [],
        options: ['任務內容', '積分與商品卡', '抽獎券', '照片規則', '拜訪任務'],
        showFeedback: false,
      }, 'feedback');
    }
    return packResult(formatAnswer({ conclusion: '如需協助請再輸入問題。', showFeedback: false }), 'feedback');
  }

  function guardrailBlock(query) {
    const q = query.toLowerCase();
    const n = normalize(query);
    const rewardContext = /超商|礼券|禮券|獎勵|奖励|排行|獎品|奖品|商品卡|雙月|抽獎/.test(q + n);
    if (['售價', '批发', '批發', '價格', 'price', 'wholesale', 'cost'].some((k) => q.includes(k))) {
      return packResult(formatAnswer({
        conclusion: '關於價格資訊，請洽詢您的區域業務，我無法提供喔 🙏',
      }), 'guardrail');
    }
    if (!rewardContext && ['多少錢', '多少钱'].some((k) => q.includes(k))) {
      return packResult(formatAnswer({
        conclusion: '關於價格資訊，請洽詢您的區域業務，我無法提供喔 🙏',
      }), 'guardrail');
    }
    if (['法令', '法規', '违法', '違法', 'legal', 'regulation', 'law'].some((k) => q.includes(k))) {
      return packResult(formatAnswer({
        conclusion: '法規相關問題請洽 KMBA 總部或區域業務，我無法提供法規判定。',
      }), 'guardrail');
    }
    return null;
  }

  function fallbackResponse() {
    return clarifyResponse(
      '我還不確定你想問哪一項，可以換個方式描述，或選擇下方分類：',
      ['任務內容', '積分與商品卡', '抽獎券', '拜訪任務', '照片規則'],
      'fallbackSelect',
    );
  }

  function answer(query) {
    query = (query || '').trim();
    if (!query) {
      return packResult(formatAnswer({
        conclusion: '歡迎使用 KMBA CLUB 活動小助手 👋',
        details: [
          '你可以直接用平常說話的方式提問，例如：',
          '「禮券怎麼拿？」「100分有幾張抽獎券？」',
          '「客人推薦照片怎麼拍？」「拜訪任務每月最多幾間？」',
          '',
          '問題不需要輸入完整名稱，我會協助你找到答案。',
          '若問題較模糊，我會再詢問你想了解的項目。',
        ],
      }), 'welcome');
    }

    const blocked = guardrailBlock(query);
    if (blocked) return blocked;

    const ctx = getChatContext();

    if (ctx && ctx.topic === 'photoValidate_select') {
      const selected = resolveOptionInput(query, ctx) || query;
      const photoMap = {
        '客人推薦照片': 'customerPhoto',
        '新品陳列照片': 'displayPhoto',
        '拜訪任務照片': 'visitPhoto',
      };
      const photoType = photoMap[selected] || selected;
      setChatOptions('photoValidate_describe', [], { photoType, photoLabel: selected });
      return packResult(formatAnswer({
        conclusion: '請用文字描述照片內容，我會依規則協助初步判斷。',
        details: [
          '你可以告訴我照片中是否有以下內容：',
          '1. 有哪些人物？',
          '2. 是否看得到當月新品？',
          '3. 是否有推薦或拜訪情境？',
          '4. 畫面是否清楚明亮？',
        ],
        reminder: '我可以依照規則協助初步判斷，最終仍以活動單位審核結果為準。',
        showFeedback: false,
      }), 'photoValidate');
    }

    if (ctx && ctx.topic === 'photoValidate_describe') {
      clearChatContext();
      const result = evaluatePhotoDescription(query, ctx.photoType || ctx.photoLabel);
      return packResult(result, 'photoValidate');
    }

    if (ctx) {
      const resolved = resolveOptionInput(query, ctx);
      if (resolved) {
        const mapped = (ctx.optionMap && ctx.optionMap[resolved]) || resolved;
        clearChatContext();
        return answer(mapped);
      }
    }

    if (isTopicOnlyInput(query)) {
      const topicClarify = handleTopicOnlyInput(query);
      if (topicClarify) {
        return packResult(topicClarify, 'clarify', {
          faqId: 'clarify',
          category: topicClarify.optionTopic || 'clarify',
        });
      }
    }

    const FALLBACK_MAP = {
      任務內容: '這個月有哪些任務？',
      積分與商品卡: '我的積分怎麼算？',
      抽獎券: '抽獎券怎麼拿？',
      拜訪任務: '拜訪任務怎麼做？',
      照片規則: '照片',
      拜訪任務怎麼做: '拜訪任務',
      全部任務比較: '任務類型解說',
      商品卡級距: '每月積分排行商品卡差別',
      抽獎券規則: '請完整說明抽獎規則',
      '雙月抽獎怎麼玩？': '請完整說明抽獎規則',
    };
    const fbKey = normalize(query);
    const fallbackTarget = FALLBACK_MAP[query] || FALLBACK_MAP[fbKey];
    if (fallbackTarget && fallbackTarget !== query && normalize(fallbackTarget) !== fbKey) {
      return answer(fallbackTarget);
    }

    if (isPhotoValidationQuery(query)) {
      setChatOptions('photoValidate_select', ['客人推薦照片', '新品陳列照片', '拜訪任務照片']);
      return packResult(formatAnswer({
        conclusion: '請問你想確認哪一種任務照片？',
        details: [],
        showFeedback: false,
        options: ['客人推薦照片', '新品陳列照片', '拜訪任務照片'],
        optionTopic: 'photoValidate_select',
      }), 'photoValidate');
    }

    if (isUnknownHowToAsk(query)) {
      return packResult(fallbackResponse(), 'fallback');
    }

    const depth = getAnswerDepth(query);
    const matched = matchKnowledge(query, depth);
    if (matched) {
      clearChatContext();
      const formatted = applyBriefLimit(matched.formatted, depth);
      return packResult(formatted, 'matched', {
        faqId: matched.faqId,
        category: matched.category,
      });
    }

    const amb = isAmbiguousOnly(query);
    if (amb) {
      return packResult(clarifyResponse(amb.prompt, amb.options, amb.topic), 'clarify');
    }

    const n = normalize(query);
    if (/任務|任务/.test(n) && n.length <= 6) {
      const a = AMBIGUOUS.任務;
      return packResult(clarifyResponse(a.prompt, a.options, a.topic), 'clarify');
    }
    if (/照片|相片|拍照/.test(n) && n.length <= 6) {
      const a = AMBIGUOUS.照片;
      return packResult(clarifyResponse(a.prompt, a.options, a.topic), 'clarify');
    }
    if (/抽獎|抽奖/.test(n) && n.length <= 6) {
      const a = AMBIGUOUS.抽獎;
      return packResult(clarifyResponse(a.prompt, a.options, a.topic), 'clarify');
    }
    if (/商品卡|禮券|礼券/.test(n) && n.length <= 8) {
      const a = AMBIGUOUS.商品卡;
      return packResult(clarifyResponse(a.prompt, a.options, a.topic), 'clarify');
    }
    if (/積分|分数|分數/.test(n) && n.length <= 6) {
      const a = AMBIGUOUS.積分;
      return packResult(clarifyResponse(a.prompt, a.options, a.topic), 'clarify');
    }
    if (/拜訪|拜访/.test(n) && n.length <= 6) {
      const a = AMBIGUOUS.拜訪;
      return packResult(clarifyResponse(a.prompt, a.options, a.topic), 'clarify');
    }
    if (/怎麼做|怎么做/.test(n) && n.length <= 8) {
      const a = AMBIGUOUS.怎麼做;
      return packResult(clarifyResponse(a.prompt, a.options, a.topic), 'clarify');
    }
    if (/怎麼拿|怎么拿/.test(n) && n.length <= 8) {
      const a = AMBIGUOUS.怎麼拿;
      return packResult(clarifyResponse(a.prompt, a.options, a.topic), 'clarify');
    }
    if (/規則|规则/.test(n) && n.length <= 6) {
      const a = AMBIGUOUS.規則;
      return packResult(clarifyResponse(a.prompt, a.options, a.topic), 'clarify');
    }
    if (/怎麼參加|怎么参加|如何參加/.test(n)) {
      const a = AMBIGUOUS.怎麼參加;
      return packResult(clarifyResponse(a.prompt, a.options, a.topic), 'clarify');
    }

    if (/你好|您好|嗨|哈囉|早安|午安|晚安/.test(query)) {
      return packResult(formatAnswer({
        conclusion: '歡迎使用 KMBA CLUB 活動小助手 👋',
        details: [
          '你可以直接用平常說話的方式提問。',
          '若問題較模糊，我會再詢問你想了解的項目。',
        ],
        suggestions: ['任務類型解說', '獎勵有哪些'],
      }), 'greeting');
    }

    return packResult(fallbackResponse(), 'fallback');
  }

  global.KB = {
    answer,
    handleFeedback,
    formatAnswer,
    clearChatContext,
    canShowDecemberReward,
    sanitizeVisibleAnswer,
    getAnswerDepth,
    APP_VERSION,
    CAMPAIGN_CONFIG,
    ACTIVITY_POINTS,
    INTERNAL_RANKING,
    _debug: { normalize, KNOWLEDGE, matchKnowledge, getChatContext, isTopicOnlyInput, resolveTopicClarifyId },
  };
})(window);
