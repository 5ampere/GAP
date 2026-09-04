"use client";

import { ability } from "@/lib/data";
import { useI18n } from "@/lib/i18n";
import type { GapItem } from "@/lib/types";
import { tierColor, tierLabel, tierOf } from "@/components/plan/shared";

interface Props {
  gaps: GapItem[];
}

const ORDER: Record<string, number> = { high: 0, mid: 1, low: 2 };

// 能力缺口横向条形图（v1.17 去精度）：一行一项能力，条长 ∝ 缺口值，
// 颜色按 高/中/低 三档（红/琥珀/绿，见 6.4.5 第 8 步），行尾标优先级档、不标缺口数值。
// 排序：档位高者在前，同档内缺口大者在前。
export default function GapBarChart({ gaps }: Props) {
  const { L } = useI18n();
  const rows = [...gaps].sort((a, b) => {
    const d = (ORDER[tierOf(a.deficit)] ?? 0) - (ORDER[tierOf(b.deficit)] ?? 0);
    return d !== 0 ? d : b.deficit - a.deficit;
  });
  const maxDef = rows.length ? Math.max(...rows.map((g) => g.deficit)) : 0;

  return (
    <div className="gap-bars">
      {rows.map((g) => {
        const a = ability(g.code);
        const k = tierOf(g.deficit);
        const tl = tierLabel(k);
        const pct = maxDef > 0 ? Math.max(0, (g.deficit / maxDef) * 100) : 0;
        return (
          <div className="gap-bar-row" key={g.code}>
            <div className="gap-bar-name">{L(a.zh, a.en)}</div>
            <div className="gap-bar-track">
              <div className="gap-bar-fill" style={{ width: `${pct}%`, background: tierColor(k) }} />
            </div>
            <div className="gap-bar-tier">
              <span className={`tier-chip is-${k}`}>{L(tl.zh, tl.en)}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
