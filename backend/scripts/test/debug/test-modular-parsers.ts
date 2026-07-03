import assert from "node:assert/strict";
import { parseCoursingHTML } from "../../parsers/coursing/index";

/**
 * Тест модульного парсера курсинга
 * Использует тот же синтетический текст, что и оригинальный тест
 */

async function testModularParsers() {

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

const result = await parseCoursingHTML(bodyText);

console.log("Модульный парсер курсинга:");
console.log(`Результаты: ${JSON.stringify(result, null, 2)}`);
console.log(`Всего строк-результатов: ${result.results.length}`);

assert.equal(result.results.length, 2, "должно получиться ровно 2 записи");

const [first, second] = result.results;

assert.equal(first.placement, 1);
assert.equal(first.catalog_no, 2);
assert.equal(first.qualification, "Чемпион РКФ, RegCACL");
assert.equal(first.total_score, 318, "итог должен быть 318 (без нормализации)");

assert.equal(second.placement, null, "без призового места — placement должен быть null");
assert.equal(second.catalog_no, 7);
assert.equal(second.status, "disqualified", "дисквалифицирован — статус должен быть disqualified");

console.log("✅ Модульный парсер курсинга прошел тесты");
}

testModularParsers();
