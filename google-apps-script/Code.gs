/**
 * ==============================================================================
 * Diary AI Sentiment Analyzer - Google Apps Script (GAS) CRUD API
 * Spreadsheet ID: 1l9tXmOsv1TX9FBbBdmZ5zUkeiTuBpQK3bqH8lbTwXhw
 * Columns: timestamp | datetime | content
 * ==============================================================================
 */

// 1. 스프레드시트 설정
const SPREADSHEET_ID = "1l9tXmOsv1TX9FBbBdmZ5zUkeiTuBpQK3bqH8lbTwXhw";
const SHEET_NAME = "Sheet1"; // 시트 이름 (필요 시 수정 가능, 기본 첫 번째 시트 사용)
const HEADERS = ["timestamp", "datetime", "content"];

/**
 * 활성 시트 객체 반환 및 헤더 자동 초기화
 */
function getSheet() {
  let ss;
  try {
    ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  } catch (e) {
    ss = SpreadsheetApp.getActiveSpreadsheet();
  }

  let sheet = ss.getSheetByName(SHEET_NAME) || ss.getSheets()[0];

  // 헤더가 없으면 1행에 헤더 자동 생성
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight("bold").setBackground("#EEF2FF");
  } else {
    // 1행의 첫 셀이 비어있거나 불일치할 경우 헤더 점검
    const currentHeaders = sheet.getRange(1, 1, 1, HEADERS.length).getValues()[0];
    if (String(currentHeaders[0]).toLowerCase() !== HEADERS[0]) {
      sheet.insertRowBefore(1);
      sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]).setFontWeight("bold").setBackground("#EEF2FF");
    }
  }

  return sheet;
}

/**
 * 초기 시트 설정 함수 (Apps Script 편집기에서 직접 실행 가능)
 */
function setupSheet() {
  const sheet = getSheet();
  Logger.log("시트 연결 및 헤더 설정이 완료되었습니다: " + sheet.getName());
}

/**
 * JSON 응답 생성 유틸리티
 */
function createJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * -----------------------------------------------------------------------------
 * GET 요청 핸들러 (조회 및 헬스체크)
 * 예: 
 * - 전체 목록 조회: ?action=read
 * - 단일 항목 조회: ?action=read&timestamp=1710000000000
 * -----------------------------------------------------------------------------
 */
function doGet(e) {
  try {
    const params = e ? e.parameter : {};
    const action = params.action || "read";

    if (action === "read" || action === "list") {
      const timestamp = params.timestamp;
      const result = handleRead(timestamp);
      return createJsonResponse({ success: true, ...result });
    }

    return createJsonResponse({
      success: false,
      error: "지원하지 않는 GET 액션입니다. (지원: action=read)",
    });
  } catch (err) {
    return createJsonResponse({ success: false, error: err.toString() });
  }
}

/**
 * -----------------------------------------------------------------------------
 * POST 요청 핸들러 (C, R, U, D 모두 지원)
 * 요청 본문 JSON:
 * - Create: { "action": "create", "datetime": "...", "content": "...", "timestamp": "선택" }
 * - Read:   { "action": "read", "timestamp": "선택" }
 * - Update: { "action": "update", "timestamp": "...", "datetime": "...", "content": "..." }
 * - Delete: { "action": "delete", "timestamp": "..." }
 * -----------------------------------------------------------------------------
 */
function doPost(e) {
  try {
    let payload = {};
    if (e && e.postData && e.postData.contents) {
      payload = JSON.parse(e.postData.contents);
    } else if (e && e.parameter) {
      payload = e.parameter;
    }

    const action = (payload.action || "").toLowerCase();

    switch (action) {
      case "create":
      case "insert":
        return createJsonResponse(handleCreate(payload));

      case "read":
      case "list":
        return createJsonResponse({ success: true, ...handleRead(payload.timestamp) });

      case "update":
        return createJsonResponse(handleUpdate(payload));

      case "delete":
        return createJsonResponse(handleDelete(payload.timestamp));

      default:
        return createJsonResponse({
          success: false,
          error: "유효한 action을 지정해주세요. ('create', 'read', 'update', 'delete')",
        });
    }
  } catch (err) {
    return createJsonResponse({ success: false, error: err.toString() });
  }
}

/**
 * =============================================================================
 * CRUD 세부 핸들러 로직
 * =============================================================================
 */

/**
 * 1. CREATE (생성)
 */
function handleCreate(data) {
  const sheet = getSheet();
  
  // timestamp가 없으면 현재 시간(밀리초 문자열)으로 자동 생성
  const timestamp = data.timestamp ? String(data.timestamp) : String(Date.now());
  const datetime = data.datetime || new Date().toISOString();
  const content = data.content || "";

  // 신규 행 추가: [timestamp, datetime, content]
  sheet.appendRow([timestamp, datetime, content]);

  return {
    success: true,
    message: "성공적으로 저장되었습니다.",
    data: {
      timestamp: timestamp,
      datetime: datetime,
      content: content,
    },
  };
}

/**
 * 2. READ (조회)
 * timestamp가 지정되면 특정 항목 조회, 없으면 전체 목록 조회
 */
function handleRead(targetTimestamp) {
  const sheet = getSheet();
  const lastRow = sheet.getLastRow();

  if (lastRow <= 1) {
    return { data: targetTimestamp ? null : [] };
  }

  // 2행부터 전체 데이터 읽기
  const values = sheet.getRange(2, 1, lastRow - 1, HEADERS.length).getValues();

  const list = values.map((row) => ({
    timestamp: String(row[0]),
    datetime: String(row[1]),
    content: String(row[2]),
  }));

  // 특정 timestamp 단일 조회
  if (targetTimestamp) {
    const item = list.find((d) => d.timestamp === String(targetTimestamp));
    return { data: item || null };
  }

  // 최신순 정렬 (timestamp 기준 내림차순)
  list.reverse();

  return { count: list.length, data: list };
}

/**
 * 3. UPDATE (수정)
 * timestamp를 키값으로 해당 행을 찾아 datetime 및 content 수정
 */
function handleUpdate(data) {
  if (!data.timestamp) {
    return { success: false, error: "수정할 대상의 'timestamp'가 필요합니다." };
  }

  const sheet = getSheet();
  const lastRow = sheet.getLastRow();

  if (lastRow <= 1) {
    return { success: false, error: "데이터가 존재하지 않습니다." };
  }

  const targetTimestamp = String(data.timestamp);
  const values = sheet.getRange(2, 1, lastRow - 1, 1).getValues(); // 1열(timestamp)만 먼저 검색

  let targetRowIndex = -1;
  for (let i = 0; i < values.length; i++) {
    if (String(values[i][0]) === targetTimestamp) {
      targetRowIndex = i + 2; // 시트의 실제 행 번호 (1-based, 2행부터 시작)
      break;
    }
  }

  if (targetRowIndex === -1) {
    return { success: false, error: "해당 timestamp의 항목을 찾을 수 없습니다: " + targetTimestamp };
  }

  // 변경할 값 반영 (제공된 필드만 업데이트)
  if (data.datetime !== undefined) {
    sheet.getRange(targetRowIndex, 2).setValue(data.datetime);
  }
  if (data.content !== undefined) {
    sheet.getRange(targetRowIndex, 3).setValue(data.content);
  }

  return {
    success: true,
    message: "성공적으로 수정되었습니다.",
    data: {
      timestamp: targetTimestamp,
      datetime: data.datetime,
      content: data.content,
    },
  };
}

/**
 * 4. DELETE (삭제)
 * timestamp를 키값으로 해당 행을 찾아 삭제
 */
function handleDelete(targetTimestamp) {
  if (!targetTimestamp) {
    return { success: false, error: "삭제할 대상의 'timestamp'가 필요합니다." };
  }

  const sheet = getSheet();
  const lastRow = sheet.getLastRow();

  if (lastRow <= 1) {
    return { success: false, error: "데이터가 존재하지 않습니다." };
  }

  const strTimestamp = String(targetTimestamp);
  const values = sheet.getRange(2, 1, lastRow - 1, 1).getValues();

  let targetRowIndex = -1;
  for (let i = 0; i < values.length; i++) {
    if (String(values[i][0]) === strTimestamp) {
      targetRowIndex = i + 2;
      break;
    }
  }

  if (targetRowIndex === -1) {
    return { success: false, error: "해당 timestamp의 항목을 찾을 수 없습니다: " + strTimestamp };
  }

  sheet.deleteRow(targetRowIndex);

  return {
    success: true,
    message: "성공적으로 삭제되었습니다.",
    timestamp: strTimestamp,
  };
}
