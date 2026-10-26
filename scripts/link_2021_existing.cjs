const fs = require('fs');
const path = require('path');

const links = {
  1574: {
    pdf: 'https://drive.google.com/file/d/1J5Dye3d5_BeGK6f6FhGqQ1dccwyjwO34/view?usp=sharing'
  },
  1573: {
    pdf: 'https://drive.google.com/file/d/1Zu-oEZCuSvjo_Fw8AtcRGRGDfm19g1uq/view?usp=sharing'
  },
  1575: {
    pdf: 'https://drive.google.com/file/d/1otGROaujrR-iQCCbvI8oZKy0QmooNnx9/view?usp=sharing'
  },
  1576: {
    pdf: 'https://drive.google.com/file/d/1I-0WF0MPXaSJfSAb1g1vxyu4kNPW7AE-/view?usp=sharing'
  },
  1577: {
    pdf: 'https://drive.google.com/file/d/1yejEASll_wGx78Oa7QrasxBIGg53xjqu/view?usp=sharing'
  },
  1578: {
    pdf: 'https://drive.google.com/file/d/1bidOrUUzYHW-uxgGedI2dg5Cpqn8Ibwk/view?usp=sharing'
  },
  1579: {
    pdf: 'https://drive.google.com/file/d/1Aum26Cr00pW-LZu782BhPaRBN5mXHxyO/view?usp=sharing'
  },
  1580: {
    pdf: 'https://drive.google.com/file/d/1ByZhVSo7SHLL3TtN7U7uTqL3hFZUzi5G/view?usp=sharing'
  },
  1585: {
    pdf: 'https://drive.google.com/file/d/1zP7mmwGo_b2iq3u35PK0IRdUZq6ugcz5/view?usp=sharing'
  },
  1581: {
    pdf: 'https://drive.google.com/file/d/1zSM7Wod5n86_2ue2ju9Xm8bM7C6pQNCB/view?usp=sharing'
  },
  1582: {
    pdf: 'https://drive.google.com/file/d/1ae5jxoEtkiEzHGDJY4jMxv6nAtro1Wvi/view?usp=sharing',
    catalog: 'https://drive.google.com/file/d/1GP7KEr-kq4oAQtscNf8NqSsqFShZ_4kS/view?usp=sharing'
  },
  1583: {
    pdf: 'https://drive.google.com/file/d/1k9wTVZY3jyqO6YHwfMrZK9yNJwRlqDpi/view?usp=sharing'
  }
};

// 1. Update competition files
const compFiles = fs.readdirSync('data/v1/competitions/2021', { recursive: true }).filter(f => f.endsWith('.json'));
for (const rel of compFiles) {
  const full = path.join('data/v1/competitions/2021', rel);
  const comp = JSON.parse(fs.readFileSync(full, 'utf8'));
  const id = comp.event_id || comp.event.id;
  if (links[id]) {
    comp.results_pdf_url = links[id].pdf;
    comp.event.results_pdf_url = links[id].pdf;
    if (links[id].catalog) {
      comp.catalog_url = links[id].catalog;
      comp.event.catalog_url = links[id].catalog;
    }
    fs.writeFileSync(full, JSON.stringify(comp, null, 2) + '\n', 'utf8');
    console.log(`Updated comp ${id} (${full})`);
  }
}

// 2. Update calendar/2021.json
const calPath = 'data/v1/calendar/2021.json';
const cal = JSON.parse(fs.readFileSync(calPath, 'utf8'));

// Remove duplicate event 20210904 (which pointed to 1581)
cal.events = cal.events.filter(e => e.id !== 20210904);

for (const e of cal.events) {
  // Map event to id
  let targetId = e.id;
  if (e.id === 202109041) targetId = 1581;
  if (e.results_file && e.results_file.includes('1581')) targetId = 1581;
  if (e.results_file && e.results_file.includes('1585')) targetId = 1585;
  if (e.results_file && e.results_file.includes('1574')) targetId = 1574;
  if (e.results_file && e.results_file.includes('1573')) targetId = 1573;
  if (e.results_file && e.results_file.includes('1575')) targetId = 1575;
  if (e.results_file && e.results_file.includes('1576')) targetId = 1576;
  if (e.results_file && e.results_file.includes('1577')) targetId = 1577;
  if (e.results_file && e.results_file.includes('1578')) targetId = 1578;
  if (e.results_file && e.results_file.includes('1579')) targetId = 1579;
  if (e.results_file && e.results_file.includes('1580')) targetId = 1580;
  if (e.results_file && e.results_file.includes('1582')) targetId = 1582;
  if (e.results_file && e.results_file.includes('1583')) targetId = 1583;

  if (links[targetId]) {
    e.results_pdf_url = links[targetId].pdf;
    if (links[targetId].catalog) {
      e.catalog_url = links[targetId].catalog;
    }
  }
}

cal.event_count = cal.events.length;
cal.with_results = cal.events.filter(e => e.has_results).length;
fs.writeFileSync(calPath, JSON.stringify(cal, null, 2) + '\n', 'utf8');
console.log(`Updated calendar/2021.json: count=${cal.event_count}, with_results=${cal.with_results}`);
