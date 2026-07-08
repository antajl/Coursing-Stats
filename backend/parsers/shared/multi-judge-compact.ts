/**
 * Компактный формат procoursing 2023–2024: 23 ячейки в строке 1, по 10 ячеек на каждого доп. судью.
 */

import { extractNumber, extractBoldNumber, extractItalicNumber, extractBibColor, cleanText } from '../coursing/utils'

function sumScores(scores) {
  if (!scores.some((s) => s !== null)) return null
  return scores.reduce((acc, s) => acc + (s ?? 0), 0)
}

function readJudgeScores($cells, start, end, cellCount) {
  const scores = []
  for (let i = start; i <= end; i++) {
    if (i < cellCount) {
      const score = extractNumber($cells.eq(i).text())
      scores.push(score !== null && score <= 20 ? score : null)
    } else {
      scores.push(null)
    }
  }
  return scores
}

function isScoreContinuationRow($cells) {
  const cellCount = $cells.length
  if (cellCount < 10 || cellCount > 12) return false
  let scoreCells = 0
  for (let i = 0; i < Math.min(cellCount, 10); i++) {
    const n = extractNumber($cells.eq(i).text())
    if (n !== null && n <= 20) scoreCells++
  }
  return scoreCells >= 5
}

/** @param judgeCount число судей (2+). */
export function parseMultiJudgeCompact($, $cells, cellCount, allRows, rowIndex, judgeCount, processedRows) {
  const heat1Cell = $cells.eq(6)
  const heat1Number = extractItalicNumber(heat1Cell) ?? extractNumber(heat1Cell.text().trim())
  const heat1Color = extractBibColor(heat1Cell)

  const heat1Judge1Scores = readJudgeScores($cells, 7, 11, cellCount)
  const heat1Total = cellCount > 12 ? extractBoldNumber($cells.eq(12)) : null

  const heat2Cell = cellCount > 13 ? $cells.eq(13) : null
  const heat2Number = heat2Cell
    ? extractItalicNumber(heat2Cell) ?? extractNumber(heat2Cell.text().trim())
    : null
  const heat2Color = heat2Cell ? extractBibColor(heat2Cell) : null
  const heat2Judge1Scores = readJudgeScores($cells, 14, 18, cellCount)
  const heat2Total = cellCount > 19 ? extractBoldNumber($cells.eq(19)) : null

  const grandTotal = cellCount > 20 ? extractBoldNumber($cells.eq(20)) : null
  const vc = cellCount > 21 ? cleanText($cells.eq(21).text()) : null
  const qualification = cellCount > 22 ? cleanText($cells.eq(22).text()) : null

  const judgesByHeat = {
    heat1: [heat1Judge1Scores],
    heat2: [heat2Judge1Scores],
  }

  for (let j = 2; j <= judgeCount; j++) {
    const followIdx = rowIndex + (j - 1)
    if (followIdx >= allRows.length) break
    const $follow = $(allRows[followIdx]).find('td')
    if (!isScoreContinuationRow($follow)) break
    judgesByHeat.heat1.push(readJudgeScores($follow, 0, 4, $follow.length))
    judgesByHeat.heat2.push(readJudgeScores($follow, 5, 9, $follow.length))
    processedRows?.add(followIdx)
  }

  const buildJudges = (scoreRows) =>
    scoreRows
      .map((scores, idx) => ({
        judge_number: idx + 1,
        scores,
        sum: sumScores(scores),
      }))
      .filter((j) => j.scores.some((s) => s !== null))

  const heats = []

  if (heat1Number !== null) {
    heats.push({
      heat_number: 1,
      bib_number: heat1Number,
      bib_color: heat1Color,
      judges: buildJudges(judgesByHeat.heat1),
      total: heat1Total,
      disqualified: false,
      disqualification_reason: null,
    })
  }

  if (heat1Number !== null) {
    heats.push({
      heat_number: 2,
      bib_number: heat2Number,
      bib_color: heat2Color,
      judges: buildJudges(judgesByHeat.heat2),
      total: heat2Total,
      disqualified: false,
      disqualification_reason: null,
    })
  }

  return {
    total_score: grandTotal,
    judge_count: judgeCount,
    qualification,
    vc,
    raw_scores_json: JSON.stringify({ heats }),
    heats,
  }
}

export function isCompactMultiJudgeRow(cellCount, hasHeatData) {
  return hasHeatData && cellCount >= 20 && cellCount < 24
}
