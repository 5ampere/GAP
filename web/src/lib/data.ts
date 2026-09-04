// GAP mock 数据（原型用）。能力本体 / 5 类分组 / 运动目录 / 动作库 / SAQ 题库。
// 注意：这是「原型 mock 数据」，真实数据由后端知识库（versioned）提供。
import type { Ability, Layer, Exercise, SaqQuestion, Sport } from "./types";

export const layers: Layer[] = [
  { key: "L1", zh: "体能基础", en: "Physical Capacity", cssVar: "--layer-l1", abilities: ["STR_MAX", "STR_REL", "STR_END", "GRIP_CORE", "PWR", "AER_CAP", "AER_END", "ANA_CAP", "RHIA"] },
  { key: "L2", zh: "动作能力", en: "Movement Capacity", cssVar: "--layer-l2", abilities: ["SPD", "ACC", "DEC_COD", "BAL", "COORD", "MOB", "STAB"] },
  { key: "L3", zh: "感知与适应", en: "Perception & Adaptation", cssVar: "--layer-l3", abilities: ["REACT", "AWARE"] },
];

export const abilities: Ability[] = [
  { code: "STR_MAX", zh: "最大力量", en: "Maximal Strength", layer: "L1", def: "单次或极低次数的高力输出能力。" },
  { code: "STR_REL", zh: "相对力量", en: "Relative Strength", layer: "L1", def: "单位体重的力量能力，自重运动与攀爬的基础。" },
  { code: "STR_END", zh: "力量耐力", en: "Strength Endurance", layer: "L1", def: "重复/持续输出力量的能力。" },
  { code: "GRIP_CORE", zh: "握力与躯干传力", en: "Grip & Core", layer: "L1", def: "抓握、悬挂以及下肢到上肢的力量传递。" },
  { code: "PWR", zh: "爆发力", en: "Power", layer: "L1", def: "短时间内产生较大机械功率/冲量的能力。" },
  { code: "SPD", zh: "速度", en: "Speed", layer: "L2", def: "快速完成肢体或身体位移的能力。" },
  { code: "ACC", zh: "加速", en: "Acceleration", layer: "L2", def: "从低速快速建立速度的能力。" },
  { code: "DEC_COD", zh: "减速与变向", en: "Deceleration & COD", layer: "L2", def: "吸收动量、制动、改变方向并再加速。" },
  { code: "AER_CAP", zh: "有氧能力", en: "Aerobic Capacity", layer: "L1", def: "持续有氧能量供给能力。" },
  { code: "AER_END", zh: "有氧耐力", en: "Aerobic Endurance", layer: "L1", def: "较长时间维持次最大输出的能力。" },
  { code: "ANA_CAP", zh: "无氧能力", en: "Anaerobic Capacity", layer: "L1", def: "短时间高强度能量输出能力。" },
  { code: "RHIA", zh: "重复高强度能力", en: "Repeat High-Intensity Ability", layer: "L1", def: "高强度输出与恢复并重复的能力。" },
  { code: "BAL", zh: "平衡", en: "Balance", layer: "L2", def: "维持和恢复身体重心控制的能力。" },
  { code: "COORD", zh: "协调", en: "Coordination", layer: "L2", def: "多身体部位在时间、空间、力量上的协同。" },
  { code: "REACT", zh: "感知-反应", en: "Reaction", layer: "L3", def: "对外部刺激快速选择并执行动作。" },
  { code: "AWARE", zh: "身体空间觉", en: "Body Awareness", layer: "L3", def: "本体感觉、身体位置和空间关系感知。" },
  { code: "MOB", zh: "活动度", en: "Mobility", layer: "L2", def: "可用且可主动控制的关节运动范围。" },
  { code: "STAB", zh: "稳定性", en: "Stability", layer: "L2", def: "动态任务中控制关节/躯干位置的能力。" },
];

// 12 指标 → 18 能力需求向量（源自 HLD 附录 A 种子矩阵）
function demand12(d: number[]): Record<string, number> {
  const [STR, RSTR, END, PWR, SPDACC, DECCOD, AER, ANARHIA, BAL, COORD, MOB, GRIPCORE] = d;
  return {
    STR_MAX: STR, STR_REL: RSTR, STR_END: END, PWR,
    SPD: SPDACC, ACC: SPDACC, DEC_COD: DECCOD,
    AER_CAP: AER, AER_END: AER,
    ANA_CAP: ANARHIA, RHIA: ANARHIA,
    BAL, COORD, REACT: COORD, AWARE: COORD,
    MOB, STAB: MOB, GRIP_CORE: GRIPCORE,
  };
}

export const sports: Sport[] = [
  // 球类（10）
  { id: "basketball", zh: "篮球", en: "Basketball", cat: "球类", icon: '<circle cx="12" cy="12" r="8"/><path d="M4 12h16M12 4v16"/><path d="M5.5 5.5c4 4 9 4 13 13M18.5 5.5c-4 4-9 4-13 13"/>', demand: demand12([4, 4, 3, 5, 5, 5, 4, 5, 4, 5, 3, 2]) },
  { id: "soccer", zh: "足球", en: "Soccer", cat: "球类", icon: '<circle cx="12" cy="12" r="8"/><path d="M12 7l3.2 2.3-1.2 3.8h-4L8.8 9.3z"/>', demand: demand12([4, 4, 4, 4, 5, 5, 5, 5, 4, 5, 3, 1]) },
  { id: "tennis", zh: "网球", en: "Tennis", cat: "球类", icon: '<circle cx="8" cy="12" r="4"/><path d="M8 8v8M4 12h8M12 16l8 2"/>', demand: demand12([3, 3, 3, 4, 5, 5, 4, 5, 5, 5, 4, 2]) },
  { id: "badminton", zh: "羽毛球", en: "Badminton", cat: "球类", icon: '<path d="M12 4l4 4-4 2-4-2z"/><path d="M12 10v4M9 14l-2 3M15 14l2 3"/>', demand: demand12([3, 3, 3, 4, 5, 5, 4, 5, 5, 5, 4, 1]) },
  { id: "volleyball", zh: "排球", en: "Volleyball", cat: "球类", icon: '<circle cx="12" cy="12" r="8"/><path d="M12 4v16M4 12h16"/>', demand: demand12([4, 4, 2, 5, 4, 4, 3, 4, 4, 5, 3, 1]) },
  { id: "table-tennis", zh: "乒乓球", en: "Table Tennis", cat: "球类", icon: '<circle cx="15" cy="10" r="4"/><path d="M11 14l-5 6M8 6l4 2"/>', demand: demand12([2, 2, 2, 2, 5, 4, 3, 4, 4, 5, 3, 1]) },
  { id: "squash", zh: "壁球", en: "Squash", cat: "球类", icon: '<circle cx="12" cy="12" r="3"/><path d="M12 15l7 5M12 9L5 4"/>', demand: demand12([3, 3, 4, 4, 5, 5, 5, 5, 5, 5, 3, 1]) },
  { id: "pickleball", zh: "匹克球", en: "Pickleball", cat: "球类", icon: '<circle cx="12" cy="12" r="7"/><path d="M12 5l4-2M12 5L8 3"/>', demand: demand12([2, 2, 2, 3, 4, 4, 3, 3, 4, 5, 3, 1]) },
  { id: "frisbee", zh: "飞盘", en: "Frisbee", cat: "球类", icon: '<ellipse cx="12" cy="12" rx="9" ry="4"/><path d="M12 8v8"/>', demand: demand12([3, 3, 3, 4, 4, 4, 4, 4, 4, 5, 3, 2]) },
  { id: "golf", zh: "高尔夫", en: "Golf", cat: "球类", icon: '<circle cx="10" cy="20" r="2"/><path d="M12 18V6l4 2-3 4"/>', demand: demand12([3, 3, 2, 3, 2, 1, 2, 1, 3, 5, 5, 3]) },
  // 水上（5）
  { id: "swimming", zh: "游泳", en: "Swimming", cat: "水上", icon: '<path d="M3 9c2-2 4 2 6 0s4-2 6 0 4 2 6 0M3 15c2-2 4 2 6 0s4-2 6 0 4 2 6 0"/>', demand: demand12([3, 3, 4, 3, 4, 1, 5, 4, 4, 5, 5, 3]) },
  { id: "surfing", zh: "冲浪", en: "Surfing", cat: "水上", icon: '<path d="M3 13c3-2 6-2 9 0s6 2 9 0"/><path d="M5 17c3-2 6-2 9 0s6 2 9 0M12 10l4-5-4 2z"/>', demand: demand12([4, 4, 4, 5, 3, 4, 4, 4, 5, 5, 5, 3]) },
  { id: "kayaking", zh: "皮划艇", en: "Kayaking", cat: "水上", icon: '<path d="M3 16l18-7M3 16c0 4 18 4 18 0z"/><path d="M9 11l2-4h4"/>', demand: demand12([4, 4, 5, 3, 3, 2, 5, 4, 4, 4, 4, 5]) },
  { id: "sup", zh: "SUP 桨板", en: "Stand-up Paddle", cat: "水上", icon: '<path d="M4 14h16M7 14l2-6h8l2 6"/>', demand: demand12([3, 3, 4, 2, 2, 2, 4, 2, 5, 5, 4, 3]) },
  { id: "rowing", zh: "划船", en: "Rowing", cat: "水上", icon: '<path d="M4 14h16"/><path d="M8 11l2-4h4l2 4"/>', demand: demand12([5, 4, 5, 4, 3, 1, 5, 5, 3, 4, 3, 4]) },
  // 雪上（4）
  { id: "skiing", zh: "高山滑雪", en: "Alpine Skiing", cat: "雪上", icon: '<path d="M4 19l8-4M12 15l7-7M14 19l-4-2"/>', demand: demand12([4, 4, 4, 5, 4, 5, 4, 4, 5, 5, 4, 2]) },
  { id: "snowboarding", zh: "单板滑雪", en: "Snowboarding", cat: "雪上", icon: '<path d="M5 18l14-4M11 9l5 4-4 1z"/>', demand: demand12([4, 4, 4, 5, 4, 5, 4, 4, 5, 5, 5, 2]) },
  { id: "xc-skiing", zh: "越野滑雪", en: "Cross-country Skiing", cat: "雪上", icon: '<path d="M4 18l6-2 4-6 5-1M8 16l-2 3M15 9l3-4M10 16l3 2"/>', demand: demand12([4, 4, 5, 3, 4, 3, 5, 4, 4, 4, 3, 2]) },
  { id: "skating", zh: "滑冰", en: "Skating", cat: "雪上", icon: '<path d="M6 18l3-8 3 8M6 18l-2-1M12 18l2-1"/>', demand: demand12([4, 4, 4, 5, 5, 5, 4, 4, 5, 5, 4, 1]) },
  // 攀岩（2）
  { id: "bouldering", zh: "抱石", en: "Bouldering", cat: "攀岩", icon: '<circle cx="6" cy="6" r="1.6"/><circle cx="12" cy="4" r="1.6"/><circle cx="18" cy="7" r="1.6"/><circle cx="19" cy="15" r="1.6"/><circle cx="12" cy="19" r="1.6"/><circle cx="5" cy="14" r="1.6"/>', demand: demand12([4, 5, 4, 4, 2, 2, 2, 5, 5, 5, 5, 5]) },
  { id: "sport-climbing", zh: "运动攀岩", en: "Sport Climbing", cat: "攀岩", icon: '<circle cx="7" cy="7" r="2"/><path d="M7 9c1 4 3 6 3 11M8 9l6-3"/>', demand: demand12([4, 5, 5, 3, 2, 2, 3, 5, 5, 5, 5, 5]) },
  // 体能（4）
  { id: "running", zh: "跑步", en: "Running", cat: "体能", icon: '<circle cx="14" cy="4.5" r="2"/><path d="M13 8l-3.5 2.5L7 9M13 8l1.5 3 4.5 1M9.5 10.5L11 15l-3 3M9.5 10.5L13 11"/>', demand: demand12([3, 4, 5, 3, 5, 2, 5, 3, 4, 4, 3, 1]) },
  { id: "trail-running", zh: "越野跑", en: "Trail Running", cat: "体能", icon: '<path d="M3 20l9-10 3 2 5-3"/><circle cx="15" cy="4" r="2"/>', demand: demand12([3, 4, 5, 4, 4, 4, 5, 4, 5, 4, 4, 1]) },
  { id: "cycling", zh: "骑行", en: "Cycling", cat: "体能", icon: '<circle cx="6" cy="17" r="3.5"/><circle cx="18" cy="17" r="3.5"/><path d="M6 17l5-6 7 2M11 11l1-4h4"/>', demand: demand12([4, 4, 5, 3, 4, 2, 5, 4, 3, 4, 3, 2]) },
  { id: "jump-rope", zh: "跳绳", en: "Jump Rope", cat: "体能", icon: '<path d="M5 4c6-4 8 16 14 12M9 18c0 4 6 0 6 0"/>', demand: demand12([2, 3, 4, 4, 4, 4, 4, 4, 5, 5, 3, 1]) },
  // 户外（3）
  { id: "hiking", zh: "徒步", en: "Hiking", cat: "户外", icon: '<path d="M3 19L9 7l3 6 2-3 5 9z"/><path d="M12 13v6"/>', demand: demand12([3, 3, 5, 2, 1, 2, 5, 2, 4, 3, 3, 2]) },
  { id: "mountaineering", zh: "登山", en: "Mountaineering", cat: "户外", icon: '<path d="M3 19L9 7l3 6 3-4 6 10z"/>', demand: demand12([4, 4, 5, 3, 2, 3, 5, 3, 5, 4, 4, 3]) },
  { id: "mountain-bike", zh: "山地车", en: "Mountain Biking", cat: "户外", icon: '<circle cx="6" cy="17" r="3.5"/><circle cx="18" cy="17" r="3.5"/><path d="M6 17l5-7 7 3M11 10l1-4h4"/>', demand: demand12([4, 4, 4, 4, 4, 5, 4, 4, 5, 5, 4, 2]) },
  // 对抗（3）
  { id: "boxing", zh: "拳击", en: "Boxing", cat: "对抗", icon: '<circle cx="13" cy="10" r="5"/><path d="M13 5V3l5 3-4 2z"/>', demand: demand12([4, 4, 4, 5, 5, 5, 4, 5, 4, 5, 4, 3]) },
  { id: "martial-arts", zh: "武术", en: "Martial Arts", cat: "对抗", icon: '<circle cx="12" cy="5" r="2"/><path d="M12 7v4l-4 3 4 1-4 4M12 11l4 3-4 1 4 4"/>', demand: demand12([4, 4, 4, 5, 5, 5, 4, 5, 5, 5, 5, 3]) },
  { id: "bjj", zh: "巴西柔术", en: "Brazilian Jiu-Jitsu", cat: "对抗", icon: '<circle cx="12" cy="5" r="2"/><path d="M12 7c0 3-4 4-6 9M12 7c0 3 4 4 6 9M12 10c-3 1-5 3-6 6M12 10c3 1 5 3 6 6"/>', demand: demand12([5, 5, 5, 4, 3, 4, 4, 5, 5, 5, 5, 5]) },
  // 技巧（4）
  { id: "dancing", zh: "跳舞", en: "Dancing", cat: "技巧", icon: '<circle cx="12" cy="4" r="2"/><path d="M12 6c3 2 4 7 1 11M12 6l-4 4M12 17c2 0 4 2 5 4M12 17l-4 1"/>', demand: demand12([2, 3, 3, 4, 4, 4, 3, 3, 5, 5, 5, 1]) },
  { id: "roller-skating", zh: "轮滑", en: "Roller Skating", cat: "技巧", icon: '<circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/><path d="M7 18l4-5 6 0 1 2"/>', demand: demand12([3, 4, 4, 4, 5, 5, 4, 3, 5, 5, 4, 1]) },
  { id: "skateboarding", zh: "滑板", en: "Skateboarding", cat: "技巧", icon: '<path d="M4 15l10-5 6 2-3 4-10 5z"/>', demand: demand12([3, 4, 3, 4, 4, 5, 3, 3, 5, 5, 4, 1]) },
  { id: "parkour", zh: "跑酷", en: "Parkour", cat: "技巧", icon: '<circle cx="12" cy="4" r="2"/><path d="M12 6v5l-5 2M12 11l5 2-3 6"/>', demand: demand12([4, 5, 4, 5, 5, 5, 3, 4, 5, 5, 5, 2]) },
];

// 动作库（v1.15 扩编：64 条，每能力至少 3 个候选；cover = 0–5 分制刺激当量）
// 字段与量级约定见 LLD 附录 E.4 / §8.2。
const X = (primary: string, sec: [string, number][]): { cover: Record<string, number>; primary: string } => {
  const cover: Record<string, number> = {};
  sec.forEach(([c, v]) => (cover[c] = v));
  return { cover, primary };
};
const E = (
  id: string, zh: string, en: string, category: string,
  setsMin: number, setsMax: number, reps: string, rpe: string, minutes: number,
  equipment: string[], cue: string, regression: string,
  p: string, s: [string, number][]
): Exercise => {
  const c = X(p, s);
  return { id, zh, en, category, ...c, equipment, setsMin, setsMax, reps, rpe, minutes, cue, regression };
};

export const exercises: Exercise[] = [
  // —— 力量（squat / hinge / push / pull）——
  E("squat", "杠铃深蹲", "Barbell Squat", "squat", 3, 4, "6-8", "7-8", 6, ["杠铃"], "膝盖沿脚尖方向，保持全脚掌踩实。", "箱式深蹲 / 手扶支撑。", "STR_MAX", [["STAB", 0.25]]),
  E("front-squat", "前蹲", "Front Squat", "squat", 3, 4, "6-8", "8", 6, ["杠铃"], "肘部抬高，躯干直立。", "高脚杯深蹲。", "STR_MAX", [["STR_REL", 0.2], ["STAB", 0.25]]),
  E("goblet-squat", "高脚杯深蹲", "Goblet Squat", "squat", 3, 3, "8-12", "7", 5, ["哑铃", "壶铃"], "哑铃贴胸口，核心收紧。", "自重深蹲 / 减少深度。", "STR_MAX", [["STR_REL", 0.25], ["STAB", 0.2], ["STR_END", 0.15]]),
  E("deadlift", "硬拉", "Deadlift", "hinge", 3, 4, "5-6", "7-8", 6, ["杠铃"], "保持脊柱中立，髋部后移。", "壶铃硬拉 / RDL。", "STR_MAX", [["GRIP_CORE", 0.2]]),
  E("romanian-deadlift", "罗马尼亚硬拉", "Romanian Deadlift", "hinge", 3, 3, "8-10", "7", 5, ["杠铃", "哑铃"], "髋部后移，小腿垂直地面。", "减轻负重。", "STR_END", [["STR_MAX", 0.25], ["GRIP_CORE", 0.15]]),
  E("single-leg-rdl", "单腿 RDL", "Single-leg RDL", "hinge", 3, 3, "8-10", "7", 5, ["哑铃", "壶铃"], "骨盆保持水平，后脚轻点地。", "扶墙 / 减幅度。", "BAL", [["STR_REL", 0.25], ["STAB", 0.2], ["STR_END", 0.15]]),
  E("bench-press", "卧推", "Bench Press", "push", 3, 4, "6-8", "7-8", 6, ["杠铃"], "肩胛后收下沉，杠落胸下沿。", "哑铃卧推 / 俯卧撑。", "STR_MAX", [["STR_END", 0.2], ["STAB", 0.15]]),
  E("pushup", "俯卧撑", "Push-up", "push", 3, 3, "8-15", "7", 4, ["无器械"], "身体成一条直线，胸口贴近地面。", "跪姿俯卧撑 / 斜板俯卧撑。", "STR_END", [["STAB", 0.2], ["STR_REL", 0.15]]),
  E("weighted-pushup", "负重俯卧撑", "Weighted Push-up", "push", 3, 3, "6-10", "8", 4, ["无器械", "哑铃"], "负重保持躯干刚性。", "标准俯卧撑。", "STR_REL", [["STR_END", 0.25], ["STAB", 0.15]]),
  E("dips", "双杠臂屈伸", "Dips", "push", 3, 3, "6-10", "8", 5, ["双杠"], "肩胛稳定，肘部向后。", "弹力带辅助 / 椅子臂屈伸。", "STR_REL", [["STR_END", 0.2], ["STAB", 0.1]]),
  E("pullup", "引体向上", "Pull-up", "pull", 3, 4, "3-6", "8", 5, ["单杠"], "肩胛先下沉再拉，避免耸肩。", "弹力带辅助 / 澳式引体。", "STR_REL", [["GRIP_CORE", 0.2], ["STR_MAX", 0.1]]),
  E("lat-pulldown", "高位下拉", "Lat Pulldown", "pull", 3, 4, "8-10", "7", 5, ["固定器械"], "胸前拉至锁骨高度，肩胛下沉。", "减轻重量。", "STR_REL", [["STR_END", 0.2]]),
  E("dumbbell-row", "哑铃划船", "Dumbbell Row", "pull", 3, 4, "8-12", "7", 5, ["哑铃"], "躯干稳定，肘贴身后拉。", "减轻重量 / 双手同时划。", "STR_REL", [["STR_END", 0.25], ["GRIP_CORE", 0.15]]),
  E("barbell-row", "杠铃划船", "Barbell Row", "pull", 3, 4, "6-10", "7", 5, ["杠铃"], "俯身夹角约 45°，下背收紧。", "哑铃划船。", "STR_END", [["STR_REL", 0.25], ["GRIP_CORE", 0.2]]),
  // —— 握力 / 传力 / 核心 ——
  E("farmer-carry", "农夫走", "Farmer Carry", "carry", 3, 3, "30-60s", "7", 5, ["哑铃", "壶铃"], "躯干直立，握紧，小步快走。", "减轻负重 / 缩短距离。", "GRIP_CORE", [["STAB", 0.2], ["STR_END", 0.15]]),
  E("suitcase-carry", "单臂提箱走", "Suitcase Carry", "carry", 3, 3, "30-45s", "6", 4, ["哑铃", "壶铃"], "单侧负重，躯干不侧倾。", "减轻负重。", "GRIP_CORE", [["STAB", 0.25], ["AWARE", 0.15], ["STR_END", 0.15]]),
  E("hang", "悬垂", "Dead Hang", "carry", 2, 3, "20-40s", "低", 3, ["单杠"], "沉肩悬垂，不耸肩。", "脚轻点地 / 减少时长。", "GRIP_CORE", [["STR_REL", 0.15], ["MOB", 0.1]]),
  E("plank", "平板支撑", "Plank", "core", 2, 3, "30-60s", "低", 3, ["无器械"], "骨盆后倾，肋骨下压。", "跪姿平板支撑。", "STAB", [["GRIP_CORE", 0.15], ["STR_END", 0.2]]),
  E("side-plank", "侧平板支撑", "Side Plank", "core", 2, 3, "20-40s", "低", 3, ["无器械"], "身体成直线，臀部夹紧。", "膝撑侧平板。", "STAB", [["AWARE", 0.1]]),
  E("pallof-press", "帕洛夫推", "Pallof Press", "core", 3, 3, "8-12", "中", 4, ["弹力带"], "抗旋转，保持骨盆稳定。", "减小阻力。", "STAB", [["STR_END", 0.1]]),
  E("bird-dog", "鸟狗式", "Bird Dog", "core", 2, 3, "8-10", "低", 3, ["无器械"], "对侧手脚延伸，骨盆不转动。", "减小幅度。", "STAB", [["COORD", 0.2], ["AWARE", 0.1]]),
  // —— 爆发 / 跳跃 / 投掷 ——
  E("cmj", "反向纵跳", "Countermovement Jump", "jump", 3, 4, "3-5", "中", 5, ["无器械"], "充分屈髋屈膝，垂直发力跳起。", "跳箱上下 / 减幅度。", "PWR", []),
  E("broad-jump", "立定跳远", "Broad Jump", "jump", 3, 4, "3-5", "中", 5, ["无器械"], "摆臂起跳，落地稳定停顿。", "单次跳 + 落地稳定。", "PWR", [["BAL", 0.15]]),
  E("box-jump", "跳箱", "Box Jump", "jump", 3, 5, "3-5", "中", 6, ["跳箱"], "轻落于跳箱，站稳再下。", "更矮的跳箱。", "PWR", [["DEC_COD", 0.15], ["STAB", 0.15]]),
  E("repeat-jumps", "连续纵跳", "Repeated Jumps", "jump", 3, 4, "5-8", "高", 4, ["无器械"], "连续发力，节奏稳定。", "放慢节奏 / 减次数。", "RHIA", [["PWR", 0.3], ["ANA_CAP", 0.2]]),
  E("lateral-jump", "侧向跳", "Lateral Jump", "jump", 3, 4, "4-6", "中", 4, ["无器械"], "侧向跳跃，单脚稳定落地。", "减小距离 / 双脚落地。", "BAL", [["PWR", 0.2], ["DEC_COD", 0.2]]),
  E("medball-throw", "药球胸前抛", "Medball Chest Throw", "throw", 3, 4, "4-6", "中", 5, ["药球"], "全身传力，球离手瞬间伸展。", "轻球 / 对墙抛。", "PWR", [["COORD", 0.25]]),
  E("rotational-throw", "药球旋转抛", "Rotational Throw", "throw", 3, 4, "4-6", "中", 5, ["药球"], "髋部转动带动，侧向抛接。", "轻球 / 正对抛。", "PWR", [["COORD", 0.3], ["AWARE", 0.15]]),
  E("kb-swing", "壶铃摆动", "Kettlebell Swing", "hinge", 4, 5, "10-15", "中", 6, ["壶铃"], "髋部爆发发力，手臂放松。", "轻壶铃 / 壶铃硬拉。", "PWR", [["STR_END", 0.2], ["GRIP_CORE", 0.15], ["ANA_CAP", 0.15]]),
  // —— 速度 / 加速 ——
  E("sprint-10", "10m 冲刺", "10m Sprint", "sprint", 4, 6, "1", "高", 8, ["场地"], "低姿起跑，前几步充分蹬伸。", "斜坡冲刺 / 缩短距离。", "ACC", [["SPD", 0.35]]),
  E("sprint-20", "20m 冲刺", "20m Sprint", "sprint", 3, 5, "1", "高", 7, ["场地"], "逐渐抬高重心，保持步频。", "缩短距离。", "SPD", [["ACC", 0.3]]),
  E("sprint-30", "30m 冲刺", "30m Sprint", "sprint", 3, 5, "1", "高", 8, ["场地"], "保持高重心与高步频。", "缩短距离 / 充分休息。", "SPD", [["ACC", 0.3]]),
  E("hill-sprint", "坡道冲刺", "Hill Sprint", "sprint", 3, 5, "1", "高", 8, ["场地"], "上坡发力，保持躯干前倾。", "减小坡度。", "ACC", [["SPD", 0.3], ["PWR", 0.2], ["ANA_CAP", 0.15]]),
  E("resisted-sprint", "抗阻冲刺", "Resisted Sprint", "sprint", 3, 5, "1", "高", 7, ["弹力带"], "抗阻下保持加速技术。", "减小阻力。", "ACC", [["SPD", 0.25], ["STR_MAX", 0.1]]),
  // —— 减速 / 变向 / 平衡 / 落地 ——
  E("decel-stop", "减速制动", "Deceleration Stop", "decel", 4, 6, "1", "中", 6, ["场地"], "重心降低，屈膝屈髋吸收动量。", "慢速 → 快速渐进。", "DEC_COD", []),
  E("cut-45", "45° 变向", "45° Cut", "cod", 3, 4, "4-6", "中", 6, ["场地"], "先制动再蹬地变向，躯干稳定。", "预先变向 → 反应变向。", "DEC_COD", [["BAL", 0.25]]),
  E("shuttle-510", "5-10-5 折返", "5-10-5 Shuttle", "cod", 3, 4, "2-3", "高", 7, ["场地"], "触线急转，动作干净。", "缩短距离。", "DEC_COD", [["SPD", 0.3], ["ACC", 0.15], ["BAL", 0.15]]),
  E("single-leg-landing", "单腿落地", "Single-leg Landing", "landing", 3, 3, "4-6", "中", 4, ["无器械", "跳箱"], "落地屈髋屈膝，膝盖对齐脚尖。", "双脚落地 → 单脚。", "STAB", [["DEC_COD", 0.2], ["BAL", 0.2]]),
  E("step-down", "下台阶", "Step-down", "landing", 3, 3, "6-8", "中", 4, ["无器械", "跳箱"], "屈髋控制，缓慢下放。", "更矮的台阶。", "STAB", [["BAL", 0.2], ["STR_REL", 0.15]]),
  E("single-leg-stand", "单腿站立", "Single-leg Stand", "balance", 3, 3, "30-60s", "低", 3, ["无器械"], "目视前方，重心落在足中。", "扶墙 / 睁眼。", "BAL", [["AWARE", 0.15]]),
  E("closed-eye-single-leg", "闭眼单腿站立", "Single-leg, Eyes Closed", "balance", 2, 3, "20-40s", "低", 3, ["无器械"], "闭眼维持重心，站稳再睁。", "睁眼单腿站立。", "AWARE", [["BAL", 0.3]]),
  E("eyes-closed-hop", "闭眼原地小跳", "Eyes-closed Hop", "balance", 2, 3, "5-8", "低", 3, ["无器械"], "闭眼小幅起跳，落点稳定。", "睁眼跳 / 减小幅度。", "AWARE", [["BAL", 0.2]]),
  E("eyes-closed-march", "闭眼踏步", "Eyes-closed March", "balance", 2, 3, "10-15", "低", 3, ["无器械"], "闭眼原地高抬腿，身体不晃。", "睁眼踏步。", "AWARE", [["COORD", 0.15]]),
  // —— 协调 / 反应 ——
  E("jump-rope", "跳绳", "Jump Rope", "coord", 3, 5, "30-60s", "中", 4, ["跳绳"], "前脚掌落地，节奏稳定。", "无绳跳 / 慢速。", "COORD", [["RHIA", 0.1], ["AER_END", 0.1]]),
  E("bear-crawl", "熊爬", "Bear Crawl", "coord", 3, 3, "20m", "中", 4, ["无器械"], "对侧手脚协调，膝盖离地。", "跪姿爬行。", "COORD", [["STAB", 0.25], ["STR_END", 0.15]]),
  E("agility-ladder", "绳梯脚步", "Agility Ladder", "coord", 3, 4, "2-3趟", "中", 5, ["场地"], "高频碎步，手腿协调。", "放慢节奏。", "COORD", [["ACC", 0.2], ["SPD", 0.2]]),
  E("ball-toss", "抛接训练", "Ball Toss", "coord", 3, 4, "10-15", "低", 4, ["药球", "跳绳"], "抛接稳定，保持节奏。", "近距离 / 低抛。", "COORD", [["REACT", 0.25], ["AWARE", 0.2]]),
  E("reaction-catch", "反应接球", "Reaction Catch", "reaction", 3, 4, "8-10", "低", 4, ["药球", "场地"], "球出手即反应去接。", "出声提示提前。", "REACT", [["COORD", 0.2]]),
  E("reaction-sprint", "口令反应冲刺", "Reaction Sprint", "reaction", 3, 5, "1", "高", 6, ["场地"], "听到口令立即启动。", "站立启动 → 低姿。", "REACT", [["ACC", 0.2], ["SPD", 0.2]]),
  // —— 有氧 ——
  E("zone2-run", "有氧慢跑", "Zone 2 Run", "aerobic", 1, 1, "20-40min", "轻松", 25, ["场地"], "能对话的强度，鼻吸口呼。", "跑走结合。", "AER_CAP", [["AER_END", 0.3]]),
  E("bike", "骑行", "Cycling", "aerobic", 1, 1, "30-45min", "轻松", 30, ["固定器械"], "保持稳定踏频。", "缩短时长 / 降低阻力。", "AER_CAP", [["AER_END", 0.3]]),
  E("incline-walk", "坡走", "Incline Walk", "aerobic", 1, 1, "20-30min", "中", 20, ["场地", "固定器械"], "坡度可控，保持直立。", "平地快走。", "AER_END", [["AER_CAP", 0.25]]),
  E("row-erg", "划船机", "Row Ergometer", "aerobic", 1, 1, "20-30min", "中", 20, ["固定器械"], "腿 → 髋 → 摆臂顺序发力。", "缩短时长 / 降低阻力。", "AER_CAP", [["AER_END", 0.3], ["STR_END", 0.2], ["COORD", 0.15]]),
  E("tempo-run", "节奏跑", "Tempo Run", "aerobic", 1, 1, "15-25min", "中", 18, ["场地"], "可持续说话的硬强度。", "降速。", "AER_END", [["AER_CAP", 0.2], ["RHIA", 0.1]]),
  E("long-run", "长距离慢跑", "Long Run", "aerobic", 1, 1, "40-60min", "轻松", 40, ["场地"], "低强度长时长，补水节奏稳定。", "缩短时长。", "AER_END", [["AER_CAP", 0.2]]),
  // —— 间歇 ——
  E("repeated-sprint", "重复短冲", "Repeated Sprints", "interval", 4, 6, "20-30m", "高", 8, ["场地"], "每次全力，充分恢复再重复。", "减少次数 / 加长间歇。", "RHIA", [["ANA_CAP", 0.35], ["SPD", 0.2]]),
  E("fourhundred-repeats", "400m 重复跑", "400m Repeats", "interval", 4, 6, "400m", "高", 10, ["场地"], "配速稳定，完整跑完再歇。", "200m / 降速。", "ANA_CAP", [["RHIA", 0.3], ["AER_CAP", 0.1]]),
  E("hill-repeats", "坡道间歇", "Hill Repeats", "interval", 4, 6, "60-90s", "高", 9, ["场地"], "上坡全力，保持技术。", "缓坡 / 缩短时长。", "ANA_CAP", [["RHIA", 0.3], ["PWR", 0.2]]),
  E("shuttle-bursts", "折返爆发", "Shuttle Bursts", "interval", 3, 5, "15-30s", "高", 6, ["场地"], "折返全力，完整恢复。", "缩短距离。", "RHIA", [["ANA_CAP", 0.3], ["ACC", 0.2]]),
  // —— 活动度 ——
  E("ankle-mob", "踝活动度", "Ankle Dorsiflexion", "mobility", 2, 2, "10-15", "低", 3, ["无器械"], "脚跟不离地，膝盖向前压。", "减小前移幅度。", "MOB", []),
  E("hip-9090", "90/90 髋", "90/90 Hip", "mobility", 2, 2, "8-10", "低", 3, ["无器械"], "主动控制，避免塌腰。", "垫高 / 减幅度。", "MOB", []),
  E("couch-stretch", "沙发拉伸", "Couch Stretch", "mobility", 2, 2, "30-45s", "低", 3, ["无器械"], "骨盆后收，拉伸髋屈肌。", "垫高 / 幅度小一些。", "MOB", [["STAB", 0.1]]),
  E("thread-needle", "穿针式", "Thread the Needle", "mobility", 2, 2, "20-30s/侧", "低", 3, ["无器械"], "旋转胸椎，髋部保持稳定。", "减小旋转幅度。", "MOB", [["AWARE", 0.1]]),
  E("shoulder-pass", "肩部绕环", "Shoulder Dislocate", "mobility", 2, 2, "8-10", "低", 3, ["弹力带"], "握距足够，慢速绕过头顶。", "加宽握距。", "MOB", []),
];

export const saq: SaqQuestion[] = [
  { code: "STR_MAX", zh: "深蹲/硬拉能做到什么水平？", en: "How much can you squat/deadlift?", a0: "几乎做不了", a5: "负重接近或超过体重" },
  { code: "STR_REL", zh: "引体向上/自重深蹲表现如何？", en: "How are your pull-ups / bodyweight squats?", a0: "做不了引体", a5: "连续多次标准引体" },
  { code: "STR_END", zh: "中等负重能连续重复多少次？", en: "How many moderate-load reps in a row?", a0: "几下就力竭", a5: "可持续多组" },
  { code: "PWR", zh: "立定跳远/纵跳的爆发感？", en: "How explosive is your jumping?", a0: "跳不远", a5: "轻松纵跳" },
  { code: "SPD", zh: "短距离冲刺速度如何？", en: "How fast is your sprint?", a0: "明显偏慢", a5: "明显较快" },
  { code: "ACC", zh: "起步加速快吗？", en: "How quick is your acceleration?", a0: "启动慢", a5: "起步快" },
  { code: "DEC_COD", zh: "急停、变向是否稳？", en: "How stable is your stop & change of direction?", a0: "刹不住", a5: "稳且再加速快" },
  { code: "AER_CAP", zh: "持续慢跑/骑行能维持多久？", en: "How long can you sustain easy cardio?", a0: "几分钟就喘", a5: "轻松 30 分钟以上" },
  { code: "AER_END", zh: "长时间次最大强度能维持吗？", en: "Can you sustain submax effort long?", a0: "很短", a5: "可持续较长时间" },
  { code: "ANA_CAP", zh: "短时间高强度输出如何？", en: "How is your short high-intensity output?", a0: "很弱", a5: "很强" },
  { code: "RHIA", zh: "高强度后能否快速恢复并重复？", en: "Can you recover and repeat high intensity?", a0: "很难", a5: "很容易" },
  { code: "BAL", zh: "单脚站立（睁眼/闭眼）能坚持？", en: "How long can you stand on one leg?", a0: "几秒", a5: "1 分钟以上" },
  { code: "COORD", zh: "手脚协调、节奏动作流畅吗？", en: "How fluid is your coordination?", a0: "笨拙", a5: "流畅" },
  { code: "REACT", zh: "对外界刺激的反应快吗？", en: "How fast is your reaction to stimuli?", a0: "慢", a5: "快" },
  { code: "AWARE", zh: "对身体位置与空间关系的感知？", en: "How is your body/spatial awareness?", a0: "弱", a5: "强" },
  { code: "MOB", zh: "深蹲深度、肩/踝活动度如何？", en: "How is your squat depth / shoulder & ankle mobility?", a0: "明显受限", a5: "全范围可控" },
  { code: "STAB", zh: "单腿支撑/落地时稳定吗？", en: "How stable are you on single leg / landing?", a0: "不稳", a5: "稳定" },
  { code: "GRIP_CORE", zh: "握力、悬挂、躯干传力如何？", en: "How is your grip / hang / core?", a0: "弱", a5: "强" },
];

export function ability(code: string): Ability {
  return abilities.find((a) => a.code === code)!;
}
export function layer(key: string): Layer {
  return layers.find((l) => l.key === key)!;
}
export function sport(id: string): Sport {
  return sports.find((s) => s.id === id)!;
}

// —— 动作库查询 / 分类标签（分类 code → 界面展示名）——
const _byId = new Map(exercises.map((e) => [e.id, e]));
export function exercise(id: string): Exercise {
  return _byId.get(id)!;
}
export function exercisesOf(code: string): Exercise[] {
  return exercises.filter((e) => (e.cover[code] ?? 0) > 0);
}
export const categoryLabel: Record<string, { zh: string; en: string }> = {
  squat: { zh: "下肢蹲", en: "Squat" },
  hinge: { zh: "髋铰链", en: "Hinge" },
  push: { zh: "上肢推", en: "Push" },
  pull: { zh: "上肢拉", en: "Pull" },
  carry: { zh: "负重行走", en: "Carry" },
  core: { zh: "躯干核心", en: "Core" },
  jump: { zh: "跳跃", en: "Jump" },
  throw: { zh: "投掷", en: "Throw" },
  sprint: { zh: "冲刺", en: "Sprint" },
  decel: { zh: "减速", en: "Decel" },
  cod: { zh: "变向", en: "COD" },
  landing: { zh: "落地", en: "Landing" },
  balance: { zh: "平衡", en: "Balance" },
  coord: { zh: "协调", en: "Coord" },
  reaction: { zh: "反应", en: "Reaction" },
  aerobic: { zh: "有氧", en: "Aerobic" },
  interval: { zh: "间歇", en: "Interval" },
  mobility: { zh: "活动度", en: "Mobility" },
};

// 器械选项（稳定顺序，供筛选用）
export const EQUIPMENT: string[] = [
  "无器械", "哑铃", "杠铃", "壶铃", "弹力带", "单杠", "双杠",
  "跳箱", "药球", "跳绳", "场地", "固定器械",
];
