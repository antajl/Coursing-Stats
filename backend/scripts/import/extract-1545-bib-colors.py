"""Extract bib (попона) colors from BreedChRKF Donino PDF → JSON.
Red = red, azure #f0ffff = white bib (same as procoursing HTML).
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

import fitz

PDF = Path(sys.argv[1] if len(sys.argv) > 1 else r"D:\Downloads\2026-06-21_Coursing_BreedChRKF_Donino.pdf")
OUT = Path(sys.argv[2] if len(sys.argv) > 2 else Path("data/local/import-1545-bib-colors.json"))


def classify_fill(f) -> str | None:
    if not f or len(f) < 3:
        return None
    r, g, b = f[:3]
    if r > 0.9 and g < 0.25 and b < 0.25:
        return "red"
    # procoursing white bib ≈ #f0ffff
    if r > 0.90 and g > 0.95 and b > 0.95:
        return "#f0ffff"
    return None


def main() -> None:
    doc = fitz.open(str(PDF))
    pairs: list[dict] = []
    for pi in range(doc.page_count):
        page = doc[pi]
        reds: list[fitz.Rect] = []
        azures: list[fitz.Rect] = []
        for d in page.get_drawings():
            color = classify_fill(d.get("fill"))
            if not color:
                continue
            rect = fitz.Rect(d["rect"])
            if not (18 < rect.width < 50 and 18 < rect.height < 55):
                continue
            (reds if color == "red" else azures).append(rect)

        def color_at(x: float, y: float) -> str | None:
            pt = fitz.Point(x, y)
            for r in reds:
                if r.contains(pt):
                    return "red"
            for r in azures:
                if r.contains(pt):
                    return "#f0ffff"
            return None

        # Group bib-sized digit words by row (y)
        rows: dict[int, list[tuple[float, str, str]]] = {}
        for w in page.get_text("words"):
            x0, y0, x1, y1, text = w[:5]
            if not str(text).isdigit() or len(str(text)) > 3:
                continue
            cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
            c = color_at(cx, cy)
            if not c:
                continue
            # bib columns (slightly different on breed pages)
            if 300 <= cx <= 360:
                heat = 1
            elif 510 <= cx <= 580:
                heat = 2
            else:
                continue
            yk = round(y0)
            rows.setdefault(yk, []).append((cx, str(text), c))

        for yk, items in sorted(rows.items()):
            items.sort(key=lambda t: t[0])
            h1 = next((t for t in items if 300 <= t[0] <= 360), None)
            h2 = next((t for t in items if 510 <= t[0] <= 580), None)
            if not h1 and not h2:
                continue
            pairs.append(
                {
                    "page": pi + 1,
                    "y": yk,
                    "bib1": int(h1[1]) if h1 else None,
                    "bib1_color": h1[2] if h1 else None,
                    "bib2": int(h2[1]) if h2 else None,
                    "bib2_color": h2[2] if h2 else None,
                }
            )

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(pairs, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Wrote {OUT} ({len(pairs)} bib rows)")


if __name__ == "__main__":
    main()
