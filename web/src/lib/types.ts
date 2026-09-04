export type LayerKey = "L1" | "L2" | "L3";
export type Lang = "zh" | "en";
export type SportWeight = "low" | "medium" | "high";
export type SportLevel = "recreational" | "intermediate" | "competitive";
export type AssessmentMode = "saq" | "spt";

export interface Layer {
  key: LayerKey;
  zh: string;
  en: string;
  cssVar: string;
  abilities: string[];
}

export interface Ability {
  code: string;
  zh: string;
  en: string;
  layer: LayerKey;
  def: string;
}

export interface Sport {
  id: string;
  zh: string;
  en: string;
  cat: string;
  demand: Record<string, number>;
}

// 动作（动作库条目）。cover 为刺激向量：能力 code → 0–5 分制刺激当量
//（主能力约 0.25–0.55，次能力约主能力的 40–60%，以默认组数剂量为基准）。
export interface Exercise {
  id: string;
  zh: string;
  en: string;
  category: string; // squat/hinge/push/pull/carry/jump/throw/sprint/cod/aerobic/interval/coord/balance/mobility/landing/core/reaction…
  cover: Record<string, number>;
  primary: string; // 主能力 code（最大 cover 者）
  equipment: string[]; // 器械标签
  setsMin: number; // 默认组数区间（数值，供强度倍率换算与总表展示）
  setsMax: number;
  reps: string; // 次数/时长/距离文本
  rpe: string;
  minutes: number; // 默认剂量估算分钟
  cue: string;
  regression: string;
}

export interface SaqQuestion {
  code: string;
  zh: string;
  en: string;
  a0: string;
  a5: string;
}

export interface SportGoal {
  id: string;
  weight: SportWeight;
}

export interface UserProfile {
  ageBand: string;
  height: number;
  weight: number;
  trainingAge: string;
}

export interface UserConstraints {
  daysPerWeek: number;
}

export interface UserAssessment {
  mode: AssessmentMode;
  saq: Record<string, number>;
}

export interface UserData {
  profile?: UserProfile;
  sports: SportGoal[];
  constraints: UserConstraints;
  assessment: UserAssessment;
}

export interface Localized {
  zh: string;
  en: string;
}

export interface GapItem {
  code: string;
  current: number;
  target: number;
  deficit: number;
  priority: number;
  transfer: number;
  reasons: Localized[];
  recommendation: Localized[];
}

// 每日目标能力（达标判定依据）
export interface DayAbilityTarget {
  code: string;
  baseline: number; // current[a]
  target: number; // 今日目标分 = round1(min(5, current + δ/f))
  freq: number; // 该能力本轮训练频次
}

// 用户对某动作的选择（强度倍率）
export interface ExerciseChoice {
  exerciseId: string;
  factor: number; // 0.5 | 1 | 1.5 | 2（默认 1）
  ability?: string; // v1.18 所属能力 code（单归属）：动作只出现在该能力组下；缺省按 6.4.3 规则推导
}

// 单个循环训练日（蓝图 + 用户编排状态）
export interface DayBlueprint {
  day: number; // 0..N-1
  labelZh: string; // "第 1 天"…
  labelEn: string; // "Day 1"…
  themeZh: string; // 主题
  themeEn: string;
  duration: string; // 建议时长文本（如 "40–60 分钟"）
  targets: DayAbilityTarget[]; // 该日目标能力
  recommended: string[]; // 引擎「参考推荐组合」动作 id（一键套用，非默认选中）
  choices: ExerciseChoice[]; // 用户当前选择（编排中实时写回）
}

// 训练计划（v1.15 轮模型）
export interface Plan {
  algorithm_version: string;
  generatedAt: string;
  sports: SportGoal[];
  current: Record<string, number>;
  target: Record<string, number>;
  gaps: GapItem[];
  cycleDays: number; // N = 每轮可训练天数
  days: DayBlueprint[]; // N 个训练日（不含专项、不含休息占位）
  practice: Localized; // 专项实践提醒文案（含目标运动名）
  confirmedAt: string | null; // 确认时间戳；null = 未确认（编排模式）
}
