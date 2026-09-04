import { exercise } from "@/lib/data";
import type { DayBlueprint, Exercise } from "@/lib/types";

// —— 强度倍率档位（×0.5/×1/×1.5/×2，见 6.4.3）——
export const FACTORS = [0.5, 1, 1.5, 2];

// —— 三档优先级（v1.17 对外唯一数值化反馈，见 6.4.5 第 8 步）——
// 档位 = 该能力本轮整体缺口 δ = target − current：高 ≥1.0 / 中 0.5–1.0 / 低 <0.5。
export type TierKey = "high" | "mid" | "low";

export function tierOf(deficit: number): TierKey {
  if (deficit >= 1.0) return "high";
  if (deficit >= 0.5) return "mid";
  return "low";
}
export function tierLabel(tier: TierKey): { zh: string; en: string } {
  if (tier === "high") return { zh: "高", en: "High" };
  if (tier === "mid") return { zh: "中", en: "Mid" };
  return { zh: "低", en: "Low" };
}
export function tierColor(tier: TierKey): string {
  if (tier === "high") return "var(--danger)";
  if (tier === "mid") return "var(--warning)";
  return "var(--success)";
}

// —— 动作归属（v1.18 单归属，见 6.4.3 组 4）——
// 主能力恰为当日目标 → 属它；否则取 cover 最高的当日目标能力；对该日所有目标 cover 全 0
// → 返回 null（归「通用动作（准备/收尾）」弱化组）。targetCodes 须为该日目标能力的顺序数组。
export function ownerOf(ex: Exercise, targetCodes: string[]): string | null {
  if (targetCodes.indexOf(ex.primary) >= 0) return ex.primary;
  let best: string | null = null;
  let bestV = 0;
  targetCodes.forEach((code) => {
    const v = ex.cover[code] ?? 0;
    if (v > bestV) {
      bestV = v;
      best = code;
    }
  });
  return bestV > 0 ? best : null;
}

// 单动作组数区间按强度倍率换算（次数与 RPE 不变，见 6.4.3）
export function setsRange(ex: Exercise, factor: number): string {
  const lo = Math.max(1, Math.round(ex.setsMin * factor));
  const hi = Math.max(lo, Math.round(ex.setsMax * factor));
  return `${lo}–${hi}`;
}
export function estimatedMinutes(day: DayBlueprint): number {
  return day.choices.reduce((s, c) => s + exercise(c.exerciseId).minutes * c.factor, 0);
}
