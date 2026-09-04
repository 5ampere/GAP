"use client";

import { useI18n } from "@/lib/i18n";
import type { DayBlueprint } from "@/lib/types";

interface Props {
  days: DayBlueprint[];
  active: number;
  onChange: (i: number) => void;
}

// 日切换条：第 k 天 …（v1.17 去达标，tab 不再带达标小标/点）。
export default function DayTabs({ days, active, onChange }: Props) {
  const { L } = useI18n();
  return (
    <div className="day-tabs" role="tablist" aria-label={L("训练日", "Training days")}>
      {days.map((d, i) => {
        const cls = "day-tab" + (active === i ? " is-active" : "");
        return (
          <button
            key={d.day}
            type="button"
            role="tab"
            aria-selected={active === i}
            className={cls}
            onClick={() => onChange(i)}
          >
            {L(d.labelZh, d.labelEn)}
          </button>
        );
      })}
    </div>
  );
}
