"use client";

import Link from "next/link";
import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import { abilities, layers, sports } from "@/lib/data";
import RadarChart from "@/components/RadarChart";
import SportIcon from "@/components/SportIcon";
import Reveal from "@/components/Reveal";

const STEPS = [
  { t: "step.1.t", d: "step.1.d" },
  { t: "step.2.t", d: "step.2.d" },
  { t: "step.3.t", d: "step.3.d" },
  { t: "step.4.t", d: "step.4.d" },
  { t: "step.5.t", d: "step.5.d" },
  { t: "step.6.t", d: "step.6.d" },
];

export default function LandingPage() {
  const { t, L } = useI18n();
  const [selectedSports, setSelectedSports] = useState<string[]>(["bouldering", "skiing", "badminton"]);

  const toggleSport = (id: string) => {
    setSelectedSports((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      return prev.length < 5 ? [...prev, id] : prev;
    });
  };

  const demandProfile: Record<string, number> = {};
  abilities.forEach((a) => {
    let sum = 0;
    let count = 0;
    selectedSports.forEach((id) => {
      const sp = sports.find((s) => s.id === id);
      if (sp && sp.demand[a.code] != null) {
        sum += sp.demand[a.code];
        count++;
      }
    });
    demandProfile[a.code] = count > 0 ? sum / count : 0;
  });

  return (
    <>
      {/* ① Hero */}
      <section className="hero">
        <div className="hero-inner container">
          <p className="eyebrow hero-eyebrow">
            <span className="gap-accent">G</span>eneral <span className="gap-accent">A</span>thletic <span className="gap-accent">P</span>reparation
          </p>
          <h1 className="hero-title">{t("hero.title")}</h1>
          <p className="hero-sub">{t("hero.subtitle")}</p>
          <div className="hero-cta">
            <Link className="btn btn-primary btn-lg" href="/app/onboarding">
              {t("hero.cta")}
            </Link>
            <a className="btn btn-secondary btn-lg" href="#what">
              {t("hero.cta2")}
            </a>
          </div>
        </div>
        <div className="hero-scroll-hint">{t("hero.scrollHint")}</div>
      </section>

      {/* ② 是什么 / 不是什么 */}
      <section className="section" id="what">
        <div className="container">
          <div className="measure center">
            <p className="eyebrow">{t("what.eyebrow")}</p>
            <h2 className="display-title mt-2">{t("what.title")}</h2>
            <p className="body-lg mt-4">{t("what.hook")}</p>
          <p className="body text-secondary mt-2">{t("what.subtitle")}</p>
          </div>
          <div className="grid grid--2 mt-8">
            <Reveal className="card">
              <h3 className="h3">{t("what.yesTitle")}</h3>
              <ul className="compare-list">
                <li><span className="mark yes">✓</span><span>{t("what.yes1")}</span></li>
                <li><span className="mark yes">✓</span><span>{t("what.yes2")}</span></li>
                <li><span className="mark yes">✓</span><span>{t("what.yes3")}</span></li>
              </ul>
            </Reveal>
            <Reveal className="card" delay={100}>
              <h3 className="h3">{t("what.noTitle")}</h3>
              <ul className="compare-list">
                <li><span className="mark no">✕</span><span>{t("what.no1")}</span></li>
                <li><span className="mark no">✕</span><span>{t("what.no2")}</span></li>
                <li><span className="mark no">✕</span><span>{t("what.no3")}</span></li>
              </ul>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ③ 18 能力 3 层树状图 */}
      <section className="section" id="map">
        <div className="container">
          <div className="measure center">
            <p className="eyebrow">{t("map.eyebrow")}</p>
            <h2 className="display-title mt-2">{t("map.title")}</h2>
            <p className="body-lg text-secondary mt-4">{t("map.subtitle")}</p>
          </div>
          <div className="ability-tree mt-8">
            {layers.map((l) => (
              <Reveal className="ability-layer card card--outlined" key={l.key}>
                <div className="ability-layer-head">
                  <span className="category-dot" style={{ background: `var(${l.cssVar})` }} />
                  <h3 className="h3">{L(l.zh, l.en)}</h3>
                </div>
                <div className="ability-grid">
                  {abilities
                    .filter((a) => a.layer === l.key)
                    .map((a) => (
                      <div className="ability-cell" key={a.code}>
                        <strong>{L(a.zh, a.en)}</strong>
                        <p className="micro">{a.def}</p>
                      </div>
                    ))}
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ④ 如何运作 */}
      <section className="section" id="steps">
        <div className="container">
          <div className="measure center">
            <p className="eyebrow">{t("steps.eyebrow")}</p>
            <h2 className="display-title mt-2">{t("steps.title")}</h2>
          </div>
          <div className="steps mt-8">
            {STEPS.map((s, i) => (
              <Reveal className="step" key={s.t} delay={i * 60}>
                <div className="step-icon">{i + 1}</div>
                <div className="step-title">{t(s.t)}</div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ⑤ 共享能力 */}
      <section className="section" id="sports">
        <div className="container">
          <div className="measure center">
            <p className="eyebrow">{t("sports.eyebrow")}</p>
            <h2 className="display-title mt-2">{t("sports.title")}</h2>
            <p className="body-lg text-secondary mt-4">{t("sports.subtitle")}</p>
          </div>
          <div className="sport-chips">
            {sports.map((s) => {
              const on = selectedSports.includes(s.id);
              return (
                <button key={s.id} className={"chip" + (on ? " is-active" : "")} type="button" onClick={() => toggleSport(s.id)}>
                  <SportIcon inner={s.icon} />
                  {L(s.zh, s.en)}
                </button>
              );
            })}
          </div>
          <div className="shared-radar-wrap">
            <RadarChart current={demandProfile} showLegend={false} />
            <p className="center text-secondary mt-4">
              {selectedSports.length >= 1
                ? selectedSports.map((id) => {
                    const sp = sports.find((s) => s.id === id)!;
                    return L(sp.zh, sp.en);
                  }).join(" + ")
                : L("至少选择 1 项运动", "Select at least 1 sport")}
            </p>
          </div>
        </div>
      </section>

      {/* ⑥ 底部 CTA */}
      <section className="section section--tight">
        <div className="container center">
          <h2 className="display-title">{t("cta.title")}</h2>
          <div className="mt-6">
            <Link className="btn btn-primary btn-lg" href="/app/onboarding">
              {t("cta.btn")}
            </Link>
          </div>
          <p className="caption mt-6">{t("footer.disclaimer")}</p>
        </div>
      </section>
    </>
  );
}
