/* ============================================================
   平台端页面 A：总览看板 / 任务 / 上传校验 / 检索 / 数据浏览器
   ============================================================ */
(function () {
  const { useState, useMemo, useEffect, useRef } = React;
  const { Tag, Btn, IconBtn, Panel, Field, Switch, StateBlock, Modal, Drawer, MetricCard,
    Hist, MultiView, Transport, Timeline, OverlaySwitch, PageHead, DL, Kbd,
    Flywheel, AiKpi, VIEWS, fmtTime, useTicker, cls } = window.UI;
  const D = window.DATA;

  /* ============================================================
     生产总览看板（源：8.2）
     ============================================================ */
  const HEAT = {
    scenes: ["厨房台面", "装配工位", "分拣线", "软体实验台", "吧台"],
    emps: ["采集员 A", "采集员 B", "采集员 C", "现场督导"],
    v: [
      [96.2, 78.4, 94.1, 82.0, 91.5],
      [93.8, 74.6, 92.5, 86.2, 89.0],
      [88.4, 81.2, 90.3, 79.4, 92.8],
      [91.0, 85.5, 95.2, 84.1, 90.4],
    ],
  };

  function OverviewBoard({ app, set }) {
    const toast = window.UI.useToast();
    const [mode, setMode] = useState("risk");
    const heatColor = (v) => {
      if (v >= 93) return "var(--ok)";
      if (v >= 88) return "color-mix(in srgb, var(--ok) 45%, var(--warn))";
      if (v >= 82) return "var(--warn)";
      return "var(--danger)";
    };

    /* 内容板块均可点击下钻：点击后自动跳转到对应业务页面并带入上下文 */
    const go = (t) => {
      set({ domain: t.domain, page: t.page, payload: t.payload || {}, flow: null });
      toast.push({ tone: "info", title: "已跳转 · " + t.label, desc: t.desc || "已带入该板块的上下文，可在目标页继续处理。" });
    };
    const METRIC_TO = [
      { domain: "production", page: "tasks", label: "任务列表", desc: "已按「在产任务」口径进入任务列表，可查看 6 个在产任务。" },
      { domain: "production", page: "upload", label: "上传与校验", desc: "已进入上传与校验中心，可查看今日 1 486 条入库明细。" },
      { domain: "quality", page: "qc", label: "质检台", desc: "已进入质检台，可查看一次通过率 88.7% 背后的驳回明细。" },
      { domain: "quality", page: "qcqueue", label: "待办队列", desc: "已进入待办队列，187 条按优先级排序处理。" },
    ];
    const RISK_TO = [
      { domain: "quality", page: "rules", label: "规则配置", desc: "已定位到规则库，可回溯 ASM-SCREW-01 的静止段阈值。" },
      { domain: "production", page: "upload", label: "上传与校验", desc: "已进入待裁决列表，可完成 3 条数据的并排对比裁决。" },
      { domain: "config", page: "devices", label: "本体与设备台账", desc: "已进入设备台账，可核查 K2 点位设备与时钟同步。" },
      { domain: "quality", page: "qc", label: "质检台", desc: "已进入质检台，可回溯原因码 RC-0101 的驳回记录。" },
      { domain: "production", page: "detail", payload: { id: "TK-2409-011" }, label: "任务详情", desc: "已进入 TK-2409-011 任务详情，可查看剩余产能与缓冲。" },
    ];
    const FW_TO = [
      { domain: "production", page: "overview", label: "生产总览", desc: "已回到生产总览看板。" },
      { domain: "quality", page: "qc", label: "质检台", desc: "已进入质检台，可查看机审命中与人工改判记录。" },
      { domain: "annotate", page: "workbench", label: "标注工作台", desc: "已进入标注工作台，可复核预标注候选。" },
      { domain: "dataset", page: "recipes", label: "配方库", desc: "已进入配方库，可查看可复现的建集配方。" },
      { domain: "dataset", page: "delivery", label: "导出与交付", desc: "已进入导出与交付，可查看交付包与 Data Card。" },
      { domain: "annotate", page: "annotasks", label: "标注任务", desc: "已进入标注任务，可查看难例回流后的主动采集单元。" },
    ];
    const goIdx = (list, i, fallback) => go(list[i] || fallback || list[0]);

    return (
      <>
        <PageHead
          crumbs={[{ label: "生产" }, { label: "总览看板" }]}
          title="生产总览看板"
          desc="看板的第一职责是暴露风险，不是展示数据。每一块都必须能回答「我现在要做什么」，因此风险列表排在质量概览之前，且每项风险都带建议动作与责任角色。"
          meta={
            <>
              <Tag tone="quiet" icon="clock">数据截至 12:34 · 每 60 秒刷新</Tag>
              <Tag tone="quiet" icon="users">在岗 18 人 · 在线设备 31 / 38</Tag>
              <Tag tone="warn" icon="gauge">当前视图：项目全量</Tag>
              <Tag tone="accent" icon="arrowRight">所有板块可点击下钻</Tag>
            </>
          }
          actions={
            <>
              <Btn icon="refresh" tone="ghost" onClick={() => toast.push({ tone: "info", title: "已刷新", desc: "看板数据于 12:34 重新拉取。" })}>刷新</Btn>
              <Btn icon="plus" tone="primary" onClick={() => set({ page: "tasks", payload: { create: true } })}>新建采集任务</Btn>
            </>
          }
        />

        <div className="pagebody">
          <div className="grid g-4" style={{ marginBottom: 14 }}>
            {D.METRICS.map((m, i) => (
              <MetricCard key={i} m={m} onClick={() => go(METRIC_TO[i] || METRIC_TO[0])} />
            ))}
          </div>

          <Panel
            title="数据飞轮 · 模型在环"
            sub="模型逐步接管可重复的判断，人只处理低置信与高影响；训练侧的失败案例回流，闭环回到采集"
            right={<Tag tone="accent" icon="cpu">六环节闭环 · 人机一致率 93.8%</Tag>}
            style={{ marginBottom: 14 }}
          >
            <Flywheel stages={D.FLYWHEEL} onNode={(i) => goIdx(FW_TO, i)} />
            <div className="grid g-4" style={{ marginTop: 14 }}>
              {D.AI_METRICS.map((m, i) => <AiKpi key={i} m={m} />)}
            </div>
            <div className="tiny muted-3" style={{ marginTop: 12, lineHeight: 1.7 }}>
              四类能力指标与竞品口径对齐：预标注覆盖率对应「模型先标注、人工复核不确定样本」，机审命中率与人机一致率对应「模型在环的改判率」，难例回流对应「部署反馈闭环」。
              指标只用于说明自动化的接管程度，判定权始终保留在人手上。
            </div>
          </Panel>

          <div className="grid" style={{ gridTemplateColumns: "minmax(0,1.35fr) minmax(0,1fr)", alignItems: "start" }}>
            {/* 左：风险列表 + 任务进度 */}
            <div className="col" style={{ gap: 14 }}>
              <Panel
                title="风险与待办"
                sub="每项给出建议动作与责任角色"
                right={<Tag tone="danger" dot>2 项高风险</Tag>}
                flush
              >
                <div style={{ display: "flex", flexDirection: "column", gap: 10, padding: 14 }}>
                  {D.RISKS.map((r, i) => (
                    <div key={i} className={cls("risk", "lv-" + r.lv)}>
                      <span className="rk" />
                      <div>
                        <div className="risk-title pretty">{r.title}</div>
                        <div className="risk-desc pretty">{r.desc}</div>
                        <div className="risk-act">
                          <Icon n="arrowRight" s={11} style={{ color: "var(--accent)", flex: "0 0 auto" }} />
                          <span className="pretty">{r.act}</span>
                        </div>
                      </div>
                      <div className="col" style={{ gap: 6, alignItems: "flex-end" }}>
                        <Tag tone={r.lv === "danger" ? "danger" : r.lv === "warn" ? "warn" : "review"}>
                          {r.lv === "danger" ? "高" : r.lv === "warn" ? "中" : "提示"}
                        </Tag>
                        <span className="tiny muted-3 nowrap">{r.who}</span>
                        <Btn size="sm" tone="ghost" onClick={() => goIdx(RISK_TO, i)}>去处理</Btn>
                      </div>
                    </div>
                  ))}
                </div>
              </Panel>

              <Panel title="在产任务" sub="点击卡片下钻到任务详情"
                right={<Btn size="sm" tone="ghost" icon="arrowRight" onClick={() => set({ page: "tasks" })}>全部任务</Btn>}
                flush>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, padding: 14 }}>
                  {D.TASKS.slice(0, 4).map((t) => (
                    <button key={t.id} className="panel" style={{ textAlign: "left", cursor: "pointer", background: "var(--surface-1)" }}
                      onClick={() => set({ page: "detail", payload: { id: t.id } })}>
                      <div style={{ padding: "11px 12px" }}>
                        <div className="spread" style={{ marginBottom: 7 }}>
                          <span className="small mono muted-3">{t.id}</span>
                          <Tag tone={t.risk === "danger" ? "danger" : t.risk === "warn" ? "warn" : "ok"} dot>{t.status}</Tag>
                        </div>
                        <div style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.5 }} className="pretty">{t.name}</div>
                        <div className="tiny muted-3" style={{ marginTop: 3 }}>{t.customer} · {t.scene}</div>
                        <div style={{ marginTop: 10 }}>
                          <div className="spread tiny muted-3" style={{ marginBottom: 4 }}>
                            <span>进度 {Math.round(t.progress * 100)}%</span>
                            <span className="mono">{t.done} / {t.plan} 条</span>
                          </div>
                          <div className={cls("bar", t.risk === "danger" ? "danger" : t.risk === "warn" ? "warn" : "")}>
                            <i style={{ width: t.progress * 100 + "%" }} />
                          </div>
                        </div>
                        <div className="row" style={{ marginTop: 10, gap: 12 }}>
                          <span className="tiny muted-3">一次通过率 <b className="mono" style={{ color: t.pass1 < 0.85 ? "var(--danger)" : "var(--text)" }}>{Math.round(t.pass1 * 1000) / 10}%</b></span>
                          <span className="tiny muted-3">交期 <b className="mono" style={{ color: "var(--text)" }}>{t.due}</b></span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </Panel>
            </div>

            {/* 右：质量概览 */}
            <div className="col" style={{ gap: 14 }}>
              <Panel title="驳回原因分布" sub="近 7 日 · 点击任一原因码跳转质检台查看明细"
                right={<div className="row-tight">
                  <button className="btn btn-sm" aria-pressed={mode === "risk"} style={mode === "risk" ? { background: "var(--surface-3)" } : null} onClick={() => setMode("risk")}>按条数</button>
                  <button className="btn btn-sm" aria-pressed={mode === "risk2"} style={mode === "risk2" ? { background: "var(--surface-3)" } : null} onClick={() => setMode("risk2")}>按占比</button>
                </div>} flush>
                <div style={{ padding: 14, display: "flex", flexDirection: "column", gap: 9 }}>
                  {D.REJECT_DIST.map((r) => (
                    <div key={r.code} className="qrow" style={{ gridTemplateColumns: "1fr 52px", cursor: "pointer" }}
                      onClick={() => go({ domain: "quality", page: "qc", payload: { reason: r.code }, label: "质检台", desc: "已按原因码 " + r.code + " " + r.name + " 过滤，命中 " + r.n + " 条。" })}>
                      <div>
                        <div className="row" style={{ gap: 7 }}>
                          <span className="codechip">{r.code}</span>
                          <span className="small">{r.name}</span>
                          <span className="tiny muted-3" style={{ marginLeft: "auto" }}>{mode === "risk" ? r.n + " 条" : Math.round(r.pct * 100) + "%"}</span>
                        </div>
                        <div className="bar" style={{ marginTop: 5 }}>
                          <i style={{ width: r.pct / 0.24 * 100 + "%", background: r.pct > 0.18 ? "var(--danger)" : r.pct > 0.1 ? "var(--warn)" : "var(--accent)" }} />
                        </div>
                      </div>
                      <span className="tiny muted-3 nowrap" style={{ textAlign: "right" }}>查看 ›</span>
                    </div>
                  ))}
                </div>
              </Panel>

              <Panel title="采集员 × 场景 一次通过率热力" sub="单位 %，低于 85 需关注 · 点击单元格跳转质检台" flush>
                <div style={{ padding: 14 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "62px repeat(" + HEAT.scenes.length + ",1fr)", gap: 4, alignItems: "center" }}>
                    <span />
                    {HEAT.scenes.map((s) => (
                      <span key={s} className="tiny muted-3" style={{ textAlign: "center", lineHeight: 1.3 }}>{s}</span>
                    ))}
                    {HEAT.emps.map((e, ri) => (
                      <React.Fragment key={e}>
                        <span className="tiny muted-3" style={{ textAlign: "right" }}>{e}</span>
                        {HEAT.v[ri].map((v, ci) => (
                          <button key={ci}
                            title={e + " · " + HEAT.scenes[ci] + " · " + v + "% · 点击查看明细"}
                            onClick={() => go({
                              domain: "quality", page: "qc",
                              payload: { emp: e, scene: HEAT.scenes[ci], pass1: v },
                              label: "质检台",
                              desc: e + " 在「" + HEAT.scenes[ci] + "」的一次通过率为 " + v + "%，已带入该组合的驳回明细。",
                            })}
                            style={{
                              height: 34, borderRadius: 3, cursor: "pointer",
                              border: "1px solid var(--line-soft)",
                              background: heatColor(v), opacity: 0.22 + (v - 70) / 40 * 0.55,
                              color: "var(--text)", fontFamily: "var(--font-mono)", fontSize: 10.5,
                            }}>{v}</button>
                        ))}
                      </React.Fragment>
                    ))}
                  </div>
                  <div className="hr" style={{ margin: "12px 0" }} />
                  <div className="spread tiny muted-3">
                    <span className="row" style={{ gap: 6 }}>低 <i style={{ width: 60, height: 6, borderRadius: 2, background: "var(--danger)", opacity: .55 }} /><i style={{ width: 60, height: 6, borderRadius: 2, background: "var(--warn)", opacity: .7 }} /><i style={{ width: 60, height: 6, borderRadius: 2, background: "var(--ok)", opacity: .8 }} /> 高</span>
                    <span>采集员 B @ 装配工位 最低 74.6%</span>
                  </div>
                </div>
              </Panel>

              <Panel title="异常与边界清单" sub="第 10 章 27 项，每项均给出可执行下一步 · 点击行跳转处置页"
                right={<Tag tone="ok" dot>100% 有出路</Tag>} flush>
                <div style={{ maxHeight: 232, overflow: "auto" }}>
                  <table className="table dense">
                    <thead><tr><th style={{ width: 40 }}>编号</th><th>场景</th><th>用户出路</th></tr></thead>
                    <tbody>
                      {D.EXCEPTIONS.map((x) => (
                        <tr key={x[0]} className="clickable"
                          onClick={() => go({ domain: "production", page: "upload", payload: { exception: x[0] }, label: "上传与校验", desc: "已带入异常项 " + x[0] + "（" + x[1] + "）的处置上下文。" })}>
                          <td className="mono muted-3">{x[0]}</td>
                          <td className="nowrap">{x[1]}</td>
                          <td className="muted pretty">{x[4]}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Panel>
            </div>
          </div>
        </div>
      </>
    );
  }

  /* ============================================================
     任务列表（源：8.3）
     ============================================================ */
  const TASK_COLS = [
    { k: "name", label: "任务名", w: "auto" }, { k: "customer", label: "客户" }, { k: "scene", label: "场景" },
    { k: "progress", label: "进度", num: true }, { k: "batches", label: "已上传批次", num: true },
    { k: "pass1", label: "一次通过率", num: true }, { k: "due", label: "交付日期", num: true }, { k: "status", label: "状态" },
  ];

  function TaskList({ app, set }) {
    const toast = window.UI.useToast();
    const [sort, setSort] = useState({ k: "due", asc: true });
    const [flt, setFlt] = useState("全部");
    const [detail, setDetail] = useState(null);
    const [checked, setChecked] = useState([]);
    const [view, setView] = useState("全部在产");

    const rows = useMemo(() => {
      let r = D.TASKS.slice();
      if (flt === "风险") r = r.filter((t) => t.risk !== "ok");
      if (flt === "采集中") r = r.filter((t) => t.status === "采集中");
      if (flt === "质检中") r = r.filter((t) => t.status === "质检中");
      r.sort((a, b) => {
        const x = a[sort.k], y = b[sort.k];
        const c = typeof x === "number" ? x - y : String(x).localeCompare(String(y), "zh");
        return sort.asc ? c : -c;
      });
      return r;
    }, [sort, flt]);

    useEffect(() => { if (app.payload && app.payload.create) setDetail({ create: true }); }, [app.payload]);

    return (
      <>
        <PageHead
          crumbs={[{ label: "生产" }, { label: "任务" }]}
          title="任务列表"
          desc="列固定为任务名、客户、场景、进度、已上传批次、一次通过率、交付日期、状态。表格支持按任意高频列排序并保存为视图。"
          meta={
            <>
              <Tag tone="quiet" icon="filter">当前视图：{view}</Tag>
              <Tag tone="quiet">共 {rows.length} 条</Tag>
              {checked.length ? <Tag tone="accent">已选 {checked.length} 条</Tag> : null}
            </>
          }
          actions={
            <>
              <Btn icon="bookmark" tone="ghost" onClick={() => toast.push({ tone: "ok", title: "视图已保存", desc: "「" + view + "」已保存到我的视图，下次进入自动套用。" })}>保存为视图</Btn>
              <Btn icon="plus" tone="primary" onClick={() => setDetail({ create: true })}>新建采集任务</Btn>
            </>
          }
        />
        <div className="pagebody">
          <div className="panel" style={{ overflow: "hidden" }}>
            <div className="panel-head" style={{ gap: 8 }}>
              <div className="row-tight" style={{ gap: 3 }}>
                {["全部", "风险", "采集中", "质检中"].map((f) => (
                  <button key={f} className="btn btn-sm" aria-pressed={flt === f}
                    style={flt === f ? { background: "var(--surface-3)", borderColor: "var(--line-strong)" } : null}
                    onClick={() => setFlt(f)}>{f}</button>
                ))}
              </div>
              <div className="hr" style={{ width: 1, height: 18, background: "var(--line)" }} />
              <div className="gsearch" style={{ flex: "0 1 260px", height: 26 }}>
                <Icon n="search" s={13} />
                <input placeholder="按任务名 / 客户 / 场景筛选" />
              </div>
              <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
                <span className="tiny muted-3" style={{ alignSelf: "center" }}>已选 {checked.length} 条</span>
                <Btn size="sm" tone="ghost" icon="download" disabled={!checked.length}
                  onClick={() => toast.push({ tone: "ok", title: "已导出明细", desc: "选中 " + checked.length + " 条任务的批次明细已导出为 CSV，失败项可单独下载原因。" })}>导出明细</Btn>
                <Btn size="sm" tone="ghost" icon="bell" disabled={!checked.length}
                  onClick={() => toast.push({ tone: "warn", title: "批量提醒已发送", desc: "已按任务责任人合并推送，同一任务 1 小时内不重复通知。" })}>批量催办</Btn>
              </div>
            </div>
            <table className="table">
              <thead>
                <tr>
                  <th style={{ width: 34 }}>
                    <label className="check">
                      <input type="checkbox" checked={checked.length === rows.length && rows.length > 0}
                        onChange={(e) => setChecked(e.target.checked ? rows.map((r) => r.id) : [])} />
                    </label>
                  </th>
                  {TASK_COLS.map((c) => (
                    <th key={c.k} className={cls(c.num && "num", "sortable")}
                      onClick={() => setSort((s) => ({ k: c.k, asc: s.k === c.k ? !s.asc : true }))}>
                      {c.label}
                      {sort.k === c.k ? <span className="sortcaret"><Icon n={sort.asc ? "arrowUp" : "arrowDown"} s={10} sw={2.2} /></span> : null}
                    </th>
                  ))}
                  <th style={{ width: 40 }} />
                </tr>
              </thead>
              <tbody>
                {rows.map((t) => (
                  <tr key={t.id} className={cls("clickable", checked.indexOf(t.id) >= 0 && "selected")}>
                    <td onClick={(e) => e.stopPropagation()}>
                      <label className="check">
                        <input type="checkbox" checked={checked.indexOf(t.id) >= 0}
                          onChange={(e) => setChecked(e.target.checked ? checked.concat([t.id]) : checked.filter((x) => x !== t.id))} />
                      </label>
                    </td>
                    <td onClick={() => set({ page: "detail", payload: { id: t.id } })}>
                      <div style={{ fontWeight: 600 }}>{t.name}</div>
                      <div className="tiny muted-3 mono">{t.id} · {t.spec} · {t.mode}</div>
                    </td>
                    <td className="nowrap" onClick={() => set({ page: "detail", payload: { id: t.id } })}>
                      <div>{t.customer}</div><div className="tiny muted-3">{t.embodiment}</div>
                    </td>
                    <td className="nowrap" onClick={() => set({ page: "detail", payload: { id: t.id } })}>{t.scene}</td>
                    <td className="num" onClick={() => set({ page: "detail", payload: { id: t.id } })}>{Math.round(t.progress * 100)}%</td>
                    <td className="num" onClick={() => set({ page: "detail", payload: { id: t.id } })}>{t.batches}</td>
                    <td className="num" onClick={() => set({ page: "detail", payload: { id: t.id } })}>
                      <span style={{ color: t.pass1 < 0.85 ? "var(--danger)" : t.pass1 >= 0.93 ? "var(--ok)" : "var(--text)" }}>
                        {(t.pass1 * 100).toFixed(1)}%
                      </span>
                    </td>
                    <td className="num" onClick={() => set({ page: "detail", payload: { id: t.id } })}>{t.due}</td>
                    <td onClick={() => set({ page: "detail", payload: { id: t.id } })}>
                      <Tag tone={t.risk === "danger" ? "danger" : t.risk === "warn" ? "warn" : t.status === "已交付" ? "ok" : "review"} dot>{t.status}</Tag>
                    </td>
                    <td>
                      <IconBtn n="more" title="更多操作" onClick={(e) => { e.stopPropagation(); toast.push({ tone: "info", title: "操作菜单", desc: "撤回任务 / 复制任务 / 查看数据血缘 / 归档。" }); }} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="panel-foot">
              <span>共 {rows.length} 条 · 每页 20 条</span>
              <span className="row" style={{ marginLeft: "auto", gap: 6 }}>
                <Btn size="sm" tone="ghost" icon="chevLeft" disabled>上一页</Btn>
                <span className="mono small">1 / 1</span>
                <Btn size="sm" tone="ghost" icon="chevRight" disabled>下一页</Btn>
              </span>
            </div>
          </div>
          <p className="tiny muted-3" style={{ marginTop: 10 }}>
            上下文保持：从列表进入详情再返回时，筛选条件、排序、滚动位置与分页均保留（原型中以视图状态模拟）。
          </p>
        </div>

        {detail && detail.create ? <CreateTaskWizard onClose={() => setDetail(null)} /> : null}
      </>
    );
  }

  /* ---------- 新建任务向导（源：7.1 七步 / 6.1 A4.2 三步向导） ---------- */
  const WIZ_STEPS = [
    "基本信息", "数据规格", "指派与排期", "下发前校验",
  ];

  function CreateTaskWizard({ onClose }) {
    const toast = window.UI.useToast();
    const [i, setI] = useState(0);
    const [nl, setNl] = useState("厨房台面把毛巾折叠两次并放到右侧托盘");
    const [name, setName] = useState("厨房台面折叠衣物（Ego）");
    const [mods, setMods] = useState(["RGB-D 头部", "腕部 RGB", "关节角度与力矩", "末端位姿", "触觉阵列"]);
    const [tight, setTight] = useState(false);
    const [saved, setSaved] = useState("12:31");

    useEffect(() => { const id = setTimeout(() => setSaved("刚刚"), 2500); return () => clearTimeout(id); }, []);

    const MODS = ["RGB-D 头部", "腕部 RGB", "激光雷达", "关节角度与力矩", "末端位姿", "IMU", "触觉阵列", "音频", "手柄状态"];
    const est = { n: 1200, hours: 6.4, man: 42 };

    const CHECKS = [
      ["规格模板已冻结", true], ["本体与设备可用", true], ["点位与人员无冲突", !tight],
      ["模态与本体组合受支持", true], ["质量阈值在可行区间", true], ["交付日期晚于估算工期", true],
      ["命名规范已套用", true], ["合规密级已标注", true],
    ];

    return (
      <Drawer
        title="新建采集任务"
        sub={<span className="row" style={{ gap: 6 }}><Icon n="check" s={11} /> 草稿已保存 {saved} <span className="muted-3">· 网络中断时本地暂存并持续重试</span></span>}
        onClose={onClose}
        width={640}
        foot={
          <>
            <Btn tone="ghost" onClick={onClose}>取消</Btn>
            <span className="grow" />
            <span className="tiny muted-3" style={{ alignSelf: "center" }}>步骤 {i + 1} / {WIZ_STEPS.length}</span>
            <Btn tone="ghost" icon="chevLeft" disabled={i === 0} onClick={() => setI(i - 1)}>上一步</Btn>
            {i < WIZ_STEPS.length - 1 ? (
              <Btn tone="primary" iconRight="chevRight" onClick={() => setI(i + 1)}>下一步</Btn>
            ) : (
              <Btn tone="primary" icon="send" onClick={() => { onClose(); toast.push({ tone: "ok", title: "任务已下发", desc: "任务卡已推送到 3 台采集端，状态变为已下发，等待采集员确认。24 小时未确认将自动升级通知现场督导。", action: { label: "查看任务", fn: () => {} } }); }}>确认下发</Btn>
            )}
          </>
        }
      >
        <div className="row" style={{ gap: 6 }}>
          {WIZ_STEPS.map((s, k) => (
            <button key={s} className="btn btn-sm" aria-pressed={k === i}
              style={k === i ? { background: "var(--accent)", borderColor: "var(--accent)", color: "#fff" } : k < i ? { borderColor: "var(--ok)", color: "var(--ok)" } : null}
              onClick={() => setI(k)}>{k + 1}. {s}</button>
          ))}
        </div>

        {i === 0 ? (
          <>
            <Field label="任务名" req>
              <input className="input" value={name} onChange={(e) => setName(e.target.value)} />
            </Field>
            <Field label="自然语言描述" hint="系统会翻译为结构化规格，翻译结果可见可改">
              <textarea className="textarea" rows={3} value={nl} onChange={(e) => setNl(e.target.value)} />
            </Field>
            <div className="panel-inset" style={{ padding: 11 }}>
              <div className="row" style={{ gap: 6, marginBottom: 8 }}>
                <Icon n="cpu" s={13} style={{ color: "var(--accent)" }} />
                <span className="small" style={{ fontWeight: 600 }}>解析结果（可逐项修改）</span>
                <Tag tone="quiet" style={{ marginLeft: "auto" }}>置信度 0.93</Tag>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {[["场景", "厨房 / 台面"], ["技能", "折叠衣物"], ["步骤数", "4"], ["目标物", "毛巾 ×1"], ["末端", "右侧托盘"], ["本体", "人形 · 双臂"]].map((c) => (
                  <span key={c[0]} className="check" style={{ border: "1px solid var(--line)", borderRadius: 4, padding: "3px 8px", background: "var(--surface-1)" }}>
                    <span className="tiny muted-3">{c[0]}</span><span className="small">{c[1]}</span>
                    <Icon n="edit" s={11} style={{ color: "var(--text-4)" }} />
                  </span>
                ))}
              </div>
            </div>
            <Field label="客户与项目" req>
              <select className="select"><option>恒立机器人 · 代号 B01 · 人形双臂数据线</option><option>瀚海工业 · 代号 B02</option><option>拓元精密 · 代号 B03</option></select>
            </Field>
            <div className="warnbox info">
              规格冻结是强约束而非提示：模板一经引用即冻结版本，选择器内只可预览不可编辑。需要修改时系统引导另存为新版本，原任务与历史批次仍指向旧版本。
            </div>
          </>
        ) : null}

        {i === 1 ? (
          <>
            <div className="spread">
              <Field label="规格模板" req className="grow">
                <select className="select"><option>EGO-KITCH-02 v1.2（当前最新）</option><option>EGO-KITCH-02 v1.1</option></select>
              </Field>
              <Tag tone="accent" icon="lock" style={{ marginTop: 22, height: 24 }}>已引用并冻结 v1.2</Tag>
            </div>
            <Field label="采集模式" req hint="四种模式共用同一套规格与质检口径">
              <select className="select" defaultValue="示教采集">
                <option>示教采集</option><option>自动回放采集</option><option>触发式采集（接触或到达位置自动起停）</option><option>正负样本统一采集</option>
              </select>
            </Field>
            <Field label="传感器模态" hint="勾选后实时估算产量与工时">
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 2 }}>
                {MODS.map((m) => (
                  <label key={m} className="check" style={{ border: "1px solid var(--line)", borderRadius: 4, padding: "4px 9px", background: mods.indexOf(m) >= 0 ? "var(--accent-dim)" : "var(--surface-1)", borderColor: mods.indexOf(m) >= 0 ? "var(--accent-line)" : "var(--line)" }}>
                    <input type="checkbox" checked={mods.indexOf(m) >= 0}
                      onChange={(e) => setMods(e.target.checked ? mods.concat([m]) : mods.filter((x) => x !== m))} />
                    <span className="small" style={{ color: mods.indexOf(m) >= 0 ? "var(--accent-hi)" : "var(--text-2)" }}>{m}</span>
                  </label>
                ))}
              </div>
            </Field>
            <div className="grid g-3">
              <div className="panel-inset" style={{ padding: 11 }}>
                <div className="tiny muted-3">预计条数</div>
                <div className="mono" style={{ fontSize: 21, fontWeight: 600 }}>{est.n}</div>
              </div>
              <div className="panel-inset" style={{ padding: 11 }}>
                <div className="tiny muted-3">预计有效时长</div>
                <div className="mono" style={{ fontSize: 21, fontWeight: 600 }}>{est.hours}h</div>
              </div>
              <div className="panel-inset" style={{ padding: 11 }}>
                <div className="tiny muted-3">预计人时</div>
                <div className="mono" style={{ fontSize: 21, fontWeight: 600, color: "var(--warn)" }}>{est.man}h</div>
              </div>
            </div>
            <p className="tiny muted-3" style={{ lineHeight: 1.7 }}>
              产量估算反向影响规格：勾选高采样率、多模态、长时长时，系统同时给出预计人时与设备占用，让方案制定者在规格与产能之间做显式权衡，而不是下发后才发现排不下。
            </p>
            <Switch checked={tight} onChange={setTight} label="收紧目标可见率阈值至 85%（默认 70%）" />
            {tight ? <div className="warnbox">收紧后预计一次通过率下降 6–9 pt，人时上升约 18%。该变更会以橙色标记并写入成本影响说明。</div> : null}
          </>
        ) : null}

        {i === 2 ? (
          <>
            <Field label="点位" req>
              <select className="select"><option>厨房 / 台面 K2（今日负荷 78%）</option><option>厨房 / 台面 K3（今日负荷 34%）</option></select>
            </Field>
            <Field label="采集员" req hint="冲突行内显示黄色提示与当日负荷">
              <select className="select"><option>采集员 A（当日负荷 82%）</option><option>采集员 B（当日负荷 96%）</option><option>采集员 C（当日负荷 41%）</option></select>
            </Field>
            {!tight ? null : null}
            <div className="warnbox" style={{ display: "flex", gap: 8 }}>
              <Icon n="warn" s={14} style={{ flex: "0 0 auto", marginTop: 1 }} />
              <span>采集员 B 在 09-16 14:00–18:00 已被 TK-2409-009 占用。若选择该人员，可调整时段、更换人员，或查看当日负荷后确认。</span>
            </div>
            <div className="grid g-2">
              <Field label="交付日期" req><input className="input mono" defaultValue="2026-09-19" /></Field>
              <Field label="抽检策略"><select className="select"><option>按采集员与风险等级（推荐）</option><option>固定比例 10%</option><option>全检</option></select></Field>
            </div>
            <Field label="质量要求" hint="从规则库带出默认阈值，允许收紧">
              <div className="panel-inset" style={{ padding: 11 }}>
                {[["QC-FRAME-01 有效帧占比", "≥ 80%", false], ["QC-VIS-01 目标可见率", tight ? "≥ 85%" : "≥ 70%", tight],
                  ["QC-MOT-01 静止段占比", "≤ 30%", false], ["QC-ALIGN-01 观测与动作偏差", "≤ 2 帧", false]].map((r) => (
                  <div key={r[0]} className="spread" style={{ padding: "5px 0", borderBottom: "1px solid var(--line-soft)" }}>
                    <span className="small muted">{r[0]}</span>
                    <span className="mono small" style={{ color: r[2] ? "var(--warn)" : "var(--text)" }}>
                      {r[1]}{r[2] ? <span className="tiny" style={{ marginLeft: 6 }}>已收紧</span> : null}
                    </span>
                  </div>
                ))}
              </div>
            </Field>
          </>
        ) : null}

        {i === 3 ? (
          <>
            <div className="spread">
              <span className="small" style={{ fontWeight: 600 }}>下发前校验（8 项）</span>
              <Tag tone={tight ? "warn" : "ok"} dot>{tight ? "1 项未通过" : "全部通过"}</Tag>
            </div>
            <div style={{ border: "1px solid var(--line)", borderRadius: 4, overflow: "hidden" }}>
              {CHECKS.map((c, k) => (
                <div key={k} className="spread" style={{ padding: "9px 11px", borderBottom: k < CHECKS.length - 1 ? "1px solid var(--line-soft)" : 0, background: !c[1] ? "var(--warn-dim)" : "transparent" }}>
                  <span className="row" style={{ gap: 8 }}>
                    <Icon n={c[1] ? "check" : "warn"} s={13} style={{ color: c[1] ? "var(--ok)" : "var(--warn)" }} />
                    <span className="small" style={{ color: c[1] ? "var(--text-2)" : "var(--warn)" }}>{c[0]}</span>
                  </span>
                  {c[1] ? <span className="tiny muted-3">通过</span> : (
                    <span className="row" style={{ gap: 8 }}>
                      <span className="tiny" style={{ color: "var(--warn)" }}>缺：点位 K3 未被指派人员</span>
                      <Btn size="sm" tone="ghost" icon="arrowRight" onClick={() => setI(2)}>去修正</Btn>
                    </span>
                  )}
                </div>
              ))}
            </div>
            <p className="tiny muted-3" style={{ lineHeight: 1.7 }}>
              下发校验清单必须可解释——未通过项不能只说「校验失败」，而要写清缺什么、去哪补、补完是否还需重新校验。
            </p>
            <div className="warnbox info">
              下发后采集员 24 小时未确认时，系统自动升级通知现场督导，避免任务挂在无人认领的状态。
            </div>
          </>
        ) : null}
      </Drawer>
    );
  }

  /* ============================================================
     任务详情 · 时间线（源：8.3）
     ============================================================ */
  function TaskDetail({ app, set }) {
    const toast = window.UI.useToast();
    const t = D.TASKS.filter((x) => x.id === (app.payload && app.payload.id))[0] || D.TASKS[0];
    const steps = t.steps && t.steps.length ? t.steps : [
      { k: "创建", t: "09-11 09:20", who: "项目经理", out: "任务已创建", st: "done", note: "" },
      { k: "已下发", t: "09-11 09:41", who: "项目经理", out: "任务卡已推送", st: "done", note: "" },
      { k: "已确认", t: "09-11 10:02", who: "采集员 A", out: "确认接收", st: "done", note: "" },
      { k: "采集中", t: "09-11 10:30 起", who: "采集组", out: t.done + " / " + t.plan + " 条", st: "active", note: "" },
      { k: "上传中", t: "持续", who: "系统", out: "队列 0", st: "active", note: "" },
      { k: "质检中", t: "09-13 14:00 起", who: "质检员", out: "已判定 " + Math.round(t.done * 0.8) + " 条", st: "active", note: "" },
      { k: "标注中", t: "09-14 09:00 起", who: "标注组", out: "已提交 " + Math.round(t.done * 0.6) + " 条", st: "active", note: "" },
      { k: "待建集", t: "—", who: "—", out: "—", st: "wait", note: "" },
      { k: "已交付", t: "—", who: "—", out: "—", st: "wait", note: "" },
    ];

    return (
      <>
        <PageHead
          crumbs={[{ label: "生产", to: () => set({ page: "tasks" }) }, { label: "任务", to: () => set({ page: "tasks" }) }, { label: t.id }]}
          title={t.name}
          desc="详情页按时间线组织，而非按字段堆叠。每个节点显示责任人、时间与产出数量。争议与异常事件作为插叙节点出现在时间线上，使「这个任务到底卡在哪」一眼可见。"
          meta={
            <>
              <Tag tone="quiet" icon="user">{t.customer} · {t.code}</Tag>
              <Tag tone="quiet" icon="pin">{t.scene}</Tag>
              <Tag tone="quiet" icon="robot">{t.embodiment}</Tag>
              <Tag tone="quiet" icon="cube">{t.spec}</Tag>
              <Tag tone="accent" icon="lock">规格已冻结</Tag>
              <Tag tone={t.risk === "danger" ? "danger" : t.risk === "warn" ? "warn" : "ok"} dot>{t.status}</Tag>
            </>
          }
          actions={
            <>
              <Btn icon="bell" tone="ghost" onClick={() => toast.push({ tone: "info", title: "已订阅该任务", desc: "状态变化、驳回、交期风险将按分级规则通知你。" })}>订阅动态</Btn>
              <Btn icon="download" tone="ghost" onClick={() => toast.push({ tone: "ok", title: "批次明细已导出", desc: "任务 " + t.id + " 的批次明细已导出为 CSV。" })}>导出批次</Btn>
              <Btn tone="ghost" icon="more">更多</Btn>
            </>
          }
        />
        <div className="pagebody">
          <div className="grid g-4" style={{ marginBottom: 14 }}>
            <div className="panel-inset" style={{ padding: 12 }}>
              <div className="tiny muted-3">进度</div>
              <div className="mono" style={{ fontSize: 23, fontWeight: 600 }}>{Math.round(t.progress * 100)}%</div>
              <div className={cls("bar", t.risk === "danger" ? "danger" : t.risk === "warn" ? "warn" : "")} style={{ marginTop: 8 }}><i style={{ width: t.progress * 100 + "%" }} /></div>
            </div>
            <div className="panel-inset" style={{ padding: 12 }}>
              <div className="tiny muted-3">一次通过率</div>
              <div className="mono" style={{ fontSize: 23, fontWeight: 600, color: t.pass1 < 0.85 ? "var(--danger)" : "var(--text)" }}>{(t.pass1 * 100).toFixed(1)}%</div>
              <div className="tiny muted-3" style={{ marginTop: 8 }}>{t.pass1d > 0 ? "较上周 +" : "较上周 "}{(t.pass1d * 100).toFixed(1)} pt</div>
            </div>
            <div className="panel-inset" style={{ padding: 12 }}>
              <div className="tiny muted-3">已上传批次</div>
              <div className="mono" style={{ fontSize: 23, fontWeight: 600 }}>{t.batches}</div>
              <div className="tiny muted-3" style={{ marginTop: 8 }}>共 {t.plan} 条计划量</div>
            </div>
            <div className="panel-inset" style={{ padding: 12 }}>
              <div className="tiny muted-3">交付日期</div>
              <div className="mono" style={{ fontSize: 23, fontWeight: 600, color: t.risk !== "ok" ? "var(--warn)" : "var(--text)" }}>{t.due}</div>
              <div className="tiny muted-3" style={{ marginTop: 8 }}>责任人 {t.owner}</div>
            </div>
          </div>

          <div className="detail-split">
            <Panel title="任务时间线" sub="异常与争议作为插叙节点" flush>
              <div style={{ padding: "16px 16px 8px" }}>
                <div className="tlflow">
                  {steps.map((s, i) => (
                    <div key={i} className={cls("tlflow-node", s.st === "active" ? "active" : s.st === "done" ? "done" : s.st === "insert" ? "insert" : s.st === "blocked" ? "blocked" : "")}>
                      <div className="tlflow-rail">
                        <span className="tlflow-dot">{s.st === "done" ? <Icon n="check" s={12} sw={2.6} /> : s.st === "active" ? <Icon n="activity" s={12} /> : s.st === "insert" ? "" : "·"}</span>
                        {i < steps.length - 1 ? <span className="tlflow-line" /> : null}
                      </div>
                      <div className="tlflow-body">
                        <div className="spread">
                          <span className="row" style={{ gap: 8 }}>
                            <span style={{ fontSize: 13, fontWeight: 600 }}>{s.k}</span>
                            {s.st === "active" ? <Tag tone="accent" dot>进行中</Tag> : null}
                            {s.st === "insert" ? <Tag tone="warn" dot>插叙事件</Tag> : null}
                            {s.st === "wait" ? <Tag tone="quiet">未开始</Tag> : null}
                          </span>
                          <span className="tiny muted-3 mono nowrap">{s.t}</span>
                        </div>
                        <div className="row" style={{ marginTop: 5, gap: 10, flexWrap: "wrap" }}>
                          <span className="tiny muted-3"><Icon n="user" s={11} /> {s.who}</span>
                          <span className="tiny muted-3"><Icon n="arrowRight" s={11} /> {s.out}</span>
                        </div>
                        {s.note ? <div className="small muted pretty" style={{ marginTop: 6, paddingLeft: 10, borderLeft: "2px solid var(--line-strong)" }}>{s.note}</div> : null}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Panel>

            <div className="col" style={{ gap: 14 }}>
              <Panel title="规格与口径" flush>
                <div style={{ padding: 14 }}>
                  <DL rows={[
                    ["规格模板", t.spec], ["采集模式", t.mode], ["本体", t.embodiment],
                    ["场景", t.scene], ["命名规范", "SPEC-NAMING-v3"], ["密级", "内部 · 客户可见"],
                    ["合规", "人像与工牌脱敏已开启"], ["抽检比例", "按风险等级 10% / 30% / 100%"],
                  ]} />
                </div>
              </Panel>

              <Panel title="批次" sub={"共 " + t.batches + " 个"} flush>
                <table className="table dense">
                  <thead><tr><th>批次</th><th className="num">条数</th><th className="num">通过率</th><th>状态</th></tr></thead>
                  <tbody>
                    {["BAT-2409-0111", "BAT-2409-0112", "BAT-2409-0113", "BAT-2409-0114", "BAT-2409-0115", "BAT-2409-0116"].slice(0, 6).map((b, i) => (
                      <tr key={b} className="clickable" onClick={() => set({ page: "upload" })}>
                        <td className="mono">{b}</td>
                        <td className="num">{180 + i * 12}</td>
                        <td className="num" style={{ color: i === 5 ? "var(--warn)" : "" }}>{(92 - i * 1.4).toFixed(1)}%</td>
                        <td>{i === 5 ? <Tag tone="warn" dot>校验中</Tag> : <Tag tone="ok" dot>已入库</Tag>}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Panel>

              <Panel title="危险区" sub="删除、撤回类操作统一置于独立区" className="dangerzone" flush>
                <div style={{ padding: 14, display: "flex", flexDirection: "column", gap: 8 }}>
                  <Btn tone="danger" icon="x" block onClick={() => toast.push({ tone: "warn", title: "撤回需二次确认", desc: "撤回将影响采集端已下发但未完成的片段，需先选择处理方式。" })}>撤回已下发任务</Btn>
                  <Btn tone="danger" icon="trash" block onClick={() => toast.push({ tone: "warn", title: "已拦截", desc: "任务下已有入库数据，删除前需先走影响面分析。" })}>删除任务</Btn>
                </div>
              </Panel>
            </div>
          </div>
        </div>
      </>
    );
  }

  /* ============================================================
     上传与自动校验（源：7.3）
     ============================================================ */
  function UploadCenter({ app, set }) {
    const toast = window.UI.useToast();
    const [sel, setSel] = useState(D.UPLOAD_ROWS[2].id);
    const [compare, setCompare] = useState(false);
    const row = D.UPLOAD_ROWS.filter((r) => r.id === sel)[0] || D.UPLOAD_ROWS[0];
    const toneOf = (s) => (s === "ok" ? "ok" : s === "warn" ? "warn" : s === "danger" ? "danger" : "review");
    const labelOf = (s) => (s === "ok" ? "通过" : s === "warn" ? "有条件通过" : s === "danger" ? "不通过" : "待裁决 / 待补校验");

    return (
      <>
        <PageHead
          crumbs={[{ label: "生产" }, { label: "上传与校验" }]}
          title="上传与自动校验中心"
          desc="把「数据是否合格」的判断前移到上传环节，让不合格数据根本不进入生产队列。三态结论而非两态，每条不通过都必须能一跳定位到具体帧或具体字段。"
          meta={
            <>
              <Tag tone="ok" dot>通过 412</Tag>
              <Tag tone="warn" dot>有条件通过 7</Tag>
              <Tag tone="danger" dot>不通过 3</Tag>
              <Tag tone="review" dot>待裁决 2</Tag>
              <Tag tone="quiet" icon="link">接入契约已绑定</Tag>
              <Tag tone="quiet" icon="clock">校验队列 0 · 平均耗时 34 秒</Tag>
            </>
          }
          actions={
            <Btn icon="upload" tone="primary" onClick={() => toast.push({ tone: "info", title: "已加入上传队列", desc: "分片上传已开始，支持断点续传与内容指纹秒传。" })}>上传数据</Btn>
          }
        />
        <div className="pagebody flush">
          <div className="wb wb-2" style={{ height: "100%" }}>
            <div className="wb-col">
              <div className="wb-head">
                <span className="small" style={{ fontWeight: 600 }}>上传队列</span>
                <Tag tone="quiet">批次 BAT-2409-0116</Tag>
                <span className="grow" />
                <Btn size="sm" tone="ghost" icon="filter">筛选</Btn>
              </div>
              <div className="wb-body">
                <table className="table dense">
                  <thead><tr><th>数据单元</th><th className="num">体积</th><th className="num">时长</th><th>结论</th></tr></thead>
                  <tbody>
                    {D.UPLOAD_ROWS.map((r) => (
                      <tr key={r.id} className={cls("clickable", r.id === sel && "selected")} onClick={() => setSel(r.id)}>
                        <td>
                          <div className="mono">{r.id}</div>
                          <div className="tiny muted-3">{r.task}</div>
                        </td>
                        <td className="num">{r.size}</td>
                        <td className="num">{r.dur}</td>
                        <td><Tag tone={toneOf(r.state)} dot>{r.step}</Tag></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div style={{ padding: 14 }}>
                  <div className="warnbox info" style={{ display: "flex", gap: 8 }}>
                    <Icon n="info" s={14} style={{ flex: "0 0 auto", marginTop: 1 }} />
                    <span>校验服务本身失败时，条目标记为「待补校验」而非「不通过」，服务恢复后自动重跑，不误伤数据。</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="wb-col scrollable">
              <div className="wb-head">
                <span className="mono small">{row.id}</span>
                <Tag tone={toneOf(row.state)} dot>{labelOf(row.state)}</Tag>
                <span className="grow" />
                <Btn size="sm" tone="ghost" icon="external" onClick={() => set({ page: "browser", payload: { id: row.id } })}>打开数据浏览器</Btn>
              </div>
              <div className="wb-body">
                <div style={{ padding: 14, display: "flex", flexDirection: "column", gap: 14 }}>
                  {/* 校验步骤条 */}
                  <div>
                    <div className="spread" style={{ marginBottom: 8 }}>
                      <span className="field-label" style={{ margin: 0 }}>校验流水线（源：D3.1）</span>
                      <span className="row tiny muted-3" style={{ gap: 5 }}>
                        <Icon n="cpu" s={11} /> 校验引擎 QC-ENGINE v3.4 · 规则集 QC-RULES-v3 · 契约 CONTRACT-v1
                      </span>
                    </div>
                    <div className="row" style={{ gap: 4, flexWrap: "wrap" }}>
                      {["解封装", "时间对齐", "Schema", "命名", "去重", "抽帧", "脱敏", "一致性"].map((s, i) => (
                        <div key={s} className="row-tight" style={{ gap: 4 }}>
                          <Tag tone={row.state === "danger" && i >= 4 ? "danger" : row.state === "review" && i >= 4 ? "review" : "ok"} icon={row.state === "danger" && i === 4 ? "x" : "check"}>{s}</Tag>
                          {i < 7 ? <Icon n="chevRight" s={10} style={{ color: "var(--text-4)" }} /> : null}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 契约级校验：在解封装之前先跑，不合契约的消息根本进不来 */}
                  <div>
                    <div className="spread" style={{ marginBottom: 8 }}>
                      <span className="field-label" style={{ margin: 0 }}>契约级校验</span>
                      <span className="row tiny muted-3" style={{ gap: 5 }}>
                        <Icon n="link" s={11} /> 依「接入契约」逐条判定 · 入库即拒
                      </span>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      {[
                        ["消息类型带 header，时间域取创建时刻", true, "契约 §ROS2 主题契约"],
                        ["必填字段齐备且类型匹配（position / data / K）", true, "契约 §字段抽取"],
                        ["边界值校验：载荷无 NaN / Inf", row.state !== "danger", "契约 §边界校验"],
                        ["跨流对齐偏差 ≤ 1 帧（依 header.stamp）", row.state === "ok", "契约 §时间对齐"],
                      ].map((c) => (
                        <div key={c[0]} className="spread" style={{ padding: "8px 10px", border: "1px solid var(--line)", borderRadius: 4, background: c[1] ? "transparent" : "var(--warn-dim)" }}>
                          <span className="row" style={{ gap: 8 }}>
                            <Icon n={c[1] ? "check" : "warn"} s={13} style={{ color: c[1] ? "var(--ok)" : "var(--warn)" }} />
                            <span className="small" style={{ color: c[1] ? "var(--text-2)" : "var(--warn)" }}>{c[0]}</span>
                          </span>
                          <span className="tiny muted-3 nowrap">{c[2]}</span>
                        </div>
                      ))}
                    </div>
                    <div className="tiny muted-3" style={{ marginTop: 8, lineHeight: 1.65 }}>
                      契约校验排在流水线最前：无 header 或含 NaN / Inf 的消息在这里就被拒绝入库，而不是走完去重、抽帧、脱敏再回溯。
                    </div>
                  </div>

                  {/* 证据 */}
                  {row.evidences ? (
                    <div>
                      <div className="spread" style={{ marginBottom: 8 }}>
                        <span className="field-label">逐项证据<span className="req">·</span></span>
                        <span className="tiny muted-3">点击证据直接跳转到问题帧或问题字段</span>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                        {row.evidences.map((e, i) => (
                          <button key={i} className="panel" style={{ textAlign: "left", cursor: "pointer", background: "var(--surface-1)" }}
                            onClick={() => set({ page: "browser", payload: { id: row.id, t: e.t } })}>
                            <div className="spread" style={{ padding: "9px 11px" }}>
                              <div>
                                <div className="row" style={{ gap: 7 }}>
                                  <span className="codechip">{e.rule}</span>
                                  <span className="small">{e.k}</span>
                                </div>
                                <div className="mono small" style={{ marginTop: 4, color: "var(--danger)" }}>{e.v}</div>
                              </div>
                              <span className="row" style={{ gap: 6, flex: "0 0 auto" }}>
                                <span className="tiny muted-3 mono">{e.jump}</span>
                                <Icon n="arrowRight" s={13} style={{ color: "var(--accent)" }} />
                              </span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="panel-inset" style={{ padding: 12 }}>
                      <div className="row" style={{ gap: 8 }}>
                        <Icon n="check" s={15} style={{ color: "var(--ok)" }} />
                        <div>
                          <div className="small" style={{ fontWeight: 600 }}>{row.note}</div>
                          <div className="tiny muted-3" style={{ marginTop: 3 }}>无需人工介入，已进入生产队列。</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {row.note && row.evidences ? (
                    <div className={cls("warnbox", row.state === "danger" ? "danger" : "")}>{row.note}</div>
                  ) : null}

                  {/* 三态放行 */}
                  <div>
                    <div className="field-label" style={{ marginBottom: 8 }}>三态结论</div>
                    <div className="grid g-3">
                      {[["通过", "ok"], ["有条件通过", "warn"], ["不通过", "danger"]].map(([k, tone]) => (
                        <div key={k} className="panel-inset" style={{ padding: 10, borderLeft: "3px solid var(--" + tone + ")" }}>
                          <div className="small" style={{ fontWeight: 600, color: "var(--" + tone + ")" }}>{k}</div>
                          <div className="tiny muted-3" style={{ marginTop: 4, lineHeight: 1.6 }}>
                            {k === "通过" ? "全部规则命中合格，直接入库" : k === "有条件通过" ? "可忽略但需留痕，例如轻微过曝" : "任一阻断或驳回级规则命中"}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 派生动作 */}
                  <Panel title="派生动" sub="由结论决定下一步" flush>
                    <div style={{ padding: 12, display: "flex", flexDirection: "column", gap: 8 }}>
                      {row.state === "danger" ? (
                        <>
                          <Btn tone="primary" icon="refresh" block
                            onClick={() => toast.push({ tone: "warn", title: "重采任务已生成", desc: "已预填原因码 RC-FRAME-01 / RC-VIS-01、差异说明与指派对象「采集员 B」，并跳转到任务详情。" })}>生成重采任务（预填原因码与指派）</Btn>
                          <div className="tiny muted-3">将预填：原因码 ×2 · 问题帧 ×3 · 指派对象 采集员 B · 规格 EGO-KITCH-02 v1.2</div>
                        </>
                      ) : row.dup ? (
                        <>
                          <Btn tone="primary" icon="copy" block onClick={() => setCompare(true)}>并排对比后裁决</Btn>
                          <div className="tiny muted-3">重复检测给并排对比而非自动删除：相似度超阈时由人决定，因为看起来像不等于是同一条。</div>
                        </>
                      ) : row.state === "warn" ? (
                        <>
                          <Btn tone="primary" icon="check" block
                            onClick={() => toast.push({ tone: "ok", title: "已按有条件通过放行", desc: "已记录留痕：QC-LIGHT-01，轻微过曝 6.1%。该留痕将进入质量报告的「已知限制」。", action: { label: "撤销", fn: () => toast.push({ tone: "info", title: "已撤销放行", desc: "" }) } })}>按有条件通过放行并留痕</Btn>
                          <div className="tiny muted-3">留痕地点：CLP 元数据 + 质量报告「已知限制」章节。</div>
                        </>
                      ) : row.step === "旁路通道" ? (
                        <>
                          <Btn tone="primary" icon="external" block onClick={() => toast.push({ tone: "info", title: "已生成直传凭据", desc: "对象存储直传 URL 有效期 24 小时，上传完成后自动回到本队列继续校验。" })}>走对象存储直传</Btn>
                          <div className="tiny muted-3">超过浏览器上传阈值的数据不硬传，避免用户卡在一个做不到的操作上。</div>
                        </>
                      ) : (
                        <div className="tiny muted-3">本条目无需人工介入。</div>
                      )}
                    </div>
                  </Panel>
                </div>
              </div>
            </div>
          </div>
        </div>

        {compare ? (
          <Modal
            title="疑似重复 · 并排对比裁决"
            desc="相似度 0.972，超过阈值 0.95。系统不自动删除，由人决定。"
            onClose={() => setCompare(false)}
            width={760}
            foot={
              <>
                <Btn tone="ghost" onClick={() => setCompare(false)}>暂不处理</Btn>
                <span className="grow" />
                <Btn tone="danger" onClick={() => { setCompare(false); toast.push({ tone: "warn", title: "已丢弃为新条目", desc: "CLP-88415 已标记丢弃，保留 30 天可撤回。" }); }}>丢弃新条目</Btn>
                <Btn tone="primary" onClick={() => { setCompare(false); toast.push({ tone: "ok", title: "已保留两条", desc: "CLP-88415 已保留并入库；确认为真实重复时可后续批量去重。" }); }}>两条都保留</Btn>
              </>
            }
          >
            <div className="grid g-2" style={{ gap: 12 }}>
              {[["CLP-88415（新）", 0.62], ["CLP-87120（库内）", 0.58]].map(([n, t], i) => (
                <div key={i}>
                  <div className="spread" style={{ marginBottom: 6 }}>
                    <span className="mono small">{n}</span>
                    <Tag tone={i ? "quiet" : "warn"}>{i ? "库内已有" : "本次上传"}</Tag>
                  </div>
                  <div className="player" style={{ height: 180 }}>
                    <SceneFrame view="exo" t={t} />
                  </div>
                  <DL rows={[["场景", "厨房 / 台面 K2"], ["时长", i ? "06:14" : "06:12"], ["采集员", i ? "采集员 A" : "采集员 A"], ["采集时间", i ? "09-08 15:22" : "09-11 14:02"], ["内容指纹", i ? "sha256:8c1d…" : "sha256:b2f7…"]]} />
                </div>
              ))}
            </div>
            <div className="warnbox info">差异点：动作段边界相差 2 帧（01:12.4 vs 01:14.1），其余元数据一致。两条对应同一场景的同一次操作，但是两次独立录制。</div>
          </Modal>
        ) : null}
      </>
    );
  }

  /* ============================================================
     语义检索与取数（源：7.7）
     ============================================================ */

  /* 检索解析与筛选：口径与 D.SEARCH_FACETS 同源；纯函数、结果可预测 */
  function mmss(s) {
    const p = String(s).split(":");
    return (parseInt(p[0], 10) || 0) * 60 + (parseInt(p[1], 10) || 0);
  }
  // 自然语言 → 结构化条件（场景 / 技能 / 结果 / 质量分层 / 本体 / 视角 / 质量分下限 / 时长区间）
  function parseSearch(text) {
    const t = String(text || "").toLowerCase();
    const c = {};
    D.SEARCH_FACETS.forEach((g) => { c[g.key] = []; });
    D.SEARCH_FACETS.forEach((g) => {
      if (g.key === "view") return; // 视角另按词边界处理，避免 "ego / exo" 误命中
      g.vals.forEach((o) => {
        if ((o.syn || []).some((s) => t.indexOf(String(s).toLowerCase()) >= 0)) c[g.key].push(o.v);
      });
    });
    if (/\bego\b/.test(t) || t.indexOf("第一人称") >= 0) c.view.push("Ego");
    if (/\bexo\b/.test(t) || t.indexOf("第三人称") >= 0) c.view.push("Exo");
    let m = t.match(/(?:质量分|分数|得分)\s*(?:下限)?\s*[≥>=大于]*\s*(\d{1,3})/);
    if (!m) m = t.match(/(\d{1,3})\s*分(?:以上|及以上)/);
    c.minScore = m ? Math.max(0, Math.min(100, parseInt(m[1], 10))) : null;
    // 时长区间：内部统一以「秒」为准；自然语言可写 秒 / 分钟（1 分钟 = 60 秒，显式换算）
    const durM = t.match(/(?:时长\s*)?(\d{1,3}(?:\.\d)?)\s*(秒|分钟|分)?\s*(?:到|至|-|–|~)\s*(\d{1,3}(?:\.\d)?)\s*(秒|分钟|分)?/);
    if (durM && (durM[2] || durM[4])) {
      const mul = (durM[4] || durM[2]) === "秒" ? 1 : 60;
      c.dur = [Math.round(parseFloat(durM[1]) * mul), Math.round(parseFloat(durM[3]) * mul)];
    } else c.dur = null;
    return c;
  }
  // 解析条件与手工条件合并：手工一经触碰即接管该组（避免「点了取消又弹回来」）
  function mergeConds(parsed, manual) {
    const out = {};
    D.SEARCH_FACETS.forEach((g) => {
      out[g.key] = manual.hasOwnProperty(g.key) ? manual[g.key] : (parsed[g.key] || []);
    });
    out.minScore = manual.hasOwnProperty("minScore") ? manual.minScore : parsed.minScore;
    out.dur = manual.hasOwnProperty("dur") ? manual.dur : parsed.dur;
    return out;
  }
  const SEARCH_STOP = ["场景", "里", "的", "那几条", "几条", "只要", "以上", "以下", "秒", "条", "只", "要", "这", "些", "和", "与", "或", "数据", "样本", "给我", "找", "查", "搜", "所有", "全部", "时长", "质量分", "分数", "得分"];
  function hitText(h) {
    return [h.id, h.scene, h.embody, h.skill, h.emb, h.q, h.emp, (h.tags || []).join(" ")].join(" ").toLowerCase();
  }
  function condsActive(c) {
    return D.SEARCH_FACETS.some((g) => (c[g.key] || []).length) || c.minScore != null || c.dur != null;
  }
  function filterHits(list, c, text) {
    if (!condsActive(c)) {
      // 无结构化条件：退化为关键词包含匹配（任一命中），不把自然语言整句当精确条件
      const toks = String(text || "").toLowerCase().split(/[\s,，、。;；:：/]+/).map((s) => s.trim())
        .filter((s) => s.length >= 2 && SEARCH_STOP.indexOf(s) < 0);
      if (!toks.length) return list.slice();
      return list.filter((h) => { const hs = hitText(h); return toks.some((tk) => hs.indexOf(tk) >= 0); });
    }
    return list.filter((h) => {
      if (c.scene.length && c.scene.indexOf(h.scene) < 0) return false;
      if (c.skill.length && c.skill.indexOf(h.skill) < 0) return false;
      if (c.embody.length && c.embody.indexOf(h.embody) < 0) return false;
      if (c.view.length && c.view.indexOf(h.emb) < 0) return false;
      if (c.quality.length && c.quality.indexOf(h.q) < 0) return false;
      if (c.result.length && !c.result.some((r) => (h.tags || []).indexOf(r) >= 0)) return false;
      if (c.minScore != null && h.score < c.minScore) return false;
      if (c.dur) { const s = mmss(h.dur); if (s < c.dur[0] || s > c.dur[1]) return false; }
      return true;
    });
  }
  function minLabel(sec) {
    // 秒 → 分钟展示（去掉多余小数）
    return String(Math.round((sec / 60) * 100) / 100);
  }
  function chipList(c) {
    const out = [];
    D.SEARCH_FACETS.forEach((g) => (c[g.key] || []).forEach((v) => out.push({ key: g.key, group: g.k, value: v })));
    if (c.minScore != null) out.push({ key: "minScore", group: "质量分", value: "≥ " + c.minScore });
    if (c.dur) out.push({ key: "dur", group: "时长", value: minLabel(c.dur[0]) + "–" + minLabel(c.dur[1]) + " 分钟" });
    return out;
  }

  function SearchPage({ app, set }) {
    const toast = window.UI.useToast();
    // 顶栏检索把问题带进来，检索页必须承接，否则「在顶栏搜完还要在页内再输一遍」
    const [q, setQ] = useState((app.payload && app.payload.q) || "厨房场景里叠衣服失败的那几条，只要质量分 70 以上、时长 5 分钟到 8 分钟");
    // manual = 手工结构化条件；未触碰的组由 query 解析结果接管，两者合并成最终条件
    const [manual, setManual] = useState({});
    // 选择篮必须与顶栏常驻计数同源，否则「跨页累积」名不副实
    const basket = app.basket || [];
    const setBasket = (v) => set({ basket: typeof v === "function" ? v(basket) : v });
    const [slow, setSlow] = useState(false);
    const parsed = useMemo(() => parseSearch(q), [q]);
    const conds = useMemo(() => mergeConds(parsed, manual), [parsed, manual]);
    const hits = useMemo(() => filterHits(D.SEARCH_HITS, conds, q).slice().sort((a, b) => b.score - a.score), [conds, q]);
    const chips = useMemo(() => chipList(conds), [conds]);
    const inBasket = (id) => basket.indexOf(id) >= 0;
    const toggleFacet = (key, v) => setManual((m) => {
      const cur = (m.hasOwnProperty(key) ? m[key] : (parsed[key] || [])).slice();
      const i = cur.indexOf(v);
      if (i >= 0) cur.splice(i, 1); else cur.push(v);
      return Object.assign({}, m, { [key]: cur });
    });
    const removeChip = (c) => {
      if (c.key === "minScore") setManual((m) => Object.assign({}, m, { minScore: null }));
      else if (c.key === "dur") setManual((m) => Object.assign({}, m, { dur: null }));
      else toggleFacet(c.key, c.value);
    };
    const resetAll = () => { setManual({}); setQ(""); };
    // 时长区间编辑器：界面以「分钟」输入，写入前显式换算为秒（1 分钟 = 60 秒）
    const setDurMin = (idx, val) => setManual((m) => {
      const cur = ((m.hasOwnProperty("dur") ? m.dur : parsed.dur) || [300, 480]).slice();
      const next = cur.slice();
      next[idx] = Math.round(Math.max(0, Math.min(120, parseFloat(val) || 0)) * 60);
      return Object.assign({}, m, { dur: next });
    });

    useEffect(() => {
      if (app.payload && app.payload.q) { setQ(app.payload.q); setManual({}); }
    }, [app.payload]);

    useEffect(() => {
      const h = (e) => {
        if (e.key === "Escape") setBasket([]);
      };
      window.addEventListener("keydown", h);
      return () => window.removeEventListener("keydown", h);
    }, []);

    // 合计时长按命中的真实时长求和，不再用「条数 × 常数」估算
    const totalHours = (hits.reduce((s, h) => s + mmss(h.dur), 0) / 3600).toFixed(2);
    const totalMin = Math.round(hits.reduce((s, h) => s + mmss(h.dur), 0) / 60);

    return (
      <>
        <PageHead
          crumbs={[{ label: "生产" }, { label: "检索与取数" }]}
          title="语义检索与取数"
          desc="让「找数据」从翻目录变成提问。筛选面板与配方条件同构，检索结果可无缝转为配方。"
          meta={
            <>
              <Tag tone="ok" icon="zap">结果耗时 1.4 秒（目标：秒级）</Tag>
              {app.payload && app.payload.q ? <Tag tone="accent" icon="search">来自顶栏检索 · 问题已带入</Tag> : null}
              <Tag tone="quiet">命中 {hits.length} 条 · 合计 {totalHours} 小时</Tag>
              {basket.length ? <Tag tone="accent" icon="basket">选择篮已累积 {basket.length} 条</Tag> : null}
            </>
          }
          actions={
            <>
              <Btn icon="bookmark" tone="ghost" onClick={() => toast.push({ tone: "ok", title: "检索视图已保存", desc: (chips.length ? chips.map((c) => c.group + " " + c.value).join(" · ") : "当前关键词") + " 已存为个人视图，可复用为配方条件。" })}>保存检索视图</Btn>
              <Btn icon="basket" tone="primary" disabled={!basket.length}
                onClick={() => set({ page: "recipe", payload: { fromBasket: true, ids: basket } })}>用所选建集（{basket.length}）</Btn>
            </>
          }
        />
        <div className="pagebody flush">
          <div className="wb" style={{ gridTemplateColumns: "264px minmax(0,1fr)", height: "100%" }}>
            {/* 筛选面板：与检索解析共用同一词表，勾选即写入结构化条件 */}
            <div className="wb-col scrollable">
              <div className="wb-head"><span className="small" style={{ fontWeight: 600 }}>筛选条件</span>
                <span className="tiny muted-3">已选 {chips.length}</span>
                <span className="grow" />
                <Btn size="sm" tone="ghost" onClick={resetAll}>清空</Btn></div>
              <div className="wb-body">
                <div style={{ padding: 12, display: "flex", flexDirection: "column", gap: 12 }}>
                  <div className="warnbox info" style={{ fontSize: 11, lineHeight: 1.65 }}>
                    筛选面板与配方条件同构：同一套条件组件在检索与建集两处复用。此处勾选与上方自然语言解析结果合并生效。
                  </div>
                  {D.SEARCH_FACETS.map((g) => {
                    const sel = conds[g.key] || [];
                    return (
                      <div key={g.key}>
                        <div className="spread" style={{ marginBottom: 6 }}>
                          <span className="field-label" style={{ margin: 0 }}>{g.k}</span>
                          <span className="tiny muted-3">已选 {sel.length}</span>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                          {g.vals.map((o) => (
                            <label key={o.v} className="check" style={{ padding: "3px 0", cursor: "pointer" }}>
                              <input type="checkbox" checked={sel.indexOf(o.v) >= 0} onChange={() => toggleFacet(g.key, o.v)} />
                              <span className="small" style={{ color: sel.indexOf(o.v) >= 0 ? "var(--text)" : "var(--text-2)" }}>{o.v}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                  <div>
                    <div className="spread" style={{ marginBottom: 4 }}>
                      <span className="field-label" style={{ margin: 0 }}>时长区间</span>
                      <span className="tiny muted-3">{conds.dur ? minLabel(conds.dur[0]) + "–" + minLabel(conds.dur[1]) + " 分钟" : "不限"}</span>
                    </div>
                    <div className="row" style={{ gap: 6 }}>
                      <input className="input mono" value={conds.dur ? minLabel(conds.dur[0]) : ""} placeholder="0" onChange={(e) => setDurMin(0, e.target.value)} />
                      <span className="muted-3">–</span>
                      <input className="input mono" value={conds.dur ? minLabel(conds.dur[1]) : ""} placeholder="不限" onChange={(e) => setDurMin(1, e.target.value)} />
                      <span className="tiny muted-3">分钟</span>
                    </div>
                    {conds.dur ? <button className="btn btn-sm" style={{ marginTop: 6 }} onClick={() => setManual((m) => Object.assign({}, m, { dur: null }))}>清除区间</button> : null}
                  </div>
                  <div>
                    <div className="spread" style={{ marginBottom: 4 }}>
                      <span className="field-label" style={{ margin: 0 }}>质量分下限</span>
                      <span className="tiny muted-3">{conds.minScore == null ? "不限" : "≥ " + conds.minScore}</span>
                    </div>
                    <input type="range" min="0" max="100" value={conds.minScore == null ? 0 : conds.minScore}
                      onChange={(e) => setManual((m) => Object.assign({}, m, { minScore: parseInt(e.target.value, 10) }))}
                      style={{ width: "100%", accentColor: "var(--accent)", marginTop: 4 }} />
                    <div className="spread tiny muted-3"><span>0</span><span>100</span></div>
                  </div>
                </div>
              </div>
            </div>

            {/* 结果 */}
            <div className="wb-col" style={{ borderRight: 0 }}>
              <div className="wb-head" style={{ gap: 10 }}>
                <div className="gsearch" style={{ flex: "1 1 auto", maxWidth: 620, height: 30 }}>
                  <Icon n="search" s={14} />
                  <input value={q} placeholder="用自然语言描述你要哪一批数据" onChange={(e) => { setQ(e.target.value); setManual({}); }} />
                </div>
                <Btn size="sm" tone="ghost" icon="sort">按质量分</Btn>
                <Btn size="sm" tone="ghost" icon="grid">网格</Btn>
                <span className="grow" />
                <Btn size="sm" tone="ghost" icon="clock" onClick={() => setSlow(true)}>模拟慢查询</Btn>
              </div>

              {chips.length ? (
                <div style={{ padding: "10px 14px", borderBottom: "1px solid var(--line-soft)", background: "var(--surface-1)" }}>
                  <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
                    <span className="row" style={{ gap: 5, color: "var(--accent)" }}><Icon n="cpu" s={13} /><span className="tiny">检索条件</span></span>
                    {chips.map((c, i) => (
                      <button key={c.key + i} className="tag t-accent" title="点击移除该条件" style={{ cursor: "pointer" }}
                        onClick={() => removeChip(c)}>
                        {c.group} <b style={{ fontWeight: 600 }}>{c.value}</b> <Icon n="x" s={10} />
                      </button>
                    ))}
                    <button className="btn btn-sm" onClick={resetAll}>全部清除</button>
                    <span className="grow" />
                    <span className="tiny muted-3">命中 <b>{hits.length}</b> / 语料 {D.SEARCH_HITS.length} 条 · 合计 {totalMin} 分钟</span>
                  </div>
                </div>
              ) : (
                <div style={{ padding: "10px 14px", borderBottom: "1px solid var(--line-soft)", background: "var(--surface-1)" }}>
                  <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
                    <span className="row" style={{ gap: 5, color: "var(--text-3)" }}><Icon n="search" s={13} /><span className="tiny">未识别到结构化条件，已按关键词包含匹配</span></span>
                    <span className="grow" />
                    <span className="tiny muted-3">命中 <b>{hits.length}</b> / 语料 {D.SEARCH_HITS.length} 条 · 合计 {totalMin} 分钟</span>
                  </div>
                </div>
              )}

              <div className="wb-body" style={{ padding: 14 }}>
                {slow ? (
                  <div className="panel" style={{ marginBottom: 12 }}>
                    <div className="panel-body" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      <div className="row" style={{ gap: 8 }}>
                        <span className="skel" style={{ width: 14, height: 14, borderRadius: "50%" }} />
                        <span className="small">正在执行：向量索引检索 → 元数据过滤 → 质量分层校验</span>
                        <span className="grow" />
                        <Btn size="sm" tone="ghost">取消</Btn>
                      </div>
                      <div className="bar"><i style={{ width: "62%" }} /></div>
                      <span className="tiny muted-3">已耗时 4.2 秒。慢查询给出阶段反馈而非只转圈；超过 1 秒必须可见进度，超过 5 秒给出可取消入口、超过 30 秒转入通知中心。</span>
                    </div>
                  </div>
                ) : null}

                {hits.length === 0 ? (
                  <div className="panel" style={{ padding: 26, textAlign: "center" }}>
                    <Icon n="search" s={22} style={{ color: "var(--text-4)" }} />
                    <div className="small" style={{ fontWeight: 600, marginTop: 10 }}>当前条件下未命中任何数据</div>
                    <div className="tiny muted-3" style={{ marginTop: 6, lineHeight: 1.75, maxWidth: 430, marginLeft: "auto", marginRight: "auto" }}>
                      语料库现有 {D.SEARCH_HITS.length} 条数据。当前条件过窄——可放宽质量分下限、去掉时长区间，或减少场景 / 技能限定后重试。
                    </div>
                    <div className="row" style={{ gap: 8, justifyContent: "center", marginTop: 14, flexWrap: "wrap" }}>
                      <Btn size="sm" tone="primary" onClick={resetAll}>查看全部数据</Btn>
                      {conds.minScore != null ? <Btn size="sm" tone="ghost" onClick={() => setManual((m) => Object.assign({}, m, { minScore: null }))}>放宽质量分下限</Btn> : null}
                      {conds.dur ? <Btn size="sm" tone="ghost" onClick={() => setManual((m) => Object.assign({}, m, { dur: null }))}>去掉时长区间</Btn> : null}
                    </div>
                  </div>
                ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: 12 }}>
                  {hits.map((h) => (
                    <div key={h.id} className="panel" style={{ overflow: "hidden" }}>
                      <div className="player" style={{ height: 156, borderRadius: 0, cursor: "pointer" }}
                        onClick={() => set({ page: "browser", payload: { id: h.id } })}>
                        <SceneFrame view={h.emb === "Ego" ? "ego" : "exo"} t={(h.score % 60) / 100 + 0.2} overlays={["box"]} />
                        <span className="vtlabel"><i className="lid" style={{ background: h.q === "优质" ? "var(--ok)" : h.q === "边缘难例" ? "var(--warn)" : "var(--danger)" }} />{h.q}</span>
                        <span className="vtbadge">{h.dur}</span>
                      </div>
                      <div style={{ padding: 11 }}>
                        <div className="spread">
                          <span className="mono small">{h.id}</span>
                          <span className={cls("tag", h.score >= 85 ? "t-ok" : h.score >= 60 ? "t-warn" : "t-danger")}>{h.score} 分</span>
                        </div>
                        <div className="row" style={{ gap: 8, marginTop: 7, flexWrap: "wrap" }}>
                          <Tag tone="quiet" icon="pin">{h.scene}</Tag>
                          <Tag tone="quiet" icon="robot">{h.embody}</Tag>
                          <Tag tone="quiet">{h.emb}</Tag>
                        </div>
                        <div className="spread" style={{ marginTop: 9 }}>
                          <span className="tiny muted-3">{h.emp} · {h.time}</span>
                          <Btn size="sm" tone={inBasket(h.id) ? "ghost" : "primary"} icon={inBasket(h.id) ? "check" : "plus"}
                            onClick={() => {
                              setBasket(inBasket(h.id) ? basket.filter((x) => x !== h.id) : basket.concat([h.id]));
                              if (!inBasket(h.id)) toast.push({ tone: "ok", title: "已加入选择篮", desc: "选择篮跨页、跨查询累积，顶栏常驻显示计数。" });
                            }}>
                            {inBasket(h.id) ? "已选" : "加入选择篮"}
                          </Btn>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                )}
              </div>

              <div className="keybar" style={{ borderTop: "1px solid var(--line)" }}>
                <span className="row" style={{ gap: 6 }}><Icon n="basket" s={12} /> 选择篮 <b>{basket.length}</b> 条</span>
                <span className="muted-3">·</span>
                <span>{basket.slice(0, 4).join(" · ")}{basket.length > 4 ? " 等 " + basket.length + " 条" : ""}</span>
                <span className="grow" />
                <Btn size="sm" tone="ghost" onClick={() => setBasket([])} disabled={!basket.length}>清空</Btn>
                <Btn size="sm" tone="primary" disabled={!basket.length} onClick={() => set({ page: "recipe", payload: { fromBasket: true, ids: basket } })}>用所选建集</Btn>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  /* ============================================================
     数据浏览器（源：8.5）
     ============================================================ */
  function DataBrowser({ app, set }) {
    const toast = window.UI.useToast();
    const [t, setT] = useTicker(372, false);
    const [playing, setPlaying] = useState(true);
    const [views, setViews] = useState(4);
    const [main, setMain] = useState("exo");
    const [ov, setOv] = useState(["box", "hand"]);

    useEffect(() => {
      if (app.payload && app.payload.t != null) setT(app.payload.t);
    }, [app.payload]);

    const clip = (app.payload && app.payload.id) || "CLP-88414";

    return (
      <>
        <PageHead
          crumbs={[{ label: "生产", to: () => set({ page: "search" }) }, { label: "数据浏览器" }]}
          title={"数据浏览器 · " + clip}
          desc="多路同步画面、时间轴与元数据面板同屏。叠加层逐项开关、互不干扰；相关数据可直接切换而不丢失当前位置。"
          meta={
            <>
              <Tag tone="quiet" icon="pin">厨房 / 台面 K2</Tag>
              <Tag tone="quiet" icon="robot">人形 · 双臂</Tag>
              <Tag tone="quiet" icon="cube">EGO-KITCH-02 v1.2</Tag>
              <Tag tone="warn" dot>质检结论：不通过</Tag>
              <Tag tone="quiet" icon="flag">机审标记 3 处</Tag>
            </>
          }
          actions={
            <>
              <Btn icon="download" tone="ghost">下载原始</Btn>
              <Btn icon="link" tone="ghost">复制链接</Btn>
              <Btn icon="flag" tone="ghost" onClick={() => toast.push({ tone: "info", title: "已打标记", desc: "已在当前帧添加标记，可用于驳回证据或批注。" })}>打标记 <Kbd>M</Kbd></Btn>
            </>
          }
        />
        <div className="pagebody flush">
          <div className="wb" style={{ gridTemplateColumns: "minmax(0,1fr) 344px", height: "100%" }}>
            <div className="wb-col">
              <div className="wb-body" style={{ background: "var(--surface-inset)" }}>
                <MultiView views={VIEWS} t={t} count={views} main={main} onMain={setMain} overlays={ov} tileH={views === 1 ? 560 : views === 2 ? 420 : 480} />
              </div>
              <div className="wb-foot">
                <Transport
                  t={t} playing={playing} duration={372}
                  onToggle={() => setPlaying(!playing)}
                  onSeek={setT}
                  onStep={(d) => setT((v) => Math.max(0, Math.min(1, v + d)))}
                  views={VIEWS} main={main} onMain={setMain}
                  extra={
                    <div className="row-tight" style={{ gap: 4 }}>
                      {VIEWS.map((v, i) => (
                        <button key={v.k} className="btn btn-sm" title={v.label + "（" + (i + 1) + "）"}
                          onClick={() => { setMain(v.k); if (views === 1) setViews(2); }}
                          style={main === v.k ? { borderColor: v.color, color: v.color } : null}>{i + 1}</button>
                      ))}
                    </div>
                  }
                />
                <Timeline
                  t={t} onSeek={setT} duration={372}
                  machine={[{ t: 0.10, kind: "danger", label: "有效帧占比 71.3%" }, { t: 0.372, kind: "warn", label: "过曝" }, { t: 0.65, kind: "danger", label: "目标可见率 63.5%" }]}
                  notes={[{ t: 0.31, kind: "warn", who: "质检员", frame: 128 }, { t: 0.65, kind: "review", who: "质检员", frame: 268 }]}
                  tracks={[
                    { id: "action", color: "var(--domain-c)", name: "动作段", segs: D.ANNO_TRACKS[0].segs },
                    { id: "instruction", color: "var(--domain-e)", name: "指令", segs: D.ANNO_TRACKS[2].segs },
                    { id: "contact", color: "var(--warn)", name: "接触事件", segs: D.ANNO_TRACKS[3].segs },
                  ]}
                />
              </div>
            </div>

            <div className="wb-col scrollable" style={{ borderRight: 0 }}>
              <div className="wb-head"><span className="small" style={{ fontWeight: 600 }}>元数据与叠加层</span>
                <span className="grow" />
                <IconBtn n="copy" title="复制全部字段" onClick={() => toast.push({ tone: "ok", title: "已复制", desc: "全部结构化字段已复制到剪贴板（JSON）。" })} /></div>
              <div className="wb-body">
                <div style={{ padding: 14, display: "flex", flexDirection: "column", gap: 14 }}>
                  <div>
                    <div className="field-label" style={{ marginBottom: 8 }}>叠加层开关</div>
                    <OverlaySwitch value={ov} onChange={setOv} />
                    <div className="tiny muted-3" style={{ marginTop: 8, lineHeight: 1.65 }}>
                      逐项开关，互不干扰。质检员打开的是「问题」，不是「所有信息」。
                    </div>
                  </div>

                  <div>
                    <div className="field-label" style={{ marginBottom: 8 }}>机审命中</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      {[["QC-FRAME-01 有效帧占比", "71.3% < 80%", "danger", 0.10], ["QC-VIS-01 目标可见率", "63.5% < 70%", "danger", 0.65], ["QC-ALIGN-01 观测动作偏差", "2.4 帧 > 2 帧", "danger", 0.65], ["QC-LIGHT-01 过曝帧占比", "6.1% > 5%", "warn", 0.372]].map((e) => (
                        <button key={e[0]} className="panel-inset" style={{ padding: "8px 10px", textAlign: "left", cursor: "pointer", border: "1px solid var(--line-soft)" }}
                          onClick={() => setT(e[3])}>
                          <div className="spread">
                            <span className={cls("tag", "t-" + e[2])}>{e[0]}</span>
                            <Icon n="arrowRight" s={12} style={{ color: "var(--accent)" }} />
                          </div>
                          <div className="mono small" style={{ marginTop: 5, color: "var(--" + e[2] + ")" }}>{e[1]}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="field-label" style={{ marginBottom: 8 }}>结构化字段</div>
                    <DL rows={[
                      ["Clip ID", clip], ["任务", "TK-2409-011"], ["批次", "BAT-2409-0116"],
                      ["采集员", "采集员 A"], ["采集时间", "09-11 14:02"], ["点位", "K2"],
                      ["时长", "08:04"], ["视角", "Ego / Exo / Wrist"],
                      ["质量分", "34（无效）"], ["分层", "无效样本"],
                      ["内容指纹", "sha256:b2f7…9a04"], ["合规", "脱敏已通过"],
                    ]} />
                  </div>

                  <div>
                    <div className="field-label" style={{ marginBottom: 8 }}>血缘</div>
                    <div className="panel-inset" style={{ padding: 11 }}>
                      <div className="row" style={{ gap: 6, flexWrap: "wrap" }}>
                        <Tag tone="quiet" icon="file">原始</Tag><Icon n="arrowRight" s={10} style={{ color: "var(--text-4)" }} />
                        <Tag tone="quiet">清洗 v2</Tag><Icon n="arrowRight" s={10} style={{ color: "var(--text-4)" }} />
                        <Tag tone="quiet">标注 v4</Tag><Icon n="arrowRight" s={10} style={{ color: "var(--text-4)" }} />
                        <Tag tone="accent">未入集</Tag>
                      </div>
                      <div className="tiny muted-3" style={{ marginTop: 8, lineHeight: 1.65 }}>
                        该数据未被打包进任何快照。若后续被引用，将在此处展开受影响的数据集清单。
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="field-label" style={{ marginBottom: 8 }}>相关数据</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                      {[["CLP-88412", "同任务", "06:12", "ok"], ["CLP-88413", "同任务", "05:48", "warn"], ["CLP-88415", "同采集员", "05:30", "review"]].map((r) => (
                        <button key={r[0]} className="listitem" style={{ border: "1px solid var(--line-soft)", borderRadius: 4, padding: "8px 10px" }}
                          onClick={() => set({ page: "browser", payload: { id: r[0] } })}>
                          <div className="spread">
                            <span className="mono small">{r[0]}</span>
                            <Tag tone={r[3]} dot>{r[1]}</Tag>
                          </div>
                          <div className="tiny muted-3" style={{ marginTop: 3 }}>时长 {r[2]} · 点击直接切换，不丢失当前位置</div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  window.PAGES_A = { OverviewBoard, TaskList, TaskDetail, UploadCenter, SearchPage, DataBrowser, CreateTaskWizard };
})();
