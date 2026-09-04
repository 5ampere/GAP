"use client";

import { ability, categoryLabel, exercise } from "@/lib/data";
import { useI18n } from "@/lib/i18n";
import type { DayAbilityTarget, ExerciseChoice } from "@/lib/types";
import { FACTORS, setsRange, tierLabel, type TierKey } from "./shared";

interface Props {
  targets: DayAbilityTarget[]; // 当日目标能力（顺序 = 组顺序；空 = 自由日）
  tier: Record<string, TierKey>; // 能力 code → 优先级档（整体缺口口径）
  choices: ExerciseChoice[]; // 本日已选（已含单归属 ability；无归属 = 通用动作）
  selected: string | null; // 当前选中能力（联动板块③）
  onSelect: (code: string) => void;
  onFactor: (id: string, dir: -1 | 1) => void;
  onRemove: (id: string) => void;
}

// 目标能力分组（v1.18 取代 AbilityCard，见 6.4.3）：每个目标能力一个「能力组」——
// 组头 = 能力全称 + 优先级档 chip（高/中/低三档色，整行可点 → 联动板块③）；
// 组内直接列出**该能力已加入的动作**（剂量/次数/RPE/分钟 + 倍率步进 + 移除），**无「已选 n–m 组」统计**。
// 动作单归属：一个动作只出现在一个能力组；cover 全 0 的无归属动作（多为热身/收尾补位）
// 归入尾部弱化的「通用动作（准备 / 收尾）」组。本日无目标能力 → 空态/仅通用动作。
export default function AbilityGroup({ targets, tier, choices, selected, onSelect, onFactor, onRemove }: Props) {
  const { L } = useI18n();

  const row = (c: ExerciseChoice) => {
    const ex = exercise(c.exerciseId);
    const cat = categoryLabel[ex.category] ?? { zh: ex.category, en: ex.category };
    const f = c.factor;
    const ci = FACTORS.indexOf(f);
    return (
      <div className="ag-row" key={c.exerciseId}>
        <div className="ag-main">
          <span className="chosen-name">{L(ex.zh, ex.en)}</span>
          <span className="badge badge--maint">{L(cat.zh, cat.en)}</span>
          <span className="chosen-dose tnum">
            {setsRange(ex, f)} 组 × {ex.reps}
            {ex.rpe && ex.rpe !== "低" ? ` · RPE${ex.rpe}` : ""} ≈{Math.round(ex.minutes * f)}min
          </span>
        </div>
        <div className="chosen-ops">
          <div className="factor-stepper" title={L("强度倍率（空闲少减量，空闲多加量）", "Intensity factor")}>
            <button type="button" aria-label="down" onClick={() => onFactor(c.exerciseId, -1)} disabled={ci <= 0}>−</button>
            <span className={`tnum${f !== 1 ? " is-changed" : ""}`}>{f}×</span>
            <button type="button" aria-label="up" onClick={() => onFactor(c.exerciseId, 1)} disabled={ci >= FACTORS.length - 1}>＋</button>
          </div>
          <button type="button" className="chosen-remove" onClick={() => onRemove(c.exerciseId)} aria-label={L("移除", "Remove")}>✕</button>
        </div>
      </div>
    );
  };

  // 分组：目标组（按 targets 顺序）在前，无归属动作集中成尾部通用组。
  const groups: { code: string; items: ExerciseChoice[] }[] = targets.map((t) => ({ code: t.code, items: [] }));
  const generic: ExerciseChoice[] = [];
  choices.forEach((c) => {
    const i = c.ability ? targets.findIndex((t) => t.code === c.ability) : -1;
    (i >= 0 ? groups[i].items : generic).push(c);
  });

  const genericGroup = (
    <div className="ag-group ag-generic" key="__generic">
      <div className="ag-head" aria-hidden>
        <span className="ag-name">{L("通用动作（准备 / 收尾）", "Generic (warm-up / cool-down)")}</span>
      </div>
      <div className="ag-body">{generic.map(row)}</div>
    </div>
  );

  // 本日无目标能力：无动作 → 自由日空态；有动作（多为套用的热身项）→ 仅通用组便于编辑/移除。
  if (!targets.length) {
    if (!generic.length) {
      return (
        <p className="text-tertiary" style={{ fontSize: 13, margin: 0 }}>
          {L("本日无目标能力，可自由安排恢复或机动。", "No targets today — free recovery / mobility.")}
        </p>
      );
    }
    return <div className="ag-list">{genericGroup}</div>;
  }

  return (
    <div className="ag-list">
      {groups.map((g) => {
        const a = ability(g.code);
        const k = tier[g.code] ?? "low";
        const tl = tierLabel(k);
        const active = selected === g.code;
        const headCls = "ag-head" + (active ? " is-active" : "");
        return (
          <div className={"ag-group" + (active ? " is-active" : "")} key={g.code}>
            <button
              type="button"
              className={headCls}
              onClick={() => onSelect(g.code)}
              aria-pressed={active}
            >
              <span className="ag-name">{L(a.zh, a.en)}</span>
              <span className={`tier-chip is-${k}`}>{L("优先级", "Priority")} · {L(tl.zh, tl.en)}</span>
            </button>
            <div className="ag-body">
              {g.items.length ? (
                g.items.map(row)
              ) : (
                <div className="ag-empty">
                  {L("尚未添加 · 从下方动作库为它选动作", "Nothing added yet — pick below for this ability")}
                </div>
              )}
            </div>
          </div>
        );
      })}
      {generic.length ? genericGroup : null}
    </div>
  );
}
