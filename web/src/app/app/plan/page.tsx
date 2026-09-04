"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { store } from "@/lib/store";
import { useI18n } from "@/lib/i18n";
import { ability, exercise } from "@/lib/data";
import type { DayBlueprint, ExerciseChoice, Plan } from "@/lib/types";
import DayTabs from "@/components/plan/DayTabs";
import AbilityGroup from "@/components/plan/AbilityGroup";
import ExercisePicker from "@/components/plan/ExercisePicker";
import PlanTable from "@/components/plan/PlanTable";
import { estimatedMinutes, FACTORS, ownerOf, tierOf, type TierKey } from "@/components/plan/shared";

export default function PlanPage() {
  const router = useRouter();
  const { L } = useI18n();
  const [plan, setPlan] = useState<Plan | null>(null);
  const [active, setActive] = useState(0);
  const [sel, setSel] = useState<string | null>(null); // 板块②点击选中的能力；null=跟随该日第 1 个

  useEffect(() => {
    const p = store.get<Plan | null>("gap.plan", null);
    // 旧版周模型数据无 days → 回炉重新生成
    if (!p || !Array.isArray(p.days)) {
      router.replace("/app/onboarding");
      return;
    }
    setPlan(p);
    setActive(0);
    setSel(null);
  }, [router]);

  if (!plan) {
    return (
      <main className="section center" style={{ minHeight: "55vh" }}>
        <p className="text-secondary">{L("加载计划中…", "Loading plan…")}</p>
      </main>
    );
  }

  // 动作归属（v1.18 单归属，见 6.4.3 组 4）：给定 ability 且当日目标且 cover>0 → 保留；
  // 否则按 主能力→cover 最高当日目标→null(通用动作) 推导。每次写回前归一化落库。
  const tagOwner = (codes: string[], c: ExerciseChoice): ExerciseChoice => {
    const ex = exercise(c.exerciseId);
    const ok = c.ability && codes.indexOf(c.ability) >= 0 && (ex.cover[c.ability] ?? 0) > 0;
    const o = ok ? c.ability : ownerOf(ex, codes);
    return o ? { ...c, ability: o } : c;
  };
  const normalizePlan = (p: Plan): Plan => ({
    ...p,
    days: p.days.map((d) => {
      const codes = d.targets.map((t) => t.code);
      return { ...d, choices: d.choices.map((c) => tagOwner(codes, c)) };
    }),
  });
  const persist = (next: Plan) => {
    const n = normalizePlan(next);
    setPlan(n);
    store.set("gap.plan", n);
  };

  const day = plan.days[active];
  const confirmed = !!plan.confirmedAt;
  const targetCodes = day.targets.map((t) => t.code);
  const eff = day.choices.map((c) => tagOwner(targetCodes, c)); // 显示层：带归属（首次读取旧数据也正确分组）

  // 能力整体缺口 → 档位（与仪表盘②/总表同口径，见 6.4.5）
  const tierMap: Record<string, TierKey> = {};
  plan.gaps.forEach((g) => {
    tierMap[g.code] = tierOf(g.deficit);
  });

  // 板块③联动：默认该日第 1 个目标能力；切日后重置
  const selCode = sel ?? (day.targets[0]?.code ?? null);
  const selAbility = selCode ? ability(selCode) : null;

  const onDay = (i: number) => {
    setActive(i);
    setSel(null);
  };

  const updateDay = (next: DayBlueprint) => {
    const days = plan.days.map((x) => (x.day === next.day ? next : x));
    persist({ ...plan, days });
  };

  const addExercise = (id: string) => {
    if (day.choices.some((c) => c.exerciseId === id) || !selCode) return;
    // 加入即归属当前选中能力（板块③ 只列该能力 cover>0 的动作，见 6.4.3）
    const choices = [...day.choices, { exerciseId: id, factor: 1, ability: selCode }];
    updateDay({ ...day, choices });
  };
  const removeChoice = (id: string) => {
    const choices = day.choices.filter((c) => c.exerciseId !== id);
    updateDay({ ...day, choices });
  };
  const setFactor = (id: string, dir: -1 | 1) => {
    const c = day.choices.find((x) => x.exerciseId === id);
    if (!c) return;
    const ci = FACTORS.indexOf(c.factor);
    const ni = Math.max(0, Math.min(FACTORS.length - 1, ci + dir));
    if (ni === ci) return;
    const choices = day.choices.map((x) => (x.exerciseId === id ? { ...x, factor: FACTORS[ni] } : x));
    updateDay({ ...day, choices });
  };
  const applyRecommended = () => {
    const choices: ExerciseChoice[] = (day.recommended || []).map((id) => ({
      exerciseId: id,
      factor: 1,
      ability: ownerOf(exercise(id), targetCodes) ?? undefined, // 无归属（热身/收尾补位）→ 通用动作组
    }));
    updateDay({ ...day, choices });
  };
  const clearDay = () => updateDay({ ...day, choices: [] });

  // v1.17 去达标：确认即写 confirmedAt、切只读总表，无弹层、无校验。
  const doConfirm = () => persist({ ...plan, confirmedAt: new Date().toISOString() });
  const doReedit = () => persist({ ...plan, confirmedAt: null });

  return (
    <main className="container section">
      <div className="flex-between" style={{ flexWrap: "wrap", gap: 16 }}>
        <div>
          <p className="eyebrow">GAP</p>
          <h1 className="display-title">{L("训练计划", "Training Plan")}</h1>
        </div>
        <Link className="btn btn-secondary" href="/app/dashboard">
          {L("返回仪表盘", "Back to dashboard")}
        </Link>
      </div>

      {confirmed ? (
        <PlanTable plan={plan} onReedit={doReedit} />
      ) : (
        <>
          {/* 页级工具条：轮次摘要 + 确认 */}
          <div className="flex-between mt-6" style={{ flexWrap: "wrap", gap: 10 }}>
            <p className="caption">
              {L("本轮共", "This cycle")} <b className="tnum">{plan.cycleDays}</b> {L("个训练日", "training days")}
            </p>
            <button type="button" className="btn btn-primary" onClick={doConfirm}>
              {L("确认计划", "Confirm plan")}
            </button>
          </div>

          {/* 板块① 选择训练日 */}
          <section className="plan-block">
            <div className="plan-block-head">
              <h2 className="plan-block-title">{L("选择训练日", "Choose a training day")}</h2>
            </div>
            <div className="mt-4">
              <DayTabs days={plan.days} active={active} onChange={onDay} />
            </div>
          </section>

          {/* 板块② 当日按能力分组（v1.18）：动作直接列在所属能力下方；无组数统计 */}
          <section className="plan-block">
            <div className="plan-block-head">
              <h2 className="plan-block-title">{L(day.labelZh, day.labelEn)}</h2>
              <span className="plan-block-meta caption">
                {day.recommended?.length ? (
                  <>
                    {L("建议", "Suggested")} {day.duration} {L("分钟", "min")}
                  </>
                ) : (
                  L("本日自由安排", "Flexible day")
                )}
                {eff.length ? (
                  <span className="text-secondary"> · {L("当前约", "now ~")}{estimatedMinutes(day)}min</span>
                ) : null}
              </span>
            </div>
            <div className="card mt-4">
              <span className="micro">
                {L("当日按能力分组 · 点击能力组头切换下方动作库，新动作直接加在该能力下方", "Grouped by ability — tap a group header to pick for it; new actions appear right under that ability")}
              </span>
              <div className="mt-3">
                <AbilityGroup
                  targets={day.targets}
                  tier={tierMap}
                  choices={eff}
                  selected={selCode}
                  onSelect={setSel}
                  onFactor={setFactor}
                  onRemove={removeChoice}
                />
              </div>

              {(day.recommended && day.recommended.length) || eff.length ? (
                <div className="flex gap-3 mt-4 ag-foot">
                  {day.recommended && day.recommended.length ? (
                    <button type="button" className="btn btn-sm btn-ghost" onClick={applyRecommended}>
                      {L("套用参考推荐组合", "Apply suggested combo")} ({day.recommended.length})
                    </button>
                  ) : null}
                  <button type="button" className="btn btn-sm btn-ghost" onClick={clearDay} disabled={!eff.length}>
                    {L("清空本日", "Clear day")}
                  </button>
                </div>
              ) : null}
            </div>
          </section>

          {/* 板块③ 动作选择（矩阵 · 默认 3 列；加入即归属当前选中能力） */}
          <section className="plan-block">
            <div className="plan-block-head">
              <h2 className="plan-block-title">
                {selAbility
                  ? L(`为「${selAbility.zh}」选动作`, `Exercises for ${selAbility.en}`)
                  : L("动作选择", "Exercises")}
              </h2>
            </div>
            <div className="card mt-4">
              <ExercisePicker code={selCode} added={eff} onAdd={addExercise} />
            </div>
          </section>

          {/* 专项实践提醒：弱化为底部单行小字提示（v1.17） */}
          <p className="practice-note">{L(plan.practice.zh, plan.practice.en)}</p>
        </>
      )}
    </main>
  );
}
