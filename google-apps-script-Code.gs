/**
 * KMBA CLUB 2026 客服聊天紀錄 — Google Apps Script
 * 貼到 script.google.com 專案後，重新部署 Web App（/exec）
 *
 * Spreadsheet: KMBA客服紀錄
 * ID: 1vnxyG4AFXVnfeWkIHVcBctTWWprjMXXmJEFEhEzgcN4
 */

const SPREADSHEET_ID = '1vnxyG4AFXVnfeWkIHVcBctTWWprjMXXmJEFEhEzgcN4';
const PREFERRED_SHEET_NAME = '工作表1';
const NOTE_COL = 10; // J
const SESSION_COL = 2; // B
const RESOLVED_COL = 7; // G

function doGet() {
  return jsonOutput({
    success: true,
    service: 'KMBA客服紀錄',
    version: 'V.0728',
  });
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
    const data = parseRequest(e);
    const sheet = getTargetSheet();

    if (data.action === 'update') {
      return updateLog(sheet, data);
    }

    return createLog(sheet, data);
  } catch (error) {
    return jsonOutput({
      success: false,
      error: String(error),
    });
  } finally {
    try {
      lock.releaseLock();
    } catch (ignore) {}
  }
}

function parseRequest(e) {
  if (!e) {
    throw new Error('Empty request');
  }

  let raw = '';
  if (e.postData && e.postData.contents) {
    raw = e.postData.contents;
  } else if (e.parameter && e.parameter.payload) {
    raw = e.parameter.payload;
  } else if (e.parameter && e.parameter.action) {
    return e.parameter;
  }

  raw = (raw || '').trim();
  if (!raw) {
    throw new Error('Empty body');
  }

  try {
    return JSON.parse(raw);
  } catch (parseError) {
    throw new Error('Invalid JSON body');
  }
}

function getTargetSheet() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = ss.getSheetByName(PREFERRED_SHEET_NAME);
  if (!sheet) {
    sheet = ss.getSheets()[0];
  }
  if (!sheet) {
    throw new Error('Target sheet not found');
  }
  return sheet;
}

function extractMessageId(noteText, explicitId) {
  if (explicitId) return String(explicitId).trim();
  const text = String(noteText || '');
  const match = text.match(/messageId=([^\s;]+)/i);
  return match ? match[1].trim() : '';
}

function findRowByMessageId(sheet, messageId, sessionId) {
  if (!messageId) return -1;

  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return -1;

  const notes = sheet.getRange(2, NOTE_COL, lastRow - 1, 1).getValues();
  const sessions = sheet.getRange(2, SESSION_COL, lastRow - 1, 1).getValues();
  const token = 'messageId=' + messageId;

  for (let i = notes.length - 1; i >= 0; i--) {
    const note = String(notes[i][0] || '');
    if (note.indexOf(token) === -1) continue;
    if (sessionId && String(sessions[i][0] || '') !== String(sessionId)) continue;
    return i + 2;
  }

  return -1;
}

function createLog(sheet, data) {
  const messageId = extractMessageId(data.note, data.messageId);
  if (!messageId) {
    return jsonOutput({
      success: false,
      error: 'Missing messageId',
    });
  }

  const existingRow = findRowByMessageId(sheet, messageId, data.sessionId || '');
  if (existingRow > 0) {
    return jsonOutput({
      success: true,
      action: 'create',
      duplicate: true,
      row: existingRow,
      messageId: messageId,
    });
  }

  const note = String(data.note || '').trim() || ('messageId=' + messageId);
  const row = [
    new Date(),
    String(data.sessionId || ''),
    String(data.question || ''),
    String(data.answer || ''),
    String(data.faqId || ''),
    String(data.category || ''),
    '',
    String(data.device || ''),
    String(data.version || ''),
    note,
  ];

  sheet.appendRow(row);

  return jsonOutput({
    success: true,
    action: 'create',
    messageId: messageId,
    row: sheet.getLastRow(),
  });
}

function updateLog(sheet, data) {
  const messageId = extractMessageId(data.note, data.messageId);
  const resolved = String(data.resolved || '').toUpperCase();

  if (!messageId) {
    return jsonOutput({
      success: false,
      error: 'Missing messageId',
    });
  }

  if (resolved !== 'YES' && resolved !== 'NO') {
    return jsonOutput({
      success: false,
      error: 'Invalid resolved value',
    });
  }

  const row = findRowByMessageId(sheet, messageId, data.sessionId || '');
  if (row < 1) {
    return jsonOutput({
      success: false,
      error: 'Message not found',
      messageId: messageId,
    });
  }

  sheet.getRange(row, RESOLVED_COL).setValue(resolved);

  return jsonOutput({
    success: true,
    action: 'update',
    messageId: messageId,
    row: row,
    resolved: resolved,
  });
}

function jsonOutput(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}
