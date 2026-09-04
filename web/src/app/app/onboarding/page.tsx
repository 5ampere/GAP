"use client";

import { useState, type KeyboardEvent, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n";
import { abilities, layers, saq, sports, balancedSport } from "@/lib/data";
import { generatePlan } from "@/lib/engine";
import { store } from "@/lib/store";
import type { AssessmentMode, SportGoal, SportWeight, UserConstraints, UserData } from "@/lib/types";

const TITLES = ["ob.step2", "ob.step3", "ob.step4", "ob.step5", "ob.step6"];
const SUBS = ["ob.step2.sub", "ob.step3.sub", "ob.step4.sub", "ob.step5.sub", "ob.step6.sub"];

// v2.1：平均主义置首（伪运动，单卡单独处理）；其余为真实运动类别
const CAT_ORDER = ["平均主义", "球类", "水上", "雪上", "攀岩", "体能", "户外", "对抗", "技巧"];
const MAX_REAL_SPORTS = 6;

interface WizardState {
  step: number;
  sports: SportGoal[];
  constraints: UserConstraints;
  mode: AssessmentMode;
  saq: Record<string, number>;
  spt: Record<string, string>;
}

const INITIAL: WizardState = {
  step: 1,
  sports: [],
  constraints: { daysPerWeek: 3 },
  mode: "saq",
  saq: {},
  spt: {},
};

// 专业自测：覆盖全部 18 项能力（每项一个测试；ranges 为 [阈值, 对应分] 升序）
const SPT_TESTS: { key: string; code: string; zh: string; en: string; unit: string; ranges: [number, number][] }[] = [
  { key: "squat", code: "STR_MAX", zh: "深蹲/硬拉 3–5RM", en: "Squat/Deadlift 3–5RM", unit: "kg", ranges: [[40, 2], [80, 3], [120, 4]] },
  { key: "pullup", code: "STR_REL", zh: "标准引体最大次数", en: "Max pull-ups", unit: "次", ranges: [[3, 2], [8, 3], [15, 4]] },
  { key: "pushup", code: "STR_END", zh: "俯卧撑连续次数", en: "Push-ups in a row", unit: "次", ranges: [[10, 2], [25, 3], [40, 4]] },
  { key: "grip", code: "GRIP_CORE", zh: "握力计", en: "Grip strength", unit: "kg", ranges: [[30, 2], [45, 3], [60, 4]] },
  { key: "broadJump", code: "PWR", zh: "立定跳远", en: "Broad jump", unit: "cm", ranges: [[180, 2], [220, 3], [260, 4]] },
  { key: "sprint30", code: "SPD", zh: "30m 冲刺", en: "30m sprint", unit: "秒", ranges: [[5.2, 2], [4.8, 3], [4.4, 4]] },
  { key: "sprint10", code: "ACC", zh: "10m 冲刺", en: "10m sprint", unit: "秒", ranges: [[2.2, 2], [2.0, 3], [1.8, 4]] },
  { key: "cod", code: "DEC_COD", zh: "5-10-5 变向", en: "5-10-5 change of direction", unit: "秒", ranges: [[6.0, 2], [5.4, 3], [4.8, 4]] },
  { key: "run12", code: "AER_CAP", zh: "12 分钟跑", en: "12-min run", unit: "m", ranges: [[2200, 2], [2600, 3], [3000, 4]] },
  { key: "steady30", code: "AER_END", zh: "30 分钟稳态（自评 0–5）", en: "30-min steady (self-rated 0–5)", unit: "0–5", ranges: [[1, 1], [2, 2], [3, 3], [4, 4], [5, 5]] },
  { key: "ana", code: "ANA_CAP", zh: "短冲输出（自评 0–5）", en: "Short sprint output (self-rated 0–5)", unit: "0–5", ranges: [[1, 1], [2, 2], [3, 3], [4, 4], [5, 5]] },
  { key: "rhia", code: "RHIA", zh: "重复短冲完成次数", en: "Repeated sprints completed", unit: "次", ranges: [[4, 2], [6, 3], [8, 4]] },
  { key: "balance", code: "BAL", zh: "单脚站立（闭眼）", en: "Single-leg stand (eyes closed)", unit: "秒", ranges: [[10, 2], [30, 3], [60, 4]] },
  { key: "rope", code: "COORD", zh: "跳绳（30 秒）", en: "Jump rope (30s)", unit: "次", ranges: [[20, 2], [40, 3], [60, 4]] },
  { key: "react", code: "REACT", zh: "反应时", en: "Reaction time", unit: "ms", ranges: [[350, 2], [300, 3], [250, 4]] },
  { key: "aware", code: "AWARE", zh: "闭眼单脚/落点（自评 0–5）", en: "Eyes-closed position (self-rated 0–5)", unit: "0–5", ranges: [[1, 1], [2, 2], [3, 3], [4, 4], [5, 5]] },
  { key: "ankle", code: "MOB", zh: "踝活动度 knee-to-wall", en: "Ankle dorsiflexion (knee-to-wall)", unit: "cm", ranges: [[5, 2], [10, 3], [15, 4]] },
  { key: "landing", code: "STAB", zh: "单腿落地稳定性（自评 0–5）", en: "Single-leg landing (self-rated 0–5)", unit: "0–5", ranges: [[1, 1], [2, 2], [3, 3], [4, 4], [5, 5]] },
];

function Segmented({ options, value, onChange }: { options: { v: string; zh: string; en: string }[]; value: string; onChange: (v: string) => void }) {
  const { L } = useI18n();
  return (
    <div className="segmented">
      {options.map((o) => (
        <button key={o.v} type="button" className={o.v === value ? "is-active" : ""} onClick={() => onChange(o.v)}>
          {L(o.zh, o.en)}
        </button>
      ))}
    </div>
  );
}

function Field({ zh, en, children }: { zh: string; en: string; children: ReactNode }) {
  const { L } = useI18n();
  return (
    <div className="field" style={{ marginBottom: 16 }}>
      <label>{L(zh, en)}</label>
      {children}
    </div>
  );
}

function mapSpt(spt: Record<string, string>): Record<string, number> {
  const s: Record<string, number> = {};
  abilities.forEach((a) => (s[a.code] = 2.5));
  SPT_TESTS.forEach((test) => {
    const v = spt[test.key];
    if (!v || v === "") return;
    const n = parseFloat(v);
    if (isNaN(n)) return;
    let score: number | null = null;
    for (const [max, sc] of test.ranges) {
      if (n <= max) {
        score = sc;
        break;
      }
    }
    if (score == null) score = test.ranges[test.ranges.length - 1][1];
    s[test.code] = score;
  });
  return s;
}

export default function OnboardingPage() {
  const router = useRouter();
  const { t, L, lang } = useI18n();
  const [state, setState] = useState<WizardState>(INITIAL);
  const [generating, setGenerating] = useState(false);
  const [genStep, setGenStep] = useState(0);

  const patch = (p: Partial<WizardState>) => setState((s) => ({ ...s, ...p }));
  const patchConstraints = (p: Partial<UserConstraints>) => setState((s) => ({ ...s, constraints: { ...s.constraints, ...p } }));

  // v2.1：平均主义只能单独选——选中即清空真实运动；点真实运动会先移除平均主义
  const toggleSport = (id: string) => {
    setState((s) => {
      if (id === "balanced") {
        const on = s.sports.some((x) => x.id === "balanced");
        return on ? { ...s, sports: [] } : { ...s, sports: [{ id: "balanced", weight: "medium" as SportWeight }] };
      }
      const real = s.sports.filter((x) => x.id !== "balanced");
      const i = real.findIndex((x) => x.id === id);
      if (i >= 0) return { ...s, sports: real.filter((x) => x.id !== id) };
      if (real.length >= MAX_REAL_SPORTS) return s;
      return { ...s, sports: [...real, { id, weight: "medium" as SportWeight }] };
    });
  };
  const patchSport = (id: string, p: Partial<SportGoal>) => {
    setState((s) => ({ ...s, sports: s.sports.map((x) => (x.id === id ? { ...x, ...p } : x)) }));
  };
  const cardKey = (fn: () => void) => (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      fn();
    }
  };

  const next = () => {
    if (state.step === 1 && state.sports.length < 1) {
      alert(L("请至少选择 1 项目标运动。", "Please choose at least 1 goal sport."));
      return;
    }
    if (state.step < 5) {
      setState((s) => ({ ...s, step: s.step + 1 }));
      window.scrollTo(0, 0);
    }
  };
  const back = () => {
    if (state.step > 1) setState((s) => ({ ...s, step: s.step - 1 }));
  };

  const handleGenerate = () => {
    if (generating) return;
    setGenerating(true);
    setGenStep(0);
    const statuses = [L("正在评估能力缺口…", "Assessing gaps…"), L("匹配训练方法…", "Matching methods…"), L("编排每日目标…", "Setting daily targets…")];
    let i = 0;
    const timer = setInterval(() => {
      i++;
      if (i < statuses.length) {
        setGenStep(i);
      } else {
        clearInterval(timer);
        const unified: Record<string, number> = {};
        if (state.mode === "spt") {
          Object.assign(unified, mapSpt(state.spt));
        } else {
          abilities.forEach((a) => (unified[a.code] = state.saq[a.code] ?? 3));
        }
        const user: UserData = { sports: state.sports, constraints: state.constraints, assessment: { mode: state.mode, saq: unified } };
        const plan = generatePlan(user);
        store.set("gap.user", user);
        store.set("gap.plan", plan);
        router.push("/app/dashboard");
      }
    }, 550);
    // 注：原型用 mock 引擎同步生成；真实系统此处调 POST /plan/generate。
  };

  const genStatuses = [L("正在评估能力缺口…", "Assessing gaps…"), L("匹配训练方法…", "Matching methods…"), L("编排每日目标…", "Setting daily targets…")];

  const renderStep = () => {
    switch (state.step) {
      case 1: {
        const balOn = state.sports.some((x) => x.id === "balanced");
        const realSel = state.sports.filter((x) => x.id !== "balanced");
        const realCount = balOn ? 1 : realSel.length;
        const full = !balOn && realCount >= MAX_REAL_SPORTS;
        const realGroups = CAT_ORDER
          .filter((cat) => cat !== "平均主义")
          .map((cat) => ({ cat, items: sports.filter((s) => s.cat === cat) }))
          .filter((g) => g.items.length > 0);
        const WEIGHTS = [
          { v: "low", zh: "低", en: "Low" },
          { v: "medium", zh: "中", en: "Med" },
          { v: "high", zh: "高", en: "High" },
        ];
        return (
          <>
            <div className="micro" style={{ marginBottom: 12 }}>
              {L(`已选 ${realCount} 项`, `Selected ${realCount}`)}
            </div>

            {/* 平均主义：置首 · 单卡 · 只能单独选 */}
            <div className="sport-group" style={{ marginBottom: 20 }}>
              <div className="micro" style={{ marginBottom: 6, fontWeight: 600 }}>{L("平均主义", "Balanced")}</div>
              <div className="sport-grid">
                <div
                  role="button"
                  tabIndex={0}
                  aria-pressed={balOn}
                  className={"sport-card sport-card--balanced" + (balOn ? " is-selected" : "")}
                  onClick={() => toggleSport("balanced")}
                  onKeyDown={cardKey(() => toggleSport("balanced"))}
                >
                  <span className="sport-name">{L(balancedSport.zh, balancedSport.en)}</span>
                  <span className="sport-cat">{L("全部运动的平均需求", "Average demand across all sports")}</span>
                  <span className="check">✓</span>
                </div>
              </div>
              <p className="micro" style={{ marginTop: 8, color: balOn ? "var(--text-secondary)" : "var(--text-tertiary)" }}>
                {balOn
                  ? L("已选平均主义：将按全部运动的平均水平定制。取消此项即可手动挑选。", "Balanced selected — your plan follows the average of all sports. Deselect to hand-pick.")
                  : L("适合不想逐项挑选运动的你。", "For when you'd rather not hand-pick sports.")}
              </p>
            </div>

            {!balOn && (
              <>
                {realGroups.map((g) => (
                  <div key={g.cat} className="sport-group" style={{ marginBottom: 20 }}>
                    <div className="micro" style={{ marginBottom: 6, fontWeight: 600 }}>{g.cat}</div>
                    <div className="sport-grid">
                      {g.items.map((s) => {
                        const sp = realSel.find((x) => x.id === s.id);
                        const on = !!sp;
                        const blocked = full && !on;
                        return (
                          <div
                            key={s.id}
                            role="button"
                            tabIndex={blocked ? -1 : 0}
                            aria-pressed={on}
                            aria-disabled={blocked}
                            className={"sport-card" + (on ? " is-selected" : "") + (blocked ? " is-disabled" : "")}
                            onClick={() => toggleSport(s.id)}
                            onKeyDown={cardKey(() => toggleSport(s.id))}
                          >
                            <span className="sport-name">{L(s.zh, s.en)}</span>
                            <span className="sport-cat">{lang === "en" ? s.zh : s.en}</span>
                            <span className="check">✓</span>
                            {on && (
                              <div className="sport-card-seg" onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
                                <Segmented options={WEIGHTS} value={sp.weight} onChange={(v) => patchSport(s.id, { weight: v as SportWeight })} />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
                {full && (
                  <p className="micro" style={{ marginTop: 4, color: "var(--text-tertiary)" }}>
                    {L("已达 6 项上限：先取消某项再更换。", "Max 6 reached — remove one before adding another.")}
                  </p>
                )}
              </>
            )}
          </>
        );
      }

      case 2:
        return (
          <Field zh="每轮可训练天数" en="Training days per cycle">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12 }}>
              <button className="icon-btn" type="button" onClick={() => patchConstraints({ daysPerWeek: Math.max(1, state.constraints.daysPerWeek - 1) })}>−</button>
              <span className="h3" style={{ minWidth: 28, textAlign: "center" }}>{state.constraints.daysPerWeek}</span>
              <button className="icon-btn" type="button" onClick={() => patchConstraints({ daysPerWeek: Math.min(7, state.constraints.daysPerWeek + 1) })}>+</button>
            </div>
          </Field>
        );

      case 3: {
        const modes = [
          { v: "saq" as AssessmentMode, t: "mode.saq", d: "mode.saq.d" },
          { v: "spt" as AssessmentMode, t: "mode.spt", d: "mode.spt.d" },
        ];
        return (
          <div className="grid grid--2">
            {modes.map((m) => (
              <div key={m.v} className={"card card--interactive" + (state.mode === m.v ? " is-selected" : "")} role="button" tabIndex={0} onClick={() => patch({ mode: m.v })} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); patch({ mode: m.v }); } }}>
                <h3 className="h3">{t(m.t)}</h3>
                <p className="body text-secondary mt-2">{t(m.d)}</p>
              </div>
            ))}
          </div>
        );
      }

      case 4:
        return state.mode === "spt" ? renderSpt() : renderSaq();

      case 5:
        return renderSummary();

      default:
        return null;
    }
  };

  function renderSaq() {
    return (
      <>
        {layers.map((l) => (
          <div key={l.key} style={{ marginBottom: 20 }}>
            <div className="ability-name" style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <span className="category-dot" style={{ background: `var(${l.cssVar})` }} />
              <strong>{L(l.zh, l.en)}</strong>
            </div>
            {abilities
              .filter((a) => a.layer === l.key)
              .map((a) => {
                const q = saq.find((x) => x.code === a.code)!;
                const v = state.saq[a.code] ?? 3;
                return (
                  <div className="saq-item" key={a.code}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
                      <span className="saq-q">{L(q.zh, q.en)}</span>
                    </div>
                    <div className="saq-scale">
                      <input type="range" min={0} max={5} step={1} value={v} onChange={(e) => setState((s) => ({ ...s, saq: { ...s.saq, [a.code]: parseInt(e.target.value, 10) } }))} />
                      <span className="saq-value">{v}</span>
                    </div>
                    <div className="saq-anchors">
                      <span>{q.a0}</span>
                      <span>{q.a5}</span>
                    </div>
                  </div>
                );
              })}
          </div>
        ))}
        <p className="micro">{L("自评用于生成第一版计划，可随时用专业自测校准。", "Self-report builds your first plan; refine with standard tests anytime.")}</p>
      </>
    );
  }

  function renderSpt() {
    return (
      <>
        <p className="body text-secondary">{L("覆盖全部 18 项能力，可分批完成；留空将使用默认先验。", "Covers all 18 abilities; leave blank to use default priors.")}</p>
        <div className="grid grid--2" style={{ marginTop: 16 }}>
          {SPT_TESTS.map((tst) => (
            <Field key={tst.key} zh={tst.zh} en={tst.en}>
              <input type="number" placeholder={tst.unit} value={state.spt[tst.key] ?? ""} onChange={(e) => setState((s) => ({ ...s, spt: { ...s.spt, [tst.key]: e.target.value } }))} />
            </Field>
          ))}
        </div>
      </>
    );
  }

  function renderSummary() {
    const sportNames = state.sports.map((sp) => {
      const s = sp.id === "balanced" ? balancedSport : sports.find((x) => x.id === sp.id)!;
      return L(s.zh, s.en);
    }).join(" · ");
    const modeLabel = state.mode === "spt" ? t("mode.spt") : t("mode.saq");
    const rows: [string, string][] = [
      [L("目标运动", "Goal sports"), sportNames || "—"],
      [L("每轮训练", "Training per cycle"), `${state.constraints.daysPerWeek} ${L("天", "days")}`],
      [L("评估方式", "Assessment mode"), modeLabel],
    ];
    return (
      <>
        <p className="body text-secondary">{L("确认信息后，点击下方按钮生成你的 GAP 计划。", "Review and generate your GAP plan.")}</p>
        <div className="card card--outlined mt-4" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {rows.map((r, i) => (
            <div key={i} className="flex-between">
              <span className="micro">{r[0]}</span>
              <strong>{r[1]}</strong>
            </div>
          ))}
        </div>
        <div className="center mt-6">
          <div className="micro" style={{ minHeight: 20 }}>{generating ? genStatuses[genStep] : ""}</div>
        </div>
      </>
    );
  }

  return (
    <main className="wizard-shell">
      <div className="wizard-progress">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className={"seg" + (i < state.step ? " is-done" : i === state.step ? " is-active" : "")} />
        ))}
      </div>
      <header className="wizard-step-head">
        <div className="step-num">Step {state.step} / 5</div>
        <h1 className="display-title">{t(TITLES[state.step - 1])}</h1>
        <p className="body-lg text-secondary">{t(SUBS[state.step - 1])}</p>
      </header>
      <div className="wizard-card" style={{ padding: "var(--space-8)" }}>
        <div className="wizard-panel is-active">{renderStep()}</div>
      </div>
      <div className="wizard-actions">
        <button className="btn btn-secondary" type="button" style={{ visibility: state.step === 1 ? "hidden" : "visible" }} onClick={back}>
          {t("ob.back")}
        </button>
        <button className="btn btn-primary" type="button" disabled={generating} onClick={state.step === 5 ? handleGenerate : next}>
          {state.step === 5 ? t("ob.generate") : t("ob.next")}
        </button>
      </div>
    </main>
  );
}
