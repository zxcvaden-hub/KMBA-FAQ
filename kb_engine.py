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
    "任務": "daily",
    "日常": "daily",
    "積分": "daily",
    "抽獎券": "daily",
    "ticket": "daily",
    "tickets": "daily",
    "拜訪": "visit",
    "visit": "visit",
    "跨店": "visit",
    "區域": "regional",
    "北中南": "regional",
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
}

ANSWERS: dict[str, dict[str, list[str]]] = {
    "overview": {
        "zh": [
            "KMBA菁英計畫 2026 是 KT&G 大韓菸草針對全台 HORECA 夜間通路推出的年度會員經營計畫 ✨",
            "核心目標：提升寶亨新品曝光、建立新品教育、強化業務互動、建立主理人交流圈。",
        ],
        "en": [
            "KMBA Elite Program 2026 is KT&G's annual member engagement program for Taiwan's HORECA night-trade channel.",
            "Goals include product exposure, education, sales engagement, and building the owner community.",
        ],
    },
    "daily": {
        "zh": [
            "📋 日常任務（每月上限 1000 分）",
            "• 客人推薦紀錄（250 分）",
            "• 新品陳列照（250 分）",
            "• 新品 QA 挑戰（250 分）",
            "• 業務 QA 挑戰（250 分）",
            "",
            "🎫 抽獎券：500 分→1 張｜750 分→2 張｜1000 分→3 張（每月上限）",
        ],
        "en": [
            "Daily missions (max 1,000 points/month):",
            "• Customer recommendation (250 pts)",
            "• New product display photo (250 pts)",
            "• New product QA challenge (250 pts)",
            "• Sales rep QA challenge (250 pts)",
            "",
            "Raffle tickets: 500 pts→1 | 750 pts→2 | 1,000 pts→3 (monthly max)",
        ],
    },
    "visit": {
        "zh": [
            "🤝 拜訪任務流程：",
            "1. 拜訪其他 KMBA 簽約店",
            "2. 與寶亨／KT&G 陳列架合照（本人需入鏡）",
            "3. 透過 SurveyCake 上傳",
            "4. 每月固定審核，通過後發放抽獎券",
            "",
            "每拜訪 1 間店＝1 張抽獎券，每月上限 5 張。",
        ],
        "en": [
            "Visit mission steps:",
            "1. Visit another KMBA partner store",
            "2. Photo with Bohem/KT&G display (owner must appear)",
            "3. Upload via SurveyCake",
            "4. Monthly review; raffle ticket issued upon approval",
            "",
            "1 store visit = 1 ticket, max 5 tickets/month.",
        ],
    },
    "regional": {
        "zh": [
            "🏆 北中南區域競賽",
            "各區依「任務完成率」競賽，不比積分、不比進貨量。",
            "冠軍區域：所有符合資格店家額外獲得 1 張抽獎券。",
        ],
        "en": [
            "Regional challenge (North / Central / South):",
            "Regions compete by task completion rate—not points or purchase volume.",
            "Winning region: all eligible stores receive 1 extra raffle ticket.",
        ],
    },
    "reward": {
        "zh": [
            "🎁 獎勵制度",
            "• 每月排行：TOP 1–10 高額｜11–30 中額｜31–100 參與獎（超商禮券）",
            "• 雙月抽：8–9 月累積→10 月抽｜10–12 月累積→2027/1 抽，抽完歸零",
            "• 每次 15 位店家，每位 5,000 元超商禮券",
        ],
        "en": [
            "Reward system:",
            "• Monthly ranking: TOP 1–10 premium | 11–30 mid-tier | 31–100 participation vouchers",
            "• Bi-monthly raffle: Aug–Sep→Oct | Oct–Dec→Jan 2027; tickets reset after each draw",
            "• 15 winners per draw, NT$5,000 gift voucher each",
        ],
    },
    "line": {
        "zh": [
            "💬 LINE 官方帳號提供：",
            "• 每月任務公告、任務回傳",
            "• SurveyCake 與 Visit 回傳入口",
            "• AI 智慧客服、活動公告、抽獎資訊",
        ],
        "en": [
            "LINE Official Account provides:",
            "• Monthly mission announcements and submissions",
            "• SurveyCake and Visit mission uploads",
            "• AI assistant, event updates, and raffle information",
        ],
    },
    "persona": {
        "zh": [
            "您好，我是 KMBA菁英計畫官方智慧客服 👋",
            "我可以協助您了解日常任務、拜訪任務、抽獎券、區域競賽與雙月抽獎。",
            "請直接輸入問題，或點選下方快捷問題。",
        ],
        "en": [
            "Hello! I'm the official AI assistant for the KMBA Elite Program.",
            "I can help with daily missions, visit missions, raffle tickets, regional challenges, and bi-monthly raffles.",
            "Type your question or tap a quick prompt below.",
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
    "區域競賽怎麼算？",
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
