/**
 * DDP 방명록 - 구글시트 백엔드 (Google Apps Script)
 *
 * 시트 "messages" 한 장에 한 줄 = 메시지 하나.
 *   id | createdAt | message | color | visible
 * - 새 글은 visible=TRUE 로 바로 공개된다.
 * - 숨기려면 시트에서 visible 칸의 체크를 끄면(FALSE) 다음 불러오기부터 사라진다.
 */

var SHEET_NAME = 'messages';
var HEADERS = ['id', 'createdAt', 'message', 'color', 'visible'];
var MAX_LEN = 100;           // 앱의 글자 수 제한과 같아야 한다
var COLORS = 3;              // 하트 색 종류 수
var MIN_INTERVAL_SEC = 3;    // 같은 방문자의 연속 등록 최소 간격
var LIST_CACHE_SEC = 5;      // 목록 캐시(동시 접속이 많아도 시트를 덜 읽게)
var DEDUPE_SEC = 6 * 60 * 60;
var MAX_ROWS = 5000;

/** 처음 한 번 직접 실행하면 시트와 머리글이 만들어진다(안 해도 첫 요청 때 자동 생성). */
function setup() {
  getSheet_();
}

function doGet() {
  return json_(listMessages_());
}

function doPost(e) {
  var body;
  try {
    body = JSON.parse(e.postData.contents);
  } catch (err) {
    return json_({ ok: false, error: 'bad_request' });
  }

  var message = typeof body.message === 'string' ? body.message.trim() : '';
  var requestId = String(body.requestId || '').slice(0, 64);
  var clientId = String(body.clientId || '').slice(0, 64);

  // 사람이 보지 못하는 입력칸이 채워져 있으면 자동 입력으로 보고 성공한 척 버린다.
  if (body.website) {
    return json_({ ok: true, message: fake_(message) });
  }
  if (!message) return json_({ ok: false, error: 'empty' });
  if (message.length > MAX_LEN) return json_({ ok: false, error: 'too_long' });

  var cache = CacheService.getScriptCache();

  // 같은 요청을 다시 보내도(네트워크 재시도) 한 번만 저장한다.
  if (requestId) {
    var prev = cache.get('req_' + requestId);
    if (prev) return json_({ ok: true, message: JSON.parse(prev), duplicate: true });
  }
  if (clientId && cache.get('rate_' + clientId)) {
    return json_({ ok: false, error: 'too_fast' });
  }

  var lock = LockService.getScriptLock();
  if (!lock.tryLock(8000)) return json_({ ok: false, error: 'busy' });

  try {
    var sheet = getSheet_();
    var row = sheet.getLastRow() + 1;
    var saved = {
      id: Utilities.getUuid(),
      createdAt: new Date().toISOString(),
      message: message,
      color: Math.floor(Math.random() * COLORS)
    };

    // 글자 서식으로 쓴다: "=1+1" 같은 글이 수식으로 실행되는 것을 막는다.
    sheet.getRange(row, 1, 1, 3).setNumberFormat('@');
    sheet.getRange(row, 1, 1, 5).setValues([[saved.id, saved.createdAt, saved.message, saved.color, true]]);
    sheet.getRange(row, 5).insertCheckboxes().check();

    cache.remove('list');
    if (clientId) cache.put('rate_' + clientId, '1', MIN_INTERVAL_SEC);
    if (requestId) cache.put('req_' + requestId, JSON.stringify(saved), DEDUPE_SEC);
    return json_({ ok: true, message: saved });
  } finally {
    lock.releaseLock();
  }
}

function listMessages_() {
  var cache = CacheService.getScriptCache();
  var cached = cache.get('list');
  if (cached) return JSON.parse(cached);

  var sheet = getSheet_();
  var last = sheet.getLastRow();
  var out = [];
  if (last >= 2) {
    var start = Math.max(2, last - MAX_ROWS + 1);
    var values = sheet.getRange(start, 1, last - start + 1, 5).getValues();
    for (var i = 0; i < values.length; i++) {
      var r = values[i];
      if (!r[0] || isHidden_(r[4])) continue;
      out.push({
        id: String(r[0]),
        createdAt: String(r[1]),
        message: String(r[2]),
        color: Number(r[3]) || 0
      });
    }
  }

  var result = { ok: true, messages: out };
  try {
    cache.put('list', JSON.stringify(result), LIST_CACHE_SEC);
  } catch (err) {
    // 캐시 한도(100KB)를 넘으면 캐시 없이 응답한다.
  }
  return result;
}

function isHidden_(v) {
  if (v === false) return true;
  var s = String(v).trim().toUpperCase();
  return s === 'FALSE' || s === 'N' || s === 'NO' || s === '0' || s === '숨김' || s === 'HIDE';
}

function getSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }
  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function fake_(message) {
  return {
    id: Utilities.getUuid(),
    createdAt: new Date().toISOString(),
    message: message,
    color: 0
  };
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
