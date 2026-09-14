/* ============================================================
   采集端（移动优先，源：7.2 / 8.4）
   现场约束：可能戴手套、光线差、单手操作、弱网是默认场景
   ============================================================ */
(function () {
  const { useState, useEffect, useRef } = React;
  const { Tag, Btn, IconBtn, Panel, Field, Switch, Modal, Drawer, DL, cls, useToast } = window.UI;
  const D = window.DATA;

  const MET = D.CAPTURE_METRICS;

  /* 指标是否越界 */
  function metricState(m, v) {
    const ok = m.dir === "gt" ? v >= m.ok : v <= m.ok;
    if (ok) {
      const near = m.dir === "gt" ? v < m.ok + (100 - m.ok) * 0.25 : v > m.ok * 0.75;
      return near ? "warn" : "ok";
    }
    const hard = m.dir === "gt" ? v < m.ok * 0.9 : v > m.ok * 1.35;
    return hard ? "danger" : "warn";
  }

  function metricsAt(stepIdx, e) {
    const bad = stepIdx === 2 && e > 4;
    const k = bad ? Math.min(1.6, (e - 4) / 5) : 0;
    return [
      { k: "同步偏差", v: +(0.28 + 0.1 * Math.sin(e * 1.7)).toFixed(2) },
      { k: "有效帧占比", v: +(93.4 - k * 14).toFixed(1) },
      { k: "目标可见率", v: +(88.0 - k * 26).toFixed(1) },
      { k: "静止段占比", v: +(8.6 + k * 9).toFixed(1) },
      { k: "丢帧率", v: +(0.42 + k * 1.1).toFixed(2) },
    ];
  }

  /* ============================================================
     采集端外壳
     ============================================================ */
  function CaptureApp() {
    const toast = useToast();
    const [tab, setTab] = useState("home");
    const [jobId, setJobId] = useState(D.CAPTURE_TASKS[0].id);
    const [offline, setOffline] = useState(false);
    const [syncBad, setSyncBad] = useState(false);
    const [job, setJob] = useState(() => JSON.parse(JSON.stringify(D.CAPTURE_TASKS[0])));
    const [rec, setRec] = useState(null);
    const [e, setE] = useState(0);
    const [marks, setMarks] = useState([]);
    const [retry, setRetry] = useState({});
    const [queue, setQueue] = useState([
      { id: "SEG-K2-0412", step: "沿长边对折一次", size: "412 MB", st: "uploading", p: 0.62 },
      { id: "SEG-K2-0411", step: "平铺毛巾，四角对齐", size: "386 MB", st: "done", p: 1 },
      { id: "SEG-K2-0410", step: "确认台面与机位", size: "41 MB", st: "done", p: 1 },
    ]);
    const [ackOpen, setAckOpen] = useState(false);

    /* 录制计时 */
    useEffect(() => {
      if (!rec) return;
      const id = setInterval(() => setE((v) => +(v + 0.25).toFixed(2)), 250);
      return () => clearInterval(id);
    }, [rec]);

    /* 上传队列推进 */
    useEffect(() => {
      if (offline) return;
      const id = setInterval(() => {
        setQueue((q) => {
          const i = q.findIndex((x) => x.st === "uploading");
          if (i < 0) return q;
          const arr = q.slice();
          const p = Math.min(1, arr[i].p + 0.06);
          arr[i] = Object.assign({}, arr[i], { p: p, st: p >= 1 ? "done" : "uploading" });
          if (p >= 1) {
            const nxt = q.findIndex((x, k) => k > i && x.st === "queued");
            if (nxt >= 0) arr[nxt] = Object.assign({}, arr[nxt], { st: "uploading" });
          }
          return arr;
        });
      }, 700);
      return () => clearInterval(id);
    }, [offline]);

    const rawIdx = job.steps.findIndex((s) => !s.done);
    const allDone = rawIdx < 0;
    const curStep = allDone ? job.steps.length - 1 : rawIdx;
    const mvals = metricsAt(curStep, e);
    const states = mvals.map((mv, i) => metricState(MET[i], mv.v));
    const worst = states.indexOf("danger") >= 0 ? "danger" : states.indexOf("warn") >= 0 ? "warn" : "ok";
    const lightText = {
      ok: "数据可用，继续下一步",
      warn: "指标接近阈值，注意 " + (states.indexOf("warn") >= 0 ? mvals[states.indexOf("warn")].k : "变化"),
      danger: "手部超出画面，请调整站位或后退半步",
    }[worst];

    const startRec = () => {
      if (syncBad) { toast.push({ tone: "danger", title: "无法开始录制", desc: "设备时间未同步，请先一键同步。按异常 X1：同步偏差超阈将阻塞录制并红色告警。" }); return; }
      setRec({ step: curStep }); setE(0); setMarks([]);
    };
    const stopRec = () => {
      const seg = "SEG-K2-0" + (413 + Math.floor(Math.random() * 80));
      const st = job.steps.slice();
      st[curStep] = Object.assign({}, st[curStep], { done: true, tries: (retry[curStep] || 0) + 1 });
      setJob(Object.assign({}, job, { steps: st, left: Math.max(0, job.left - 1) }));
      setQueue((q) => [{ id: seg, step: job.steps[curStep].n, size: (300 + Math.round(e * 30)) + " MB", st: offline ? "queued" : "uploading", p: 0 },
        ...q.map((x) => (x.st === "uploading" ? Object.assign({}, x, { st: "queued" }) : x))]);
      setRec(null); setE(0); setMarks([]);
      toast.push({ tone: worst === "danger" ? "warn" : "ok", title: "本步已结束", desc: (worst === "danger" ? "片段标记为待复核。已进入" : "已生成片段并进入") + (offline ? "离线队列，恢复网络后自动续传。" : "上传队列。") });
    };
    const redoStep = (i) => {
      setRetry(Object.assign({}, retry, { [i]: (retry[i] || 0) + 1 }));
      const st = job.steps.slice();
      for (let k = i; k < st.length; k++) st[k] = Object.assign({}, st[k], { done: false });
      setJob(Object.assign({}, job, { steps: st }));
      setTab("job");
      toast.push({ tone: "info", title: "已重录该步（第 " + ((retry[i] || 0) + 2) + " 次）", desc: "只重录失败的这一步，原片段进入回收，避免为一步失误丢弃整条记录。" });
    };

    const pending = queue.filter((q) => q.st !== "done").length;

    return (
      <div className="m-app">
        <div className="m-statusbar">
          <span>12:46</span>
          <span className="row" style={{ gap: 5 }}>
            {offline ? <Icon n="wifiOff" s={11} style={{ color: "var(--warn)" }} /> : <Icon n="activity" s={11} />}
            {syncBad ? <Icon n="warn" s={11} style={{ color: "var(--danger)" }} /> : null}
            <span>K2 · 82%</span>
          </span>
        </div>

        <div className="m-topbar">
          {tab === "job" ? (
            <IconBtn n="chevLeft" s={18} title="返回" onClick={() => { setTab("home"); setRec(null); }} />
          ) : (
            <span className="brand-mark" style={{ width: 24, height: 24 }}><Icon n="robot" s={13} /></span>
          )}
          <div className="grow">
            <div className="m-title">{tab === "home" ? "今日任务" : tab === "job" ? job.name : tab === "upload" ? "上传队列" : "我的"}</div>
            <div className="m-sub">
              {tab === "job" ? job.scene + " · " + job.spec : tab === "home" ? "09-14 周一 · 3 个任务待办" : tab === "upload" ? (offline ? "离线中 · 恢复后自动续传" : "共 " + queue.length + " 个片段") : "采集员 A"}
            </div>
          </div>
          {tab !== "home" ? <IconBtn n="bell" s={17} title="通知" badge={pending ? String(pending) : null} /> : (
            <IconBtn n={offline ? "wifiOff" : "activity"} s={17} title="网络" onClick={() => setOffline(!offline)} />
          )}
        </div>

        {offline && tab !== "home" ? (
          <div style={{ padding: "9px 14px", background: "var(--warn-dim)", borderBottom: "1px solid color-mix(in srgb, var(--warn) 34%, transparent)", display: "flex", gap: 8, alignItems: "center" }}>
            <Icon n="wifiOff" s={14} style={{ color: "var(--warn)", flex: "0 0 auto" }} />
            <span className="small" style={{ color: "var(--warn)" }}>已转入离线队列 · 待上传 {pending} 个片段</span>
          </div>
        ) : null}
        {syncBad && tab === "job" ? (
          <div style={{ padding: "9px 14px", background: "var(--danger-dim)", borderBottom: "1px solid color-mix(in srgb, var(--danger) 34%, transparent)", display: "flex", gap: 8, alignItems: "center" }}>
            <Icon n="warn" s={14} style={{ color: "var(--danger)", flex: "0 0 auto" }} />
            <span className="small" style={{ color: "var(--danger)", flex: 1 }}>设备时间未同步（偏差 1.8 帧），录制已阻塞</span>
            <button className="btn btn-sm" style={{ borderColor: "var(--danger)", color: "var(--danger)", background: "transparent" }}
              onClick={() => { setSyncBad(false); toast.push({ tone: "ok", title: "同步完成", desc: "偏差已回到 0.2 帧，录制自动解除阻塞。" }); }}>一键同步</button>
          </div>
        ) : null}

        <div className="m-scroll">
          {tab === "home" ? <CaptureHome jobId={jobId} onOpen={(id) => { setJobId(id); setJob(JSON.parse(JSON.stringify(D.CAPTURE_TASKS.filter((x) => x.id === id)[0]))); setTab("job"); setE(0); }} queue={queue} offline={offline} /> : null}
          {tab === "job" ? (
            <CaptureJob job={job} curStep={curStep} allDone={allDone} rec={rec} e={e}
              mvals={mvals} states={states} worst={worst} lightText={lightText} marks={marks} retry={retry}
              onStart={startRec} onStop={stopRec}
              onAnomaly={() => setMarkers(setMarks, curStep, e, toast)}
              onRedo={redoStep}
              onAck={() => setAckOpen(true)}
              onLeave={() => { setTab("home"); setRec(null); }}
              onJumpStep={(i) => { if (i <= curStep) return; toast.push({ tone: "info", title: "请先完成当前步骤", desc: "SOP 步骤需按顺序执行；如需重来，可在已完成步骤上选择重录。" }); }} />
          ) : null}
          {tab === "upload" ? <CaptureUpload queue={queue} offline={offline} onRetry={() => toast.push({ tone: "info", title: "已重新入队", desc: "断点续传，不重新开始。" })} /> : null}
          {tab === "me" ? <CaptureMe onToggleOffline={() => setOffline(!offline)} offline={offline} onSync={() => setSyncBad(true)} /> : null}
        </div>

        {/* 主操作区：位置固定不随滚动移动，位于拇指可达范围 */}
        {tab === "job" ? (
          <div className="m-actionbar">
            <Btn tone="ghost" icon="flag" onClick={() => setMarkers(setMarks, curStep, e, toast)} style={{ height: 44, flex: "0 0 auto", padding: "0 14px" }}>异常打点</Btn>
            {!allDone ? (
              !rec ? (
                <button className="m-bigbtn rec grow" onClick={startRec}>
                  <span className="recdot" style={{ background: "#fff" }} /> 开始录制 · 第 {curStep + 1} 步
                </button>
              ) : (
                <button className="m-bigbtn stop grow" onClick={stopRec}>
                  <Icon n="stop" s={18} /> 结束本步 {e.toFixed(1)}s
                </button>
              )
            ) : (
              <button className="m-bigbtn done grow" onClick={() => setTab("upload")}>
                <Icon n="check" s={18} /> 已完成 · 查看上传队列
              </button>
            )}
          </div>
        ) : null}

        <nav className="m-tabbar">
          {[["home", "今日", "grid"], ["job", "作业", "target"], ["upload", "上传", "upload"], ["me", "我的", "user"]].map(([k, label, ic]) => (
            <button key={k} className={cls("m-tab", tab === k && "active")} onClick={() => { if (k !== "job") setRec(null); setTab(k); }}>
              <Icon n={ic} s={19} />
              <span>{label}</span>
            </button>
          ))}
        </nav>

        {ackOpen ? (
          <Modal title="我已知晓并继续" desc="质量灯不可被关闭——现场人员有绕过提示的动机，因此提示不可关闭，但可以提供「我已知晓并继续」的操作记录留痕。" onClose={() => setAckOpen(false)} width={420}
            foot={<><Btn tone="ghost" onClick={() => setAckOpen(false)}>取消</Btn>
              <Btn tone="primary" onClick={() => { setAckOpen(false); toast.push({ tone: "warn", title: "已留痕", desc: "本次「已知晓并继续」已写入记录，将随片段一并提交给质检。" }); }}>确认并留痕</Btn></>}>
            <DL rows={[["当前指标", mvals.map((m) => m.k + " " + m.v).join(" · ")], ["结论", worst === "danger" ? "不通过（将标记待复核）" : "有条件通过"], ["留痕对象", "本片段 + 采集员 A"]]} />
          </Modal>
        ) : null}
      </div>
    );
  }

  function setMarkers(setMarks, curStep, e, toast) {
    setMarks((m) => m.concat([{ t: e, step: curStep }]));
    toast.push({ tone: "info", title: "已打点", desc: "异常时刻 " + e.toFixed(2) + "s 已标记，并附短语原因，将随片段一并提交。" });
  }

  /* ============================================================
     今日任务卡（源：8.4）
     ============================================================ */
  function CaptureHome({ jobId, onOpen, queue, offline }) {
    return (
      <>
        <div className="m-card flat">
          <div className="spread">
            <span className="small muted">今日待办</span>
            <Tag tone="warn" dot>交期 09-19</Tag>
          </div>
          <div className="row" style={{ gap: 18, marginTop: 10 }}>
            <div><div className="tiny muted-3">剩余条数</div><div className="mono" style={{ fontSize: 27, fontWeight: 600 }}>54</div></div>
            <div><div className="tiny muted-3">已完成</div><div className="mono" style={{ fontSize: 27, fontWeight: 600, color: "var(--ok)" }}>36</div></div>
            <div><div className="tiny muted-3">一次通过</div><div className="mono" style={{ fontSize: 27, fontWeight: 600 }}>91%</div></div>
          </div>
        </div>

        {queue.filter((q) => q.st !== "done").length ? (
          <div className="m-card" style={{ borderColor: "var(--accent-line)", background: "var(--surface-1)" }}>
            <div className="row" style={{ gap: 9 }}>
              <Icon n={offline ? "wifiOff" : "upload"} s={17} style={{ color: offline ? "var(--warn)" : "var(--accent)" }} />
              <div className="grow">
                <div className="small" style={{ fontWeight: 600 }}>{offline ? "待上传 " + queue.filter((q) => q.st !== "done").length + " 个片段" : "正在上传"}</div>
                <div className="tiny muted-3" style={{ marginTop: 2 }}>{offline ? "恢复网络后自动续传，无需人工干预" : "断点续传中，可离开本页"}</div>
              </div>
            </div>
          </div>
        ) : null}

        <div className="field-label" style={{ paddingLeft: 2 }}>任务卡</div>
        {D.CAPTURE_TASKS.map((t) => (
          <button key={t.id} className={cls("m-card", t.id === jobId && "active")} style={{ textAlign: "left", cursor: "pointer", width: "100%" }}
            onClick={() => onOpen(t.id)}>
            <div className="spread">
              <span className="mono tiny muted-3">{t.id}</span>
              <Tag tone={t.state === "active" ? "accent" : "quiet"} dot>{t.state === "active" ? "进行中" : "待开始"}</Tag>
            </div>
            <div style={{ fontSize: 17, fontWeight: 600, marginTop: 7, lineHeight: 1.45 }} className="pretty">{t.name}</div>
            <div className="tiny muted-3" style={{ marginTop: 4 }}>{t.scene} · {t.mode}</div>
            <div style={{ marginTop: 11 }}>
              <div className="spread tiny muted-3" style={{ marginBottom: 5 }}>
                <span>剩余 {t.left} / {t.plan} 条</span><span>{t.priority}</span>
              </div>
              <div className="bar thick"><i style={{ width: (1 - t.left / t.plan) * 100 + "%" }} /></div>
            </div>
          </button>
        ))}

        <div className="m-card flat">
          <div className="field-label">今日现场提示</div>
          <div className="col" style={{ gap: 9, marginTop: 10 }}>
            {[["K2 点位照明偏暗", "建议开启补光灯，避免过曝/欠曝驳回"], ["机位建议已更新", "肩部机位易致手部出画，建议改为胸部机位"]].map((x) => (
              <div key={x[0]} className="row" style={{ gap: 9, alignItems: "flex-start" }}>
                <Icon n="info" s={14} style={{ color: "var(--review)", flex: "0 0 auto", marginTop: 2 }} />
                <div><div className="small">{x[0]}</div><div className="tiny muted-3" style={{ marginTop: 2, lineHeight: 1.6 }}>{x[1]}</div></div>
              </div>
            ))}
          </div>
        </div>
      </>
    );
  }

  /* ============================================================
     作业页（源：7.2）
     ============================================================ */
  function CaptureJob({ job, curStep, allDone, rec, e, mvals, states, worst, lightText, marks, retry, onStart, onStop, onAnomaly, onRedo, onAck, onLeave, onJumpStep }) {
    const [specOpen, setSpecOpen] = useState(false);
    const [metricOpen, setMetricOpen] = useState(false);
    const recording = !!rec;

    return (
      <>
        {/* 规格条（默认折叠为一行） */}
        <button className="m-card flat" style={{ textAlign: "left", cursor: "pointer", width: "100%" }} onClick={() => setSpecOpen(!specOpen)}>
          <div className="spread">
            <span className="row" style={{ gap: 8 }}>
              <Icon n="file" s={14} className="muted-3" />
              <span className="small" style={{ fontWeight: 600 }}>{job.spec}（已冻结）</span>
            </span>
            <Icon n="chevDown" s={15} className="muted-3" style={{ transform: specOpen ? "none" : "rotate(-90deg)", transition: "transform 150ms" }} />
          </div>
          {specOpen ? (
            <div style={{ marginTop: 11 }}>
              <DL rows={[["采集模式", job.mode], ["本体", "人形 · 双臂"], ["点位", job.scene], ["模态", "RGB-D 头部 · 腕部 RGB · 关节力矩 · 触觉"],
                ["有效帧占比", "≥ 80%"], ["目标可见率", "≥ 70%"], ["静止段占比", "≤ 30%"], ["观测动作偏差", "≤ 2 帧"]]} />
              <div className="row" style={{ gap: 8, marginTop: 10 }}>
                <span className="tag t-quiet"><Icon n="eye" s={11} /> 查看参考样例</span>
                <span className="tag t-quiet"><Icon n="play" s={11} /> 示范视频 0:42</span>
              </div>
            </div>
          ) : null}
        </button>

        {/* 预览窗 */}
        <div className="m-card" style={{ padding: 0, overflow: "hidden" }}>
          <div className="player-grid n2" style={{ height: 168 }}>
            {[["exo", "外部机位 E1", "var(--accent)"], [recording ? "wrist" : "ego", recording ? "腕部机位 W1" : "头部机位 Ego", "var(--domain-c)"]].map((v) => (
              <div key={v[0]} className="viewtile">
                <SceneFrame view={v[0]} t={recording ? 0.2 + (e % 3) / 8 : 0.3} />
                <span className="vtlabel"><i className="lid" style={{ background: v[2] }} />{v[1]}</span>
                {recording ? <span className="vtbadge" style={{ color: "#fff", display: "flex", gap: 5, alignItems: "center" }}>
                  <span className="recdot" style={{ width: 7, height: 7, background: "var(--danger)" }} />REC {e.toFixed(1)}s
                </span> : null}
              </div>
            ))}
          </div>
          {marks.length ? (
            <div style={{ padding: "8px 12px", display: "flex", gap: 6, flexWrap: "wrap", borderTop: "1px solid var(--line-soft)" }}>
              {marks.map((m, i) => (
                <span key={i} className="tag t-warn"><Icon n="flag" s={10} /> {m.t.toFixed(2)}s</span>
              ))}
            </div>
          ) : null}
        </div>

        {/* 质量灯 */}
        <button className={cls("qlight", "m-card", worst)} style={{ width: "100%", textAlign: "left", cursor: "pointer", border: "1px solid", padding: 13 }}
          onClick={() => setMetricOpen(!metricOpen)}>
          <span className="lamp" style={{ width: 16, height: 16 }} />
          <span className="grow">
            <span className="qtext" style={{ fontWeight: 600, display: "block", fontSize: 14 }}>
              {recording ? "录制中 · " : ""}{worst === "ok" ? "绿灯 可用" : worst === "warn" ? "黄灯 注意" : "红灯 不可用"}
            </span>
            <span className="tiny" style={{ color: "var(--text-2)", display: "block", marginTop: 3, lineHeight: 1.55 }}>{lightText}</span>
          </span>
          <Icon n="chevDown" s={15} style={{ transform: metricOpen ? "none" : "rotate(-90deg)", transition: "transform 150ms", color: "var(--text-3)" }} />
        </button>

        {metricOpen ? (
          <div className="m-card">
            <div className="field-label" style={{ marginBottom: 10 }}>五项实时指标</div>
            <div className="col" style={{ gap: 10 }}>
              {mvals.map((m, i) => (
                <div key={m.k}>
                  <div className="spread" style={{ marginBottom: 5 }}>
                    <span className="small" style={{ color: "var(--" + states[i] + ")" }}>{m.k}</span>
                    <span className="mono small">{m.v}<span className="tiny muted-3">{MET[i].unit}</span>
                      <span className="tiny muted-3" style={{ marginLeft: 7 }}>{MET[i].dir === "gt" ? "≥" : "≤"}{MET[i].ok}</span>
                    </span>
                  </div>
                  <div className={cls("bar", states[i] === "ok" ? "ok" : states[i])}>
                    <i style={{ width: Math.min(100, MET[i].dir === "gt" ? m.v : (m.v / (MET[i].ok * 1.8)) * 100) + "%" }} />
                  </div>
                  <div className="tiny muted-3" style={{ marginTop: 3 }}>{MET[i].hint}</div>
                </div>
              ))}
            </div>
            <div className="warnbox" style={{ marginTop: 11, fontSize: 11, lineHeight: 1.65 }}>
              质量灯不可被关闭：现场人员有绕过提示的动机，因此提示不可关闭，但可以提供「我已知晓并继续」的操作记录留痕。
            </div>
            <Btn size="sm" tone="ghost" block style={{ marginTop: 8 }} onClick={onAck} disabled={worst === "ok"}>我已知晓并继续（留痕）</Btn>
          </div>
        ) : null}

        {/* 动作清单 */}
        <div className="m-card" style={{ padding: "10px 6px" }}>
          <div className="spread" style={{ padding: "0 8px 8px" }}>
            <span className="field-label" style={{ margin: 0 }}>SOP 步骤清单</span>
            <span className="tiny muted-3">{allDone ? job.steps.length : curStep + 1} / {job.steps.length}</span>
          </div>
          {job.steps.map((s, i) => (
            <div key={i} className={cls("m-step", s.done && "done", i === curStep && !allDone && "active")} onClick={() => onJumpStep(i)}>
              <span className="m-stepnum">{s.done ? <Icon n="check" s={12} sw={2.6} /> : i + 1}</span>
              <span className="grow">
                <span className="m-step-name" style={{ fontSize: 15, fontWeight: i === curStep ? 600 : 400, display: "block", lineHeight: 1.5 }}>{s.n}</span>
                <span className="tiny muted-3" style={{ display: "block", marginTop: 3 }}>
                  {s.done ? "已完成" + (retry[i] ? " · 第 " + (retry[i] + 1) + " 次" : "") + " · 点击可重录该步" : i === curStep ? "当前步骤 · 点击查看要点与示例图" : "未开始"}
                </span>
              </span>
              {s.done ? <Icon n="refresh" s={15} style={{ color: "var(--text-4)", flex: "0 0 auto" }}
                onClick={(ev) => { ev.stopPropagation(); onRedo(i); }} /> : null}
            </div>
          ))}
        </div>

        {allDone ? (
          <div className="m-card" style={{ borderColor: "color-mix(in srgb, var(--ok) 34%, transparent)", background: "var(--ok-dim)" }}>
            <div className="row" style={{ gap: 9 }}>
              <Icon n="check" s={17} style={{ color: "var(--ok)" }} />
              <div><div className="small" style={{ fontWeight: 600, color: "var(--ok)" }}>本条数据已完成</div>
                <div className="tiny muted-3" style={{ marginTop: 3, lineHeight: 1.6 }}>上传前轻校验已通过，片段已进入上传队列（命名、时长、必填元数据均在端侧拦截）。</div></div>
              <Icon n="chevRight" s={15} className="muted-3" />
            </div>
          </div>
        ) : null}
      </>
    );
  }

  /* ============================================================
     上传队列（源：7.3 端侧部分）
     ============================================================ */
  function CaptureUpload({ queue, offline, onRetry }) {
    return (
      <>
        <div className="m-card flat">
          <div className="spread">
            <span className="small muted">上传状态</span>
            <Tag tone={offline ? "warn" : "ok"} dot>{offline ? "离线队列" : "断点续传中"}</Tag>
          </div>
          <div className="row" style={{ gap: 18, marginTop: 10 }}>
            <div><div className="tiny muted-3">已完成</div><div className="mono" style={{ fontSize: 25, fontWeight: 600, color: "var(--ok)" }}>{queue.filter((q) => q.st === "done").length}</div></div>
            <div><div className="tiny muted-3">待上传</div><div className="mono" style={{ fontSize: 25, fontWeight: 600, color: offline ? "var(--warn)" : "var(--text)" }}>{queue.filter((q) => q.st !== "done").length}</div></div>
            <div><div className="tiny muted-3">体积</div><div className="mono" style={{ fontSize: 25, fontWeight: 600 }}>1.2<span className="tiny muted-3">GB</span></div></div>
          </div>
        </div>

        <div className="field-label" style={{ paddingLeft: 2 }}>片段队列</div>
        {queue.map((q) => (
          <div key={q.id} className="m-card">
            <div className="spread">
              <span className="mono small">{q.id}</span>
              {q.st === "done" ? <Tag tone="ok" icon="check">已上传</Tag>
                : q.st === "queued" ? <Tag tone="warn" dot>待上传</Tag>
                : <Tag tone="accent" dot>{Math.round(q.p * 100)}%</Tag>}
            </div>
            <div className="small" style={{ marginTop: 6 }}>{q.step}</div>
            <div className="bar" style={{ marginTop: 9 }}><i style={{ width: q.p * 100 + "%" }} /></div>
            <div className="spread" style={{ marginTop: 8 }}>
              <span className="tiny muted-3">{q.size}</span>
              {q.st !== "done" ? <Btn size="sm" tone="ghost" icon="refresh" onClick={onRetry}>立即重试</Btn> : <span className="tiny muted-3">端侧轻校验通过</span>}
            </div>
          </div>
        ))}

        <div className="m-card flat">
          <div className="field-label">上传规则</div>
          <div className="col" style={{ gap: 9, marginTop: 10 }}>
            {[["分片上传 · 断点续传", "中断后保留已传分片，恢复后自动续传，不重新开始"],
              ["内容指纹命中即秒传", "同一片段重复上传时直接跳过"],
              ["超大文件走旁路", "超过浏览器阈值时不硬传，改为对象存储直传"],
              ["弱网与离线是默认场景", "离线仍可录制，恢复网络后自动续传"]].map((x) => (
              <div key={x[0]} className="row" style={{ gap: 9, alignItems: "flex-start" }}>
                <Icon n="check" s={14} style={{ color: "var(--ok)", flex: "0 0 auto", marginTop: 2 }} />
                <div><div className="small">{x[0]}</div><div className="tiny muted-3" style={{ marginTop: 2, lineHeight: 1.6 }}>{x[1]}</div></div>
              </div>
            ))}
          </div>
        </div>
      </>
    );
  }

  /* ============================================================
     我的（现场异常与设备）
     ============================================================ */
  function CaptureMe({ offline, onToggleOffline, onSync }) {
    return (
      <>
        <div className="m-card">
          <div className="row" style={{ gap: 12 }}>
            <span style={{ width: 44, height: 44, borderRadius: 22, background: "var(--surface-3)", display: "grid", placeItems: "center" }}>
              <Icon n="user" s={20} />
            </span>
            <div className="grow">
              <div style={{ fontSize: 16, fontWeight: 600 }}>采集员 A</div>
              <div className="tiny muted-3" style={{ marginTop: 3 }}>采集员 · 点位 K2 · 今日在岗</div>
            </div>
          </div>
          <div className="row" style={{ gap: 18, marginTop: 14 }}>
            <div><div className="tiny muted-3">今日完成</div><div className="mono" style={{ fontSize: 21, fontWeight: 600 }}>36</div></div>
            <div><div className="tiny muted-3">一次通过</div><div className="mono" style={{ fontSize: 21, fontWeight: 600 }}>91%</div></div>
            <div><div className="tiny muted-3">重录</div><div className="mono" style={{ fontSize: 21, fontWeight: 600, color: "var(--warn)" }}>4</div></div>
          </div>
        </div>

        <div className="field-label" style={{ paddingLeft: 2 }}>现场异常报障</div>
        {D.CAPTURE_ANOMALY.map((a) => (
          <div key={a.code} className="m-card" style={{ padding: "12px 14px" }}>
            <div className="spread">
              <span className="small" style={{ fontWeight: 600 }}>{a.k}</span>
              <span className="codechip">{a.code}</span>
            </div>
          </div>
        ))}

        <div className="m-card flat">
          <div className="spread" style={{ marginBottom: 10 }}>
            <span className="field-label" style={{ margin: 0 }}>设备状态</span>
            <Tag tone="ok" dot>在线</Tag>
          </div>
          <DL rows={[["设备", "B01-H2-01 人形 · 双臂"], ["固件", "fw-3.4.1"], ["标定", "有效至 10-08"], ["同步偏差", "0.2 帧（阈值 1）"], ["存储可用", "184 GB"]]} />
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 12 }}>
            <Switch checked={offline} onChange={onToggleOffline} label="模拟弱网 / 离线（演示用）" />
            <Btn size="sm" tone="ghost" block icon="warn" onClick={onSync}>模拟设备时间不同步</Btn>
          </div>
        </div>

        <div className="m-card flat">
          <div className="field-label">今日已驳回需重采</div>
          <div className="col" style={{ gap: 10, marginTop: 10 }}>
            {[["SEG-K2-0398", "RC-0101 手部出画", "09:24"], ["SEG-K2-0402", "RC-0301 静止过长", "10:11"], ["SEG-K2-0405", "RC-0301 静止过长", "11:02"]].map((x) => (
              <div key={x[0]} className="row" style={{ gap: 10 }}>
                <Icon n="refresh" s={14} style={{ color: "var(--danger)", flex: "0 0 auto" }} />
                <div className="grow">
                  <div className="mono small">{x[0]}</div>
                  <div className="tiny muted-3" style={{ marginTop: 2 }}>{x[1]} · {x[2]}</div>
                </div>
                <Btn size="sm" tone="danger">去重采</Btn>
              </div>
            ))}
            <div className="tiny muted-3" style={{ lineHeight: 1.65 }}>
              驳回必须附证据：原因码加时间码或帧标记，因此每条驳回都能直接跳到问题帧，采集端不会收到无法执行的指令。
            </div>
          </div>
        </div>
      </>
    );
  }

  window.CAPTURE = { CaptureApp };
})();
