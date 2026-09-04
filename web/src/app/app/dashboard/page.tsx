"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { store } from "@/lib/store";
import { useI18n } from "@/lib/i18n";
import { abilities } from "@/lib/data";
import type { Plan } from "@/lib/types";
import RadarChart from "@/components/RadarChart";
import AbilityBar from "@/components/AbilityBar";
import GapBarChart from "@/components/GapBarChart";
import { tierOf } from "@/components/plan/shared";

export default function DashboardPage() {
  const router = useRouter();
  const { t, L } = useI18n();
  const [plan, setPlan] = useState<Plan | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const p = store.get<Plan | null>("gap.plan", null);
    // 旧版周模型数据无 days → 回炉重新生成
    if (!p || !Array.isArray(p.days)) {
      router.replace("/app/onboarding");
      return;
    }
    setPlan(p);
    const mq = window.matchMedia("(max-width:768px)");
    setIsMobile(mq.matches);
    const on = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, [router]);

  if (!plan) {
    return (
      <main className="section center" style={{ minHeight: "55vh" }}>
        <p className="text-secondary">{t("ob.step6.sub")}</p>
      </main>
    );
  }

  // v1.17 stat 口径：需提升能力 / 高优先级 / 每轮训练 / 目标运动（去 达标能力、平均缺口）
  const highCount = plan.gaps.filter((g) => tierOf(g.deficit) === "high").length;
  const rows = plan.days.map((d) => ({ d, n: d.choices.length }));

  return (
    <main className="container section">
      <div className="flex-between" style={{ flexWrap: "wrap", gap: 16 }}>
        <div>
          <p className="eyebrow">GAP</p>
          <h1 className="display-title">{t("dash.title")}</h1>
        </div>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <Link className="btn btn-secondary" href="/app/onboarding">
            {t("dash.adjust")}
          </Link>
          <Link className="btn btn-ghost" href="/app/onboarding">
            {t("dash.reassess")}
          </Link>
        </div>
      </div>

      <div className="stat-tiles mt-6">
        <div className="stat-tile">
          <div className="stat-value tnum">{plan.gaps.length} / {abilities.length}</div>
          <div className="stat-label">{L("需提升能力", "To improve")}</div>
        </div>
        <div className="stat-tile">
          <div className="stat-value tnum">{highCount}</div>
          <div className="stat-label">{L("高优先级", "High priority")}</div>
        </div>
        <div className="stat-tile">
          <div className="stat-value tnum">{plan.cycleDays} {L("次", "")}</div>
          <div className="stat-label">{L("每轮训练", "Sessions per cycle")}</div>
        </div>
        <div className="stat-tile">
          <div className="stat-value tnum">{plan.sports.length}</div>
          <div className="stat-label">{L("目标运动", "Goal sports")}</div>
        </div>
      </div>

      <div className="dash-sections mt-6">
        <section className="dash-section">
          <h2 className="h2">{t("dash.radar")}</h2>
          <div className="card mt-4">
            <div className="dash-radar-wrap">
              {isMobile ? (
                abilities.map((a) => (
                  <AbilityBar key={a.code} code={a.code} current={plan.current[a.code]} target={plan.target[a.code]} />
                ))
              ) : (
                <RadarChart current={plan.current} target={plan.target} />
              )}
            </div>
          </div>
        </section>

        <section className="dash-section">
          <h2 className="h2">{t("dash.gaps")}</h2>
          {/* 图例：优先级三档（v1.17，颜色同 AbilityGroup/总表） */}
          <div className="gap-legend">
            <span><i className="legend-dot is-high" />{L("高 ≥1.0", "High ≥1.0")}</span>
            <span><i className="legend-dot is-mid" />{L("中 0.5–1.0", "Mid 0.5–1.0")}</span>
            <span><i className="legend-dot is-low" />{L("低 <0.5", "Low <0.5")}</span>
          </div>
          <div className="card mt-4">
            {plan.gaps.length ? (
              <GapBarChart gaps={plan.gaps} />
            ) : (
              <p className="text-secondary">{L("暂无显著缺口，进入维持阶段。", "No significant gaps — you're in maintenance.")}</p>
            )}
          </div>
        </section>

        <section className="dash-section">
          <h2 className="h2">{t("dash.week")}</h2>
          <div className="card mt-4">
            <div className="day-tiles">
              {rows.map(({ d, n }) => (
                <div className="day-tile" key={d.day}>
                  <div className="day-tile-top">
                    <span className="day-tile-label">{L(d.labelZh, d.labelEn)}</span>
                    <span className="day-tile-count tnum">
                      {n ? `${n} ${L("项", "items")}` : L("待编排", "Not set")}
                    </span>
                  </div>
                  <div className="day-tile-theme">{L(d.themeZh, d.themeEn)}</div>
                  <div className="day-tile-meta">{d.duration} {L("分钟", "min")}</div>
                </div>
              ))}
            </div>
            <div className="dash-card-foot mt-4">
              <Link className="btn btn-primary btn-sm" href="/app/plan">
                {t("dash.viewPlan")}
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
