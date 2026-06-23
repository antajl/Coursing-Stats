import assert from "node:assert/strict";
import { parseFromBodyText } from "./parse-results-coursing.mjs";

/**
 * Регресс-тест на синтетическом тексте, повторяющем РЕАЛЬНУЮ структуру
 * страницы результатов (проверено на http://procoursing.ru/2026/2026-04-04_Complete_Results_Coursing.html):
 *  - кличка рус/лат переносится через "/" на следующую строку
 *  - после основной строки идёт строка-продолжение с баллами "Общ."
 *  - итог круга = Спец.-сумма + Общ.-сумма (77+79=156, 82+80=162, 156+162=318)
 *  - запись без призового места (только каталожный номер) и с
 *    дисквалификацией во втором круге (текст вместо баллов)
 *
 * Запуск: node scripts/test-parser.mjs
 */

const bodyText = `**Группа - Класс - Пол**
1 *2* ИМЯ ПОРОДА КЛИЧКА РУС /
RUS DOG'MA PARKER *30* 15 16 16 15 15 **77** **156** *50* 16 17 17 15 17 **82** **162** **318** + Чемпион РКФ, RegCACL
15 16 16 16 16 **79** 16 16 16 15 17 **80**
*7* ИМЯ ПОРОДА КЛИЧКА БЕЗ МЕСТА /
ALTAY *1* 15 16 14 14 10 **69** **137** *16* дисквалифицирован **137**
14 14 14 13 13 **68**`;

const results = parseFromBodyText(bodyText);

assert.equal(results.length, 2, "должно получиться ровно 2 записи (а не 4 — строки-продолжения не должны стать отдельными собаками)");

const [first, second] = results;

assert.equal(first.placement, 1);
assert.equal(first.catalog_no, 2);
assert.equal(first.total_score, 318, "итог = 156+162, должен взяться из основной строки, а не из строки-продолжения");
assert.equal(first.qualification, "Чемпион РКФ, RegCACL");
assert.deepEqual(first.raw_scores_bold_numbers, [77, 156, 82, 162, 318, 79, 80]);

assert.equal(second.placement, null, "без призового места — placement должен быть null, а не подхватывать число из продолжения");
assert.equal(second.catalog_no, 7);
assert.equal(second.total_score, 137, "при дисквалификации во 2-м круге итог = только 1-й круг");
assert.equal(second.qualification, null);

console.log("OK: все проверки прошли (2 записи, итоги/места/квалификации корректны)");
