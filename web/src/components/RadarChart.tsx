"use client";

import { useI18n } from "@/lib/i18n";
import { abilities, layers } from "@/lib/data";

interface Props {
  current: Record<string, number>;
  target?: Record<string, number>;
  showLegend?: boolean;
}

// 1:1 正方形雷达图（放大显示）
// MAXR 收小以在最左/最右的轴标签与画布边缘之间留出完整空间，避免文字被裁切，正方形背景框不变。
const W = 640;
const H = 640;
const CX = 320;
const CY = 320;
const MAXR = 232;

function polar(profile: Record<string, number>) {
  const n = abilities.length;
  return abilities.map((a, i) => {
    const v = Math.max(0, Math.min(5, profile[a.code] ?? 0));
    const ang = (i / n) * Math.PI * 2 - Math.PI / 2;
    const r = (v / 5) * MAXR;
    return { x: CX + r * Math.cos(ang), y: CY + r * Math.sin(ang) };
  });
}
function ringPts(r: number) {
  const n = abilities.length;
  return abilities.map((a, i) => {
    const ang = (i / n) * Math.PI * 2 - Math.PI / 2;
    return { x: CX + (r / 5) * MAXR * Math.cos(ang), y: CY + (r / 5) * MAXR * Math.sin(ang) };
  });
}
function toPoints(pts: { x: number; y: number }[]) {
  return pts.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
}

export default function RadarChart({ current, target, showLegend = true }: Props) {
  const { L } = useI18n();
  const targetPts = target ? toPoints(polar(target)) : null;
  const currentPts = toPoints(polar(current));

  return (
    <div>
      <svg className="radar-svg" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="capacity radar chart">
        {[1, 2, 3, 4, 5].map((ring) => (
          <polygon
            key={ring}
            points={toPoints(ringPts(ring))}
            style={{ fill: "none", stroke: "var(--separator)", strokeWidth: 1 }}
          />
        ))}
        {abilities.map((a, i) => {
          const ang = (i / abilities.length) * Math.PI * 2 - Math.PI / 2;
          const x2 = (CX + MAXR * Math.cos(ang)).toFixed(1);
          const y2 = (CY + MAXR * Math.sin(ang)).toFixed(1);
          const lx = (CX + (MAXR + 26) * Math.cos(ang)).toFixed(1);
          const ly = (CY + (MAXR + 26) * Math.sin(ang)).toFixed(1);
          const lyr = layers.find((l) => l.key === a.layer)!;
          const anchor = Math.cos(ang) > 0.35 ? "start" : Math.cos(ang) < -0.35 ? "end" : "middle";
          return (
            <g key={a.code}>
              <line x1={CX} y1={CY} x2={x2} y2={y2} style={{ stroke: "var(--separator)", strokeWidth: 1 }} />
              <text
                x={lx}
                y={ly}
                fontSize="12"
                style={{ fill: `var(${lyr.cssVar})` }}
                textAnchor={anchor}
                dominantBaseline="middle"
              >
                {L(a.zh, a.en)}
              </text>
            </g>
          );
        })}
        {targetPts && <polygon points={targetPts} style={{ fill: "none", stroke: "var(--text-secondary)", strokeWidth: 1.5 }} strokeDasharray="5 5" />}
        <polygon points={currentPts} style={{ fill: "var(--accent-faint)", stroke: "var(--accent)", strokeWidth: 2 }} strokeLinejoin="round" />
      </svg>
      {showLegend && (
        <div className="radar-legend">
          <span>
            <i className="legend-line" style={{ background: "var(--accent)" }} />
            {L("现状", "Current")}
          </span>
          {target && (
            <span>
              <i className="legend-line" style={{ background: "var(--text-secondary)" }} />
              {L("目标", "Target")}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
