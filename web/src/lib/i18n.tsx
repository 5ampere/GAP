"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { store } from "./store";
import type { Lang } from "./types";

const dict: Record<Lang, Record<string, string>> = {
  zh: {
    "nav.home": "欢迎", "nav.start": "定制计划", "nav.docs": "了解GAP", "nav.cta": "定制计划",
    "footer.product": "产品", "footer.knowledge": "知识", "footer.legal": "法律",
    "footer.disclaimerLink": "免责声明", "footer.tagline": "General Athletic Preparation",
    "footer.disclaimer": "© 2026 GAP. GAP 是训练决策工具，不构成医疗建议。",
    "hero.title": "一个身体底座，玩转多种运动",
    "hero.subtitle": "GAP 帮你建设力量、速度、爆发力、耐力与身体控制的通用底座，让不同运动都有更好的起点。",
    "hero.cta": "定制计划", "hero.cta2": "了解 GAP", "hero.scrollHint": "向下滚动",
    "what.eyebrow": "GAP 是什么", "what.title": "通用能力底座，而非单项极限",
    "what.subtitle": "GAP（General Athletic Preparation）为多运动爱好者建设共享的底层运动能力。",
    "what.hook": "你是否因为专注增肌而牺牲了灵活性？又或者，想要均衡地发展各项运动能力？",
    "what.yesTitle": "GAP 是", "what.noTitle": "GAP 不是",
    "what.yes1": "为多个运动建设共享的能力底座",
    "what.yes2": "用能力缺口组织训练，而非肌肉群",
    "what.yes3": "可解释：每项训练都知道为什么",
    "what.no1": "不是替代专项训练的万能计划",
    "what.no2": "不是追求所有指标都达到最高",
    "what.no3": "不是医疗诊断或伤病康复系统",
    "map.eyebrow": "能力地图", "map.title": "18 项能力，3 大层级",
    "map.subtitle": "三层能力树，一览 18 项能力全貌。",
    "map.tap": "点击上方能力查看详情",
    "steps.eyebrow": "如何运作", "steps.title": "六步，从期望到计划",
    "step.1.t": "选择目标运动", "step.1.d": "1–6 项运动与优先级",
    "step.2.t": "现有能力评估", "step.2.d": "简单自评或专业自测",
    "step.3.t": "生成能力画像", "step.3.d": "当前能力分与置信度",
    "step.4.t": "找出缺口", "step.4.d": "目标需要而你相对不足",
    "step.5.t": "生成计划", "step.5.d": "结合时间、器械与恢复",
    "step.6.t": "复测更新", "step.6.d": "周期性复测并更新计划",
    "sports.eyebrow": "为什么多运动", "sports.title": "不同运动，共享能力",
    "sports.subtitle": "选择几项你喜欢的运动，看看它们共享哪些底层能力。",
    "cta.title": "开始建立你的能力底座", "cta.btn": "定制计划",
    "ob.title": "创建你的 GAP 计划",
    "ob.back": "上一步", "ob.next": "下一步", "ob.generate": "生成我的 GAP 计划",
    "ob.step1": "基本资料", "ob.step2": "目标运动", "ob.step3": "训练天数",
    "ob.step4": "评估方式", "ob.step5": "能力评估", "ob.step6": "生成",
    "ob.step1.sub": "告诉我们你的基本训练背景。",
    "ob.step2.sub": "选择 1–6 项你想发展的运动。",
    "ob.step3.sub": "选择你每轮可训练的天数。",
    "ob.step4.sub": "选择简单自评或专业自测。",
    "ob.step5.sub": "完成能力评估，建立你的能力画像。",
    "ob.step6.sub": "正在分析你的能力缺口，生成计划…",
    "mode.saq": "简单自评", "mode.spt": "专业自测", "mode.hybrid": "先自评、后补测",
    "mode.saq.d": "5–8 分钟，通俗问题，快速出首版计划。",
    "mode.spt.d": "标准化实测，覆盖全部 18 项能力，精度更高。",
    "mode.hybrid.d": "先拿计划，之后随时补测校准。",
    "dash.title": "你的能力画像", "dash.gaps": "能力缺口", "dash.week": "每轮训练", "dash.radar": "能力雷达图",
    "dash.viewPlan": "定制完整计划", "dash.reassess": "复测", "dash.adjust": "调整目标",
    "plan.title": "训练计划", "plan.back": "返回仪表盘",
  },
  en: {
    "nav.home": "Welcome", "nav.start": "Custom Plan", "nav.docs": "About GAP", "nav.cta": "Custom Plan",
    "footer.product": "Product", "footer.knowledge": "Knowledge", "footer.legal": "Legal",
    "footer.disclaimerLink": "Disclaimer", "footer.tagline": "General Athletic Preparation",
    "footer.disclaimer": "© 2026 GAP. GAP is a training decision tool, not medical advice.",
    "hero.title": "One foundation. Many sports.",
    "hero.subtitle": "GAP builds your general base of strength, speed, power, endurance and body control — so every sport starts better.",
    "hero.cta": "Custom Plan", "hero.cta2": "About GAP", "hero.scrollHint": "Scroll down",
    "what.eyebrow": "What is GAP", "what.title": "A general base, not a single-sport peak",
    "what.subtitle": "GAP (General Athletic Preparation) builds shared underlying capacity for multi-sport athletes.",
    "what.hook": "Have you sacrificed flexibility for muscle gain? Or do you want balanced athletic development?",
    "what.yesTitle": "What GAP is", "what.noTitle": "What GAP isn't",
    "what.yes1": "Builds shared capacity across your sports",
    "what.yes2": "Organizes training by capacity gap, not muscle groups",
    "what.yes3": "Explainable: every recommendation tells you why",
    "what.no1": "Not a universal plan that replaces sport practice",
    "what.no2": "Not pushing every metric to its maximum",
    "what.no3": "Not a medical diagnosis or rehab system",
    "map.eyebrow": "Capacity Map", "map.title": "18 abilities, 3 layers",
    "map.subtitle": "A three-layer tree showing all 18 abilities at a glance.",
    "map.tap": "Tap an ability to see details",
    "steps.eyebrow": "How it works", "steps.title": "Six steps, from goal to plan",
    "step.1.t": "Choose sports", "step.1.d": "1–6 sports with priorities",
    "step.2.t": "Assess current capacity", "step.2.d": "Quick self-report or standard tests",
    "step.3.t": "Generate profile", "step.3.d": "Current scores with confidence",
    "step.4.t": "Find the gap", "step.4.d": "What your goals need that you lack",
    "step.5.t": "Generate plan", "step.5.d": "Fits time, equipment and recovery",
    "step.6.t": "Re-test", "step.6.d": "Periodic re-assessment and update",
    "sports.eyebrow": "Why multi-sport", "sports.title": "Different sports, shared capacity",
    "sports.subtitle": "Pick a few sports you love and see the underlying abilities they share.",
    "cta.title": "Start building your foundation", "cta.btn": "Custom Plan",
    "ob.title": "Build your GAP plan",
    "ob.back": "Back", "ob.next": "Next", "ob.generate": "Generate my GAP plan",
    "ob.step1": "Profile", "ob.step2": "Goal sports", "ob.step3": "Training days",
    "ob.step4": "Assessment mode", "ob.step5": "Assessment", "ob.step6": "Generate",
    "ob.step1.sub": "Tell us your training background.",
    "ob.step2.sub": "Choose 1–6 sports you want to develop.",
    "ob.step3.sub": "Choose how many days you can train per cycle.",
    "ob.step4.sub": "Choose quick self-report or standard tests.",
    "ob.step5.sub": "Complete the assessment to build your profile.",
    "ob.step6.sub": "Analyzing your gaps and building your plan…",
    "mode.saq": "Quick self-report", "mode.spt": "Standard tests", "mode.hybrid": "Self-report then refine",
    "mode.saq.d": "5–8 min, simple questions, first plan fast.",
    "mode.spt.d": "Standardized tests covering all 18 abilities, higher precision.",
    "mode.hybrid.d": "Get a plan now, refine with tests later.",
    "dash.title": "Your capacity profile", "dash.gaps": "Ability gaps", "dash.week": "Training per cycle", "dash.radar": "Capacity Radar",
    "dash.viewPlan": "Customize full plan", "dash.reassess": "Re-assess", "dash.adjust": "Adjust goals",
    "plan.title": "Training Plan", "plan.back": "Back to dashboard",
  },
};

interface I18nValue {
  lang: Lang;
  t: (key: string) => string;
  L: (zh: string, en?: string) => string;
  setLang: (l: Lang) => void;
}

const I18nContext = createContext<I18nValue>({
  lang: "zh",
  t: (k) => k,
  L: (zh) => zh,
  setLang: () => {},
});

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("zh");

  useEffect(() => {
    const saved = store.get<Lang>("gap.lang", "zh");
    const l = saved === "en" ? "en" : "zh";
    setLangState(l);
    document.documentElement.setAttribute("lang", l === "en" ? "en" : "zh-CN");
  }, []);

  const t = (key: string) => dict[lang][key] ?? dict.zh[key] ?? key;
  const L = (zh: string, en?: string) => (lang === "en" && en ? en : zh);
  const setLang = (l: Lang) => {
    setLangState(l);
    store.set("gap.lang", l);
    document.documentElement.setAttribute("lang", l === "en" ? "en" : "zh-CN");
  };

  return <I18nContext.Provider value={{ lang, t, L, setLang }}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  return useContext(I18nContext);
}
