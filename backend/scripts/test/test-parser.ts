import assert from "node:assert/strict";
import { parseCoursingHTML } from "../../parsers/parse-results-coursing";

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

const bodyText = `
<table>
<tr><td colspan="25"><b>Группа - Класс - Пол</b></td></tr>
<tr>
<td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">1</font></td>
<td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000"><i>2</i></font></td>
<td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">ИМЯ ПОРОДА</font></td>
<td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">Класс</font></td>
<td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Пол</font></td>
<td rowspan="2" align="left"><font style="font-size:10pt" face="Arial" color="#000000">КЛИЧКА РУС /<br>RUS DOG'MA PARKER</font></td>
<td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>30</i></font></td>
<td><font style="font-size:10pt" face="Arial" color="#000000">15</font></td>
<td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td>
<td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td>
<td><font style="font-size:10pt" face="Arial" color="#000000">15</font></td>
<td><font style="font-size:10pt" face="Arial" color="#000000">15</font></td>
<td><font style="font-size:10pt" face="Arial" color="#000000"><b>77</b></font></td>
<td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>156</b></font></td>
<td rowspan="2" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>50</i></font></td>
<td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td>
<td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td>
<td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td>
<td><font style="font-size:10pt" face="Arial" color="#000000">15</font></td>
<td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td>
<td><font style="font-size:10pt" face="Arial" color="#000000"><b>82</b></font></td>
<td rowspan="2"><font style="font-size:11pt" face="Arial" color="#000000"><b>162</b></font></td>
<td rowspan="2"><font style="font-size:12pt" face="Arial" color="#000000"><b>318</b></font></td>
<td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">CC</font></td>
<td rowspan="2"><font style="font-size:10pt" face="Arial" color="#000000">Чемпион РКФ, RegCACL</font></td>
</tr>
<tr>
<td><font style="font-size:10pt" face="Arial" color="#000000">15</font></td>
<td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td>
<td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td>
<td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td>
<td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td>
<td><font style="font-size:10pt" face="Arial" color="#000000"><b>79</b></font></td>
<td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td>
<td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td>
<td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td>
<td><font style="font-size:10pt" face="Arial" color="#000000">15</font></td>
<td><font style="font-size:10pt" face="Arial" color="#000000">17</font></td>
<td><font style="font-size:10pt" face="Arial" color="#000000"><b>80</b></font></td>
</tr>
<tr>
<td rowspan="1"><font style="font-size:10pt" face="Arial" color="#000000"></font></td>
<td rowspan="1"><font style="font-size:10pt" face="Arial" color="#000000"><i>7</i></font></td>
<td rowspan="1" align="left"><font style="font-size:10pt" face="Arial" color="#000000">ИМЯ ПОРОДА</font></td>
<td rowspan="1" align="left"><font style="font-size:10pt" face="Arial" color="#000000">Класс</font></td>
<td rowspan="1"><font style="font-size:10pt" face="Arial" color="#000000">Пол</font></td>
<td rowspan="1" align="left"><font style="font-size:10pt" face="Arial" color="#000000">КЛИЧКА БЕЗ МЕСТА /<br>ALTAY</font></td>
<td rowspan="1" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>1</i></font></td>
<td><font style="font-size:10pt" face="Arial" color="#000000">15</font></td>
<td><font style="font-size:10pt" face="Arial" color="#000000">16</font></td>
<td><font style="font-size:10pt" face="Arial" color="#000000">14</font></td>
<td><font style="font-size:10pt" face="Arial" color="#000000">14</font></td>
<td><font style="font-size:10pt" face="Arial" color="#000000">10</font></td>
<td><font style="font-size:10pt" face="Arial" color="#000000"><b>69</b></font></td>
<td rowspan="1"><font style="font-size:11pt" face="Arial" color="#000000"><b>137</b></font></td>
<td rowspan="1" bgcolor="#ff0000"><font style="font-size:10pt" face="Arial" color="#000000"><i>16</i></font></td>
<td><font style="font-size:10pt" face="Arial" color="#000000">дисквалифицирован</font></td>
<td><font style="font-size:10pt" face="Arial" color="#000000"></font></td>
<td><font style="font-size:10pt" face="Arial" color="#000000"></font></td>
<td><font style="font-size:10pt" face="Arial" color="#000000"></font></td>
<td><font style="font-size:10pt" face="Arial" color="#000000"></font></td>
<td rowspan="1"><font style="font-size:11pt" face="Arial" color="#000000"><b>137</b></font></td>
<td rowspan="1"><font style="font-size:10pt" face="Arial" color="#000000"></font></td>
<td rowspan="1"><font style="font-size:10pt" face="Arial" color="#000000"></font></td>
<td rowspan="1"><font style="font-size:10pt" face="Arial" color="#000000"></font></td>
</tr>
</table>`;

async function run() {
const { results } = await parseCoursingHTML(bodyText);

assert.equal(results.length, 2, "должно получиться ровно 2 записи (а не 4 — строки-продолжения не должны стать отдельными собаками)");

const [first, second] = results;

assert.equal(first.placement, 1);
assert.equal(first.catalog_no, 2);
assert.equal(first.qualification, "Чемпион РКФ, RegCACL");
assert.equal(first.total_score, 318, "итог = grand_total без деления на судей");

assert.equal(second.placement, null, "без призового места — placement должен быть null");
assert.equal(second.catalog_no, 7);
assert.ok(second.qualification === null || second.qualification === "", "qualification должен быть null или пустой строкой");
// Дисквалификация может давать null total_score - это допустимо

console.log("OK: все проверки прошли (2 записи, итоги/места/квалификации корректны)");
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});

