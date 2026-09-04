// GAP mock 算法引擎（原型用）。需求聚合 → 目标能力 → 当前能力 → 缺口 → 优先级 → 每日目标值（轮模型）。
// 注意：这是「可替换的 mock 实现」，真实系统由后端算法服务（versioned）提供。
// v1.15 轮模型：引擎只生成「每轮 N 个训练日」的每日能力目标值 + 主题 + 参考推荐组合（确定性），
// 不再生成固定动作清单；用户从动作库自选（见 6.4.3/6.4.5/6.4.6）。
import { abilities, exercises, sport as sportOf, exercise as exerciseOf } from "./data";
import type {
  DayAbilityTarget,
  DayBlueprint,
  Exercise,
  GapItem,
  Localized,
  Plan,
  SportGoal,
  UserData,
} from "./types";

function round1(x: number): number {
  return Math.round(x * 10) / 10;
}
function weightOf(w: string): number {
  return w === "high" ? 1.3 : w === "low" ? 0.7 : 1.0;
}

// 目标能力：所选运动需求加权聚合（对齐 HLD 8.1 的 mean+peak 混合）
export function buildTarget(sports: SportGoal[]): Record<string, number> {
  const target: Record<string, number> = {};
  abilities.forEach((a) => {
    const vals: { v: number; w: number }[] = [];
    sports.forEach((s) => {
      const sp = sportOf(s.id);
      if (sp && sp.demand[a.code] != null) {
        vals.push({ v: sp.demand[a.code], w: weightOf(s.weight) });
      }
    });
    if (!vals.length) {
      target[a.code] = 2.0;
      return;
    }
    let sum = 0;
    let wsum = 0;
    let peak = 0;
    vals.forEach((x) => {
      sum += x.v * x.w;
      wsum += x.w;
      peak = Math.max(peak, x.v);
    });
    const mean = wsum ? sum / wsum : 2;
    const demand = 0.7 * mean + 0.3 * peak; // α≈0.70
    target[a.code] = round1(Math.max(1, Math.min(5, 1.2 + 0.62 * demand)));
  });
  return target;
}

// 当前能力：自评分，未测用模糊先验 2.5
export function buildCurrent(assessment?: UserData["assessment"]): Record<string, number> {
  const current: Record<string, number> = {};
  abilities.forEach((a) => {
    const v = assessment?.saq?.[a.code];
    current[a.code] = v == null ? 2.5 : v;
  });
  return current;
}

function demandOf(code: string, sports: SportGoal[]): number {
  let mx = 1;
  sports.forEach((s) => {
    const sp = sportOf(s.id);
    if (sp && sp.demand[code] != null) mx = Math.max(mx, sp.demand[code]);
  });
  return mx;
}
function transferOf(code: string, sports: SportGoal[]): number {
  let n = 0;
  sports.forEach((s) => {
    const sp = sportOf(s.id);
    if (sp && sp.demand[code] >= 4) n++;
  });
  return n;
}

function reasons(g: GapItem, sports: SportGoal[]): Localized[] {
  const total = sports.length;
  return [
    { zh: `${total} 个目标运动中有 ${g.transfer} 个对此能力需求高`, en: `${g.transfer} of ${total} goal sports demand this highly` },
    { zh: `当前 ${g.current.toFixed(1)} vs 目标 ${g.target.toFixed(1)}`, en: `current ${g.current.toFixed(1)} vs target ${g.target.toFixed(1)}` },
    { zh: "在所选运动间迁移成本低，可训练性高", en: "low transfer cost across your sports, high trainability" },
  ];
}
function recommendation(g: GapItem): Localized[] {
  const freq =
    g.deficit >= 1.5 ? { zh: "每轮 2 次暴露", en: "2 exposures / cycle" } : { zh: "每轮 1–2 次暴露", en: "1–2 exposures / cycle" };
  return [freq, { zh: "从退阶动作开始，逐步进阶", en: "start with regressions, then progress" }];
}

export function computeGaps(
  target: Record<string, number>,
  current: Record<string, number>,
  sports: SportGoal[]
): GapItem[] {
  const gaps: GapItem[] = [];
  abilities.forEach((a) => {
    const deficit = round1(Math.max(0, target[a.code] - current[a.code]));
    if (deficit < 0.1) return;
    const demand = demandOf(a.code, sports);
    const transfer = transferOf(a.code, sports);
    const priority = Math.min(100, Math.round(deficit * demand * (0.5 + transfer) * 8));
    const g: GapItem = {
      code: a.code,
      current: current[a.code],
      target: target[a.code],
      deficit,
      priority,
      transfer,
      reasons: [],
      recommendation: [],
    };
    g.reasons = reasons(g, sports);
    g.recommendation = recommendation(g);
    gaps.push(g);
  });
  gaps.sort((x, y) => y.priority - x.priority);
  return gaps;
}

// —— 训练方法类（主题标签 + G.3 内部排序用），顺序即 G.3 排列带 ——
// band 越大越靠后（G.3）；能力 → 训练方法块（主题合成依据）
const METHOD_BLOCKS: { zh: string; en: string; band: number; codes: string[] }[] = [
  { zh: "速度/反应/爆发", en: "Speed/Reaction/Power", band: 2, codes: ["SPD", "ACC", "PWR", "REACT"] },
  { zh: "力量", en: "Strength", band: 3, codes: ["STR_MAX", "STR_REL", "STR_END"] },
  { zh: "握力/核心/单侧", en: "Grip/Core/Unilateral", band: 4, codes: ["GRIP_CORE", "STAB", "BAL", "COORD", "AWARE"] },
  { zh: "移动/变向", en: "Movement/Agility", band: 5, codes: ["DEC_COD"] },
  { zh: "体能/间歇", en: "Conditioning", band: 6, codes: ["ANA_CAP", "RHIA"] },
  { zh: "有氧", en: "Aerobic", band: 6, codes: ["AER_CAP", "AER_END"] },
  { zh: "活动度", en: "Mobility", band: 7, codes: ["MOB"] },
];
function methodOf(code: string): { zh: string; en: string; band: number } {
  const m = METHOD_BLOCKS.find((b) => b.codes.indexOf(code) >= 0);
  return m || { zh: "综合", en: "General", band: 3 };
}
function themeOf(codes: string[]): { zh: string; en: string } {
  if (!codes.length) return { zh: "恢复与机动", en: "Recovery & Flex" };
  const seen: { zh: string; en: string }[] = [];
  METHOD_BLOCKS.forEach((b) => {
    if (b.codes.some((c) => codes.indexOf(c) >= 0)) seen.push({ zh: b.zh, en: b.en });
  });
  if (!seen.length) seen.push({ zh: "综合", en: "General" });
  return { zh: seen.map((s) => s.zh).join(" + "), en: seen.map((s) => s.en).join(" + ") };
}

// 估算建议时长（推荐组合分钟数 × 组间休息系数 1.6，取整到 5 的倍数区间文本）
function durationOf(ids: string[]): string {
  if (!ids.length) return "0";
  const mins = ids.reduce((s, id) => s + exerciseOf(id).minutes, 0);
  const total = Math.round((mins * 1.6) / 5) * 5;
  return `${Math.max(10, total - 10)}–${total + 10}`;
}

// 已选组合某能力的累计刺激（cover × factor 线性折算，6.4.5 第 6/7 步）
export function coveredBy(list: { exercise: Exercise; factor: number }[], code: string): number {
  let sum = 0;
  list.forEach(({ exercise, factor }) => {
    const v = exercise.cover[code] ?? 0;
    if (v > 0) sum += v * factor;
  });
  return round1(sum);
}

// 参考推荐组合（6.4.6 · 确定性）：两轮贪心——
// ① 每个目标能力各先配一个最高刺激动作（均衡起步）；② 再从剩余动作里挑「补最大缺口的那个能力」，
// 类别不重复、默认 5–8 项，末段 G.3 排序；某能力无匹配动作时允许留白。
function buildRecommended(targets: DayAbilityTarget[]): string[] {
  const picked: Exercise[] = [];
  const usedCat = new Set<string>();
  const used = new Set<string>();

  // 逐能力需补的当日量 = 目标分 − 基准线（增量口径，与 UI 达标判定一致，见 6.4.5/6.4.6）
  const needMap: Record<string, number> = {};
  targets.forEach((t) => (needMap[t.code] = Math.round(Math.max(0.1, t.target - t.baseline) * 10) / 10));

  const coveredMap: Record<string, number> = {};
  targets.forEach((t) => (coveredMap[t.code] = 0));
  const refresh = () => {
    const list = picked.map((e) => ({ exercise: e, factor: 1 }));
    Object.keys(coveredMap).forEach((code) => (coveredMap[code] = coveredBy(list, code)));
  };

  // 候选按「未用类别优先 → 主能力优先 → cover 降序」。类别去重仅为排序偏好而非硬约束，
  // 以便同类别（如有氧/冲刺）也能补足较大需补量；同一动作不重复。
  const candidatesFor = (code: string): Exercise[] =>
    exercises
      .filter((e) => (e.cover[code] ?? 0) > 0 && !used.has(e.id))
      .sort((a, b) => {
        const ca = usedCat.has(a.category) ? 1 : 0;
        const cb = usedCat.has(b.category) ? 1 : 0;
        if (ca !== cb) return ca - cb;
        const pa = a.primary === code ? 1 : 0;
        const pb = b.primary === code ? 1 : 0;
        if (pa !== pb) return pb - pa;
        return (b.cover[code] ?? 0) - (a.cover[code] ?? 0);
      });
  const tryAdd = (code: string): boolean => {
    const cands = candidatesFor(code);
    if (!cands.length) return false;
    const ex = cands[0];
    picked.push(ex);
    used.add(ex.id);
    usedCat.add(ex.category);
    refresh();
    return true;
  };

  // ① 均衡起步：每个目标能力先各配一项（最高优先的能力先取）
  for (const t of targets) {
    if (picked.length >= 8) break;
    if (coveredMap[t.code] < needMap[t.code]) tryAdd(t.code);
  }
  // ② 补齐：反复给「缺口最大」的能力加动作，直到全部达标或加满 8 项
  let guard = 0;
  while (picked.length < 8 && guard++ < 24) {
    const open = targets
      .filter((t) => coveredMap[t.code] < needMap[t.code] - 1e-9 && candidatesFor(t.code).length > 0)
      .sort((a, b) => {
        const ra = needMap[a.code] - coveredMap[a.code];
        const rb = needMap[b.code] - coveredMap[b.code];
        return rb - ra;
      });
    if (!open.length) break;
    if (!tryAdd(open[0].code)) break;
  }

  // 兜底：不足 5 项时补一条低负荷活动度（对应 G.3 收尾带），仍遵守类别不重复
  if (picked.length < 5 && picked.length < 8) {
    const fill = exercises.find((e) => e.primary === "MOB" && !used.has(e.id) && !usedCat.has(e.category));
    if (fill) {
      picked.push(fill);
      usedCat.add(fill.category);
    }
  }

  // G.3 内部排序：主项带按 band 升序（准备/热身带不参与挑选）
  return picked
    .slice()
    .sort((a, b) => methodOf(a.primary).band - methodOf(b.primary).band)
    .map((e) => e.id);
}

export function generatePlan(user: UserData): Plan {
  const target = buildTarget(user.sports);
  const current = buildCurrent(user.assessment);
  const gaps = computeGaps(target, current, user.sports);
  const gapsMap: Record<string, GapItem> = {};
  gaps.forEach((g) => (gapsMap[g.code] = g));

  const N = Math.max(1, Math.min(7, user.constraints?.daysPerWeek ?? 4));
  const dayCodes: string[][] = Array.from({ length: N }, () => []);

  // 6.4.5 步骤 2–3：频次 f；单日容量 C 动态（v1.18，不再固定 4）。
  // S = 本轮暴露总次数 Σ f[a]；C = clamp(ceil(S/N)+1, 3, 6)——缺口多/训练日少 → 单日 5–6 个，
  // 缺口少/训练日多 → 单日 2–3 个，放不下的暴露整日留作「恢复与机动」。C 是上限，不强行填满。
  const freqOf = (deficit: number) => (N === 1 ? 1 : deficit >= 1.2 ? Math.min(2, N) : 1);
  const S = gaps.reduce((sum, g) => sum + freqOf(g.deficit), 0);
  const C = Math.max(3, Math.min(6, Math.ceil(S / N) + 1));
  for (const g of gaps) {
    const f = freqOf(g.deficit);
    for (let i = 0; i < f; i++) {
      let best = -1;
      let bestCount = Infinity;
      for (let d = 0; d < N; d++) {
        if (dayCodes[d].indexOf(g.code) >= 0 || dayCodes[d].length >= C) continue;
        if (dayCodes[d].length < bestCount) {
          bestCount = dayCodes[d].length;
          best = d;
        }
      }
      if (best < 0) continue; // 当日全满 C（N 过小/缺口过多）→ 该次出现顺延下一轮
      dayCodes[best].push(g.code);
    }
  }

  // 每日目标能力列表（按该日能力全局优先级降序稳定呈现）
  const days: DayBlueprint[] = dayCodes.map((codes, d) => {
    const ordered = codes.slice().sort((a, b) => (gapsMap[b]?.priority ?? 0) - (gapsMap[a]?.priority ?? 0));
    const targets: DayAbilityTarget[] = ordered.map((code) => {
      const g = gapsMap[code];
      const f = g ? freqOf(g.deficit) : 1;
      const dDay = g ? round1(g.deficit / f) : 0;
      return {
        code,
        baseline: current[code],
        target: round1(Math.min(5, current[code] + dDay)),
        freq: f,
      };
    });
    const theme = themeOf(ordered);
    const recommended = buildRecommended(targets);
    return {
      day: d,
      labelZh: `第 ${d + 1} 天`,
      labelEn: `Day ${d + 1}`,
      themeZh: theme.zh,
      themeEn: theme.en,
      duration: durationOf(recommended),
      targets,
      recommended,
      choices: [],
    };
  });

  // 专项实践提醒（6.4.4 · 纯文案，含所选运动名）
  const namesZh = user.sports.map((s) => sportOf(s.id)?.zh).filter(Boolean) as string[];
  const namesEn = user.sports.map((s) => sportOf(s.id)?.en).filter(Boolean) as string[];
  const practice: Localized = {
    zh: `GAP 计划打造的是通用运动底座（体能 / 动作 / 感知），它「不能替代」你在${namesZh.join("、") || "所选运动"}上的专项练习。请照常安排打球、训练或比赛——通用能力与专项技巧一起练，才进步最快。`,
    en: `Your GAP plan builds a general foundation — it's not a substitute for practicing ${namesEn.join(", ") || "your sports"} themselves. Keep playing, training and competing. General capacity + sport-specific skill = fastest progress.`,
  };

  return {
    algorithm_version: "0.2.1-mock",
    generatedAt: new Date().toISOString(),
    sports: user.sports,
    current,
    target,
    gaps,
    cycleDays: N,
    days,
    practice,
    confirmedAt: null,
  };
}
