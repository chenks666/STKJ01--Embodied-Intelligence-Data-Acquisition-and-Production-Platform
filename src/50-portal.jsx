/* ============================================================
   客户门户（桌面 Web，外部只读，源：7.8 / 5.1）
   只做三件事：看进度、下载已交付数据集、提异议
   ============================================================ */
(function () {
  const { useState } = React;
  const { Tag, Btn, IconBtn, Panel, Field, Modal, DL, Kbd, cls, useToast, PageHead, StateBlock } = window.UI;
  const D = window.DATA;

  const NAV = [
    { k: "overview", n: "项目概览", i: "chart" },
    { k: "delivery", n: "交付与验收", i: "receipt" },
    { k: "datasets", n: "数据集与下载", i: "dataset" },
    { k: "objections", n: "异议", i: "message" },
  ];

  function PortalApp() {
    const [nav, setNav] = useState("overview");
    const toast = useToast();
    return (
      <div style={{ display: "flex", minHeight: "100%", background: "var(--bg)" }}>
        <aside style={{ width: 208, flex: "0 0 auto", background: "var(--surface-0)", borderRight: "1px solid var(--line)", display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "14px 14px 12px", borderBottom: "1px solid var(--line-soft)" }}>
            <div className="row" style={{ gap: 9 }}>
              <span className="brand-mark" style={{ width: 24, height: 24, borderColor: "var(--accent-line)" }}><Icon n="handshake" s={13} /></span>
              <div>
                <div className="small" style={{ fontWeight: 600 }}>客户门户</div>
                <div className="tiny muted-3">恒立机器人 · B01</div>
              </div>
            </div>
          </div>
          <div style={{ padding: 8, display: "flex", flexDirection: "column", gap: 2 }}>
            {NAV.map((x) => (
              <button key={x.k} className={cls("nav-item", nav === x.k && "active")} onClick={() => setNav(x.k)}>
                <span className="nav-ico"><Icon n={x.i} s={15} /></span>
                <span className="nav-label">{x.n}</span>
                {x.k === "objections" ? <span className="nav-badge">1</span> : null}
              </button>
            ))}
          </div>
          <div style={{ marginTop: "auto", padding: 12 }}>
            <div className="warnbox info" style={{ fontSize: 11, lineHeight: 1.65 }}>
              外部只读视图。客户之间不可见、不可搜、不可导。
            </div>
          </div>
        </aside>

        <main className="main" style={{ minWidth: 0, flex: 1 }}>
          {nav === "overview" ? <PortalOverview onGo={setNav} /> : null}
          {nav === "delivery" ? <window.PAGES_B.Delivery inPortal set={() => {}} /> : null}
          {nav === "datasets" ? <PortalDatasets toast={toast} /> : null}
          {nav === "objections" ? <PortalObjections toast={toast} /> : null}
        </main>
      </div>
    );
  }

  /* ---------- 项目概览 ---------- */
  function PortalOverview({ onGo }) {
    const V = D.DELIVERY;
    return (
      <>
        <PageHead
          crumbs={[{ label: "客户门户" }, { label: "项目概览" }]}
          title="项目概览"
          desc="进度与生产实际保持一致，避免销售承诺与生产实际脱节。此页所有数据与生产侧同源。"
          meta={<>
            <Tag tone="quiet">项目 B01 · 人形双臂数据线</Tag>
            <Tag tone="accent" icon="activity">进行中 · 第 3 单</Tag>
            <Tag tone="quiet" icon="user">您的客户经理</Tag>
          </>}
          actions={<Btn icon="message" tone="ghost" onClick={() => onGo("objections")}>提出异议</Btn>}
        />
        <div className="pagebody">
          <div className="grid g-4" style={{ marginBottom: 14 }}>
            {[["在产任务", "4", "个"], ["本月已交付", "2", "个数据集"], ["待您验收", "1", "个"], ["累计交付时长", "3.1", "小时"]].map((m) => (
              <div key={m[0]} className="panel-inset" style={{ padding: 13 }}>
                <div className="tiny muted-3">{m[0]}</div>
                <div className="mono" style={{ fontSize: 24, fontWeight: 600, marginTop: 3 }}>{m[1]}<span className="tiny muted-3" style={{ marginLeft: 4 }}>{m[2]}</span></div>
              </div>
            ))}
          </div>

          <div className="grid" style={{ gridTemplateColumns: "minmax(0,1.3fr) minmax(0,1fr)" }}>
            <Panel title="交付进度" sub="待您验收" flush>
              <div style={{ padding: 16 }}>
                <div className="spread" style={{ marginBottom: 10 }}>
                  <span className="row" style={{ gap: 8 }}>
                    <span className="mono small">{V.id}</span>
                    <Tag tone="accent" dot>待客户验收</Tag>
                  </span>
                  <span className="tiny muted-3">交期 {V.due}</span>
                </div>
                <div className="bar thick" style={{ marginBottom: 14 }}><i style={{ width: V.progress * 100 + "%" }} /></div>
                <div className="tlflow">
                  {V.steps.map((s, i) => (
                    <div key={s.k} className={cls("tlflow-node", s.st === "done" ? "done" : s.st === "active" ? "active" : "")}>
                      <div className="tlflow-rail">
                        <span className="tlflow-dot">{s.st === "done" ? <Icon n="check" s={12} sw={2.6} /> : s.st === "active" ? <Icon n="activity" s={12} /> : "·"}</span>
                        {i < V.steps.length - 1 ? <span className="tlflow-line" /> : null}
                      </div>
                      <div className="tlflow-body">
                        <div className="spread">
                          <span className="small" style={{ fontWeight: 600 }}>{s.k}</span>
                          <span className="tiny muted-3 mono">{s.t}</span>
                        </div>
                        {s.st === "active" ? <div className="tiny muted-3" style={{ marginTop: 4 }}>请查看交付清单与 Data Card，并在 09-19 前完成签认或提出异议。</div> : null}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="row" style={{ gap: 8, marginTop: 14 }}>
                  <Btn tone="primary" icon="receipt" onClick={() => onGo("delivery")}>查看并验收</Btn>
                  <Btn tone="ghost" icon="message" onClick={() => onGo("objections")}>提出异议</Btn>
                </div>
              </div>
            </Panel>

            <div className="col" style={{ gap: 14 }}>
              <Panel title="合同范围" sub="范围外需求走变更流程" flush>
                <div style={{ padding: 14 }}>
                  <DL rows={[
                    ["合同场景", "厨房 / 台面 · 折叠衣物"],
                    ["约定规模", "1 200 条 / 6.4 小时"],
                    ["已交付", "297 条 / 0.52 小时（第 1 批）"],
                    ["数据格式", "LeRobot v2.1 + HDF5"],
                    ["部署形态", "私有化 · 数据不出本地"],
                    ["授权", "仅限内部模型训练，禁止再分发"],
                  ]} />
                </div>
              </Panel>
              <Panel title="服务与支持" flush>
                <div style={{ padding: 14, display: "flex", flexDirection: "column", gap: 8 }}>
                  {[["客户经理", "工作日 9:00–18:00"], ["技术支持", "响应时效 4 小时"], ["交付答疑", "数据格式与加载 SDK 使用"]].slice(0).map((x) => (
                    <div key={x[0]} className="spread">
                      <span className="small muted">{x[0]}</span>
                      <span className="tiny muted-3">{x[1]}</span>
                    </div>
                  ))}
                </div>
              </Panel>
            </div>
          </div>
        </div>
      </>
    );
  }

  /* ---------- 数据集与下载 ---------- */
  function PortalDatasets({ toast }) {
    return (
      <>
        <PageHead
          crumbs={[{ label: "客户门户" }, { label: "数据集与下载" }]}
          title="数据集与下载"
          desc="仅展示已交付给您组织的数据集。下载受授权时效约束，文件带水印与来源指纹，每次下载均留痕。"
          meta={<><Tag tone="quiet">已交付 3 个数据集</Tag><Tag tone="ok" icon="lock">下载授权有效至 09-28</Tag></>}
        />
        <div className="pagebody">
          <div className="panel" style={{ overflow: "hidden" }}>
            <table className="table">
              <thead><tr><th>数据集</th><th className="num">条数</th><th className="num">时长</th><th>格式</th><th>交付日期</th><th>状态</th><th /></tr></thead>
              <tbody>
                {[["DS-KITCH-FOLD-v3", 297, "0.52h", "LeRobot v2.1 + HDF5", "09-14", "待验收", "accent"],
                  ["DS-KITCH-FOLD-v2", 268, "0.47h", "LeRobot v2.1", "09-12", "已签认", "ok"],
                  ["DS-GRASP-NEG-v1", 600, "1.06h", "RLDS + HDF5", "09-05", "已签认", "ok"]].map((r) => (
                  <tr key={r[0]} className="clickable">
                    <td><div style={{ fontWeight: 600 }}>{r[0]}</div><div className="tiny muted-3">{r[0] === "DS-KITCH-FOLD-v3" ? "含 Data Card、质量报告、验收单" : "含 Data Card 与质量报告"}</div></td>
                    <td className="num">{r[1]}</td>
                    <td className="num">{r[2]}</td>
                    <td className="muted">{r[3]}</td>
                    <td className="mono small">{r[4]}</td>
                    <td><Tag tone={r[5]} dot>{r[5] === "accent" ? "待验收" : r[5] === "ok" ? "已签认" : r[5]}</Tag></td>
                    <td><Btn size="sm" tone="ghost" icon="download" onClick={() => toast.push({ tone: "info", title: "下载已开始", desc: "文件已带水印 WM-2f91c4，链接 48 小时内有效。" })}>下载</Btn></td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="panel-foot">
              <Icon n="shield" s={12} />
              <span>所有下载均记录接收方与时间。分发后可由水印与来源指纹定位泄露来源。</span>
            </div>
          </div>

          <Panel title="Data Card · DS-KITCH-FOLD-v3" sub="判断数据能否用于训练的依据" className="" flush>
            <div style={{ padding: 14 }}>
              <DL rows={[["来源", D.DATA_CARD.source], ["本体", D.DATA_CARD.embody], ["传感器", D.DATA_CARD.sensors], ["场景", D.DATA_CARD.scene], ["分布", D.DATA_CARD.distribution], ["质量", D.DATA_CARD.quality], ["授权", D.DATA_CARD.license]]} />
              <div className="field-label" style={{ margin: "14px 0 7px" }}>已知限制</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {D.DATA_CARD.limits.map((l, i) => (
                  <div key={i} className="panel-inset" style={{ padding: "9px 11px", borderLeft: "3px solid var(--danger)", display: "flex", gap: 8 }}>
                    <span className="mono tiny muted-3" style={{ flex: "0 0 auto" }}>L{i + 1}</span>
                    <span className="small pretty" style={{ lineHeight: 1.7 }}>{l}</span>
                  </div>
                ))}
              </div>
            </div>
          </Panel>
        </div>
      </>
    );
  }

  /* ---------- 异议 ---------- */
  function PortalObjections({ toast }) {
    const [open, setOpen] = useState(false);
    return (
      <>
        <PageHead
          crumbs={[{ label: "客户门户" }, { label: "异议" }]}
          title="异议"
          desc="异议必须结构化并锚定到具体片段或字段，否则整改无法执行，只能反复沟通。提交后自动关联到采集或标注环节并生成整改任务。"
          meta={<><Tag tone="warn" dot>1 条处理中</Tag><Tag tone="quiet" dot>1 条已关闭</Tag></>}
          actions={<Btn tone="primary" icon="plus" onClick={() => setOpen(true)}>新建异议</Btn>}
        />
        <div className="pagebody">
          <div className="grid g-2">
            <Panel title="我的异议" sub="按提交时间倒序" flush>
              <div style={{ padding: 14, display: "flex", flexDirection: "column", gap: 10 }}>
                {D.OBJECTIONS.map((o) => (
                  <div key={o.id} className="panel" style={{ background: "var(--surface-1)" }}>
                    <div style={{ padding: 12 }}>
                      <div className="spread">
                        <span className="row" style={{ gap: 8 }}>
                          <span className="mono small">{o.id}</span>
                          <Tag tone={o.st === "处理中" ? "warn" : "quiet"} dot>{o.st}</Tag>
                        </span>
                        <span className="tiny muted-3">{o.t}</span>
                      </div>
                      <div className="small pretty" style={{ marginTop: 8, lineHeight: 1.75 }}>{o.text}</div>
                      <div className="row" style={{ gap: 6, marginTop: 9, flexWrap: "wrap" }}>
                        <Icon n="target" s={12} style={{ color: "var(--accent)", flex: "0 0 auto" }} />
                        <span className="codechip">{o.anchor}</span>
                      </div>
                      <div className="small muted pretty" style={{ marginTop: 9, paddingLeft: 10, borderLeft: "2px solid var(--accent-line)", lineHeight: 1.7 }}>{o.reply}</div>
                    </div>
                  </div>
                ))}
              </div>
            </Panel>

            <div className="col" style={{ gap: 14 }}>
              <Panel title="结构化异议怎么写" sub="锚点是关键" flush>
                <div style={{ padding: 14, display: "flex", flexDirection: "column", gap: 10 }}>
                  {[["1", "选锚点", "片段与帧，或元数据字段、Data Card 条目。没有锚点的异议无法执行。"],
                    ["2", "写清现象", "具体到时间码与表现，例如「01:00 处轨迹明显抖动」。"],
                    ["3", "给出判断依据", "说明为何认为不属于数据问题，例如「怀疑本体控制异常」。"],
                    ["4", "等待整改回执", "异议将生成整改任务并指派到采集或标注环节，闭环后重新提交验收。"]].map((s) => (
                    <div key={s[0]} className="row" style={{ gap: 10, alignItems: "flex-start" }}>
                      <span className="m-stepnum" style={{ flex: "0 0 auto" }}>{s[0]}</span>
                      <div>
                        <div className="small" style={{ fontWeight: 600 }}>{s[1]}</div>
                        <div className="tiny muted-3" style={{ marginTop: 3, lineHeight: 1.65 }}>{s[2]}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </Panel>
              <Panel title="超出合同范围的需求" flush>
                <div style={{ padding: 14 }}>
                  <div className="warnbox">门户提示范围外并记录。超出合同范围的调整走变更流程，不直接改生产，避免口头的范围蔓延影响交期。</div>
                  <Btn size="sm" tone="ghost" block icon="send" style={{ marginTop: 10 }}
                    onClick={() => toast.push({ tone: "info", title: "已提交变更申请", desc: "客户经理将在 1 个工作日内联系您确认范围、工期与报价影响。" })}>提交变更申请</Btn>
                </div>
              </Panel>
            </div>
          </div>
        </div>
        {open ? <window.PAGES_B.ObjectionDialog onClose={() => setOpen(false)} /> : null}
      </>
    );
  }

  window.PORTAL = { PortalApp };
})();
