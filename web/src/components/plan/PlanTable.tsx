"use client";

import { ability, categoryLabel, exercise } from "@/lib/data";
import { useI18n } from "@/lib/i18n";
import type { Plan } from "@/lib/types";
import { estimatedMinutes, setsRange, tierLabel, tierOf, type TierKey } from "./shared";

interface Props {
  plan: Plan;
  onReedit: () => void;
}

// 总表（Plan Table · 只读，v1.17 去精度）：确认后展示最终计划。
// 列 = 天 / 主题 / 能力（优先级档）/ 动作明细 / 预估；无目标分/达成分/达标字样。
export default function PlanTable({ plan, onReedit }: Props) {
  const { L } = useI18n();
  // 能力整体缺口 → 档位（与仪表盘②/编排板块②同口径）
  const tierMap: Record<string, TierKey> = {};
  plan.gaps.forEach((g) => {
    tierMap[g.code] = tierOf(g.deficit);
  });

  return (
    <div className="mt-6">
      <div className="flex-between" style={{ flexWrap: "wrap", gap: 12 }}>
        <p className="caption">
          {L("本轮共", "Cycle")} <b className="tnum">{plan.days.length}</b> {L("个训练日", "training days")}
          {plan.confirmedAt ? (
            <span className="text-tertiary"> · {L("确认于", "confirmed")} {new Date(plan.confirmedAt).toLocaleString()}</span>
          ) : null}
        </p>
        <button type="button" className="btn btn-sm btn-secondary" onClick={onReedit}>
          {L("重新编排", "Re-edit")}
        </button>
      </div>

      <div className="table-scroll mt-4">
        <table className="plan-table">
          <thead>
            <tr>
              <th>{L("天", "Day")}</th>
              <th>{L("主题", "Theme")}</th>
              <th>{L("能力（优先级）", "Abilities (priority)")}</th>
              <th>{L("动作明细", "Exercises")}</th>
              <th className="tnum">{L("预估", "Est.")}</th>
            </tr>
          </thead>
          <tbody>
            {plan.days.map((d) => {
              const est = estimatedMinutes(d);
              return (
                <tr key={d.day}>
                  <td className="pt-day tnum">{L(d.labelZh, d.labelEn)}</td>
                  <td className="pt-theme">{L(d.themeZh, d.themeEn)}</td>
                  <td>
                    <div className="pt-targets">
                      {d.targets.length ? (
                        d.targets.map((t2) => {
                          const a = ability(t2.code);
                          const k = tierMap[t2.code] ?? "low";
                          const tl = tierLabel(k);
                          return (
                            <div key={t2.code} className="pt-target">
                              <span>{L(a.zh, a.en)}</span>
                              <span className={`tier-chip is-${k}`}>{L(tl.zh, tl.en)}</span>
                            </div>
                          );
                        })
                      ) : (
                        <span className="text-tertiary">—</span>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="pt-items">
                      {d.choices.length ? (
                        d.choices.map((c) => {
                          const ex = exercise(c.exerciseId);
                          const cat = categoryLabel[ex.category] ?? { zh: ex.category, en: ex.category };
                          const range = setsRange(ex, c.factor);
                          const note = c.factor < 1 ? L(" 减量", " lighter") : "";
                          const more = c.factor > 1 ? ` ×${c.factor}` : "";
                          return (
                            <div key={c.exerciseId} className="pt-item">
                              <span>{L(ex.zh, ex.en)}</span>
                              <span className="badge badge--maint pt-cat">{L(cat.zh, cat.en)}</span>
                              <span className="tnum pt-dose">
                                {range}组 × {ex.reps}{ex.rpe && ex.rpe !== "低" ? ` RPE${ex.rpe}` : ""}
                                {more}{note}
                              </span>
                            </div>
                          );
                        })
                      ) : (
                        <span className="text-tertiary">{L("未选动作", "No exercises")}</span>
                      )}
                    </div>
                  </td>
                  <td className="tnum pt-est">≈{est}min</td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={5} className="pt-practice">
                {L(plan.practice.zh, plan.practice.en)}
              </td>
            </tr>
            <tr>
              <td colSpan={5} className="pt-foot tnum">
                {L("算法版本", "algorithm")} {plan.algorithm_version} · {L("生成于", "generated")} {new Date(plan.generatedAt).toLocaleString()}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
