# 自然拼读星 — 小学自然拼读微信小程序

> 每天10分钟，看词会读，听音会拼。

## 内测版本/正式版本

- **0.1.0-beta** - 上线内测，充值系统关闭，请勿尝试充值！

## 课程包发布门禁

课程包状态：`draft → reviewing → ready → published`

发布前需满足：
1. 所有必需音频存在
2. 核心图片存在或允许回退
3. 课程数据校验通过（`npx ts-node scripts/validate-course-pack.ts starter-satpi`）
4. 资源校验通过（`npx ts-node scripts/validate-resources.ts`）
5. 所有步骤可完整通关
6. 依赖无循环

## SATPI 单元课程清单

| 编号 | 课程 | 目标 |
|------|------|------|
| S001 | 字母音 S | 认识S，掌握/s/，辨别词首/s/ |
| S002 | 字母音 A | 认识A，掌握短音/æ/ |
| S003 | 字母音 T | 认识T，掌握/t/ |
| S004 | S+A+T 拼读 | 三个字母组合拼读 |
| S005 | 字母音 P | 认识P，掌握/p/ |
| S006 | 字母音 I | 认识I，掌握短音/ɪ/ |
| S007 | 短元音 A 拼读 | -at, -ap 词族 |
| S008 | 短元音 I 拼读 | -it, -ip 词族 |
| S009 | SATPI 综合拼读 | 五字母综合练习 |
| S010 | 单元阅读 | 两篇可解码短文 |
| R001 | 第一次复习 | S/A/T 复习 |
| R002 | 第二次复习 | P/I 复习 |
| A001 | 单元测试 | 听音+拼读+拆音测评 |

## 资源管理

### 音频命名规范
```
assets/audio/phonemes/{letter}.mp3      # 字母音 (如 s.mp3)
assets/audio/letter-names/{letter}.mp3  # 字母名称 (如 s.mp3 → "ess")
assets/audio/words/{word}-normal.mp3    # 单词正常发音
assets/audio/words/{word}-blend.mp3     # 慢速拼读
assets/audio/sentences/{reader}-s{序号}.mp3  # 句子音频
assets/audio/ui/{type}.mp3              # UI音效 (correct/incorrect/complete)
```

### 音频规格
- 格式: MP3, 单声道, 44.1kHz, 96-160kbps
- 单词 ≤100KB, 句子 ≤300KB
- 美式英语统一口音
- 辅音音素避免附加元音 (/t/ 非 "tuh")

### 图片规格
- WebP 或 PNG, 512×512, ≤150KB
- 儿童友好插画风格, 单一主体, 无文字水印

### 资源校验
```bash
npx ts-node scripts/validate-resources.ts           # 检查资源完整性
npx ts-node scripts/validate-course-pack.ts         # 检查课程数据一致性
```

### 授权记录
所有资源来源保存在 `data/source-records.json`

## 本地运行步骤

### 1. 环境要求

- 微信开发者工具（[下载地址](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)）
- Node.js >= 18
- npm >= 9

### 2. 安装依赖

```bash
cd phonics-star
npm install
```

### 3. 打开项目

1. 打开**微信开发者工具**
2. 选择「导入项目」
3. 目录选择 `phonics-star/`
4. AppID 使用测试号（或填写 `touristappid`）
5. 点击「确定」

### 4. 构建 npm

在微信开发者工具中：菜单栏 → 工具 → 构建 npm

### 5. 运行

点击编译按钮即可在模拟器中运行。

### 6. TypeScript 检查

```bash
npx tsc --noEmit   # 应输出零错误
```

## Phase 2 架构说明

### 课程步骤引擎 (`modules/lesson/`)

```
lesson-engine.ts      → 状态机核心，管理步骤流转
lesson-session.ts     → 会话创建/恢复/持久化
step-registry.ts      → step.type → 组件路径映射
types.ts              → StepStatus, StepResult, LessonSession
```

步骤状态：`not_started → active → completed`（失败时 `failed → retry → active`）

### 步骤组件 (`components/lesson-steps/`)

| 步骤类型 | 组件路径 | 功能 |
|---------|---------|------|
| `phoneme_intro` | `phoneme-intro/` | 字母卡片 + 口型提示 + 示例词 + 点击播放 |
| `audio_choice` | `audio-choice/` | 3题听音辨字母，正确/错误反馈，支持重试 |
| `blend_word` | `blend-builder/` | 点击音块合成单词，3个目标词 |
| `segment_word` | `sound-segmenter/` | 选择音素拆解单词，根据 phonemeIds 判断 |
| `pronunciation` | `pronunciation-practice/` | 录音→评测→反馈，MockEvaluator |
| `mini_game` | `game-step/` | 嵌入式打地鼠，5轮 |
| `decodable_reader` | `decodable-reader/` | 逐词可点击，进度条 |
| `lesson_reward` | `lesson-reward/` | 星星计算 + 能量 + 徽章 |

### 练习引擎 (`modules/practice/`)

```
practice-engine.ts         → PracticeEngine 类
question-generator.ts      → 4种题型生成器
practice-session.ts        → 会话持久化
types.ts                   → PracticeMode, PracticeQuestion
```

四种模式：`listen`（听音辨字母）/ `spell`（听音拼单词）/ `family`（词族训练）/ `error_review`（错音复习）

### 小游戏 (`components/games/`)

| 游戏 | 规则 |
|------|------|
| 听音打地鼠 | 10轮，每轮3只地鼠，点击正确得分 |
| 单词钓鱼 | 5轮，钓到正确单词入篓 |
| 拼读小火车 | 5站，按顺序排列字母车厢 |

### 通用组件（新增）

| 组件 | 功能 |
|------|------|
| `answer-feedback` | 正确/错误/重试/完成 4态反馈 |
| `score-summary` | 评分圆环 + 星级 + 重做按钮 |
| `record-button` | 录音按钮（空闲/录音/已录 3态） |
| `letter-tile` | 字母卡片（元音紫/辅音蓝） |
| `answer-slots` | 答题槽位行 |
| `completion-modal` | 完成弹窗（星星动画） |
| `game-hud` | 游戏状态栏 |

### 服务层（新增）

| 服务 | 功能 |
|------|------|
| `resource-resolver.ts` | 图片→Emoji映射，音频缺失提示 |
| `analytics.ts` | 学习事件记录、时长统计、弱音素分析 |

### S 课程测试数据

课程 `L001`（字母音 S, A, T）：

- 步骤1：发音认识 — 展示字母S /s/ 口型提示 + sun/sock/sit 示例词
- 步骤2：听音选择 — 3题，每题4选1
- 步骤3：拼读合成 — sit/sat/sun 依次拼读
- 步骤4：单词拆音 — 根据 phonemeIds 拆解
- 步骤5：跟读 — 录音→MockEvaluator→反馈
- 步骤6：打地鼠 — 5轮简化版
- 步骤7：可解码阅读 — Sam can sit.
- 步骤8：奖励结算 — 1-3星 + 能量

---

## 目录结构

```
phonics-star/
├── README.md                   # 本文档
├── package.json                # npm 依赖
├── tsconfig.json               # TypeScript 配置
├── project.config.json         # 微信开发者工具配置
├── .gitignore
├── typings/
│   └── index.d.ts              # 全局类型声明
└── miniprogram/                # 小程序源码根目录
    ├── app.ts                  # 应用入口
    ├── app.json                # 应用配置（页面路由、权限）
    ├── app.wxss                # 全局样式
    ├── sitemap.json
    │
    ├── assets/                 # 静态资源
    │   ├── icons/
    │   ├── images/
    │   ├── audio/              # 音频文件（课程发音）
    │   └── animations/         # 动画资源
    │
    ├── components/             # 公共组件
    │   ├── progress-bar/       # 进度条
    │   ├── star-rating/        # 星级评分
    │   ├── audio-button/       # 音频播放按钮
    │   ├── bottom-nav/         # 底部导航栏
    │   ├── lesson-stepper/     # 课程阶段展示
    │   ├── empty-state/        # 空状态/错误状态
    │   ├── app-header/         # 顶部导航（预留）
    │   ├── reward-popup/       # 奖励弹窗（预留）
    │   ├── phoneme-card/       # 音素卡片（预留）
    │   ├── word-card/          # 单词卡片（预留）
    │   └── option-card/        # 选项卡片（预留）
    │
    ├── pages/                  # 页面
    │   ├── home/               # 首页
    │   ├── course-map/         # 课程地图
    │   ├── lesson/             # 学习页面（骨架）
    │   ├── practice/           # 练习中心（骨架）
    │   ├── games/              # 游戏中心（骨架）
    │   ├── growth/             # 成长中心
    │   ├── parent-report/      # 家长报告（骨架）
    │   └── profile/            # 个人中心
    │
    ├── modules/                # 业务模块
    │   ├── phonics/            # 拼读引擎（预留）
    │   │   ├── components/
    │   │   ├── services/
    │   │   └── types/
    │   ├── speech/             # 语音模块
    │   │   ├── recorder.ts         # 录音器（wx.getRecorderManager）
    │   │   ├── evaluator.ts        # 评测器入口
    │   │   ├── mock-evaluator.ts   # Mock 评测器
    │   │   └── types.ts
    │   ├── rewards/            # 奖励系统
    │   │   ├── reward.service.ts
    │   │   ├── reward.store.ts
    │   │   └── types.ts
    │   └── review/             # 复习系统
    │       ├── review.service.ts
    │       ├── scheduler.ts    （预留）
    │       └── types.ts
    │
    ├── services/               # 通用服务层
    │   ├── api.ts              # API 服务（Mock 占位）
    │   ├── storage.ts          # 本地存储封装
    │   ├── audio.ts            # 音频播放服务
    │   ├── course.ts           # 课程数据查询
    │   └── progress.ts         # 进度持久化
    │
    ├── store/                  # 全局状态管理
    │   ├── user.store.ts       # 用户状态
    │   ├── course.store.ts     # 课程状态
    │   ├── progress.store.ts   # 进度状态
    │   └── reward.store.ts     # 奖励状态（re-export）
    │
    ├── data/                   # Mock 数据（JSON）
    │   ├── levels.json         # 6 个课程阶段
    │   ├── units.json          # 14 个课程单元
    │   ├── lessons.json        # 18 节课
    │   ├── phonemes.json       # 26 个字母音
    │   ├── graphemes.json      # 29 个字素
    │   ├── words.json          # 65 个单词
    │   ├── word-families.json  # 10 个词族
    │   ├── decodable-readers.json  # 5 篇可解码读物
    │   └── badges.json         # 9 个徽章
    │
    ├── types/                  # TypeScript 类型定义
    │   ├── index.ts            # 统一导出
    │   ├── phonics.ts          # Phoneme, Grapheme, Word, WordFamily
    │   ├── course.ts           # Level, Unit, Lesson, LessonStep, DecodableReader
    │   ├── exercise.ts         # Exercise, PracticeSession
    │   ├── speech.ts           # RecorderResult, SpeechEvaluationResult
    │   ├── progress.ts         # UserProgress, LessonProgress, ReviewPlan
    │   ├── reward.ts           # Badge, Reward, PetGrowth
    │   └── user.ts             # UserProfile, StudentProfile, ParentSettings
    │
    ├── utils/                  # 工具函数
    │   ├── constants.ts        # 常量定义
    │   ├── format.ts           # 格式化（日期、时长）
    │   ├── validators.ts       # 校验函数
    │   ├── random.ts           # 随机数工具
    │   └── event-bus.ts        # 简易事件总线
    │
    └── config/                 # 配置
        ├── env.ts              # 环境配置
        ├── routes.ts           # 页面路由常量
        └── feature-flags.ts    # 功能开关
```

---

## 页面路由说明

| 路由路径 | 页面名称 | 说明 |
|---------|---------|------|
| `/pages/home/home` | 首页 | 今日任务、学习进度、快捷入口 |
| `/pages/course-map/course-map` | 课程地图 | 6阶段课程树，逐级解锁 |
| `/pages/lesson/lesson?lessonId=L001` | 学习页面 | 课程步骤骨架，待实现完整交互 |
| `/pages/practice/practice` | 练习中心 | 4种练习模式入口，待实现 |
| `/pages/games/games` | 游戏中心 | 3个小游戏入口，待实现 |
| `/pages/growth/growth` | 成长中心 | 等级、宠物、徽章、学习记录 |
| `/pages/parent-report/parent-report` | 家长报告 | 学习周报、能力分析（骨架） |
| `/pages/profile/profile` | 个人中心 | 用户信息、家长模式切换 |

页面间跳转方式：

- **底部导航**：home / course / practice / growth / profile 使用 `wx.redirectTo`
- **课程详情**：从课程地图点击课节 → `wx.navigateTo({ url: '/pages/lesson/lesson?lessonId=L001' })`
- **家长报告**：从个人中心 → `wx.navigateTo`

---

## 核心数据类型说明

### 音素 (Phoneme)

最小的发音单位，如 `/s/`、`/æ/`。

```typescript
interface Phoneme {
  id: string;           // "ph_s"
  symbol: string;       // "/s/"
  displayName: string;  // "字母音 S"
  category: 'vowel' | 'consonant' | 'digraph';
  audioUrl: string;
  mouthTip: string;
  exampleWordIds: string[];
}
```

### 字素 (Grapheme)

字母或字母组合，如 "s"、"sh"。

```typescript
interface Grapheme {
  id: string;        // "gr_s"
  text: string;      // "s"
  phonemeIds: string[];
  rule: string;
  examples: string[];
}
```

### 单词 (Word)

```typescript
interface Word {
  id: string;              // "w_cat"
  text: string;            // "cat"
  meaning: string;         // "猫"
  phonemeIds: string[];    // ["ph_c", "ph_a", "ph_t"]
  graphemeMappings: GraphemeMapping[];
  familyId: string | null; // "wf_at"
  difficulty: number;      // 1-5
  isDecodable: boolean;
  irregularParts: string;
}
```

### 课节 (Lesson)

```typescript
interface Lesson {
  id: string;
  unitId: string;
  title: string;
  targetPhonemeIds: string[];
  targetWordIds: string[];
  steps: LessonStep[];
  prerequisiteLessonIds: string[];  // 课前依赖
}
```

### 学习步骤 (LessonStep)

```typescript
type LessonStepType = 'phoneme_intro' | 'sound_discrimination' |
  'phoneme_blending' | 'word_segmenting' | 'pronunciation' |
  'mini_game' | 'decodable_reading' | 'lesson_reward';

interface LessonStep {
  id: string;
  type: LessonStepType;
  instruction: string;
  content: Record<string, unknown>;  // JSON 配置
  completionRule: string;
}
```

### 语音评测结果 (SpeechEvaluationResult)

```typescript
interface SpeechEvaluationResult {
  overallScore: number;       // 0-100
  completenessScore: number;
  fluencyScore: number;
  accuracyScore: number;
  phonemeResults: PhonemeResult[];
  feedback: string;
}
```

---

## 当前 Mock 数据说明

### 课程数据

| 数据文件 | 内容 | 数量 |
|---------|------|------|
| `levels.json` | 课程阶段 | 6 个（字母森林→阅读星球） |
| `units.json` | 课程单元 | 14 个 |
| `lessons.json` | 课节 | 18 节（8字母音 + 10词族） |
| `phonemes.json` | 音素定义 | 26 个字母音 |
| `graphemes.json` | 字素定义 | 29 个 |
| `words.json` | 单词 | 65 个（含音素拆分） |
| `word-families.json` | 词族 | 10 个（-at, -an, -ap ...） |
| `decodable-readers.json` | 可解码读物 | 5 篇 |
| `badges.json` | 徽章定义 | 9 个 |

### Mock 用户数据

- 昵称: `小明`
- 当前课节: `L001`
- 连续学习: 0 天
- 星星: 0
- 能量: 100

所有 Mock 数据均可通过 `services/course.ts` 中的函数查询，页面不应直接引用 JSON 文件。

---

## 技术选型说明

| 类别 | 选择 | 原因 |
|------|------|------|
| 框架 | 微信小程序原生 | 确保 API 兼容性和最佳性能 |
| 语言 | TypeScript | 类型安全，可维护性强 |
| 状态管理 | 自定义 Store | 轻量，避免 Redux/MobX 重框架 |
| 课程数据 | 静态 JSON | 数据驱动，后期可无缝迁移至后端 API |
| 语音评测 | 当前 Mock | 预留接口，支持后续接入腾讯云 ASR |
| 录音 | wx.getRecorderManager | 微信原生 API |
| 音频播放 | wx.createInnerAudioContext | 微信原生 API |
| 本地存储 | wx.Storage API | 封装在 services/storage.ts |
| 功能开关 | feature-flags.ts | 控制功能灰度发布 |

---

## 后续开发约定

### 数据驱动原则

- **禁止** 在页面 WXML/TS 中硬编码课程内容、单词或题目
- 所有课程内容从 `services/course.ts` 获取
- 新增课程只需编辑 `data/*.json` 文件

### 模块化开发

- 新功能优先作为独立模块放在 `modules/` 下
- 每个模块包含自己的 `types.ts`、`service.ts`、`store.ts`
- 公共能力放在 `services/` 层

### 状态管理

- 页面状态使用 `Page.data`
- 跨页面状态使用 `store/` 下的 store
- Store 基于订阅-通知模式，不使用 Proxy/MobX

### 组件开发

- 每个组件 4 文件：`.ts`、`.wxml`、`.wxss`、`.json`
- 组件通过 `properties` 接收数据，通过 `triggerEvent` 向父组件通信
- 通用组件放在 `components/`，业务组件放在对应模块的 `components/`

---

## 已知问题

1. **课程步骤交互未实现**：`/pages/lesson/lesson` 页面仅展示步骤列表，不包含实际的发音练习、听音选择等交互
2. **练习中心为骨架**：4种练习模式仅有入口，练习题逻辑未实现
3. **游戏中心为骨架**：3个游戏仅有卡片展示
4. **语音评测使用 Mock**：返回随机分数，不进行真实音频分析
5. **音频文件缺失**：`assets/audio/` 目录为空，需要录制/导入发音音频
6. **图片资源缺失**：`assets/images/` 目录为空，需要准备单词配图
7. **家长报告数据不完整**：本周数据为模拟值
8. **登录/支付/真实后端**：均未实现

---

## 下一阶段建议

### Phase 2 - 核心交互（建议 2-4 周）

1. **学习页面完整交互**
   - 实现「发音认识」步骤：音素卡片 + 口型动画
   - 实现「听音辨别」步骤：播放音素 → 4选1
   - 实现「拼读合成」步骤：拖动音块拼词
   - 实现「单词拆音」步骤：点击拆解
   - 实现「跟读练习」步骤：录音 → Mock 评测 → 反馈

2. **小游戏开发**
   - 听音打地鼠（Whack-a-Mole）
   - 单词钓鱼（Word Fishing）
   - 拼读小火车（Phoneme Train）

3. **练习中心逻辑**
   - 听音辨字母（随机出题）
   - 听音拼单词（拖动字母排列）
   - 词族训练
   - 错音专项训练

### Phase 3 - 增强（建议 2-4 周）

4. **音频资源准备**
   - 录制 26 个字母音 + 65 个单词发音
   - 准备单词配图

5. **语音评测接入**
   - 对接腾讯云 ASR 或微信同声传译插件
   - 实现音素级别的评测

6. **后端 API**
   - 用户系统（登录/注册）
   - 学习记录云端同步
   - 家长报告数据统计

7. **多孩账号**
   - 家长切换孩子
   - 独立学习进度

---

## License

MIT
