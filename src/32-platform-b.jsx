/* ============================================================
   平台端页面 B：质检台 / 规则配置 / 标注 / 配方 / 快照 / 交付 / 其余域
   ============================================================ */
(function () {
  const { useState, useMemo, useEffect, useRef } = React;
  const { Tag, Btn, IconBtn, Panel, Field, Switch, StateBlock, Modal, Drawer, DangerConfirm,
    Hist, ConfBand, MultiView, Transport, Timeline, OverlaySwitch, PageHead, DL, Kbd,
    VIEWS, fmtTime, useTicker, cls } = window.UI;
  const D = window.DATA;

  /* ============================================================
     质检待办队列（源：7.4 左栏）
     ============================================================ */
  const RISK_LABEL = { high: "高风险", mid: "中", low: "低" };

  function QCQueue({ app, set, compact }) {
    const [flt, setFlt] = useState("全部");
    // 从总览热力图下钻时带入采集员筛选，让「跳转」真的落在同一上下文
    const [emp, setEmp] = useState((app.payload && app.payload.emp) || "全部");
    const rows = D.QC_QUEUE.filter((r) => (flt === "全部" ? true : flt === "高风险" ? r.risk === "high" : r.done ? true : !r.done))
      .filter((r) => (emp === "全部" ? true : r.emp === emp));
    const pending = D.QC_QUEUE.filter((r) => !r.done).length;

    const body = (
      <div className="wb-body">
        <div style={{ padding: "9px 12px", borderBottom: "1px solid var(--line-soft)", display: "flex", flexDirection: "column", gap: 7 }}>
          <div className="spread">
            <span className="tiny muted-3">待办 <b className="mono" style={{ color: "var(--danger)" }}>{pending}</b> 条 · 预计耗时 2 小时 40 分</span>
            <IconBtn n="filter" s={13} title="筛选" />
          </div>
          <div className="row-tight" style={{ gap: 3 }}>
            {["全部", "高风险", "未判定"].map((f) => (
              <button key={f} className="btn btn-sm" aria-pressed={flt === f}
                style={flt === f ? { background: "var(--surface-3)", borderColor: "var(--line-strong)" } : null}
                onClick={() => setFlt(f)}>{f}</button>
            ))}
            <select className="select" style={{ height: 25, width: 96, marginLeft: "auto", fontSize: 11 }}
              value={emp} onChange={(e) => setEmp(e.target.value)}>
              {["全部", "采集员 A", "采集员 B", "采集员 C", "现场督导"].map((e) => <option key={e}>{e}</option>)}
            </select>
          </div>
        </div>
        {rows.map((r) => (
          <button key={r.id} className={cls("listitem", app.qcId === r.id && "active")} onClick={() => set({ qcId: r.id })}>
            <div className="spread">
              <span className="mono small">{r.id}</span>
              <Tag tone={r.risk === "high" ? "danger" : r.risk === "mid" ? "warn" : "quiet"} dot>{RISK_LABEL[r.risk]}</Tag>
            </div>
            <div className="tiny muted-3" style={{ marginTop: 4 }}>{r.task} · {r.scene} · {r.emp}</div>
            <div className="row" style={{ marginTop: 6, gap: 10 }}>
              <span className="tiny muted-3 mono"><Icon n="clock" s={10} /> {r.dur}</span>
              {r.machine.length ? (
                <span className="tiny" style={{ color: "var(--warn)" }}><Icon n="warn" s={10} /> 机审 {r.machine.length} 处</span>
              ) : (
                <span className="tiny" style={{ color: "var(--ok)" }}><Icon n="check" s={10} /> 机审通过</span>
              )}
              {r.done ? <span className="tiny" style={{ color: "var(--ok)", marginLeft: "auto" }}>已判定 {r.score} 分</span> : null}
            </div>
          </button>
        ))}
        <div style={{ padding: 12 }}>
          <div className="warnbox info" style={{ fontSize: 11, lineHeight: 1.65 }}>
            按风险与客户优先级排序，而非按时间。低置信与机审命中多的条目自动排在队列前面，把人的注意力花在最可能出错的地方。
          </div>
        </div>
      </div>
    );
    if (compact) return body;
    return (
      <div className="wb-col">
        <div className="wb-head"><span className="small" style={{ fontWeight: 600 }}>待办队列</span><span className="grow" />
          <Tag tone="danger" dot>{pending}</Tag></div>
        {body}
      </div>
    );
  }

  /* ============================================================
     质检台（源：7.4）
     ============================================================ */
  function QCConsole({ app, set }) {
    const toast = window.UI.useToast();
    const [cur, setCur] = useState(app.qcId || D.QC_QUEUE[0].id);
    const [t, setT] = useTicker(372, false);
    const [playing, setPlaying] = useState(false);
    const [views, setViews] = useState(4);
    const [main, setMain] = useState("exo");
    const [ov, setOv] = useState(["box", "hand", "force"]);
    const [score, setScore] = useState(null);
    const [codes, setCodes] = useState([]);
    const [evid, setEvid] = useState([]);
    const [note, setNote] = useState("");
    const [openGroup, setOpenGroup] = useState("采集操作类");
    const [logOpen, setLogOpen] = useState(false);

    const row = D.QC_QUEUE.filter((r) => r.id === cur)[0] || D.QC_QUEUE[0];
    const canReject = codes.length > 0 && codes.length <= 3 && evid.length > 0;
    const canPass = score != null;

    /* 全键盘：一轮判定不碰鼠标 */
    useEffect(() => {
      const h = (e) => {
        const tag = (e.target.tagName || "").toLowerCase();
        if (tag === "input" || tag === "textarea" || tag === "select") return;
        if (e.key >= "1" && e.key <= "5") { setScore(Number(e.key)); e.preventDefault(); }
        else if (e.key === " ") { setPlaying((p) => !p); e.preventDefault(); }
        else if (e.key === "ArrowLeft") { setT((v) => Math.max(0, v - 1 / 372)); e.preventDefault(); }
        else if (e.key === "ArrowRight") { setT((v) => Math.min(1, v + 1 / 372)); e.preventDefault(); }
        else if (e.key.toLowerCase() === "r") {
          if (canReject) doReject();
          else toast.push({
            tone: "warn",
            title: "驳回被拦住",
            desc: "驳回必须附原因码与至少一条证据" + (codes.length === 0 ? "；当前未选原因码。" : codes.length > 3 ? "；原因码最多 3 个，当前 " + codes.length + " 个。" : "；当前缺证据，按 M 在播放位置打一条。"),
          });
          e.preventDefault();
        }
        else if (e.key.toLowerCase() === "a") {
          if (canPass) doPass();
          else toast.push({ tone: "warn", title: "通过被拦住", desc: "通过前必须先给质量分，按 1–5 打分。" });
          e.preventDefault();
        }
        else if (e.key.toLowerCase() === "m") { addEvidence(); }
        else if (e.key === "Enter" && e.shiftKey) { next(); }
        else if (["6", "7", "8", "9"].indexOf(e.key) >= 0) { const i = Number(e.key) - 6; if (VIEWS[i]) setMain(VIEWS[i].k); }
      };
      window.addEventListener("keydown", h);
      return () => window.removeEventListener("keydown", h);
    }, [canReject, canPass, codes, evid, score]);

    const addEvidence = () => {
      const f = Math.round(t * 372);
      setEvid((v) => v.concat([{ t: t, frame: f }]));
      toast.push({ tone: "info", title: "已添加证据", desc: "时间码 " + fmtTime(t * 372) + " · 第 " + f + " 帧。" });
    };
    const next = () => {
      const idx = D.QC_QUEUE.findIndex((r) => r.id === cur);
      const nx = D.QC_QUEUE[(idx + 1) % D.QC_QUEUE.length];
      setCur(nx.id); set({ qcId: nx.id });
      setScore(null); setCodes([]); setEvid([]); setNote(""); setT(0.42);
    };
    const doReject = () => {
      toast.push({ tone: "danger", title: "已驳回并生成重采任务", desc: "原因码 " + codes.map((c) => c.code).join(" / ") + "，证据 " + evid.length + " 处。重采任务已预填指派对象 " + row.emp + "。" });
      next();
    };
    const doPass = () => {
      toast.push({ tone: "ok", title: "已通过", desc: "评分 " + score + " 分，自动跳转下一条并预加载。" });
      next();
    };

    const selAdvice = codes.length ? codes[codes.length - 1] : null;

    return (
      <>
        <PageHead
          crumbs={[{ label: "质量", to: () => set({ page: "qcqueue" }) }, { label: "质检台" }]}
          title="质检台"
          desc="一轮判定必须能全键盘完成。评分、驳回、通过、下一条、逐帧、切换视角全部绑定快捷键，并把快捷键提示常显在界面上而非藏在帮助里。"
          meta={
            <>
              <Tag tone="danger" dot>待办 {D.QC_QUEUE.filter((r) => !r.done).length} 条</Tag>
              <Tag tone="quiet" icon="clock">本轮已判定 12 条 · 平均 26 秒 / 条</Tag>
              <Tag tone="quiet" icon="gauge">机审命中率 31% · 人工改判率 6.2%</Tag>
            </>
          }
          actions={<>
            <Btn icon="keyboard" tone="ghost" onClick={() => setLogOpen(true)}>快捷键</Btn>
            <Btn icon="chart" tone="ghost">质量看板</Btn>
          </>}
        />
        <div className="pagebody flush">
          <div className="wb wb-3" style={{ height: "100%" }}>
            <QCQueue app={app} set={set} />
            <div className="wb-col" style={{ borderRight: "1px solid var(--line)" }}>
              <div className="wb-head">
                <span className="mono small">{row.id}</span>
                <Tag tone={row.risk === "high" ? "danger" : "warn"} dot>{RISK_LABEL[row.risk]}</Tag>
                <span className="tiny muted-3">{row.task} · {row.scene} · {row.emp} · {row.dur}</span>
                <span className="grow" />
                <span className="tiny muted-3">播放器已对齐到机审异常点</span>
              </div>
              <div className="wb-body" style={{ background: "var(--surface-inset)", display: "flex", alignItems: "center" }}>
                <div style={{ width: "100%" }}>
                  <MultiView views={VIEWS} t={t} count={views} main={main} onMain={setMain} overlays={ov} tileH={views === 4 ? 300 : 380} />
                </div>
              </div>
              <div className="wb-foot">
                <Transport t={t} playing={playing} duration={372}
                  onToggle={() => setPlaying(!playing)} onSeek={setT}
                  onStep={(d) => setT((v) => Math.max(0, Math.min(1, v + d)))}
                  views={VIEWS} main={main} onMain={setMain}
                  extra={<Btn size="sm" tone="ghost" icon="flag" onClick={addEvidence}>打证据 <Kbd>M</Kbd></Btn>} />
                <Timeline t={t} onSeek={setT} duration={372}
                  machine={row.machine}
                  notes={D.ANNO_NOTES}
                  tracks={[{ id: "action", color: "var(--domain-c)", name: "动作段", segs: D.ANNO_TRACKS[0].segs },
                    { id: "contact", color: "var(--warn)", name: "接触事件", segs: D.ANNO_TRACKS[3].segs }]} />
              </div>
            </div>

            <div className="wb-col" style={{ borderRight: 0 }}>
              <div className="wb-head"><span className="small" style={{ fontWeight: 600 }}>判定面板</span><span className="grow" />
                <Tag tone={canReject || canPass ? "accent" : "quiet"} dot>{(canReject || canPass) ? "可提交" : "未满足提交条件"}</Tag></div>
              <div className="wb-body">
                <div style={{ padding: 14, display: "flex", flexDirection: "column", gap: 14 }}>
                  <div>
                    <div className="spread" style={{ marginBottom: 7 }}>
                      <span className="field-label" style={{ margin: 0 }}>质量评分<span className="req">·</span></span>
                      <span className="tiny muted-3">键盘 1–5</span>
                    </div>
                    <div className="score">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <button key={n} className={cls(score === n && "on")} onClick={() => setScore(n)}>
                          {n}<span className="k">{n}</span>
                        </button>
                      ))}
                    </div>
                    <div className="spread tiny muted-3" style={{ marginTop: 5 }}>
                      <span>1 完全不可用</span><span>3 合格</span><span>5 优质</span>
                    </div>
                  </div>

                  <div className="hr" />

                  <div>
                    <div className="spread" style={{ marginBottom: 7 }}>
                      <span className="field-label" style={{ margin: 0 }}>机审证据链</span>
                      <Tag tone="quiet" icon="cpu">模型 {D.MACHINE_EVIDENCE.model}</Tag>
                    </div>
                    <div className="panel-inset" style={{ padding: 11 }}>
                      <div className="spread" style={{ marginBottom: 9 }}>
                        <span className="row" style={{ gap: 7 }}>
                          <span className="codechip">{D.MACHINE_EVIDENCE.propose.code}</span>
                          <span className="small">{D.MACHINE_EVIDENCE.propose.name}</span>
                          <span className="tiny muted-3 mono">{D.MACHINE_EVIDENCE.propose.seg}</span>
                        </span>
                        <Tag tone="accent">置信度 {Math.round(D.MACHINE_EVIDENCE.propose.conf * 100)}%</Tag>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        {D.MACHINE_EVIDENCE.chain.map((e) => (
                          <button key={e.k} className="row" style={{ gap: 8, border: 0, background: "transparent", color: "inherit", cursor: "pointer", textAlign: "left", padding: 0 }}
                            onClick={() => toast.push({ tone: "info", title: "已跳转证据", desc: e.rule + " · " + e.jump })}>
                            <Icon n="chevRight" s={11} style={{ color: "var(--text-4)", flex: "0 0 auto" }} />
                            <span className="small muted grow pretty">{e.k}</span>
                            <span className="mono tiny nowrap" style={{ color: "var(--danger)" }}>{e.v}</span>
                          </button>
                        ))}
                      </div>
                      <div className="hr" style={{ margin: "10px 0" }} />
                      <div className="spread">
                        <span className="tiny muted-3">该原因码历史机审准确率 {Math.round(D.MACHINE_EVIDENCE.precision * 100)}%</span>
                        <Btn size="sm" tone="ghost" icon="check"
                          onClick={() => {
                            const it = D.REASON_CODES[2].items[0];
                            if (!codes.some((c) => c.code === it.code) && codes.length < 3) setCodes(codes.concat([it]));
                            toast.push({ tone: "ok", title: "已采纳机审建议", desc: "原因码 " + it.code + " 已选中。结论仍以人工判定为准，采纳与改判都会回写人机一致率。" });
                          }}>采纳建议</Btn>
                      </div>
                      <div className="tiny muted-3" style={{ marginTop: 8, lineHeight: 1.65 }}>
                        模型给结论、也给证据：人先看证据再决定是否采纳。采纳与改判都会回写一致率，低于阈值时反过来提示规则需要调整。
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="spread" style={{ marginBottom: 7 }}>
                      <span className="field-label" style={{ margin: 0 }}>原因码<span className="req">·</span></span>
                      <span className="tiny" style={{ color: codes.length > 3 ? "var(--danger)" : "var(--text-3)" }}>
                        两级结构，最多选 3 个（已选 {codes.length}）
                      </span>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                      {D.REASON_CODES.map((g) => (
                        <div key={g.group}>
                          <button className="spread" style={{ width: "100%", border: 0, background: "transparent", color: "inherit", cursor: "pointer", padding: "4px 0" }}
                            onClick={() => setOpenGroup(openGroup === g.group ? "" : g.group)}>
                            <span className="row" style={{ gap: 7 }}>
                              <Icon n="chevDown" s={11} style={{ transform: openGroup === g.group ? "none" : "rotate(-90deg)", transition: "transform 150ms" }} />
                              <span className="small" style={{ fontWeight: 600 }}>{g.group}</span>
                              <span className="codechip">{g.seg}</span>
                            </span>
                            <span className="tiny muted-3">{D.REASON_CODES.filter((x) => x.group === g.group)[0].items.length} 项</span>
                          </button>
                          {openGroup === g.group ? (
                            <div className="rc-group" style={{ marginTop: 4 }}>
                              {g.items.map((it) => {
                                const on = codes.some((c) => c.code === it.code);
                                return (
                                  <button key={it.code} className={cls("rc-item", on && "on")}
                                    onClick={() => setCodes(on ? codes.filter((c) => c.code !== it.code) : (codes.length >= 3 ? codes : codes.concat([it])))}>
                                    <span className="rc-code">{it.code}</span>
                                    <span className="grow">
                                      <span className="small" style={{ color: on ? "var(--danger)" : "var(--text)" }}>{it.name}</span>
                                      {on ? <span className="tiny muted-3" style={{ display: "block", marginTop: 3, lineHeight: 1.6 }}>{it.advice}</span> : null}
                                    </span>
                                    <Icon n={on ? "check" : "plus"} s={12} style={{ flex: "0 0 auto", marginTop: 2, color: on ? "var(--danger)" : "var(--text-4)" }} />
                                  </button>
                                );
                              })}
                            </div>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  </div>

                  {selAdvice ? (
                    <div className="warnbox info">
                      <div className="row" style={{ gap: 6, marginBottom: 5 }}>
                        <Icon n="cpu" s={12} /><span className="small" style={{ fontWeight: 600 }}>标准处置建议（自动带出，可微调）</span>
                      </div>
                      <span className="pretty">{selAdvice.advice}</span>
                    </div>
                  ) : null}

                  <div>
                    <div className="spread" style={{ marginBottom: 7 }}>
                      <span className="field-label" style={{ margin: 0 }}>驳回证据<span className="req">·</span></span>
                      <span className="tiny" style={{ color: evid.length ? "var(--ok)" : "var(--danger)" }}>
                        {evid.length ? "已添加 " + evid.length + " 处" : "至少 1 处，否则驳回按钮禁用"}
                      </span>
                    </div>
                    <div className="row" style={{ gap: 6, flexWrap: "wrap" }}>
                      {evid.map((e, i) => (
                        <span key={i} className="codechip" title={"第 " + e.frame + " 帧"}>
                          <Icon n="flag" s={10} /> {fmtTime(e.t * 372)}
                          <button className="iconbtn" style={{ width: 14, height: 14 }} onClick={() => setEvid(evid.filter((_, k) => k !== i))}><Icon n="x" s={9} /></button>
                        </span>
                      ))}
                    </div>
                    <Btn size="sm" tone="ghost" icon="plus" style={{ marginTop: 7 }} onClick={addEvidence}>
                      在当前帧添加证据 <Kbd>M</Kbd>
                    </Btn>
                  </div>

                  <Field label="备注（自由文本仅作补充，结构化字段优先）">
                    <textarea className="textarea" rows={2} value={note} onChange={(e) => setNote(e.target.value)}
                      placeholder="补充说明，将随判定一并写入记录" />
                  </Field>

                  <div className="hr" />
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <Btn tone="ok" size="lg" block disabled={!canPass} onClick={doPass} icon="check">
                      通过并下一条 <Kbd>A</Kbd>
                    </Btn>
                    <Btn tone="danger" size="lg" block disabled={!canReject} onClick={doReject} icon="x">
                      驳回 <Kbd>R</Kbd>
                    </Btn>
                    <Btn tone="ghost" block disabled={!canReject} onClick={() => toast.push({ tone: "warn", title: "已进入仲裁队列", desc: "采集员申诉后由项目经理裁定，结论可回写原因码字典。" })} icon="handshake">
                      提交仲裁 <Kbd>⇧↵</Kbd>
                    </Btn>
                    {!canReject && !canPass ? (
                      <div className="tiny" style={{ color: "var(--danger)", lineHeight: 1.65 }}>
                        提交条件：通过需先评分；驳回需原因码（1–3 个）加至少 1 处证据。没有证据的驳回会在采集端变成无法执行的指令。
                      </div>
                    ) : null}
                  </div>

                  <div className="warnbox">
                    同一原因码在同一任务重复出现 3 次以上将触发规格复核提醒，从源头治理而非指责个体。
                  </div>
                </div>
              </div>
              <div className="keybar">
                <span><Kbd>1</Kbd>–<Kbd>5</Kbd> 评分</span>
                <span><Kbd>R</Kbd> 驳回</span>
                <span><Kbd>A</Kbd> 通过</span>
                <span><Kbd>M</Kbd> 打证据</span>
                <span><Kbd>空格</Kbd> 播放</span>
                <span><Kbd>←</Kbd><Kbd>→</Kbd> 逐帧</span>
                <span><Kbd>6</Kbd>–<Kbd>9</Kbd> 切视图</span>
              </div>
            </div>
          </div>
        </div>

        {logOpen ? (
          <Modal title="质检快捷键" desc="快捷键提示常显于界面，不藏在帮助文档里。" onClose={() => setLogOpen(false)} width={520}>
            <DL rows={[
              ["1 – 5", "质量评分"], ["R", "驳回（需原因码 + 证据）"], ["A", "通过并自动跳下一条"],
              ["M / Shift + M", "在当前帧打证据 / 标记"], ["空格", "播放与暂停（焦点在输入框时除外）"],
              ["← →", "逐帧前后；长按连续步进"], ["Shift + ← →", "跳转一秒，快速粗定位"],
              ["6 – 9", "切换视角（按外、头、腕、深度的配置顺序）"], ["↑ ↓", "在标记之间跳转"],
              ["Esc", "关闭当前浮层"], ["Shift + ↵", "提交仲裁"],
            ]} />
          </Modal>
        ) : null}
      </>
    );
  }

  /* ============================================================
     质检规则配置台（源：8.8）
     ============================================================ */
  function RuleConfig() {
    const toast = window.UI.useToast();
    const [rules, setRules] = useState(D.RULES);
    const [sel, setSel] = useState(D.RULES[4].code);
    const [trial, setTrial] = useState(false);
    const [pending, setPending] = useState(D.RULES[4].val);
    const [creating, setCreating] = useState(false);
    const [nr, setNr] = useState({ code: "", dim: "内容", logic: "", op: ">", val: "", unit: "%", action: "驳回" });
    const r = rules.filter((x) => x.code === sel)[0];

    const DIMS = ["同步", "完整性", "可见性", "内容", "元数据", "命名", "重复", "标定", "合规", "成像", "遮挡", "有效性", "一致性", "划分"];
    const UNITS = ["%", "帧", "项", "天", "m/s²", "σ", "—"];
    const submitNew = () => {
      const code = (nr.code || "").trim().toUpperCase() || ("QC-NEW-" + String(rules.length + 1).padStart(2, "0"));
      if (rules.some((x) => x.code === code)) { toast.push({ tone: "warn", title: "规则编号已被占用", desc: code + " 已存在，请改用未占用的编号。" }); return; }
      if (!(nr.logic || "").trim()) { toast.push({ tone: "warn", title: "判定逻辑不能为空", desc: "判定逻辑会被开发直接实现，必须写清可测量的量与比较方式。" }); return; }
      if (nr.val === "" || isNaN(Number(nr.val))) { toast.push({ tone: "warn", title: "阈值必须是数字", desc: "无量纲规则可填 0，但不可留空。" }); return; }
      const row = { code, dim: nr.dim, logic: nr.logic.trim(), val: Number(nr.val), unit: nr.unit, op: nr.op, action: nr.action, on: true, hit7: 0, rate7: 0 };
      setRules((rs) => rs.concat([row]));
      setSel(code); setPending(row.val); setCreating(false);
      setNr({ code: "", dim: "内容", logic: "", op: ">", val: "", unit: "%", action: "驳回" });
      toast.push({ tone: "ok", title: "规则已创建 · 以试运行接入", desc: code + " 已加入规则库并置为启用，先按试运行统计命中，不参与实际驳回，确认影响面后再切换到生效。" });
    };

    const setVal = (code, v) => setRules((rs) => rs.map((x) => (x.code === code ? Object.assign({}, x, { val: v }) : x)));
    const toggle = (code) => setRules((rs) => rs.map((x) => (x.code === code ? Object.assign({}, x, { on: !x.on }) : x)));

    const hitAfter = Math.round(r.hit7 * (1 + (r.val - pending) / (pending || 1) * 0.9));
    const delta = hitAfter - r.hit7;

    return (
      <>
        <PageHead
          crumbs={[{ label: "质量" }, { label: "规则配置" }]}
          title="质检规则配置台"
          desc="阈值变更必须先看影响面。质检阈值是全局杠杆，改一个数可能导致数千条数据被驳回或放行，因此配置台必须内建影响预估与试运行，不能让阈值修改成为盲操作。"
          meta={
            <>
              <Tag tone="quiet">{rules.filter((x) => x.on).length} / {rules.length} 条规则启用</Tag>
              <Tag tone="quiet" icon="branch">规则库版本 QC-RULES-v3 · 已绑定 4 个任务</Tag>
              <Tag tone="warn" icon="info">所有阈值当前均为待核实项，需以内部实测基线设定</Tag>
            </>
          }
          actions={<>
            <Btn icon="upload" tone="ghost">导出规则集</Btn>
            <Btn icon="plus" tone="primary" onClick={() => setCreating(true)}>新建规则</Btn>
          </>}
        />
        <div className="pagebody flush">
          <div className="wb" style={{ gridTemplateColumns: "minmax(0,1fr) 380px", height: "100%" }}>
            <div className="wb-col">
              <div className="wb-head">
                <span className="small" style={{ fontWeight: 600 }}>规则表</span>
                <div className="gsearch" style={{ flex: "0 1 220px", height: 26 }}><Icon n="search" s={13} /><input placeholder="按编号 / 维度搜索" /></div>
                <span className="grow" />
                <span className="tiny muted-3">行内编辑阈值，开关即时生效</span>
              </div>
              <div className="wb-body">
                <table className="table">
                  <thead>
                    <tr>
                      <th style={{ width: 118 }}>规则编号</th><th style={{ width: 76 }}>维度</th>
                      <th>判定逻辑</th><th style={{ width: 172 }}>阈值</th><th style={{ width: 96 }}>处置动作</th>
                      <th style={{ width: 84 }} className="num">近 7 日命中</th><th style={{ width: 60 }}>启用</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rules.map((x) => (
                      <tr key={x.code} className={cls("clickable", x.code === sel && "selected")} onClick={() => { setSel(x.code); setPending(x.val); }}>
                        <td className="mono tiny">{x.code}</td>
                        <td><Tag tone="quiet">{x.dim}</Tag></td>
                        <td className="pretty">{x.logic}</td>
                        <td onClick={(e) => e.stopPropagation()}>
                          <div className="row" style={{ gap: 6 }}>
                            <span className="mono muted-3">{x.op}</span>
                            <input className="input mono" style={{ width: 74, height: 25 }} value={x.val}
                              onChange={(e) => setVal(x.code, e.target.value === "" ? "" : Number(e.target.value))} />
                            <span className="tiny muted-3">{x.unit}</span>
                          </div>
                        </td>
                        <td><Tag tone={x.action === "阻塞" ? "block" : x.action === "驳回" ? "danger" : "review"} dot>{x.action}</Tag></td>
                        <td className="num">
                          <span style={{ color: x.hit7 > 50 ? "var(--warn)" : "" }}>{x.hit7}</span>
                          <div className="tiny muted-3">{(x.rate7 * 100).toFixed(1)}%</div>
                        </td>
                        <td onClick={(e) => e.stopPropagation()}>
                          <Switch checked={x.on} onChange={() => toggle(x.code)} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div style={{ padding: 14 }}>
                  <div className="warnbox info" style={{ display: "flex", gap: 8 }}>
                    <Icon n="info" s={14} style={{ flex: "0 0 auto", marginTop: 1 }} />
                    <span>处置动作三选一：阻塞（不进生产队列）、驳回（生成重采任务）、转复核（进人工队列）。选择后系统展示该动作的下游影响链路。</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="wb-col scrollable" style={{ borderRight: 0 }}>
              <div className="wb-head"><span className="mono small">{r.code}</span><Tag tone={r.action === "驳回" ? "danger" : "review"} dot>{r.action}</Tag>
                <span className="grow" /><IconBtn n="more" title="更多" /></div>
              <div className="wb-body">
                <div style={{ padding: 14, display: "flex", flexDirection: "column", gap: 14 }}>
                  <DL rows={[["维度", r.dim], ["判定逻辑", r.logic], ["当前阈值", r.op + " " + r.val + " " + r.unit], ["处置动作", r.action], ["适用范围", "全部任务 · 真实与仿真数据"], ["绑定任务", "4 个"], ["最近修改", "09-10 质检员 · 78 → 80"]]} />

                  <div>
                    <div className="field-label" style={{ marginBottom: 7 }}>阈值影响预估（近 7 日）</div>
                    <div className="row" style={{ gap: 8, marginBottom: 10 }}>
                      <input className="input mono" value={pending} onChange={(e) => setPending(e.target.value === "" ? "" : Number(e.target.value))} style={{ width: 96 }} />
                      <span className="tiny muted-3">{r.unit}</span>
                      <span className="grow" />
                      <Btn size="sm" tone="ghost" onClick={() => setPending(r.val)}>还原</Btn>
                    </div>
                    <div className="grid g-3" style={{ gap: 8 }}>
                      <div className="panel-inset" style={{ padding: 10 }}>
                        <div className="tiny muted-3">当前命中</div>
                        <div className="mono" style={{ fontSize: 19, fontWeight: 600 }}>{r.hit7}</div>
                      </div>
                      <div className="panel-inset" style={{ padding: 10 }}>
                        <div className="tiny muted-3">调整后</div>
                        <div className="mono" style={{ fontSize: 19, fontWeight: 600, color: delta > 0 ? "var(--danger)" : delta < 0 ? "var(--ok)" : "var(--text)" }}>{hitAfter}</div>
                      </div>
                      <div className="panel-inset" style={{ padding: 10 }}>
                        <div className="tiny muted-3">变化</div>
                        <div className="mono" style={{ fontSize: 19, fontWeight: 600, color: delta > 0 ? "var(--danger)" : delta < 0 ? "var(--ok)" : "var(--text)" }}>
                          {delta > 0 ? "+" : ""}{delta}
                        </div>
                      </div>
                    </div>
                    <div style={{ marginTop: 10 }}>
                      <Hist data={D.RECIPE_PRESET.hist} labels={["0", "2", "4", "6", "8", "10", "12", "14", "16", "18", "20", "22"]} />
                      <div className="tiny muted-3" style={{ marginTop: 8, lineHeight: 1.65 }}>
                        预估基于近 7 日已入库数据的抽样重放。阈值调高 2 个单位将多驳回 {Math.max(0, delta)} 条，对应人时约 {(Math.max(0, delta) * 0.42).toFixed(1)} 小时。
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="spread" style={{ marginBottom: 7 }}>
                      <span className="field-label" style={{ margin: 0 }}>规则试运行</span>
                      <Tag tone="quiet">在历史数据上试跑，不写库</Tag>
                    </div>
                    {trial ? (
                      <div className="panel-inset" style={{ padding: 11 }}>
                        <div className="row" style={{ gap: 8, marginBottom: 8 }}>
                          <span className="skel" style={{ width: 12, height: 12, borderRadius: "50%" }} />
                          <span className="small">试运行中：重放 2026-09-07 至 09-14 共 11 284 条…</span>
                        </div>
                        <div className="bar"><i style={{ width: "78%" }} /></div>
                        <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 6 }}>
                          <div className="spread tiny"><span className="muted-3">命中样本</span><span className="mono">{hitAfter} 条</span></div>
                          <div className="spread tiny"><span className="muted-3">其中人工确认为合理驳回</span><span className="mono">{Math.round(hitAfter * 0.86)} 条</span></div>
                          <div className="spread tiny"><span className="muted-3">疑似误报</span><span className="mono" style={{ color: "var(--warn)" }}>{Math.round(hitAfter * 0.14)} 条</span></div>
                          <div className="spread tiny"><span className="muted-3">影响任务数</span><span className="mono">4 个</span></div>
                        </div>
                        <Btn size="sm" tone="ghost" icon="external" style={{ marginTop: 10, width: "100%" }}
                          onClick={() => toast.push({ tone: "info", title: "已打开命中样本", desc: "抽 20 条命中样本供人工确认合理性，全部可跳转到问题帧。" })}>查看命中样本</Btn>
                      </div>
                    ) : (
                      <Btn tone="ghost" icon="play" block onClick={() => setTrial(true)}>开始试运行</Btn>
                    )}
                  </div>

                  <div>
                    <div className="field-label" style={{ marginBottom: 7 }}>处置动作与下游影响</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      {[["阻塞", "数据不进入生产队列，元数据类与合规类适用", "block"], ["驳回", "生成重采任务并回到采集端，内容质量类适用", "danger"], ["转复核", "进入人工队列，边界情况适用", "review"]].map((a) => (
                        <button key={a[0]} className={cls("rc-item", r.action === a[0] && "on")}
                          onClick={() => toast.push({ tone: "info", title: "已切换处置动作", desc: "该动作将影响 " + r.hit7 + " 条/周的下游流转路径。" })}>
                          <Tag tone={a[2]} dot>{a[0]}</Tag>
                          <span className="grow small muted pretty">{a[1]}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="dangerzone">
                    <div className="panel-head"><span className="panel-title">生效与回滚</span></div>
                    <div style={{ padding: 14, display: "flex", flexDirection: "column", gap: 8 }}>
                      <Btn tone="primary" block icon="check"
                        onClick={() => toast.push({ tone: "warn", title: "阈值已变更", desc: "QC-MOT-01 由 " + r.val + " 变为 " + pending + "，影响 " + hitAfter + " 条/周。变更已记入审计日志，可 10 秒内撤销。", action: { label: "撤销", fn: () => { setPending(r.val); } } })}>
                        确认变更并生效
                      </Btn>
                      <div className="tiny muted-3" style={{ lineHeight: 1.65 }}>
                        危险操作确认要求：修改质检阈值属全局生效操作，须先看影响预估与试运行结果，变更后保留撤销入口不少于 10 秒。
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {creating ? (
          <Modal
            title="新建质检规则"
            width={580}
            desc="新建规则默认以「试运行」接入：先统计命中，不参与实际驳回，确认影响面后再切换为生效。"
            onClose={() => setCreating(false)}
            foot={<>
              <Btn tone="ghost" onClick={() => setCreating(false)}>取消</Btn>
              <span className="grow" />
              <Btn tone="primary" icon="check" onClick={submitNew}>创建并置为启用</Btn>
            </>}
          >
            <Field label="规则编号" req hint="留空则自动按 QC-NEW-NN 生成；编号必须全库唯一。">
              <input className="input mono" placeholder="如 QC-VIB-01" value={nr.code}
                onChange={(e) => setNr(Object.assign({}, nr, { code: e.target.value }))} />
            </Field>
            <div className="grid g-2">
              <Field label="维度" req>
                <select className="select" value={nr.dim} onChange={(e) => setNr(Object.assign({}, nr, { dim: e.target.value }))}>
                  {DIMS.map((d) => <option key={d}>{d}</option>)}
                </select>
              </Field>
              <Field label="处置动作" req hint="阻塞 / 驳回 / 转复核三选一">
                <select className="select" value={nr.action} onChange={(e) => setNr(Object.assign({}, nr, { action: e.target.value }))}>
                  {["驳回", "阻塞", "转复核"].map((a) => <option key={a}>{a}</option>)}
                </select>
              </Field>
            </div>
            <Field label="判定逻辑" req hint="写清可被直接实现的量，例如「静止段占比」「力矩异常值占比」。">
              <input className="input" placeholder="如 振动幅度峰值" value={nr.logic}
                onChange={(e) => setNr(Object.assign({}, nr, { logic: e.target.value }))} />
            </Field>
            <div className="row" style={{ alignItems: "flex-end", gap: 10 }}>
              <Field label="比较符" className="grow">
                <select className="select" value={nr.op} onChange={(e) => setNr(Object.assign({}, nr, { op: e.target.value }))}>
                  {[">", "<", "=", "≠"].map((o) => <option key={o}>{o}</option>)}
                </select>
              </Field>
              <Field label="阈值" req className="grow">
                <input className="input mono" placeholder="如 12" value={nr.val}
                  onChange={(e) => setNr(Object.assign({}, nr, { val: e.target.value }))} />
              </Field>
              <Field label="单位" className="grow">
                <select className="select" value={nr.unit} onChange={(e) => setNr(Object.assign({}, nr, { unit: e.target.value }))}>
                  {UNITS.map((u) => <option key={u}>{u}</option>)}
                </select>
              </Field>
            </div>
            <div className="warnbox info">
              新建规则不会立即参与驳回：系统先按试运行统计近 7 日命中与疑似误报，确认影响面后再切换为生效，避免一次配置改动导致大批数据被误驳。
            </div>
          </Modal>
        ) : null}
      </>
    );
  }

  /* ============================================================
     标注工作台（源：7.5 / 8.6）
     ============================================================ */
  function AnnoWorkbench({ app, set, reviewMode }) {
    const toast = window.UI.useToast();
    const [clip, setClip] = useState(D.ANNO_CLIPS[0].id);
    const [t, setT] = useTicker(372, false);
    const [playing, setPlaying] = useState(false);
    const [main, setMain] = useState("exo");
    const [ov, setOv] = useState(["box"]);
    const [tracks, setTracks] = useState(() => JSON.parse(JSON.stringify(D.ANNO_TRACKS)));
    const [folded, setFolded] = useState(["contact"]);
    const [sel, setSel] = useState(null);
    const [notesOpen, setNotesOpen] = useState(true);
    const [dual, setDual] = useState(true);

    const c = D.ANNO_CLIPS.filter((x) => x.id === clip)[0] || D.ANNO_CLIPS[0];
    const seg = sel ? tracks.filter((x) => x.id === sel.track)[0].segs[sel.i] : null;

    const nudge = (field, d) => {
      if (!sel) return;
      setTracks((ts) => ts.map((tr) => tr.id !== sel.track ? tr : Object.assign({}, tr, {
        segs: tr.segs.map((s, i) => i !== sel.i ? s : Object.assign({}, s, { [field]: Math.max(0, Math.min(1, s[field] + d)) })),
      })));
    };
    const activeNote = D.ANNO_NOTES.filter((n) => Math.abs(n.t - t) < 0.035);

    return (
      <>
        <PageHead
          crumbs={[{ label: "标注", to: () => set({ page: "annotasks" }) }, { label: reviewMode ? "标注质检" : "标注工作台" }]}
          title={reviewMode ? "标注质检 · 复核与逐帧批注" : "标注工作台"}
          desc={reviewMode
            ? "复核标注结果、处理分歧、必要时仲裁。批注落在帧上而非句子上——第 128 帧手部被遮挡，比「整体质量不佳」对标注员有用得多。"
            : "支撑 VLA 类数据的长视频、多轨、跨模态标注，而不是把图片标注器套用在具身数据上。AI 预标注以候选而非结论呈现。"}
          meta={
            <>
              <Tag tone="quiet" icon="cube">CLA-KITCH-FOLD-v4（规范版本已与任务绑定）</Tag>
              <Tag tone="accent" icon="cpu">AI 预标注已完成 · 平均置信度 0.71</Tag>
              <Tag tone="ok" icon="check">预标注采纳率 91%</Tag>
              <Tag tone="warn" dot>待复核低置信区域 {c.pending} 处</Tag>
              <Tag tone="quiet" icon="clock">自动保存于 12:41</Tag>
            </>
          }
          actions={<>
            <Btn icon="message" tone="ghost" onClick={() => setNotesOpen(!notesOpen)}>批注 {D.ANNO_NOTES.length}</Btn>
            <Btn icon="route" tone="ghost" onClick={() => toast.push({ tone: "warn", title: "已转入仲裁队列", desc: "两人标注分歧超阈（一致率 71.4% < 85%），已高亮分歧帧并指派标注质检员裁定。" })}>提交仲裁</Btn>
            <Btn icon="send" tone="primary" onClick={() => toast.push({ tone: "ok", title: "已提交", desc: "提交后不可编辑，仅可查看。已进入标注质检队列。" })}>提交任务</Btn>
          </>}
        />
        <div className="pagebody flush">
          <div className="wb" style={{ gridTemplateColumns: "248px minmax(0,1fr) 348px", height: "100%" }}>
            {/* 左：Clip 列表 */}
            <div className="wb-col">
              <div className="wb-head"><span className="small" style={{ fontWeight: 600 }}>任务与进度</span><span className="grow" />
                <Tag tone="quiet">4 / 12</Tag></div>
              <div className="wb-body">
                {D.ANNO_CLIPS.map((x) => (
                  <button key={x.id} className={cls("listitem", x.id === clip && "active")} onClick={() => { setClip(x.id); setSel(null); }}>
                    <div className="spread">
                      <span className="mono small">{x.id}</span>
                      <Tag tone={x.state === "已提交" ? "ok" : x.state === "标注中" ? "accent" : x.state === "待复核" ? "warn" : "quiet"} dot>{x.state}</Tag>
                    </div>
                    <div className="tiny muted-3 ellip" style={{ marginTop: 4 }}>{x.name}</div>
                    <div style={{ marginTop: 7 }}>
                      <ConfBand conf={x.conf} />
                      <div className="spread tiny muted-3" style={{ marginTop: 4 }}>
                        <span>置信度分布</span>
                        <span>{x.pending ? "待复核 " + x.pending + " 处" : "无需复核"}</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
              <div className="wb-foot" style={{ padding: 12 }}>
                <div className="warnbox info" style={{ fontSize: 11, lineHeight: 1.6 }}>
                  未提交任务可断点续标。长时间未提交时保留草稿，下次进入自动恢复到断点。
                </div>
              </div>
            </div>

            {/* 中：画布 */}
            <div className="wb-col">
              <div className="wb-head">
                <span className="mono small">{clip}</span>
                <span className="grow" />
                <button className="btn btn-sm" aria-pressed={dual} style={dual ? { background: "var(--surface-3)" } : null}
                  onClick={() => setDual(!dual)}>双视图联动</button>
                <Btn size="sm" tone="ghost" icon="target" onClick={() => setT(0.31)}>跳到低置信段</Btn>
              </div>
              <div className="wb-body" style={{ background: "var(--surface-inset)" }}>
                <MultiView views={dual ? [VIEWS[0], VIEWS[4]] : [VIEWS[0]]} t={t} count={dual ? 2 : 1} main={main} onMain={setMain} overlays={ov} tileH={dual ? 330 : 420} />
                {activeNote.length ? (
                  <div style={{ padding: "0 0 10px" }}>
                    {activeNote.map((n, i) => (
                      <div key={i} className="panel" style={{ margin: "0 0 6px", background: "var(--warn-dim)", borderColor: "color-mix(in srgb, var(--warn) 34%, transparent)" }}>
                        <div style={{ padding: "9px 12px", display: "flex", gap: 9 }}>
                          <Icon n="message" s={14} style={{ color: "var(--warn)", flex: "0 0 auto", marginTop: 1 }} />
                          <div>
                            <div className="row" style={{ gap: 8 }}>
                              <span className="small" style={{ fontWeight: 600, color: "var(--warn)" }}>第 {n.frame} 帧 · {n.who}（{n.role}）</span>
                            </div>
                            <div className="small pretty" style={{ marginTop: 4 }}>{n.text}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
              <div className="wb-foot">
                <Transport t={t} playing={playing} duration={372}
                  onToggle={() => setPlaying(!playing)} onSeek={setT}
                  onStep={(d) => setT((v) => Math.max(0, Math.min(1, v + d)))}
                  views={VIEWS} main={main} onMain={setMain}
                  extra={<Btn size="sm" tone="ghost" icon="layers" onClick={() => setOv(ov.length ? [] : ["box", "hand", "contact"])}>叠加层</Btn>} />
                <Timeline t={t} onSeek={setT} duration={372} tracks={tracks} folded={folded}
                  onFold={(id) => setFolded(folded.indexOf(id) >= 0 ? folded.filter((x) => x !== id) : folded.concat([id]))}
                  selected={sel} onSelect={setSel} notes={notesOpen ? D.ANNO_NOTES : null} />
              </div>
            </div>

            {/* 右：标签与检查器 */}
            <div className="wb-col scrollable" style={{ borderRight: 0 }}>
              <div className="wb-head"><span className="small" style={{ fontWeight: 600 }}>轨道与检查器</span><span className="grow" />
                <IconBtn n="plus" title="新建轨道" onClick={() => {
                  const id = "track" + (tracks.length + 1);
                  const color = ["var(--domain-b)", "var(--ok)", "var(--domain-f)"][tracks.length % 3];
                  setTracks((ts) => ts.concat([{ id: id, name: "新轨道 " + (ts.length + 1), color: color, segs: [] }]));
                  toast.push({ tone: "ok", title: "已新建轨道", desc: "新轨道已加入时间线，可在画面上拉框创建第一个片段，或在检查器里按帧输入起止。" });
                }} /></div>
              <div className="wb-body">
                <div style={{ padding: 14, display: "flex", flexDirection: "column", gap: 14 }}>
                  <div>
                    <div className="field-label" style={{ marginBottom: 7 }}>轨道（可折叠以保持长视频可读）</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                      {tracks.map((tr) => (
                        <div key={tr.id} className="spread" style={{ padding: "6px 9px", border: "1px solid var(--line-soft)", borderRadius: 4, background: "var(--surface-1)" }}>
                          <span className="row" style={{ gap: 8 }}>
                            <i style={{ width: 7, height: 7, borderRadius: 2, background: tr.color }} />
                            <span className="small">{tr.name}</span>
                            <span className="tiny muted-3">{tr.segs.length} 段</span>
                          </span>
                          <Switch checked={folded.indexOf(tr.id) < 0} onChange={() => setFolded(folded.indexOf(tr.id) >= 0 ? folded.filter((x) => x !== tr.id) : folded.concat([tr.id]))} />
                        </div>
                      ))}
                    </div>
                  </div>

                  {seg ? (
                    <div>
                      <div className="field-label" style={{ marginBottom: 7 }}>选中段 · {tracks.filter((x) => x.id === sel.track)[0].name}</div>
                      <div className="panel-inset" style={{ padding: 12 }}>
                        <div className="row" style={{ gap: 8, marginBottom: 9 }}>
                          <input className="input" value={seg.label} readOnly style={{ height: 27 }} />
                          <IconBtn n="edit" title="重命名" />
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                          {[["起点", "s"], ["终点", "e"]].map(([lab, f]) => (
                            <div key={f} className="spread">
                              <span className="small muted-3">{lab}</span>
                              <span className="row" style={{ gap: 5 }}>
                                <Btn size="sm" tone="ghost" onClick={() => nudge(f, -0.008)}>◂</Btn>
                                <span className="mono small" style={{ minWidth: 62, textAlign: "center" }}>{fmtTime(seg[f] * 372)}</span>
                                <Btn size="sm" tone="ghost" onClick={() => nudge(f, 0.008)}>▸</Btn>
                              </span>
                            </div>
                          ))}
                        </div>
                        <div className="hr" style={{ margin: "11px 0" }} />
                        <div className="spread">
                          <span className="small muted-3">吸附关键帧</span>
                          <Switch checked onChange={() => toast.push({ tone: "info", title: "边界已吸附", desc: "分段边界自动吸附到最近的关键帧。" })} />
                        </div>
                        <div className="spread" style={{ marginTop: 9 }}>
                          <span className="small muted-3">校验子段时长关系</span>
                          <Tag tone="ok" icon="check">通过</Tag>
                        </div>
                        <div style={{ marginTop: 10, display: "flex", gap: 6 }}>
                          <Btn size="sm" tone="ghost" style={{ flex: 1 }} icon="copy" onClick={() => toast.push({ tone: "ok", title: "已复制段", desc: "已复制该段的起止与标签。" })}>复制段</Btn>
                          <Btn size="sm" tone="danger" style={{ flex: 1 }} icon="trash" onClick={() => { setTracks((ts) => ts.map((tr) => tr.id !== sel.track ? tr : Object.assign({}, tr, { segs: tr.segs.filter((_, i) => i !== sel.i) }))); setSel(null); }}>删除段</Btn>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="panel-inset" style={{ padding: 12 }}>
                      <div className="small muted">在时间轴上点选任意色段以编辑其边界、标签与属性。</div>
                    </div>
                  )}

                  <div>
                    <div className="spread" style={{ marginBottom: 7 }}>
                      <span className="field-label" style={{ margin: 0 }}>待复核项</span>
                      <Tag tone="warn" dot>{c.pending} 处</Tag>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                      {D.ANNO_TRACKS[0].segs.filter((s) => s.low).map((s, i) => (
                        <button key={i} className="listitem" style={{ border: "1px solid var(--line-soft)", borderRadius: 4, padding: "8px 10px" }} onClick={() => setT(s.s)}>
                          <div className="spread">
                            <span className="small">{s.label}</span>
                            <Tag tone="danger" dot>置信度 {Math.round(s.conf * 100)}%</Tag>
                          </div>
                          <div className="tiny muted-3" style={{ marginTop: 3 }}>{fmtTime(s.s * 372)} – {fmtTime(s.e * 372)} · 点击跳转</div>
                        </button>
                      ))}
                      <div className="tiny muted-3" style={{ lineHeight: 1.65 }}>
                        置信度引导复核顺序：低置信区域自动排在队列前面，把人的注意力花在最可能出错的地方。
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="spread" style={{ marginBottom: 7 }}>
                      <span className="field-label" style={{ margin: 0 }}>主动学习 · 难例回流</span>
                      <Tag tone="warn" dot>{D.AL_QUEUE.length} 条优先</Tag>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                      {D.AL_QUEUE.map((a) => (
                        <button key={a.id} className={cls("listitem", a.id === clip && "active")}
                          style={{ border: "1px solid var(--line-soft)", borderRadius: 4, padding: "8px 10px" }}
                          onClick={() => { setClip(a.id); setSel(null); }}>
                          <div className="spread">
                            <span className="mono small">{a.id}</span>
                            <Tag tone={a.why === "训练回传" ? "accent" : a.why === "机审分歧" ? "warn" : "danger"} dot>{a.why}</Tag>
                          </div>
                          <div className="tiny muted-3" style={{ marginTop: 4, lineHeight: 1.55 }}>{a.from}</div>
                          <div className="tiny muted-3 mono" style={{ marginTop: 3 }}>模型置信度 {Math.round(a.conf * 100)}% · {a.task}</div>
                        </button>
                      ))}
                    </div>
                    <div className="tiny muted-3" style={{ marginTop: 8, lineHeight: 1.65 }}>
                      队列按模型不确定度排序而非提交时间：低置信样本、机审与人工分歧样本、训练侧失败回传样本优先。标完这批难例，模型最薄弱的区域会被直接补齐，而不是继续在已经学会的样本上重复劳动。
                    </div>
                  </div>

                  <div>
                    <div className="field-label" style={{ marginBottom: 7 }}>质检批注（锚定在帧上）</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      {D.ANNO_NOTES.map((n, i) => (
                        <div key={i} className="panel-inset" style={{ padding: 10, cursor: "pointer", borderLeft: "3px solid var(--" + n.kind + ")" }} onClick={() => setT(n.t)}>
                          <div className="spread">
                            <span className="small" style={{ fontWeight: 600 }}>第 {n.frame} 帧 · {n.who}</span>
                            <Icon n="arrowRight" s={12} style={{ color: "var(--accent)" }} />
                          </div>
                          <div className="tiny muted" style={{ marginTop: 4, lineHeight: 1.65 }}>{n.text}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="warnbox info">
                    规范版本与任务绑定：提交后规范更新不影响已提交结果；未提交任务可选择按新规范重标，避免标到一半规范变了造成的口径混乱。
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  /* ============================================================
     数据集配方编辑器（源：7.6 / 8.7）
     ============================================================ */
  function RecipeEditor({ app, set }) {
    const toast = window.UI.useToast();
    const P = D.RECIPE_PRESET;
    const [nl, setNl] = useState(app.payload && app.payload.fromBasket ? "使用选择篮中的 " + app.payload.ids.length + " 条数据，质量分 70 以上" : P.nl);
    const [conds, setConds] = useState(P.conds);
    const [pipe, setPipe] = useState(P.pipe);
    const [dragI, setDragI] = useState(null);
    const [overI, setOverI] = useState(null);
    const [warn, setWarn] = useState(true);
    const [built, setBuilt] = useState(false);
    const [relax, setRelax] = useState(false);
    const [pub, setPub] = useState(false);

    const hit = relax ? 341 : P.hit;
    const hours = relax ? 0.61 : P.hours;
    const embody = relax ? P.embody.map((x) => Object.assign({}, x, { v: Math.round(x.v * 1.15) })) : P.embody;
    const quality = relax ? P.quality.map((x) => Object.assign({}, x, { v: Math.round(x.v * 1.15) })) : P.quality;

    const onDrop = (i) => {
      if (dragI === null || dragI === i) return;
      const arr = pipe.slice();
      const [m] = arr.splice(dragI, 1);
      arr.splice(i, 0, m);
      setPipe(arr); setDragI(null); setOverI(null);
    };

    return (
      <>
        <PageHead
          crumbs={[{ label: "数据集", to: () => set({ page: "recipes" }) }, { label: "配方编辑器" }]}
          title="数据集配方编辑器"
          desc="把「我要哪一批数据」从口头沟通变成可保存、可复用、可复现的结构化定义。条件构建器与预览区同屏且联动——条件与结果是因果关系，任何让用户来回切换页面的设计都会破坏边调边看的核心体验。"
          meta={
            <>
              <Tag tone="quiet" icon="file">配方 RCP-KITCH-FOLD-NEG-v2</Tag>
              <Tag tone="accent" icon="cpu">自然语言已解析为 {conds.length} 个条件组</Tag>
              {app.payload && app.payload.fromBasket ? <Tag tone="ok" icon="basket">源自选择篮 {app.payload.ids.length} 条</Tag> : null}
            </>
          }
          actions={<>
            <Btn icon="copy" tone="ghost" onClick={() => toast.push({ tone: "ok", title: "配方已复制", desc: "同类客户的第二次交付，复制配方改条件即可，把重复劳动降到最低。" })}>复制配方</Btn>
            <Btn icon="bookmark" tone="ghost" onClick={() => toast.push({ tone: "ok", title: "已保存到配方库", desc: "配方 RCP-KITCH-FOLD-NEG-v2 已保存。" })}>保存配方</Btn>
            <Btn icon="play" tone="primary" onClick={() => { setBuilt(true); toast.push({ tone: "info", title: "已提交构建", desc: "构建转为异步任务，队列位置 2，预计 4 分 20 秒完成。超过 30 秒将移出页面并转入通知中心。" }); }}>提交构建</Btn>
          </>}
        />
        <div className="pagebody flush">
          <div className="wb" style={{ gridTemplateColumns: "330px minmax(0,1fr) 316px", height: "100%" }}>
            {/* 左：条件构建器 */}
            <div className="wb-col scrollable">
              <div className="wb-head"><span className="small" style={{ fontWeight: 600 }}>条件构建器</span><span className="grow" />
                <Tag tone="quiet">双通道</Tag></div>
              <div className="wb-body">
                <div style={{ padding: 14, display: "flex", flexDirection: "column", gap: 13 }}>
                  <Field label="自然语言输入" hint="翻译结果可见可改，不是黑箱">
                    <textarea className="textarea" rows={4} value={nl} onChange={(e) => setNl(e.target.value)} />
                  </Field>
                  <Btn tone="primary" icon="cpu" block
                    onClick={() => toast.push({ tone: "ok", title: "已解析", desc: "解析出 " + conds.length + " 个条件组，置信度 0.91。结果以可编辑标签呈现，可逐项微调。" })}>解析为结构化条件</Btn>

                  <div>
                    <div className="spread" style={{ marginBottom: 7 }}>
                      <span className="field-label" style={{ margin: 0 }}>条件组</span>
                      <Btn size="sm" tone="ghost" icon="plus" onClick={() => setConds(conds.concat([{ k: "光照条件", op: "等于", v: "正常室内", n: 291 }]))}>加条件</Btn>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      {conds.map((c, i) => (
                        <div key={i} className="panel-inset" style={{ padding: "8px 10px", display: "flex", alignItems: "center", gap: 8 }}>
                          <span className="tiny muted-3" style={{ width: 46, flex: "0 0 auto" }}>{c.k}</span>
                          <span className="tiny muted-3">{c.op}</span>
                          <span className="small grow ellip">{c.v}</span>
                          <span className="tiny muted-3 mono nowrap">{c.n}</span>
                          <IconBtn n="x" s={11} title="移除" onClick={() => setConds(conds.filter((_, k) => k !== i))} />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="spread" style={{ marginBottom: 7 }}>
                      <span className="field-label" style={{ margin: 0 }}>模型建议条件</span>
                      <Tag tone="quiet" icon="cpu">覆盖度分析</Tag>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      {[
                        { k: "光照条件", v: "包含 320–460 lux", why: "照度集中，暗光场景为覆盖缺口" },
                        { k: "物体材质", v: "包含 混纺", why: "棉与涤纶占 86%，混纺仅 14%" },
                        { k: "失败类型", v: "包含 滑移", why: "滑移仅 8 条，是最稀少的长尾" },
                      ].map((s) => (
                        <button key={s.k} className="panel-inset"
                          style={{ padding: "8px 10px", textAlign: "left", cursor: "pointer", display: "flex", gap: 8, alignItems: "flex-start" }}
                          onClick={() => {
                            if (!conds.some((x) => x.k === s.k && x.v === s.v)) setConds(conds.concat([{ k: s.k, op: "包含", v: s.v, n: 0 }]));
                            toast.push({ tone: "ok", title: "已加入条件", desc: s.k + " · " + s.v + "。建议基于覆盖度与长尾分析，采纳与否由人决定。" });
                          }}>
                          <Icon n="plus" s={12} style={{ color: "var(--accent)", flex: "0 0 auto", marginTop: 2 }} />
                          <span className="grow">
                            <span className="small" style={{ fontWeight: 600 }}>{s.k}</span>
                            <span className="small muted"> · {s.v}</span>
                            <span className="tiny muted-3" style={{ display: "block", marginTop: 2, lineHeight: 1.55 }}>{s.why}</span>
                          </span>
                        </button>
                      ))}
                    </div>
                    <div className="tiny muted-3" style={{ marginTop: 8, lineHeight: 1.65 }}>
                      模型先指出当前结果缺什么，再由人决定补不补。缺口的补法有两种：在已采数据里换条件，或直接转成新的采集需求。
                    </div>
                  </div>

                  <div className="warnbox" style={{ display: "flex", gap: 8 }}>
                    <Icon n="warn" s={14} style={{ flex: "0 0 auto", marginTop: 1 }} />
                    <span>
                      建集前置校验给警告而非阻塞：当前「结果」仅含失败样本，缺少成功对照，若用于监督训练可能引入结果偏置。
                      {warn ? <Btn size="sm" tone="ghost" style={{ marginTop: 8 }} onClick={() => setWarn(false)}>我已知晓，继续</Btn> : <span className="tiny" style={{ display: "block", marginTop: 5 }}>已留痕。</span>}
                    </span>
                  </div>

                  <div>
                    <div className="field-label" style={{ marginBottom: 7 }}>命中规模实时预估</div>
                    <div className="tiny muted-3" style={{ lineHeight: 1.65 }}>
                      靠抽样与索引加速，避免每改一个条件就等一次全量扫描。当前基于 30% 分层抽样外推，误差 ±2.1%。
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 中：结果预览 */}
            <div className="wb-col scrollable">
              <div className="wb-head"><span className="small" style={{ fontWeight: 600 }}>结果预览</span>
                <span className="grow" />
                <Btn size="sm" tone="ghost" icon="refresh" onClick={() => toast.push({ tone: "info", title: "已刷新预估", desc: "重跑抽样外推，耗时 0.8 秒。" })}>重算</Btn>
              </div>
              <div className="wb-body">
                <div style={{ padding: 14, display: "flex", flexDirection: "column", gap: 14 }}>
                  <div className="grid g-4" style={{ gap: 10 }}>
                    {[["命中条数", hit, "条"], ["总时长", hours, "小时"], ["平均时长", (hours * 3600 / hit).toFixed(1), "秒"], ["本体种类", 4, "类"]].map((m) => (
                      <div key={m[0]} className="panel-inset" style={{ padding: 11 }}>
                        <div className="tiny muted-3">{m[0]}</div>
                        <div className="mono" style={{ fontSize: 21, fontWeight: 600, lineHeight: 1.25 }}>{m[1]}<span className="tiny muted-3" style={{ marginLeft: 3 }}>{m[2]}</span></div>
                      </div>
                    ))}
                  </div>

                  <div className="grid g-2" style={{ gap: 14 }}>
                    <Panel title="本体分布" flush>
                      <div style={{ padding: 12 }}>
                        {embody.map((b) => (
                          <div key={b.k} style={{ marginBottom: 9 }}>
                            <div className="spread tiny" style={{ marginBottom: 4 }}>
                              <span className="muted">{b.k}</span><span className="mono">{b.v} 条 · {Math.round(b.v / embody.reduce((s, x) => s + x.v, 0) * 100)}%</span>
                            </div>
                            <div className="bar"><i style={{ width: b.v / embody[0].v * 100 + "%" }} /></div>
                          </div>
                        ))}
                      </div>
                    </Panel>
                    <Panel title="质量分层" flush>
                      <div style={{ padding: 12 }}>
                        {quality.map((b, i) => (
                          <div key={b.k} style={{ marginBottom: 9 }}>
                            <div className="spread tiny" style={{ marginBottom: 4 }}>
                              <span className="muted">{b.k}</span><span className="mono">{b.v} 条</span>
                            </div>
                            <div className="bar"><i style={{ width: b.v / quality[1].v * 100 + "%", background: i === 0 ? "var(--ok)" : i === 1 ? "var(--warn)" : "var(--danger)" }} /></div>
                          </div>
                        ))}
                        <div className="tiny muted-3" style={{ lineHeight: 1.6 }}>
                          边缘难例占比 47%，可用于难例挖掘与主动采集取用。
                        </div>
                      </div>
                    </Panel>
                  </div>

                  <Panel title="时长分布" sub="抽样外推 · 秒" flush>
                    <div style={{ padding: 12 }}>
                      <Hist data={P.hist} labels={["4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15"]} />
                    </div>
                  </Panel>

                  <div className="spread">
                    <span className="small muted-3">抽样查看前 6 条（不点开也能筛掉大半）</span>
                    <Btn size="sm" tone="ghost" icon="external" onClick={() => set({ page: "browser", payload: { id: "CLP-81204" } })}>打开数据浏览器</Btn>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 9 }}>
                    {D.SEARCH_HITS.slice(0, 6).map((h) => (
                      <div key={h.id} className="panel" style={{ overflow: "hidden" }}>
                        <div className="player" style={{ height: 82, borderRadius: 0 }}>
                          <SceneFrame view={h.emb === "Ego" ? "ego" : "exo"} t={(h.score % 50) / 100 + 0.25} />
                        </div>
                        <div style={{ padding: "7px 9px" }}>
                          <div className="mono tiny">{h.id}</div>
                          <div className="spread" style={{ marginTop: 3 }}>
                            <span className="tiny muted-3">{h.dur}</span>
                            <span className={cls("tag", h.score >= 85 ? "t-ok" : "t-warn")} style={{ height: 17 }}>{h.score}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
                    <Btn size="sm" tone="ghost" onClick={() => setRelax(!relax)}>{relax ? "撤销放宽" : "放宽条件看看"}</Btn>
                    <Btn size="sm" tone="ghost" icon="refresh"
                      onClick={() => toast.push({ tone: "info", title: "已生成主动采集需求", desc: "命中的长尾缺口（暗光 / 混纺 / 滑移）已转为采集需求，回填至任务列表的「补采」队列。" })}>长尾缺口转补采</Btn>
                    <span className="tiny muted-3">{relax ? "已放宽质量分下限至 60，命中 +44 条" : "结果 297 条偏少时，可一键放宽并给出建议"}</span>
                  </div>

                  {built ? (
                    <Panel title="构建任务" sub="异步执行，超出 30 秒移出页面并转入通知中心" flush>
                      <div style={{ padding: 14, display: "flex", flexDirection: "column", gap: 10 }}>
                        <div className="spread">
                          <span className="row" style={{ gap: 8 }}>
                            <span className="skel" style={{ width: 12, height: 12, borderRadius: "50%" }} />
                            <span className="small">队列位置 2 · 正在执行「格式转换」步骤</span>
                          </span>
                          <span className="tiny muted-3 mono">预计 4 分 20 秒</span>
                        </div>
                        <div className="bar"><i style={{ width: "34%" }} /></div>
                        <div className="tiny muted-3" style={{ lineHeight: 1.65 }}>
                          构建失败时保留已完成分片并给出失败原因，支持断点续跑而不从头开始。目标格式不支持某模态时会列出不支持项与替代方案。
                        </div>
                      </div>
                    </Panel>
                  ) : null}
                </div>
              </div>
            </div>

            {/* 右：处理流水线 */}
            <div className="wb-col scrollable" style={{ borderRight: 0 }}>
              <div className="wb-head"><span className="small" style={{ fontWeight: 600 }}>处理流水线</span><span className="grow" />
                <span className="tiny muted-3">拖拽排序</span></div>
              <div className="wb-body">
                <div style={{ padding: 14, display: "flex", flexDirection: "column", gap: 12 }}>
                  <div className="pipe">
                    {pipe.map((s, i) => (
                      <div key={s.k}
                        className={cls("pipe-step", dragI === i && "dragging", overI === i && "over")}
                        draggable
                        onDragStart={() => setDragI(i)}
                        onDragOver={(e) => { e.preventDefault(); setOverI(i); }}
                        onDragLeave={() => setOverI(null)}
                        onDrop={() => onDrop(i)}
                        onDragEnd={() => { setDragI(null); setOverI(null); }}>
                        <Icon n="list" s={13} className="pipe-grip" />
                        <span className="pipe-idx">{i + 1}</span>
                        <span className="grow">
                          <span className="small" style={{ fontWeight: 600 }}>{s.k}</span>
                          <span className="tiny muted-3" style={{ display: "block", marginTop: 2, lineHeight: 1.6 }}>{s.v}</span>
                        </span>
                        <IconBtn n="settings" s={12} title="配置参数" onClick={() => toast.push({ tone: "info", title: s.k + " · 参数", desc: s.v })} />
                      </div>
                    ))}
                  </div>
                  <Btn tone="ghost" icon="plus" block size="sm">添加处理步骤</Btn>

                  <div className="hr" />

                  <Field label="版本号" hint="发布即冻结">
                    <input className="input mono" defaultValue="v3" />
                  </Field>
                  <Field label="变更日志">
                    <textarea className="textarea" rows={3} defaultValue={"- 新增条件：结果 = 失败\n- 调整分层划分：按场景分层，8 : 1 : 1\n- 新增泄露检测步骤"} />
                  </Field>
                  <Switch checked label="生成分片与索引文件" onChange={() => {}} />
                  <Switch checked label="交付前嵌入来源指纹" onChange={() => {}} />

                  <div className="warnbox info">
                    快照不可变：发布即冻结，训练侧只读引用。后续数据变化不影响已发布版本，需要更新则发新版本。
                  </div>

                  <Btn tone="primary" size="lg" block icon="bookmark" onClick={() => setPub(true)}>发布快照</Btn>
                </div>
              </div>
            </div>
          </div>
        </div>

        {pub ? (
          <Modal
            title="发布快照 · 二次确认"
            desc="发布后该版本成为训练侧引用来源，不可原地修改。"
            onClose={() => setPub(false)}
            width={560}
            foot={<>
              <Btn tone="ghost" onClick={() => setPub(false)}>取消</Btn>
              <Btn tone="primary" icon="check" onClick={() => { setPub(false); toast.push({ tone: "ok", title: "快照已发布", desc: "DS-KITCH-FOLD-v3 · 297 条 · 内容指纹 sha256:4f2a…c81e。变更日志与 Data Card 已一并生成。" }); }}>确认发布</Btn>
            </>}
          >
            <DL rows={[["版本号", "DS-KITCH-FOLD-v3"], ["条数 / 时长", "297 条 / 0.52 小时"], ["处理步骤", pipe.length + " 步"], ["分层划分", "按场景分层，训练 / 验证 / 测试 = 8 : 1 : 1"], ["泄露检测", "阻断同场景跨集重叠 · 当前 0 处"], ["预计体积", "412 GB（含分片与索引）"], ["替代关系", "替代 DS-KITCH-FOLD-v2"]]} />
            <div className="warnbox">发布操作在训练侧立即生效。若发现数据问题，不允许原地修改，需发新版本并标注替代关系。</div>
          </Modal>
        ) : null}
      </>
    );
  }

  /* ============================================================
     其余平台页：配方库 / 快照 / 交付 / 标注任务 / 仿真 / 看板 / 安全 / 配置
     ============================================================ */
  function Snapshots({ set }) {
    const toast = window.UI.useToast();
    return (
      <>
        <PageHead crumbs={[{ label: "数据集" }, { label: "快照与版本" }]} title="快照与版本"
          desc="每次加工产生新版本，历史版本不可变。由原始记录到数据集快照的完整链路可追溯，改判或删除时可列出受影响的数据集。"
          meta={<><Tag tone="ok" dot>已发布 4</Tag><Tag tone="warn" dot>待发布 1（泄露阻断）</Tag><Tag tone="quiet">共 14 个版本</Tag></>}
          actions={<Btn icon="branch" tone="ghost" onClick={() => toast.push({ tone: "info", title: "影响面分析", desc: "选择任意数据单元即可列出受影响的数据集快照与训练侧引用点。" })}>影响面分析</Btn>} />
        <div className="pagebody">
          <div className="panel" style={{ overflow: "hidden" }}>
            <table className="table">
              <thead><tr><th>数据集快照</th><th>来源任务</th><th className="num">条数</th><th className="num">时长</th><th>内容指纹</th><th>发布</th><th>状态</th><th>训练侧引用</th></tr></thead>
              <tbody>
                {D.SNAPSHOTS.map((s) => (
                  <tr key={s.id} className="clickable" onClick={() => set({ page: "delivery" })}>
                    <td><div style={{ fontWeight: 600 }}>{s.id}</div><div className="tiny muted-3 mono">{s.date} · {s.by}</div></td>
                    <td className="mono small">{s.task}</td>
                    <td className="num">{s.n}</td>
                    <td className="num">{s.hours}h</td>
                    <td className="mono tiny muted">{s.fp}</td>
                    <td>
                      <Tag tone={s.state === "已发布" ? "ok" : s.state === "待发布" ? "warn" : "quiet"} dot>{s.state}</Tag>
                    </td>
                    <td className="tiny muted-3">{s.state === "已替代" ? "已被 v3 替代" : s.state === "待发布" ? "阻塞：场景泄露 1 处" : "不可变"}</td>
                    <td className="tiny muted">{s.used}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="panel-foot">
              <Icon n="lock" s={12} />
              <span>已发布版本无法原地修改；需要修正时发新版本并标注替代关系（对应验收项 V09）。</span>
            </div>
          </div>
        </div>
      </>
    );
  }

  function Delivery({ set, inPortal }) {
    const toast = window.UI.useToast();
    const V = D.DELIVERY, C = D.DATA_CARD;
    const [tab, setTab] = useState("清单");
    const [obj, setObj] = useState(false);
    const [dl, setDl] = useState(false);

    const body = (
      <div className="pagebody">
        <div className="grid g-4" style={{ marginBottom: 14 }}>
          <div className="panel-inset" style={{ padding: 12 }}>
            <div className="tiny muted-3">交付进度</div>
            <div className="mono" style={{ fontSize: 23, fontWeight: 600 }}>{Math.round(V.progress * 100)}%</div>
            <div className="bar" style={{ marginTop: 8 }}><i style={{ width: V.progress * 100 + "%" }} /></div>
          </div>
          <div className="panel-inset" style={{ padding: 12 }}>
            <div className="tiny muted-3">交付包体积</div>
            <div className="mono" style={{ fontSize: 23, fontWeight: 600 }}>412<span className="tiny muted-3"> GB</span></div>
            <div className="tiny muted-3" style={{ marginTop: 8 }}>含分片与索引文件</div>
          </div>
          <div className="panel-inset" style={{ padding: 12 }}>
            <div className="tiny muted-3">交付日期</div>
            <div className="mono" style={{ fontSize: 23, fontWeight: 600, color: "var(--warn)" }}>{V.due}</div>
            <div className="tiny muted-3" style={{ marginTop: 8 }}>责任人 {inPortal ? "客户方" : "项目经理"}</div>
          </div>
          <div className="panel-inset" style={{ padding: 12 }}>
            <div className="tiny muted-3">验收状态</div>
            <div style={{ fontSize: 17, fontWeight: 600, marginTop: 4 }}><Tag tone="accent" dot>待客户验收</Tag></div>
            <div className="tiny muted-3" style={{ marginTop: 6 }}>验收状态对外可见</div>
          </div>
        </div>

        <div className="row-tight" style={{ gap: 4, marginBottom: 12 }}>
          {["清单", "Data Card", "格式与转换", "质量报告", "验收与异议"].map((x) => (
            <button key={x} className="btn" aria-pressed={tab === x} style={tab === x ? { background: "var(--surface-3)", borderColor: "var(--line-strong)" } : null} onClick={() => setTab(x)}>{x}</button>
          ))}
        </div>

        {tab === "清单" ? (
          <div className="grid" style={{ gridTemplateColumns: "minmax(0,1.3fr) minmax(0,1fr)" }}>
            <Panel title="交付包内容" sub="四件一体，缺一则交付不完整" flush>
              <div style={{ padding: 14, display: "flex", flexDirection: "column", gap: 8 }}>
                {V.content.map((c) => (
                  <div key={c.k} className="spread" style={{ padding: "11px 12px", border: "1px solid var(--line)", borderRadius: 4, background: c.st === "pending" ? "var(--surface-2)" : "transparent" }}>
                    <span className="row" style={{ gap: 10 }}>
                      <Icon n={c.st === "pending" ? "clock" : "check"} s={15} style={{ color: c.st === "pending" ? "var(--warn)" : "var(--ok)" }} />
                      <span>
                        <span className="small" style={{ fontWeight: 600 }}>{c.k}</span>
                        <span className="tiny muted-3" style={{ display: "block", marginTop: 2 }}>{c.v}</span>
                      </span>
                    </span>
                    <Tag tone={c.st === "pending" ? "warn" : "ok"} dot>{c.st === "pending" ? "待客户签认" : "已生成"}</Tag>
                  </div>
                ))}
                <div className="warnbox info" style={{ marginTop: 4 }}>
                  Data Card 必须随数据一起走：它承载来源、分布、质量、限制与授权，是客户判断数据能否用于训练的依据。
                </div>
              </div>
            </Panel>
            <Panel title="交付流程" sub="阶段与责任人" flush>
              <div style={{ padding: 14 }}>
                <div className="tlflow">
                  {V.steps.map((s, i) => (
                    <div key={s.k} className={cls("tlflow-node", s.st === "done" ? "done" : s.st === "active" ? "active" : "")}>
                      <div className="tlflow-rail">
                        <span className="tlflow-dot">{s.st === "done" ? <Icon n="check" s={12} sw={2.6} /> : s.st === "active" ? <Icon n="activity" s={12} /> : "·"}</span>
                        {i < V.steps.length - 1 ? <span className="tlflow-line" /> : null}
                      </div>
                      <div className="tlflow-body">
                        <div className="spread"><span className="small" style={{ fontWeight: 600 }}>{s.k}</span><span className="tiny muted-3 mono">{s.t}</span></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Panel>
          </div>
        ) : null}

        {tab === "Data Card" ? (
          <div className="grid" style={{ gridTemplateColumns: "minmax(0,1.4fr) minmax(0,1fr)" }}>
            <Panel title={C.id} sub="随交付附带的数据集说明卡" flush>
              <div style={{ padding: 14, display: "flex", flexDirection: "column", gap: 12 }}>
                <DL rows={[["来源", C.source], ["本体", C.embody], ["传感器", C.sensors], ["场景", C.scene], ["分布", C.distribution], ["质量", C.quality], ["授权", C.license]]} />
                <div>
                  <div className="field-label" style={{ marginBottom: 7 }}>已知限制（必须显式声明，避免下游误用）</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {C.limits.map((l, i) => (
                      <div key={i} className="panel-inset" style={{ padding: "9px 11px", borderLeft: "3px solid var(--danger)", display: "flex", gap: 8 }}>
                        <span className="mono tiny muted-3" style={{ flex: "0 0 auto" }}>L{i + 1}</span>
                        <span className="small pretty" style={{ lineHeight: 1.7 }}>{l}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="panel-inset" style={{ padding: 11 }}>
                  <div className="row" style={{ gap: 8 }}>
                    <Icon n="shield" s={14} style={{ color: "var(--accent)" }} />
                    <span className="small">{C.watermark}</span>
                  </div>
                </div>
              </div>
            </Panel>
            <div className="col" style={{ gap: 14 }}>
              <Panel title="下载授权" sub="外部下载必须带时效与水印" flush>
                <div style={{ padding: 14, display: "flex", flexDirection: "column", gap: 10 }}>
                  <DL rows={[["授权对象", "恒立机器人 · 算法组（3 个账号）"], ["有效期", "2026-09-14 至 2026-09-28"], ["水印", "已嵌入 · WM-2f91c4"], ["下载次数", "2 / 5"], ["留痕", "全程记录，可在审计日志检索"]]} />
                  <Btn tone={inPortal ? "primary" : "ghost"} block icon="download" onClick={() => setDl(true)}>发起下载</Btn>
                  <Btn tone="ghost" block icon="code" onClick={() => set({ domain: "dataset", page: "api" })}>通过开放接口拉取</Btn>
                  <div className="tiny muted-3" style={{ lineHeight: 1.6 }}>
                    一次性压缩包适合验收；算法团队持续取数请走开放接口，按片段拉取、可断点续传，且共用同一套凭证与留痕。
                  </div>
                </div>
              </Panel>
              <Panel title="合规" sub="客户数据隔离" flush>
                <div style={{ padding: 14, display: "flex", flexDirection: "column", gap: 8 }}>
                  {[["客户间不可见、不可搜、不可导", true], ["传输 TLS 加密 · 静态落盘密文", true], ["交付包可溯源到接收方", true], ["密钥可轮换", true]].map((r) => (
                    <div key={r[0]} className="spread">
                      <span className="small muted">{r[0]}</span>
                      <Tag tone="ok" icon="check">通过</Tag>
                    </div>
                  ))}
                </div>
              </Panel>
            </div>
          </div>
        ) : null}

        {tab === "质量报告" ? (
          <Panel title="质量评估报告 QER-KITCH-FOLD-v3" sub="面向客户" flush>
            <div style={{ padding: 14, display: "flex", flexDirection: "column", gap: 14 }}>
              <div className="grid g-4" style={{ gap: 10 }}>
                {[["一次通过率", "91.3%", "ok"], ["数据集可用率", "100%", "ok"], ["边缘难例占比", "36.7%", "warn"], ["无效样本", "0 条", "ok"]].map((m) => (
                  <div key={m[0]} className="panel-inset" style={{ padding: 11 }}>
                    <div className="tiny muted-3">{m[0]}</div>
                    <div className="mono" style={{ fontSize: 20, fontWeight: 600, color: "var(--" + m[2] + ")" }}>{m[1]}</div>
                  </div>
                ))}
              </div>
              <div className="grid g-2" style={{ gap: 14 }}>
                <div>
                  <div className="field-label" style={{ marginBottom: 8 }}>维度通过率</div>
                  {[["同步", 99.2], ["完整性", 94.4], ["可见性", 91.8], ["内容质量", 88.1], ["合规", 99.7], ["观测动作一致性", 93.5]].map((d) => (
                    <div key={d[0]} style={{ marginBottom: 9 }}>
                      <div className="spread tiny" style={{ marginBottom: 4 }}><span className="muted">{d[0]}</span><span className="mono">{d[1]}%</span></div>
                      <div className="bar"><i style={{ width: d[1] + "%", background: d[1] < 90 ? "var(--warn)" : "var(--ok)" }} /></div>
                    </div>
                  ))}
                </div>
                <div>
                  <div className="field-label" style={{ marginBottom: 8 }}>驳回原因 TOP 5</div>
                  {D.REJECT_DIST.slice(0, 5).map((x) => (
                    <div key={x.code} className="spread" style={{ padding: "6px 0", borderBottom: "1px solid var(--line-soft)" }}>
                      <span className="row" style={{ gap: 7 }}><span className="codechip">{x.code}</span><span className="small">{x.name}</span></span>
                      <span className="mono small">{x.n}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Panel>
        ) : null}

        {tab === "验收与异议" ? (
          <div className="grid" style={{ gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)" }}>
            <Panel title="异议记录" sub="异议必须结构化并锚定到具体片段或字段" flush
              right={<Btn size="sm" tone="primary" icon="plus" onClick={() => setObj(true)}>提异议</Btn>}>
              <div style={{ padding: 14, display: "flex", flexDirection: "column", gap: 10 }}>
                {D.OBJECTIONS.map((o) => (
                  <div key={o.id} className="panel" style={{ background: "var(--surface-1)" }}>
                    <div style={{ padding: 12 }}>
                      <div className="spread">
                        <span className="row" style={{ gap: 8 }}>
                          <span className="mono small">{o.id}</span>
                          <Tag tone={o.st === "处理中" ? "warn" : "quiet"} dot>{o.st}</Tag>
                        </span>
                        <span className="tiny muted-3">{o.by} · {o.t}</span>
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
              <Panel title="验收单 ACC-KITCH-FOLD-v3" sub="缺一则交付不完整" flush>
                <div style={{ padding: 14, display: "flex", flexDirection: "column", gap: 8 }}>
                  {[["数据集规模与描述相符", true], ["Data Card 字段完整", true], ["质量报告已随附", true], ["已知限制已声明", true], ["下载授权已生效", true], ["客户签认", false]].map((r) => (
                    <div key={r[0]} className="spread" style={{ padding: "9px 0", borderBottom: "1px solid var(--line-soft)" }}>
                      <span className="small muted">{r[0]}</span>
                      {r[1] ? <Tag tone="ok" icon="check">通过</Tag> : <Tag tone="warn" icon="clock">待签认</Tag>}
                    </div>
                  ))}
                </div>
              </Panel>
              <Panel title="交付说明" flush>
                <div style={{ padding: 14, display: "flex", flexDirection: "column", gap: 10 }}>
                  <DL rows={[["快照", "DS-KITCH-FOLD-v3"], ["格式", "LeRobot v2.1 + HDF5 双份"], ["分片", "每片 512 条，共 1 片"], ["加载方式", "流式与随机访问两种，原生 PyTorch Dataset"], ["核验", "内容指纹 sha256:4f2a…c81e"]]} />
                  <div className="tiny muted-3" style={{ lineHeight: 1.65 }}>
                    训练侧流式加载：具身数据集体积巨大，无法一次性载入内存，SDK 提供流式与随机访问两种方式，顺序与随机访问结果一致。
                  </div>
                </div>
              </Panel>
            </div>
          </div>
        ) : null}
        {tab === "格式与转换" ? (
          <div className="col" style={{ gap: 14 }}>
            <Panel title="格式与转换" sub="源格式一次落盘；转换成标准格式供训练侧直接消费，转换不改源，可随时重放"
              right={<Tag tone="quiet" icon="cube">源格式 AIRS HDF5 · 分块写入</Tag>} flush>
              <div style={{ overflowX: "auto" }}>
                <table className="table">
                  <thead><tr><th style={{ width: 108 }}>目标格式</th><th>适用</th><th style={{ width: 200 }}>转换工具</th><th style={{ width: 190 }}>转换后校验</th><th style={{ width: 78 }}>状态</th></tr></thead>
                  <tbody>
                    {[["Parquet", "离线分析 · Pandas / DuckDB", "convert_h5_to_parquet.py", "行数与字段类型与源一致", "已生成"],
                      ["Zarr", "云端 · 多 GPU 并行读取", "convert_h5_to_zarr.py", "分块边界与源一致", "已生成"],
                      ["LeRobot v3", "PyTorch 训练 · 推送 HuggingFace Hub", "convert_h5_to_lerobot.py", "episode 数与帧索引一致", "已生成"],
                      ["JSON Lines", "调试 · 逐条抽查", "convert_h5_to_jsonl.py", "逐条可解析、无 NaN / Inf", "按需"]].map((r) => (
                      <tr key={r[0]}>
                        <td className="small" style={{ fontWeight: 600 }}>{r[0]}</td>
                        <td className="muted pretty">{r[1]}</td>
                        <td><span className="codechip">{r[2]}</span></td>
                        <td className="tiny muted-3">{r[3]}</td>
                        <td><Tag tone={r[4] === "已生成" ? "ok" : "quiet"} dot>{r[4]}</Tag></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="panel-foot">
                <Icon n="info" s={12} />
                <span>每个转换器在运行前先对源 HDF5 做一次内联校验：源本身不合格时直接终止，不产出半成品。</span>
              </div>
            </Panel>
            <div className="grid g-2" style={{ gap: 14 }}>
              <Panel title="推送到训练侧" sub="LeRobot v3 → HuggingFace Hub" flush>
                <div style={{ padding: 14, display: "flex", flexDirection: "column", gap: 10 }}>
                  <DL rows={[["目标仓库", "internal/DS-KITCH-FOLD-v3"], ["格式", "LeRobot v3"], ["分片", "1 片 · 512 条"], ["可见性", "私有 · 仅授权账号"], ["核验", "内容指纹 sha256:4f2a…c81e"]]} />
                  <Btn tone="ghost" block icon="upload" onClick={() => toast.push({ tone: "ok", title: "已推送到 Hub", desc: "LeRobot v3 数据集已推送至私有仓库，仅授权账号可拉取；推送动作已记入审计日志。" })}>推送到 Hub</Btn>
                </div>
              </Panel>
              <Panel title="为什么不只给一份压缩包" sub="格式与消费方式决定复用率" flush>
                <div style={{ padding: 14, display: "flex", flexDirection: "column", gap: 10 }}>
                  <div className="warnbox info">同一份数据，训练侧要的是能直接流式加载的标准格式；只给压缩包，等于把解包、对齐与写 Dataset 的成本转嫁给客户。</div>
                  {[["源格式", "AIRS HDF5 · 分块写入，保留多流原始时序"], ["标准格式", "Parquet / Zarr / LeRobot v3，按用途各取所需"], ["在线消费", "走开放接口按片段拉取，支持断点续传"], ["三者关系", "同一快照的多副面孔，内容指纹一致，不产生第二份事实"]].map((r) => (
                    <div key={r[0]} className="row" style={{ gap: 10, padding: "8px 0", borderBottom: "1px solid var(--line-soft)", alignItems: "flex-start" }}>
                      <span className="small" style={{ fontWeight: 600, flex: "0 0 62px" }}>{r[0]}</span>
                      <span className="small muted pretty grow">{r[1]}</span>
                    </div>
                  ))}
                </div>
              </Panel>
            </div>
          </div>
        ) : null}
      </div>
    );

    return (
      <>
        <PageHead
          crumbs={inPortal ? [{ label: "客户门户" }, { label: "交付与验收" }] : [{ label: "数据集" }, { label: "导出与交付" }]}
          title={inPortal ? "交付与验收" : "导出与交付"}
          desc="数据集、Data Card、质量报告、验收单四件一体，缺一则交付不完整。验收状态对外可见，客户门户的进度必须与实际一致，避免销售承诺与生产实际脱节。"
          meta={<>
            <Tag tone="quiet" icon="file">{V.id} · {V.customer} · {V.code}</Tag>
            <Tag tone="quiet" icon="cube">{V.snapshot}</Tag>
            <Tag tone="warn" icon="clock">交期 {V.due}</Tag>
          </>}
          actions={!inPortal ? <>
            <Btn icon="bell" tone="ghost" onClick={() => toast.push({ tone: "warn", title: "已催办", desc: "已将验收提醒推送至客户门户联系人，并抄送项目经理。" })}>催办验收</Btn>
            <Btn icon="send" tone="primary" onClick={() => toast.push({ tone: "ok", title: "已重新推送门户", desc: "交付清单与下载入口已更新，客户可见。" })}>推送门户</Btn>
          </> : null}
        />
        {body}
        {obj ? <ObjectionDialog onClose={() => setObj(false)} /> : null}
        {dl ? (
          <Modal title="发起下载" desc="外部下载必须带时效与水印，并全程留痕。" onClose={() => setDl(false)} width={480}
            foot={<><Btn tone="ghost" onClick={() => setDl(false)}>取消</Btn>
              <Btn tone="primary" icon="download" onClick={() => { setDl(false); toast.push({ tone: "ok", title: "下载已开始", desc: "文件已带水印 WM-2f91c4 与时效链接（48 小时）。本次下载已记入审计日志。" }); }}>确认下载</Btn></>}>
            <DL rows={[["对象", "DS-KITCH-FOLD-v3 · 412 GB"], ["授权有效期", "至 2026-09-28"], ["水印", "WM-2f91c4（可溯源到接收方）"], ["本次为", "第 3 / 5 次下载"]]} />
            <div className="warnbox">下载链接不可转发。分发后可由水印与来源指纹定位泄露接收方。</div>
          </Modal>
        ) : null}
      </>
    );
  }

  function ObjectionDialog({ onClose }) {
    const toast = window.UI.useToast();
    const [anchor, setAnchor] = useState(true);
    return (
      <Modal title="提交异议" desc="异议需关联到具体片段或字段，否则整改无法执行，只能反复沟通。" onClose={onClose} width={560}
        foot={<><Btn tone="ghost" onClick={onClose}>取消</Btn>
          <Btn tone="primary" disabled={!anchor} icon="send" onClick={() => { onClose(); toast.push({ tone: "ok", title: "异议已提交", desc: "已生成整改任务 OBJ-0008 并关联到采集环节，指派现场督导。整改完成后重新提交验收。" }); }}>提交异议</Btn></>}>
        <Field label="锚点类型" req>
          <div className="row" style={{ gap: 10, marginTop: 2 }}>
            <label className="check"><input type="radio" name="an" defaultChecked onChange={() => setAnchor(true)} /><span>片段 / 帧</span></label>
            <label className="check"><input type="radio" name="an" /><span>元数据字段</span></label>
            <label className="check"><input type="radio" name="an" /><span>Data Card 条目</span></label>
          </div>
        </Field>
        <Field label="锚点定位" req>
          <select className="select"><option>CLP-81226 · 帧 00:52.300 – 01:04.800（动作段「对折」）</option><option>CLP-81204 · 帧 00:12.100</option></select>
        </Field>
        <Field label="异议内容" req>
          <textarea className="textarea" rows={4} defaultValue="该段对折轨迹在 01:00 处出现明显抖动，怀疑本体控制异常而非数据问题，请确认是否应排除。" />
        </Field>
        <div className="warnbox info">提交后异议将自动关联到对应的采集或标注环节，并生成带责任人的整改任务。</div>
      </Modal>
    );
  }

  /* ---------- 标注任务列表 ---------- */
  function AnnoTasks({ set }) {
    const toast = window.UI.useToast();
    const [rows, setRows] = useState(D.ANNO_CLIPS);
    const [creating, setCreating] = useState(false);
    const [nf, setNf] = useState({ from: "CLP-81204", to: "CLP-81211", unit: 3, mode: "按段切分", who: "标注员 A", spec: "CLA-KITCH-FOLD-v4" });

    const SPECS = ["CLA-KITCH-FOLD-v4", "CLA-WH-SORT-v2", "CLA-SCREW-v1"];
    const submitNew = () => {
      const n = Number(nf.unit);
      if (!nf.from || !nf.to) { toast.push({ tone: "warn", title: "请选择数据区间", desc: "拆包需给出起始与结束的 Clip 编号，避免范围不清导致漏标或重标。" }); return; }
      if (!n || n <= 0) { toast.push({ tone: "warn", title: "单元数必须大于 0", desc: "按条数或按段切分，至少产出 1 个可派发单元。" }); return; }
      if (!nf.who) { toast.push({ tone: "warn", title: "请指定标注员", desc: "未指派单元会进入待领取池，请选择首位标注员或先按技能标签智能分派。" }); return; }
      const added = [];
      for (let i = 0; i < Math.min(n, 3); i++) {
        added.push({ id: "CLP-9" + (1200 + rows.length + i), name: "厨房台面 · 折叠衣物 · 拆包 #" + (i + 1), state: "未领取", conf: [], pending: 0 });
      }
      setRows((rs) => rs.concat(added));
      setCreating(false);
      toast.push({ tone: "ok", title: "已拆包新建 " + n + " 个单元", desc: "范围 " + nf.from + " – " + nf.to + "，" + nf.mode + "，规范 " + nf.spec + "，首位标注员 " + nf.who + "。可再用「智能分派」按技能标签与负荷微调。" });
    };

    return (
      <>
        <PageHead crumbs={[{ label: "标注" }, { label: "标注任务" }]} title="标注任务与排产"
          desc="按 Clip 数量、时长、难度拆分为可派发单元，按技能标签与负荷分派。工时与计价可按条、按段或按工时统计。"
          meta={<><Tag tone="quiet">在办 {rows.length + 8} 个</Tag><Tag tone="warn" dot>待复核 5 个</Tag><Tag tone="quiet" icon="users">在岗标注员 9 人</Tag></>}
          actions={<><Btn icon="users" tone="ghost" onClick={() => toast.push({ tone: "info", title: "已按技能标签与负荷分派", desc: "3 个单元已分派给 VLA 标注组，负荷均衡后无人超过 90%。" })}>智能分派</Btn><Btn icon="plus" tone="primary" onClick={() => setCreating(true)}>拆包新建</Btn></>} />
        <div className="pagebody">
          <div className="grid g-3" style={{ marginBottom: 14 }}>
            {[["人均产能", "18.4", "条 / 人日"], ["标注一致性", "86.2", "%（目标 ≥ 85）"], ["返修率", "9.1", "%（目标 ≤ 8）"]].map((m) => (
              <div key={m[0]} className="panel-inset" style={{ padding: 13 }}>
                <div className="tiny muted-3">{m[0]}</div>
                <div className="mono" style={{ fontSize: 22, fontWeight: 600, marginTop: 3 }}>{m[1]}<span className="tiny muted-3" style={{ marginLeft: 4 }}>{m[2]}</span></div>
              </div>
            ))}
          </div>
          <div className="panel" style={{ overflow: "hidden" }}>
            <table className="table">
              <thead><tr><th>数据单元</th><th>任务</th><th>标注员</th><th>规范版本</th><th className="num">时长</th><th>进度</th><th>状态</th><th /></tr></thead>
              <tbody>
                {rows.map((c, i) => (
                  <tr key={c.id} className="clickable" onClick={() => set({ page: "workbench", payload: { clip: c.id } })}>
                    <td><div className="mono">{c.id}</div><div className="tiny muted-3 ellip">{c.name}</div></td>
                    <td className="mono small">TK-2409-011</td>
                    <td>{["标注员 A", "标注员 B", "标注员 C", "标注员 D"][i] || nf.who}</td>
                    <td><span className="codechip">{nf.spec}</span></td>
                    <td className="num">06:12</td>
                    <td style={{ minWidth: 120 }}><div className="bar"><i style={{ width: Math.max(8, 100 - i * 22) + "%" }} /></div></td>
                    <td><Tag tone={c.state === "已提交" ? "ok" : c.state === "标注中" ? "accent" : c.state === "待复核" ? "warn" : "quiet"} dot>{c.state}</Tag></td>
                    <td><Icon n="chevRight" s={13} style={{ color: "var(--text-4)" }} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {creating ? (
          <Modal
            title="拆包新建标注单元"
            width={560}
            desc="把一批 Clip 拆成可派发、可计价、可复核的标注单元。拆包记录会写回数据单元账本，便于追溯来源。"
            onClose={() => setCreating(false)}
            foot={<>
              <Btn tone="ghost" onClick={() => setCreating(false)}>取消</Btn>
              <span className="grow" />
              <Btn tone="primary" icon="check" onClick={submitNew}>拆包并生成单元</Btn>
            </>}
          >
            <div className="grid g-2">
              <Field label="起始 Clip" req>
                <input className="input mono" value={nf.from} onChange={(e) => setNf(Object.assign({}, nf, { from: e.target.value }))} />
              </Field>
              <Field label="结束 Clip" req>
                <input className="input mono" value={nf.to} onChange={(e) => setNf(Object.assign({}, nf, { to: e.target.value }))} />
              </Field>
            </div>
            <div className="grid g-2">
              <Field label="拆包方式" req hint="按段切分保留完整动作段，按固定条数切分更利于均摊负荷">
                <select className="select" value={nf.mode} onChange={(e) => setNf(Object.assign({}, nf, { mode: e.target.value }))}>
                  {["按段切分", "按固定条数", "按时长均分"].map((m) => <option key={m}>{m}</option>)}
                </select>
              </Field>
              <Field label="单元数" req hint="本原型以 3 个单元演示">
                <input className="input mono" value={nf.unit} onChange={(e) => setNf(Object.assign({}, nf, { unit: e.target.value }))} />
              </Field>
            </div>
            <div className="grid g-2">
              <Field label="规范版本" req hint="单元必须绑定单一规范版本，避免口径混用">
                <select className="select" value={nf.spec} onChange={(e) => setNf(Object.assign({}, nf, { spec: e.target.value }))}>
                  {SPECS.map((s) => <option key={s}>{s}</option>)}
                </select>
              </Field>
              <Field label="首位标注员" req>
                <select className="select" value={nf.who} onChange={(e) => setNf(Object.assign({}, nf, { who: e.target.value }))}>
                  {["标注员 A", "标注员 B", "标注员 C", "标注员 D"].map((w) => <option key={w}>{w}</option>)}
                </select>
              </Field>
            </div>
            <div className="warnbox info">
              拆包会改变计价边界：同一 Clip 被拆到不同单元时，工时与返修责任按单元归属统计，因此规范版本与单元数必须在下发前确认。
            </div>
          </Modal>
        ) : null}
      </>
    );
  }

  /* ---------- 仿真域 ---------- */
  function SimPage({ page }) {
    const toast = window.UI.useToast();
    if (page === "simgens") {
      return (
        <>
          <PageHead crumbs={[{ label: "仿真" }, { label: "生成任务" }]} title="合成数据生成与域随机化"
            desc="在仿真中批量生成带标注的样本，管理真实与合成数据的配比与来源标注，形成数据飞轮。" />
          <div className="pagebody">
            <div className="panel" style={{ overflow: "hidden" }}>
              <table className="table">
                <thead><tr><th>生成任务</th><th>仿真环境</th><th>随机化维度</th><th className="num">目标条数</th><th className="num">已生成</th><th>状态</th></tr></thead>
                <tbody>
                  {[["GEN-0091", "Isaac Sim 5.0", "光照 · 材质 · 背景 · 物体位姿", 5000, 5000, "已完成"],
                    ["GEN-0092", "MuJoCo", "光照 · 物体位姿", 3000, 1840, "生成中"],
                    ["GEN-0093", "Genesis", "材质 · 背景 · 轨迹扰动", 4000, 0, "排队中"]].map((r) => (
                    <tr key={r[0]} onClick={() => toast.push({ tone: "info", title: "生成任务详情", desc: r[0] + " · " + r[1] })} className="clickable">
                      <td className="mono">{r[0]}</td><td>{r[1]}</td><td className="muted">{r[2]}</td>
                      <td className="num">{r[3]}</td><td className="num">{r[4]}</td>
                      <td><Tag tone={r[5] === "已完成" ? "ok" : r[5] === "生成中" ? "accent" : "quiet"} dot>{r[5]}</Tag></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      );
    }
    if (page === "simblend") {
      return (
        <>
          <PageHead crumbs={[{ label: "仿真" }, { label: "虚实融合配比" }]} title="虚实融合与来源标注"
            desc="管理真实与合成数据的配比，保证每一条数据来源可追溯 (F4.1)。仿真引擎清单保留 Isaac Sim、MuJoCo、Genesis 三项。" />
          <div className="pagebody">
            <div className="grid g-2">
              <Panel title="默认配比" sub="影响配方默认值与 Data Card 表述" flush>
                <div style={{ padding: 14, display: "flex", flexDirection: "column", gap: 12 }}>
                  {[["真实采集", 70, "ok"], ["仿真生成", 20, "review"], ["Sim2Real 增强", 10, "warn"]].map((r) => (
                    <div key={r[0]}>
                      <div className="spread small" style={{ marginBottom: 5 }}><span>{r[0]}</span><span className="mono">{r[1]}%</span></div>
                      <input type="range" min="0" max="100" defaultValue={r[1]} style={{ width: "100%", accentColor: "var(--" + r[0 + 2] + ")" }} />
                    </div>
                  ))}
                  <div className="warnbox">配比变更将影响后续所有新建配方的默认值；已发布快照不受影响。</div>
                </div>
              </Panel>
              <Panel title="来源标注规则" flush>
                <div style={{ padding: 14, display: "flex", flexDirection: "column", gap: 8 }}>
                  {[["每条数据写入 source 字段（real / sim / sim2real）", true],
                    ["增强数据额外写入算子与参数", true],
                    ["Data Card 自动汇总来源配比", true],
                    ["配比失衡时在建集前置校验给警告", true]].map((r) => (
                    <div key={r[0]} className="spread"><span className="small muted pretty">{r[0]}</span><Tag tone="ok" icon="check">启用</Tag></div>
                  ))}
                </div>
              </Panel>
            </div>
          </div>
        </>
      );
    }
    return (
      <>
        <PageHead crumbs={[{ label: "仿真" }, { label: "仿真接入" }]} title="仿真环境接入"
          desc="向下兼容异构本体、遥操作设备与仿真环境。实机采集场景可在仿真中复现，仿真场景亦可下发实机，形成虚实数据闭环迭代。" />
        <div className="pagebody">
          <div className="grid g-3">
            {[["Isaac Sim", "5.0.0", "已连接", "ok"], ["MuJoCo", "3.2.4", "已连接", "ok"], ["Genesis", "0.4.1", "未连接", "quiet"]].map((e) => (
              <Panel key={e[0]} title={e[0]} sub={"版本 " + e[1]} right={<Tag tone={e[3]} dot>{e[2]}</Tag>} flush>
                <div style={{ padding: 14, display: "flex", flexDirection: "column", gap: 10 }}>
                  <DL rows={[["连接器", e[0].toLowerCase().replace(" ", "-") + "-connector"], ["同步场景", e[2] === "已连接" ? "3 个" : "—"], ["最近同步", e[2] === "已连接" ? "12 分钟前" : "—"]]} />
                  <Btn size="sm" tone="ghost" block icon="refresh" onClick={() => toast.push({ tone: "info", title: "已发起同步", desc: e[0] + " 场景与数据同步中。" })}>同步场景</Btn>
                </div>
              </Panel>
            ))}
          </div>
        </div>
      </>
    );
  }

  /* ---------- 四类看板 ---------- */
  function Board() {
    const [tab, setTab] = useState("产能");
    const TABS = {
      产能: { unit: "条 / 人日", data: [62, 74, 81, 88, 92, 96, 101], foot: [["现场有效产出比", "31.4%", "在基线上提升 10.2 pt"], ["人均日产出", "101 条", "+6.3%"], ["设备占用率", "78.2%", "峰值 94%"]] },
      进度: { unit: "% 完成", data: [18, 32, 46, 58, 71, 84, 92], foot: [["在产任务按期率", "83.3%", "2 个任务存在风险"], ["平均交付周期", "9.4 天", "−1.2 天"], ["批次准交率", "96.1%", "+2.4 pt"]] },
      质量: { unit: "% 通过率", data: [86, 88, 91, 90, 89, 90.5, 88.7], foot: [["一次通过率", "88.7%", "目标 ≥ 92%，当前未达标"], ["机审误报率", "6.2%", "较上周 −1.1 pt"], ["改判率", "3.1%", "—"]] },
      成本: { unit: "元 / 有效小时", data: [1240, 1180, 1120, 1064, 1012, 986, 948], foot: [["单有效小时成本", "948 元", "−7.4%"], ["存储成本", "412 GB / 任务", "冷热分层后 −18%"], ["返工成本占比", "11.2%", "主要来自 RC-0301"]] },
    };
    const cur = TABS[tab];
    return (
      <>
        <PageHead crumbs={[{ label: "看板" }, { label: "四类视图" }]} title="产能 · 进度 · 质量 · 成本"
          desc="四类视图共用同一套口径，切换即切换观测维度。指标可下钻到明细列表，并自动带入筛选条件。"
          actions={<Btn icon="download" tone="ghost">导出报表</Btn>} />
        <div className="pagebody">
          <div className="row-tight" style={{ gap: 4, marginBottom: 14 }}>
            {Object.keys(TABS).map((x) => (
              <button key={x} className="btn" aria-pressed={tab === x} style={tab === x ? { background: "var(--surface-3)", borderColor: "var(--line-strong)" } : null} onClick={() => setTab(x)}>{x}</button>
            ))}
          </div>
          <div className="grid g-3" style={{ marginBottom: 14 }}>
            {cur.foot.map((m) => (
              <div key={m[0]} className="panel-inset" style={{ padding: 13 }}>
                <div className="tiny muted-3">{m[0]}</div>
                <div className="mono" style={{ fontSize: 22, fontWeight: 600, marginTop: 3 }}>{m[1]}</div>
                <div className="tiny muted-3" style={{ marginTop: 5 }}>{m[2]}</div>
              </div>
            ))}
          </div>
          <Panel title={tab + "趋势"} sub={"近 7 日 · " + cur.unit} flush>
            <div style={{ padding: 18 }}>
              <Hist data={cur.data.concat(cur.data).map((v, i) => v * (0.9 + (i % 5) * 0.05))} labels={["09-08", "09-09", "09-10", "09-11", "09-12", "09-13", "09-14", "09-08", "09-09", "09-10", "09-11", "09-12", "09-13", "09-14"]} />
            </div>
          </Panel>
        </div>
      </>
    );
  }

  /* ---------- 安全域 ---------- */
  function SafetyPage({ page }) {
    const toast = window.UI.useToast();
    const M = {
      keys: { t: "加密与密钥管理", d: "传输 TLS 加密、静态数据加密、密钥轮换。抓包不可读，落盘为密文。",
        rows: [["传输层加密", "TLS 1.3 · 全站", "ok"], ["静态加密", "AES-256-GCM · 全量数据桶", "ok"], ["密钥轮换", "90 天自动轮换 · 上次 08-02", "ok"], ["客户专属密钥", "恒立机器人 · 独立 KMS 密钥", "ok"], ["授权校验", "Last check 12:20 · License 有效至 2027-03-01", "ok"]] },
      lifecycle: { t: "数据生命周期与合规销毁", d: "按客户与项目配置留存策略、到期提醒、一键销毁项目数据并出具销毁记录。",
        rows: [["恒立机器人 B01", "留存 24 个月 · 到期 2028-08-31", "warn"], ["瀚海工业 B02", "留存 36 个月 · 到期 2029-08-31", "ok"], ["拓元精密 B03", "留存 12 个月 · 到期 2027-08-31", "ok"], ["临时交付包 DLV-2409-004", "下载链接 48 小时后失效", "ok"]] },
      watermark: { t: "交付包水印与溯源", d: "交付包嵌入水印与来源指纹，可定位泄露接收方；下载授权有时效并全程留痕。",
        rows: [["WM-2f91c4", "DS-KITCH-FOLD-v3 → 恒立机器人", "ok"], ["WM-a3107e", "DS-WH-SORT-v1 → 瀚海工业", "ok"], ["WM-88c0f2", "DS-CLOTH-v2 → 星穹智能", "warn"]] },
    }[page] || null;
    if (!M) return null;
    return (
      <>
        <PageHead crumbs={[{ label: "安全" }, { label: M.t }]} title={M.t} desc={M.d}
          meta={<><Tag tone="ok" icon="shield">全链路审计已开启</Tag><Tag tone="quiet">验收项 V20 / V21 / V22</Tag></>}
          actions={<Btn icon="external" tone="ghost">查看审计日志</Btn>} />
        <div className="pagebody">
          <Panel title={M.t} sub="当前状态" flush>
            <div style={{ padding: 14, display: "flex", flexDirection: "column", gap: 8 }}>
              {M.rows.map((r) => (
                <div key={r[0]} className="spread" style={{ padding: "11px 12px", border: "1px solid var(--line)", borderRadius: 4 }}>
                  <span className="row" style={{ gap: 10 }}>
                    <Icon n={r[2] === "ok" ? "check" : "warn"} s={14} style={{ color: "var(--" + (r[2] === "ok" ? "ok" : "warn") + ")" }} />
                    <span>
                      <span className="small" style={{ fontWeight: 600 }}>{r[0]}</span>
                      <span className="tiny muted-3" style={{ display: "block", marginTop: 2 }}>{r[1]}</span>
                    </span>
                  </span>
                  <Tag tone={r[2]} dot>{r[2] === "ok" ? "正常" : "待关注"}</Tag>
                </div>
              ))}
              {page === "lifecycle" ? (
                <div className="dangerzone" style={{ marginTop: 8 }}>
                  <div className="panel-head"><span className="panel-title">合规销毁</span></div>
                  <div style={{ padding: 14, display: "flex", flexDirection: "column", gap: 10 }}>
                    <div className="warnbox danger">销毁不可恢复。执行前需先导出销毁对象清单，并由客户与项目负责人双方二次确认。</div>
                    <Btn tone="danger" block icon="trash" onClick={() => toast.push({ tone: "warn", title: "需二次确认", desc: "请先选择销毁对象范围并导出清单，确认后方可执行。销毁完成后将出具含对象清单的销毁记录。" })}>发起销毁流程</Btn>
                  </div>
                </div>
              ) : null}
            </div>
          </Panel>
        </div>
      </>
    );
  }

  /* ---------- 配置域 ---------- */
  function ConfigPage({ page, set }) {
    const toast = window.UI.useToast();
    const [creating, setCreating] = useState(false);
    const [extra, setExtra] = useState({});
    const [nf, setNf] = useState([]);
    const M = {
      specs: { t: "规格模板", d: "可复用的数据规格与质量要求集合。模板一经引用即冻结版本，需要修改时另存为新版本。",
        cols: ["模板编号", "场景", "本体", "采集模式", "质量要求", "版本", "状态"],
        rows: [["EGO-KITCH-02", "厨房 / 台面", "人形 · 双臂", "示教采集", "有效帧 ≥ 80% · 可见率 ≥ 70%", "v1.2", "启用"],
          ["WH-SORT-05", "仓储 / 分拣线", "轮式 + 机械臂", "触发式采集", "静止段 ≤ 25%", "v2.0", "启用"],
          ["ASM-SCREW-01", "产线 / 装配工位", "机械臂 · 六轴", "自动回放采集", "力矩异常 ≤ 3%", "v1.0", "草稿"],
          ["CABLE-INS-02", "实验台 / 电控柜", "灵巧手 · 三指", "正负样本统一采集", "动作闭合 100%", "v1.1", "启用"],
          ["GRASP-NEG-01", "桌面 / 多物体", "人形 · 双臂", "正负样本统一采集", "可见率 ≥ 70%", "v1.0", "启用"]] },
      devices: { t: "本体与设备台账", d: "设备档案、固件版本、标定状态、时钟同步与责任人。批量查看在线状态，下发同步与自检指令。",
        cols: ["设备编号", "类型", "固件", "标定", "点位", "在线", "时钟同步", "责任人"],
        rows: [["B01-H2-01", "人形 · 双臂", "fw-3.4.1", "有效至 10-08", "K2", "在线", "已同步 · 0.4ms", "现场督导"],
          ["B01-H2-02", "人形 · 双臂", "fw-3.4.1", "有效至 10-08", "K3", "在线", "已同步 · 0.4ms", "现场督导"],
          ["B03-A6-07", "机械臂 · 六轴", "fw-2.9.0", "已过期 3 天", "S1", "在线", "已同步 · 18µs", "设备工程师"],
          ["B02-WL-03", "轮式 + 机械臂", "fw-1.8.5", "有效至 11-20", "W2", "离线", "已同步 · 1.2ms", "设备工程师"],
          ["DEX-3F-02", "灵巧手 · 三指", "fw-1.2.2", "有效至 09-30", "K7", "在线", "已同步 · 1.2ms", "采集员 A"],
          ["VR-HMD-01", "远端浏览器头显", "—", "无标定项", "远程", "在线", "未同步 · 收报打戳", "现场督导"]],
        note: "B03-A6-07 标定已过期 3 天：按异常清单 X2，允许录制但片段将标记为待复核，需更新标定或接受复核。VR-HMD-01 无法运行受控时钟，改由采集侧在收报时打戳（见接入契约）。" },
      people: { t: "点位与人员", d: "点位信息、人员技能标签与当日负荷。派工与排期以本表为准。",
        cols: ["点位", "场景", "采集员", "技能标签", "当日负荷", "状态"],
        rows: [["K2", "厨房 / 台面", "采集员 A", "Ego · 双臂", "82%", "在岗"], ["K3", "厨房 / 台面", "采集员 C", "Ego · 双臂", "41%", "在岗"],
          ["K5", "桌面 / 多物体", "采集员 B", "抓取 · 失败样本", "96%", "在岗"], ["K7", "实验台 / 电控柜", "采集员 C", "灵巧手 · 力控", "58%", "在岗"],
          ["S1", "产线 / 装配工位", "设备工程师", "六轴 · 力控", "74%", "在岗"]] },
      perms: { t: "权限与角色", d: "角色、权限点、数据范围三层控制。项目隔离与客户数据隔离是准入条件。",
        cols: ["角色", "权限点", "数据范围", "人数"],
        rows: [["采集员", "采集端全部 · 平台端只读本人数据", "本项目 · 本人", "6"], ["质检员", "质检台 · 规则只读", "本项目全量", "4"],
          ["标注员", "标注工作台", "指派单元", "9"], ["算法工程师", "检索 · 配方 · 导出 · 交付", "本项目全量", "3"],
          ["项目经理", "全部（除密钥管理）", "本项目全量", "2"], ["客户", "客户门户只读 · 提异议", "本客户已交付", "3"]] },
      audit: { t: "审计日志", d: "全操作留痕，规格变更与数据导出单独留痕，可检索可导出。",
        cols: ["时间", "操作人", "动作", "对象", "结果", "来源 IP"],
        rows: [["09-14 12:31", "质检员", "修改质检阈值", "QC-MOT-01 30 → 28", "成功", "10.20.3.44"],
          ["09-14 11:52", "项目经理", "撤回已下发任务", "TK-2409-003", "已拦截（需二次确认）", "10.20.3.12"],
          ["09-14 11:20", "客户 · 恒立", "提交异议", "OBJ-0007 · CLP-81226", "成功", "203.0.113.9"],
          ["09-14 10:42", "数据工程师", "导出数据集", "DS-KITCH-FOLD-v3", "成功（带水印）", "10.20.3.31"],
          ["09-14 10:02", "客户 · 恒立", "下载交付包", "DLV-2409-004", "成功（第 2 次）", "203.0.113.9"]] },
    }[page];
    if (!M) return null;

    const list = M.rows.concat(extra[page] || []);
    const openNew = () => { setNf(M.cols.map(() => "")); setCreating(true); };
    const submitNew = () => {
      const vals = nf.map((v) => String(v == null ? "" : v).trim());
      if (vals.some((v) => !v)) { toast.push({ tone: "warn", title: "有必填项为空", desc: "配置类记录字段缺失会导致下游口径不一致，请补齐全部字段后再保存。" }); return; }
      setExtra((e) => Object.assign({}, e, { [page]: (e[page] || []).concat([vals]) }));
      setCreating(false);
      toast.push({ tone: "ok", title: "已新建并保存", desc: vals[0] + " 已加入「" + M.t + "」。配置即时生效，变更已记入审计日志。" });
    };
    const FIELD_HINT = {
      specs: ["模板编号，如 EGO-KITCH-03", "场景，如 厨房 / 台面", "本体，如 人形 · 双臂", "采集模式", "质量要求，如 有效帧 ≥ 80%", "版本，如 v1.0", "状态：启用 / 草稿"],
      devices: ["设备编号，如 B01-H2-03", "类型", "固件，如 fw-3.4.1", "标定有效期", "点位，如 K2", "在线状态：在线 / 离线", "责任人"],
      people: ["点位，如 K9", "场景", "采集员 / 责任人", "技能标签", "当日负荷，如 60%", "状态：在岗 / 离岗"],
      perms: ["角色名", "权限点", "数据范围", "人数"],
    }[page] || [];
    const isAudit = page === "audit";
    return (
      <>
        <PageHead crumbs={[{ label: "配置" }, { label: M.t }]} title={M.t} desc={M.d}
          meta={isAudit ? null : <><Tag tone="quiet">共 {list.length} 条</Tag><Tag tone="quiet" icon="shield">变更留痕 · 可回溯</Tag></>}
          actions={<>
            {page === "devices" && set ? <Btn icon="link" tone="ghost" onClick={() => set({ domain: "config", page: "contract", payload: {} })}>查看接入契约</Btn> : null}
            <Btn icon="filter" tone="ghost">筛选</Btn>
            {isAudit
              ? <Btn icon="download" tone="primary" onClick={() => toast.push({ tone: "ok", title: "日志已导出", desc: "近 30 日审计日志（含规格变更与数据导出留痕）已导出为 CSV，导出动作本身同样留痕。" })}>导出日志</Btn>
              : <Btn icon="plus" tone="primary" onClick={openNew}>新建</Btn>}
          </>} />
        <div className="pagebody">
          <div className="panel" style={{ overflow: "hidden" }}>
            <table className="table">
              <thead><tr>{M.cols.map((c, i) => <th key={i}>{c}</th>)}</tr></thead>
              <tbody>
                {list.map((r, i) => (
                  <tr key={i}>
                    {r.map((c, k) => (
                      <td key={k} className={k === 0 ? "mono" : ""} style={k === 0 ? { fontWeight: 600 } : null}>
                        {c === "启用" || c === "草稿" ? <Tag tone={c === "启用" ? "ok" : "quiet"} dot>{c}</Tag>
                          : c === "在线" || c === "离线" ? <Tag tone={c === "在线" ? "ok" : "quiet"} dot>{c}</Tag>
                          : c === "成功" ? <Tag tone="ok" dot>{c}</Tag>
                          : c === "在岗" ? <Tag tone="ok" dot>{c}</Tag>
                          : c.indexOf && c.indexOf("已同步") === 0 ? <Tag tone="ok" dot>{c}</Tag>
                          : c.indexOf && c.indexOf("未同步") === 0 ? <Tag tone="warn" dot>{c}</Tag>
                          : /^\d+$|%|fw-/.test(c) ? <span className={/^\d+$|%/.test(c) ? "mono" : "mono tiny"}>{c}</span>
                          : <span className={typeof c === "string" && c.length > 24 ? "muted" : ""}>{c}</span>}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            {M.note ? (
              <div className="panel-foot" style={{ color: "var(--warn)" }}>
                <Icon n="warn" s={12} /> {M.note}
              </div>
            ) : null}
          </div>
        </div>

        {creating ? (
          <Modal
            title={"新建 · " + M.t}
            width={560}
            desc="配置类记录一旦被引用即产生下游依赖，字段需完整且命名规范，创建后可在审计日志回溯。"
            onClose={() => setCreating(false)}
            foot={<>
              <Btn tone="ghost" onClick={() => setCreating(false)}>取消</Btn>
              <span className="grow" />
              <Btn tone="primary" icon="check" onClick={submitNew}>保存</Btn>
            </>}
          >
            <div className="grid g-2">
              {M.cols.map((c, i) => (
                <Field key={c} label={c} req={i === 0 || i === 1} hint={FIELD_HINT[i] || undefined}>
                  <input className="input" value={nf[i] || ""} placeholder={FIELD_HINT[i] || ""}
                    onChange={(e) => setNf((v) => v.map((x, k) => (k === i ? e.target.value : x)))} />
                </Field>
              ))}
            </div>
            <div className="warnbox info">
              {page === "specs" ? "规格模板一经任务引用即冻结版本，需要修改时另存为新版本，原任务与历史批次仍指向旧版本。"
                : page === "devices" ? "设备台账涉及标定状态，标定过期的设备允许录制但片段会被标记为待复核。"
                : page === "people" ? "点位与人员是派工与排期的唯一口径，负荷冲突会在下达任务时行内提示。"
                : "权限与角色按「角色 / 权限点 / 数据范围」三层控制，客户数据隔离是准入条件。"}
            </div>
          </Modal>
        ) : null}
      </>
    );
  }

  /* ============================================================
     验收清单（附：第 11 章）
     ============================================================ */
  function Acceptance() {
    return (
      <>
        <PageHead crumbs={[{ label: "配置" }, { label: "设计验收清单" }]} title="设计验收清单（23 项）"
          desc="设计稿进入开发前的自检表，也是上线前的走查依据，每条都可被直接判定通过或不通过。" />
        <div className="pagebody">
          <div className="panel" style={{ overflow: "hidden" }}>
            <table className="table dense">
              <thead><tr><th style={{ width: 56 }}>编号</th><th style={{ width: 320 }}>检查项</th><th>通过标准</th><th style={{ width: 92 }}>原型状态</th></tr></thead>
              <tbody>
                {D.ACCEPTANCE.map((a) => (
                  <tr key={a[0]}>
                    <td className="mono muted-3">{a[0]}</td>
                    <td>{a[1]}</td>
                    <td className="muted pretty">{a[2]}</td>
                    <td><Tag tone="ok" icon="check">已覆盖</Tag></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </>
    );
  }

  /* ============================================================
     开放接口 / API（交付后的数据消费入口）
     ============================================================ */
  const CODE_SAMPLES = {
    curl: [
      "# 1) API Key + HMAC 签名换取时效令牌",
      "curl -s -X POST https://api.embodied-data.example/v1/auth/token \\",
      "  -H \"X-Api-Key: AK-LIVE-7f21\" \\",
      "  -H \"X-Signature: hmac-sha256=...\" \\",
      "  -H \"X-Timestamp: 1757834001\" \\",
      "  -d '{\"scope\":\"clip:read\",\"ttl\":3600}'",
      "",
      "# 2) 自然语言检索片段（游标分页）",
      "curl -s -X POST https://api.embodied-data.example/v1/search \\",
      "  -H \"Authorization: Bearer $TOKEN\" \\",
      "  -d '{\"dataset\":\"DS-KITCH-FOLD-v3\",\"query\":\"叠衣服失败的那几条\",\"limit\":20}'",
      "",
      "# 3) 断点续传取媒体切片",
      "curl -s -H \"Authorization: Bearer $TOKEN\" -H \"Range: bytes=0-4194303\" \\",
      "  https://api.embodied-data.example/v1/clips/CLP-81204/media -o clip.part0",
    ],
    python: [
      "# Python 3 · requests",
      "import requests",
      "BASE = \"https://api.embodied-data.example\"",
      "h = {\"X-Api-Key\": \"AK-LIVE-7f21\"}",
      "",
      "tok = requests.post(BASE + \"/v1/auth/token\", headers=h,",
      "                    json={\"scope\": \"clip:read\", \"ttl\": 3600}).json()[\"token\"]",
      "H = {\"Authorization\": \"Bearer \" + tok}",
      "",
      "r = requests.post(BASE + \"/v1/search\", headers=H, json={",
      "    \"dataset\": \"DS-KITCH-FOLD-v3\",",
      "    \"query\": \"叠衣服失败的那几条\",",
      "    \"limit\": 20,",
      "}).json()",
      "",
      "for clip in r[\"items\"]:",
      "    print(clip[\"id\"], clip[\"qc\"], clip[\"confidence\"])",
    ],
    js: [
      "// Node 18+ · 内置 fetch",
      "const BASE = \"https://api.embodied-data.example\";",
      "const res = await fetch(BASE + \"/v1/search\", {",
      "  method: \"POST\",",
      "  headers: { \"Authorization\": \"Bearer \" + token, \"Content-Type\": \"application/json\" },",
      "  body: JSON.stringify({ dataset: \"DS-KITCH-FOLD-v3\", query: \"叠衣服失败的那几条\", limit: 20 }),",
      "});",
      "const { items, next_cursor } = await res.json();",
      "console.log(items.length, next_cursor);",
    ],
  };

  function ApiConsole({ app, set }) {
    const toast = window.UI.useToast();
    const [tab, setTab] = useState("接口");
    const [lang, setLang] = useState("curl");
    const E = D.API_ENDPOINTS, K = D.API_KEYS, C = D.API_CALLS, W = D.API_WEBHOOKS;
    const methodTone = (m) => (m === "POST" ? "ok" : "review");
    const codeTone = (c) => (c < 300 ? "ok" : c < 500 ? "warn" : "danger");
    const TABS = ["接口", "鉴权与密钥", "事件回调", "调用日志", "接入示例"];

    return (
      <>
        <PageHead
          crumbs={[{ label: "数据集" }, { label: "开放接口" }]}
          title="开放接口 · Open API"
          desc="交付不是终点。客户算法团队通过开放接口按需检索与拉取数据，而不是反复等一次压缩包。取数共用同一套凭证、水印与留痕，权限点与客户隔离口径一致。"
          meta={
            <>
              <Tag tone="quiet" icon="server">版本 v1 · 稳定</Tag>
              <Tag tone="ok" dot>生产凭证 3 个在用</Tag>
              <Tag tone="quiet" icon="gauge">默认限流 20 QPS</Tag>
            </>
          }
          actions={<>
            <Btn icon="link" tone="ghost" onClick={() => toast.push({ tone: "info", title: "已复制接入文档地址", desc: "接口文档与 OpenAPI 描述文件按凭证范围生成，真实数据集 ID 等敏感字段不会下发到文档。" })}>接入文档</Btn>
            <Btn icon="plus" tone="primary" onClick={() => toast.push({ tone: "ok", title: "已创建沙箱凭证", desc: "沙箱凭证仅可访问沙箱数据；正式凭证需在「安全 · 加密与密钥」完成审批后签发。" })}>新建凭证</Btn>
          </>}
        />
        <div className="pagebody">
          <div className="grid g-4" style={{ marginBottom: 14 }}>
            {[
              ["数据集读取", "GET /v1/datasets", "列数据集与 Data Card，按客户隔离"],
              ["片段检索与取数", "POST /v1/search", "自然语言检索 + 游标分页 + 断点续传"],
              ["交付包导出", "POST /v1/exports", "异步导出，下载地址 48 小时失效"],
              ["事件回调", "5 类事件", "状态、质检、交付变化实时推送"],
            ].map((c) => (
              <div key={c[0]} className="panel-inset" style={{ padding: 12 }}>
                <div className="row" style={{ gap: 7 }}>
                  <Icon n="code" s={14} style={{ color: "var(--accent)" }} />
                  <span className="small" style={{ fontWeight: 600 }}>{c[0]}</span>
                </div>
                <div className="mono tiny" style={{ marginTop: 8, color: "var(--text-2)" }}>{c[1]}</div>
                <div className="tiny muted-3" style={{ marginTop: 5, lineHeight: 1.6 }}>{c[2]}</div>
              </div>
            ))}
          </div>

          <div className="row-tight" style={{ gap: 4, marginBottom: 12 }}>
            {TABS.map((x) => (
              <button key={x} className="btn" aria-pressed={tab === x}
                style={tab === x ? { background: "var(--surface-3)", borderColor: "var(--line-strong)" } : null}
                onClick={() => setTab(x)}>{x}</button>
            ))}
          </div>

          {tab === "接口" ? (
            <div className="panel" style={{ overflow: "hidden" }}>
              <div className="panel-head">
                <span className="panel-title">接口清单</span>
                <span className="panel-sub">v1 · 全部走 HTTPS，请求体与回调均需签名</span>
              </div>
              <table className="table">
                <thead><tr>
                  <th style={{ width: 64 }}>方法</th><th>路径</th><th>说明</th>
                  <th style={{ width: 126 }}>鉴权</th><th style={{ width: 72 }} className="num">限流</th><th style={{ width: 108 }}>权限点</th>
                </tr></thead>
                <tbody>
                  {E.map((e) => (
                    <tr key={e.m + e.p} className="clickable"
                      onClick={() => toast.push({ tone: "info", title: e.m + " " + e.p, desc: e.d + "（权限点 " + e.scope + "，限流 " + e.qps + " QPS，鉴权：" + e.auth + "）" })}>
                      <td><Tag tone={methodTone(e.m)} dot>{e.m}</Tag></td>
                      <td className="mono small">{e.p}</td>
                      <td className="muted pretty">{e.d}</td>
                      <td className="tiny muted-3">{e.auth}</td>
                      <td className="num tiny">{e.qps} QPS</td>
                      <td><span className="codechip">{e.scope}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="panel-foot">
                <Icon n="info" s={12} />
                <span>限流按凭证维度计算，超限返回 429 并带 Retry-After 响应头；批量取数建议用游标顺序拉取，而不是并发暴冲。</span>
              </div>
            </div>
          ) : null}

          {tab === "鉴权与密钥" ? (
            <div className="grid" style={{ gridTemplateColumns: "minmax(0,1.4fr) minmax(0,1fr)" }}>
              <Panel title="生产与沙箱凭证" sub="可轮换、可停用，权限点最小授予" flush>
                <div style={{ overflowX: "auto" }}>
                  <table className="table">
                    <thead><tr><th>凭证</th><th>归属</th><th>环境</th><th>权限点</th><th>IP 白名单</th><th>最近调用</th><th>状态</th></tr></thead>
                    <tbody>
                      {K.map((k) => (
                        <tr key={k.id}>
                          <td className="mono small" style={{ fontWeight: 600 }}>{k.id}</td>
                          <td>{k.who}</td>
                          <td><Tag tone={k.env === "生产" ? "accent" : "quiet"}>{k.env}</Tag></td>
                          <td className="muted tiny">{k.scopes}</td>
                          <td className="mono tiny">{k.ip}</td>
                          <td className="mono tiny muted-3">{k.last}</td>
                          <td><Tag tone={k.state === "启用" ? "ok" : "quiet"} dot>{k.state}</Tag></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Panel>
              <div className="col" style={{ gap: 14 }}>
                <Panel title="鉴权方式" sub="两段式：先签名换令牌，再持令牌取数" flush>
                  <div style={{ padding: 14, display: "flex", flexDirection: "column", gap: 11 }}>
                    {[
                      ["API Key", "标识调用方身份，可随时停用与轮换"],
                      ["HMAC-SHA256 签名", "对方法、路径、时间戳与请求体签名，防篡改防重放"],
                      ["时效令牌", "Bearer 令牌默认 1 小时，可细到权限点与数据集"],
                      ["IP 白名单", "生产凭证必须绑定来源网段"],
                    ].map((r) => (
                      <span key={r[0]} className="row" style={{ gap: 8, alignItems: "flex-start" }}>
                        <Icon n="key" s={13} style={{ color: "var(--accent)", flex: "0 0 auto", marginTop: 2 }} />
                        <span>
                          <span className="small" style={{ fontWeight: 600 }}>{r[0]}</span>
                          <span className="tiny muted-3" style={{ display: "block", marginTop: 2, lineHeight: 1.6 }}>{r[1]}</span>
                        </span>
                      </span>
                    ))}
                    <Btn tone="ghost" block icon="external"
                      onClick={() => toast.push({ tone: "info", title: "已对齐密钥管理", desc: "开放接口凭证与「安全 · 加密与密钥」共用同一套 KMS 密钥与 90 天轮换策略，停用即刻生效。" })}>在密钥管理中对齐轮换策略</Btn>
                  </div>
                </Panel>
                <Panel title="配额与合规" sub="与客户隔离口径一致" flush>
                  <div style={{ padding: 14, display: "flex", flexDirection: "column", gap: 8 }}>
                    {[["凭证仅可见本客户数据集"], ["取数全程留痕，可审计"], ["媒体切片带水印与来源指纹"], ["下载地址 48 小时失效"]].map((r) => (
                      <div key={r[0]} className="spread"><span className="small muted">{r[0]}</span><Tag tone="ok" icon="check">通过</Tag></div>
                    ))}
                  </div>
                </Panel>
              </div>
            </div>
          ) : null}

          {tab === "事件回调" ? (
            <div className="grid" style={{ gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)" }}>
              <Panel title="Webhook 事件" sub="回调带签名与时间戳，失败自动重试 3 次" flush>
                <table className="table">
                  <thead><tr><th>事件</th><th>说明</th><th style={{ width: 88 }}>订阅</th></tr></thead>
                  <tbody>
                    {W.map((w) => (
                      <tr key={w.ev}>
                        <td className="mono small">{w.ev}</td>
                        <td className="muted pretty">{w.d}</td>
                        <td><Tag tone={w.state === "已订阅" ? "ok" : "quiet"} dot>{w.state}</Tag></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Panel>
              <Panel title="回调处置建议" sub="幂等与退避" flush>
                <div style={{ padding: 14, display: "flex", flexDirection: "column", gap: 10 }}>
                  <div className="warnbox info">回调可能重复投递：请以事件 ID 做幂等，不要以到达顺序推断业务顺序。</div>
                  {[["重试策略", "指数退避 · 最多 3 次"], ["超时", "10 秒未响应计一次失败"], ["验签", "时间戳偏差 > 5 分钟拒绝"], ["回执", "返回 2xx 视为成功"]].map((r) => (
                    <div key={r[0]} className="spread" style={{ padding: "9px 0", borderBottom: "1px solid var(--line-soft)" }}>
                      <span className="small muted">{r[0]}</span><span className="small mono">{r[1]}</span>
                    </div>
                  ))}
                </div>
              </Panel>
            </div>
          ) : null}

          {tab === "调用日志" ? (
            <div className="panel" style={{ overflow: "hidden" }}>
              <div className="panel-head">
                <span className="panel-title">调用日志</span>
                <span className="panel-sub">近 24 小时 · 全部调用留痕，可导出</span>
                <span style={{ marginLeft: "auto" }}>
                  <Btn size="sm" tone="ghost" icon="download"
                    onClick={() => toast.push({ tone: "ok", title: "日志已导出", desc: "近 24 小时调用日志已导出为 CSV，含状态码、耗时与限流记录。" })}>导出</Btn>
                </span>
              </div>
              <div style={{ overflowX: "auto" }}>
                <table className="table">
                  <thead><tr><th style={{ width: 84 }}>时间</th><th>调用方</th><th>接口</th><th style={{ width: 68 }} className="num">状态</th><th style={{ width: 76 }} className="num">耗时</th><th>备注</th></tr></thead>
                  <tbody>
                    {C.map((c, i) => (
                      <tr key={i}>
                        <td className="mono tiny muted-3">{c.t}</td>
                        <td className="small nowrap">{c.who}</td>
                        <td className="mono tiny">{c.ep}</td>
                        <td className="num"><Tag tone={codeTone(c.code)} dot>{c.code}</Tag></td>
                        <td className="num mono tiny">{c.ms} ms</td>
                        <td className="muted pretty tiny">{c.note}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="panel-foot">
                <Icon n="info" s={12} />
                <span>停用凭证（403）、限流（429）与时效过期（404）单独高亮——这三类是最常见的接入问题，日志里可直接定位。</span>
              </div>
            </div>
          ) : null}

          {tab === "接入示例" ? (
            <div className="panel" style={{ overflow: "hidden" }}>
              <div className="panel-head">
                <span className="panel-title">接入示例</span>
                <span className="panel-sub">先换令牌，再检索，最后断点续传取媒体</span>
                <span style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
                  {["curl", "python", "js"].map((l) => (
                    <button key={l} className="btn btn-sm" aria-pressed={lang === l}
                      style={lang === l ? { background: "var(--surface-3)", borderColor: "var(--line-strong)" } : null}
                      onClick={() => setLang(l)}>{l}</button>
                  ))}
                </span>
              </div>
              <div style={{ padding: 14 }}>
                <pre className="codeblock"><code>{(CODE_SAMPLES[lang] || []).join("\n")}</code></pre>
                <div className="row" style={{ gap: 8, marginTop: 12, flexWrap: "wrap" }}>
                  <Btn tone="ghost" icon="copy" onClick={() => toast.push({ tone: "ok", title: "示例已复制", desc: "示例代码已复制到剪贴板（原型内为模拟操作）。" })}>复制示例</Btn>
                  <Btn tone="ghost" icon="play" onClick={() => toast.push({ tone: "info", title: "已在沙箱发送示例请求", desc: "沙箱返回 200，命中 18 条片段，next_cursor 已返回。" })}>在沙箱试跑</Btn>
                  <span className="tiny muted-3" style={{ alignSelf: "center" }}>沙箱与生产除数据范围外接口完全一致，可在沙箱联调通过后再切换生产凭证。</span>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </>
    );
  }

  /* ============================================================
     设备接入契约（源：硬件-软件解耦）
     ============================================================ */
  function ContractPage({ set }) {
    const toast = window.UI.useToast();
    const [lang, setLang] = useState("session");
    const IF = D.CONTRACT_IFACES, ST = D.CONTRACT_STREAMS, RJ = D.CONTRACT_REJECTS, CK = D.CLOCK_SYNC;
    const bad = ST.filter((s) => !s.ok).length;
    const synced = CK.filter((c) => c.state === "已同步").length;

    return (
      <>
        <PageHead
          crumbs={[{ label: "配置" }, { label: "接入契约" }]}
          title="设备接入契约"
          desc="硬件与软件解耦的落点：任何能按契约发布标准消息的设备都能接入，换硬件、换场景、换点位都不改采集服务代码，只改会话配置。契约是受控资产——入库前先过契约校验，不合契约的消息根本不进入生产队列。"
          meta={
            <>
              <Tag tone="quiet" icon="link">3 个接口契约</Tag>
              <Tag tone={bad ? "warn" : "ok"} dot>{ST.length} 条流 · {bad ? bad + " 条不合契约" : "全部合规"}</Tag>
              <Tag tone={synced < CK.length ? "warn" : "ok"} icon="clock">时钟同步 {synced} / {CK.length} 节点</Tag>
            </>
          }
          actions={<>
            <Btn icon="file" tone="ghost" onClick={() => toast.push({ tone: "info", title: "契约文档已生成", desc: "契约与开放接口同源生成，含消息类型、QoS、时间域与字段抽取规则，可直接交给设备侧对接。" })}>导出契约</Btn>
            <Btn icon="plus" tone="primary" onClick={() => toast.push({ tone: "ok", title: "已登记新设备", desc: "登记只做两件事：确认它发布的消息类型匹配契约、在会话配置里声明话题。不产生任何采集服务代码改动。" })}>登记新设备</Btn>
          </>}
        />
        <div className="pagebody">
          <div className="grid g-3" style={{ marginBottom: 14 }}>
            {IF.map((f) => (
              <div key={f.k} className="panel-inset" style={{ padding: 12 }}>
                <div className="row" style={{ gap: 7 }}>
                  <Icon n="link" s={14} style={{ color: "var(--accent)" }} />
                  <span className="small" style={{ fontWeight: 600 }}>{f.k}</span>
                </div>
                <div className="tiny muted-3" style={{ marginTop: 8, lineHeight: 1.65 }}>{f.d}</div>
                <div className="row" style={{ gap: 6, marginTop: 9, flexWrap: "wrap" }}>
                  <span className="codechip">{f.types}</span>
                  <span className="tiny muted-3">{f.rate}</span>
                </div>
              </div>
            ))}
          </div>

          <Panel title="流声明" sub="每条流独立声明话题、消息类型、QoS、时间域与字段；采集服务对硬件零知识，只按声明订阅"
            right={<Tag tone="quiet" icon="branch">两层配置 · 第 1 层</Tag>} flush style={{ marginBottom: 14 }}>
            <div style={{ overflowX: "auto" }}>
              <table className="table">
                <thead><tr>
                  <th style={{ width: 96 }}>流</th><th style={{ width: 66 }}>来源</th><th>话题</th><th>消息类型</th>
                  <th style={{ width: 84 }}>时间域</th><th style={{ width: 196 }}>QoS</th><th style={{ width: 148 }}>字段抽取</th>
                  <th style={{ width: 60 }} className="num">速率</th><th style={{ width: 74 }}>契约</th>
                </tr></thead>
                <tbody>
                  {ST.map((s) => (
                    <tr key={s.topic} className="clickable"
                      onClick={() => toast.push({
                        tone: s.ok ? "info" : "warn",
                        title: s.name + " · " + s.topic,
                        desc: s.type + " · 时间域 " + s.tdom + " · QoS " + s.qos + " · 字段 " + s.fields + (s.ok ? "" : "；该流不合契约，入库前会被拒绝。"),
                      })}>
                      <td className="small" style={{ fontWeight: 600 }}>{s.name}</td>
                      <td><Tag tone="quiet">{s.src}</Tag></td>
                      <td className="mono tiny">{s.topic}</td>
                      <td className="mono tiny muted-3">{s.type}</td>
                      <td className="tiny" style={{ color: s.ok ? "var(--text-2)" : "var(--danger)" }}>{s.tdom}</td>
                      <td className="mono tiny muted-3">{s.qos}</td>
                      <td className="mono tiny muted-3">{s.fields}</td>
                      <td className="num tiny">{s.hz}</td>
                      <td><Tag tone={s.ok ? "ok" : "danger"} dot>{s.ok ? "合规" : "不合规"}</Tag></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="panel-foot">
              <Icon n="info" s={12} />
              <span>只接受带 header 的消息：header.stamp 必须是数据的创建时刻（曝光、读回、解算或收报），而不是发布时刻。无 header 的消息一律拒绝，避免「看起来对齐、实际错位」。</span>
            </div>
          </Panel>

          <div className="grid" style={{ gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)", marginBottom: 14 }}>
            <Panel title="两层配置" sub="改硬件不改代码" flush
              right={<div className="row-tight">
                <button className="btn btn-sm" aria-pressed={lang === "session"} style={lang === "session" ? { background: "var(--surface-3)" } : null} onClick={() => setLang("session")}>会话配置</button>
                <button className="btn btn-sm" aria-pressed={lang === "global"} style={lang === "global" ? { background: "var(--surface-3)" } : null} onClick={() => setLang("global")}>全局配置</button>
              </div>}>
              <div style={{ padding: 14 }}>
                <pre className="codeblock" style={{ maxHeight: 300 }}><code>{D.CONTRACT_YAML[lang].join("\n")}</code></pre>
                <div className="tiny muted-3" style={{ marginTop: 10, lineHeight: 1.7 }}>
                  第 1 层会话配置回答「录什么」，第 2 层全局配置回答「用哪个适配器」。新增设备 = 写一个发布标准消息的适配器 + 在会话配置里声明话题；核心采集服务既不参与，也不知道具体硬件。
                </div>
              </div>
            </Panel>
            <Panel title="时间域与时钟同步" sub="跨流对齐的唯一前提"
              right={<Tag tone={synced < CK.length ? "warn" : "ok"} dot>{synced} / {CK.length} 已同步</Tag>} flush>
              <div style={{ padding: 14 }}>
                <div className="warnbox" style={{ marginBottom: 10 }}>
                  记录的每条时间戳都来自各发布端自己的时钟。时钟不同步不会报错，只会让跨流对齐静默错位——这是最难事后发现的一类数据缺陷。录制前必须完成同步。
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                  {CK.map((c) => (
                    <div key={c.node} className="spread" style={{ padding: "8px 10px", border: "1px solid var(--line)", borderRadius: 4, background: c.state === "已同步" ? "transparent" : "var(--warn-dim)" }}>
                      <span className="row" style={{ gap: 8 }}>
                        <Icon n={c.state === "已同步" ? "check" : "warn"} s={13} style={{ color: c.state === "已同步" ? "var(--ok)" : "var(--warn)" }} />
                        <span>
                          <span className="small" style={{ fontWeight: 600 }}>{c.node}</span>
                          <span className="tiny muted-3" style={{ display: "block", marginTop: 2 }}>{c.proto}</span>
                        </span>
                      </span>
                      <span className="row" style={{ gap: 8 }}>
                        <span className="mono tiny muted-3">{c.off}</span>
                        <Tag tone={c.state === "已同步" ? "ok" : "warn"} dot>{c.state}</Tag>
                      </span>
                    </div>
                  ))}
                </div>
                <div className="tiny muted-3" style={{ marginTop: 10, lineHeight: 1.7 }}>
                  局域网用 chrony 即可（毫秒级）；需要更紧的界用 PTP（微秒级）。若远端设备无法运行受控时钟（例如浏览器头显），把适配层放在采集侧、在收报时打戳，不要依赖对端时钟。
                </div>
              </div>
            </Panel>
          </div>

          <Panel title="契约拦截记录" sub="不合契约的消息在入库前被拒，而不是等质检环节才发现"
            right={<Tag tone="danger" dot>近 24 小时 {RJ.length} 次</Tag>} flush>
            <div style={{ overflowX: "auto" }}>
              <table className="table">
                <thead><tr><th style={{ width: 84 }}>时间</th><th style={{ width: 186 }}>流</th><th>拦截原因</th><th style={{ width: 108 }}>处置</th><th>建议</th></tr></thead>
                <tbody>
                  {RJ.map((r, i) => (
                    <tr key={i}>
                      <td className="mono tiny muted-3">{r.t}</td>
                      <td className="mono tiny">{r.stream}</td>
                      <td className="small pretty">{r.why}</td>
                      <td><Tag tone={r.action === "标记待核" ? "warn" : "danger"} dot>{r.action}</Tag></td>
                      <td className="muted pretty tiny">{r.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="panel-foot">
              <Icon n="info" s={12} />
              <span>拦截不是失败，是廉价的质量前置：在校验流水线第一步就拒掉，比让脏数据走完采集、上传、质检、标注再回溯便宜一个数量级。</span>
            </div>
          </Panel>
        </div>
      </>
    );
  }

  window.PAGES_B = { QCConsole, QCQueue, RuleConfig, AnnoWorkbench, RecipeEditor, Snapshots,
    Delivery, ObjectionDialog, AnnoTasks, SimPage, Board, SafetyPage, ConfigPage, Acceptance, ApiConsole, ContractPage };
})();
