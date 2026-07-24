# -*- coding: utf-8 -*-
"""KMBA Elite Program 2026 — knowledge base chat engine (ZH-TW / EN by query language)."""
from __future__ import annotations

import re
from dataclasses import dataclass
from pathlib import Path

KB_CANDIDATES = [
    Path(__file__).resolve().parent / "KMBA_CLUB_2026_MASTER_KNOWLEDGE_BASE_V1.0.md",
    Path(__file__).resolve().parent.parent / "KMBA_CLUB_2026_MASTER_KNOWLEDGE_BASE_V1.0.md",
]
KB_PATH = next((p for p in KB_CANDIDATES if p.exists()), KB_CANDIDATES[0])

FALLBACK = {
    "zh": "此問題目前需要由 KMBA 總部專人協助確認，請聯繫您的區域業務 🙏",
    "en": "This question requires confirmation from KMBA headquarters. Please contact your regional sales representative.",
}

FOOTER = {
    "zh": "如需進一步協助，請聯繫您的區域業務。",
    "en": "For further assistance, please contact your regional sales representative.",
}

QUICK_TOPICS = {
    "常態": "daily",
    "任務": "daily",
    "商品卡": "reward",
    "日常": "daily",
    "積分": "daily",
    "抽獎券": "daily",
    "ticket": "daily",
    "tickets": "daily",
    "拜訪": "visit",
    "visit": "visit",
    "跨店": "visit",
    "區域競賽": "regional",
    "北中南": "regional",
    "北區": "regional",
    "中區": "regional",
    "南區": "regional",
    "獎勵": "reward",
    "排行": "reward",
    "雙月": "reward",
    "双月": "reward",
    "raffle": "reward",
    "ranking": "reward",
    "line": "line",
    "客服": "persona",
    "你是誰": "persona",
    "who": "persona",
    "期間": "overview",
    "overview": "overview",
    "mission": "daily",
    "point": "daily",
    "不定時": "daily",
    "不定时": "daily",
    "提交時間": "daily",
    "回覆時間": "daily",
    "加分": "daily",
    "即時": "daily",
    "即时": "daily",
}

ANSWERS: dict[str, dict[str, list[str]]] = {
    "overview": {
        "zh": [
            "KMBA菁英計畫 2026 是 KT&G 大韓菸草針對全台 HORECA 夜間通路推出的年度會員經營計畫 ✨",
            "活動期間：2026 年 8 月～12 月",
            "從「單次實體活動」轉向「全年數位賦能」",
        ],
        "en": [
            "KMBA Elite Program 2026 is KT&G's annual member engagement program for Taiwan's HORECA night-trade channel.",
            "Program period: August – December 2026.",
        ],
    },
    "daily": {
        "zh": [
            "📋 常態任務（每月上限 300 分）",
            "",
            "⏱️ 日常任務以「提交／回覆時間」為加分項目，越早完成越有優勢",
            "📢 因此任務會不定時透過 LINE 官方帳號發布，請即時關注通知",
            "",
            "• 品牌隨堂考問券（Google）100 分 → 3 張抽獎券",
            "• 客人推薦照片（SurveyCake）100 分 → 1 張",
            "• 新品陳列照片（SurveyCake）100 分 → 2 張",
            "",
            "🎫 積分兌換：100 分→1 張｜200 分→2 張｜300 分以上→3 張",
            "※ 問券每店只取最高分；同分以提交時間較早者優先",
        ],
        "en": [
            "Regular missions (max 300 pts/month):",
            "Submission time is a bonus factor; missions released irregularly via LINE.",
            "Brand quiz 100 pts→3 tickets; recommendation photo 100→1; display photo 100→2.",
            "Points: 100→1 | 200→2 | 300+→3 tickets.",
        ],
    },
    "visit": {
        "zh": [
            "🤝 拜訪任務（社群交流）",
            "1. 拜訪 KMBA 簽約店 2. 與大韓菸草陳列架合照",
            "3. LINE 官方帳號上傳 4. 每月 20 日審核",
            "每拜訪 1 間店＝1 張抽獎券，每月上限 5 張，雙月上限 10 張。",
        ],
        "en": [
            "Visit mission: partner store → photo with display → LINE upload → reviewed on 20th.",
            "1 ticket per visit; max 5/month, 10 bimonthly.",
        ],
    },
    "regional": {
        "zh": [
            "📢 北中南區域競賽已取消，目前沒有區域排名競賽",
            "",
            "現僅保留「拜訪任務」：",
            "拜訪簽約店 → 陳列架合照 → LINE 上傳 → 每月 20 日審核",
            "每拜訪 1 間店＝1 張抽獎券（每月上限 5 張，雙月上限 10 張）",
        ],
        "en": [
            "The North/Central/South regional competition has been discontinued.",
            "Only visit missions remain: 1 ticket per visit, max 5/month, 10 bimonthly.",
        ],
    },
    "reward": {
        "zh": [
            "🎁 獎勵制度（V0723）",
            "• 每月排行商品卡：TOP 1–20 五百元｜21–40 兩百元｜41–100 一百元",
            "• 加碼抽獎券：3 張／2 張／1 張",
            "• 雙月抽：10 月 15×1,000 元｜12 月 15×2,000 元，抽完歸零",
            "• 當月至少完成 1 項任務才有領獎資格",
        ],
        "en": [
            "Monthly gift cards: TOP 1–20 NT$500 | 21–40 NT$200 | 41–100 NT$100",
            "Bi-monthly draw: Oct 15×NT$1,000 | Dec 15×NT$2,000; reset after each draw.",
        ],
    },
    "line": {
        "zh": [
            "💬 LINE 官方帳號：",
            "• 常態任務公告（不定時發布，請即時關注）",
            "• 提交／回覆時間為加分項目，任務一發布請盡快完成",
            "• SurveyCake 回傳、拜訪照片上傳",
            "圖文選單左：新品資訊｜右：線上智慧客服",
        ],
        "en": [
            "LINE: irregular mission alerts, submission links, visit uploads, AI FAQ chatbot.",
        ],
    },
    "persona": {
        "zh": [
            "您好，我是 KMBA菁英計畫官方智慧客服 👋",
            "我可以協助您了解常態任務、拜訪任務、抽獎券、商品卡與雙月抽獎。",
        ],
        "en": [
            "Hello! I'm the official AI assistant for the KMBA Elite Program.",
            "I can help with regular missions, visit missions, tickets, gift cards, and raffles.",
        ],
    },
}

GUARDRAIL = {
    "price": {
        "zh": "關於價格資訊，請洽詢您的區域業務，客服無法提供喔 🙏",
        "en": "For pricing information, please contact your regional sales representative.",
    },
    "legal": {
        "zh": "法規相關問題請洽 KMBA 總部或區域業務，客服無法提供法規判定。",
        "en": "For legal or regulatory questions, please contact KMBA headquarters or your regional sales representative.",
    },
}

SUGGESTIONS = [
    "本月有哪些日常任務？",
    "怎麼取得抽獎券？",
    "拜訪任務要怎麼完成？",
    "雙月抽獎什麼時候？",
    "LINE 官方帳號可以做什麼？",
]


def detect_language(text: str) -> str:
    """Return 'zh' or 'en' based on query content."""
    cjk = len(re.findall(r"[\u4e00-\u9fff]", text))
    latin = len(re.findall(r"[a-zA-Z]", text))
    if latin >= 8 and cjk <= 2:
        return "en"
    if latin > cjk * 2 and latin >= 4:
        return "en"
    en_greetings = ("hi", "hello", "hey", "good morning", "good afternoon")
    if text.strip().lower() in en_greetings:
        return "en"
    return "zh"


def format_reply(lines: list[str], lang: str) -> str:
    body = "\n".join(lines).strip()
    return f"{body}\n\n{FOOTER[lang]}"


@dataclass
class Section:
    title: str
    body: str
    keywords: set[str]


def tokenize(text: str) -> set[str]:
    text = text.lower()
    tokens = set(re.findall(r"[\u4e00-\u9fff]{1,8}|[a-zA-Z]{2,}", text))
    for i in range(len(text) - 1):
        ch = text[i]
        if "\u4e00" <= ch <= "\u9fff":
            tokens.add(ch)
            if i + 1 < len(text) and "\u4e00" <= text[i + 1] <= "\u9fff":
                tokens.add(ch + text[i + 1])
    return tokens


def parse_kb(path: Path) -> tuple[str, list[Section]]:
    raw = path.read_text(encoding="utf-8")
    parts = re.split(r"\n(?=#+ )", raw)
    sections: list[Section] = []
    for part in parts:
        part = part.strip()
        if not part:
            continue
        lines = part.splitlines()
        title = lines[0].lstrip("#").strip()
        body = "\n".join(lines[1:]).strip()
        if not body and title:
            body = title
        sections.append(Section(title=title, body=body, keywords=tokenize(title + " " + body)))
    return raw, sections


def is_regional_competition_query(query: str) -> bool:
    q = query.lower()
    patterns = (
        "區域競賽", "区域竞赛", "區域賽", "北中南", "北區", "中區", "南區", "冠軍區",
        "regional competition", "north central south",
    )
    return any(p in q for p in patterns)


class KnowledgeBase:
    def __init__(self, path: Path = KB_PATH) -> None:
        self.path = path
        self.raw, self.sections = parse_kb(path)

    def reload(self) -> None:
        self.raw, self.sections = parse_kb(self.path)

    def detect_topic(self, query: str) -> str | None:
        q = query.lower()
        for trigger, topic in QUICK_TOPICS.items():
            if trigger in q:
                return topic
        return None

    def guardrail_block(self, query: str, lang: str) -> str | None:
        q = query.lower()
        if any(k in q for k in ("售價", "批发", "批發", "價格", "price", "wholesale", "cost")):
            return format_reply([GUARDRAIL["price"][lang]], lang)
        if any(k in q for k in ("法令", "法規", "违法", "違法", "legal", "regulation", "law")):
            return format_reply([GUARDRAIL["legal"][lang]], lang)
        return None

    def score_section(self, query: str, section: Section) -> float:
        q_tokens = tokenize(query)
        if not q_tokens:
            return 0.0
        score = len(q_tokens & section.keywords) / max(1, len(q_tokens))
        q_lower = query.lower()
        if any(k in q_lower for k in section.title.lower().split() if len(k) > 2):
            score += 0.35
        topic = self.detect_topic(query)
        if topic:
            hints = {
                "daily": "daily mission",
                "visit": "visit mission",
                "regional": "regional",
                "reward": "reward",
                "line": "line",
                "persona": "persona",
                "overview": "overview",
            }
            if hints.get(topic, "") in section.title.lower():
                score += 0.55
        return score

    def topic_from_sections(self, sections: list[Section]) -> str:
        title = sections[0].title.lower()
        for key, hint in [
            ("daily", "daily"),
            ("visit", "visit"),
            ("regional", "regional"),
            ("reward", "reward"),
            ("line", "line"),
            ("persona", "persona"),
            ("overview", "overview"),
        ]:
            if hint in title or (key == "persona" and "ai" in title):
                return key
        return "overview"

    def reply_for_topic(self, topic: str, lang: str) -> str:
        if topic in ANSWERS:
            return format_reply(ANSWERS[topic][lang], lang)
        return format_reply([FALLBACK[lang]], lang)

    def answer(self, query: str) -> dict:
        query = (query or "").strip()
        lang = detect_language(query)

        if not query:
            return {"reply": format_reply(ANSWERS["persona"]["zh"], "zh"), "lang": "zh", "sources": []}

        blocked = self.guardrail_block(query, lang)
        if blocked:
            return {"reply": blocked, "lang": lang, "sources": ["Guardrail"]}

        greetings_zh = ("你好", "您好", "在嗎", "嗨")
        greetings_en = ("hi", "hello", "hey")
        q_lower = query.lower()
        if query in greetings_zh or q_lower in greetings_en:
            return {"reply": self.reply_for_topic("persona", lang), "lang": lang, "sources": ["AI Persona"]}

        if is_regional_competition_query(query):
            return {"reply": self.reply_for_topic("regional", lang), "lang": lang, "sources": ["regional"]}

        topic = self.detect_topic(query)
        if topic:
            return {"reply": self.reply_for_topic(topic, lang), "lang": lang, "sources": [topic]}

        ranked = sorted(
            ((self.score_section(query, s), s) for s in self.sections),
            key=lambda x: x[0],
            reverse=True,
        )
        if not ranked or ranked[0][0] < 0.12:
            return {"reply": format_reply([FALLBACK[lang]], lang), "lang": lang, "sources": []}

        topic = self.topic_from_sections([s for _, s in ranked[:2]])
        return {"reply": self.reply_for_topic(topic, lang), "lang": lang, "sources": [topic]}

    def get_suggestions(self) -> list[str]:
        return SUGGESTIONS


KB = KnowledgeBase()
