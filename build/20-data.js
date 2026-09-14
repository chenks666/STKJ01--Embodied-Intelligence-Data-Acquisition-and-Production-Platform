/* ============================================================
   模拟数据 · 全部取自产品设计文档第 6/7/8 章与附录 B、C
   仅用于原型演示，客户与项目名称均为虚构代号
   ============================================================ */
(function () {
  /* ---------- 八个业务域与信息架构（源：5.2） ---------- */
  const DOMAINS = [{
    id: "production",
    name: "生产",
    icon: "production",
    color: "var(--domain-a)",
    children: [{
      id: "overview",
      name: "总览看板",
      tag: ""
    }, {
      id: "tasks",
      name: "任务",
      tag: "9"
    }, {
      id: "batches",
      name: "批次",
      tag: "24"
    }, {
      id: "upload",
      name: "上传与校验",
      tag: "3",
      badge: "danger"
    }, {
      id: "search",
      name: "检索与取数",
      tag: ""
    }]
  }, {
    id: "quality",
    name: "质量",
    icon: "quality",
    color: "var(--domain-d)",
    children: [{
      id: "qcqueue",
      name: "待办队列",
      tag: "187",
      badge: "danger"
    }, {
      id: "qc",
      name: "质检台",
      tag: ""
    }, {
      id: "rules",
      name: "规则配置",
      tag: ""
    }]
  }, {
    id: "annotate",
    name: "标注",
    icon: "annotate",
    color: "var(--domain-c)",
    children: [{
      id: "annotasks",
      name: "标注任务",
      tag: "12"
    }, {
      id: "workbench",
      name: "标注工作台",
      tag: ""
    }, {
      id: "qcanon",
      name: "标注质检",
      tag: "5"
    }]
  }, {
    id: "dataset",
    name: "数据集",
    icon: "dataset",
    color: "var(--domain-e)",
    children: [{
      id: "recipes",
      name: "配方库",
      tag: "7"
    }, {
      id: "recipe",
      name: "配方编辑器",
      tag: ""
    }, {
      id: "snapshots",
      name: "快照与版本",
      tag: "14"
    }, {
      id: "delivery",
      name: "导出与交付",
      tag: "2"
    }, {
      id: "api",
      name: "开放接口",
      tag: "v1"
    }]
  }, {
    id: "sim",
    name: "仿真",
    icon: "sim",
    color: "var(--domain-f)",
    children: [{
      id: "simgate",
      name: "仿真接入",
      tag: "3"
    }, {
      id: "simgens",
      name: "生成任务",
      tag: "6"
    }, {
      id: "simblend",
      name: "虚实融合配比",
      tag: ""
    }]
  }, {
    id: "board",
    name: "看板",
    icon: "chart",
    color: "var(--domain-b)",
    children: [{
      id: "board",
      name: "四类视图",
      tag: ""
    }]
  }, {
    id: "safety",
    name: "安全",
    icon: "security",
    color: "var(--domain-c)",
    children: [{
      id: "keys",
      name: "加密与密钥",
      tag: ""
    }, {
      id: "lifecycle",
      name: "生命周期与销毁",
      tag: ""
    }, {
      id: "watermark",
      name: "水印与溯源",
      tag: ""
    }]
  }, {
    id: "config",
    name: "配置",
    icon: "settings",
    color: "var(--domain-g)",
    children: [{
      id: "specs",
      name: "规格模板",
      tag: "11"
    }, {
      id: "devices",
      name: "本体与设备台账",
      tag: "38"
    }, {
      id: "contract",
      name: "接入契约",
      tag: "3"
    }, {
      id: "people",
      name: "点位与人员",
      tag: ""
    }, {
      id: "perms",
      name: "权限与角色",
      tag: ""
    }, {
      id: "audit",
      name: "审计日志",
      tag: ""
    }]
  }];

  /* ---------- 任务列表（源：8.3 列定义） ---------- */
  const TASKS = [{
    id: "TK-2409-011",
    name: "厨房台面折叠衣物（Ego）",
    customer: "恒立机器人",
    code: "B01",
    scene: "厨房 / 台面",
    spec: "EGO-KITCH-02 v1.2",
    embodiment: "人形 · 双臂",
    mode: "示教采集",
    progress: 0.86,
    plan: 1200,
    done: 1032,
    batches: "6 / 7",
    pass1: 0.913,
    pass1d: -0.021,
    due: "09-19",
    status: "采集中",
    risk: "warn",
    owner: "项目经理",
    updated: "12 分钟前",
    steps: [{
      k: "创建",
      t: "09-11 09:20",
      who: "项目经理",
      out: "任务 TK-2409-011",
      st: "done",
      note: "引用规格模板 EGO-KITCH-02 v1.2，已冻结。"
    }, {
      k: "已下发",
      t: "09-11 09:41",
      who: "项目经理",
      out: "任务卡推送至 3 台采集端",
      st: "done",
      note: ""
    }, {
      k: "已确认",
      t: "09-11 10:02",
      who: "采集员 A",
      out: "确认接收",
      st: "done",
      note: "用时 21 分钟。"
    }, {
      k: "采集中",
      t: "09-11 10:30 起",
      who: "采集员 A / 采集员 B / 采集员 C",
      out: "已上传 1 032 / 1 200 条",
      st: "active",
      note: "点位 K2 今日设备时间同步告警 1 次，已现场解除。"
    }, {
      k: "上传中",
      t: "持续",
      who: "系统",
      out: "队列 3 条待校验",
      st: "active",
      note: "1 条疑似重复待裁决。"
    }, {
      k: "质检中",
      t: "09-12 14:00 起",
      who: "质检员",
      out: "已判定 812 条",
      st: "active",
      note: ""
    }, {
      k: "标注中",
      t: "09-13 09:00 起",
      who: "标注组 5 人",
      out: "已提交 610 条",
      st: "active",
      note: ""
    }, {
      k: "待建集",
      t: "—",
      who: "—",
      out: "—",
      st: "wait",
      note: ""
    }, {
      k: "已交付",
      t: "—",
      who: "—",
      out: "—",
      st: "wait",
      note: ""
    }, {
      k: "插入事件 · 一次通过率下滑",
      t: "09-13 16:40",
      who: "系统",
      out: "回采任务 RT-0031",
      st: "insert",
      note: "原因码 RC-0101 手部出画 在同一任务累计出现 4 次，已触发规格复核提醒。"
    }]
  }, {
    id: "TK-2409-010",
    name: "仓储料箱分拣（触发式）",
    customer: "瀚海工业",
    code: "B02",
    scene: "仓储 / 分拣线",
    spec: "WH-SORT-05 v2.0",
    embodiment: "轮式 + 机械臂",
    mode: "触发式采集",
    progress: 1,
    plan: 800,
    done: 800,
    batches: "4 / 4",
    pass1: 0.948,
    pass1d: 0.014,
    due: "09-15",
    status: "待建集",
    risk: "ok",
    owner: "项目经理",
    updated: "1 小时前",
    steps: []
  }, {
    id: "TK-2409-009",
    name: "螺丝锁付精细操作（力控）",
    customer: "拓元精密",
    code: "B03",
    scene: "产线 / 装配工位",
    spec: "ASM-SCREW-01 v1.0",
    embodiment: "机械臂 · 六轴",
    mode: "自动回放采集",
    progress: 0.42,
    plan: 1500,
    done: 630,
    batches: "2 / 6",
    pass1: 0.771,
    pass1d: -0.063,
    due: "09-22",
    status: "质检中",
    risk: "danger",
    owner: "项目经理",
    updated: "36 分钟前",
    steps: []
  }, {
    id: "TK-2409-008",
    name: "咖啡机操作全流程（Exo 三机位）",
    customer: "灵犀具身",
    code: "B04",
    scene: "商用厨房 / 吧台",
    spec: "KITCH-COFFEE-03 v1.4",
    embodiment: "人形 · 单手",
    mode: "示教采集",
    progress: 0.68,
    plan: 600,
    done: 408,
    batches: "3 / 5",
    pass1: 0.902,
    pass1d: 0.005,
    due: "09-20",
    status: "标注中",
    risk: "warn",
    owner: "项目经理",
    updated: "2 小时前",
    steps: []
  }, {
    id: "TK-2409-007",
    name: "线缆插拔（接触力曲线）",
    customer: "恒立机器人",
    code: "B01",
    scene: "实验台 / 电控柜",
    spec: "CABLE-INS-02 v1.1",
    embodiment: "灵巧手 · 三指",
    mode: "正负样本统一采集",
    progress: 0.55,
    plan: 900,
    done: 495,
    batches: "3 / 4",
    pass1: 0.864,
    pass1d: 0.031,
    due: "09-24",
    status: "采集中",
    risk: "ok",
    owner: "数据工程师",
    updated: "3 小时前",
    steps: []
  }, {
    id: "TK-2409-006",
    name: "柔性布料展开与对折",
    customer: "星穹智能",
    code: "B05",
    scene: "实验台 / 软体",
    spec: "SOFT-CLOTH-01 v1.0",
    embodiment: "人形 · 双臂",
    mode: "示教采集",
    progress: 0.94,
    plan: 400,
    done: 376,
    batches: "5 / 5",
    pass1: 0.838,
    pass1d: -0.012,
    due: "09-16",
    status: "质检中",
    risk: "warn",
    owner: "数据工程师",
    updated: "5 小时前",
    steps: []
  }, {
    id: "TK-2409-005",
    name: "四足巡检越障轨迹",
    customer: "瀚海工业",
    code: "B02",
    scene: "户外 / 阶梯碎石",
    spec: "QUAD-TRAV-04 v2.1",
    embodiment: "四足",
    mode: "遥操作",
    progress: 1,
    plan: 500,
    done: 500,
    batches: "3 / 3",
    pass1: 0.965,
    pass1d: 0.008,
    due: "09-12",
    status: "已交付",
    risk: "ok",
    owner: "项目经理",
    updated: "昨天",
    steps: []
  }, {
    id: "TK-2409-004",
    name: "抓取失败样本专项采集",
    customer: "恒立机器人",
    code: "B01",
    scene: "桌面 / 多物体",
    spec: "GRASP-NEG-01 v1.0",
    embodiment: "人形 · 双臂",
    mode: "正负样本统一采集",
    progress: 0.33,
    plan: 600,
    done: 198,
    batches: "1 / 3",
    pass1: 0.884,
    pass1d: 0.042,
    due: "09-18",
    status: "采集中",
    risk: "ok",
    owner: "项目经理",
    updated: "12 分钟前",
    steps: []
  }, {
    id: "TK-2409-003",
    name: "冰箱取物长时序任务",
    customer: "灵犀具身",
    code: "B04",
    scene: "厨房 / 冰箱",
    spec: "KITCH-FRIDGE-02 v1.0",
    embodiment: "人形 · 双臂",
    mode: "示教采集",
    progress: 0.21,
    plan: 1000,
    done: 210,
    batches: "1 / 6",
    pass1: 0.921,
    pass1d: 0.009,
    due: "09-27",
    status: "已下发",
    risk: "ok",
    owner: "数据工程师",
    updated: "6 小时前",
    steps: []
  }];

  /* ---------- 看板指标（源：8.2 顶部指标带） ---------- */
  const METRICS = [{
    k: "在产任务",
    v: "6",
    u: "个",
    foot: "其中 2 个存在交期风险",
    spark: [4, 5, 5, 6, 7, 6, 6],
    tone: ""
  }, {
    k: "今日上传量",
    v: "1 486",
    u: "条",
    foot: "较昨日 +12.4%",
    delta: "up",
    spark: [980, 1120, 1240, 1180, 1310, 1402, 1486]
  }, {
    k: "一次通过率",
    v: "88.7",
    u: "%",
    foot: "较昨日 −1.8 pt · 目标 ≥ 92",
    delta: "down",
    spark: [93, 92.4, 91, 91.8, 90.2, 90.5, 88.7],
    tone: "warn"
  }, {
    k: "待办质检",
    v: "187",
    u: "条",
    foot: "预计耗时 2 小时 40 分",
    spark: [90, 120, 140, 155, 170, 181, 187],
    tone: "warn"
  }];

  /* ---------- 风险列表（源：8.2 设计要点：每项带建议动作与责任角色） ---------- */
  const RISKS = [{
    lv: "danger",
    title: "TK-2409-009 螺丝锁付 一次通过率 77.1%，低于任务卡阈值 85%",
    desc: "近 24 小时驳回 96 条，集中原因码 RC-0301 静止过长（44 条）与 RC-0102 动作未闭合（31 条）。",
    act: "建议动作：暂停派工，回溯规格模板 ASM-SCREW-01 的静止段阈值并组织复训。",
    who: "项目经理"
  }, {
    lv: "danger",
    title: "上传队列 3 条卡在自动校验，其中 1 条疑似重复待裁决",
    desc: "批次 BAT-2409-0116 的 3 条数据在去重环节进入待裁决列表，已挂起 4 小时。",
    act: "建议动作：进入上传与校验中心完成并排对比裁决。",
    who: "采集员 A"
  }, {
    lv: "warn",
    title: "点位 K2 设备时间同步偏差告警 1 次（今日）",
    desc: "主时钟源抖动导致同步偏差 1.8 帧，超过 QC-SYNC-01 阈值 1 帧，录制被阻塞 4 分钟后解除。",
    act: "建议动作：核查 K2 交换机 PTP 配置，若 24 小时内再次发生则更换时钟源。",
    who: "现场督导"
  }, {
    lv: "warn",
    title: "TK-2409-011 原因码 RC-0101 手部出画累计 4 次，触发规格复核提醒",
    desc: "同一原因码在同一任务重复出现超过 3 次，判定为规格或培训问题而非个体问题。",
    act: "建议动作：回溯规格模板的机位建议，或将机位从肩部改为头部。",
    who: "质量负责人"
  }, {
    lv: "info",
    title: "TK-2409-011 距交付日期 5 天，剩余 168 条未采",
    desc: "近 3 日日均产出 96 条，按现速预计 09-19 前可完成，无缓冲。",
    act: "建议动作：为点位 K3 增派 1 名采集员以建立缓冲。",
    who: "项目经理"
  }];

  /* ---------- 驳回原因分布（源：附录 C 原因码字典） ---------- */
  const REJECT_DIST = [{
    code: "RC-0301",
    name: "静止过长",
    n: 96,
    pct: 0.24
  }, {
    code: "RC-0101",
    name: "手部出画",
    n: 71,
    pct: 0.18
  }, {
    code: "RC-0102",
    name: "动作未闭合",
    n: 58,
    pct: 0.15
  }, {
    code: "RC-0201",
    name: "时间戳错位",
    n: 44,
    pct: 0.11
  }, {
    code: "RC-0303",
    name: "过曝 / 欠曝",
    n: 39,
    pct: 0.10
  }, {
    code: "RC-0302",
    name: "遮挡严重",
    n: 33,
    pct: 0.08
  }, {
    code: "RC-0401",
    name: "字段缺失",
    n: 27,
    pct: 0.07
  }, {
    code: "RC-0501",
    name: "人像未脱敏",
    n: 11,
    pct: 0.03
  }, {
    code: "RC-0304",
    name: "目标不可见",
    n: 16,
    pct: 0.04
  }];

  /* ---------- 上传与自动校验（源：7.3） ---------- */
  const UPLOAD_ROWS = [{
    id: "CLP-88412",
    task: "TK-2409-011",
    batch: "BAT-2409-0116",
    size: "2.4 GB",
    dur: "6:12",
    step: "通过",
    state: "ok",
    conf: 0.98,
    note: "六项校验全部通过，已进入生产队列。"
  }, {
    id: "CLP-88413",
    task: "TK-2409-011",
    batch: "BAT-2409-0116",
    size: "1.9 GB",
    dur: "5:48",
    step: "有条件通过",
    state: "warn",
    conf: 0.94,
    note: "轻微过曝帧占比 6.1%（阈值 5%），可按有条件通过放行并留痕。",
    evidences: [{
      k: "过曝帧占比",
      v: "6.1% > 5%",
      rule: "QC-LIGHT-01",
      jump: "帧 02:14.860",
      t: 0.372
    }, {
      k: "平均亮度",
      v: "0.82（区间 0.25–0.78）",
      rule: "QC-LIGHT-01",
      jump: "帧 03:40.120",
      t: 0.61
    }]
  }, {
    id: "CLP-88414",
    task: "TK-2409-011",
    batch: "BAT-2409-0116",
    size: "3.1 GB",
    dur: "8:04",
    step: "不通过",
    state: "danger",
    conf: 0.41,
    note: "两项阻断级问题，判定不通过，需生成重采任务。",
    evidences: [{
      k: "有效帧占比",
      v: "71.3% < 80%",
      rule: "QC-FRAME-01",
      jump: "帧 00:48.220",
      t: 0.10
    }, {
      k: "目标可见率",
      v: "63.5% < 70%",
      rule: "QC-VIS-01",
      jump: "帧 05:12.400",
      t: 0.65
    }, {
      k: "观测与动作时序偏差",
      v: "超阈 2.4 帧",
      rule: "QC-ALIGN-01",
      jump: "帧 05:12.400",
      t: 0.65
    }]
  }, {
    id: "CLP-88415",
    task: "TK-2409-011",
    batch: "BAT-2409-0116",
    size: "2.2 GB",
    dur: "5:30",
    step: "待裁决",
    state: "review",
    conf: 0.96,
    dup: true,
    note: "与库内 CLP-87120 相似度 0.972，超过阈值 0.95，进入待裁决列表。",
    evidences: [{
      k: "内容相似度",
      v: "0.972 > 0.95",
      rule: "QC-DUP-01",
      jump: "对比视图",
      t: 0.42
    }]
  }, {
    id: "CLP-88416",
    task: "TK-2409-011",
    batch: "BAT-2409-0116",
    size: "2.6 GB",
    dur: "6:44",
    step: "通过",
    state: "ok",
    conf: 0.99,
    note: "指纹命中，秒传完成，已通过。"
  }, {
    id: "CLP-88417",
    task: "TK-2409-010",
    batch: "BAT-2409-0115",
    size: "4.8 GB",
    dur: "11:20",
    step: "待补校验",
    state: "review",
    conf: 0,
    note: "校验服务于 11:42 出现异常，本条标记为待补校验而非不通过，服务恢复后自动重跑。"
  }, {
    id: "CLP-88418",
    task: "TK-2409-009",
    batch: "BAT-2409-0114",
    size: "18.6 GB",
    dur: "26:40",
    step: "旁路通道",
    state: "warn",
    conf: 0,
    note: "超出浏览器上传阈值 8 GB，未进入上传队列，转对象存储直传。"
  }];

  /* ---------- 质检待办队列（源：7.4） ---------- */
  const QC_QUEUE = [{
    id: "CLP-88402",
    task: "TK-2409-009",
    scene: "装配工位",
    emp: "采集员 B",
    risk: "high",
    dur: "07:24",
    machine: [{
      t: 0.18,
      kind: "danger",
      label: "静止过长 3.6s"
    }, {
      t: 0.62,
      kind: "warn",
      label: "遮挡"
    }],
    score: null,
    done: false
  }, {
    id: "CLP-88403",
    task: "TK-2409-009",
    scene: "装配工位",
    emp: "采集员 B",
    risk: "high",
    dur: "06:51",
    machine: [{
      t: 0.31,
      kind: "danger",
      label: "动作未闭合"
    }],
    score: null,
    done: false
  }, {
    id: "CLP-88404",
    task: "TK-2409-011",
    scene: "厨房台面",
    emp: "采集员 A",
    risk: "mid",
    dur: "06:12",
    machine: [{
      t: 0.44,
      kind: "warn",
      label: "过曝"
    }],
    score: null,
    done: false
  }, {
    id: "CLP-88405",
    task: "TK-2409-011",
    scene: "厨房台面",
    emp: "采集员 A",
    risk: "mid",
    dur: "05:48",
    machine: [],
    score: null,
    done: false
  }, {
    id: "CLP-88406",
    task: "TK-2409-006",
    scene: "软体实验台",
    emp: "采集员 C",
    risk: "mid",
    dur: "08:10",
    machine: [{
      t: 0.22,
      kind: "warn",
      label: "遮挡"
    }, {
      t: 0.77,
      kind: "warn",
      label: "欠曝"
    }],
    score: 3,
    done: true
  }, {
    id: "CLP-88407",
    task: "TK-2409-006",
    scene: "软体实验台",
    emp: "采集员 C",
    risk: "mid",
    dur: "07:02",
    machine: [{
      t: 0.55,
      kind: "danger",
      label: "有效帧不足"
    }],
    score: null,
    done: false
  }, {
    id: "CLP-88408",
    task: "TK-2409-008",
    scene: "吧台",
    emp: "现场督导",
    risk: "low",
    dur: "05:19",
    machine: [],
    score: null,
    done: false
  }, {
    id: "CLP-88409",
    task: "TK-2409-008",
    scene: "吧台",
    emp: "现场督导",
    risk: "low",
    dur: "06:33",
    machine: [{
      t: 0.68,
      kind: "warn",
      label: "同步偏差"
    }],
    score: null,
    done: false
  }, {
    id: "CLP-88410",
    task: "TK-2409-007",
    scene: "电控柜",
    emp: "采集员 C",
    risk: "low",
    dur: "09:02",
    machine: [],
    score: null,
    done: false
  }, {
    id: "CLP-88411",
    task: "TK-2409-007",
    scene: "电控柜",
    emp: "采集员 C",
    risk: "low",
    dur: "08:44",
    machine: [{
      t: 0.36,
      kind: "warn",
      label: "力值异常"
    }],
    score: null,
    done: false
  }];

  /* ---------- 原因码字典（源：附录 C，两级结构 + 处置建议） ---------- */
  const REASON_CODES = [{
    group: "采集操作类",
    seg: "RC-01xx",
    items: [{
      code: "RC-0101",
      name: "手部出画",
      advice: "重采该步，调整站位或将机位由肩部下移至胸部；同步核对机位建议。"
    }, {
      code: "RC-0102",
      name: "动作未闭合",
      advice: "重采该步，确保抓取后完成放置或明确释放，不得中途结束录制。"
    }, {
      code: "RC-0103",
      name: "站位错误",
      advice: "重采该步，按 SOP 图例回到标记站位线内。"
    }, {
      code: "RC-0104",
      name: "操作顺序不符",
      advice: "重采该步，按 SOP 步骤清单顺序执行。"
    }]
  }, {
    group: "同步与标定类",
    seg: "RC-02xx",
    items: [{
      code: "RC-0201",
      name: "时间戳错位",
      advice: "转现场督导处理：核查主时钟源与 PTP 配置，重跑时间同步后重采。"
    }, {
      code: "RC-0202",
      name: "标定过期",
      advice: "联系督导更新内参与外参标定文件，更新后重采该批次。"
    }, {
      code: "RC-0203",
      name: "坐标系不一致",
      advice: "转数据工程确认坐标系配置，禁止放行以防污染训练集。"
    }]
  }, {
    group: "内容质量类",
    seg: "RC-03xx",
    items: [{
      code: "RC-0301",
      name: "静止过长",
      advice: "重采该步，减少无效等待；如为工艺必须则申请放宽规格阈值并留痕。"
    }, {
      code: "RC-0302",
      name: "遮挡严重",
      advice: "重采该步，调整本体或物体相对位置，保证目标可见率高于规格下限。"
    }, {
      code: "RC-0303",
      name: "过曝 / 欠曝",
      advice: "可判有条件通过并留痕；若超过 3 个片段则作为点位照明整改项。"
    }, {
      code: "RC-0304",
      name: "目标不可见",
      advice: "重采该步，核对物体摆放是否偏离采集区域。"
    }]
  }, {
    group: "元数据与命名类",
    seg: "RC-04xx",
    items: [{
      code: "RC-0401",
      name: "字段缺失",
      advice: "无需重采，批量补录缺失字段后重新提交校验。"
    }, {
      code: "RC-0402",
      name: "命名不合规",
      advice: "无需重采，按命名规范批量重命名后重新提交。"
    }, {
      code: "RC-0403",
      name: "场景标签错误",
      advice: "无需重采，更正场景标签；同一采集员重复出现则进入复训流程。"
    }]
  }, {
    group: "合规与安全类",
    seg: "RC-05xx",
    items: [{
      code: "RC-0501",
      name: "人像未脱敏",
      advice: "阻塞级：不得放行。重跑脱敏算子，确认画面内人脸与工牌均已打码。"
    }, {
      code: "RC-0502",
      name: "工牌可见",
      advice: "阻塞级：重跑脱敏算子或重采，并核查该点位是否处于越权场景。"
    }, {
      code: "RC-0503",
      name: "越权场景采集",
      advice: "阻塞级：立即冻结批次并上报项目负责人与安全负责人联合处置。"
    }]
  }];

  /* ---------- 质检规则库（源：附录 B，含设计与实测两栏） ---------- */
  const RULES = [{
    code: "QC-SYNC-01",
    dim: "同步",
    logic: "多路时间戳最大偏差",
    val: 1,
    unit: "帧",
    op: ">",
    action: "驳回",
    on: true,
    hit7: 0,
    rate7: 0.004
  }, {
    code: "QC-FRAME-01",
    dim: "完整性",
    logic: "有效帧占比",
    val: 80,
    unit: "%",
    op: "<",
    action: "驳回",
    on: true,
    hit7: 64,
    rate7: 0.026
  }, {
    code: "QC-FRAME-02",
    dim: "完整性",
    logic: "丢帧率",
    val: 2,
    unit: "%",
    op: ">",
    action: "驳回",
    on: true,
    hit7: 12,
    rate7: 0.005
  }, {
    code: "QC-VIS-01",
    dim: "可见性",
    logic: "目标可见率",
    val: 70,
    unit: "%",
    op: "<",
    action: "驳回",
    on: true,
    hit7: 41,
    rate7: 0.017
  }, {
    code: "QC-MOT-01",
    dim: "内容",
    logic: "静止段占比",
    val: 30,
    unit: "%",
    op: ">",
    action: "驳回",
    on: true,
    hit7: 96,
    rate7: 0.039
  }, {
    code: "QC-MOT-02",
    dim: "内容",
    logic: "轨迹加速度突变",
    val: 12,
    unit: "m/s²",
    op: ">",
    action: "转复核",
    on: true,
    hit7: 28,
    rate7: 0.011
  }, {
    code: "QC-ACT-01",
    dim: "内容",
    logic: "动作完整性（闭合 / 释放）",
    val: 0,
    unit: "—",
    op: "=",
    action: "驳回",
    on: true,
    hit7: 58,
    rate7: 0.024
  }, {
    code: "QC-META-01",
    dim: "元数据",
    logic: "必填字段缺失",
    val: 0,
    unit: "项",
    op: ">",
    action: "阻塞",
    on: true,
    hit7: 27,
    rate7: 0.011
  }, {
    code: "QC-NAME-01",
    dim: "命名",
    logic: "命名规范符合性",
    val: 1,
    unit: "—",
    op: "≠",
    action: "阻塞",
    on: true,
    hit7: 9,
    rate7: 0.004
  }, {
    code: "QC-DUP-01",
    dim: "重复",
    logic: "与库内数据相似度",
    val: 0.95,
    unit: "—",
    op: ">",
    action: "转复核",
    on: true,
    hit7: 17,
    rate7: 0.007
  }, {
    code: "QC-CAL-01",
    dim: "标定",
    logic: "标定文件存在且未过期",
    val: 0,
    unit: "天",
    op: ">",
    action: "驳回",
    on: true,
    hit7: 3,
    rate7: 0.001
  }, {
    code: "QC-PRIV-01",
    dim: "合规",
    logic: "检出人像或工牌未脱敏",
    val: 0,
    unit: "项",
    op: ">",
    action: "阻塞",
    on: true,
    hit7: 11,
    rate7: 0.004
  }, {
    code: "QC-LIGHT-01",
    dim: "成像",
    logic: "过曝或欠曝帧占比",
    val: 5,
    unit: "%",
    op: ">",
    action: "转复核",
    on: true,
    hit7: 39,
    rate7: 0.016
  }, {
    code: "QC-OCC-01",
    dim: "遮挡",
    logic: "目标被遮挡时长占比",
    val: 15,
    unit: "%",
    op: ">",
    action: "转复核",
    on: true,
    hit7: 33,
    rate7: 0.013
  }, {
    code: "QC-BLUR-01",
    dim: "成像",
    logic: "图像清晰度（拉普拉斯方差）",
    val: 120,
    unit: "—",
    op: "<",
    action: "驳回",
    on: true,
    hit7: 8,
    rate7: 0.003
  }, {
    code: "QC-PCD-01",
    dim: "完整性",
    logic: "点云残缺率",
    val: 22,
    unit: "%",
    op: ">",
    action: "驳回",
    on: true,
    hit7: 6,
    rate7: 0.002
  }, {
    code: "QC-FORCE-01",
    dim: "有效性",
    logic: "力矩或末端位姿异常值占比",
    val: 3,
    unit: "%",
    op: ">",
    action: "驳回",
    on: true,
    hit7: 14,
    rate7: 0.006
  }, {
    code: "QC-ALIGN-01",
    dim: "一致性",
    logic: "观测与动作的时序及空间偏差",
    val: 2,
    unit: "帧",
    op: ">",
    action: "驳回",
    on: true,
    hit7: 22,
    rate7: 0.009
  }, {
    code: "QC-NOISE-01",
    dim: "有效性",
    logic: "传感器噪声水平",
    val: 0.08,
    unit: "σ",
    op: ">",
    action: "转复核",
    on: true,
    hit7: 19,
    rate7: 0.008
  }, {
    code: "QC-LEAK-01",
    dim: "划分",
    logic: "训练集与验证集场景重叠率",
    val: 0,
    unit: "%",
    op: ">",
    action: "阻塞",
    on: true,
    hit7: 0,
    rate7: 0
  }];

  /* ---------- 语义检索语料（源：7.7） ----------
     语料库覆盖平台全部 9 类「场景 / 技能」，与「任务」域对齐；
     质量分层与「质检」域对齐。检索页按查询真实过滤这份语料，不是固定展示。 */
  const SEARCH_HITS = [/* —— 厨房 / 台面 · 折叠衣物 · 人形 · 双臂 —— */
  {
    id: "CLP-81204",
    scene: "厨房 / 台面",
    embody: "人形 · 双臂",
    skill: "折叠衣物",
    emb: "Ego",
    dur: "06:12",
    q: "优质",
    score: 92,
    time: "09-11 14:22",
    emp: "采集员 A",
    tags: ["叠衣服", "失败", "厨房"]
  }, {
    id: "CLP-81206",
    scene: "厨房 / 台面",
    embody: "人形 · 双臂",
    skill: "折叠衣物",
    emb: "Ego",
    dur: "05:41",
    q: "边缘难例",
    score: 71,
    time: "09-11 14:36",
    emp: "采集员 A",
    tags: ["叠衣服", "失败", "厨房"]
  }, {
    id: "CLP-81211",
    scene: "厨房 / 台面",
    embody: "人形 · 双臂",
    skill: "折叠衣物",
    emb: "Ego",
    dur: "07:03",
    q: "优质",
    score: 88,
    time: "09-11 15:02",
    emp: "采集员 B",
    tags: ["叠衣服", "失败", "布料"]
  }, {
    id: "CLP-81220",
    scene: "厨房 / 台面",
    embody: "人形 · 双臂",
    skill: "折叠衣物",
    emb: "Exo",
    dur: "06:05",
    q: "优质",
    score: 95,
    time: "09-11 16:11",
    emp: "采集员 B",
    tags: ["叠衣服", "成功", "厨房"]
  }, {
    id: "CLP-81226",
    scene: "厨房 / 台面",
    embody: "人形 · 双臂",
    skill: "折叠衣物",
    emb: "Ego",
    dur: "05:22",
    q: "边缘难例",
    score: 66,
    time: "09-11 16:44",
    emp: "采集员 A",
    tags: ["叠衣服", "失败", "滑移"]
  }, {
    id: "CLP-81233",
    scene: "厨房 / 台面",
    embody: "人形 · 双臂",
    skill: "折叠衣物",
    emb: "Ego",
    dur: "06:31",
    q: "优质",
    score: 90,
    time: "09-12 09:18",
    emp: "采集员 A",
    tags: ["叠衣服", "失败", "厨房"]
  }, {
    id: "CLP-81238",
    scene: "厨房 / 台面",
    embody: "人形 · 双臂",
    skill: "折叠衣物",
    emb: "Ego",
    dur: "05:58",
    q: "优质",
    score: 86,
    time: "09-12 09:51",
    emp: "采集员 B",
    tags: ["叠衣服", "失败", "抓取失败"]
  }, {
    id: "CLP-81241",
    scene: "厨房 / 台面",
    embody: "人形 · 双臂",
    skill: "折叠衣物",
    emb: "Ego",
    dur: "07:44",
    q: "优质",
    score: 91,
    time: "09-12 10:12",
    emp: "采集员 C",
    tags: ["叠衣服", "成功", "厨房"]
  }, {
    id: "CLP-81247",
    scene: "厨房 / 台面",
    embody: "人形 · 双臂",
    skill: "折叠衣物",
    emb: "Ego",
    dur: "06:20",
    q: "无效样本",
    score: 38,
    time: "09-12 10:40",
    emp: "采集员 C",
    tags: ["叠衣服", "失败", "遮挡"]
  }, /* —— 实验台 / 软体 · 布料展开对折 · 人形 · 双臂 —— */
  {
    id: "CLP-81215",
    scene: "实验台 / 软体",
    embody: "人形 · 双臂",
    skill: "布料展开对折",
    emb: "Ego",
    dur: "06:48",
    q: "无效样本",
    score: 34,
    time: "09-11 15:30",
    emp: "采集员 C",
    tags: ["布料", "失败", "遮挡"]
  }, {
    id: "CLP-81252",
    scene: "实验台 / 软体",
    embody: "人形 · 双臂",
    skill: "布料展开对折",
    emb: "Ego",
    dur: "08:04",
    q: "优质",
    score: 84,
    time: "09-12 11:05",
    emp: "采集员 B",
    tags: ["布料", "成功", "柔性"]
  }, {
    id: "CLP-81258",
    scene: "实验台 / 软体",
    embody: "人形 · 双臂",
    skill: "布料展开对折",
    emb: "Exo",
    dur: "07:26",
    q: "边缘难例",
    score: 68,
    time: "09-12 11:38",
    emp: "采集员 B",
    tags: ["布料", "失败", "滑移"]
  }, /* —— 仓储 / 分拣线 · 分拣料箱 · 轮式 + 机械臂 —— */
  {
    id: "CLP-81301",
    scene: "仓储 / 分拣线",
    embody: "轮式 + 机械臂",
    skill: "分拣料箱",
    emb: "Exo",
    dur: "05:36",
    q: "优质",
    score: 93,
    time: "09-12 13:10",
    emp: "采集员 A",
    tags: ["分拣", "成功", "仓储"]
  }, {
    id: "CLP-81305",
    scene: "仓储 / 分拣线",
    embody: "轮式 + 机械臂",
    skill: "分拣料箱",
    emb: "Exo",
    dur: "06:02",
    q: "优质",
    score: 89,
    time: "09-12 13:44",
    emp: "采集员 C",
    tags: ["分拣", "成功", "料箱"]
  }, {
    id: "CLP-81309",
    scene: "仓储 / 分拣线",
    embody: "轮式 + 机械臂",
    skill: "分拣料箱",
    emb: "Exo",
    dur: "05:18",
    q: "边缘难例",
    score: 72,
    time: "09-12 14:05",
    emp: "采集员 A",
    tags: ["分拣", "失败", "料箱"]
  }, {
    id: "CLP-81314",
    scene: "仓储 / 分拣线",
    embody: "轮式 + 机械臂",
    skill: "分拣料箱",
    emb: "Exo",
    dur: "04:52",
    q: "无效样本",
    score: 41,
    time: "09-12 14:31",
    emp: "采集员 C",
    tags: ["分拣", "失败", "漏抓"]
  }, /* —— 产线 / 装配工位 · 螺丝锁付 · 机械臂 · 六轴 —— */
  {
    id: "CLP-81342",
    scene: "产线 / 装配工位",
    embody: "机械臂 · 六轴",
    skill: "螺丝锁付",
    emb: "Ego",
    dur: "07:12",
    q: "优质",
    score: 87,
    time: "09-12 15:02",
    emp: "采集员 B",
    tags: ["锁付", "成功", "力控"]
  }, {
    id: "CLP-81346",
    scene: "产线 / 装配工位",
    embody: "机械臂 · 六轴",
    skill: "螺丝锁付",
    emb: "Ego",
    dur: "06:40",
    q: "边缘难例",
    score: 63,
    time: "09-12 15:26",
    emp: "采集员 B",
    tags: ["锁付", "失败", "滑丝"]
  }, {
    id: "CLP-81351",
    scene: "产线 / 装配工位",
    embody: "机械臂 · 六轴",
    skill: "螺丝锁付",
    emb: "Ego",
    dur: "08:20",
    q: "优质",
    score: 82,
    time: "09-12 15:51",
    emp: "采集员 A",
    tags: ["锁付", "成功", "力控"]
  }, {
    id: "CLP-81355",
    scene: "产线 / 装配工位",
    embody: "机械臂 · 六轴",
    skill: "螺丝锁付",
    emb: "Ego",
    dur: "06:05",
    q: "无效样本",
    score: 36,
    time: "09-12 16:14",
    emp: "采集员 C",
    tags: ["锁付", "失败", "遮挡"]
  }, /* —— 实验台 / 电控柜 · 线缆插拔 · 灵巧手 · 三指 —— */
  {
    id: "CLP-81371",
    scene: "实验台 / 电控柜",
    embody: "灵巧手 · 三指",
    skill: "线缆插拔",
    emb: "Ego",
    dur: "06:26",
    q: "优质",
    score: 90,
    time: "09-13 09:12",
    emp: "采集员 A",
    tags: ["插拔", "成功", "接触力"]
  }, {
    id: "CLP-81375",
    scene: "实验台 / 电控柜",
    embody: "灵巧手 · 三指",
    skill: "线缆插拔",
    emb: "Ego",
    dur: "05:47",
    q: "边缘难例",
    score: 69,
    time: "09-13 09:38",
    emp: "采集员 A",
    tags: ["插拔", "失败", "对准"]
  }, {
    id: "CLP-81380",
    scene: "实验台 / 电控柜",
    embody: "灵巧手 · 三指",
    skill: "线缆插拔",
    emb: "Ego",
    dur: "07:03",
    q: "优质",
    score: 85,
    time: "09-13 10:05",
    emp: "采集员 C",
    tags: ["插拔", "成功", "接触力"]
  }, /* —— 商用厨房 / 吧台 · 咖啡机操作 · 人形 · 单手 —— */
  {
    id: "CLP-81401",
    scene: "商用厨房 / 吧台",
    embody: "人形 · 单手",
    skill: "咖啡机操作",
    emb: "Exo",
    dur: "06:58",
    q: "优质",
    score: 88,
    time: "09-13 10:41",
    emp: "采集员 B",
    tags: ["咖啡", "成功", "吧台"]
  }, {
    id: "CLP-81405",
    scene: "商用厨房 / 吧台",
    embody: "人形 · 单手",
    skill: "咖啡机操作",
    emb: "Exo",
    dur: "07:31",
    q: "边缘难例",
    score: 70,
    time: "09-13 11:06",
    emp: "采集员 B",
    tags: ["咖啡", "失败", "泼洒"]
  }, {
    id: "CLP-81409",
    scene: "商用厨房 / 吧台",
    embody: "人形 · 单手",
    skill: "咖啡机操作",
    emb: "Exo",
    dur: "06:14",
    q: "优质",
    score: 83,
    time: "09-13 11:32",
    emp: "采集员 C",
    tags: ["咖啡", "成功", "吧台"]
  }, /* —— 户外 / 阶梯碎石 · 四足越障 · 四足 —— */
  {
    id: "CLP-81431",
    scene: "户外 / 阶梯碎石",
    embody: "四足",
    skill: "四足越障",
    emb: "Ego",
    dur: "09:02",
    q: "优质",
    score: 94,
    time: "09-13 13:20",
    emp: "采集员 A",
    tags: ["越障", "成功", "阶梯"]
  }, {
    id: "CLP-81435",
    scene: "户外 / 阶梯碎石",
    embody: "四足",
    skill: "四足越障",
    emb: "Ego",
    dur: "08:41",
    q: "优质",
    score: 88,
    time: "09-13 13:48",
    emp: "采集员 C",
    tags: ["越障", "成功", "碎石"]
  }, {
    id: "CLP-81439",
    scene: "户外 / 阶梯碎石",
    embody: "四足",
    skill: "四足越障",
    emb: "Ego",
    dur: "07:55",
    q: "边缘难例",
    score: 67,
    time: "09-13 14:12",
    emp: "采集员 C",
    tags: ["越障", "失败", "打滑"]
  }, /* —— 桌面 / 多物体 · 抓取 · 人形 · 双臂 —— */
  {
    id: "CLP-81461",
    scene: "桌面 / 多物体",
    embody: "人形 · 双臂",
    skill: "抓取",
    emb: "Ego",
    dur: "05:44",
    q: "优质",
    score: 91,
    time: "09-13 14:55",
    emp: "采集员 A",
    tags: ["抓取", "成功", "多物体"]
  }, {
    id: "CLP-81465",
    scene: "桌面 / 多物体",
    embody: "人形 · 双臂",
    skill: "抓取",
    emb: "Ego",
    dur: "06:09",
    q: "边缘难例",
    score: 64,
    time: "09-13 15:18",
    emp: "采集员 B",
    tags: ["抓取", "失败", "滑脱"]
  }, {
    id: "CLP-81469",
    scene: "桌面 / 多物体",
    embody: "人形 · 双臂",
    skill: "抓取",
    emb: "Ego",
    dur: "05:26",
    q: "无效样本",
    score: 39,
    time: "09-13 15:40",
    emp: "采集员 B",
    tags: ["抓取", "失败", "碰撞"]
  }, {
    id: "CLP-81473",
    scene: "桌面 / 多物体",
    embody: "人形 · 双臂",
    skill: "抓取",
    emb: "Exo",
    dur: "06:33",
    q: "优质",
    score: 86,
    time: "09-13 16:02",
    emp: "采集员 C",
    tags: ["抓取", "成功", "多物体"]
  }, /* —— 厨房 / 冰箱 · 冰箱取物 · 人形 · 双臂 —— */
  {
    id: "CLP-81491",
    scene: "厨房 / 冰箱",
    embody: "人形 · 双臂",
    skill: "冰箱取物",
    emb: "Exo",
    dur: "09:18",
    q: "优质",
    score: 89,
    time: "09-13 16:40",
    emp: "采集员 A",
    tags: ["取物", "成功", "长时序"]
  }, {
    id: "CLP-81495",
    scene: "厨房 / 冰箱",
    embody: "人形 · 双臂",
    skill: "冰箱取物",
    emb: "Exo",
    dur: "08:52",
    q: "边缘难例",
    score: 73,
    time: "09-13 17:05",
    emp: "采集员 B",
    tags: ["取物", "失败", "遮挡"]
  }, {
    id: "CLP-81499",
    scene: "厨房 / 冰箱",
    embody: "人形 · 双臂",
    skill: "冰箱取物",
    emb: "Exo",
    dur: "10:05",
    q: "优质",
    score: 84,
    time: "09-13 17:31",
    emp: "采集员 C",
    tags: ["取物", "成功", "长时序"]
  }, {
    id: "CLP-81503",
    scene: "厨房 / 冰箱",
    embody: "人形 · 双臂",
    skill: "冰箱取物",
    emb: "Ego",
    dur: "09:44",
    q: "优质",
    score: 81,
    time: "09-13 17:58",
    emp: "采集员 A",
    tags: ["取物", "成功", "冰箱"]
  }];

  /* ---------- 检索条件词表（自然语言解析与结构化筛选共用，单一口径） ----------
     每组：展示名 k / 条件键 key / 取值 v + 触发同义词 syn。
     检索页把自然语言 query 解析进这套词表；左侧筛选面板也由同一词表渲染，
     保证「说了什么」与「筛出什么」不会出现两套口径。 */
  const SEARCH_FACETS = [{
    k: "场景",
    key: "scene",
    vals: [{
      v: "厨房 / 台面",
      syn: ["厨房", "台面", "厨房台面"]
    }, {
      v: "厨房 / 冰箱",
      syn: ["冰箱"]
    }, {
      v: "商用厨房 / 吧台",
      syn: ["吧台", "商用厨房"]
    }, {
      v: "仓储 / 分拣线",
      syn: ["仓储", "分拣线", "分拣"]
    }, {
      v: "产线 / 装配工位",
      syn: ["产线", "装配", "工位"]
    }, {
      v: "实验台 / 电控柜",
      syn: ["电控柜"]
    }, {
      v: "实验台 / 软体",
      syn: ["软体", "柔性", "实验台"]
    }, {
      v: "户外 / 阶梯碎石",
      syn: ["户外", "阶梯", "碎石", "巡检"]
    }, {
      v: "桌面 / 多物体",
      syn: ["桌面", "多物体"]
    }]
  }, {
    k: "技能",
    key: "skill",
    vals: [{
      v: "折叠衣物",
      syn: ["折叠", "叠衣", "叠衣服", "对折"]
    }, {
      v: "冰箱取物",
      syn: ["取物", "拿取"]
    }, {
      v: "咖啡机操作",
      syn: ["咖啡"]
    }, {
      v: "分拣料箱",
      syn: ["分拣", "料箱", "分货"]
    }, {
      v: "螺丝锁付",
      syn: ["锁付", "螺丝", "拧紧", "力控"]
    }, {
      v: "线缆插拔",
      syn: ["插拔", "线缆", "接线", "对准"]
    }, {
      v: "布料展开对折",
      syn: ["布料", "展开"]
    }, {
      v: "四足越障",
      syn: ["越障", "四足"]
    }, {
      v: "抓取",
      syn: ["抓取", "夹取", "夹爪"]
    }]
  }, {
    k: "结果",
    key: "result",
    vals: [{
      v: "成功",
      syn: ["成功", "顺利"]
    }, {
      v: "失败",
      syn: ["失败", "不通过"]
    }]
  }, {
    k: "质量分层",
    key: "quality",
    vals: [{
      v: "优质",
      syn: ["优质", "高质量"]
    }, {
      v: "边缘难例",
      syn: ["边缘", "难例"]
    }, {
      v: "无效样本",
      syn: ["无效", "废片"]
    }]
  }, {
    k: "本体",
    key: "embody",
    vals: [{
      v: "人形 · 双臂",
      syn: ["双臂"]
    }, {
      v: "人形 · 单手",
      syn: ["单手"]
    }, {
      v: "机械臂 · 六轴",
      syn: ["六轴"]
    }, {
      v: "轮式 + 机械臂",
      syn: ["轮式"]
    }, {
      v: "灵巧手 · 三指",
      syn: ["灵巧手", "三指"]
    }, {
      v: "四足",
      syn: ["四足"]
    }]
  }, {
    k: "视角",
    key: "view",
    vals: [{
      v: "Ego",
      syn: ["ego", "第一人称"]
    }, {
      v: "Exo",
      syn: ["exo", "第三人称"]
    }]
  }];

  /* ---------- 标注任务与轨道（源：7.5 / 8.6） ---------- */
  const ANNO_CLIPS = [{
    id: "CLP-81204",
    name: "厨房台面 · 折叠衣物 #04",
    state: "标注中",
    conf: [0.96, 0.42, 0.91, 0.55, 0.88, 0.35, 0.94, 0.62, 0.90],
    pending: 3
  }, {
    id: "CLP-81205",
    name: "厨房台面 · 折叠衣物 #05",
    state: "待复核",
    conf: [0.9, 0.88, 0.86, 0.91, 0.87, 0.9, 0.85, 0.89, 0.92],
    pending: 0
  }, {
    id: "CLP-81206",
    name: "厨房台面 · 折叠衣物 #06",
    state: "未领取",
    conf: [0.7, 0.6, 0.5, 0.8, 0.55, 0.72, 0.48, 0.66, 0.58],
    pending: 0
  }, {
    id: "CLP-81207",
    name: "厨房台面 · 折叠衣物 #07",
    state: "已提交",
    conf: [0.95, 0.93, 0.94, 0.92, 0.96, 0.91, 0.93, 0.95, 0.92],
    pending: 0
  }];
  const ANNO_TRACKS = [{
    id: "action",
    name: "动作段",
    color: "var(--domain-c)",
    segs: [{
      s: 0.03,
      e: 0.14,
      label: "接近布料"
    }, {
      s: 0.16,
      e: 0.42,
      label: "抓取并展开"
    }, {
      s: 0.46,
      e: 0.72,
      label: "对折",
      ghost: false,
      conf: 0.42,
      low: true
    }, {
      s: 0.78,
      e: 0.96,
      label: "放置",
      conf: 0.94
    }]
  }, {
    id: "subtask",
    name: "子任务",
    color: "var(--accent)",
    segs: [{
      s: 0.03,
      e: 0.42,
      label: "展开布料"
    }, {
      s: 0.46,
      e: 0.96,
      label: "折叠布料"
    }]
  }, {
    id: "instruction",
    name: "指令",
    color: "var(--domain-e)",
    segs: [{
      s: 0.04,
      e: 0.41,
      label: "把毛巾平铺在台面上"
    }, {
      s: 0.47,
      e: 0.71,
      label: "把毛巾沿长边对折一次"
    }, {
      s: 0.79,
      e: 0.95,
      label: "把它放到右侧托盘"
    }]
  }, {
    id: "contact",
    name: "接触事件",
    color: "var(--warn)",
    segs: [{
      s: 0.17,
      e: 0.23,
      label: "接触建立"
    }, {
      s: 0.68,
      e: 0.70,
      label: "滑移"
    }, {
      s: 0.93,
      e: 0.95,
      label: "释放"
    }]
  }];
  const ANNO_NOTES = [{
    t: 0.31,
    frame: 128,
    who: "质检员",
    role: "标注质检",
    kind: "warn",
    text: "第 128 帧手部被毛巾遮挡，动作段边界建议以手指重新可见的第一帧为起点。"
  }, {
    t: 0.65,
    frame: 268,
    who: "质检员",
    role: "标注质检",
    kind: "review",
    text: "对折动作中途出现滑移，建议在此处拆分子段，或标注为失败样本。"
  }];

  /* ---------- 配方编辑器（源：7.6 / 8.7） ---------- */
  const RECIPE_PRESET = {
    nl: "厨房场景里叠衣服失败的那几条，只要质量分 70 以上、时长 5 秒到 8 秒的",
    conds: [{
      k: "场景",
      op: "包含",
      v: "厨房 / 台面",
      n: 4820
    }, {
      k: "技能",
      op: "等于",
      v: "折叠衣物",
      n: 1640
    }, {
      k: "结果",
      op: "等于",
      v: "失败",
      n: 386
    }, {
      k: "来源",
      op: "等于",
      v: "真实采集",
      n: 386
    }, {
      k: "质量分",
      op: "≥",
      v: "70",
      n: 341
    }, {
      k: "时长",
      op: "区间",
      v: "5.0s – 8.0s",
      n: 297
    }],
    hit: 297,
    hours: 0.52,
    embody: [{
      k: "人形 · 双臂",
      v: 214
    }, {
      k: "人形 · 单手",
      v: 41
    }, {
      k: "机械臂 · 六轴",
      v: 29
    }, {
      k: "灵巧手 · 三指",
      v: 13
    }],
    quality: [{
      k: "优质",
      v: 128
    }, {
      k: "边缘难例",
      v: 141
    }, {
      k: "无效",
      v: 28
    }],
    hist: [4, 9, 18, 34, 52, 61, 44, 29, 21, 15, 7, 3],
    pipe: [{
      k: "格式转换",
      v: "统一模型 → LeRobot v2.1",
      on: true
    }, {
      k: "重采样",
      v: "动作 30 Hz · 图像 15 Hz",
      on: true
    }, {
      k: "脱敏",
      v: "人像与工牌打码",
      on: true
    }, {
      k: "分层划分",
      v: "按场景分层，训练 / 验证 / 测试 = 8 : 1 : 1",
      on: true
    }, {
      k: "泄露检测",
      v: "阻断同场景跨集重叠",
      on: true
    }, {
      k: "分片与索引",
      v: "每片 512 条，生成索引文件",
      on: true
    }]
  };
  const SNAPSHOTS = [{
    id: "DS-KITCH-FOLD-v3",
    task: "TK-2409-011",
    n: 297,
    hours: 0.52,
    date: "09-13 18:20",
    by: "数据工程师",
    fp: "sha256:4f2a…c81e",
    state: "已发布",
    used: "训练侧引用 2 处"
  }, {
    id: "DS-KITCH-FOLD-v2",
    task: "TK-2409-011",
    n: 268,
    hours: 0.47,
    date: "09-12 15:04",
    by: "数据工程师",
    fp: "sha256:9b31…7d02",
    state: "已替代",
    used: "已被 v3 替代"
  }, {
    id: "DS-WH-SORT-v1",
    task: "TK-2409-010",
    n: 800,
    hours: 1.62,
    date: "09-14 10:12",
    by: "项目经理",
    fp: "sha256:2c77…aa41",
    state: "已发布",
    used: "训练侧引用 1 处"
  }, {
    id: "DS-SCREW-v1",
    task: "TK-2409-009",
    n: 630,
    hours: 1.24,
    date: "09-13 20:41",
    by: "项目经理",
    fp: "sha256:71e0…3fb9",
    state: "待发布",
    used: "阻塞：训练 / 验证集场景重叠 1 处"
  }, {
    id: "DS-CLOTH-v2",
    task: "TK-2409-006",
    n: 376,
    hours: 0.71,
    date: "09-12 11:30",
    by: "数据工程师",
    fp: "sha256:aa08…12ce",
    state: "已发布",
    used: "训练侧引用 1 处"
  }];

  /* ---------- 交付（源：7.8） ---------- */
  const DELIVERY = {
    id: "DLV-2409-004",
    customer: "恒立机器人",
    code: "B01",
    snapshot: "DS-KITCH-FOLD-v3",
    content: [{
      k: "数据集本体",
      v: "297 条 / 0.52 小时 / 412 GB",
      st: "ok"
    }, {
      k: "Data Card",
      v: "来源、分布、质量、限制与授权",
      st: "ok"
    }, {
      k: "质量评估报告",
      v: "QER-KITCH-FOLD-v3",
      st: "ok"
    }, {
      k: "验收单",
      v: "ACC-KITCH-FOLD-v3",
      st: "pending"
    }],
    due: "09-19",
    progress: 0.72,
    steps: [{
      k: "生成交付包",
      st: "done",
      t: "09-14 09:10"
    }, {
      k: "推送客户门户",
      st: "done",
      t: "09-14 09:12"
    }, {
      k: "客户查看",
      st: "done",
      t: "09-14 10:02"
    }, {
      k: "客户验收",
      st: "active",
      t: "进行中"
    }, {
      k: "处理异议",
      st: "wait",
      t: "—"
    }]
  };
  const DATA_CARD = {
    id: "DC-KITCH-FOLD-v3",
    source: "真实采集 · 示教采集 · 点位 K2 / K3",
    embody: "人形 · 双臂（本体代号 B01-H2）",
    sensors: "RGB-D 头部 ×1 · RGB 腕部 ×2 · 关节角度与力矩 ×14 · 末端位姿 · 触觉阵列 ×2",
    scene: "厨房台面 · 室内照度 320–460 lux",
    distribution: "本体 人形双臂 214 / 单手 41 / 机械臂 29 / 灵巧手 13；结果 失败 297（100%）",
    quality: "一级通过 188 · 边缘难例 109 · 无效 0；观测与动作时序偏差中位数 0.6 帧（阈值 2 帧）",
    limits: ["全部为失败样本，不含成功对照，直接用于监督训练会引入结果偏置。", "场景仅覆盖单一点位布局，物体位于台面左半区，未覆盖右半区与地面。", "照度区间集中于 320–460 lux，不得外推到暗光或强逆光场景。"],
    license: "授权范围：仅限客户内部模型训练；禁止再分发、禁止用于对外产品发布。",
    watermark: "交付包已嵌入来源指纹 WM-2f91c4，任一文件可溯源到接收方。"
  };
  const OBJECTIONS = [{
    id: "OBJ-0007",
    by: "恒立机器人 · 算法侧",
    t: "09-14 11:20",
    st: "处理中",
    anchor: "CLP-81226 · 帧 00:52.300 – 01:04.800（动作段「对折」）",
    text: "该段对折轨迹在 01:00 处出现明显抖动，怀疑本体控制异常而非数据问题，请确认是否应排除。",
    reply: "已关联采集环节，转现场督导核查点位 K3 的本体控制器日志。"
  }, {
    id: "OBJ-0006",
    by: "恒立机器人 · 数据侧",
    t: "09-13 16:44",
    st: "已关闭",
    anchor: "DC-KITCH-FOLD-v3 · 字段「分布」",
    text: "Data Card 中未列出物体材质分布，无法判断是否覆盖目标材质。",
    reply: "已补齐材质分布字段：棉 62% / 涤纶 24% / 混纺 14%，随 v3 重发。"
  }];

  /* ---------- 采集端（源：7.2 / 8.4） ---------- */
  const CAPTURE_TASKS = [{
    id: "TK-2409-011",
    name: "厨房台面折叠衣物",
    left: 24,
    plan: 40,
    scene: "厨房 / 台面 K2",
    spec: "EGO-KITCH-02 v1.2",
    mode: "示教采集",
    priority: "交期 09-19",
    state: "active",
    steps: [{
      n: "确认台面与机位",
      done: true
    }, {
      n: "平铺毛巾，四角对齐",
      done: true
    }, {
      n: "沿长边对折一次",
      done: false
    }, {
      n: "再对折一次并压平",
      done: false
    }, {
      n: "放置到右侧托盘",
      done: false
    }]
  }, {
    id: "TK-2409-004",
    name: "抓取失败样本专项",
    left: 18,
    plan: 20,
    scene: "桌面 / 多物体 K5",
    spec: "GRASP-NEG-01 v1.0",
    mode: "正负样本统一采集",
    priority: "交期 09-18",
    state: "idle",
    steps: [{
      n: "摆放目标物与干扰物",
      done: false
    }, {
      n: "执行抓取并记录结果",
      done: false
    }, {
      n: "标记失败类型",
      done: false
    }]
  }, {
    id: "TK-2409-007",
    name: "线缆插拔（接触力）",
    left: 12,
    plan: 30,
    scene: "实验台 / 电控柜 K7",
    spec: "CABLE-INS-02 v1.1",
    mode: "正负样本统一采集",
    priority: "交期 09-24",
    state: "idle",
    steps: [{
      n: "对准接口",
      done: false
    }, {
      n: "插入至卡扣到位",
      done: false
    }, {
      n: "拔出并检查",
      done: false
    }]
  }];
  const CAPTURE_METRICS = [{
    k: "同步偏差",
    unit: "帧",
    base: 0.3,
    ok: 1,
    dir: "lt",
    hint: "多路时间戳最大偏差，超过 1 帧即阻塞"
  }, {
    k: "有效帧占比",
    unit: "%",
    base: 93,
    ok: 80,
    dir: "gt",
    hint: "有效帧低于 80% 判不通过"
  }, {
    k: "目标可见率",
    unit: "%",
    base: 88,
    ok: 70,
    dir: "gt",
    hint: "目标可见率低于 70% 判不通过"
  }, {
    k: "静止段占比",
    unit: "%",
    base: 9,
    ok: 30,
    dir: "lt",
    hint: "静止段超过 30% 判不通过"
  }, {
    k: "丢帧率",
    unit: "%",
    base: 0.4,
    ok: 2,
    dir: "lt",
    hint: "丢帧率高于 2% 判不通过"
  }];
  const CAPTURE_ANOMALY = [{
    k: "手部出画",
    code: "RC-0101"
  }, {
    k: "动作未闭合",
    code: "RC-0102"
  }, {
    k: "站位错误",
    code: "RC-0103"
  }, {
    k: "静止过长",
    code: "RC-0301"
  }, {
    k: "遮挡严重",
    code: "RC-0302"
  }, {
    k: "设备异常",
    code: "RC-0201"
  }];

  /* ---------- 流程导览（源：第 7 章 F1–F8） ---------- */
  const FLOWS = [{
    id: "F1",
    t: "采集任务定义与下发",
    d: "五分钟产出一份可下发、无歧义、可验收的任务",
    to: ["production", "tasks"]
  }, {
    id: "F2",
    t: "现场作业与实时自检",
    d: "不看手册也能采对，现场就知道能不能用",
    to: ["capture", "job"]
  }, {
    id: "F3",
    t: "上传与自动校验",
    d: "把合格判断前移到上传，三态结论附逐项证据",
    to: ["production", "upload"]
  }, {
    id: "F4",
    t: "质检驳回与重采闭环",
    d: "全键盘完成一轮判定，原因码加证据才能驳回",
    to: ["quality", "qc"]
  }, {
    id: "F5",
    t: "标注工作台",
    d: "长视频多轨跨模态标注，候选而非结论",
    to: ["annotate", "workbench"]
  }, {
    id: "F6",
    t: "数据集配方与版本发布",
    d: "把「要哪一批数据」变成可复现的结构化定义",
    to: ["dataset", "recipe"]
  }, {
    id: "F7",
    t: "语义检索与取数",
    d: "找数据从翻目录变成提问，选择篮跨页累积",
    to: ["production", "search"]
  }, {
    id: "F8",
    t: "交付验收与客户门户",
    d: "四件一体交付，异议结构化并锚定到片段",
    to: ["delivery", "portal"]
  }];

  /* ---------- 异常与验收清单（源：第 10、11 章） ---------- */
  const EXCEPTIONS = [["X1", "设备时间不同步", "同步偏差超阈", "阻塞录制并红色告警", "一键同步，成功后自动解除"], ["X2", "标定缺失或过期", "标定超过有效期", "允许录制但片段标待复核", "更新标定或接受复核"], ["X3", "现场弱网或断网", "网络不可达", "转入离线队列", "恢复后自动续传"], ["X4", "存储空间不足", "剩余空间低于阈值", "限制新录制", "上传已完成片段释放空间"], ["X5", "上传中断", "连接超时", "保留已传分片", "恢复后自动续传"], ["X6", "元数据缺失", "Schema 校验失败", "一次列出全部缺失项", "批量补录后重跑"], ["X7", "疑似重复", "相似度超阈", "进入待裁决列表", "并排对比后决定丢弃或保留"], ["X8", "文件超阈值", "体积超上限", "不进入上传队列", "对象存储直传或物理导入"], ["X9", "校验服务故障", "服务不可用", "标记待补校验而非不通过", "恢复后自动重跑"], ["X10", "质检与采集争议", "采集员申诉", "进入仲裁队列", "项目经理裁定并回流字典"], ["X11", "机审误报率高", "一致率低于阈值", "提示规则需调整", "质检负责人调阈值并试运行"], ["X12", "标注分歧超阈", "双人标注差异超限", "转仲裁并高亮分歧帧", "标注质检员裁定"], ["X13", "规范中途更新", "规范发布新版本", "未提交任务提示新版本", "按新规范重标或按旧版提交"], ["X14", "预标注服务不可用", "服务异常", "降级为人工标注", "不阻塞流程，恢复后不补跑"], ["X15", "构建任务失败", "资源或数据异常", "保留已完成分片并报因", "断点续跑，不从头开始"], ["X16", "配方引用数据被改判", "数据状态变更", "提示引用可变更数据", "一键冻结后重建"], ["X17", "已发布快照需修正", "发现数据问题", "禁止原地修改", "发新版本并标注替代关系"], ["X18", "交付包生成失败", "生成异常", "保留已生成部分", "重试或导出部分交付"], ["X19", "客户提异议", "门户提交", "结构化并生成整改任务", "关联采集或标注环节整改"], ["X20", "交期风险", "进度落后于计划", "看板提前预警", "调整范围或增加产能"], ["X21", "权限不足", "访问受限资源", "明确缺哪项权限", "提供申请入口"], ["X22", "并发编辑冲突", "两人同时改同一对象", "后提交者收到冲突提示", "对比差异后合并或放弃"], ["X23", "私有化环境离线", "客户内网不可出网", "核心功能不受影响，外发通知降级", "离线包导入升级，授权离线续期"], ["X24", "加密或授权校验失败", "密钥异常、证书过期、License 失效", "阻止导出与下载，其余功能可读", "按提示更新证书或导入新授权"], ["X25", "数据到期待销毁", "留存策略到期", "到期提醒并冻结导出", "二次确认后销毁并出具记录"], ["X26", "训练验证集场景泄露", "同场景样本跨集重叠", "构建校验阻断并列出重叠场景", "改分层抽样条件后重新构建"], ["X27", "客户模型接口不可用", "主动采集通道调用失败", "降级为人工指定采集需求", "人工录入难度维度，不阻塞采集"]];
  const ACCEPTANCE = [["V01", "每个功能有明确角色与终端归属", "功能地图中无跨端误置，采集端无管理动作"], ["V02", "每条数据可回答在哪、卡在谁、下一步谁动", "任取一条数据，链路与责任人可查出"], ["V03", "上传结论 100% 可定位", "不通过结论均可跳转到问题帧或字段"], ["V04", "质检可全键盘完成一轮判定", "无鼠标即可完成评分、驳回、通过、下一条"], ["V05", "驳回必须附结构化原因与证据", "缺原因码或证据时提交被禁用"], ["V06", "标注支持长视频多轨", "动作、子任务、指令、接触事件四轨可用且可折叠"], ["V07", "预标注结果可被识别为候选", "置信度可见，低置信优先复核"], ["V08", "数据集构建可复现", "同配方两次构建结果一致，内容指纹相同"], ["V09", "快照不可变", "已发布版本无法原地修改"], ["V10", "交付四件一体", "数据集、Data Card、质量报告、验收单齐备"], ["V11", "四态完整", "加载、空、错误、无权限均有明确文案与出路"], ["V12", "异常清单 100% 有出路", "第 10 章每项均给出可执行下一步"], ["V13", "通知不重复打扰", "同因同人一小时内合并且不重复推送"], ["V14", "危险操作有影响面提示", "删除、发布、改判、改阈值均先展示影响面"], ["V15", "多路播放严格同步", "任一路缓冲时全部暂停"], ["V16", "客户数据隔离", "客户间不可见、不可搜、不可导"], ["V17", "全链路审计", "采集、上传、驳回、改判、导出、下载均留痕"], ["V18", "阈值可配置且可控", "阈值修改前有影响预估与试运行"], ["V19", "私有化部署可交付", "不连云环境可完成部署、日常使用与离线升级"], ["V20", "全链路加密生效", "传输抓包不可读，静态数据落盘为密文，密钥可轮换"], ["V21", "交付包可溯源防扩散", "水印与来源指纹可定位泄露接收方"], ["V22", "销毁可证明", "销毁后数据不可恢复，并出具含对象清单的销毁记录"], ["V23", "训练侧流式加载可用", "不整载入内存即可完整迭代一次数据集"]];

  /* ---------- 智能能力与数据飞轮（源：竞品能力对标 · 第 7 章闭环） ----------
     对标口径：Encord《Physical AI Data Pipeline》的采集→扩展→标注→治理→
     部署反馈五阶段闭环与 model-in-the-loop / active learning；北京人形
     「慧思开物」数据基地的全栈数据闭环；Topstar Scan2Sim/Gen2Sim 长尾生成
     与真机失败案例回流；无界动力 AnyPhys 正负样本自动区分能力。
     能力指标全部落在本平台已有的字段与环节上，不新增页面。 ---------- */
  const AI_METRICS = [{
    k: "预标注覆盖率",
    v: "68.4",
    u: "%",
    foot: "模型先出候选，人工只复核低置信与高影响",
    spark: [42, 48, 53, 58, 61, 65, 68.4]
  }, {
    k: "机审命中率",
    v: "31.2",
    u: "%",
    foot: "近 7 日 · 人工改判率 6.2%",
    spark: [34, 36, 33, 32, 31.4, 31.8, 31.2]
  }, {
    k: "人机一致率",
    v: "93.8",
    u: "%",
    foot: "低于 92% 自动触发规则复检",
    spark: [91, 92, 92.6, 93, 93.4, 93.6, 93.8]
  }, {
    k: "难例回流",
    v: "412",
    u: "条",
    foot: "训练侧失败回传，已转主动采集",
    delta: "up",
    spark: [180, 240, 286, 330, 362, 390, 412]
  }];

  /* 数据飞轮六环节：任一环节的产出是下一环节的输入，最后一环回到第一环 */
  const FLYWHEEL = [{
    k: "全范式采集",
    v: "1 486 条/日",
    note: "真机 · 无本体 · 仿真三路并行",
    tone: ""
  }, {
    k: "机审质检",
    v: "31.2% 命中",
    note: "模型先判，人只复核低置信与高影响",
    tone: ""
  }, {
    k: "预标注",
    v: "68.4% 覆盖",
    note: "候选而非结论，人工采纳率 91%",
    tone: ""
  }, {
    k: "配方建集",
    v: "297 条 / 集",
    note: "可复现，快照不可变",
    tone: ""
  }, {
    k: "训练侧引用",
    v: "6 处",
    note: "流式加载，引用关系可追溯",
    tone: ""
  }, {
    k: "难例回流",
    v: "412 条",
    note: "训练失败案例回传 → 主动采集取数",
    tone: "warn"
  }];

  /* 主动学习难例队列：按模型不确定度排序，不是按提交时间。
     id 均取自 ANNO_CLIPS，保证点击后工作台能定位到真实单元。 */
  const AL_QUEUE = [{
    id: "CLP-81207",
    why: "训练回传",
    conf: 0.39,
    from: "训练侧失败案例回传 · 该片段被模型判为负例",
    task: "TK-2409-011"
  }, {
    id: "CLP-81204",
    why: "低置信",
    conf: 0.44,
    from: "对折段动作边界模糊，预标注不确定",
    task: "TK-2409-011"
  }, {
    id: "CLP-81206",
    why: "低置信",
    conf: 0.58,
    from: "预标注不确定 · 边缘难例",
    task: "TK-2409-011"
  }, {
    id: "CLP-81205",
    why: "机审分歧",
    conf: 0.61,
    from: "机审判驳回 · 人工已改判为通过",
    task: "TK-2409-011"
  }];

  /* 机审证据链：模型给结论，人看证据再决定是否采纳（model-in-the-loop） */
  const MACHINE_EVIDENCE = {
    model: "QC-MOT-v4.2",
    ruleset: "QC-RULES-v3",
    precision: 0.938,
    propose: {
      code: "RC-0301",
      name: "静止过长",
      conf: 0.86,
      seg: "00:31.400 – 00:37.000"
    },
    chain: [{
      k: "静止段占比",
      v: "3.6s / 34.1% > 30%",
      rule: "QC-MOT-01",
      jump: "帧 172"
    }, {
      k: "末端位姿变化率",
      v: "0.02 · 近零",
      rule: "QC-MOT-02",
      jump: "帧 178"
    }, {
      k: "与规格阈值比对",
      v: "EGO-KITCH-02 v1.2 · ≤ 30%",
      rule: "SPEC",
      jump: "—"
    }]
  };

  /* ============================================================
     开放接口 / API（源：交付后的数据消费入口）
     交付不是终点：客户算法团队通过开放接口按需取数，而不是反复要一次压缩包。
     取数与交付页共用同一套凭证、水印与留痕，权限点与客户隔离口径一致。
     ---------- */
  const API_ENDPOINTS = [{
    m: "GET",
    p: "/v1/datasets",
    d: "列出当前凭证可访问的数据集（按客户与项目隔离）",
    auth: "API Key",
    qps: "20",
    scope: "dataset:read"
  }, {
    m: "GET",
    p: "/v1/datasets/{id}",
    d: "读取数据集元信息与随包的 Data Card",
    auth: "API Key",
    qps: "20",
    scope: "dataset:read"
  }, {
    m: "POST",
    p: "/v1/search",
    d: "自然语言或结构化条件检索数据片段，返回游标分页",
    auth: "签名",
    qps: "10",
    scope: "clip:read"
  }, {
    m: "GET",
    p: "/v1/clips/{id}",
    d: "取单条片段的元数据、质检结论与标注引用",
    auth: "签名",
    qps: "30",
    scope: "clip:read"
  }, {
    m: "GET",
    p: "/v1/clips/{id}/media",
    d: "按模态取媒体切片，支持 Range 断点续传",
    auth: "签名 + 时效令牌",
    qps: "10",
    scope: "clip:read"
  }, {
    m: "POST",
    p: "/v1/exports",
    d: "发起导出任务，生成带水印的交付包",
    auth: "签名",
    qps: "2",
    scope: "export:write"
  }, {
    m: "GET",
    p: "/v1/exports/{id}",
    d: "查询导出状态与下载地址（地址 48 小时失效）",
    auth: "签名",
    qps: "20",
    scope: "export:read"
  }, {
    m: "POST",
    p: "/v1/webhooks",
    d: "订阅任务、质检与交付事件，回调带签名校验",
    auth: "签名",
    qps: "2",
    scope: "webhook:write"
  }];
  const API_KEYS = [{
    id: "AK-LIVE-7f21",
    who: "恒立机器人 · 算法组",
    env: "生产",
    scopes: "dataset:read · clip:read · export:read",
    ip: "203.0.113.0/24",
    last: "12:26",
    state: "启用"
  }, {
    id: "AK-LIVE-3c88",
    who: "瀚海工业 · 数据平台",
    env: "生产",
    scopes: "dataset:read · clip:read",
    ip: "198.51.100.7",
    last: "昨天 18:04",
    state: "启用"
  }, {
    id: "AK-TEST-0ad4",
    who: "内部联调 · 沙箱",
    env: "沙箱",
    scopes: "全部（仅沙箱数据）",
    ip: "10.20.3.0/24",
    last: "09:12",
    state: "启用"
  }, {
    id: "AK-LIVE-91be",
    who: "星穹智能 · 算法组",
    env: "生产",
    scopes: "export:read",
    ip: "—",
    last: "08-28",
    state: "已停用"
  }];
  const API_CALLS = [{
    t: "12:26:41",
    who: "恒立 · 算法组",
    ep: "POST /v1/search",
    code: 200,
    ms: 312,
    note: "命中 18 条 · 游标已返回"
  }, {
    t: "12:24:09",
    who: "恒立 · 算法组",
    ep: "GET /v1/clips/CLP-81204/media",
    code: 206,
    ms: 88,
    note: "Range 断点续传 · 4.2 MB"
  }, {
    t: "12:19:33",
    who: "瀚海 · 数据平台",
    ep: "GET /v1/datasets",
    code: 200,
    ms: 47,
    note: "返回 3 个数据集"
  }, {
    t: "12:11:02",
    who: "恒立 · 算法组",
    ep: "POST /v1/exports",
    code: 202,
    ms: 604,
    note: "导出任务 DLV-2409-005 已受理"
  }, {
    t: "12:03:55",
    who: "星穹 · 算法组",
    ep: "GET /v1/clips/CLP-81211",
    code: 403,
    ms: 12,
    note: "凭证已停用 · 拒绝访问"
  }, {
    t: "11:58:20",
    who: "内部联调 · 沙箱",
    ep: "POST /v1/search",
    code: 429,
    ms: 5,
    note: "超出 10 QPS 限流 · 建议退避重试"
  }, {
    t: "11:44:10",
    who: "瀚海 · 数据平台",
    ep: "GET /v1/exports/DLV-2409-002",
    code: 404,
    ms: 9,
    note: "交付包已过 48 小时时效"
  }];
  const API_WEBHOOKS = [{
    ev: "task.status_changed",
    d: "任务下发、确认、撤回的状态变化",
    state: "已订阅"
  }, {
    ev: "qc.judged",
    d: "单条质检结论落定（含机审与人工改判）",
    state: "已订阅"
  }, {
    ev: "delivery.ready",
    d: "交付包生成完成，可下载",
    state: "已订阅"
  }, {
    ev: "clip.rejected",
    d: "片段被驳回并生成重采任务",
    state: "未订阅"
  }, {
    ev: "snapshot.published",
    d: "数据集快照发布，内容指纹固定",
    state: "已订阅"
  }];

  /* ============================================================
     设备接入契约（对标 AIRSPEED 的硬件-软件解耦与 ROS2 主题契约）
     原则：改硬件不改代码。任何能按契约发布标准消息的设备都能接入；
     契约本身是受控资产，变更需评审，且入库前必须先过契约校验。
     ---------- */
  const CONTRACT_IFACES = [{
    k: "遥操作接口",
    d: "接收任意操作输入设备的操作意图，统一为标准位姿与离散输入消息",
    types: "PoseStamped · Joy",
    rate: "50–90 Hz"
  }, {
    k: "机器人接口",
    d: "把操作意图解算为本体位姿与关节指令，并回读关节状态",
    types: "JointState · PoseStamped",
    rate: "50 Hz"
  }, {
    k: "传感器接口",
    d: "接收任意相机与环境传感器数据，统一为已标定的图像与惯性消息",
    types: "Image · CameraInfo · Imu · PointCloud2",
    rate: "30 / 100 Hz"
  }];
  const CONTRACT_STREAMS = [{
    name: "头部位姿",
    src: "遥操作",
    topic: "/vr/head_pose",
    type: "geometry_msgs/PoseStamped",
    tdom: "header.stamp",
    qos: "reliable · volatile · keep_last 1",
    fields: "position · orientation",
    hz: "90 Hz",
    ok: true
  }, {
    name: "手柄按键",
    src: "遥操作",
    topic: "/vr/left_buttons",
    type: "sensor_msgs/Joy",
    tdom: "header.stamp",
    qos: "best_effort · volatile · keep_last 1",
    fields: "buttons · axes",
    hz: "90 Hz",
    ok: true
  }, {
    name: "左臂关节状态",
    src: "机器人",
    topic: "/arm/left/joint_states",
    type: "sensor_msgs/JointState",
    tdom: "header.stamp",
    qos: "best_effort · volatile · keep_last 1",
    fields: "position · velocity · effort",
    hz: "50 Hz",
    ok: true
  }, {
    name: "左臂末端位姿",
    src: "机器人",
    topic: "/arm/left/ee_pose",
    type: "geometry_msgs/PoseStamped",
    tdom: "header.stamp",
    qos: "reliable · volatile · keep_last 1",
    fields: "position · orientation",
    hz: "50 Hz",
    ok: true
  }, {
    name: "腕部彩色",
    src: "传感器",
    topic: "/camera/wrist/color",
    type: "sensor_msgs/Image",
    tdom: "header.stamp",
    qos: "best_effort · volatile · keep_last 1",
    fields: "encoding · data",
    hz: "30 Hz",
    ok: true
  }, {
    name: "腕部内参",
    src: "传感器",
    topic: "/camera/wrist/info",
    type: "sensor_msgs/CameraInfo",
    tdom: "header.stamp",
    qos: "reliable · transient_local · keep_last 1",
    fields: "K · D · frame_id",
    hz: "1 Hz",
    ok: true
  }, {
    name: "六维力矩",
    src: "传感器",
    topic: "/ft/left_wrench",
    type: "geometry_msgs/WrenchStamped",
    tdom: "无 header",
    qos: "—",
    fields: "force · torque",
    hz: "100 Hz",
    ok: false
  }];
  const CONTRACT_REJECTS = [{
    t: "12:18:02",
    stream: "/ft/left_wrench",
    why: "消息类型无 header，无法确定创建时刻",
    action: "已拒绝入库",
    note: "需在设备侧补 header，或经边缘适配层在收报时打戳后重发"
  }, {
    t: "11:47:31",
    stream: "/camera/chest/color",
    why: "载荷含 NaN（深度通道 3 处）",
    action: "已拒绝该帧",
    note: "入库即拒，避免污染后续统计与训练"
  }, {
    t: "11:12:09",
    stream: "/arm/left/joint_states",
    why: "必填字段 position 缺失",
    action: "已拒绝入库",
    note: "契约要求 position 为必填序列且类型为浮点"
  }, {
    t: "10:36:44",
    stream: "/imu",
    why: "header.stamp 与整机时基偏差 12 ms",
    action: "标记待核",
    note: "跨流对齐有风险，建议先完成时钟同步再录制"
  }];
  const CLOCK_SYNC = [{
    node: "采集主机 A",
    proto: "chrony（局域网 NTP）",
    off: "0.4 ms",
    state: "已同步"
  }, {
    node: "采集主机 B",
    proto: "PTP（IEEE 1588）",
    off: "18 µs",
    state: "已同步"
  }, {
    node: "远程点位 K7（中继）",
    proto: "chrony",
    off: "1.2 ms",
    state: "已同步"
  }, {
    node: "远端浏览器头显",
    proto: "无受控时钟",
    off: "—",
    state: "未同步"
  }];
  const CONTRACT_YAML = {
    session: ["schema_version: \"1.0\"", "session:", "  name: \"k2-kitchen-fold\"", "  recording_control:", "    mode: manual_ui      # service | manual_ui | device_binding", "storage:", "  root: data/episodes", "  format: hdf5            # 源格式，转换后另出 parquet/zarr/lerobot", "streams:", "  - name: \"joint_states\"", "    source: robot", "    topic: \"/arm/left/joint_states\"", "    message_type: \"sensor_msgs/JointState\"", "    time_domain: ros_header   # 只接受带 header 的消息", "    qos: { reliability: best_effort, durability: volatile, history: keep_last, depth: 1 }", "    fields:", "      - { path: \"position\", type: sequence, required: true }"],
    global: ["# 全局配置只指向当前生效的适配器，不含任何硬件细节", "interface: teleoperation", "active_adaptor: vr-standard-ros2-bridge", "publish:", "  pose_topic: /vr/head_pose", "  button_topic: /vr/left_buttons", "# 换硬件 = 换适配器 + 改会话 YAML，核心采集服务不改一行代码"]
  };
  window.DATA = {
    DOMAINS,
    TASKS,
    METRICS,
    RISKS,
    REJECT_DIST,
    UPLOAD_ROWS,
    QC_QUEUE,
    REASON_CODES,
    RULES,
    SEARCH_HITS,
    SEARCH_FACETS,
    ANNO_CLIPS,
    ANNO_TRACKS,
    ANNO_NOTES,
    RECIPE_PRESET,
    SNAPSHOTS,
    DELIVERY,
    DATA_CARD,
    OBJECTIONS,
    CAPTURE_TASKS,
    CAPTURE_METRICS,
    CAPTURE_ANOMALY,
    FLOWS,
    EXCEPTIONS,
    ACCEPTANCE,
    AI_METRICS,
    FLYWHEEL,
    AL_QUEUE,
    MACHINE_EVIDENCE,
    API_ENDPOINTS,
    API_KEYS,
    API_CALLS,
    API_WEBHOOKS,
    CONTRACT_IFACES,
    CONTRACT_STREAMS,
    CONTRACT_REJECTS,
    CLOCK_SYNC,
    CONTRACT_YAML
  };
})();