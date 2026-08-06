/**
 * ==============================================================================
 * NUTRIAX PRO — BACKEND NATIVO EM GOOGLE APPS SCRIPT (WITHOUT SUPABASE)
 * ==============================================================================
 * Este script deve ser implantado no Google Apps Script como um Web App
 * (Implantar > Nova implantação > Tipo: App da Web > Acesso: Qualquer pessoa).
 * 
 * Funcionalidades:
 * - Leitura e gravação transparente de dados JSON no Google Sheets / Google Drive
 * - Endpoints REST HTTP (GET e POST)
 * - Suporte a CORS para Next.js (apps/web, apps/patient) e GitHub Pages (index.html)
 */

const SHEET_NAME = 'NutriAX_Pro_Data';

function doGet(e) {
  try {
    const action = (e && e.parameter && e.parameter.action) ? e.parameter.action : 'get';
    const patientId = (e && e.parameter && e.parameter.patientId) ? e.parameter.patientId : 'paulovitor.rsousa3@gmail.com';

    let data = null;
    if (action === 'get') {
      data = loadPatientDataFromSheet(patientId);
    }

    return ContentService
      .createTextOutput(JSON.stringify({ success: true, data: data }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  try {
    let payload = {};
    if (e && e.postData && e.postData.contents) {
      payload = JSON.parse(e.postData.contents);
    }

    const action = payload.action || 'save';
    const appData = payload.data || payload;

    if (action === 'save' && appData) {
      savePatientDataToSheet(appData);
    }

    return ContentService
      .createTextOutput(JSON.stringify({ success: true, timestamp: new Date().toISOString() }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Carrega os dados do paciente salvos na Planilha do Google Sheets ou Drive JSON
 */
function loadPatientDataFromSheet(patientId) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  
  if (!sheet) {
    return null;
  }

  const values = sheet.getDataRange().getValues();
  if (values.length < 2) return null;

  for (let i = 1; i < values.length; i++) {
    if (values[i][0] === patientId) {
      try {
        return JSON.parse(values[i][1]);
      } catch (err) {
        return null;
      }
    }
  }

  return null;
}

/**
 * Grava ou atualiza os dados do paciente na Planilha do Google Sheets e Drive
 */
function savePatientDataToSheet(appData) {
  const patientId = (appData.patient && appData.patient.id) ? appData.patient.id : 'paulovitor.rsousa3@gmail.com';
  const jsonString = JSON.stringify(appData);
  const updatedAt = new Date().toISOString();

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(['Patient_ID', 'JSON_Data', 'Updated_At']);
  }

  const values = sheet.getDataRange().getValues();
  let foundIndex = -1;

  for (let i = 1; i < values.length; i++) {
    if (values[i][0] === patientId) {
      foundIndex = i + 1; // 1-based index
      break;
    }
  }

  if (foundIndex > 0) {
    sheet.getRange(foundIndex, 2).setValue(jsonString);
    sheet.getRange(foundIndex, 3).setValue(updatedAt);
  } else {
    sheet.appendRow([patientId, jsonString, updatedAt]);
  }
}
