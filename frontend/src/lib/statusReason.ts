const REASON_KEYWORD =
  /(?:отстранение|неявка|снят|снята|снятие|ветеринар|владелец|дисквал|не\s*финиш|сошёл|сошла|сход|уход|отстранена)/i;

/** Краткая причина для UI; старые записи могут содержать всю строку протокола. */
export function displayStatusReason(reason: string | null | undefined): string | null {
  if (!reason) return null;

  const trimmed = reason.trim();
  if (!trimmed) return null;
  if (!trimmed.includes('\n') && trimmed.length <= 80) return trimmed;

  const lines = trimmed.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  for (let i = lines.length - 1; i >= 0; i--) {
    const line = lines[i];
    if (line.length <= 80 && REASON_KEYWORD.test(line)) {
      return line;
    }
  }

  const keywordMatch = trimmed.match(REASON_KEYWORD);
  if (keywordMatch) {
    const word = keywordMatch[0];
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  }

  return null;
}
