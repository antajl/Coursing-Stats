/**
 * Shared CSS styles and media queries for official vector HTML/PDF protocols.
 * Single source of truth for coursing, racing, and marathon tables.
 */

export interface ProtocolStyleOptions {
  discipline?: 'coursing' | 'racing' | 'team';
  resultsCount?: number;
}

export function getProtocolStyles(options: ProtocolStyleOptions = {}): string {
  const { discipline = 'coursing', resultsCount = 20 } = options;
  const isCompact = resultsCount <= 14;

  if (discipline === 'team') {
    return `
    @page {
      size: A4 landscape;
      margin: 3mm 4mm 3mm 4mm;
    }
    html, body {
      margin: 0;
      padding: 0;
      background-color: #ffffff;
      font-family: Arial, "Helvetica Neue", Helvetica, sans-serif;
      font-size: 9pt;
      line-height: 1.2;
      color: #000000;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    table.protocol-table {
      width: 100%;
      border-collapse: separate;
      border-spacing: 1.5px;
      background-color: #ffffff;
      margin: 0;
      padding: 0;
    }
    th, td {
      border-top: 1px solid #4c4c4c;
      border-left: 1px solid #4c4c4c;
      border-right: 1px solid #b2b2b2;
      border-bottom: 1px solid #b2b2b2;
      background-color: #ffffff;
      padding: 3.5px 2px;
      text-align: center;
      vertical-align: middle;
      font-size: 9pt;
      font-weight: normal;
    }
    tr.top-title-row td {
      font-size: 13pt;
      font-weight: bold;
      padding: 6px 4px;
    }
    tr.meta-row td {
      font-size: 9.5pt;
      font-weight: normal;
      padding: 3px 4px;
      text-align: center;
    }
    tr.col-header td {
      font-size: 9pt;
      font-weight: normal;
      padding: 3px 1px;
    }
    td.group-header {
      background-color: #c0c0c0 !important;
      font-size: 10pt;
      font-weight: bold;
      text-align: center;
      padding: 3.5px 3px;
    }
    td.status-cell {
      text-align: center;
      font-style: italic;
      font-size: 9pt;
      padding: 4px 3px;
    }
    tr.dns-row td {
      background-color: #c0c0c0 !important;
    }
    tr.participant-row {
      page-break-inside: avoid;
    }
    td.team-roster-cell {
      text-align: left;
      padding: 2.5px 5px;
      line-height: 1.2;
    }
    .team-dog-entry {
      font-size: 8.5pt;
      margin: 1px 0;
    }
    .team-dog-entry.is-reserve {
      color: #777;
      font-style: italic;
    }
    .team-dog-entry .dog-idx {
      font-weight: bold;
      color: #444;
      margin-right: 3px;
    }
    .team-dog-entry .dog-title {
      font-weight: 600;
    }
    .team-dog-entry .dog-specs {
      color: #444;
      font-size: 8pt;
      margin-left: 2px;
    }

    @media print {
      @page {
        size: A4 landscape;
        margin: 1.5mm 3mm 1.5mm 3mm;
      }
      html, body {
        font-size: 7.5pt;
        line-height: 1.1;
      }
      table.protocol-table {
        border-spacing: 0.8px;
      }
      th, td {
        font-size: 7.5pt;
        padding: 1px 1px;
      }
      tr.top-title-row td {
        font-size: 10pt;
        padding: 2px;
      }
      tr.meta-row td {
        font-size: 7.5pt;
        padding: 1.5px 2px;
      }
      tr.col-header td {
        font-size: 7.5pt;
        padding: 1.5px 1px;
      }
      td.group-header {
        font-size: 8pt;
        padding: 1.5px 2px;
      }
      td.team-roster-cell {
        padding: 1px 4px;
        line-height: 1.15;
      }
      .team-dog-entry {
        font-size: 7.2pt;
        margin: 0;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .team-dog-entry .dog-specs {
        font-size: 6.8pt;
      }
    }
`;
  }

  const bodyFontSize = isCompact ? '10pt' : '11pt';
  const thTdPadding = isCompact ? '2.5px 2px' : '4px 3px';
  const thTdFontSize = isCompact ? '9.5pt' : '10.5pt';
  const topTitlePadding = isCompact ? '5px 4px' : '7px 4px';
  const metaRowPadding = isCompact ? '2.5px 3px' : '3.5px 4px';
  const metaRowFontSize = isCompact ? '9.5pt' : '10.5pt';

  return `
    @page {
      size: A4 landscape;
      margin: 1.5mm 1.5mm 1.5mm 1.5mm;
    }
    *, *::before, *::after {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    html, body {
      margin: 0;
      padding: 0;
      width: 100%;
      background: #ffffff;
      color: #000000;
      font-family: Arial, "Helvetica Neue", Helvetica, sans-serif;
      font-size: ${bodyFontSize};
      line-height: 1.25;
    }
    table.protocol-table {
      width: 100%;
      border-collapse: separate;
      border-spacing: 1.5px;
      background-color: #ffffff;
      margin: 0;
      padding: 0;
    }
    th, td {
      border-top: 1px solid #4c4c4c;
      border-left: 1px solid #4c4c4c;
      border-right: 1px solid #b2b2b2;
      border-bottom: 1px solid #b2b2b2;
      background-color: #ffffff;
      padding: ${thTdPadding};
      text-align: center;
      vertical-align: middle;
      font-size: ${thTdFontSize};
      font-weight: normal;
    }
    tr.top-title-row td {
      font-size: 14pt;
      font-weight: bold;
      padding: ${topTitlePadding};
    }
    tr.meta-row td {
      font-size: ${metaRowFontSize};
      font-weight: normal;
      padding: ${metaRowPadding};
      text-align: center;
    }
    tr.col-header td {
      font-size: 10pt;
      font-weight: normal;
      padding: 4px 1px;
      ${discipline === 'coursing' ? 'white-space: nowrap;' : ''}
    }
    ${discipline === 'coursing' ? `
    tr.sub-col-header td {
      font-size: 9pt;
      font-weight: normal;
      padding: 3px 0px;
      white-space: nowrap;
    }` : ''}
    tr.group-row {
      page-break-inside: avoid;
      page-break-after: avoid;
    }
    td.group-header {
      background-color: #c0c0c0 !important;
      font-size: 11.5pt;
      font-weight: normal;
      text-align: center;
      padding: 4.5px 3px;
    }
    td.dog-name-cell {
      text-align: center;
      font-size: 10.5pt;
      line-height: 1.25;
      padding: 4px 4px;
    }
    ${discipline === 'racing' ? `
    td.time-speed-cell {
      font-size: 9.5pt;
      line-height: 1.15;
      padding: 3px 2px;
    }` : ''}
    td.status-cell {
      text-align: center;
      font-style: italic;
      font-size: 10pt;
      padding: 4px 3px;
    }
    tr.dns-row td {
      background-color: #c0c0c0 !important;
    }
    tr.participant-row {
      page-break-inside: avoid;
    }

    @media print {
      @page {
        size: A4 landscape;
        margin: 1.5mm 1.5mm 1.5mm 1.5mm;
      }
      html, body {
        font-size: 8.5pt;
        line-height: 1.15;
      }
      th, td {
        font-size: 8.5pt;
        padding: ${discipline === 'coursing' ? '2.2px 1.5px' : '2.5px 1.5px'};
      }
      tr.top-title-row td {
        font-size: 11pt;
        padding: 3px;
      }
      tr.meta-row td {
        font-size: 8.5pt;
        padding: 2px 2px;
      }
      tr.col-header td {
        font-size: 8.5pt;
        padding: 2px 1px;
      }
      ${discipline === 'coursing' ? `
      tr.sub-col-header td {
        font-size: 7.5pt;
        padding: 1.5px 0px;
      }` : ''}
      td.group-header {
        font-size: 9.5pt;
        padding: 2.5px 2px;
      }
      td.dog-name-cell {
        font-size: 8.5pt;
        padding: 2px 3px;
      }
      ${discipline === 'racing' ? `
      td.time-speed-cell {
        font-size: 7.5pt;
        line-height: 1.1;
        padding: 1.5px 1px;
      }` : ''}
      td.status-cell {
        font-size: 8.5pt;
      }
    }
`;
}

export const TOOLBAR_CSS = `
    /* Monochrome document toolbar */
    .cs-toolbar {
      width: 100%;
      box-sizing: border-box;
      background: #ffffff;
      color: #000000;
      border-bottom: 2px solid #000000;
      padding: 5px 8px;
      font-family: Arial, "Helvetica Neue", Helvetica, sans-serif;
      margin: 0 0 4px 0;
      position: sticky;
      left: 0;
      max-width: 100vw;
      z-index: 100;
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;
      scrollbar-width: none;
    }
    .cs-toolbar::-webkit-scrollbar {
      display: none;
    }
    .cs-toolbar-inner {
      display: flex;
      align-items: center;
      gap: 8px;
      width: max-content;
      min-width: 100%;
      box-sizing: border-box;
      flex-wrap: nowrap;
    }
    .cs-toolbar-left {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-shrink: 0;
    }
    .cs-toolbar-divider {
      width: 1px;
      height: 16px;
      background: #b2b2b2;
      flex-shrink: 0;
    }
    .cs-toolbar-brand {
      font-size: 11px;
      font-weight: bold;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: #000000;
      white-space: nowrap;
      flex-shrink: 0;
    }
    .cs-toolbar-title {
      font-size: 12px;
      font-weight: normal;
      color: #222222;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 340px;
      flex-shrink: 1;
    }
    .cs-toolbar-series {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      flex-shrink: 0;
      border-left: 1px solid #b2b2b2;
      padding-left: 8px;
      margin-left: 2px;
    }
    .cs-series-stages {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      flex-shrink: 0;
    }
    .cs-series-label {
      font-size: 11px;
      color: #8c6d37;
      font-weight: bold;
      margin-right: 2px;
      white-space: nowrap;
      flex-shrink: 0;
    }
    .cs-toolbar-actions {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      flex-shrink: 0;
      margin-left: auto;
      border-left: 1px solid #b2b2b2;
      padding-left: 8px;
    }
    .cs-btn {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      padding: 4px 9px;
      border-radius: 3px;
      font-size: 11.5px;
      font-family: Arial, "Helvetica Neue", Helvetica, sans-serif;
      font-weight: normal;
      text-decoration: none;
      cursor: pointer;
      border: 1px solid #4c4c4c;
      background: #ffffff;
      color: #000000;
      transition: background-color 0.1s ease, border-color 0.1s ease;
      white-space: nowrap;
      box-sizing: border-box;
      line-height: 1.2;
      flex-shrink: 0;
    }
    .cs-btn svg {
      flex-shrink: 0;
      display: block;
    }
    .cs-btn:hover {
      background: #f0f0f0;
      border-color: #000000;
    }
    .cs-btn-back {
      font-weight: bold;
    }
    .cs-btn-back:hover {
      background: #000000;
      color: #ffffff;
    }
    .cs-btn-primary {
      background: #000000;
      border-color: #000000;
      color: #ffffff;
      font-weight: bold;
    }
    .cs-btn-primary:hover {
      background: #333333;
      border-color: #333333;
    }
    .cs-btn-stage {
      padding: 3px 8px;
      font-size: 11px;
      border-radius: 12px;
      border-color: #d8c29d;
      background: #faf6ee;
      color: #634d26;
      font-weight: 500;
      flex-shrink: 0;
      text-decoration: none;
      white-space: nowrap;
    }
    .cs-btn-stage:hover {
      background: #ebdcc3;
      border-color: #8c6d37;
      color: #3b280c;
    }
    .cs-stage-active {
      background: #8c6d37 !important;
      border-color: #8c6d37 !important;
      color: #ffffff !important;
      font-weight: bold !important;
    }
    .cs-btn-donino {
      background: #faf6ee;
      border-color: #d8c29d;
      color: #634d26;
      font-weight: 600;
    }
    .cs-btn-donino:hover {
      background: #ebdcc3;
      border-color: #8c6d37;
      color: #3b280c;
    }

    @media (max-width: 960px) {
      .cs-toolbar {
        padding: 4px 8px;
      }
      .cs-toolbar-inner {
        gap: 6px;
        padding-right: 10px;
      }
      .cs-toolbar-title,
      .cs-title-divider {
        display: none !important;
      }
      .cs-toolbar-actions {
        margin-left: 0;
      }
      .cs-btn {
        padding: 4px 8px;
        font-size: 11px;
        min-height: 28px;
      }
      .cs-btn-stage {
        padding: 3px 8px;
        font-size: 11px;
        min-height: 24px;
      }
    }

    @media print {
      .cs-toolbar {
        display: none !important;
      }
    }
`;
