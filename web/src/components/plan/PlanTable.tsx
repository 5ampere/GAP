"use client";

import { useRef, useState } from "react";
import { toPng } from "html-to-image";
import { ability, categoryLabel, exercise } from "@/lib/data";
import { useI18n } from "@/lib/i18n";
import type { DayBlueprint, Plan } from "@/lib/types";
import { estimatedMinutes, setsRange, tierLabel, tierOf, type TierKey } from "./shared";

interface Props {
  plan: Plan;
  onReedit: () => void;
}

// 导出文件名日期：gap-plan-yyyymmdd.png（本地时区）
function ymd(iso: string): string {
  const d = new Date(iso);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}`;
}

// 单日卡片（v2.3 卡片化）：上段能力（全称 + 优先级 chip），下段纵向平铺动作（名称 + 类别徽标 + 剂量）。
function DayCard({ day, tierMap }: { day: DayBlueprint; tierMap: Record<string, TierKey> }) {
  const { L } = useI18n();
  const est = estimatedMinutes(day);
  return (
    <article className="pt-card">
      <header className="pt-card-head">
        <div className="pt-card-line">
          <span className="pt-day">{L(day.labelZh, day.labelEn)}</span>
          <span className="pt-est tnum">≈{est}min</span>
        </div>
        <div className="pt-theme">{L(day.themeZh, day.themeEn)}</div>
      </header>

      {/* 上段：该日目标能力 */}
      <section className="pt-card-targets">
        <span className="pt-sec">{L("能力（优先级）", "Abilities (priority)")}</span>
        <div className="pt-targets">
          {day.targets.length ? (
            day.targets.map((t) => {
              const a = ability(t.code);
              const k = tierMap[t.code] ?? "low";
              const tl = tierLabel(k);
              return (
                <div key={t.code} className="pt-target">
                  <span className="pt-target-name">{L(a.zh, a.en)}</span>
                  <span className={`tier-chip is-${k}`}>{L(tl.zh, tl.en)}</span>
                </div>
              );
            })
          ) : (
            <span className="text-tertiary">—</span>
          )}
        </div>
      </section>

      {/* 下段：动作平铺 */}
      <section className="pt-card-items">
        <span className="pt-sec">{L("动作明细", "Exercises")}</span>
        <div className="pt-items">
          {day.choices.length ? (
            day.choices.map((c) => {
              const ex = exercise(c.exerciseId);
              const cat = categoryLabel[ex.category] ?? { zh: ex.category, en: ex.category };
              const range = setsRange(ex, c.factor);
              const note = c.factor < 1 ? L(" 减量", " lighter") : "";
              const more = c.factor > 1 ? ` ×${c.factor}` : "";
              const rpe = ex.rpe && ex.rpe !== "低" ? ` RPE${ex.rpe}` : "";
              return (
                <div key={c.exerciseId} className="pt-item">
                  <div className="pt-item-main">
                    <span className="pt-item-name">{L(ex.zh, ex.en)}</span>
                    <span className="badge badge--maint pt-cat">{L(cat.zh, cat.en)}</span>
                  </div>
                  <div className="pt-item-dose tnum">
                    {range}组 × {ex.reps}
                    {rpe}
                    {more}
                    {note}
                  </div>
                </div>
              );
            })
          ) : (
            <span className="text-tertiary">{L("未选动作", "No exercises")}</span>
          )}
        </div>
      </section>
    </article>
  );
}

// 总表（PlanTable · 只读，确认态展示，v2.3 卡片化 + 客户端图片下载）。
// 无目标分/达成分/达标字样。下载 = 离屏白底导出副本 → html-to-image 合成 PNG → <a download>。
export default function PlanTable({ plan, onReedit }: Props) {
  const { L, lang } = useI18n();
  const exportRef = useRef<HTMLDivElement | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  // 能力整体缺口 → 档位（与仪表盘②/编排板块②同口径）
  const tierMap: Record<string, TierKey> = {};
  plan.gaps.forEach((g) => {
    tierMap[g.code] = tierOf(g.deficit);
  });

  const dayCards = () => plan.days.map((d) => <DayCard key={d.day} day={d} tierMap={tierMap} />);

  // 全局尾行 = practice 单行 + 算法版本（可见与导出共用）
  const footBlock = () => (
    <div className="pt-foot-block">
      <div className="pt-practice">{L(plan.practice.zh, plan.practice.en)}</div>
      <div className="pt-foot tnum">
        {L("算法版本", "algorithm")} {plan.algorithm_version} · {L("生成于", "generated")}{" "}
        {new Date(plan.generatedAt).toLocaleString()}
      </div>
    </div>
  );

  // 纯客户端下载：捕获离屏 export 副本（固定 1080 宽、白底强制浅色、语言随当前界面）
  const download = async () => {
    const node = exportRef.current;
    if (!node || isDownloading) return;
    setIsDownloading(true);
    try {
      if (typeof document !== "undefined" && document.fonts?.ready) {
        await document.fonts.ready; // 等字体就绪再捕获，避免文字缺漏
      }
      const dataUrl = await toPng(node, { pixelRatio: 2, backgroundColor: "#ffffff", cacheBust: false });
      const a = document.createElement("a");
      a.download = `gap-plan-${ymd(plan.generatedAt)}.png`;
      a.href = dataUrl;
      a.click();
    } catch (err) {
      console.error("PlanTable 下载计划图片失败:", err);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="mt-6">
      <div className="flex-between" style={{ flexWrap: "wrap", gap: 12 }}>
        <p className="caption">
          {L("本轮共", "Cycle")} <b className="tnum">{plan.days.length}</b> {L("个训练日", "training days")}
          {plan.confirmedAt ? (
            <span className="text-tertiary">
              {" "}
              · {L("确认于", "confirmed")} {new Date(plan.confirmedAt).toLocaleString()}
            </span>
          ) : null}
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            className="btn btn-sm btn-primary"
            onClick={download}
            disabled={isDownloading}
            aria-busy={isDownloading}
          >
            {isDownloading ? L("生成中…", "Preparing…") : L("下载计划图片", "Download PNG")}
          </button>
          <button type="button" className="btn btn-sm btn-secondary" onClick={onReedit}>
            {L("重新编排", "Re-edit")}
          </button>
        </div>
      </div>

      <div className="pt-card-grid mt-4">{dayCards()}</div>
      {footBlock()}

      {/* v2.3 图片下载：离屏渲染副本（白底固定配色，仅供 html-to-image 捕获，不参与界面交互） */}
      <div className="pt-export" ref={exportRef} aria-hidden="true">
        <div className="pt-export-head">
          <span className="pt-export-brand">
            GAP · {L("训练计划", "Training Plan")}
          </span>
          <span className="pt-export-meta tnum">
            {lang === "en"
              ? `${plan.days.length} training days · generated ${new Date(plan.generatedAt).toLocaleString()}`
              : `共 ${plan.days.length} 个训练日 · 生成于 ${new Date(plan.generatedAt).toLocaleString()}`}
          </span>
        </div>
        <div className="pt-card-grid">{dayCards()}</div>
        {footBlock()}
      </div>
    </div>
  );
}
