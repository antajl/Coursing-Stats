with open('backend/scripts/export/export-protocol-vector.ts', 'r', encoding='utf-8') as f:
    text = f.read()

target = """  const isRacing = comp.event.event_type === 'racing' || 
    (comp.event.competition_type && comp.event.competition_type.toLowerCase().includes('бег')) ||
    comp.results.some(r => r.raw_scores_json?.format === 'racing');

  if (isRacing) {
    return buildRacingProtocolHtml(comp);
  }
  return buildCoursingProtocolHtml(comp);"""

replacement = """  if (hasCoursing) {
    return buildCoursingProtocolHtml(comp);
  }

  const isRacing = comp.event.event_type === 'racing' || 
    hasRacing ||
    (comp.event.competition_type && (comp.event.competition_type.toLowerCase().includes('рейсинг') || comp.event.competition_type.toLowerCase().includes('круг')));

  if (isRacing) {
    return buildRacingProtocolHtml(comp);
  }
  return buildCoursingProtocolHtml(comp);"""

norm_text = text.replace('\r\n', '\n')
norm_target = target.replace('\r\n', '\n')
norm_replacement = replacement.replace('\r\n', '\n')

assert norm_target in norm_text, "target not found in export-protocol-vector.ts"
new_text = norm_text.replace(norm_target, norm_replacement)
if '\r\n' in text:
    new_text = new_text.replace('\n', '\r\n')

with open('backend/scripts/export/export-protocol-vector.ts', 'w', encoding='utf-8') as f:
    f.write(new_text)

print("Updated export-protocol-vector.ts router.")
