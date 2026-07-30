# KMBA CLUB 2026 — 活動小助手

KT&G 大韓菸草 **KMBA菁英計畫** 官方 FAQ 活動小助手（純前端靜態網站）。  
**目前版本：V.0734**

**線上版本：** [https://zxcvaden-hub.github.io/KMBA-FAQ/](https://zxcvaden-hub.github.io/KMBA-FAQ/)

---

## 技術架構與限制

- **純前端**：無後端 API、無資料庫、無會員登入
- **LINE OA**：未串接 Messaging API；任務回傳仍由使用者自行在 LINE 操作
- **不個人化**：不辨識店家身分，不顯示個人積分、抽獎券數或任務完成紀錄
- **使用者可見語言**：繁體中文
- **禁止出現在回答中的用語**：Google、SurveyCake、TOP、Passport、API、資料庫、後台等內部術語

---

## V0724 核心規格摘要

### 常態任務（每月上限 300 分）

- 任務**不定時**透過 LINE 官方帳號發布，**提交越早越好**
- 各任務完成可獲 **100 分**

| 任務 | 積分 |
|------|------|
| 品牌隨堂考 | 100 |
| 客人推薦照片 | 100 |
| 新品陳列照片 | 100 |

**積分兌換抽獎券（每月累積）：**

- 100 分 → 1 張
- 200 分 → 2 張
- 300 分以上 → 3 張

### 商品卡（統一超商商品卡，非禮券、非現金）

- 依每月積分排行發放，需當月完成至少 1 項任務
- **發放方式：** 由區域業務親送或直接發放給店家
- 排名依積分多寡與提交時間排序
- 第 1～20 名：500 元商品卡
- 第 21～40 名：200 元商品卡
- 第 41～100 名：100 元商品卡
- 第 101 名起：不在本次商品卡發放範圍

### 雙月抽獎（統一超商商品卡）

- 8–9 月累積 → 10 月抽（15位×1,000元商品卡），10/15 公布
- 10–11 月累積 → 12 月抽（15位×2,000元商品卡，雙倍加碼），12/15 公布  
  → **2026/10/01 以前**，小助手不主動顯示 12 月場資訊
- 每次抽完後，**抽獎券會重新計算**

**公平性機制（對外說法）：**

- 以台灣彩券開獎號碼作為種子，透過固定公式產生中獎名單
- 10 月場與 12 月場皆全程螢幕錄影，中獎名單於活動網頁公開公布
- 抽獎券依任務累積，券越多中獎機會越高；同一人最多中獎一次

### 拜訪任務

- 前往其他 KMBA 簽約店家拍照，LINE 上傳，每月 20 日審核
- 每完成一間店 → 1 張抽獎券（每月最多 5 間，每兩個月最多 10 間）
- 合作店家名單不會逐店推送，請向區域業務確認
- **無積分**，僅獲抽獎券

### 北中南區域競賽

- **已取消**；僅在使用者明確詢問區域競賽時說明

---

## V.0724 問答功能（十項改善）

| # | 功能 |
|---|------|
| 1 | **先結論、後說明**：明確問題第一句直接回答 |
| 2 | **模糊追問**：輸入「任務」「照片」等單詞時，先提供分類選項 |
| 3 | **多輪對話**：支援「第二個」「客人那個」等指代（sessionStorage，5 分鐘有效） |
| 4 | **猜你想問**：每則回答下方最多 3 個相關問題按鈕 |
| 5 | **照片文字檢查表**：客人推薦／新品陳列／拜訪任務的提交前確認清單 |
| 6 | **「這樣可以嗎」流程**：不判定未上傳照片，引導描述後依規則初步判斷 |
| 7 | **同義詞辨識**：禮券、摸彩券、訪店、陳列照等口語說法 |
| 8 | **回答深度**：簡短問題短答；含「完整」「規則」才給長文 |
| 9 | **歡迎訊息**：可點「熱門問題」快捷；底部保留雙月抽獎／獎勵／任務解說按鈕 |
| 10 | **日期控制＋敏感詞過濾**：統一 10/1 閘道；輸出前清除禁止用語 |

---

## 檔案結構

| 檔案／目錄 | 用途 |
|------------|------|
| `index.html` | 活動小助手聊天介面（手機優先） |
| `kb-engine.js` | 問答引擎（V.0734） |
| `kmba-logo.png` | LOGO 大頭貼 |
| `lucky/index.html` | 雙月抽獎工具頁（操作端／觀看端，非公開入口） |
| `lucky/lucky.js` | 抽獎邏輯（加權不放回、彩券種子、可驗證） |
| `lucky/banner.png` | 抽獎頁橫幅 |
| `KMBA_CLUB_2026_MASTER_KNOWLEDGE_BASE_V1.0.md` | 內部知識庫參考 |
| `google-apps-script-Code.gs` | Google Apps Script 原始碼（手動貼上部署，非 Pages 執行） |
| `generate-architecture-doc.py` | 產生架構 Word 文件 |

### 隱藏抽獎入口（chatbot 輸入）

| 指令 | 用途 |
|------|------|
| `luckydrawsetting` | 抽獎操作端 |
| `luckydrawlist` | 抽獎觀看端（`?view=1`） |

---

## 本地預覽

1. 開啟 `index.html`（建議用 Live Server 或本機靜態伺服器）
2. 以手機寬度（320～390px）測試按鈕點擊與「猜你想問」
3. 測試模糊詞「任務」「照片」是否出現追問選項

### 內部 Debug 模式（不公開給店家）

在網址後加 `?debug=1` 可開啟底部 debug 面板，顯示 Session ID、faqId、Sheet 寫入 payload：

```
https://zxcvaden-hub.github.io/KMBA-FAQ/?debug=1
```

因使用 `no-cors` 寫入，瀏覽器無法讀取 GAS 回應，請至 Google Sheet 確認是否寫入成功。

---

## 部署（GitHub Pages）

`main` 分支根目錄需包含：

- `index.html`
- `kb-engine.js`
- `kmba-logo.png`
- `lucky/` 資料夾（含 `index.html`、`lucky.js`、`banner.png`）

---

## 更新紀錄

| 版本 | 日期 | 說明 |
|------|------|------|
| **V.0734** | 2026/07/30 | 修正問題比對停用詞；商品卡發放文案（區域業務親送／直送店家）；`?debug=1` 除錯面板；lucky 頁更新錄影說明 |
| **V.0733** | 2026/07/30 | 修正 LINE 手機快捷按鈕無反應（pointerdown、按鈕常駐顯示） |
| **V.0732** | 2026/07/29 | 抽獎公平 FAQ 文案優化（客戶確認版）；清理本地殘留備份 |
| **V.0731** | 2026/07/29 | 抽獎公平 FAQ：台灣彩券種子、固定公式、10/12 月場全程螢幕錄影並公布 |
| V.0730 | 2026/07/29 | 依客服紀錄分析修補 FAQ：照片新品、15名以後、客人推薦定義、商品卡發放、拜訪店家通知、精準關鍵字匹配 |
| V.0729 | 2026/07/29 | UX：滾至回覆頂部、對話後隱藏 chips；「獎勵有哪些」直接完整回答；新增 photo_need_new_product、raffle_fairness、visit_partner_stores |
| V.0728 | 2026/07/28 | 新增「雙月抽獎獎項」FAQ；獎勵／抽獎規則回答附商品卡獎項摘要；歡迎頁「熱門問題」快捷；**客服聊天紀錄寫入 Google Sheet** |
| V.0724 | 2026/07/24 | 十項 FAQ 改善；活動小助手改版；抽獎頁改為商品卡規則；先結論後說明、多輪對話、猜你想問 |
| V.0723 | 2026/07/23 | 客戶確認版；去除平台名稱；V0723 任務／獎勵規格 |
| V1.1 | 2026/06 | 語意匹配、手機版 UI |

---

## 打包交付

桌面交付壓縮檔：`大韓菸草客服20260729-還原點.zip`（V.0732 完整還原點；線上最新為 V.0734）

---

## 客服紀錄後台

活動小助手會將每次問答（不含回饋訊息本身）寫入 Google Sheet **KMBA客服紀錄**，供內部追蹤與分析。

### Google Sheet 欄位（第一列標題）

| 欄 | 名稱 | 說明 |
|----|------|------|
| A | 時間 | 寫入當下時間 |
| B | Session ID | 同一分頁工作階段共用（`kmbaSessionId`） |
| C | 使用者問題 | 原始提問 |
| D | AI 回答摘要 | 先結論，最多 500 字 |
| E | 命中 FAQ | 知識項目 ID（如 `raffle_fairness`） |
| F | FAQ 類別 | topic（如 `raffleTicket`） |
| G | 是否已解決 | 初次空白；回饋後為 `YES` / `NO` |
| H | 裝置 | 如 `iPhone / Safari` |
| I | 版本 | 如 `V.0734` |
| J | 備註 | 含 `messageId=KMBA-MSG-...` |

### Web App URL（前端使用 `/exec`）

```
https://script.google.com/macros/s/AKfycbzjTNHPh1mtr7gANezaRj4WC5gTUu-Dm8KzXRtj0ObrlhmxTo_LN_bEnWVUSvwa1ND0GQ/exec
```

請使用 **`/exec`** 正式部署網址，不要使用 `/dev` 測試網址。

### Session ID 規則

- 儲存在 `sessionStorage`，key 為 `kmbaSessionId`
- 格式：`KMBA-{timestamp}-{random}`
- 同一瀏覽器分頁期間共用；新分頁可產生新 ID

### Message ID 與回饋更新

- 每次使用者提問產生唯一 `messageId`（格式 `KMBA-MSG-...`）
- 寫入 J 欄備註：`messageId=KMBA-MSG-...;intent=matched`
- **一個問題只新增一列**
- 點「有，已了解」→ 更新同一列 G 欄為 `YES`
- 點「還有其他問題」→ 更新同一列 G 欄為 `NO`（不新增第二筆）
- 回饋後顯示的分類選項**不會**再寫入新紀錄

### Google Apps Script

- 原始碼檔：`google-apps-script-Code.gs`
- 貼到 [Google Apps Script](https://script.google.com) 專案後，**重新部署** Web App 新版本
- 若修改 `Code.gs`，必須重新部署才會生效
- 工作表優先使用「工作表1」；若不存在則自動使用活頁簿第一個工作表

### 失敗處理

- 寫入或更新失敗**不影響**客服回答
- 一般使用者畫面**不顯示**任何錯誤
- 開發測試可在瀏覽器 console 查看 `[KMBA Log]`，或使用 `?debug=1` 開啟畫面 debug 面板

### 不記錄的項目

- 抽獎隱藏指令 `luckydrawsetting` / `luckydrawlist`
- 回饋按鈕觸發的後續訊息（`intent: feedback`）
- 歡迎畫面載入（尚未提問）

---

## V.0734 FAQ 知識庫摘要（38 項）

| faqId | 類別 | 說明 |
|-------|------|------|
| tasks_guide | tasks | 任務類型解說 |
| rewards_guide | giftCard | 獎勵有哪些（直接完整回答） |
| gift_card_earn | giftCard | 商品卡怎麼拿 |
| gift_card_delivery | giftCard | 商品卡發放（區域業務親送／直送店家） |
| gift_card_rank_after_15 | giftCard | 15 名以後商品卡面額 |
| gift_card_tiers | giftCard | 商品卡級距差別 |
| ranking_calc | giftCard | 每月排名計算 |
| ranking_tie | giftCard | 積分相同排名 |
| raffle_prizes | raffleTicket | 雙月抽獎獎項 |
| raffle_fairness | raffleTicket | 抽獎公平／機制／螢幕錄影 |
| raffle_100 / 200 / 300 | raffleTicket | 積分兌換抽獎券 |
| raffle_rules_full | raffleTicket | 完整抽獎規則 |
| raffle_reset | raffleTicket | 抽獎券重新計算 |
| visit_has_ticket | raffleTicket | 拜訪也有抽獎券 |
| visit_task | visitTask | 拜訪任務說明 |
| visit_partner_stores | visitTask | 合作店家／會通知嗎 |
| visit_points | visitTask | 拜訪有積分嗎 |
| visit_one_ticket | visitTask | 拜訪一間幾張券 |
| visit_max | visitTask | 每月最多拜訪幾間 |
| visit_photo_what | visitTask | 拜訪照片要拍什麼 |
| passport_alias | visitTask | Passport 用語導向 |
| customer_photo* | customerPhoto | 客人推薦照片規則 |
| photo_need_new_product | customerPhoto | 照片一定要有新品 |
| customer_photo_definition | customerPhoto | 客人推薦照片定義 |
| display_photo* | displayPhoto | 新品陳列照片規則 |
| quiz_task | tasks | 品牌隨堂考 |
| monthly_tasks | tasks | 每月有哪些任務 |

詳細架構請見同資料夾上層：`KMBA-CLUB-2026-資料庫與知識庫架構-V0732.docx`（架構文件；線上程式版本 V.0734）
