/* ============================================================
   设计系统组件 · 所有页面共用
   ============================================================ */
(function () {
  const { useState, useRef, useEffect, useMemo, useCallback } = React;

  /* ---------- 小工具 ---------- */
  const cls = function () {
    return Array.prototype.slice.call(arguments).filter(Boolean).join(" ");
  };
  const r3 = (n) => Math.round(n * 1000) / 1000;

  function useTicker(duration, playing) {
    const [t, setT] = useState(0.42);
    const raf = useRef(0);
    const last = useRef(0);
    useEffect(() => {
      if (!playing) return;
      last.current = performance.now();
      const loop = (now) => {
        const dt = (now - last.current) / 1000;
        last.current = now;
        setT((v) => {
          const n = v + dt / duration;
          return n >= 1 ? 1 : n;
        });
        raf.current = requestAnimationFrame(loop);
      };
      raf.current = requestAnimationFrame(loop);
      return () => cancelAnimationFrame(raf.current);
    }, [playing, duration]);
    return [t, setT];
  }

  /* ---------- 基础件 ---------- */
  function Tag({ tone = "", children, dot, icon, className, style }) {
    return (
      <span className={cls("tag", tone && "t-" + tone, className)} style={style}>
        {icon ? <Icon n={icon} s={11} /> : dot ? <i className="tdot" /> : null}
        {children}
      </span>
    );
  }

  function Btn({ children, tone, icon, iconRight, size, block, className, style, ...rest }) {
    return (
      <button
        className={cls("btn", tone && "btn-" + tone, size && "btn-" + size, block && "btn-block", className)}
        style={style}
        {...rest}
      >
        {icon ? <Icon n={icon} s={13} /> : null}
        {children}
        {iconRight ? <Icon n={iconRight} s={13} /> : null}
      </button>
    );
  }

  function IconBtn({ n, s = 15, title, badge, tone, ...rest }) {
    return (
      <button className="iconbtn" title={title} aria-label={title} {...rest}>
        <Icon n={n} s={s} />
        {badge ? <span className={cls("dot", tone)}>{badge}</span> : null}
      </button>
    );
  }

  function Panel({ title, sub, right, children, flush, foot, className, bodyClass, style }) {
    return (
      <section className={cls("panel", className)} style={style}>
        {title ? (
          <header className="panel-head">
            <span className="panel-title">{title}</span>
            {sub ? <span className="panel-sub">{sub}</span> : null}
            {right ? <span style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>{right}</span> : null}
          </header>
        ) : null}
        <div className={cls("panel-body", flush && "flush", bodyClass)}>{children}</div>
        {foot ? <footer className="panel-foot">{foot}</footer> : null}
      </section>
    );
  }

  function Field({ label, req, hint, children, className }) {
    return (
      <div className={cls("field", className)}>
        {label ? (
          <label className="field-label">
            {label}
            {req ? <span className="req">·</span> : null}
            {hint ? <span className="muted-3 tiny" style={{ marginLeft: "auto", fontWeight: 400 }}>{hint}</span> : null}
          </label>
        ) : null}
        {children}
      </div>
    );
  }

  function Switch({ checked, onChange, label }) {
    return (
      <label className="check" style={{ gap: 8 }}>
        <span className="switch">
          <input type="checkbox" checked={checked} onChange={(e) => onChange && onChange(e.target.checked)} />
          <span className="knob" />
        </span>
        {label ? <span>{label}</span> : null}
      </label>
    );
  }

  const Kbd = ({ children }) => <kbd className="kbd">{children}</kbd>;

  /* ---------- 状态反馈（四态） ---------- */
  function StateBlock({ kind = "empty", title, desc, action }) {
    const map = {
      empty: { icon: "layers", t: title || "这里暂时没有数据" },
      loading: { icon: "refresh", t: title || "正在加载" },
      error: { icon: "warn", t: title || "加载失败" },
      denied: { icon: "lock", t: title || "无访问权限" },
    };
    const m = map[kind] || map.empty;
    return (
      <div className="state">
        <span className="state-ico" style={kind === "error" ? { color: "var(--danger)", borderColor: "color-mix(in srgb,var(--danger) 34%,transparent)" } : null}>
          <Icon n={m.icon} s={17} />
        </span>
        <span className="state-title">{m.t}</span>
        {desc ? <span className="state-desc">{desc}</span> : null}
        {action}
      </div>
    );
  }

  function SkeletonRows({ n = 5 }) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 8, padding: 14 }}>
        {Array.from({ length: n }).map((_, i) => (
          <div key={i} className="skel" style={{ height: 18, width: 100 - i * 7 + "%" }} />
        ))}
      </div>
    );
  }

  /* ---------- 轻提示 ---------- */
  const ToastCtx = React.createContext(null);
  function ToastHost({ children }) {
    const [list, setList] = useState([]);
    const push = useCallback((t) => {
      const id = Math.random().toString(36).slice(2);
      setList((v) => v.concat([Object.assign({ id: id }, t)]));
      if (t.sticky !== true) setTimeout(() => setList((v) => v.filter((x) => x.id !== id)), t.ms || 3600);
      return id;
    }, []);
    const api = useMemo(() => ({ push: push, close: (id) => setList((v) => v.filter((x) => x.id !== id)) }), [push]);
    return (
      <ToastCtx.Provider value={api}>
        {children}
        <div className="toasts">
          {list.map((t) => (
            <div key={t.id} className={cls("toast", t.tone || "info")}>
              <Icon n={t.tone === "danger" ? "danger" : t.tone === "warn" ? "warn" : t.tone === "ok" ? "check" : "info"} s={15}
                style={{ marginTop: 1, color: "var(--" + (t.tone === "ok" ? "ok" : t.tone === "danger" ? "danger" : t.tone === "warn" ? "warn" : "accent") + ")", flex: "0 0 auto" }} />
              <div className="grow">
                <div className="toast-title">{t.title}</div>
                {t.desc ? <div className="toast-desc">{t.desc}</div> : null}
                {t.action ? (
                  <div style={{ marginTop: 5, display: "flex", gap: 12 }}>
                    <span className="undo" onClick={() => { t.action.fn(); api.close(t.id); }}>{t.action.label}</span>
                  </div>
                ) : null}
              </div>
              <button className="iconbtn" style={{ width: 20, height: 20 }} onClick={() => api.close(t.id)} title="关闭">
                <Icon n="x" s={12} />
              </button>
            </div>
          ))}
        </div>
      </ToastCtx.Provider>
    );
  }
  const useToast = () => React.useContext(ToastCtx);

  /* ---------- 弹层 ---------- */
  function Modal({ title, desc, children, onClose, foot, width, iconTone }) {
    useEffect(() => {
      const h = (e) => e.key === "Escape" && onClose && onClose();
      window.addEventListener("keydown", h);
      return () => window.removeEventListener("keydown", h);
    }, [onClose]);
    return (
      <div className="scrim" onMouseDown={(e) => e.target === e.currentTarget && onClose && onClose()}>
        <div className="modal" style={width ? { width: width } : null} role="dialog" aria-modal="true">
          <div className="modal-head">
            <div className="grow">
              <div style={{ fontSize: 15, fontWeight: 600 }}>{title}</div>
              {desc ? <div className="small muted-3" style={{ marginTop: 3, lineHeight: 1.65 }}>{desc}</div> : null}
            </div>
            <button className="iconbtn" onClick={onClose} title="关闭"><Icon n="x" s={14} /></button>
          </div>
          <div className="modal-body">{children}</div>
          {foot ? <div className="modal-foot">{foot}</div> : <div style={{ height: 4 }} />}
        </div>
      </div>
    );
  }

  function Drawer({ title, sub, onClose, children, foot, width }) {
    useEffect(() => {
      const h = (e) => e.key === "Escape" && onClose && onClose();
      window.addEventListener("keydown", h);
      return () => window.removeEventListener("keydown", h);
    }, [onClose]);
    return (
      <div style={{ position: "fixed", inset: 0, zIndex: 160 }} onMouseDown={(e) => e.target === e.currentTarget && onClose && onClose()}>
        <div className="drawer" style={width ? { width: width } : null}>
          <div className="drawer-head">
            <div className="grow">
              <div style={{ fontSize: 14, fontWeight: 600 }}>{title}</div>
              {sub ? <div className="small muted-3" style={{ marginTop: 2 }}>{sub}</div> : null}
            </div>
            <button className="iconbtn" onClick={onClose} title="关闭"><Icon n="x" s={14} /></button>
          </div>
          <div className="drawer-body">{children}</div>
          {foot ? <div className="drawer-foot">{foot}</div> : null}
        </div>
      </div>
    );
  }

  /* ---------- 数据可视化 ---------- */
  function Sparkline({ data, tone, height = 26 }) {
    const w = 120, h = height;
    const min = Math.min.apply(null, data), max = Math.max.apply(null, data);
    const span = max - min || 1;
    const pts = data.map((v, i) => [(i / (data.length - 1)) * w, h - 2 - ((v - min) / span) * (h - 5)]);
    const d = pts.map((p, i) => (i ? "L" : "M") + r3(p[0]) + " " + r3(p[1])).join(" ");
    const color = tone === "warn" ? "var(--warn)" : tone === "danger" ? "var(--danger)" : "var(--accent)";
    return (
      <svg className="metric-spark" viewBox={"0 0 " + w + " " + h} preserveAspectRatio="none" style={{ width: "100%" }}>
        <path d={d + " L" + w + " " + h + " L0 " + h + " Z"} fill={color} opacity="0.13" />
        <path d={d} fill="none" stroke={color} strokeWidth="1.4" />
        <circle cx={pts[pts.length - 1][0]} cy={pts[pts.length - 1][1]} r="2.2" fill={color} />
      </svg>
    );
  }

  function Delta({ v, dir }) {
    return (
      <span className={cls("delta", dir)}>
        <Icon n={dir === "up" ? "arrowUp" : dir === "down" ? "arrowDown" : "minus"} s={10} sw={2.2} />
        {v}
      </span>
    );
  }

  function MetricCard({ m, onClick }) {
    return (
      <button className="metric" onClick={onClick}>
        <span className="metric-label">
          {m.k}
          <Icon n="arrowRight" s={11} style={{ marginLeft: "auto", color: "var(--text-4)" }} />
        </span>
        <span className="metric-value">
          {m.v}
          {m.u ? <span className="unit">{m.u}</span> : null}
        </span>
        <span className="metric-foot">
          {m.delta ? <Delta v={m.delta} dir={m.tone === "warn" || m.delta === "down" ? "down" : "up"} /> : null}
          {m.foot}
        </span>
        <Sparkline data={m.spark} tone={m.tone} />
      </button>
    );
  }

  function Hist({ data, labels }) {
    const max = Math.max.apply(null, data) || 1;
    return (
      <div>
        <div className="hist">
          {data.map((v, i) => (
            <i key={i} className={v === 0 ? "dim" : ""} style={{ height: Math.max(2, (v / max) * 100) + "%" }} title={v + " 条"} />
          ))}
        </div>
        {labels ? <div className="hist-x">{labels.map((l, i) => <span key={i}>{l}</span>)}</div> : null}
      </div>
    );
  }

  function ConfBand({ conf }) {
    return (
      <div className="confband">
        {conf.map((c, i) => (
          <i key={i} style={{ background: c >= 0.85 ? "var(--ok)" : c >= 0.6 ? "var(--warn)" : "var(--danger)", opacity: 0.85 }} />
        ))}
      </div>
    );
  }

  /* ---------- 数据飞轮闭环（复用：总览看板 / 仿真页） ----------
     把「采集 → 质检 → 预标注 → 建集 → 训练引用 → 难例回流」画成一条
     可读的闭环链路，最后一段回指第一段，强调产出即输入。 ---------- */
  function Flywheel({ stages, loopLabel, onNode }) {
    const list = stages || [];
    const Node = onNode ? "button" : "div";
    return (
      <div className="flywheel">
        <div className="flywheel-track">
          {list.map((s, i) => (
            <React.Fragment key={s.k}>
              <Node
                className={cls("fw-node", s.tone && "t-" + s.tone, onNode && "clickable")}
                type={onNode ? "button" : undefined}
                title={onNode ? "下钻到对应业务页面" : undefined}
                onClick={onNode ? () => onNode(i, s) : undefined}
              >
                <span className="fw-k">{s.k}</span>
                <span className="fw-v mono">{s.v}</span>
                <span className="fw-note">{s.note}</span>
              </Node>
              {i < list.length - 1 ? <Icon n="chevRight" s={13} className="fw-arrow" /> : null}
            </React.Fragment>
          ))}
        </div>
        <div className="flywheel-loop">
          <Icon n="refresh" s={12} />
          <span>{loopLabel || "最后一段回流至第一段：训练侧失败案例回传，转主动采集取数，形成闭环"}</span>
        </div>
      </div>
    );
  }

  /* ---------- 紧凑能力指标（模型侧口径，与业务指标区分） ---------- */
  function AiKpi({ m }) {
    return (
      <div className="aikpi">
        <span className="aikpi-k">{m.k}</span>
        <span className="aikpi-v mono">{m.v}<span className="unit">{m.u}</span></span>
        {m.delta ? <Delta v={m.delta} dir="up" /> : null}
        <span className="aikpi-f">{m.foot}</span>
        <Sparkline data={m.spark} tone={m.tone} height={18} />
      </div>
    );
  }

  /* ---------- 多路播放器 ---------- */
  const VIEWS = [
    { k: "exo", label: "外部机位 · E1", color: "var(--accent)" },
    { k: "ego", label: "头部机位 · Ego", color: "var(--domain-c)" },
    { k: "wrist", label: "腕部机位 · W1", color: "var(--domain-e)" },
    { k: "depth", label: "深度图 · D1", color: "var(--domain-f)" },
    { k: "pcd", label: "点云 · P1", color: "var(--review)" },
  ];

  function MultiView({ views, t, count, main, onMain, overlays, tileH }) {
    const list = views.slice(0, count);
    return (
      <div className={cls("player-grid", "n" + (count === 1 ? 1 : count === 2 ? 2 : 4))}
        style={tileH ? { height: tileH } : { height: count === 1 ? 300 : 330 }}>
        {list.map((v) => (
          <div key={v.k} className={cls("viewtile", main === v.k && "main")} onClick={() => onMain && onMain(v.k)} style={{ cursor: onMain ? "pointer" : "default" }}>
            <SceneFrame view={v.k} t={t} overlays={overlays} />
            <span className="vtlabel">
              <i className="lid" style={{ background: v.color }} />
              {v.label}
            </span>
            <span className="vtbadge">{String(Math.round(t * 372)).padStart(3, "0")}f</span>
          </div>
        ))}
      </div>
    );
  }

  function Transport({ t, playing, onToggle, onSeek, onStep, duration, views, viewCount, onViewCount, main, onMain, extra }) {
    const [vc, setVc] = useState(viewCount || 4);
    useEffect(() => { onViewCount && onViewCount(vc); }, [vc]);
    return (
      <div className="transport">
        <IconBtn n="stepBack" title="上一帧（←）" onClick={() => onStep(-1 / 372)} />
        <IconBtn n={playing ? "pause" : "play"} title={playing ? "暂停（空格）" : "播放（空格）"} onClick={onToggle} />
        <IconBtn n="stepFwd" title="下一帧（→）" onClick={() => onStep(1 / 372)} />
        <span className="tc">{fmtTime(t * 372)} <span className="muted-3">/</span> {fmtTime(372)}</span>
        <span className="muted-3 tiny mono" style={{ marginLeft: 2 }}>帧 {String(Math.round(t * 372)).padStart(3, "0")}</span>
        <input
          className="grow"
          type="range" min="0" max="1000" value={Math.round(t * 1000)}
          onChange={(e) => onSeek(Number(e.target.value) / 1000)}
          style={{ accentColor: "var(--accent)", height: 16, minWidth: 80 }}
          aria-label="播放进度"
        />
        <div className="row-tight" style={{ gap: 3 }}>
          {[1, 2, 4].map((n) => (
            <button key={n} className="btn btn-sm" aria-pressed={vc === n}
              style={vc === n ? { background: "var(--surface-3)", borderColor: "var(--line-strong)" } : null}
              onClick={() => setVc(n)}>{n} 路</button>
          ))}
        </div>
        {extra}
        <span className="muted-3 tiny" style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <Icon n="keyboard" s={12} /> 空格 播放 · ← → 逐帧 · 1–9 切视角
        </span>
      </div>
    );
  }

  function fmtTime(sec) {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    const f = Math.floor((sec % 1) * 30);
    return m + ":" + String(s).padStart(2, "0") + "." + String(f).padStart(2, "0");
  }

  /* ---------- 多轨时间轴 ---------- */
  function Timeline({ tracks, t = 0, onSeek, folded, onFold, notes, machine, selected, onSelect, duration = 372, showRuler = true }) {
    tracks = tracks || [];
    folded = folded || [];
    const laneRef = useRef(null);
    const [drag, setDrag] = useState(null);

    const posFrom = (e) => {
      const r = laneRef.current ? laneRef.current.getBoundingClientRect() : null;
      if (!r) return 0;
      return Math.max(0, Math.min(1, (e.clientX - r.left) / r.width));
    };

    useEffect(() => {
      if (!drag) return;
      const mv = (e) => onSeek && onSeek(posFrom(e));
      const up = () => setDrag(null);
      window.addEventListener("mousemove", mv);
      window.addEventListener("mouseup", up);
      return () => { window.removeEventListener("mousemove", mv); window.removeEventListener("mouseup", up); };
    }, [drag]);

    const marks = [0, 0.25, 0.5, 0.75, 1].map((p) => ({ p: p, label: fmtTime(p * duration).slice(0, 4) }));

    return (
      <div className="timeline">
        <div style={{ display: "grid", gridTemplateColumns: "96px 1fr", gap: 10 }}>
          <div />
          <div className="tl-ruler">
            {marks.map((m, i) => (
              <React.Fragment key={i}>
                <span style={{ left: m.p * 100 + "%" }}>{m.label}</span>
                <i style={{ left: m.p * 100 + "%" }} />
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* 机审旗标行 */}
        {machine && machine.length ? (
          <div className="track">
            <span className="track-label" style={{ color: "var(--warn)" }}>
              <Icon n="warn" s={11} /> 机审标记
            </span>
            <div className="track-lane" style={{ background: "transparent", border: "1px dashed var(--line)" }}>
              {machine.map((m, i) => (
                <span key={i} className={cls("flagmark", m.kind)} style={{ left: m.t * 100 + "%" }} title={m.label + " · " + fmtTime(m.t * duration)} />
              ))}
            </div>
          </div>
        ) : null}

        <div style={{ marginTop: 6 }}>
          {tracks.map((tr) => {
            const isFolded = folded.indexOf(tr.id) >= 0;
            return (
              <div key={tr.id} className={cls("track", isFolded && "folded")}>
                <button className="track-label" onClick={() => onFold && onFold(tr.id)}>
                  <Icon n="chevDown" s={11} className="chev" />
                  <i style={{ width: 6, height: 6, borderRadius: 2, background: tr.color, flex: "0 0 auto" }} />
                  <span className="ellip">{tr.name}</span>
                </button>
                <div
                  className="track-lane"
                  ref={tracks[0] && tr.id === tracks[0].id ? laneRef : null}
                  onMouseDown={(e) => { if (e.target === e.currentTarget) { onSeek && onSeek(posFrom(e)); setDrag(1); } }}
                  style={isFolded ? { opacity: 0.35, height: 8 } : null}
                >
                  {!isFolded &&
                    tr.segs.map((s, i) => {
                      const isSel = selected && selected.track === tr.id && selected.i === i;
                      return (
                        <div
                          key={i}
                          className={cls("seg", tr.id === "action" ? "act" : tr.id === "subtask" ? "sub" : tr.id === "instruction" ? "ins" : "con", s.ghost && "ghost", isSel && "sel")}
                          style={{ left: s.s * 100 + "%", width: (s.e - s.s) * 100 + "%" }}
                          title={s.label + (s.conf != null ? " · 置信度 " + Math.round(s.conf * 100) + "%" : "")}
                          onMouseDown={(e) => { e.stopPropagation(); onSelect && onSelect({ track: tr.id, i: i }); onSeek && onSeek(s.s); }}
                        >
                          <span className="ellip">{s.label}</span>
                          {s.low ? <Icon n="warn" s={10} style={{ marginLeft: 4, flex: "0 0 auto", color: "#ffe6b4" }} /> : null}
                          {isSel ? (
                            <>
                              <span className="handle l" onMouseDown={(e) => e.stopPropagation()} />
                              <span className="handle r" onMouseDown={(e) => e.stopPropagation()} />
                            </>
                          ) : null}
                        </div>
                      );
                    })}
                </div>
              </div>
            );
          })}
        </div>

        {/* 批注轨 */}
        {notes && notes.length ? (
          <div className="track">
            <span className="track-label"><Icon n="message" s={11} /> 质检批注</span>
            <div className="track-lane" style={{ background: "transparent", border: "1px dashed var(--line)" }}>
              {notes.map((n, i) => (
                <span key={i} className={cls("annopin", n.kind)} style={{ left: n.t * 100 + "%" }} title={"第 " + n.frame + " 帧 · " + n.who} />
              ))}
            </div>
          </div>
        ) : null}

        <div style={{ display: "grid", gridTemplateColumns: "96px 1fr", gap: 10, marginTop: 2 }}>
          <div />
          <div style={{ position: "relative", height: 14 }}>
            <span className="playhead" style={{ left: t * 100 + "%", top: -6, bottom: -14 }} />
          </div>
        </div>

        <div className="spread" style={{ marginTop: 10 }}>
          <div className="row" style={{ gap: 12, fontSize: 11, color: "var(--text-3)" }}>
            <span className="row" style={{ gap: 5 }}><i style={{ width: 8, height: 8, background: "var(--domain-c)", borderRadius: 2 }} />动作段</span>
            <span className="row" style={{ gap: 5 }}><i style={{ width: 8, height: 8, background: "var(--accent)", borderRadius: 2 }} />子任务</span>
            <span className="row" style={{ gap: 5 }}><i style={{ width: 8, height: 8, background: "var(--domain-e)", borderRadius: 2 }} />指令</span>
            <span className="row" style={{ gap: 5 }}><i style={{ width: 8, height: 8, background: "var(--warn)", borderRadius: 2 }} />接触事件</span>
            <span className="row" style={{ gap: 5 }}><i style={{ width: 8, height: 8, background: "var(--danger)", borderRadius: 2 }} />机审驳回点</span>
          </div>
          <span className="tiny muted-3">点击轨道空白处定位 · 点击色段选中 · 拖动橙色手柄可调整边界（原型示意）</span>
        </div>
      </div>
    );
  }

  /* ---------- 叠加层开关 ---------- */
  function OverlaySwitch({ value, onChange, items }) {
    const list = items || [
      { k: "box", label: "3D 框" },
      { k: "hand", label: "手部关键点" },
      { k: "contact", label: "接触事件" },
      { k: "force", label: "力曲线" },
    ];
    return (
      <div className="overlay-sw">
        {list.map((it) => (
          <button key={it.k} className={cls("ov", value.indexOf(it.k) >= 0 && "on")}
            onClick={() => onChange(value.indexOf(it.k) >= 0 ? value.filter((x) => x !== it.k) : value.concat([it.k]))}>
            <Icon n="layers" s={11} /> {it.label}
          </button>
        ))}
      </div>
    );
  }

  /* ---------- 面包屑 + 页头 ---------- */
  function PageHead({ crumbs, title, desc, actions, meta }) {
    return (
      <header className="pagehead">
        <div className="grow">
          {crumbs ? (
            <nav className="crumbs">
              {crumbs.map((c, i) => (
                <React.Fragment key={i}>
                  {i ? <span className="sep">/</span> : null}
                  {c.to ? <button onClick={c.to}>{c.label}</button> : <span className="cur">{c.label}</span>}
                </React.Fragment>
              ))}
            </nav>
          ) : null}
          <h1 className="page-title">{title}</h1>
          {desc ? <p className="page-desc pretty">{desc}</p> : null}
          {meta ? <div className="row" style={{ marginTop: 8, gap: 8, flexWrap: "wrap" }}>{meta}</div> : null}
        </div>
        {actions ? <div className="page-actions">{actions}</div> : null}
      </header>
    );
  }

  /* ---------- 定义列表 ---------- */
  function DL({ rows }) {
    if (!rows || !rows.length) return null;
    return (
      <dl className="dl">
        {rows.map((r, i) => (
          <React.Fragment key={i}>
            <dt>{r[0]}</dt>
            <dd>{r[1]}</dd>
          </React.Fragment>
        ))}
      </dl>
    );
  }

  /* ---------- 危险操作确认 ---------- */
  function DangerConfirm({ title, desc, impact, requireText, onCancel, onConfirm, confirmLabel = "确认执行" }) {
    const [v, setV] = useState("");
    const ok = !requireText || v.trim() === requireText;
    return (
      <Modal
        title={title}
        desc={desc}
        onClose={onCancel}
        width={520}
        foot={
          <>
            <Btn tone="ghost" onClick={onCancel}>取消</Btn>
            <Btn tone="danger" disabled={!ok} onClick={onConfirm}>{confirmLabel}</Btn>
          </>
        }
      >
        <div className="warnbox danger">
          此操作不可撤销。请先确认下方影响面，再执行。
        </div>
        {impact ? (
          <div>
            <div className="field-label" style={{ marginBottom: 6 }}>影响面</div>
            <div style={{ border: "1px solid var(--line)", borderRadius: 4, overflow: "hidden" }}>{impact}</div>
          </div>
        ) : null}
        {requireText ? (
          <Field label={`输入对象名称以确认：${requireText}`} req>
            <input className="input mono" value={v} onChange={(e) => setV(e.target.value)} placeholder={requireText} />
          </Field>
        ) : null}
      </Modal>
    );
  }

  window.UI = {
    cls, Tag, Btn, IconBtn, Panel, Field, Switch, Kbd, StateBlock, SkeletonRows,
    ToastHost, useToast, Modal, Drawer, Sparkline, Delta, MetricCard, Hist, ConfBand,
    Flywheel, AiKpi,
    MultiView, Transport, Timeline, OverlaySwitch, PageHead, DL, DangerConfirm,
    VIEWS, fmtTime, useTicker,
  };
})();
