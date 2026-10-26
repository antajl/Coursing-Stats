with open('backend/scripts/export/export-protocol-vector.ts', 'r', encoding='utf-8') as f:
    content = f.read()

target = """export function getCoursingBibStyle(heat?: Heat | null): { bg: string; color: string } {
  if (!heat || heat.bib_number == null) {
    return { bg: '#ffffff', color: '#000000' };
  }
  const rawColor = String(heat.bib_color || '').toLowerCase().trim();
  let bg = '#ffffff';
  const color = '#000000';

  if (rawColor === 'red' || rawColor === '#ff0000') {
    bg = '#ff0000';
  } else if (rawColor === 'blue' || rawColor === '#00a2e8' || rawColor === '#00ccff') {
    bg = '#00a2e8';
  } else if (rawColor === 'yellow' || rawColor === '#ffff00' || rawColor === '#ebe1b0' || rawColor === '#f7f6f0') {
    bg = '#f7f6f0'; // Нежный тёплый оттенок белого (off-white)
  } else if (rawColor.startsWith('#') && (rawColor.length === 7 || rawColor.length === 4)) {
    bg = rawColor;
  }
  return { bg, color };
}

export function renderBibCellRowspan(heat?: Heat | null, rowspan: number = 2): string {
  if (!heat || heat.bib_number == null) {
    return `<td rowspan="${rowspan}"></td>`;
  }
  const { bg, color } = getCoursingBibStyle(heat);
  return `<td rowspan="${rowspan}" style="background-color: ${bg} !important; color: ${color}; font-style: italic;">${heat.bib_number}</td>`;
}

export function renderBibCellSingle(heat?: Heat | null): string {
  if (!heat || heat.bib_number == null) {
    return '<td></td>';
  }
  const { bg, color } = getCoursingBibStyle(heat);
  return `<td style="background-color: ${bg} !important; color: ${color}; font-style: italic;">${heat.bib_number}</td>`;
}"""

replacement = """export function getCoursingBibStyle(heat?: Heat | null): { bg: string; color: string } {
  const bibNum = heat?.bib_number ?? heat?.heat_number;
  if (!heat || (bibNum == null && !heat.bib_color)) {
    return { bg: '#ffffff', color: '#000000' };
  }
  const rawColor = String(heat.bib_color || '').toLowerCase().trim();
  let bg = '#ffffff';
  let color = '#000000';

  if (rawColor === 'red' || rawColor === '#ff0000') {
    bg = '#ff0000';
    color = '#ffffff';
  } else if (rawColor === 'blue' || rawColor === '#00a2e8' || rawColor === '#00ccff') {
    bg = '#00a2e8';
    color = '#ffffff';
  } else if (rawColor === 'yellow' || rawColor === '#ffff00' || rawColor === '#ebe1b0' || rawColor === '#f7f6f0') {
    bg = '#f7f6f0'; // Нежный тёплый оттенок белого (off-white)
    color = '#000000';
  } else if (rawColor.startsWith('#') && (rawColor.length === 7 || rawColor.length === 4)) {
    bg = rawColor;
  }
  return { bg, color };
}

export function renderBibCellRowspan(heat?: Heat | null, rowspan: number = 2): string {
  const bibNum = heat?.bib_number ?? heat?.heat_number;
  if (!heat || bibNum == null) {
    return `<td rowspan="${rowspan}"></td>`;
  }
  const { bg, color } = getCoursingBibStyle(heat);
  return `<td rowspan="${rowspan}" style="background-color: ${bg} !important; color: ${color}; font-style: italic;">${bibNum}</td>`;
}

export function renderBibCellSingle(heat?: Heat | null): string {
  const bibNum = heat?.bib_number ?? heat?.heat_number;
  if (!heat || bibNum == null) {
    return '<td></td>';
  }
  const { bg, color } = getCoursingBibStyle(heat);
  return `<td style="background-color: ${bg} !important; color: ${color}; font-style: italic;">${bibNum}</td>`;
}"""

norm_content = content.replace('\r\n', '\n')
norm_target = target.replace('\r\n', '\n')
norm_replacement = replacement.replace('\r\n', '\n')

assert norm_target in norm_content, "target not found!"
new_content = norm_content.replace(norm_target, norm_replacement)

if '\r\n' in content:
    new_content = new_content.replace('\n', '\r\n')

with open('backend/scripts/export/export-protocol-vector.ts', 'w', encoding='utf-8') as f:
    f.write(new_content)

print("export-protocol-vector.ts updated cleanly.")
