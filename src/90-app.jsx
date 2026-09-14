/* ============================================================
   应用外壳 · 三端切换 / 导航 / 路由 / 明暗主题 / 演示动线
   ============================================================ */
(function () {
  const { useState, useEffect, useMemo, useRef } = React;
  const { Tag, Btn, IconBtn, Panel, Modal, DL, Kbd, ToastHost, cls, useToast, PageHead } = window.UI;
  const D = window.DATA;
  const A = window.PAGES_A, B = window.PAGES_B;

  /* ---------- 兜底页：批次 / 配方库 ---------- */
  function BatchList({ set }) {
    const toast = useToast();
    const rows = [
      ["BAT-2409-0116", "TK-2409-011", "K2 / 采集员 A", 216, "校验中", "warn", "3 条待处理"],
      ["BAT-2409-0115", "TK-2409-011", "K2 / 采集员 A", 204, "已入库", "ok", "—"],
      ["BAT-2409-0114", "TK-2409-011", "K3 / 采集员 C", 188, "已入库", "ok", "—"],
      ["BAT-2409-0113", "TK-2409-011", "K3 / 采集员 C", 176, "已入库", "ok", "—"],
      ["BAT-2409-0112", "TK-2409-011", "K5 / 采集员 B", 160, "已入库", "ok", "—"],
      ["BAT-2409-0111", "TK-2409-011", "K5 / 采集员 B", 88, "已入库", "ok", "—"],
    ];
    return (
      <>
        <PageHead crumbs={[{ label: "生产" }, { label: "批次" }]} title="批次"
          desc="批次是任务下可独立交付的生产单元，按点位、时段或人员划分。批次的质检结论与上传状态在此集中查看。"
          meta={<><Tag tone="quiet">共 24 个批次</Tag><Tag tone="warn" dot>1 个校验中</Tag></>}
          actions={<Btn icon="filter" tone="ghost">筛选</Btn>} />
        <div className="pagebody">
          <div className="panel" style={{ overflow: "hidden" }}>
            <table className="table">
              <thead><tr><th>批次</th><th>所属任务</th><th>点位 / 采集员</th><th className="num">条数</th><th>状态</th><th>备注</th><th /></tr></thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r[0]} className="clickable" onClick={() => set({ page: "upload" })}>
                    <td className="mono" style={{ fontWeight: 600 }}>{r[0]}</td>
                    <td className="mono small">{r[1]}</td>
                    <td>{r[2]}</td><td className="num">{r[3]}</td>
                    <td><Tag tone={r[5]} dot>{r[4]}</Tag></td>
                    <td className={r[6] === "—" ? "muted-3 tiny" : "tiny"} style={r[6] !== "—" ? { color: "var(--warn)" } : null}>{r[6]}</td>
                    <td><Icon n="chevRight" s={13} style={{ color: "var(--text-4)" }} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="panel-foot">
              <Icon n="info" s={12} />
              <span>批次级操作：批量重跑校验、批量改判、导出批次明细。影响超过 50 条时二次确认并列出影响面。</span>
            </div>
          </div>
        </div>
      </>
    );
  }

  function RecipesPage({ set }) {
    const toast = useToast();
    const rows = [
      ["RCP-KITCH-FOLD-NEG-v2", "厨房 / 台面 · 折叠衣物失败样本", 6, 297, "0.52h", "数据工程师", "已发布 3 版"],
      ["RCP-WH-SORT-ALL-v1", "仓储 / 分拣线 全量", 4, 800, "1.62h", "项目经理", "已发布 1 版"],
      ["RCP-SCREW-FORCE-v1", "产线 / 装配工位 力控样本", 7, 630, "1.24h", "项目经理", "待发布"],
      ["RCP-CLOTH-SOFT-v2", "软体实验台 柔性布料", 5, 376, "0.71h", "数据工程师", "已发布 2 版"],
      ["RCP-CABLE-INS-v1", "实验台 / 电控柜 插拔样本", 6, 495, "0.98h", "数据工程师", "已发布 1 版"],
      ["RCP-QUAD-TRAV-v1", "户外 / 阶梯碎石 四足越障", 3, 500, "1.11h", "项目经理", "已发布 1 版"],
      ["RCP-GRASP-NEG-v1", "桌面 / 多物体 抓取失败", 5, 198, "0.41h", "项目经理", "草稿"],
    ];
    return (
      <>
        <PageHead crumbs={[{ label: "数据集" }, { label: "配方库" }]} title="配方库"
          desc="把「我要哪一批数据」从口头沟通变成可保存、可复用、可复现的结构化定义。同类客户的第二次交付，复制配方改条件即可。"
          meta={<><Tag tone="quiet">共 7 个配方</Tag><Tag tone="ok" icon="check">4 个已发布快照</Tag></>}
          actions={<><Btn icon="plus" tone="primary" onClick={() => set({ page: "recipe" })}>新建配方</Btn></>} />
        <div className="pagebody">
          <div className="panel" style={{ overflow: "hidden" }}>
            <table className="table">
              <thead><tr><th>配方</th><th>用途</th><th className="num">条件组</th><th className="num">命中条数</th><th className="num">时长</th><th>负责人</th><th>版本</th><th /></tr></thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r[0]} className="clickable" onClick={() => set({ page: "recipe" })}>
                    <td className="mono" style={{ fontWeight: 600 }}>{r[0]}</td>
                    <td className="muted">{r[1]}</td><td className="num">{r[2]}</td>
                    <td className="num">{r[3]}</td><td className="num">{r[4]}</td>
                    <td>{r[5]}</td>
                    <td><Tag tone={r[6] === "草稿" ? "quiet" : r[6] === "待发布" ? "warn" : "ok"} dot>{r[6]}</Tag></td>
                    <td><Btn size="sm" tone="ghost" icon="copy" onClick={(e) => { e.stopPropagation(); toast.push({ tone: "ok", title: "已复制配方", desc: r[0] + " 已复制为副本，可改条件后直接复用。" }); }}>复制</Btn></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </>
    );
  }

  /* ---------- 路由表 ---------- */
  function renderPlatform(app, set) {
    const { domain, page } = app;
    const key = domain + "/" + page;
    const map = {
      "production/overview": <A.OverviewBoard app={app} set={set} />,
      "production/tasks": <A.TaskList app={app} set={set} />,
      "production/detail": <A.TaskDetail app={app} set={set} />,
      "production/batches": <BatchList app={app} set={set} />,
      "production/upload": <A.UploadCenter app={app} set={set} />,
      "production/search": <A.SearchPage app={app} set={set} />,
      "production/browser": <A.DataBrowser app={app} set={set} />,
      "quality/qcqueue": <B.QCConsole app={app} set={set} />,
      "quality/qc": <B.QCConsole app={app} set={set} />,
      "quality/rules": <B.RuleConfig />,
      "annotate/annotasks": <B.AnnoTasks app={app} set={set} />,
      "annotate/workbench": <B.AnnoWorkbench app={app} set={set} />,
      "annotate/qcanon": <B.AnnoWorkbench app={app} set={set} reviewMode />,
      "dataset/recipes": <RecipesPage app={app} set={set} />,
      "dataset/recipe": <B.RecipeEditor app={app} set={set} />,
      "dataset/snapshots": <B.Snapshots app={app} set={set} />,
      "dataset/delivery": <B.Delivery app={app} set={set} />,
      "dataset/api": <B.ApiConsole app={app} set={set} />,
      "sim/simgate": <B.SimPage page="simgate" />,
      "sim/simgens": <B.SimPage page="simgens" />,
      "sim/simblend": <B.SimPage page="simblend" />,
      "board/board": <B.Board />,
      "safety/keys": <B.SafetyPage page="keys" />,
      "safety/lifecycle": <B.SafetyPage page="lifecycle" />,
      "safety/watermark": <B.SafetyPage page="watermark" />,
      "config/specs": <B.ConfigPage page="specs" set={set} />,
      "config/devices": <B.ConfigPage page="devices" set={set} />,
      "config/contract": <B.ContractPage app={app} set={set} />,
      "config/people": <B.ConfigPage page="people" set={set} />,
      "config/perms": <B.ConfigPage page="perms" set={set} />,
      "config/audit": <B.ConfigPage page="audit" set={set} />,
      "config/acceptance": <B.Acceptance />,
    };
    return map[key] || <A.OverviewBoard app={app} set={set} />;
  }

  /* ---------- 通知 ---------- */
  const NOTICES = [
    { lv: "danger", t: "QC-MOT-01 规则命中激增", d: "近 6 小时命中 42 条（阈值 30），建议复核 ASM-SCREW-01 规格模板", get: () => ({ domain: "quality", page: "rules" }) },
    { lv: "danger", t: "上传队列 3 条待处理", d: "批次 BAT-2409-0116 有 1 条疑似重复待裁决、2 条不通过", get: () => ({ domain: "production", page: "upload" }) },
    { lv: "warn", t: "被指派重采 3 条", d: "原因码 RC-0101 手部出画 · 已于 09:24 生成重采任务", get: () => ({ domain: "production", page: "tasks" }) },
    { lv: "warn", t: "TK-2409-011 距交期 5 天", d: "按现速可完成，无缓冲，建议增派 1 名采集员", get: () => ({ domain: "production", page: "detail", payload: { id: "TK-2409-011" } }) },
    { lv: "quiet", t: "构建完成", d: "DS-WH-SORT-v1 已发布，内容指纹 sha256:2c77…aa41", get: () => ({ domain: "dataset", page: "snapshots" }) },
  ];

  function NoticePanel({ onGo, onClose }) {
    return (
      <div style={{ position: "absolute", top: 46, right: 12, width: 360, zIndex: 60, background: "var(--surface-1)", border: "1px solid var(--line-strong)", borderRadius: 6, boxShadow: "var(--shadow-pop)", overflow: "hidden" }}>
        <div className="panel-head" style={{ minHeight: 38 }}>
          <span className="panel-title">通知</span>
          <span className="panel-sub">同一事件重复通知已合并</span>
          <span style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
            <Btn size="sm" tone="ghost">全部已读</Btn>
            <IconBtn n="x" s={13} title="关闭" onClick={onClose} />
          </span>
        </div>
        <div style={{ maxHeight: 380, overflow: "auto" }}>
          {NOTICES.map((n, i) => (
            <button key={i} className="listitem" onClick={() => { onGo(n.get()); onClose(); }}>
              <div className="row" style={{ gap: 9, alignItems: "flex-start" }}>
                <Icon n={n.lv === "danger" ? "danger" : n.lv === "warn" ? "warn" : "info"} s={14}
                  style={{ color: "var(--" + (n.lv === "danger" ? "danger" : n.lv === "warn" ? "warn" : "accent") + ")", flex: "0 0 auto", marginTop: 1 }} />
                <div>
                  <div className="small" style={{ fontWeight: 600 }}>{n.t}</div>
                  <div className="tiny muted-3" style={{ marginTop: 3, lineHeight: 1.6 }}>{n.d}</div>
                </div>
              </div>
            </button>
          ))}
        </div>
        <div className="panel-foot" style={{ justifyContent: "space-between" }}>
          <span className="tiny muted-3">按分级订阅：阻塞级强制开启 · 摘要级可关闭</span>
          <span className="tiny" style={{ color: "var(--accent)", cursor: "pointer" }}>订阅设置</span>
        </div>
      </div>
    );
  }

  /* ---------- 演示动线面板 ---------- */
  function FlowGuide({ app, onGo, open, setOpen }) {
    return (
      <div className="fabs">
        {open ? (
          <div className="fabs-panel">
            <div className="panel-head" style={{ minHeight: 38 }}>
              <span className="panel-title">演示动线</span>
              <span className="panel-sub">第 7 章 F1–F8</span>
              <IconBtn n="x" s={13} title="收起" onClick={() => setOpen(false)} />
            </div>
            <div>
              {D.FLOWS.map((f) => (
                <button key={f.id} className={cls("flowitem", app.flow === f.id && "active")} onClick={() => onGo(f)}>
                  <span className="fid">{f.id}</span>
                  <span>
                    <span className="ft">{f.t}</span>
                    <span className="fd" style={{ display: "block" }}>{f.d}</span>
                  </span>
                </button>
              ))}
            </div>
            <div className="panel-foot" style={{ display: "block" }}>
              <div className="tiny muted-3" style={{ lineHeight: 1.65 }}>
                八条流程覆盖从任务下达到交付验收的完整闭环。任一环节出现驳回或异议，都会回流到上游而非就地终止。
              </div>
            </div>
          </div>
        ) : null}
        <button className="fab-toggle" onClick={() => setOpen(!open)} title="演示动线（第 7 章 F1–F8）">
          <Icon n={open ? "x" : "route"} s={19} />
        </button>
      </div>
    );
  }

  /* ============================================================
     平台端
     ============================================================ */
  function PlatformShell({ app, set, theme, setTheme }) {
    const toast = useToast();
    const [collapsed, setCollapsed] = useState(false);
    const [notices, setNotices] = useState(false);
    const [proj, setProj] = useState(false);
    const dom = D.DOMAINS.filter((d) => d.id === app.domain)[0] || D.DOMAINS[0];
    // 窄屏抽屉导航：选中任意一项后自动收起，避免遮挡内容
    const closeNav = () => { if (app.navOpen) set({ navOpen: false }); };

    return (
      <>
        {app.navOpen ? <div className="nav-scrim" onClick={closeNav} aria-hidden="true" /> : null}
        <div className={cls("nav", collapsed && "collapsed", app.navOpen && "open")}>
          <div className="nav-scroll">
            {D.DOMAINS.map((d) => {
              const on = d.id === app.domain;
              return (
                <div key={d.id}>
                  <button className={cls("nav-item", on && "active")} onClick={() => { set({ domain: d.id, page: d.children[0].id, payload: {} }); closeNav(); }}
                    title={collapsed ? d.name : undefined}>
                    <span className="nav-ico" style={{ color: on ? d.color : undefined }}><Icon n={d.icon} s={15} /></span>
                    <span className="nav-label">{d.name}</span>
                    {d.children.some((c) => c.badge) ? <span className="nav-badge" style={{ color: "var(--danger)" }}>!</span> : null}
                  </button>
                  {on && !collapsed ? (
                    <div className="nav-sub">
                      {d.children.map((c) => (
                        <button key={c.id} className={cls("nav-item", c.id === app.page && "active")}
                          onClick={() => { set({ page: c.id, payload: {} }); closeNav(); }}>
                          <span className="sub-dot" />
                          <span className="nav-label">{c.name}</span>
                          {c.tag ? <span className="nav-badge" style={{ color: c.badge ? "var(--danger)" : undefined }}>{c.tag}</span> : null}
                        </button>
                      ))}
                      {d.id === "config" ? (
                        <button className={cls("nav-item", app.page === "acceptance" && "active")} onClick={() => { set({ page: "acceptance", payload: {} }); closeNav(); }}>
                          <span className="sub-dot" /><span className="nav-label">设计验收清单</span>
                          <span className="nav-badge">23</span>
                        </button>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
          <div style={{ padding: 8, borderTop: "1px solid var(--line-soft)" }}>
            <button className="nav-item" onClick={() => setCollapsed(!collapsed)} title={collapsed ? "展开导航" : "收起导航"}>
              <span className="nav-ico"><Icon n="panelLeft" s={15} /></span>
              <span className="nav-label">收起导航</span>
            </button>
          </div>
        </div>
        <main className="main">
          {renderPlatform(app, set)}
        </main>
      </>
    );
  }

  /* ============================================================
     根组件
     ============================================================ */
  function Root() {
    const toast = useToast();
    const [app, setApp] = useState({
      end: "platform", domain: "production", page: "overview", payload: {},
      basket: ["CLP-81204", "CLP-81211"], flow: null, qcId: D.QC_QUEUE[0].id,
    });
    const [theme, setTheme] = useState("dark");
    const [guide, setGuide] = useState(false);
    const [notices, setNotices] = useState(false);
    const [proj, setProj] = useState(false);
    const [help, setHelp] = useState(false);
    const [gq, setGq] = useState("");
    const gsearchRef = useRef(null);
    const set = (p) => setApp((v) => Object.assign({}, v, p));

    useEffect(() => {
      document.documentElement.setAttribute("data-theme", theme);
    }, [theme]);

    // ⌘K / Ctrl+K 聚焦顶栏检索；这是顶栏检索存在的意义，不能只是个装饰
    useEffect(() => {
      const h = (e) => {
        if ((e.metaKey || e.ctrlKey) && (e.key === "k" || e.key === "K")) {
          e.preventDefault();
          if (gsearchRef.current) gsearchRef.current.focus();
        }
      };
      window.addEventListener("keydown", h);
      return () => window.removeEventListener("keydown", h);
    }, []);

    useEffect(() => {
      const h = (e) => {
        const tag = (e.target.tagName || "").toLowerCase();
        if (tag === "input" || tag === "textarea") return;
        if (e.key === "Escape") { setNotices(false); setProj(false); }
      };
      window.addEventListener("keydown", h);
      return () => window.removeEventListener("keydown", h);
    }, []);

    const goFlow = (f) => {
      if (f.to[0] === "capture") set({ end: "capture", flow: f.id });
      else if (f.to[0] === "delivery") set({ end: "portal", flow: f.id });
      else set({ end: "platform", domain: f.to[0], page: f.to[1], payload: {}, flow: f.id });
    };

    const topbar = (
      <header className="topbar">
        <button className="topbar-burger" aria-label="打开导航" aria-expanded={!!app.navOpen}
          onClick={() => set({ navOpen: !app.navOpen })}>
          <Icon n={app.navOpen ? "x" : "menu"} s={18} />
        </button>
        <div className="brand">
          <span className="brand-mark"><Icon n="cube" s={15} /></span>
          <span className="brand-text">
            <span className="brand-title">具身智能数据生产平台</span>
            <span className="brand-sub">Embodied Data Foundry</span>
          </span>
        </div>
        <div className="topbar-sep" />
        <div className="endswitch" role="group" aria-label="切换端">
          {[["platform", "平台端", "monitor"], ["capture", "采集端", "smartphone"], ["portal", "客户门户", "globe"]].map(([k, n, ic]) => (
            <button key={k} aria-pressed={app.end === k} onClick={() => set({ end: k, navOpen: false })}>
              <span className="row" style={{ gap: 6 }}><Icon n={ic} s={13} />{n}</span>
            </button>
          ))}
        </div>

        {app.end === "platform" ? (
          <>
            <form className="gsearch" role="search"
              onSubmit={(e) => {
                e.preventDefault();
                const v = gq.trim();
                set({ domain: "production", page: "search", payload: v ? { q: v } : {} });
                if (v) toast.push({ tone: "info", title: "已按「" + v + "」检索", desc: "自然语言已翻译为结构化条件，可在检索页逐项修改。" });
              }}>
              <Icon n="search" s={14} style={{ flex: "0 0 auto" }} />
              <input ref={gsearchRef} value={gq} onChange={(e) => setGq(e.target.value)}
                placeholder="搜索任务 · 批次 · 数据片段" aria-label="全局检索，回车执行" />
              <span className="codechip" style={{ flex: "0 0 auto" }}>⌘K</span>
            </form>
            <div className="topbar-sep" />
            <button className="btn btn-sm topbar-basket" onClick={() => set({ end: "platform", domain: "production", page: "search" })}
              title="选择篮跨页累积，入口在顶栏常驻并显示实时计数">
              <Icon n="basket" s={13} /> <span className="basket-label">选择篮</span>
              <span className="mono" style={{ background: "var(--accent)", color: "#fff", borderRadius: 3, padding: "0 5px", height: 16, lineHeight: "16px", fontSize: 10 }}>{app.basket.length}</span>
            </button>
          </>
        ) : (
          <div className="grow" />
        )}
        <span className="grow" />

        <button className="btn btn-sm topbar-proj" onClick={() => setProj(!proj)}>
          <Icon n="folder" s={13} /> 恒立机器人 · B01 <Icon n="chevDown" s={11} />
        </button>
        <IconBtn n={theme === "dark" ? "sun" : "moon"} s={16} title={theme === "dark" ? "切换到明色主题" : "切换到暗色主题"} onClick={() => setTheme(theme === "dark" ? "light" : "dark")} />
        <IconBtn n="info" s={16} title="关于该原型" className="topbar-info" onClick={() => setHelp(true)} />
        <IconBtn n="bell" s={16} title="通知" badge="5" onClick={() => setNotices(!notices)} />
        <span className="topbar-avatar" style={{ width: 26, height: 26, borderRadius: 13, background: "var(--surface-3)", display: "grid", placeItems: "center", fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--text-2)" }}>周</span>

        {notices ? <NoticePanel onGo={(p) => set(p)} onClose={() => setNotices(false)} /> : null}
        {proj ? (
          <>
            <div style={{ position: "fixed", inset: 0, zIndex: 55 }} onClick={() => setProj(false)} />
            <div style={{ position: "absolute", top: 46, right: 88, width: 268, zIndex: 60, background: "var(--surface-1)", border: "1px solid var(--line-strong)", borderRadius: 6, boxShadow: "var(--shadow-pop)", overflow: "hidden" }}>
              <div className="panel-head" style={{ minHeight: 36 }}><span className="panel-title">切换项目</span><span className="panel-sub">客户数据相互隔离</span></div>
              {[["恒立机器人 · B01", "人形双臂数据线", true], ["瀚海工业 · B02", "仓储与四足巡检", false], ["拓元精密 · B03", "产线装配力控", false], ["灵犀具身 · B04", "商用厨房长时序", false]].map((p) => (
                <button key={p[0]} className="listitem" onClick={() => {
                  setProj(false);
                  toast.push({ tone: p[2] ? "ok" : "warn", title: p[2] ? "已切换到 " + p[0] : "无法切换项目",
                    desc: p[2] ? "看板与列表数据已按该项目口径重新拉取。" : "按 G1.2 多租户与客户隔离，客户间数据不可见、不可搜、不可导。该账号无 B02 的访问权限，可向项目管理员申请。" });
                }}>
                  <div className="spread">
                    <span className="small" style={{ fontWeight: 600 }}>{p[0]}</span>
                    {p[2] ? <Tag tone="accent" icon="check">当前</Tag> : <Tag tone="quiet" icon="lock">隔离</Tag>}
                  </div>
                  <div className="tiny muted-3" style={{ marginTop: 3 }}>{p[1]}</div>
                </button>
              ))}
            </div>
          </>
        ) : null}
      </header>
    );

    function unusedToastHint() {}

    return (
      <div className="app">
        {topbar}
        <div className="body">
          <ErrorBoundary k={app.end + "-" + app.domain + "-" + app.page + "-" + app.flow}>
          {app.end === "platform" ? <PlatformShell app={app} set={set} theme={theme} setTheme={setTheme} /> : null}
          {app.end === "capture" ? (
            <div className="stage" style={{ width: "100%" }}>
              <div>
                <div className="phone">
                  <div className="phone-screen"><window.CAPTURE.CaptureApp /></div>
                </div>
                <div className="phone-caption">采集端 · 移动优先 · 支持桌面浏览（源：5.1 三端分工）</div>
              </div>
            </div>
          ) : null}
          {app.end === "portal" ? (
            <div className="stage" style={{ width: "100%" }}>
              <div style={{ width: "min(1240px,100%)" }}>
                <div className="window">
                  <div className="window-bar">
                    <span className="window-dots"><i /><i /><i /></span>
                    <span className="window-url"><Icon n="lock" s={11} /> portal.embodied-data.example / projects / B01</span>
                    <Tag tone="quiet" icon="eye">外部只读</Tag>
                  </div>
                  <div className="window-body"><window.PORTAL.PortalApp /></div>
                </div>
                <div className="phone-caption" style={{ marginTop: 12 }}>客户门户 · 桌面 Web · 外部只读（源：5.1 / 7.8）</div>
              </div>
            </div>
          ) : null}
          </ErrorBoundary>
        </div>

        {app.end === "platform" ? <FlowGuide app={app} onGo={goFlow} open={guide} setOpen={setGuide} /> : null}

        {help ? <HelpModal onClose={() => setHelp(false)} /> : null}
      </div>
    );
  }

  /* ---------- 关于弹层 ---------- */
  function HelpModal({ onClose }) {
    const [tab, setTab] = useState("范围");
    return (
      <Modal title="关于这份原型" desc="由《具身智能数据生产平台 产品设计文档（V1.1 增补版）》直接转化，非通用模板套用。" onClose={onClose} width={720}
        foot={<Btn tone="primary" onClick={onClose}>开始浏览</Btn>}>
        <div className="row-tight" style={{ gap: 4 }}>
          {["范围", "设计依据", "怎么演示"].map((t) => (
            <button key={t} className="btn" aria-pressed={tab === t} style={tab === t ? { background: "var(--surface-3)", borderColor: "var(--line-strong)" } : null} onClick={() => setTab(t)}>{t}</button>
          ))}
        </div>
        {tab === "范围" ? (
          <div className="col" style={{ gap: 12 }}>
            <DL rows={[
              ["三端", "平台端（桌面 Web）· 采集端（移动优先）· 客户门户（外部只读）"],
              ["平台端页面", "总览看板 · 任务与详情 · 上传与校验 · 质检台 · 规则配置 · 标注工作台 · 配方编辑器 · 快照 · 交付 · 检索 · 数据浏览器 · 仿真 / 看板 / 安全 / 配置各域"],
              ["覆盖流程", "第 7 章 F1–F8 全部八条，可用右下角「演示动线」逐条走查"],
              ["覆盖规范", "第 9 章状态反馈与四态、批量操作、通知分级、危险操作确认、播放器快捷键"],
              ["覆盖清单", "第 10 章 27 项异常（总览看板内可查）与第 11 章 23 项验收（配置域 → 设计验收清单）"],
            ]} />
            <div className="warnbox info">本原型的客户、任务、人员、数值均为演示数据；文档中标注「待核实」的阈值在本原型中同样只是示意，不得作为开发依据。</div>
          </div>
        ) : null}
        {tab === "设计依据" ? (
          <div className="col" style={{ gap: 12 }}>
            <DL rows={[
              ["设计原则", "P1 每一步有状态有人负责有据可查 · P2 判断尽量前移 · P3 异常必须有出路 · P4 结构化优先 · P5 零培训上手 · P6 数据不搬家"],
              ["视觉基调", "工业数据控制台：深色石墨底 + 中性冷蓝交互色 + 语义状态色；密排、锐角小圆角、细描边、等宽数字，无渐变与装饰动效"],
              ["状态语义", "通过 / 有条件通过 / 不通过 / 阻塞 / 转复核 五态配色，全站一致"],
              ["动效", "仅 150–400ms 状态变化，不做装饰"],
              ["无障碍", "所有可点区域满足移动端 44px 标准，采集端放大至 1.5 倍"],
            ]} />
          </div>
        ) : null}
        {tab === "怎么演示" ? (
          <div className="col" style={{ gap: 10 }}>
            {[["顶栏三端切换", "平台端 → 采集端 → 客户门户，同一份数据在三端的不同呈现"],
              ["右下角演示动线", "点开即列出 F1–F8，点任一条直接跳到对应界面"],
              ["质检台按顺序敲键盘", "1–5 评分、R 驳回、A 通过、M 打证据、空格播放、← → 逐帧，全程不碰鼠标"],
              ["采集端作业页", "「我的」里可模拟弱网离线与设备时间不同步；录制到第 3 步 4 秒后质量灯会由黄转红"],
              ["配方编辑器", "改自然语言、拖拽右侧流水线步骤、点发布快照看二次确认"],
              ["规则配置台", "改任一行阈值，右侧影响预估与试运行同步更新"],
            ].map((x) => (
              <div key={x[0]} className="row" style={{ gap: 10, alignItems: "flex-start" }}>
                <Icon n="arrowRight" s={13} style={{ color: "var(--accent)", flex: "0 0 auto", marginTop: 3 }} />
                <div><div className="small" style={{ fontWeight: 600 }}>{x[0]}</div><div className="tiny muted-3" style={{ marginTop: 2, lineHeight: 1.65 }}>{x[1]}</div></div>
              </div>
            ))}
          </div>
        ) : null}
      </Modal>
    );
  }

  /* ---------- 错误边界：单页异常不拖垮整站 ---------- */
  class ErrorBoundary extends React.Component {
    constructor(p) { super(p); this.state = { err: null }; }
    static getDerivedStateFromError(err) { return { err: err }; }
    componentDidUpdate(prev) { if (prev.k !== this.props.k && this.state.err) this.setState({ err: null }); }
    componentDidCatch(err) { try { console.error("[页面异常]", err); } catch (e) {} }
    render() {
      if (this.state.err) {
        return (
          <div className="stage" style={{ width: "100%" }}>
            <div className="warnbox danger" style={{ maxWidth: 620 }}>
              <div className="small" style={{ fontWeight: 600, marginBottom: 6 }}>这一页渲染时出了问题</div>
              <div className="tiny" style={{ lineHeight: 1.7, marginBottom: 10, fontFamily: "var(--mono)" }}>
                {String(this.state.err && this.state.err.message ? this.state.err.message : this.state.err)}
              </div>
              <div className="tiny muted-3">其余页面仍可正常浏览。切到别的页面会自动恢复；若需重试当前页，点下方按钮。</div>
              <div style={{ marginTop: 12 }}>
                <Btn size="sm" icon="refresh" onClick={() => this.setState({ err: null })}>重试本页</Btn>
              </div>
            </div>
          </div>
        );
      }
      return this.props.children;
    }
  }

  ReactDOM.createRoot(document.getElementById("root")).render(
    <ToastHost>
      <Root />
    </ToastHost>
  );
})();
