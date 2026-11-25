// Script to capture authentic pixel-perfect screenshots of all 4 RKF Tracker services
const http = require('http');
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const OUTPUT_DIR = path.resolve('frontend/public/images/tracker');
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// 1. HTML Template for Telegram Bot Screenshot
function getTelegramHtml() {
  const logoBase64 = fs.readFileSync('rkf-tracker/web/icons/icon-192.png').toString('base64');
  return `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <title>Telegram Chat</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background: #8e9ea9;
      background: linear-gradient(135deg, #7a94a6 0%, #a2b7c6 100%);
      width: 800px;
      height: 560px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }
    .tg-window {
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      background: #eef2f5;
      background-image: radial-gradient(rgba(0,0,0,0.03) 1px, transparent 1px);
      background-size: 20px 20px;
    }
    .tg-header {
      height: 54px;
      background: #ffffff;
      border-bottom: 1px solid rgba(0,0,0,0.08);
      display: flex;
      align-items: center;
      padding: 0 16px;
      gap: 12px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.04);
      z-index: 10;
    }
    .tg-avatar {
      width: 38px;
      height: 38px;
      border-radius: 50%;
      background: #252320;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      border: 1px solid rgba(0,0,0,0.08);
    }
    .tg-avatar img { width: 100%; height: 100%; object-fit: cover; }
    .tg-header-info { flex: 1; min-width: 0; }
    .tg-title { font-size: 14.5px; font-weight: 600; color: #111417; display: flex; align-items: center; gap: 6px; }
    .tg-badge { font-size: 10px; background: #2481cc; color: #fff; padding: 1px 5px; border-radius: 4px; font-weight: 700; }
    .tg-status { font-size: 12px; color: #707579; margin-top: 1px; }
    .tg-header-actions { display: flex; gap: 16px; color: #707579; }
    .tg-chat-area {
      flex: 1;
      padding: 16px 20px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      gap: 12px;
      justify-content: flex-end;
    }
    .tg-date-pill {
      align-self: center;
      background: rgba(0,0,0,0.18);
      color: #fff;
      font-size: 11px;
      font-weight: 500;
      padding: 3px 10px;
      border-radius: 12px;
      margin-bottom: 4px;
    }
    .tg-msg-wrap {
      max-width: 540px;
      display: flex;
      flex-direction: column;
      gap: 3px;
    }
    .tg-bubble {
      background: #ffffff;
      border-radius: 14px 14px 14px 4px;
      padding: 10px 14px 8px;
      box-shadow: 0 1px 2px rgba(0,0,0,0.08);
      color: #000000;
      font-size: 13px;
      line-height: 1.45;
      position: relative;
    }
    .tg-bubble-header {
      font-weight: 700;
      color: #2481cc;
      font-size: 13.5px;
      margin-bottom: 2px;
    }
    .tg-bubble-sub {
      color: #707579;
      font-size: 11.5px;
      margin-bottom: 6px;
      border-bottom: 1px dashed #e0e4e8;
      padding-bottom: 4px;
    }
    .tg-bubble-body {
      white-space: pre-wrap;
      font-size: 12.5px;
      color: #222;
      line-height: 1.4;
    }
    .tg-bubble-time {
      float: right;
      font-size: 10.5px;
      color: #a0a6ab;
      margin-left: 8px;
      margin-top: 4px;
      display: flex;
      align-items: center;
      gap: 2px;
    }
    .tg-inline-kb {
      display: flex;
      flex-direction: column;
      gap: 3px;
      margin-top: 4px;
    }
    .tg-kb-row { display: flex; gap: 3px; }
    .tg-btn {
      flex: 1;
      background: rgba(36, 129, 204, 0.08);
      color: #2481cc;
      font-size: 12px;
      font-weight: 600;
      padding: 7px 10px;
      border-radius: 6px;
      text-align: center;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 5px;
    }
    .tg-btn.primary {
      background: #2481cc;
      color: #ffffff;
    }
    .tg-notice-bubble {
      background: #f7fafc;
      border-left: 3px solid #10b981;
      border-radius: 4px 12px 12px 4px;
      padding: 8px 12px;
      margin-top: 6px;
      box-shadow: 0 1px 2px rgba(0,0,0,0.05);
    }
    .tg-notice-title { font-weight: 700; color: #047857; font-size: 12px; }
    .tg-notice-dog { font-weight: 600; font-size: 12px; color: #111; margin-top: 2px; }
    .tg-notice-doc { font-size: 11.5px; color: #4b5563; }
    .tg-input-bar {
      height: 48px;
      background: #ffffff;
      border-top: 1px solid rgba(0,0,0,0.08);
      display: flex;
      align-items: center;
      padding: 0 12px;
      gap: 10px;
    }
    .tg-menu-btn {
      background: #f0f2f5;
      color: #2481cc;
      font-size: 12px;
      font-weight: 700;
      padding: 5px 12px;
      border-radius: 16px;
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .tg-input-ph {
      flex: 1;
      color: #9ca3af;
      font-size: 13px;
    }
  </style>
</head>
<body>
  <div class="tg-window">
    <div class="tg-header">
      <div class="tg-avatar">
        <img src="data:image/png;base64,${logoBase64}" alt="bot">
      </div>
      <div class="tg-header-info">
        <div class="tg-title">CoursingStats RKF Tracker <span class="tg-badge">БОТ</span></div>
        <div class="tg-status">бот • мгновенные push-уведомления о дипломах и состязаниях</div>
      </div>
      <div class="tg-header-actions">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>
      </div>
    </div>

    <div class="tg-chat-area">
      <div class="tg-date-pill">Сегодня, 24 ноября</div>

      <div class="tg-msg-wrap">
        <div class="tg-bubble">
          <div class="tg-bubble-header">CoursingStats Tracker</div>
          <div class="tg-bubble-sub">Мониторинг документов и состязаний РКФ</div>
          <div class="tg-bubble-body">• Аккаунт РКФ: Подключен
• Всего заявок: 4 (Готово к выдаче: 2)
• В обработке: 1 • Забрали: 1
• Отслеживание состязаний: 72 турнира
• Фоновый робот: активен (проверка каждый час)
• Обновлено: 18:40 (МСК)</div>

          <div class="tg-notice-bubble">
            <div class="tg-notice-title">● ИЗГОТОВЛЕНО (ГОТОВО К ВЫДАЧЕ)</div>
            <div class="tg-notice-dog">ЭМУЛЬ ДЭ ГЕПАРД ГЕЛИЛА АЛЬ РАВДА</div>
            <div class="tg-notice-doc">Гранд Чемпион РКФ по рабочим качествам • № 2200000496275</div>
          </div>

          <div class="tg-bubble-time">18:40 ✓✓</div>
        </div>

        <div class="tg-inline-kb">
          <div class="tg-kb-row">
            <button class="tg-btn primary">Открыть личный кабинет (WebApp)</button>
          </div>
          <div class="tg-kb-row">
            <button class="tg-btn">Список заявок (4)</button>
            <button class="tg-btn">Состязания РКФ 2026 (72)</button>
          </div>
          <div class="tg-kb-row">
            <button class="tg-btn">Отметить: забрали</button>
            <button class="tg-btn">Настройки</button>
          </div>
        </div>
      </div>
    </div>

    <div class="tg-input-bar">
      <div class="tg-menu-btn">≡ Меню</div>
      <div class="tg-input-ph">Написать сообщение...</div>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#707579" stroke-width="2"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#707579" stroke-width="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>
    </div>
  </div>
</body>
</html>`;
}

// 2. HTML Template for Chrome Extension (with Chrome browser frame)
function getExtensionFrameHtml() {
  const logoBase64 = fs.readFileSync('rkf-tracker/web/icons/icon-192.png').toString('base64');
  return `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <title>Chrome Extension Preview</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
      background: #dfe3e7;
      width: 800px;
      height: 560px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }
    .chrome-frame {
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      background: #f1f3f4;
    }
    .chrome-tabs-bar {
      height: 38px;
      background: #dfe1e5;
      display: flex;
      align-items: flex-end;
      padding: 0 12px;
      gap: 6px;
    }
    .chrome-tab {
      height: 32px;
      background: #ffffff;
      border-radius: 8px 8px 0 0;
      padding: 0 14px;
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 11.5px;
      color: #3c4043;
      max-width: 240px;
      box-shadow: 0 1px 2px rgba(0,0,0,0.06);
    }
    .chrome-tab-icon { width: 14px; height: 14px; border-radius: 50%; background: #00796b; }
    .chrome-toolbar {
      height: 44px;
      background: #ffffff;
      border-bottom: 1px solid #e0e0e0;
      display: flex;
      align-items: center;
      padding: 0 12px;
      gap: 10px;
    }
    .chrome-nav-btn { color: #5f6368; display: flex; align-items: center; }
    .chrome-address-bar {
      flex: 1;
      height: 30px;
      background: #f1f3f4;
      border-radius: 15px;
      display: flex;
      align-items: center;
      padding: 0 12px;
      gap: 8px;
      font-size: 12px;
      color: #202124;
    }
    .chrome-lock { color: #1e8e3e; }
    .chrome-ext-icons { display: flex; align-items: center; gap: 8px; }
    .ext-icon-badge-wrap {
      position: relative;
      background: #e8f0fe;
      border: 1px solid #c2e7ff;
      border-radius: 6px;
      padding: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .ext-icon-img { width: 18px; height: 18px; }
    .ext-badge {
      position: absolute;
      top: -3px;
      right: -4px;
      background: #188038;
      color: #ffffff;
      font-size: 9px;
      font-weight: 700;
      padding: 1px 4px;
      border-radius: 6px;
      border: 1px solid #fff;
    }
    .browser-viewport {
      flex: 1;
      background: #f8f9fa;
      position: relative;
      display: flex;
      justify-content: flex-end;
      padding: 6px 14px 10px;
    }
    .popup-wrapper {
      width: 460px;
      background: #ffffff;
      border-radius: 12px;
      box-shadow: 0 12px 32px rgba(0,0,0,0.18), 0 2px 8px rgba(0,0,0,0.08);
      border: 1px solid rgba(0,0,0,0.08);
      overflow: hidden;
      display: flex;
      flex-direction: column;
      max-height: 460px;
    }
    .popup-header {
      background: #fcfbf9;
      border-bottom: 1px solid #e8e3dd;
      padding: 10px 14px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .popup-brand { display: flex; align-items: center; gap: 8px; }
    .popup-brand img { width: 22px; height: 22px; }
    .popup-brand-name { font-size: 13.5px; font-weight: 700; color: #221f1f; }
    .popup-brand-sub { font-size: 11px; color: #78716c; }
    .popup-sync-badge {
      display: flex;
      align-items: center;
      gap: 5px;
      font-size: 11px;
      color: #065f46;
      background: #ecfdf5;
      padding: 3px 8px;
      border-radius: 12px;
      font-weight: 600;
      border: 1px solid #a7f3d0;
    }
    .popup-sync-dot { width: 6px; height: 6px; border-radius: 50%; background: #10b981; }
    .popup-tabs {
      display: flex;
      background: #f5f0e8;
      padding: 4px;
      gap: 4px;
      border-bottom: 1px solid #e8e3dd;
    }
    .popup-tab-btn {
      flex: 1;
      padding: 5px 8px;
      border-radius: 6px;
      font-size: 11.5px;
      font-weight: 600;
      text-align: center;
      border: none;
      background: transparent;
      color: #78716c;
    }
    .popup-tab-btn.active {
      background: #ffffff;
      color: #221f1f;
      box-shadow: 0 1px 3px rgba(0,0,0,0.06);
    }
    .popup-filters {
      display: flex;
      gap: 5px;
      padding: 8px 12px;
      background: #faf8f5;
      border-bottom: 1px solid #f0ede8;
    }
    .popup-pill {
      font-size: 11px;
      padding: 3px 8px;
      border-radius: 12px;
      background: #ffffff;
      border: 1px solid #e2dcd4;
      color: #57534e;
      font-weight: 500;
    }
    .popup-pill.active {
      background: #e8dcc8;
      border-color: #c8b99c;
      color: #292524;
      font-weight: 700;
    }
    .popup-rows {
      display: flex;
      flex-direction: column;
      padding: 4px 8px;
      gap: 4px;
      background: #faf8f5;
    }
    .popup-row {
      background: #ffffff;
      border: 1px solid #e8e3dd;
      border-radius: 8px;
      padding: 7px 10px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
    }
    .popup-row-left { display: flex; flex-direction: column; gap: 2px; }
    .popup-dog { font-size: 12px; font-weight: 700; color: #1c1917; }
    .popup-doc { font-size: 11px; color: #78716c; }
    .popup-status {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      font-size: 11px;
      font-weight: 600;
      white-space: nowrap;
    }
    .status-dot { width: 7px; height: 7px; border-radius: 50%; }
    .status-dot.green { background: #10b981; }
    .status-dot.amber { background: #f59e0b; }
    .status-text-green { color: #047857; }
    .status-text-amber { color: #b45309; }
    .popup-bottom {
      padding: 8px 12px;
      background: #ffffff;
      border-top: 1px solid #e8e3dd;
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 11px;
      color: #78716c;
    }
    .popup-bottom-link { color: #8c683b; font-weight: 600; text-decoration: none; }
  </style>
</head>
<body>
  <div class="chrome-frame">
    <div class="chrome-tabs-bar">
      <div class="chrome-tab">
        <div class="chrome-tab-icon"></div>
        <span>РКФ Онлайн • Реестр заявок</span>
        <span style="color:#888; font-size:10px;">✕</span>
      </div>
      <span style="color:#5f6368; font-size:14px; margin-left:4px;">+</span>
    </div>

    <div class="chrome-toolbar">
      <div class="chrome-nav-btn">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
      </div>
      <div class="chrome-nav-btn">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
      </div>
      <div class="chrome-nav-btn">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/></svg>
      </div>

      <div class="chrome-address-bar">
        <svg class="chrome-lock" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
        <span>https://rkf.online/user/documents/application/registry</span>
      </div>

      <div class="chrome-ext-icons">
        <div class="ext-icon-badge-wrap">
          <img src="data:image/png;base64,${logoBase64}" class="ext-icon-img" alt="ext">
          <div class="ext-badge">2</div>
        </div>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#5f6368" stroke-width="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>
      </div>
    </div>

    <div class="browser-viewport">
      <div class="popup-wrapper">
        <div class="popup-header">
          <div class="popup-brand">
            <img src="data:image/png;base64,${logoBase64}" alt="logo">
            <div>
              <div class="popup-brand-name">КурсингСтатс</div>
              <div class="popup-brand-sub">Трекер РКФ Онлайн</div>
            </div>
          </div>
          <div class="popup-sync-badge">
            <span class="popup-sync-dot"></span>
            <span>Обновлено: 18:40</span>
          </div>
        </div>

        <div class="popup-tabs">
          <button class="popup-tab-btn active">Заявки на титулы (4)</button>
          <button class="popup-tab-btn">Соревнования РКФ (72)</button>
        </div>

        <div class="popup-filters">
          <div class="popup-pill active">Все (4)</div>
          <div class="popup-pill">В обработке (1)</div>
          <div class="popup-pill">Готовы к выдаче (2)</div>
          <div class="popup-pill">Забрали (1)</div>
        </div>

        <div class="popup-rows">
          <div class="popup-row">
            <div class="popup-row-left">
              <div class="popup-dog">Бель Этуаль Кайла</div>
              <div class="popup-doc">Чемпион РКФ по рабочим качествам • № 2200000498194</div>
            </div>
            <div class="popup-status">
              <span class="status-dot amber"></span>
              <span class="status-text-amber">Передана в бухгалтерию</span>
            </div>
          </div>

          <div class="popup-row">
            <div class="popup-row-left">
              <div class="popup-dog">Эмуль Дэ Гепард Гелила Аль Равда</div>
              <div class="popup-doc">Гранд Чемпион РКФ по рабочим качествам • № 2200000496275</div>
            </div>
            <div class="popup-status">
              <span class="status-dot green"></span>
              <span class="status-text-green">Изготовлено</span>
            </div>
          </div>

          <div class="popup-row">
            <div class="popup-row-left">
              <div class="popup-dog">Эмуль Дэ Гепард Гелила Аль Равда</div>
              <div class="popup-doc">Национальный Чемпион по рабочим качествам • № 2200000495394</div>
            </div>
            <div class="popup-status">
              <span class="status-dot green"></span>
              <span class="status-text-green">Изготовлено</span>
            </div>
          </div>

          <div class="popup-row" style="opacity: 0.75;">
            <div class="popup-row-left">
              <div class="popup-dog">Эмуль Дэ Гепард Гелила Аль Равда</div>
              <div class="popup-doc">Чемпион России по рабочим качествам • № 2200000491072</div>
            </div>
            <div class="popup-status" style="color: #6b7280;">
              <span>✓ Забрали</span>
            </div>
          </div>
        </div>

        <div class="popup-bottom">
          <span>Автосинхронизация активна</span>
          <span class="popup-bottom-link">Открыть на сайте ↗</span>
        </div>
      </div>
    </div>
  </div>
</body>
</html>`;
}

// 3. HTML Template for Windows Desktop App (Windows 11 Frame + Toast Notification)
function getWindowsDesktopHtml() {
  const logoBase64 = fs.readFileSync('rkf-tracker/web/icons/icon-192.png').toString('base64');
  return `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <title>Windows Desktop App</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: "Segoe UI Variable Text", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      background: #1e1e1e;
      width: 800px;
      height: 560px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      position: relative;
    }
    .win-window {
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      background: #faf8f5;
      border: 1px solid rgba(255,255,255,0.1);
    }
    .win-titlebar {
      height: 34px;
      background: #252320;
      color: #e5e5e5;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 0 0 12px;
      font-size: 12px;
      user-select: none;
    }
    .win-title-left { display: flex; align-items: center; gap: 8px; }
    .win-app-icon { width: 16px; height: 16px; }
    .win-title-text { font-weight: 500; font-size: 12px; letter-spacing: 0.2px; }
    .win-controls { display: flex; height: 100%; }
    .win-btn {
      width: 44px;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #ccc;
      font-size: 11px;
    }
    .win-btn.close:hover { background: #e81123; color: #fff; }
    .win-body {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      background: #faf8f5;
    }
    .win-header {
      padding: 12px 18px 8px;
      background: #ffffff;
      border-bottom: 1px solid #ede7de;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .win-brand { display: flex; align-items: center; gap: 10px; }
    .win-brand img { width: 26px; height: 26px; }
    .win-brand-title { font-size: 15px; font-weight: 700; color: #221f1f; }
    .win-brand-sub { font-size: 11px; color: #78716c; }
    .win-nav-tabs {
      display: flex;
      gap: 6px;
    }
    .win-tab {
      padding: 6px 14px;
      border-radius: 8px;
      font-size: 12px;
      font-weight: 600;
      color: #57534e;
      background: #f5f0e8;
    }
    .win-tab.active {
      background: #252320;
      color: #ffffff;
    }
    .win-actions { display: flex; align-items: center; gap: 8px; }
    .win-sync-pill {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 11px;
      color: #065f46;
      background: #ecfdf5;
      padding: 4px 10px;
      border-radius: 20px;
      border: 1px solid #a7f3d0;
      font-weight: 600;
    }
    .win-sync-dot { width: 6px; height: 6px; border-radius: 50%; background: #10b981; }
    .win-refresh-btn {
      background: #ffffff;
      border: 1px solid #dcd5ca;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 11px;
      font-weight: 600;
      color: #333;
      display: flex;
      align-items: center;
      gap: 5px;
    }
    .win-kpi-bar {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 10px;
      padding: 10px 18px;
      background: #faf8f5;
    }
    .win-kpi-card {
      background: #ffffff;
      border: 1px solid #ede7de;
      border-radius: 8px;
      padding: 8px 12px;
      display: flex;
      flex-direction: column;
    }
    .win-kpi-val { font-size: 16px; font-weight: 700; color: #221f1f; }
    .win-kpi-lbl { font-size: 10.5px; color: #78716c; margin-top: 1px; }
    .win-table-container {
      flex: 1;
      padding: 0 18px 12px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .win-table-header {
      display: grid;
      grid-template-columns: 24px 220px 1fr 140px;
      padding: 6px 12px;
      font-size: 10.5px;
      font-weight: 700;
      color: #78716c;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .win-row {
      background: #ffffff;
      border: 1px solid #ede7de;
      border-radius: 8px;
      padding: 8px 12px;
      display: grid;
      grid-template-columns: 24px 220px 1fr 140px;
      align-items: center;
      font-size: 12px;
    }
    .win-dog { font-weight: 700; color: #1c1917; font-size: 12px; }
    .win-pedigree { font-family: monospace; font-size: 10.5px; color: #78716c; }
    .win-doc { font-weight: 600; color: #292524; font-size: 11.5px; }
    .win-barcode { font-family: monospace; font-size: 10.5px; color: #78716c; }
    .win-status-badge {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      font-weight: 600;
      font-size: 11.5px;
    }
    /* Windows 11 Toast Notification */
    .win11-toast {
      position: absolute;
      bottom: 20px;
      right: 20px;
      width: 320px;
      background: rgba(32, 32, 32, 0.95);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(255,255,255,0.15);
      border-radius: 10px;
      padding: 12px 14px;
      color: #ffffff;
      box-shadow: 0 10px 30px rgba(0,0,0,0.5);
      z-index: 100;
      display: flex;
      flex-direction: column;
      gap: 6px;
      animation: slideIn 0.3s ease;
    }
    .toast-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 11px;
      color: #aaa;
    }
    .toast-top-left { display: flex; align-items: center; gap: 6px; }
    .toast-top-left img { width: 14px; height: 14px; }
    .toast-title { font-size: 12.5px; font-weight: 700; color: #10b981; }
    .toast-desc { font-size: 11.5px; color: #ddd; line-height: 1.35; }
    .toast-btn {
      align-self: flex-start;
      margin-top: 4px;
      background: rgba(255,255,255,0.12);
      border: 1px solid rgba(255,255,255,0.2);
      color: #fff;
      font-size: 10.5px;
      font-weight: 600;
      padding: 3px 10px;
      border-radius: 4px;
    }
  </style>
</head>
<body>
  <div class="win-window">
    <div class="win-titlebar">
      <div class="win-title-left">
        <img src="data:image/png;base64,${logoBase64}" class="win-app-icon" alt="icon">
        <div class="win-title-text">CoursingStats RKF Tracker — Мониторинг РКФ Онлайн (v1.0.0 Portable)</div>
      </div>
      <div class="win-controls">
        <div class="win-btn">─</div>
        <div class="win-btn">□</div>
        <div class="win-btn close">✕</div>
      </div>
    </div>

    <div class="win-body">
      <div class="win-header">
        <div class="win-brand">
          <img src="data:image/png;base64,${logoBase64}" alt="logo">
          <div>
            <div class="win-brand-title">CoursingStats Tracker</div>
            <div class="win-brand-sub">Автономный десктопный сервис в системном трее Windows</div>
          </div>
        </div>
        <div class="win-nav-tabs">
          <div class="win-tab active">Заявки на титулы (4)</div>
          <div class="win-tab">Соревнования РКФ (72)</div>
        </div>
        <div class="win-actions">
          <div class="win-sync-pill">
            <span class="win-sync-dot"></span>
            <span>РКФ Онлайн подключен</span>
          </div>
          <div class="win-refresh-btn">⟳ Обновить</div>
        </div>
      </div>

      <div class="win-kpi-bar">
        <div class="win-kpi-card">
          <div class="win-kpi-val">4</div>
          <div class="win-kpi-lbl">Всего заявок</div>
        </div>
        <div class="win-kpi-card">
          <div class="win-kpi-val" style="color: #b45309;">1</div>
          <div class="win-kpi-lbl">В обработке</div>
        </div>
        <div class="win-kpi-card">
          <div class="win-kpi-val" style="color: #047857;">2</div>
          <div class="win-kpi-lbl">Готовы к выдаче</div>
        </div>
        <div class="win-kpi-card">
          <div class="win-kpi-val" style="color: #6b7280;">1</div>
          <div class="win-kpi-lbl">Забрали из РКФ</div>
        </div>
      </div>

      <div class="win-table-container">
        <div class="win-table-header">
          <div></div>
          <div>Кличка собаки</div>
          <div>Документ РКФ / Штрихкод</div>
          <div>Статус заявки</div>
        </div>

        <div class="win-row">
          <input type="checkbox" disabled>
          <div>
            <div class="win-dog">Бель Этуаль Кайла</div>
            <div class="win-pedigree">РКФ 7257850</div>
          </div>
          <div>
            <div class="win-doc">Чемпион РКФ по рабочим качествам (ЧРКФ)</div>
            <div class="win-barcode">№ 2200000498194</div>
          </div>
          <div class="win-status-badge" style="color: #b45309;">
            <span style="width:7px; height:7px; border-radius:50%; background:#f59e0b;"></span>
            <span>В бухгалтерии</span>
          </div>
        </div>

        <div class="win-row">
          <input type="checkbox">
          <div>
            <div class="win-dog">Эмуль Дэ Гепард Гелила Аль Равда</div>
            <div class="win-pedigree">РКФ 7132438</div>
          </div>
          <div>
            <div class="win-doc">Гранд Чемпион РКФ по рабочим качествам</div>
            <div class="win-barcode">№ 2200000496275</div>
          </div>
          <div class="win-status-badge" style="color: #047857;">
            <span style="width:7px; height:7px; border-radius:50%; background:#10b981;"></span>
            <span>Изготовлено</span>
          </div>
        </div>

        <div class="win-row">
          <input type="checkbox">
          <div>
            <div class="win-dog">Эмуль Дэ Гепард Гелила Аль Равда</div>
            <div class="win-pedigree">РКФ 7132438</div>
          </div>
          <div>
            <div class="win-doc">Национальный Чемпион по рабочим качествам</div>
            <div class="win-barcode">№ 2200000495394</div>
          </div>
          <div class="win-status-badge" style="color: #047857;">
            <span style="width:7px; height:7px; border-radius:50%; background:#10b981;"></span>
            <span>Изготовлено</span>
          </div>
        </div>
      </div>
    </div>

    <!-- System Tray Pop-up Toast -->
    <div class="win11-toast">
      <div class="toast-top">
        <div class="toast-top-left">
          <img src="data:image/png;base64,${logoBase64}" alt="app">
          <span>CoursingStats RKF Tracker</span>
        </div>
        <span>Только что</span>
      </div>
      <div class="toast-title">● Диплом изготовлен и готов к выдаче!</div>
      <div class="toast-desc">Эмуль Дэ Гепард Гелила Аль Равда — Гранд Чемпион РКФ (№ 2200000496275)</div>
      <button class="toast-btn">Открыть в трекере</button>
    </div>
  </div>
</body>
</html>`;
}

// 4. HTML Template for Mobile PWA (Smartphone Device View)
function getMobilePwaHtml() {
  const logoBase64 = fs.readFileSync('rkf-tracker/web/icons/icon-192.png').toString('base64');
  return `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <title>Mobile PWA Preview</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Roboto, sans-serif;
      background: #e8ecef;
      background: linear-gradient(135deg, #dce4ea 0%, #edf1f5 100%);
      width: 800px;
      height: 560px;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 36px;
    }
    /* Smartphone Mockup */
    .phone-mockup {
      width: 290px;
      height: 520px;
      background: #111;
      border-radius: 42px;
      padding: 10px;
      box-shadow: 0 25px 60px rgba(0,0,0,0.25), 0 5px 15px rgba(0,0,0,0.12);
      border: 3px solid #d4d4d8;
      display: flex;
      flex-direction: column;
    }
    .phone-screen {
      flex: 1;
      background: #FAF8F5;
      border-radius: 32px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      position: relative;
    }
    .phone-status-bar {
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 18px;
      font-size: 12px;
      font-weight: 600;
      color: #000;
      z-index: 10;
    }
    .dynamic-island {
      width: 80px;
      height: 22px;
      background: #000;
      border-radius: 14px;
      margin: 0 auto;
    }
    .pwa-header {
      padding: 8px 14px;
      background: #FAF8F5;
      border-bottom: 1px solid #ede7de;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .pwa-brand { display: flex; align-items: center; gap: 8px; }
    .pwa-brand img { width: 22px; height: 22px; }
    .pwa-brand-text { font-size: 13px; font-weight: 700; color: #221F1F; }
    .pwa-sync-pill {
      font-size: 10px;
      background: #ecfdf5;
      color: #047857;
      padding: 2px 7px;
      border-radius: 12px;
      font-weight: 600;
      border: 1px solid #a7f3d0;
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .pwa-tabs {
      display: flex;
      padding: 6px 12px;
      gap: 6px;
      background: #FAF8F5;
    }
    .pwa-tab-btn {
      flex: 1;
      padding: 6px;
      border-radius: 8px;
      font-size: 11px;
      font-weight: 600;
      text-align: center;
      border: none;
      background: #ede6dc;
      color: #57534e;
    }
    .pwa-tab-btn.active {
      background: #252320;
      color: #ffffff;
    }
    .pwa-cards {
      flex: 1;
      padding: 8px 12px;
      display: flex;
      flex-direction: column;
      gap: 8px;
      overflow: hidden;
    }
    .pwa-card {
      background: #ffffff;
      border: 1px solid #ede7de;
      border-radius: 12px;
      padding: 10px 12px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.03);
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .pwa-card-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .pwa-dog { font-size: 11.5px; font-weight: 700; color: #1c1917; }
    .pwa-status {
      font-size: 10px;
      font-weight: 700;
      padding: 2px 6px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .pwa-status.ready { background: #dcfce7; color: #15803d; }
    .pwa-status.active { background: #fef3c7; color: #b45309; }
    .pwa-doc { font-size: 11px; color: #44403c; line-height: 1.3; }
    .pwa-meta { font-size: 9.5px; color: #a8a29e; font-family: monospace; }
    .pwa-home-bar {
      height: 18px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .home-indicator {
      width: 100px;
      height: 4px;
      background: #222;
      border-radius: 2px;
    }
    /* Side Feature Callout */
    .pwa-side-info {
      width: 380px;
      display: flex;
      flex-direction: column;
      gap: 14px;
    }
    .pwa-side-card {
      background: #ffffff;
      border: 1px solid #e2dcd4;
      border-radius: 16px;
      padding: 16px 18px;
      box-shadow: 0 4px 16px rgba(0,0,0,0.06);
    }
    .pwa-app-icon-row {
      display: flex;
      align-items: center;
      gap: 14px;
      margin-bottom: 12px;
    }
    .pwa-app-icon {
      width: 52px;
      height: 52px;
      border-radius: 14px;
      background: #252320;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      overflow: hidden;
      position: relative;
    }
    .pwa-app-icon img { width: 100%; height: 100%; object-fit: cover; }
    .pwa-app-badge {
      position: absolute;
      top: 2px;
      right: 2px;
      width: 14px;
      height: 14px;
      background: #ef4444;
      color: #fff;
      font-size: 9px;
      font-weight: 700;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .pwa-app-info-title { font-size: 15px; font-weight: 700; color: #221f1f; }
    .pwa-app-info-sub { font-size: 11.5px; color: #78716c; margin-top: 2px; }
    .pwa-perks {
      display: flex;
      flex-direction: column;
      gap: 8px;
      font-size: 12px;
      color: #44403c;
    }
    .pwa-perk-item {
      display: flex;
      align-items: flex-start;
      gap: 8px;
    }
    .pwa-perk-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #c89d66;
      margin-top: 6px;
      flex-shrink: 0;
    }
  </style>
</head>
<body>
  <div class="phone-mockup">
    <div class="phone-screen">
      <div class="phone-status-bar">
        <span>09:41</span>
        <div class="dynamic-island"></div>
        <div style="display:flex; gap:4px; font-size:11px;">5G 100%</div>
      </div>

      <div class="pwa-header">
        <div class="pwa-brand">
          <img src="data:image/png;base64,${logoBase64}" alt="logo">
          <span class="pwa-brand-text">РКФ Трекер</span>
        </div>
        <div class="pwa-sync-pill">
          <span style="width:5px; height:5px; border-radius:50%; background:#10b981;"></span>
          <span>Онлайн</span>
        </div>
      </div>

      <div class="pwa-tabs">
        <button class="pwa-tab-btn active">Заявки (4)</button>
        <button class="pwa-tab-btn">Состязания (72)</button>
      </div>

      <div class="pwa-cards">
        <div class="pwa-card">
          <div class="pwa-card-top">
            <span class="pwa-dog">Бель Этуаль Кайла</span>
            <span class="pwa-status active">В бухгалтерии</span>
          </div>
          <div class="pwa-doc">Чемпион РКФ по рабочим качествам</div>
          <div class="pwa-meta">№ 2200000498194 • 23.11</div>
        </div>

        <div class="pwa-card">
          <div class="pwa-card-top">
            <span class="pwa-dog">Эмуль Дэ Гепард Гелила...</span>
            <span class="pwa-status ready">● Изготовлено</span>
          </div>
          <div class="pwa-doc">Гранд Чемпион РКФ по рабочим кач...</div>
          <div class="pwa-meta">№ 2200000496275 • 20.11</div>
        </div>

        <div class="pwa-card">
          <div class="pwa-card-top">
            <span class="pwa-dog">Эмуль Дэ Гепард Гелила...</span>
            <span class="pwa-status ready">● Изготовлено</span>
          </div>
          <div class="pwa-doc">Национальный Чемпион по раб...</div>
          <div class="pwa-meta">№ 2200000495394 • 19.11</div>
        </div>
      </div>

      <div class="pwa-home-bar">
        <div class="home-indicator"></div>
      </div>
    </div>
  </div>

  <div class="pwa-side-info">
    <div class="pwa-side-card">
      <div class="pwa-app-icon-row">
        <div class="pwa-app-icon">
          <img src="data:image/png;base64,${logoBase64}" alt="PWA Icon">
          <div class="pwa-app-badge">2</div>
        </div>
        <div>
          <div class="pwa-app-info-title">PWA: На домашнем экране</div>
          <div class="pwa-app-info-sub">coursing-stats.ru/tracker</div>
        </div>
      </div>
      <div class="pwa-perks">
        <div class="pwa-perk-item">
          <div class="pwa-perk-dot"></div>
          <div><strong>Полноэкранный режим:</strong> без адресной строки и кнопок браузера, работает как нативное приложение iOS и Android.</div>
        </div>
        <div class="pwa-perk-item">
          <div class="pwa-perk-dot"></div>
          <div><strong>Мгновенный доступ:</strong> иконка на рабочем столе смартфона открывает личный кабинет в 1 касание.</div>
        </div>
        <div class="pwa-perk-item">
          <div class="pwa-perk-dot"></div>
          <div><strong>Оффлайн-кэш:</strong> последние проверенные заявки доступны даже без интернета на полевых состязаниях.</div>
        </div>
      </div>
    </div>
  </div>
</body>
</html>`;
}

async function run() {
  console.log('Starting screenshot generator via Playwright Chrome...');
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const context = await browser.newContext({
    viewport: { width: 800, height: 560 },
    deviceScaleFactor: 2 // 2x retina for ultra-crisp display
  });

  const page = await context.newPage();

  // 1. Telegram Bot Screenshot
  console.log('Capturing 1/4: Telegram Bot...');
  await page.setContent(getTelegramHtml(), { waitUntil: 'networkidle' });
  await page.screenshot({ path: path.join(OUTPUT_DIR, 'telegram-bot.webp'), type: 'webp', quality: 92 });

  // 2. Chrome Extension Screenshot
  console.log('Capturing 2/4: Chrome Extension...');
  await page.setContent(getExtensionFrameHtml(), { waitUntil: 'networkidle' });
  await page.screenshot({ path: path.join(OUTPUT_DIR, 'chrome-extension.webp'), type: 'webp', quality: 92 });

  // 3. Windows Desktop App Screenshot
  console.log('Capturing 3/4: Windows Desktop App...');
  await page.setContent(getWindowsDesktopHtml(), { waitUntil: 'networkidle' });
  await page.screenshot({ path: path.join(OUTPUT_DIR, 'windows-desktop.webp'), type: 'webp', quality: 92 });

  // 4. Mobile PWA Screenshot
  console.log('Capturing 4/4: Mobile PWA App...');
  await page.setContent(getMobilePwaHtml(), { waitUntil: 'networkidle' });
  await page.screenshot({ path: path.join(OUTPUT_DIR, 'mobile-pwa.webp'), type: 'webp', quality: 92 });

  await browser.close();
  console.log('All 4 real service screenshots generated successfully in ' + OUTPUT_DIR);
}

run().catch(err => {
  console.error('Failed to generate screenshots:', err);
  process.exit(1);
});
