/* KMBA Elite Program 2026 — public verifiable raffle (static, offline) */
(function () {
  'use strict';

  const $ = (id) => document.getElementById(id);

  // Prize awarded to every winner (all 15 are equal).
  const PRIZE = '價值新台幣 $5,000 元超商禮券';

  // Where the operator's latest official draw is stored (for viewer mode replay).
  const STORE_KEY = 'kmba_raffle_last';
  // Viewer mode: entered via the chatbot back door (?view=1). Watch only, no upload.
  const VIEW_MODE = new URLSearchParams(location.search).get('view') === '1';

  const els = {
    participants: $('participants'),
    csvFile: $('csvFile'),
    fileName: $('fileName'),
    mapBox: $('mapBox'),
    colName: $('colName'),
    colStore: $('colStore'),
    colRegion: $('colRegion'),
    colTickets: $('colTickets'),
    dupMode: $('dupMode'),
    fuzzyMerge: $('fuzzyMerge'),
    preview: $('preview'),
    btnDownloadList: $('btnDownloadList'),
    stepImport: $('stepImport'),
    stepSeed: $('stepSeed'),
    drawTitle: $('drawTitle'),
    drawHint: $('drawHint'),
    btnPlay: $('btnPlay'),
    btnParse: $('btnParse'),
    btnSample: $('btnSample'),
    parseErr: $('parseErr'),
    parseStat: $('parseStat'),
    cntPeople: $('cntPeople'),
    cntTickets: $('cntTickets'),
    listHash: $('listHash'),
    seed: $('seed'),
    numWinners: $('numWinners'),
    btnDraw: $('btnDraw'),
    drawInfo: $('drawInfo'),
    results: $('results'),
    winnerList: $('winnerList'),
    winCount: $('winCount'),
    vHash: $('vHash'),
    vSeed: $('vSeed'),
    vTime: $('vTime'),
    btnDownload: $('btnDownload'),
    btnCopy: $('btnCopy'),
    btnExportView: $('btnExportView'),
    exportHint: $('exportHint'),
  };

  // Holds the last successfully parsed + hashed list.
  let state = {
    people: [],
    snapshot: '',
    hash: '',
    csv: null, // { headers: string[], rows: string[][] } when a CSV is loaded
    lastResult: null,
  };

  // ---- Parsing -------------------------------------------------------------

  function parseParticipants(raw) {
    const people = [];
    const errors = [];
    const lines = (raw || '').split(/\r?\n/);
    lines.forEach((line, idx) => {
      const text = line.trim();
      if (!text) return;
      // Split on comma / tab / 2+ spaces; the LAST field is the ticket count.
      const parts = text.split(/\s*[,\t]\s*|\s{2,}|\s+(?=\d+$)/).filter((p) => p !== '');
      if (parts.length < 2) {
        errors.push(`第 ${idx + 1} 行格式錯誤：「${text}」（需有「姓名 + 券數」）`);
        return;
      }
      const ticketRaw = parts[parts.length - 1];
      const name = parts.slice(0, -1).join(' ').trim();
      const tickets = Number(ticketRaw);
      if (!name) {
        errors.push(`第 ${idx + 1} 行缺少姓名：「${text}」`);
        return;
      }
      if (!Number.isInteger(tickets) || tickets <= 0) {
        errors.push(`第 ${idx + 1} 行券數無效：「${ticketRaw}」（需為正整數）`);
        return;
      }
      people.push({ name, tickets });
    });
    return { people, errors };
  }

  // Canonical snapshot text: defines the exact, order-locked list that is hashed.
  function canonicalize(people) {
    return people.map((p, i) => `${i + 1}\t${p.name}\t${p.tickets}`).join('\n');
  }

  // ---- CSV import ----------------------------------------------------------

  // Decode bytes as UTF-8; fall back to Big5 if replacement chars appear (Excel exports).
  function decodeBuffer(buf) {
    let text = new TextDecoder('utf-8').decode(buf);
    if (text.includes('\uFFFD')) {
      try {
        const big5 = new TextDecoder('big5').decode(buf);
        if (!big5.includes('\uFFFD')) text = big5;
      } catch (e) { /* big5 not supported; keep utf-8 */ }
    }
    return text;
  }

  // Minimal RFC-4180 CSV parser: handles quoted fields, escaped quotes, CRLF.
  function parseCSV(text) {
    text = text.replace(/^\uFEFF/, '');
    const rows = [];
    let field = '';
    let row = [];
    let inQuotes = false;
    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      if (inQuotes) {
        if (c === '"') {
          if (text[i + 1] === '"') { field += '"'; i++; }
          else inQuotes = false;
        } else { field += c; }
      } else if (c === '"') {
        inQuotes = true;
      } else if (c === ',') {
        row.push(field); field = '';
      } else if (c === '\n') {
        row.push(field); rows.push(row); row = []; field = '';
      } else if (c !== '\r') {
        field += c;
      }
    }
    if (field.length || row.length) { row.push(field); rows.push(row); }
    return rows.filter((r) => !(r.length === 1 && r[0].trim() === ''));
  }

  function detectColumn(headers, patterns, fallback) {
    for (const re of patterns) {
      const idx = headers.findIndex((h) => re.test(h));
      if (idx >= 0) return idx;
    }
    return fallback;
  }

  function fillColumnSelects(headers) {
    const optionsHtml = headers
      .map((h, i) => `<option value="${i}">${(h || '(空白欄)').replace(/</g, '&lt;')}</option>`)
      .join('');

    els.colName.innerHTML = optionsHtml;
    els.colTickets.innerHTML = optionsHtml;
    els.colStore.innerHTML = '<option value="-1">（不使用）</option>' + optionsHtml;
    els.colRegion.innerHTML = '<option value="-1">（不使用）</option>' + optionsHtml;

    const nameIdx = detectColumn(headers, [/姓名/, /name/i], 0);
    const storeIdx = detectColumn(headers, [/店別/, /店名/, /店/], -1);
    const regionIdx = detectColumn(headers, [/區域/, /地區/, /region/i], -1);
    const ticketIdx = detectColumn(headers, [/總計/, /抽獎券/, /券/], headers.length - 1);

    els.colName.value = String(nameIdx);
    els.colStore.value = String(storeIdx);
    els.colRegion.value = String(regionIdx);
    els.colTickets.value = String(ticketIdx);
  }

  // Lower-case + strip all whitespace, for smarter duplicate matching.
  function mergeKey(text) {
    return text.toLowerCase().replace(/\s+/g, '');
  }

  // Build participants from the loaded CSV using the chosen columns + duplicate policy.
  function buildFromCSV() {
    const ni = parseInt(els.colName.value, 10);
    const si = parseInt(els.colStore.value, 10);
    const ri = parseInt(els.colRegion.value, 10);
    const ti = parseInt(els.colTickets.value, 10);
    const mode = els.dupMode.value;
    const fuzzy = els.fuzzyMerge.checked;

    const order = [];
    const map = new Map();
    let skipped = 0;

    state.csv.rows.forEach((row) => {
      const name = (row[ni] || '').trim();
      const store = si >= 0 ? (row[si] || '').trim() : '';
      const region = ri >= 0 ? (row[ri] || '').trim() : '';
      const tickets = parseInt((row[ti] || '').trim(), 10);
      if (!name || !Number.isInteger(tickets) || tickets <= 0) {
        skipped++;
        return;
      }
      const display = store ? `${store}／${name}` : name;
      const kName = fuzzy ? mergeKey(name) : name;
      const kStore = fuzzy ? mergeKey(store) : store;
      let key;
      if (mode === 'name') key = `n:${kName}`;
      else if (mode === 'namestore') key = `ns:${kName}\u0001${kStore}`;
      else key = `row:${order.length}`; // each row is its own entry

      if (map.has(key)) {
        map.get(key).tickets += tickets;
      } else {
        const entry = { name: display, tickets, region };
        map.set(key, entry);
        order.push(entry);
      }
    });

    return { people: order, skipped };
  }

  // ---- Crypto / deterministic randomness -----------------------------------

  async function sha256Hex(text) {
    const data = new TextEncoder().encode(text);
    const buf = await crypto.subtle.digest('SHA-256', data);
    return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
  }

  // Map a string deterministically to a float in [0, 1) using 52 bits of its SHA-256.
  async function hashToUnitFloat(text) {
    const hex = await sha256Hex(text);
    const slice = hex.slice(0, 13); // 52 bits
    const intVal = parseInt(slice, 16);
    return intVal / Math.pow(2, 52);
  }

  // Efraimidis–Spirakis weighted sampling WITHOUT replacement:
  // key_i = u_i^(1/weight_i); pick the largest keys. Fully deterministic per (seed, person).
  async function drawWinners(people, seed, count) {
    const keyed = [];
    for (let i = 0; i < people.length; i++) {
      const p = people[i];
      const u = await hashToUnitFloat(`${seed}|${i + 1}|${p.name}|${p.tickets}`);
      // u in [0,1); guard against log/pow edge at exactly 0.
      const safeU = u <= 0 ? Number.MIN_VALUE : u;
      const key = Math.pow(safeU, 1 / p.tickets);
      keyed.push({ index: i, name: p.name, tickets: p.tickets, region: p.region || '', key });
    }
    keyed.sort((a, b) => (b.key - a.key) || (a.index - b.index));
    return keyed.slice(0, Math.min(count, keyed.length));
  }

  // ---- UI helpers ----------------------------------------------------------

  function showAlert(el, msg, kind) {
    el.textContent = msg;
    el.className = `alert ${kind} show`;
  }
  function hideAlert(el) {
    el.className = el.className.replace(' show', '');
  }

  function setDrawEnabled() {
    els.btnDraw.disabled = !(state.people.length > 0 && state.hash);
  }

  // ---- Actions -------------------------------------------------------------

  async function handleParse() {
    hideAlert(els.parseErr);

    let people = [];
    let errors = [];
    if (state.csv) {
      const r = buildFromCSV();
      people = r.people;
      if (r.skipped) errors.push(`已略過 ${r.skipped} 筆資料（缺姓名或券數非正整數）。`);
    } else {
      const r = parseParticipants(els.participants.value);
      people = r.people;
      errors = r.errors;
    }

    if (errors.length) {
      showAlert(els.parseErr, errors.join('\n'), 'err');
    }
    if (!people.length) {
      els.parseStat.style.display = 'none';
      state = { people: [], snapshot: '', hash: '', csv: state.csv, lastResult: null };
      setDrawEnabled();
      return;
    }

    const snapshot = canonicalize(people);
    const hash = await sha256Hex(snapshot);
    const totalTickets = people.reduce((s, p) => s + p.tickets, 0);

    state = { people, snapshot, hash, csv: state.csv, lastResult: null };

    els.cntPeople.textContent = String(people.length);
    els.cntTickets.textContent = String(totalTickets);
    els.listHash.textContent = hash;
    renderPreview(people);
    els.parseStat.style.display = 'block';
    els.results.className = 'results';
    setDrawEnabled();
  }

  function renderPreview(people) {
    els.preview.innerHTML = '';
    const sorted = people.slice().sort((a, b) => b.tickets - a.tickets);
    sorted.forEach((p) => {
      const row = document.createElement('div');
      row.className = 'prow';
      const name = document.createElement('span');
      name.className = 'pname';
      name.textContent = p.name;
      const tix = document.createElement('span');
      tix.className = 'ptix';
      tix.textContent = `${p.tickets} 張`;
      row.appendChild(name);
      row.appendChild(tix);
      els.preview.appendChild(row);
    });
  }

  function handleDownloadList() {
    if (!state.people.length || !state.hash) return;
    const rows = [['序號', '區域', '參加者', '抽獎券數']];
    state.people.forEach((p, i) => rows.push([i + 1, p.region || '', p.name, p.tickets]));
    rows.push([]);
    rows.push(['參加人數', state.people.length]);
    rows.push(['抽獎券總數', state.people.reduce((s, p) => s + p.tickets, 0)]);
    rows.push(['名單快照(SHA-256)', state.hash]);
    rows.push(['產生時間', new Date().toLocaleString('zh-TW', { hour12: false })]);
    const csv = '\uFEFF' + rows.map((r) => r.map(csvEscape).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `抽獎名單存證_${state.hash.slice(0, 8)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // Viewer mode: hide all operator controls; expose only a "watch" button.
  function setupViewMode() {
    if (els.stepImport) els.stepImport.style.display = 'none';
    if (els.stepSeed) els.stepSeed.style.display = 'none';
    if (els.btnDraw) els.btnDraw.style.display = 'none';
    if (els.btnPlay) els.btnPlay.style.display = 'block';
    if (els.btnExportView) els.btnExportView.style.display = 'none';
    if (els.drawTitle) els.drawTitle.innerHTML = '<span class="step-no">★</span>幸運星開獎';
    if (els.drawHint) els.drawHint.textContent = '點擊下方按鈕，觀看本次開獎動畫與中獎名單。';
  }

  async function loadPublishedResult() {
    // 1) Prefer result.json published in this folder → works on any device.
    try {
      const res = await fetch('result.json', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (data && data.winners && data.winners.length) return data;
      }
    } catch (e) { /* no file / offline → fall through */ }
    // 2) Fallback: result saved on this same device/browser.
    try {
      const saved = JSON.parse(localStorage.getItem(STORE_KEY) || 'null');
      if (saved && saved.winners && saved.winners.length) return saved;
    } catch (e) { /* ignore */ }
    return null;
  }

  async function handlePlay() {
    hideAlert(els.drawInfo);
    els.btnPlay.disabled = true;
    const result = await loadPublishedResult();
    els.btnPlay.disabled = false;
    if (!result) {
      showAlert(els.drawInfo, '目前尚無已公布的開獎結果，請洽主辦單位 🙏', 'err');
      return;
    }
    state.lastResult = result;
    renderResults(result);
    confetti.launch();
  }

  function handleExportView() {
    if (!state.lastResult) return;
    const r = state.lastResult;
    const payload = {
      winners: r.winners.map((w) => ({ name: w.name, tickets: w.tickets, region: w.region || '' })),
      seed: r.seed,
      hash: r.hash,
      drawnAt: r.drawnAt,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'result.json';
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleCsvFile(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    hideAlert(els.parseErr);
    try {
      const buf = await file.arrayBuffer();
      const rows = parseCSV(decodeBuffer(buf));
      if (rows.length < 2) {
        showAlert(els.parseErr, 'CSV 內容不足（需要標題列＋至少一筆資料）。', 'err');
        return;
      }
      state.csv = { headers: rows[0], rows: rows.slice(1) };
      fillColumnSelects(rows[0]);
      els.mapBox.style.display = 'block';
      els.fileName.textContent = `${file.name}（${rows.length - 1} 筆）`;
    } catch (err) {
      showAlert(els.parseErr, '讀取 CSV 失敗，請確認檔案格式。', 'err');
    }
  }

  async function handleDraw() {
    hideAlert(els.drawInfo);
    const seed = els.seed.value.trim();
    const count = parseInt(els.numWinners.value, 10);

    if (!state.people.length || !state.hash) {
      showAlert(els.drawInfo, '請先於步驟 1 解析名單並產生快照。', 'err');
      return;
    }
    if (!seed) {
      showAlert(els.drawInfo, '請於步驟 2 輸入公開種子（建議使用彩券號碼）。', 'err');
      return;
    }
    if (!Number.isInteger(count) || count <= 0) {
      showAlert(els.drawInfo, '得獎人數需為正整數。', 'err');
      return;
    }

    els.btnDraw.disabled = true;
    els.btnDraw.textContent = '抽選中…';

    const winners = await drawWinners(state.people, seed, count);
    const drawnAt = new Date().toLocaleString('zh-TW', { hour12: false });

    state.lastResult = { winners, seed, hash: state.hash, drawnAt };
    renderResults(state.lastResult);
    confetti.launch();

    // Save the official result so viewer mode (chatbot back door) can replay it.
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify({
        winners: winners.map((w) => ({ name: w.name, tickets: w.tickets, region: w.region || '' })),
        seed: seed,
        hash: state.hash,
        drawnAt: drawnAt,
      }));
    } catch (e) { /* storage unavailable */ }

    els.btnDraw.disabled = false;
    els.btnDraw.textContent = '🎲 重新開獎（相同名單＋種子結果不變）';

    if (winners.length < count) {
      showAlert(els.drawInfo, `名單僅 ${winners.length} 位，少於設定人數 ${count}，已全部入選。`, 'info');
    }
  }

  function renderResults(result) {
    if (els.winCount) els.winCount.textContent = String(result.winners.length);
    els.winnerList.innerHTML = '';
    result.winners.forEach((w, i) => {
      const rank = i + 1;
      const row = document.createElement('div');
      row.className = 'winner';
      row.style.animationDelay = `${i * 0.04}s`;
      const regionTag = w.region ? `<span class="rtag"></span>` : '';
      row.innerHTML =
        `<div class="rank">${rank}</div>` +
        `<div class="winfo"><div class="nameline"><span class="name"></span>${regionTag}</div>` +
        `<div class="meta">🥇 中獎・持有 ${w.tickets} 張抽獎券</div></div>`;
      row.querySelector('.name').textContent = w.name;
      if (w.region) row.querySelector('.rtag').textContent = w.region;
      els.winnerList.appendChild(row);
    });
    els.vHash.textContent = result.hash;
    els.vSeed.textContent = result.seed;
    els.vTime.textContent = result.drawnAt;
    if (els.exportHint && !VIEW_MODE) els.exportHint.style.display = 'block';
    els.results.className = 'results show';
    els.results.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function csvEscape(v) {
    const s = String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  }

  function handleDownload() {
    if (!state.lastResult) return;
    const r = state.lastResult;
    const rows = [['序號', '區域', '中獎者', '抽獎券數', '獎項']];
    r.winners.forEach((w, i) => rows.push([i + 1, w.region || '', w.name, w.tickets, PRIZE]));
    rows.push([]);
    rows.push(['獎項', `每位中獎者 ${PRIZE}`]);
    rows.push(['名單快照(SHA-256)', r.hash]);
    rows.push(['公開種子', r.seed]);
    rows.push(['開獎時間', r.drawnAt]);
    const csv = '\uFEFF' + rows.map((row) => row.map(csvEscape).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `KMBA抽獎結果_${r.hash.slice(0, 8)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleCopy() {
    if (!state.lastResult) return;
    const r = state.lastResult;
    const lines = [
      'KMBA菁英計畫 2026 公開抽獎結果',
      `開獎時間：${r.drawnAt}`,
      `獎項：每位中獎者 ${PRIZE}`,
      `名單快照(SHA-256)：${r.hash}`,
      `公開種子：${r.seed}`,
      '',
      `中獎名單（共 ${r.winners.length} 位）：`,
    ];
    r.winners.forEach((w, i) => {
      const reg = w.region ? `［${w.region}］` : '';
      lines.push(`${i + 1}. ${reg}${w.name}（${w.tickets} 張）`);
    });
    lines.push('', '※ 以相同名單與種子於本工具重跑，結果完全相同，歡迎驗證。');
    const text = lines.join('\n');
    navigator.clipboard.writeText(text).then(
      () => showAlert(els.drawInfo, '已複製公告文字到剪貼簿。', 'info'),
      () => showAlert(els.drawInfo, '複製失敗，請手動選取。', 'err')
    );
  }

  function loadSample() {
    els.participants.value = [
      '大韓夜店,18',
      '寶亨小酒館,15',
      '城市Lounge,12',
      '深夜食堂,11',
      '微醺Bar,9',
      '街角居酒屋,8',
      '王小明,7',
      '陳大華,6',
      '林美麗,5',
      '夜貓Pub,5',
      '海邊小屋,4',
      '老地方,3',
      '巷弄咖啡酒,3',
      '頂樓酒吧,2',
      '初衷Bistro,2',
      '小確幸,1',
      '燈塔Bar,1',
      '南國風情,1',
    ].join('\n');
    els.seed.value = '2026-10-15 威力彩 05-12-18-23-30-37-08';
    // Switch back to manual mode: clear any loaded CSV.
    state.csv = null;
    els.csvFile.value = '';
    els.mapBox.style.display = 'none';
    els.fileName.textContent = '尚未選擇檔案';
  }

  // ---- Gold confetti / star shower -----------------------------------------

  const confetti = (function () {
    const canvas = document.getElementById('confetti');
    if (!canvas) return { launch: function () {} };
    const ctx = canvas.getContext('2d');
    const GOLD = ['#F6D77A', '#E8B53A', '#C8962A', '#FFF3C4', '#B9831E', '#FFD86B'];
    let particles = [];
    let raf = null;
    let last = 0;
    let spawnUntil = 0; // keep showering until this timestamp
    let lastSpawn = 0;
    const DURATION = 10000; // 10 seconds of continuous shower

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resize);

    function drawStar(x, y, r, rot) {
      ctx.beginPath();
      for (let i = 0; i < 5; i++) {
        const a = rot + (i * Math.PI * 2) / 5 - Math.PI / 2;
        ctx.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r);
        const b = a + Math.PI / 5;
        ctx.lineTo(x + Math.cos(b) * r * 0.45, y + Math.sin(b) * r * 0.45);
      }
      ctx.closePath();
      ctx.fill();
    }

    function spawn(count) {
      const W = canvas.width;
      const H = canvas.height;
      for (let i = 0; i < count; i++) {
        const isStar = Math.random() < 0.45;
        particles.push({
          type: isStar ? 'star' : 'ribbon',
          x: Math.random() * W,
          y: -20 - Math.random() * H * 0.6, // stagger entry from above
          vx: (Math.random() - 0.5) * 1.4,
          vy: 2 + Math.random() * 3.2,
          g: 0.04 + Math.random() * 0.05,
          size: isStar ? 6 + Math.random() * 8 : 5 + Math.random() * 6,
          h: 8 + Math.random() * 10,
          color: GOLD[(Math.random() * GOLD.length) | 0],
          rot: Math.random() * Math.PI * 2,
          vrot: (Math.random() - 0.5) * 0.3,
          sway: 0.6 + Math.random() * 1.2,
          swayp: Math.random() * Math.PI * 2,
          life: 0,
          max: 240 + Math.random() * 120,
        });
      }
    }

    function frame(ts) {
      if (!last) last = ts;
      last = ts;
      const H = canvas.height;

      // Keep spawning small batches while within the duration window.
      if (ts < spawnUntil && ts - lastSpawn > 150) {
        spawn(16);
        lastSpawn = ts;
      }

      ctx.clearRect(0, 0, canvas.width, H);

      particles.forEach((p) => {
        p.life++;
        p.vy += p.g;
        p.swayp += 0.05;
        p.x += p.vx + Math.sin(p.swayp) * p.sway;
        p.y += p.vy;
        p.rot += p.vrot;

        const fade = p.life > p.max - 40 ? Math.max(0, (p.max - p.life) / 40) : 1;
        ctx.globalAlpha = fade;
        ctx.fillStyle = p.color;

        if (p.type === 'star') {
          drawStar(p.x, p.y, p.size, p.rot);
        } else {
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rot);
          // flutter: vary height with rotation for a 3D ribbon feel
          ctx.scale(1, Math.max(0.3, Math.abs(Math.cos(p.swayp))));
          ctx.fillRect(-p.size / 2, -p.h / 2, p.size, p.h);
          ctx.restore();
        }
      });
      ctx.globalAlpha = 1;

      particles = particles.filter((p) => p.y < H + 40 && p.life < p.max);

      if (particles.length || ts < spawnUntil) {
        raf = requestAnimationFrame(frame);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        raf = null;
        last = 0;
      }
    }

    function launch() {
      resize();
      spawnUntil = performance.now() + DURATION;
      lastSpawn = 0;
      spawn(90); // initial burst
      if (!raf) raf = requestAnimationFrame(frame);
    }

    return { launch: launch };
  })();

  els.btnParse.addEventListener('click', handleParse);
  els.btnSample.addEventListener('click', loadSample);
  els.csvFile.addEventListener('change', handleCsvFile);
  els.btnDownloadList.addEventListener('click', handleDownloadList);
  els.btnDraw.addEventListener('click', handleDraw);
  els.btnDownload.addEventListener('click', handleDownload);
  els.btnCopy.addEventListener('click', handleCopy);
  if (els.btnExportView) els.btnExportView.addEventListener('click', handleExportView);
  if (els.btnPlay) els.btnPlay.addEventListener('click', handlePlay);

  if (VIEW_MODE) setupViewMode();
})();
