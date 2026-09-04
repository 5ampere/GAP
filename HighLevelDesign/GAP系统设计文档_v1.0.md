General Athletic Preparation Recommendation System

面向多运动爱好者的通用运动能力评估、能力缺口分析与训练计划生成系统

*开发方案 / 数据规范 / 推荐算法 / 测试体系 / 用户理论说明*

版本：v1.1  
状态：开发基线（Draft for Implementation）  
日期：2026-08-30

# 文档元信息

| **项目** | **内容**                                                                                                                           |
|----------|------------------------------------------------------------------------------------------------------------------------------------|
| 产品定位 | 为拥有多个运动爱好、希望扩展运动项目的成年人提供通用运动能力训练规划。                                                             |
| 核心机制 | 用户目标运动 → 运动需求向量 → 用户能力评估 → 能力缺口 → 迁移/可训练性/疲劳成本修正 → 训练计划。                                    |
| 核心原则 | GAP 训练负责建设通用能力；专项运动负责建设运动技能。系统不承诺“用一套计划学会所有运动”。                                           |
| 科学定位 | GAP 是本项目建立的工程化框架，不声称是已有单一学术标准；其概念基础来自 S&C、athleticism、physical literacy、LTAD、运动处方等体系。 |
| 目标读者 | 产品经理、运动科学顾问、S&C 教练、后端/算法工程师、前端工程师、数据工程师、内容编辑。                                              |
| 非目标   | 医疗诊断、伤病康复处方、竞技体育专项成绩保证。                                                                                     |

## 版本原则

所有运动需求权重、能力评分阈值、测试常模、训练处方参数都必须带版本号与来源。推荐结果必须能够回溯”为什么推荐”。

## 修订记录

| **版本** | **日期**     | **变更**                                                                                                                                 |
|----------|--------------|------------------------------------------------------------------------------------------------------------------------------------------|
| v1.0     | 2026-08-30   | 初始版本。                                                                                                                               |
| v1.1     | 2026-08-30   | 新增双轨自测设计（SAQ/SPT）、自评问卷规范（7.4）、评估历史与进步趋势（7.5）；第 5 章新增运动 icon/silhouette 资源说明；第 15 章新增 15.10。 |

# 目录

1\. 产品与理论边界

2\. GAP 能力本体

3\. 系统总体架构

4\. 数据模型与数据库设计

5\. 运动项目需求数据库

6\. 动作与训练方法数据库

7\. 用户能力测试系统

8\. 运动需求 → 训练计划算法

9\. 多运动目标合并算法

10\. 训练计划生成与周期化

11\. 安全、约束与失败保护

12\. 可解释推荐

13\. 扩展、校准与机器学习路线

14\. API / 服务边界建议

15\. 面向用户的 GAP 理论说明文档

附录 A：首批运动种子数据

附录 B：算法伪代码

附录 C：参考资料与证据等级

# 1. 产品与理论边界

GAP 系统不是“万能训练计划生成器”，而是一个能力层的决策系统。用户输入运动目标、运动频率、时间预算、训练背景、器械条件和自评/测试结果后，系统先建立用户能力画像，再从运动需求数据库建立目标能力画像，最后生成通用训练与专项建议。

基本假设：不同运动虽然具有不同技术、战术和环境约束，但大量运动共享力量、功率、速度、加速、减速、能量系统、平衡、协调、活动度、稳定性、握力和身体控制等底层能力。NSCA 对 athleticism 的相关框架也将力量、力量耐力、功率、速度、敏捷、平衡、协调、柔韧性、代谢训练和反应时间等纳入基础运动能力；其 LTAD 材料强调从基础运动能力逐步进入专项技能。

工程含义：系统应该将“运动”存储为能力需求向量，而将“训练动作”存储为能力刺激向量。算法不直接建立“某运动 = 某动作”的硬映射。

## 1.1 三层能力边界

| **层级** | **名称**                | **系统职责**                         | **例子**                                           |
|----------|-------------------------|--------------------------------------|----------------------------------------------------|
| L1       | Physical Capacity       | 产生/维持力和能量的能力              | 最大力量、相对力量、力量耐力、有氧、无氧           |
| L2       | Movement Capacity       | 在空间中高质量移动与控制身体         | 速度、加速、减速、变向、平衡、协调、活动度、稳定性 |
| L3       | Perception & Adaptation | 对环境信息进行感知、反应、时序与调整 | 反应、空间感、节奏、目标追踪、反应性敏捷           |
| L4       | Sport-specific Skill    | 项目本身的技术、战术和器械技能       | 攀岩脚法、滑雪转弯、投篮、发球、泳姿               |

GAP 核心训练默认覆盖 L1-L3；L4 由用户实际参与专项运动获得。某些 L3 能力也需要专项环境才能完全发展，因此系统允许把“专项运动实践”作为训练计划的一部分，但必须标记为 Sport Practice，而不是 GAP Exercise。

# 2. GAP 能力本体

第一版系统采用 18 个能力节点，并保留未来拆分子能力的空间。数据库不应把这些能力永久编码成不可变枚举，而应采用 code + version + parent_id 的可扩展树。

| **Code**  | **能力**       | **正式定义**                         | **典型场景**                 |
|-----------|----------------|--------------------------------------|------------------------------|
| STR_MAX   | 最大力量       | 单次或极低次数高力输出能力           | 深蹲、硬拉、卧推、引体       |
| STR_REL   | 相对力量       | 单位体重的力量能力                   | 体重自重运动、攀爬、跳跃基础 |
| STR_END   | 力量耐力       | 重复/持续输出力量的能力              | 长线路攀岩、徒步、持续滑行   |
| PWR       | 爆发力         | 较短时间产生较大机械功率/冲量的能力  | 跳跃、投掷、冲刺起步         |
| SPD       | 速度           | 快速完成肢体或身体位移的能力         | 跑、球类移动                 |
| ACC       | 加速           | 从低速快速建立速度的能力             | 短距离冲刺、追球             |
| DEC_COD   | 减速与变向     | 吸收动量、制动、改变方向并再加速     | 球类、滑雪、滑冰             |
| AER_CAP   | 有氧能力       | 持续有氧能量供给能力                 | 耐力运动、恢复基础           |
| AER_END   | 有氧耐力       | 较长时间维持次最大输出的能力         | 徒步、长骑、越野             |
| ANA_CAP   | 无氧能力       | 短时间高强度能量输出能力             | 短冲、极限抱石动作           |
| RHIA      | 重复高强度能力 | 高强度输出与恢复并重复的能力         | 球类比赛、间歇滑行           |
| BAL       | 平衡           | 维持和恢复身体重心控制的能力         | 滑雪、冲浪、攀岩             |
| COORD     | 协调           | 多身体部位在时间、空间、力量上的协同 | 球类、攀岩、舞蹈             |
| REACT     | 感知-反应      | 对外部刺激快速选择并执行动作         | 球类、开放环境敏捷           |
| AWARE     | 身体空间觉     | 本体感觉、身体位置和空间关系感知     | 攀岩、滑雪、体操类           |
| MOB       | 活动度         | 可用且可主动控制的关节运动范围       | 踝、髋、胸椎、肩             |
| STAB      | 稳定性         | 动态任务中控制关节/躯干位置的能力    | 单腿、落地、肩胛、躯干       |
| GRIP_CORE | 握力与躯干传力 | 抓握、悬挂以及下肢到上肢的力量传递   | 攀岩、搬运、划船、投掷       |

## 2.1 能力对象字段规范

| **字段**            | **类型**    | **必填** | **说明**                   |
|---------------------|-------------|----------|----------------------------|
| ability_id          | string      | 是       | 稳定 ID，如 PWR            |
| version             | semver      | 是       | 能力定义版本               |
| name_zh / name_en   | string      | 是       | 展示名称                   |
| parent_id           | string/null | 是       | 用于未来拆分/聚合          |
| definition          | text        | 是       | 规范定义                   |
| measurement_units   | json        | 是       | kg、m、s、W、heart-rate 等 |
| test_ids            | array       | 否       | 关联测试                   |
| training_method_ids | array       | 否       | 关联训练方法               |
| risk_tags           | array       | 否       | 需要注意的风险标签         |
| evidence_level      | enum        | 是       | A/B/C/D                    |
| status              | enum        | 是       | draft/active/deprecated    |

## 2.2 能力之间不是独立变量

系统内部将能力视为“相关但不等价”的节点。比如爆发力受到力量、速度和技术影响；加速受力量、功率、技术和体重影响；变向同时涉及减速能力、单腿力量、平衡与空间控制。因此算法第一版避免简单地把所有能力加权相加，而采用“直接需求 + 支撑需求”的双层结构。

# 3. 系统总体架构

User Profile

↓

Goal Sports → Sport Demand Matrix → Target Capacity Profile

↓ ↑

Assessment Engine → Current Capacity Profile

↓ │

Gap Engine → Training Priority Engine ← Constraints

↓

Exercise Selection → Session Builder → Week Builder → Plan

↓

Adherence / Performance / Re-test → Profile Update

| **模块**                | **职责**                                     | **输入**               | **输出**               |
|-------------------------|----------------------------------------------|------------------------|------------------------|
| Profile Service         | 管理用户基本资料、训练背景、器械、时间、偏好 | 用户表单               | User Profile           |
| Sport Knowledge Base    | 保存运动项目及能力需求                       | Sport + Demand Matrix  | Target Profile         |
| Assessment Engine       | 将测试/自评转换成能力分数                    | Test Results           | Capacity Profile       |
| Gap Engine              | 计算目标与现状的差距                         | Target + Current       | Gap Vector             |
| Priority Engine         | 结合迁移性、可训练性、疲劳成本、安全性排序   | Gap + Metadata         | Priority Scores        |
| Exercise KB             | 动作、训练方法、能力刺激、进阶关系           | Exercise DB            | Candidate Exercises    |
| Plan Engine             | 生成训练周计划、动作顺序、参数与进阶         | Priority + Constraints | Training Plan          |
| Explanation Engine      | 说明推荐原因                                 | Scores + Rules         | Recommendation Reasons |
| Analytics / Calibration | 记录完成度与结果，为后续校准服务             | Plan + Outcomes        | Calibration Data       |

# 4. 数据模型与数据库设计

推荐使用关系型数据库作为事实层；JSONB 用于规则参数和扩展字段。核心表之间采用稳定 ID + 版本管理。

## 4.1 核心 ER 关系

SPORT 1---N SPORT_DEMAND N---1 ABILITY

ABILITY 1---N ABILITY_TEST

ABILITY N---N TRAINING_METHOD

TRAINING_METHOD 1---N EXERCISE

EXERCISE 1---N EXERCISE_PROGRESSION

USER 1---N USER_SPORT_GOAL

USER 1---N ASSESSMENT_SESSION 1---N TEST_RESULT

USER 1---N CAPACITY_SNAPSHOT

USER 1---N TRAINING_PLAN 1---N WORKOUT_SESSION 1---N WORKOUT_ITEM

## 4.2 表：ability 能力数据库

| **字段**                | **类型**    | **说明**          |
|-------------------------|-------------|-------------------|
| ability_id              | PK string   | 如 PWR            |
| version                 | string      | 定义版本          |
| parent_id               | FK nullable | 能力层级          |
| name_zh                 | string      | 中文名            |
| name_en                 | string      | 英文名            |
| definition              | text        | 规范定义          |
| score_scale             | json        | 评分定义          |
| measurement_units       | json        | 测试单位          |
| trainability            | float 0-1   | 默认可训练性先验  |
| fatigue_cost            | float 0-1   | 训练成本先验      |
| transferability_default | float 0-1   | 默认迁移先验      |
| evidence_level          | A-D         | 证据等级          |
| status                  | enum        | active/deprecated |

## 4.3 表：sport 运动项目数据库

| **字段**         | **类型**  | **说明**                        |
|------------------|-----------|---------------------------------|
| sport_id         | PK        | 如 CLIMB_BOULDER                |
| name_zh/name_en  | string    | 名称                            |
| category         | enum      | 球类/户外/滑雪/水上/体能/对抗等 |
| environment      | json      | 室内/户外/水上/雪地等           |
| equipment        | json      | 主要装备                        |
| open_skill       | float 0-1 | 开放技能程度                    |
| duration_profile | json      | 典型单次运动时长                |
| dominant_energy  | json      | 能量系统先验                    |
| demand_version   | string    | 当前需求矩阵版本                |
| skill_notes      | text      | 专项技能说明                    |
| status           | enum      | active/deprecated               |

## 4.4 表：sport_demand 运动-能力需求

| **字段**     | **类型**  | **说明**               |
|--------------|-----------|------------------------|
| sport_id     | FK        | 运动                   |
| ability_id   | FK        | 能力                   |
| demand_score | float 0-5 | 该运动对能力的需求强度 |
| confidence   | float 0-1 | 评分置信度             |
| importance   | float 0-1 | 专家重要性             |
| evidence_ids | array     | 证据引用               |
| context      | json      | 初学/进阶/竞技等上下文 |
| version      | string    | 评分版本               |

关键规则：demand_score 是“需求”，不是用户应该达到的测试成绩。实际 Target Capacity 通过能力阈值函数转换。

## 4.5 表：exercise 动作数据库

| **字段**              | **类型** | **说明**                                            |
|-----------------------|----------|-----------------------------------------------------|
| exercise_id           | PK       | 稳定 ID                                             |
| name_zh/name_en       | string   | 名称                                                |
| movement_pattern      | enum     | squat/hinge/push/pull/jump/throw/carry/run/rotate等 |
| level                 | int 1-5  | 技术难度                                            |
| equipment             | json     | 器械要求                                            |
| primary_abilities     | json     | 能力刺激权重                                        |
| secondary_abilities   | json     | 次级刺激                                            |
| fatigue_cost          | float    | 局部/全身成本                                       |
| skill_demand          | float    | 动作技术成本                                        |
| contraindication_tags | array    | 限制标签                                            |
| coaching_cues         | text     | 动作要点                                            |
| video_ref             | string   | 后续媒体引用                                        |
| progression_group     | string   | 进阶链                                              |

## 4.6 表：training_method 训练方法数据库

## 4.6 表：training_method 训练方法数据库

| **字段**         | **类型** | **说明**                        |
|------------------|----------|---------------------------------|
| method_id        | string   | 如 PLYO_JUMP                    |
| ability_targets  | json     | 能力权重向量                    |
| adaptation_goal  | string   | 目标：最大力量/功率/耐力/协调等 |
| intensity_model  | json     | RPE/RIR/%1RM/速度/HR等          |
| volume_model     | json     | 组数/次数/距离/时间             |
| rest_model       | json     | 组间恢复策略                    |
| progression_rule | json     | 进阶规则                        |
| regression_rule  | json     | 退阶规则                        |
| fatigue_profile  | json     | 疲劳特征                        |
| minimum_skill    | int      | 最低技术水平                    |
| evidence_level   | enum     | 证据等级                        |

## 4.7 用户与计划相关表

| **表**             | **关键字段**                                                                            | **目的**                               |
|--------------------|-----------------------------------------------------------------------------------------|----------------------------------------|
| user_profile       | age_band, sex(optional), height, weight, training_age, schedule, equipment, preferences | 生成训练约束；不用于未经验证的医疗推断 |
| user_sport_goal    | sport_id, priority_weight, current_level, desired_level, practice_frequency             | 记录多运动目标                         |
| assessment_session | date, protocol_version, mode, notes                                                     | 一次完整测试                           |
| test_result        | test_id, raw_value, normalized_score, quality_flag                                      | 保存原始与标准化结果                   |
| capacity_snapshot  | ability_id, score, confidence, source                                                   | 某日期的能力画像                       |
| training_plan      | start_date, duration, goal_snapshot, algorithm_version                                  | 计划版本快照                           |
| workout_session    | session_type, duration, intensity_budget                                                | 训练日                                 |
| workout_item       | exercise_id, sets, reps, load, RPE, rest, rationale                                     | 具体训练动作                           |
| outcome_log        | completion, RPE_actual, pain_flag, performance                                          | 结果回收与后续调整                     |

# 5. 运动项目需求数据库

第一版建议先上线 36 个常见项目；后续通过同一模板扩展到 100+。以下种子矩阵继续采用 12 个一级指标，便于产品 MVP。数据库底层仍映射到 18 个能力节点。

每个运动项目应配套前端展示资源：**icon（线性图标，配合名称做「图标+文字」卡片展示）** 与 **silhouette（运动人物剪影，用于落地页与营销氛围）**。二者为前端资源字段，不参与算法计算；建议存储于 sport 表的 icon / silhouette 字段，由内容编辑维护并版本化。

| **运动** | **STR** | **RSTR** | **END** | **PWR** | **SPD/ACC** | **DEC/COD** | **AER** | **ANA/RHIA** | **BAL** | **COORD** | **MOB** | **GRIP/CORE** |
|----------|---------|----------|---------|---------|-------------|-------------|---------|--------------|---------|-----------|---------|---------------|
| 篮球     | 4       | 4        | 3       | 5       | 5           | 5           | 4       | 5            | 4       | 5         | 3       | 2             |
| 足球     | 4       | 4        | 4       | 4       | 5           | 5           | 5       | 5            | 4       | 5         | 3       | 1             |
| 网球     | 3       | 3        | 3       | 4       | 5           | 5           | 4       | 5            | 5       | 5         | 4       | 2             |
| 羽毛球   | 3       | 3        | 3       | 4       | 5           | 5           | 4       | 5            | 5       | 5         | 4       | 1             |
| 排球     | 4       | 4        | 2       | 5       | 4           | 4           | 3       | 4            | 4       | 5         | 3       | 1             |
| 乒乓球   | 2       | 2        | 2       | 2       | 5           | 4           | 3       | 4            | 4       | 5         | 3       | 1             |
| 壁球     | 3       | 3        | 4       | 4       | 5           | 5           | 5       | 5            | 5       | 5         | 3       | 1             |
| 匹克球   | 2       | 2        | 2       | 3       | 4           | 4           | 3       | 3            | 4       | 5         | 3       | 1             |
| 飞盘     | 3       | 3        | 3       | 4       | 4           | 4           | 4       | 4            | 4       | 5         | 3       | 2             |
| 高尔夫   | 3       | 3        | 2       | 3       | 2           | 1           | 2       | 1            | 3       | 5         | 5       | 3             |
| 徒步     | 3       | 3        | 5       | 2       | 1           | 2           | 5       | 2            | 4       | 3         | 3       | 2             |
| 越野跑   | 3       | 4        | 5       | 4       | 4           | 4           | 5       | 4            | 5       | 4         | 4       | 1             |
| 登山     | 4       | 4        | 5       | 3       | 2           | 3           | 5       | 3            | 5       | 4         | 4       | 3             |
| 抱石     | 4       | 5        | 4       | 4       | 2           | 2           | 2       | 5            | 5       | 5         | 5       | 5             |
| 运动攀岩 | 4       | 5        | 5       | 3       | 2           | 2           | 3       | 5            | 5       | 5         | 5       | 5             |
| 山地车   | 4       | 4        | 4       | 4       | 4           | 5           | 4       | 4            | 5       | 5         | 4       | 2             |
| 高山滑雪 | 4       | 4        | 4       | 5       | 4           | 5           | 4       | 4            | 5       | 5         | 4       | 2             |
| 单板滑雪 | 4       | 4        | 4       | 5       | 4           | 5           | 4       | 4            | 5       | 5         | 5       | 2             |
| 越野滑雪 | 4       | 4        | 5       | 3       | 4           | 3           | 5       | 4            | 4       | 4         | 3       | 2             |
| 滑冰     | 4       | 4        | 4       | 5       | 5           | 5           | 4       | 4            | 5       | 5         | 4       | 1             |
| 轮滑     | 3       | 4        | 4       | 4       | 5           | 5           | 4       | 3            | 5       | 5         | 4       | 1             |
| 滑板     | 3       | 4        | 3       | 4       | 4           | 5           | 3       | 3            | 5       | 5         | 4       | 1             |
| 游泳     | 3       | 3        | 4       | 3       | 4           | 1           | 5       | 4            | 4       | 5         | 5       | 3             |
| 冲浪     | 4       | 4        | 4       | 5       | 3           | 4           | 4       | 4            | 5       | 5         | 5       | 3             |
| 皮划艇   | 4       | 4        | 5       | 3       | 3           | 2           | 5       | 4            | 4       | 4         | 4       | 5             |
| SUP      | 3       | 3        | 4       | 2       | 2           | 2           | 4       | 2            | 5       | 5         | 4       | 3             |
| 划船     | 5       | 4        | 5       | 4       | 3           | 1           | 5       | 5            | 3       | 4         | 3       | 4             |
| 跑步     | 3       | 4        | 5       | 3       | 5           | 2           | 5       | 3            | 4       | 4         | 3       | 1             |
| 骑行     | 4       | 4        | 5       | 3       | 4           | 2           | 5       | 4            | 3       | 4         | 3       | 2             |
| 拳击     | 4       | 4        | 4       | 5       | 5           | 5           | 4       | 5            | 4       | 5         | 4       | 3             |
| 武术     | 4       | 4        | 4       | 5       | 5           | 5           | 4       | 5            | 5       | 5         | 5       | 3             |
| 巴西柔术 | 5       | 5        | 5       | 4       | 3           | 4           | 4       | 5            | 5       | 5         | 5       | 5             |
| 跳舞     | 2       | 3        | 3       | 4       | 4           | 4           | 3       | 3            | 5       | 5         | 5       | 1             |
| 跳绳     | 2       | 3        | 4       | 4       | 4           | 4           | 4       | 4            | 5       | 5         | 3       | 1             |
| Parkour  | 4       | 5        | 4       | 5       | 5           | 5           | 3       | 4            | 5       | 5         | 5       | 2             |

注：该矩阵属于产品的“初始专家先验”，不是医学或运动表现的金标准。运动需求应允许按“休闲/进阶/竞技”级别、体型/装备与运动形式进一步分层。

# 6. 动作与训练方法数据库

动作库应该与能力库解耦。一个动作可同时刺激多个能力；同一能力可以用完全不同动作训练。

| **动作类别** | **示例**                   | **主要能力**          | **常用参数**         | **备注**                   |
|--------------|----------------------------|-----------------------|----------------------|----------------------------|
| 基础力量     | 深蹲、前蹲、分腿蹲         | STR_MAX/RSTR/STAB     | 3-5组×3-8次；RPE 6-9 | 根据训练年龄进阶           |
| Hinge        | 硬拉、RDL、臀推            | STR_MAX/PWR/GRIP_CORE | 3-5×3-8              | 控制轴向/髋铰链技术        |
| 推           | 卧推、俯卧撑、推举         | STR/PWR/STAB          | 3-4×4-12             | 可按器械回归               |
| 拉           | 引体、下拉、划船           | STR/RSTR/GRIP         | 3-4×4-12             | 攀岩用户不等同于只练垂直拉 |
| 跳跃         | CMJ、立定跳、侧向跳        | PWR/BAL/DEC           | 3-5×2-5              | 低疲劳、高质量             |
| 投掷         | 药球胸前、旋转抛           | PWR/COORD/CORE        | 3-5×3-6              | 全身传力                   |
| 冲刺         | 10m/20m/30m                | SPD/ACC/DEC           | 3-8次；充分休息      | 质量优先                   |
| 变向         | 减速、45°/90°切入          | DEC_COD/BAL           | 3-6组                | 先掌握刹车再复杂化         |
| 有氧         | 跑/骑/划/游/坡走           | AER_CAP/AER_END       | 20-90min             | 按强度区间控制             |
| 间歇         | 短冲/重复冲刺              | ANA/RHIA              | 工作:恢复依目标调整  | 不替代基础有氧             |
| 协调         | 跳绳、爬行、接抛、节奏移动 | COORD/AWARE           | 10-20min             | 低负荷、变化多             |
| 平衡         | 单脚、单腿RDL、落地稳定    | BAL/STAB/AWARE        | 2-4组                | 尽量向动态平衡过渡         |
| 活动度       | 踝、90/90、胸椎、肩        | MOB/STAB              | 5-15min              | 强调主动控制               |
| 握力/传力    | 农夫走、提箱、悬挂         | GRIP_CORE/STR         | 2-4组                | 专项握板另算专项训练       |

## 6.1 动作刺激向量

每个 exercise 必须存储 primary_abilities 和 secondary_abilities 两个稀疏向量。例如 Farmer Carry 可以是 STR_MAX=0.4、GRIP_CORE=0.9、STAB=0.7、AER_END=0.2。数值表示“该动作对能力的主要刺激贡献先验”，不是训练效果百分比。

# 7. 用户能力测试系统

测试系统的目标不是打造实验室测试，而是用「最少可重复、尽量低设备」的方式建立可用于推荐的能力画像。系统采用**双轨自测设计**，用户可自行选择，并可先简后精、随时补测：

- **轨道 A：简单自评问卷（Self-Assessment Questionnaire，SAQ）**——面向新用户、时间有限或无器械场景，用通俗问题与 0–5 锚点自评，5–8 分钟快速出第一版计划，置信度较低。
- **轨道 B：专业详细自测（Standardized Performance Tests，SPT）**——面向进阶用户、追求精度、具备设备/场地场景，按标准化协议实测（见 7.1），置信度较高，可分批完成。

两轨共享同一套标准化评分（7.2）与复测机制（7.3），统一写入能力画像（capacity_snapshot）。测试记录原始值、标准化分数、质量标志和置信度。

| **维度**     | **轨道 A：自评问卷 SAQ**              | **轨道 B：专业自测 SPT**                 |
|--------------|---------------------------------------|------------------------------------------|
| 面向用户     | 新用户 / 时间有限 / 无器械            | 进阶用户 / 追求精度 / 有设备场地         |
| 输入形式     | 通俗问题 + 0–5 锚点自评               | 标准化测试原始值（秒/kg/cm/次）          |
| 覆盖能力     | 18 能力各 1 题（可组合）              | 按设备与可测能力筛选（见 7.1）           |
| 典型用时     | 5–8 分钟                              | 30–60 分钟（可分批）                      |
| 置信度       | 低（0.3–0.5，标记「自评估值」）       | 中高（0.6–0.9）                          |
| 数据来源     | self_report_score                     | raw_value → normalized_score             |
| 对计划影响   | 快速出首版计划，推荐确定性较低        | 画像精度高，推荐更确定                   |

## 7.1 首批测试协议

| **ID**         | **能力**     | **测试**                                     | **单位**    | **评分方式**      | **置信度起点** | **备注**                     |
|----------------|--------------|----------------------------------------------|-------------|-------------------|----------------|------------------------------|
| T-STR-LB       | 下肢力量     | 3-5RM squat / trap-bar deadlift 等           | kg或e1RM    | 技术合格后测试    | 高             | 力量背景较强者可选进阶       |
| T-STR-UB       | 上肢拉力     | 标准引体最大次数或加重引体e1RM               | 次数/kg     | 动作标准固定      | 高             | 避免只用悬垂时间代表拉力     |
| T-REL          | 相对力量     | 力量/体重组合指标                            | ratio       | 由力量测试计算    | 中高           | 不同动作要分别建模           |
| T-PWR-JUMP     | 下肢爆发力   | CMJ或立定跳远                                | cm          | 最好成绩/平均成绩 | 中高           | 建议同一设备/场地复测        |
| T-SPRINT-10    | 加速         | 10m sprint                                   | s           | 最好时间          | 中高           | 至少充分热身                 |
| T-SPRINT-30    | 速度         | 20-30m sprint                                | s           | 最好时间          | 中高           | 场地稳定                     |
| T-DEC          | 减速         | 短冲→急停距离/时间                           | m/s或评分   | 按标准化协议      | 中             | 第一版可做教练评分           |
| T-COD          | 变向         | 5-10-5 或标准化COD                           | s           | 最好成绩          | 中             | 需要掌握技术                 |
| T-AER          | 有氧能力     | 12-min run / submax cycle / estimated VO2max | m/估计值    | 协议化            | 中             | 对非跑者提供骑车替代         |
| T-AER-END      | 有氧耐力     | 30-60min稳态完成质量                         | HR/RPE/时间 | 组合指标          | 中             | 偏向能力画像而非医学诊断     |
| T-ANA          | 无氧重复能力 | 重复短冲或固定间歇完成质量                   | 总功/衰减率 | 协议化            | 中             | 设备限制较大                 |
| T-BAL          | 平衡         | 单脚静态+动态任务                            | s/评分      | 左右侧均测        | 中             | 不要仅使用不稳定器械         |
| T-COORD        | 协调         | 跳绳/多方向节奏/接抛任务                     | 任务得分    | 评分量表          | 低中           | 采用多个短任务组合           |
| T-REACT        | 反应         | 视觉/声音刺激反应任务                        | ms/正确率   | 设备或手机        | 中低           | 用于产品内测逐步校准         |
| T-AWARE        | 身体空间觉   | 闭眼单腿/落点/脚步定位任务                   | 评分        | 任务标准化        | 低             | 暂以教练/视频评分            |
| T-MOB-ANKLE    | 踝活动度     | knee-to-wall                                 | cm          | 左右侧            | 高             | 注意脚跟不离地               |
| T-MOB-HIP      | 髋活动度     | 90/90等标准化任务                            | 角度/评分   | 双侧              | 中             | 主动控制比单纯被动角度更重要 |
| T-MOB-SHOULDER | 肩活动度     | overhead/rotation组合                        | 角度/评分   | 双侧              | 中             | 肩痛用户不进入高强度测试     |
| T-STAB         | 稳定性       | step-down / single-leg squat / landing       | 评分        | 视频/教练 rubric  | 中             | 动作质量与负荷能力双维       |
| T-GRIP         | 握力         | 握力计 / 悬挂                                | kg/s        | 按类型分组        | 高             | 攀岩专项另设指力协议         |

## 7.2 标准化评分

测试不能直接把“秒数/公斤数”当成能力分数。建议分三层：Raw Value → Norm Score → Ability Score。第一版 Norm Score 可以基于年龄段、性别（可选）、训练背景和体重等分层百分位；当样本不足时，使用透明的专家先验或区间评分，并标记低置信度。

AbilityScore ∈ \[0, 5\]

NormScore = percentile / reference distribution

AbilityScore = clip(5 × f(NormScore), 0, 5)

Confidence = TestReliability × ProtocolQuality × ReferenceQuality × DataRecency

不要在缺乏可靠常模时伪造精确百分位。产品 UI 可以展示“基础/良好/高”等等级，后台保留 score + confidence。

## 7.3 复测策略

| **情形**      | **默认策略**                                 |
|---------------|----------------------------------------------|
| 新用户        | 首次使用做快速版基线，不要求所有能力一次测完 |
| 力量/爆发能力 | 4-8周复测；高负荷周期内不频繁测试最大值      |
| 速度/变向     | 4-8周，保持场地与热身协议一致                |
| 有氧          | 6-12周，优先使用同一形式复测                 |
| 活动度/稳定性 | 4-8周，结合动作质量                          |
| 未测能力      | 从自评 + 模糊先验开始，并降低推荐的确定性    |

## 7.4 自评问卷规范（SAQ）

自评问卷是双轨中的轻量轨，目标是「用户不需理解术语，也能产出可用的能力画像」。

### 7.4.1 题目设计原则

- 每条能力至少 1 道通俗题，用「生活化动作描述 + 0–5 锚点」替代术语。
- 锚点必须具体、可想象（如「深蹲：几乎做不了 → 自重 → 接近体重负重」）。
- 题目询问「你能完成到什么程度」，而非「你是否擅长」。
- 每题标记为 self_report，默认置信度 0.4，写入 capacity_snapshot 时 source=self_report。

### 7.4.2 自评 → 能力分映射

SelfReport[a] ∈ [0, 5]，作为 Current[a] 的 self_report_score 输入（见 8.3）。

AbilityScore = clip(5 × f(自评锚点), 0, 5)

Confidence  = 0.4 × 题目质量因子（默认 0.4）

### 7.4.3 18 能力自评题库（首版）

| **能力**   | **通俗自评题**                       | **0 锚点**          | **5 锚点**                |
|------------|--------------------------------------|---------------------|---------------------------|
| STR_MAX    | 深蹲/硬拉能做到什么水平？            | 几乎做不了          | 负重接近或超过体重         |
| STR_REL    | 引体向上/自重深蹲表现如何？          | 做不了引体          | 连续多次标准引体           |
| STR_END    | 中等负重能连续重复多少次？            | 几下就力竭          | 可持续多组                |
| PWR        | 立定跳远/纵跳的爆发感？              | 跳不远              | 轻松纵跳                  |
| SPD        | 短距离冲刺速度如何？                  | 明显偏慢            | 明显较快                  |
| ACC        | 起步加速快吗？                        | 启动慢              | 起步快                    |
| DEC_COD    | 急停、变向是否稳？                    | 刹不住              | 稳且再加速快              |
| AER_CAP    | 持续慢跑/骑行能维持多久？             | 几分钟就喘          | 轻松 30 分钟以上          |
| AER_END    | 长时间次最大强度能维持吗？            | 很短                | 可持续较长时间            |
| ANA_CAP    | 短时间高强度输出如何？                | 很弱                | 很强                      |
| RHIA       | 高强度后能否快速恢复并重复？          | 很难                | 很容易                    |
| BAL        | 单脚站立（睁眼/闭眼）能坚持？        | 几秒                | 1 分钟以上                |
| COORD      | 手脚协调、节奏动作流畅吗？            | 笨拙                | 流畅                      |
| REACT      | 对外界刺激的反应快吗？                | 慢                  | 快                        |
| AWARE      | 对身体位置与空间关系的感知？          | 弱                  | 强                        |
| MOB        | 深蹲深度、肩/踝活动度如何？           | 明显受限            | 全范围可控                |
| STAB       | 单腿支撑/落地时稳定吗？               | 不稳                | 稳定                      |
| GRIP_CORE  | 握力、悬挂、躯干传力如何？            | 弱                  | 强                        |

注：题库与锚点文案应随产品迭代版本化（question_version）；前端完整题库与交互详见网站详细设计文档。

## 7.5 评估历史与进步趋势

系统应持续保存每次评估与能力画像快照，支持用户回顾进步。数据层已具备（4.7 表 assessment_session / capacity_snapshot / outcome_log）。

### 7.5.1 记录规范

- assessment_session.mode 取值 saq / spt / mixed，标记本次评估方式。
- 每次评估记录 protocol_version、date、原始值、标准化分、置信度、quality_flag。
- 每次生成计划记录目标画像快照（training_plan.goal_snapshot），用于「目标变化」对比。
- 每次训练记录完成度 / RPE / 疼痛标志（outcome_log），用于趋势与训练量调整。

### 7.5.2 趋势指标（供前端图表）

| **指标**       | **定义**                                        | **数据来源**                                    |
|----------------|-------------------------------------------------|-------------------------------------------------|
| 能力分数趋势   | 某能力 score 随时间变化                         | capacity_snapshot（按 ability_id 串联）         |
| 缺口收敛       | target − current 随时间缩小                     | capacity_snapshot + goal_snapshot               |
| 达标能力数     | current ≥ target 的能力个数                     | 同上                                            |
| 训练一致性     | 完成度 / RPE 序列                               | outcome_log                                     |
| 复测提醒       | 各能力下次建议复测时间                           | 7.3 复测策略 + 最近评估日期                      |

### 7.5.3 置信度与展示边界

历史趋势不得在样本不足时伪造精确曲线：少于 2 次评估的能力仅展示「点值 + 自评估值角标」，不连趋势线；置信度低于 0.5 的数据在图表中以虚线/浅色表示。前端展示分级与图表规范见网站详细设计文档。

# 8. 运动需求 → 训练计划转化算法

算法分为 8 步：目标聚合、需求映射、当前能力、缺口、优先级、训练方法选择、训练量预算、验证与反馈。

## 8.1 Step 1：目标运动聚合

For each ability a:

TargetDemand\[a\] = WeightedAggregate(Demand\[sport\]\[a\], sport_weight)

Recommended aggregate:

base = weighted_mean(demand_scores)

peak = max(demand_scores)

TargetDemand = α \* base + (1-α) \* peak

where α≈0.70 for generalist users.

Then apply priority weight from user goals and desired level.

采用 mean + max 的混合而不是纯平均，可以避免某一项高优先级运动被其他运动“冲淡”。后续允许按用户偏好选择 α。

## 8.2 Step 2：把需求强度转换为目标能力

TargetCapacity\[a\] = ThresholdMap(a, TargetDemand\[a\], user_context)

Examples:

Demand 1-2 → sufficient baseline

Demand 3 → functional competence

Demand 4 → high general capacity

Demand 5 → high / sport-relevant capacity

这里不把需求 5 简单等价为“能力必须 5”。对于技术主导项目，力量能力的合理目标可能在达到平台后进入维持区。ThresholdMap 应由能力模块分别定义。

## 8.3 Step 3：当前能力画像

Current\[a\] = weighted_blend(

measured_score,

self_report_score,

prior_training_history,

recency_decay

)

CurrentConfidence\[a\] = evidence-weighted confidence

## 8.4 Step 4：能力缺口 Deficit

Deficit\[a\] = max(0, TargetCapacity\[a\] - Current\[a\])

Need\[a\] = Deficit\[a\] × TargetDemand\[a\] × GoalWeight\[a\]

同时设置 Saturation Floor：如果 Current\[a\] 已明显高于目标，则不产生正向训练缺口；能力进入维持状态后，计划资源转向其他短板。

## 8.5 Step 5：工程化优先级

Priority\[a\] =

Need\[a\]

× Transferability\[a\]

× Trainability\[a\]

× ConfidenceAdjustment\[a\]

× MultiSportSynergy\[a\]

÷ (1 + FatigueCost\[a\])

where:

Transferability = how many goal sports benefit from this ability

Trainability = expected responsiveness / ease of training

FatigueCost = recovery budget consumed by developing this ability

MultiSportSynergy = benefit shared across selected sports

ConfidenceAdjustment = 1.0 when measured confidently; lower when uncertain

这就是之前提出的工程化设计核心。第一版建议把 Priority 转成 0-100，并保留每个乘子供解释系统展示。

## 8.6 Step 6：训练方法选择

针对每一个高优先级能力，先选训练方法，而不是直接选动作。流程为：Ability → Adaptation Method → Exercise Candidates → User Constraints Filter → Ranking。

method_score =

ability_match × progression_fit × transferability

× equipment_fit × skill_fit × fatigue_fit × safety_fit

exercise_score =

method_score × primary_ability_match

× coaching_access × variety_bonus

## 8.7 Step 7：训练量预算

不能简单地把每项能力的计划量相加，否则用户可能得到“力量+爆发+速度+有氧+协调全都很多”的不可执行计划。系统需要一个 Weekly Capacity Budget。

| **预算维度**     | **默认规则**          | **调整因素**                     |
|------------------|-----------------------|----------------------------------|
| 高神经质量训练   | 每周约 2-3 个主要暴露 | 训练年龄、睡眠、专项运动         |
| 力量             | 2-3次主要暴露         | 基础/进阶/专项赛季               |
| 爆发/速度        | 1-3次短暴露           | 优先低疲劳质量                   |
| 有氧             | 2-4次                 | 运动目标与恢复状态               |
| 协调/平衡/活动度 | 可高频、短时          | 作为热身/恢复/训练间模块         |
| 高强度间歇       | 0-2次                 | 与球类/攀岩/滑雪专项负荷合并计算 |

“暴露”是比“课次”更好的系统概念：同一节力量训练可以同时产生 STR、PWR、GRIP 等刺激，因此计划引擎必须记录训练刺激向量和疲劳向量。

# 9. 多运动目标合并算法

用户可能选择 2-6 个目标运动。系统需要避免为每项运动分别生成完整计划。核心思想是最大化“共享收益”。

For ability a:

SharedBenefit\[a\] = Σ_s sport_weight\[s\] × demand\[s,a\]

SportCoverage\[a\] = count of sports where demand\[s,a\] \>= threshold

Synergy\[a\] = normalize(SharedBenefit\[a\] × SportCoverage\[a\])

Training resources are allocated first to:

High gap + high synergy + reasonable fatigue cost

示例：用户目标为抱石+滑雪+羽毛球+徒步。协调、平衡、相对力量、下肢单腿能力、有氧基础等通常具有跨项目收益；而抱石专项指力、羽毛球击球技术等不得被算法当作通用能力完全替代。

# 10. 训练计划生成与周期化

计划引擎默认采用 4-8 周微周期窗口，但用户日历可以持续运行。每个周期设 3 类目标：Development、Maintenance、Practice。

| **类型**    | **含义**                       | **算法处理**                                                 |
|-------------|--------------------------------|--------------------------------------------------------------|
| Development | 存在明显缺口、且具有高迁移收益 | 分配主要训练资源                                             |
| Maintenance | 已达到目标或接近目标           | 最低有效剂量维持                                             |
| Practice    | 专项运动实际练习               | 按用户兴趣排课；记录为专项负荷，不计作通用训练动作的完全替代 |

## 10.1 周计划模板

Session A: Speed/Power + Strength

Session B: Aerobic + Mobility/Coordination

Session C: Strength + Unilateral + Carry/Core

Session D: Movement / Agility / Reaction

Optional: Sport Practice / Hiking / Climbing

Rest / Recovery distributed by user calendar

这只是默认模板，不是固定处方。系统应优先遵循用户已有专项运动日程，再填充 GAP 训练。

## 10.2 训练日内部排序

1\. Warm-up / movement prep

2\. Speed / reaction / power (when prescribed)

3\. High-skill strength

4\. Secondary strength / unilateral

5\. Conditioning

6\. Mobility / low-load coordination

7\. Recovery notes

顺序的核心是把速度、爆发力和高技术要求内容放在疲劳较低时完成。NSCA 相关实践材料也提出从简单到复杂、慢到快、静态到动态、无负荷到负荷进行渐进，并根据个体能力与训练背景选择和排序练习。

# 11. 安全、约束与失败保护

系统面向普通用户，但不能根据有限数据做医疗诊断。安全逻辑应该优先于优化逻辑。

| **规则**          | **实现**                                           |
|-------------------|----------------------------------------------------|
| 急性疼痛/异常症状 | 停止相关动作；提示就医或专业评估；不由算法推断病因 |
| 未成年人          | 进入单独年龄规则；本 v1.0 默认成人                 |
| 高风险动作        | 跳跃、冲刺、负重等必须有等级门槛和回归动作         |
| 技术质量不足      | 优先降低复杂度/负荷，而不是继续增加重量            |
| 恢复不足          | 根据完成度、RPE、睡眠自评降低总训练量              |
| 运动冲突          | 专项运动高负荷周自动降低对应 GAP 能力训练量        |
| 测试失败          | 保存失败标志；不将失败值当作低能力精确值           |

## 11.1 疲劳模型

第一版无需复杂生理模型。为每种训练方法定义一个 0-1 Fatigue Profile，包括神经、肌肉、代谢和局部组织负荷的粗分类。后续通过用户数据校准。

SessionLoad = Σ(exercise_load × fatigue_vector)

WeeklyLoad\[a\] = Σ session stimulation\[a\]

Constraint: WeeklyLoad must remain within user_budget

Adjustment: if subjective_recovery low → reduce high-cost volume first

# 12. 可解释推荐

系统每次生成计划都必须输出“为什么”。这是产品建立信任的关键。

Example:

Priority: Deceleration/COD = 82/100

Why:

\- 3/4 target sports require high COD demand

\- current score 2.1 vs target 4.0

\- low-to-medium transfer cost across basketball/ski/badminton

\- high trainability

Recommendation:

\- 2 exposures/week

\- deceleration landing → planned COD → reactive COD progression

解释对象至少包括：目标项目、当前能力、缺口、推荐训练模块、频率、预计原因、何时复测。

# 13. 扩展、校准与机器学习路线

系统应采用“规则优先、数据校准、机器学习后置”的路线。运动科学领域存在足够多的先验，但不宜在没有用户数据时训练黑箱模型。

| **阶段** | **能力**                  | **推荐实现**                       |
|----------|---------------------------|------------------------------------|
| v1.0     | 固定矩阵 + 规则引擎       | 可解释、可测试                     |
| v1.5     | 专家修订与置信度          | 版本化权重 + audit trail           |
| v2.0     | 基于完成度/结果的参数校准 | Bayesian/回归等方法                |
| v3.0     | 个体化预测                | 预测某训练剂量对特定能力的响应     |
| v4.0     | 多目标优化                | 在时间、疲劳和偏好约束下优化总收益 |

## 13.1 证据等级

| **等级** | **定义**                         | **用途**                     |
|----------|----------------------------------|------------------------------|
| A        | 多项高质量研究/指南/成熟共识支持 | 核心训练方法与安全规则       |
| B        | 较充分研究，但存在情境差异       | 常用训练参数                 |
| C        | 有限研究或依赖专家共识           | 协调、复杂反应训练等         |
| D        | 产品假设/待验证                  | 需求权重、迁移系数、疲劳先验 |

产品必须允许任何一个 A/B/C/D 参数独立升级版本，而不需要重写算法。

# 14. API / 服务边界建议

| **接口**                 | **输入**                              | **输出**                 |
|--------------------------|---------------------------------------|--------------------------|
| POST /assessment/session | user_id + test results                | capacity snapshot        |
| GET /sports/{id}/demands | sport id + context                    | demand vector            |
| POST /goals/profile      | sport goals + weights                 | target capacity          |
| POST /plan/generate      | user + target + current + constraints | plan + explanations      |
| POST /plan/feedback      | completion + RPE + notes              | updated adherence data   |
| POST /reassessment       | new test results                      | updated capacity + delta |
| GET /knowledge/version   | domain/version                        | current rule set         |

算法服务返回 version、inputs_hash、rule_ids 和 explanation_items，保证推荐可复现。

# 15. 面向用户的 GAP 理论说明文档

以下内容建议直接改造成网站的“什么是 GAP / 为什么需要 GAP / 如何使用 GAP”帮助中心。

## 15.1 什么是 GAP？

GAP（General Athletic Preparation，通用运动能力准备）是一种帮助多运动爱好者建设“身体通用底座”的训练框架。它的目标不是让你只擅长一个项目，而是让身体具备更广泛的力量、速度、爆发力、耐力、平衡、协调和身体控制能力，使你在接触不同运动时拥有更好的基础。

例如，一个经常攀岩、滑雪、羽毛球和徒步的人，并不需要为四个项目完全分别打造四套身体。他可以先提高相对力量、单腿力量、爆发力、减速能力、平衡、协调和有氧基础，再通过各项运动的实际练习获得专项技术。

## 15.2 GAP 不是什么？

- 不是一套可以替代专项训练的万能计划。

- 不是追求所有身体指标都达到最高。

- 不是把健美训练简单改成“功能性训练”。

- 不是医疗诊断或伤病康复系统。

## 15.3 GAP 的能力地图

系统把运动能力分为力量、力量速度、能量系统、身体控制和结构能力五个大类，并进一步拆成 18 个可计算能力。用户不需要理解所有术语，系统会把测试结果转换成能力画像。

## 15.4 为什么选择多个运动？

因为不同运动之间存在大量共享能力。系统会识别这些共享部分。例如，减速与变向同时服务篮球、羽毛球、网球、滑雪；平衡和身体空间控制同时服务滑雪、攀岩、冲浪等。另一方面，击球、投篮、攀岩路线阅读等专项技能不能被“通用力量训练”自动替代，因此系统会把通用训练和专项运动实践分开计算。

## 15.5 你会经历什么？

选择目标运动

↓

完成能力评估（可选简单自评或专业自测）

↓

得到个人能力画像

↓

系统找出“目标需要而你相对不足”的能力

↓

结合时间、器械、运动日程和恢复情况

↓

生成 GAP 训练计划

↓

训练 + 记录

↓

周期性复测并更新计划

## 15.6 如何理解你的训练计划？

训练计划中会同时出现 Development（重点提升）、Maintenance（维持）和 Practice（专项实践）。当一个能力已经达到目标，系统通常不会不断增加训练量，而是将有限的恢复资源转移给其他短板。

## 15.7 为什么计划可能与传统健身计划不同？

传统健美训练常以肌肉群和增肌刺激组织计划；GAP 以“运动能力缺口”为组织单位。因此同样是深蹲，GAP 可能因为力量不足而使用较高力量训练，也可能因为力量已经足够而降低深蹲训练量，转而加入跳跃、冲刺、单腿控制或有氧训练。

## 15.8 GAP 的基本原则

- 能力覆盖优先于动作数量。

- 运动质量优先于疲劳感。

- 先建立可控动作，再增加速度、负荷和复杂度。

- 专项技能必须通过专项实践获得。

- 训练资源优先投向对多个目标运动都有收益的短板。

- 测试结果存在不确定性时，系统降低推荐的确定性，而不是伪造精确结果。

## 15.9 重要提示

GAP 是训练决策工具，不是医学建议。出现持续或异常疼痛、急性损伤症状或其他需要专业评估的情况时，应停止相关训练并寻求合适的医疗或运动专业帮助。

## 15.10 如何追踪你的进步

系统会保留你的每次评估与训练记录。你可以通过「进步」页面看到：

- 某一项能力（如平衡、有氧能力）随时间的变化曲线。
- 两次评估之间的能力画像对比（例如三个月前与现在）。
- 你与目标能力之间的缺口是否在缩小。
- 你的训练一致性（完成度与自我感觉）。

进步趋势只是参考，不构成对训练效果的医学判断；数据不足时系统不会画出精确曲线，而是如实告诉你「样本还不够」。

# 附录 A：首批运动种子数据的使用规范

首批运动矩阵用于 MVP。正式上线前，每个运动项目的 12 项评分应至少经过两名具有相关运动训练经验的专家独立评分；记录均值、离散程度、证据等级和分歧理由。

| **步骤**     | **要求**                             |
|--------------|--------------------------------------|
| 1\. 运动定义 | 明确运动形式、典型休闲场景和级别     |
| 2\. 能力评分 | 独立对 12 个一级指标评分 0-5         |
| 3\. 解释     | 每个评分必须有简短理由               |
| 4\. 置信度   | 给出 0-1 confidence                  |
| 5\. 分歧处理 | 差异超过预设阈值则复核               |
| 6\. 发布     | 生成 demand_version 并锁定快照       |
| 7\. 观察     | 上线后收集用户结果，评估是否需要校准 |

# 附录 B：计划生成伪代码

function generatePlan(user):

constraints = buildConstraints(user)

goals = normalizeSportGoals(user.sportGoals)

targetDemand = aggregateDemand(goals, demandDB)

targetCapacity = mapDemandToTarget(targetDemand, user.context)

current = getLatestCapacity(user)

current = fillMissingWithUncertainPrior(current)

for ability in abilities:

deficit\[ability\] = max(0, targetCapacity\[ability\] - current\[ability\])

need\[ability\] = deficit\[ability\]

\* targetDemand\[ability\]

\* goalWeight(ability, goals)

priority\[ability\] = need\[ability\]

\* transferability(ability, goals)

\* trainability(ability)

\* synergy(ability, goals)

\* confidenceAdjustment(current\[ability\])

/ (1 + fatigueCost(ability))

rankedAbilities = sortDescending(priority)

budget = allocateWeeklyBudget(constraints)

methods = selectMethods(rankedAbilities, methodDB, constraints)

exercises = selectExercises(methods, exerciseDB, constraints)

plan = buildWeeks(

abilities=rankedAbilities,

methods=methods,

exercises=exercises,

budget=budget,

sportPractice=user.sportSchedule

)

plan = validateSafety(plan, constraints)

plan = validateFeasibility(plan, user.schedule)

plan.explanations = explain(plan, targetDemand, current, priority)

plan.version = ALGORITHM_VERSION

plan.inputs_hash = hashInputs(user, targetDemand, current)

return plan

## 附录 B.1 计划约束优先级

Hard constraints:

1\. safety flags

2\. available days/time

3\. equipment

4\. contraindication tags

Soft constraints:

5\. preference

6\. exercise variety

7\. training novelty

8\. fatigue distribution

9\. balanced development

10\. estimated sport transfer

# 附录 C：参考资料与证据边界

| **来源** | **资料**                                                                        | **与本系统的关系**                                                                                                                                                                         | **链接**                                                                                             |
|----------|---------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------|
| NSCA     | Practical Application for Long-Term Athletic Development                        | NSCA. 该文介绍 athleticism 涉及敏捷、平衡、协调、柔韧、代谢训练、功率、反应、速度、力量及力量耐力，并提出平衡/稳定、基础/动态运动、物体控制、增强式、速度/敏捷和力量/耐力/功率等训练类别。 | https://www.nsca.com/Education/Articles/Practical-Application-for-Long-Term-Athletic-Development/    |
| NSCA     | The ABCs of Long-Term Athletic Development                                      | NSCA. 强调基础运动技能应先于专项运动技能，并讨论 agility、balance、coordination 等基础运动能力。                                                                                           | https://www.nsca.com/education/articles/nsca-coach/abc-of-long-term-athletic-development/            |
| NSCA     | Long-Term Athletic Development Position Statement                               | NSCA. 强调长期、个体化、整体性的运动发展及基础力量、运动能力和合理进阶。                                                                                                                   | https://www.nsca.com/about-us/position-statements/youth-training-and-long-term-athletic-development/ |
| ACSM     | General Principles of Exercise Prescription / Exercise Testing and Prescription | ACSM. 提供 FITT、力量、柔韧性、神经运动能力、有氧训练等运动处方框架。                                                                                                                      | https://www.acsm.org/docs/default-source/publications-files/acsms-exercise-testing-prescription.pdf  |
| ACSM     | ACSM-EP Crosswalk                                                               | ACSM. 将 strength/endurance/power 与 neuromotor skills（balance/agility/proprioception）并列纳入运动处方知识结构。                                                                         | https://www.acsm.org/wp-content/uploads/2025/01/acsm-ep-crosswalk.pdf                                |

## 证据边界说明

本设计文档中的 18 项能力分类、0-5 运动需求评分、TargetCapacity 映射、Transferability、Trainability、FatigueCost、MultiSportSynergy 以及多运动聚合方式，是在已有运动训练框架之上的本项目工程化设计。它们不是上述来源直接规定的标准，应作为可版本化、可验证和可校准的产品规则。

# 附录 D：开发验收清单

| **验收项** | **必须满足**                                                                      |
|------------|-----------------------------------------------------------------------------------|
| 数据可追溯 | 每个推荐结果可追溯到 sport demand、ability score、rule version、exercise metadata |
| 版本化     | 能力、运动需求、测试常模、训练规则均可独立版本化                                  |
| 可解释     | 用户能看到至少 1-3 条推荐原因                                                     |
| 可测试     | 核心算法可用固定 fixture 输入输出进行回归测试                                     |
| 可扩展     | 增加运动项目不需要修改核心算法                                                    |
| 可替换     | 增加动作不需要修改运动需求数据库                                                  |
| 可校准     | 专家可修改需求/训练参数并保留变更记录                                             |
| 安全优先   | 安全约束在推荐优化之前执行                                                        |
| 反馈闭环   | 计划完成度、RPE、测试结果可回流能力画像                                           |
