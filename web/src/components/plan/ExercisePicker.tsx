"use client";

import { categoryLabel, exercises, exercise } from "@/lib/data";
import { useI18n } from "@/lib/i18n";
import type { Exercise, ExerciseChoice } from "@/lib/types";

interface Props {
  code: string | null; // 当前选中能力（null = 本日无目标能力）
  added: ExerciseChoice[]; // 本日已加入（禁用重复加入）
  onAdd: (id: string) => void;
}

// 动作选择矩阵：只列「当前选中能力 cover>0」的动作，
// 主能力优先、cover 降序；grid 卡片 3 列（断点 2/1 列）；无器械筛选、无分组、
// 不显示刺激当量数值（v1.17 去精度）。
export default function ExercisePicker({ code, added, onAdd }: Props) {
  const { L } = useI18n();
  const addedIds = new Set(added.map((c) => c.exerciseId));

  if (!code) {
    return (
      <p className="text-tertiary" style={{ fontSize: 13, margin: 0 }}>
        {L("本日无目标能力，可自由安排恢复或机动。", "No target abilities today — free recovery / mobility.")}
      </p>
    );
  }

  const list: Exercise[] = exercises
    .filter((e) => (e.cover[code] ?? 0) > 0)
    .sort((a, b) => {
      const pa = (a.primary === code ? 1 : 0) - (b.primary === code ? 1 : 0);
      return pa !== 0 ? -pa : (b.cover[code] ?? 0) - (a.cover[code] ?? 0);
    });

  if (!list.length) {
    return (
      <p className="text-tertiary" style={{ fontSize: 13, margin: 0 }}>
        {L("该能力暂无匹配动作。", "No matching exercises for this ability yet.")}
      </p>
    );
  }

  return (
    <div className="eq-grid">
      {list.map((e) => {
        const ex = exercise(e.id);
        const cat = categoryLabel[ex.category] ?? { zh: ex.category, en: ex.category };
        const on = addedIds.has(e.id);
        return (
          <div className="eq-card" key={e.id}>
            <div className="eq-main">
              <div className="eq-name">
                {L(ex.zh, ex.en)}
                <span className="badge badge--maint eq-cat">{L(cat.zh, cat.en)}</span>
              </div>
              <div className="eq-dose tnum">
                {ex.setsMin}–{ex.setsMax} 组 × {ex.reps}
                {ex.rpe && ex.rpe !== "低" ? ` · RPE ${ex.rpe}` : ""} · ≈{ex.minutes}min
              </div>
              <div className="eq-equip">
                {ex.equipment.map((q) => (
                  <span key={q} className="eq-tag">{q}</span>
                ))}
              </div>
              <details className="eq-detail">
                <summary>{L("要点 / 退阶", "Cue / Regression")}</summary>
                <div className="eq-cue">{ex.cue}</div>
                <div className="eq-reg">{L("退阶：", "Regression: ")}{ex.regression}</div>
              </details>
            </div>
            <button type="button" className="btn btn-sm btn-secondary eq-add" disabled={on} onClick={() => onAdd(e.id)}>
              {on ? L("已加入", "Added") : L("加入", "Add")}
            </button>
          </div>
        );
      })}
    </div>
  );
}
