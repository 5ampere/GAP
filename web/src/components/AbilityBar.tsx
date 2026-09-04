"use client";

import { ability, layer } from "@/lib/data";
import { useI18n } from "@/lib/i18n";

interface Props {
  code: string;
  current: number;
  target: number;
  showLabel?: boolean;
}

export default function AbilityBar({ code, current, target, showLabel = true }: Props) {
  const { L } = useI18n();
  const a = ability(code);
  const lyr = layer(a.layer);
  const pct = Math.max(0, Math.min(100, (current / 5) * 100));
  const tgt = Math.max(0, Math.min(100, (target / 5) * 100));

  return (
    <div className="ability-bar" style={showLabel ? undefined : { gridTemplateColumns: "1fr 56px" }}>
      {showLabel && (
        <div>
          <span className="micro">{L(a.zh, a.en)}</span>
        </div>
      )}
      <div className="bar-track">
        <div className="bar-fill" style={{ width: `${pct}%`, background: `var(${lyr.cssVar})` }} />
        <div className="bar-target" style={{ left: `${tgt}%` }} />
      </div>
      <div className="bar-val">{current.toFixed(1)}</div>
    </div>
  );
}
