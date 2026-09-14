function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* ============================================================
   设计系统组件 · 所有页面共用
   ============================================================ */
(function () {
  const {
    useState,
    useRef,
    useEffect,
    useMemo,
    useCallback
  } = React;

  /* ---------- 小工具 ---------- */
  const cls = function () {
    return Array.prototype.slice.call(arguments).filter(Boolean).join(" ");
  };
  const r3 = n => Math.round(n * 1000) / 1000;
  function useTicker(duration, playing) {
    const [t, setT] = useState(0.42);
    const raf = useRef(0);
    const last = useRef(0);
    useEffect(() => {
      if (!playing) return;
      last.current = performance.now();
      const loop = now => {
        const dt = (now - last.current) / 1000;
        last.current = now;
        setT(v => {
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
  function Tag({
    tone = "",
    children,
    dot,
    icon,
    className,
    style
  }) {
    return /*#__PURE__*/React.createElement("span", {
      className: cls("tag", tone && "t-" + tone, className),
      style: style
    }, icon ? /*#__PURE__*/React.createElement(Icon, {
      n: icon,
      s: 11
    }) : dot ? /*#__PURE__*/React.createElement("i", {
      className: "tdot"
    }) : null, children);
  }
  function Btn({
    children,
    tone,
    icon,
    iconRight,
    size,
    block,
    className,
    style,
    ...rest
  }) {
    return /*#__PURE__*/React.createElement("button", _extends({
      className: cls("btn", tone && "btn-" + tone, size && "btn-" + size, block && "btn-block", className),
      style: style
    }, rest), icon ? /*#__PURE__*/React.createElement(Icon, {
      n: icon,
      s: 13
    }) : null, children, iconRight ? /*#__PURE__*/React.createElement(Icon, {
      n: iconRight,
      s: 13
    }) : null);
  }
  function IconBtn({
    n,
    s = 15,
    title,
    badge,
    tone,
    ...rest
  }) {
    return /*#__PURE__*/React.createElement("button", _extends({
      className: "iconbtn",
      title: title,
      "aria-label": title
    }, rest), /*#__PURE__*/React.createElement(Icon, {
      n: n,
      s: s
    }), badge ? /*#__PURE__*/React.createElement("span", {
      className: cls("dot", tone)
    }, badge) : null);
  }
  function Panel({
    title,
    sub,
    right,
    children,
    flush,
    foot,
    className,
    bodyClass,
    style
  }) {
    return /*#__PURE__*/React.createElement("section", {
      className: cls("panel", className),
      style: style
    }, title ? /*#__PURE__*/React.createElement("header", {
      className: "panel-head"
    }, /*#__PURE__*/React.createElement("span", {
      className: "panel-title"
    }, title), sub ? /*#__PURE__*/React.createElement("span", {
      className: "panel-sub"
    }, sub) : null, right ? /*#__PURE__*/React.createElement("span", {
      style: {
        marginLeft: "auto",
        display: "flex",
        alignItems: "center",
        gap: 8
      }
    }, right) : null) : null, /*#__PURE__*/React.createElement("div", {
      className: cls("panel-body", flush && "flush", bodyClass)
    }, children), foot ? /*#__PURE__*/React.createElement("footer", {
      className: "panel-foot"
    }, foot) : null);
  }
  function Field({
    label,
    req,
    hint,
    children,
    className
  }) {
    return /*#__PURE__*/React.createElement("div", {
      className: cls("field", className)
    }, label ? /*#__PURE__*/React.createElement("label", {
      className: "field-label"
    }, label, req ? /*#__PURE__*/React.createElement("span", {
      className: "req"
    }, "\xB7") : null, hint ? /*#__PURE__*/React.createElement("span", {
      className: "muted-3 tiny",
      style: {
        marginLeft: "auto",
        fontWeight: 400
      }
    }, hint) : null) : null, children);
  }
  function Switch({
    checked,
    onChange,
    label
  }) {
    return /*#__PURE__*/React.createElement("label", {
      className: "check",
      style: {
        gap: 8
      }
    }, /*#__PURE__*/React.createElement("span", {
      className: "switch"
    }, /*#__PURE__*/React.createElement("input", {
      type: "checkbox",
      checked: checked,
      onChange: e => onChange && onChange(e.target.checked)
    }), /*#__PURE__*/React.createElement("span", {
      className: "knob"
    })), label ? /*#__PURE__*/React.createElement("span", null, label) : null);
  }
  const Kbd = ({
    children
  }) => /*#__PURE__*/React.createElement("kbd", {
    className: "kbd"
  }, children);

  /* ---------- 状态反馈（四态） ---------- */
  function StateBlock({
    kind = "empty",
    title,
    desc,
    action
  }) {
    const map = {
      empty: {
        icon: "layers",
        t: title || "这里暂时没有数据"
      },
      loading: {
        icon: "refresh",
        t: title || "正在加载"
      },
      error: {
        icon: "warn",
        t: title || "加载失败"
      },
      denied: {
        icon: "lock",
        t: title || "无访问权限"
      }
    };
    const m = map[kind] || map.empty;
    return /*#__PURE__*/React.createElement("div", {
      className: "state"
    }, /*#__PURE__*/React.createElement("span", {
      className: "state-ico",
      style: kind === "error" ? {
        color: "var(--danger)",
        borderColor: "color-mix(in srgb,var(--danger) 34%,transparent)"
      } : null
    }, /*#__PURE__*/React.createElement(Icon, {
      n: m.icon,
      s: 17
    })), /*#__PURE__*/React.createElement("span", {
      className: "state-title"
    }, m.t), desc ? /*#__PURE__*/React.createElement("span", {
      className: "state-desc"
    }, desc) : null, action);
  }
  function SkeletonRows({
    n = 5
  }) {
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 8,
        padding: 14
      }
    }, Array.from({
      length: n
    }).map((_, i) => /*#__PURE__*/React.createElement("div", {
      key: i,
      className: "skel",
      style: {
        height: 18,
        width: 100 - i * 7 + "%"
      }
    })));
  }

  /* ---------- 轻提示 ---------- */
  const ToastCtx = React.createContext(null);
  function ToastHost({
    children
  }) {
    const [list, setList] = useState([]);
    const push = useCallback(t => {
      const id = Math.random().toString(36).slice(2);
      setList(v => v.concat([Object.assign({
        id: id
      }, t)]));
      if (t.sticky !== true) setTimeout(() => setList(v => v.filter(x => x.id !== id)), t.ms || 3600);
      return id;
    }, []);
    const api = useMemo(() => ({
      push: push,
      close: id => setList(v => v.filter(x => x.id !== id))
    }), [push]);
    return /*#__PURE__*/React.createElement(ToastCtx.Provider, {
      value: api
    }, children, /*#__PURE__*/React.createElement("div", {
      className: "toasts"
    }, list.map(t => /*#__PURE__*/React.createElement("div", {
      key: t.id,
      className: cls("toast", t.tone || "info")
    }, /*#__PURE__*/React.createElement(Icon, {
      n: t.tone === "danger" ? "danger" : t.tone === "warn" ? "warn" : t.tone === "ok" ? "check" : "info",
      s: 15,
      style: {
        marginTop: 1,
        color: "var(--" + (t.tone === "ok" ? "ok" : t.tone === "danger" ? "danger" : t.tone === "warn" ? "warn" : "accent") + ")",
        flex: "0 0 auto"
      }
    }), /*#__PURE__*/React.createElement("div", {
      className: "grow"
    }, /*#__PURE__*/React.createElement("div", {
      className: "toast-title"
    }, t.title), t.desc ? /*#__PURE__*/React.createElement("div", {
      className: "toast-desc"
    }, t.desc) : null, t.action ? /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 5,
        display: "flex",
        gap: 12
      }
    }, /*#__PURE__*/React.createElement("span", {
      className: "undo",
      onClick: () => {
        t.action.fn();
        api.close(t.id);
      }
    }, t.action.label)) : null), /*#__PURE__*/React.createElement("button", {
      className: "iconbtn",
      style: {
        width: 20,
        height: 20
      },
      onClick: () => api.close(t.id),
      title: "\u5173\u95ED"
    }, /*#__PURE__*/React.createElement(Icon, {
      n: "x",
      s: 12
    }))))));
  }
  const useToast = () => React.useContext(ToastCtx);

  /* ---------- 弹层 ---------- */
  function Modal({
    title,
    desc,
    children,
    onClose,
    foot,
    width,
    iconTone
  }) {
    useEffect(() => {
      const h = e => e.key === "Escape" && onClose && onClose();
      window.addEventListener("keydown", h);
      return () => window.removeEventListener("keydown", h);
    }, [onClose]);
    return /*#__PURE__*/React.createElement("div", {
      className: "scrim",
      onMouseDown: e => e.target === e.currentTarget && onClose && onClose()
    }, /*#__PURE__*/React.createElement("div", {
      className: "modal",
      style: width ? {
        width: width
      } : null,
      role: "dialog",
      "aria-modal": "true"
    }, /*#__PURE__*/React.createElement("div", {
      className: "modal-head"
    }, /*#__PURE__*/React.createElement("div", {
      className: "grow"
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 15,
        fontWeight: 600
      }
    }, title), desc ? /*#__PURE__*/React.createElement("div", {
      className: "small muted-3",
      style: {
        marginTop: 3,
        lineHeight: 1.65
      }
    }, desc) : null), /*#__PURE__*/React.createElement("button", {
      className: "iconbtn",
      onClick: onClose,
      title: "\u5173\u95ED"
    }, /*#__PURE__*/React.createElement(Icon, {
      n: "x",
      s: 14
    }))), /*#__PURE__*/React.createElement("div", {
      className: "modal-body"
    }, children), foot ? /*#__PURE__*/React.createElement("div", {
      className: "modal-foot"
    }, foot) : /*#__PURE__*/React.createElement("div", {
      style: {
        height: 4
      }
    })));
  }
  function Drawer({
    title,
    sub,
    onClose,
    children,
    foot,
    width
  }) {
    useEffect(() => {
      const h = e => e.key === "Escape" && onClose && onClose();
      window.addEventListener("keydown", h);
      return () => window.removeEventListener("keydown", h);
    }, [onClose]);
    return /*#__PURE__*/React.createElement("div", {
      style: {
        position: "fixed",
        inset: 0,
        zIndex: 160
      },
      onMouseDown: e => e.target === e.currentTarget && onClose && onClose()
    }, /*#__PURE__*/React.createElement("div", {
      className: "drawer",
      style: width ? {
        width: width
      } : null
    }, /*#__PURE__*/React.createElement("div", {
      className: "drawer-head"
    }, /*#__PURE__*/React.createElement("div", {
      className: "grow"
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 14,
        fontWeight: 600
      }
    }, title), sub ? /*#__PURE__*/React.createElement("div", {
      className: "small muted-3",
      style: {
        marginTop: 2
      }
    }, sub) : null), /*#__PURE__*/React.createElement("button", {
      className: "iconbtn",
      onClick: onClose,
      title: "\u5173\u95ED"
    }, /*#__PURE__*/React.createElement(Icon, {
      n: "x",
      s: 14
    }))), /*#__PURE__*/React.createElement("div", {
      className: "drawer-body"
    }, children), foot ? /*#__PURE__*/React.createElement("div", {
      className: "drawer-foot"
    }, foot) : null));
  }

  /* ---------- 数据可视化 ---------- */
  function Sparkline({
    data,
    tone,
    height = 26
  }) {
    const w = 120,
      h = height;
    const min = Math.min.apply(null, data),
      max = Math.max.apply(null, data);
    const span = max - min || 1;
    const pts = data.map((v, i) => [i / (data.length - 1) * w, h - 2 - (v - min) / span * (h - 5)]);
    const d = pts.map((p, i) => (i ? "L" : "M") + r3(p[0]) + " " + r3(p[1])).join(" ");
    const color = tone === "warn" ? "var(--warn)" : tone === "danger" ? "var(--danger)" : "var(--accent)";
    return /*#__PURE__*/React.createElement("svg", {
      className: "metric-spark",
      viewBox: "0 0 " + w + " " + h,
      preserveAspectRatio: "none",
      style: {
        width: "100%"
      }
    }, /*#__PURE__*/React.createElement("path", {
      d: d + " L" + w + " " + h + " L0 " + h + " Z",
      fill: color,
      opacity: "0.13"
    }), /*#__PURE__*/React.createElement("path", {
      d: d,
      fill: "none",
      stroke: color,
      strokeWidth: "1.4"
    }), /*#__PURE__*/React.createElement("circle", {
      cx: pts[pts.length - 1][0],
      cy: pts[pts.length - 1][1],
      r: "2.2",
      fill: color
    }));
  }
  function Delta({
    v,
    dir
  }) {
    return /*#__PURE__*/React.createElement("span", {
      className: cls("delta", dir)
    }, /*#__PURE__*/React.createElement(Icon, {
      n: dir === "up" ? "arrowUp" : dir === "down" ? "arrowDown" : "minus",
      s: 10,
      sw: 2.2
    }), v);
  }
  function MetricCard({
    m,
    onClick
  }) {
    return /*#__PURE__*/React.createElement("button", {
      className: "metric",
      onClick: onClick
    }, /*#__PURE__*/React.createElement("span", {
      className: "metric-label"
    }, m.k, /*#__PURE__*/React.createElement(Icon, {
      n: "arrowRight",
      s: 11,
      style: {
        marginLeft: "auto",
        color: "var(--text-4)"
      }
    })), /*#__PURE__*/React.createElement("span", {
      className: "metric-value"
    }, m.v, m.u ? /*#__PURE__*/React.createElement("span", {
      className: "unit"
    }, m.u) : null), /*#__PURE__*/React.createElement("span", {
      className: "metric-foot"
    }, m.delta ? /*#__PURE__*/React.createElement(Delta, {
      v: m.delta,
      dir: m.tone === "warn" || m.delta === "down" ? "down" : "up"
    }) : null, m.foot), /*#__PURE__*/React.createElement(Sparkline, {
      data: m.spark,
      tone: m.tone
    }));
  }
  function Hist({
    data,
    labels
  }) {
    const max = Math.max.apply(null, data) || 1;
    return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      className: "hist"
    }, data.map((v, i) => /*#__PURE__*/React.createElement("i", {
      key: i,
      className: v === 0 ? "dim" : "",
      style: {
        height: Math.max(2, v / max * 100) + "%"
      },
      title: v + " 条"
    }))), labels ? /*#__PURE__*/React.createElement("div", {
      className: "hist-x"
    }, labels.map((l, i) => /*#__PURE__*/React.createElement("span", {
      key: i
    }, l))) : null);
  }
  function ConfBand({
    conf
  }) {
    return /*#__PURE__*/React.createElement("div", {
      className: "confband"
    }, conf.map((c, i) => /*#__PURE__*/React.createElement("i", {
      key: i,
      style: {
        background: c >= 0.85 ? "var(--ok)" : c >= 0.6 ? "var(--warn)" : "var(--danger)",
        opacity: 0.85
      }
    })));
  }

  /* ---------- 数据飞轮闭环（复用：总览看板 / 仿真页） ----------
     把「采集 → 质检 → 预标注 → 建集 → 训练引用 → 难例回流」画成一条
     可读的闭环链路，最后一段回指第一段，强调产出即输入。 ---------- */
  function Flywheel({
    stages,
    loopLabel,
    onNode
  }) {
    const list = stages || [];
    const Node = onNode ? "button" : "div";
    return /*#__PURE__*/React.createElement("div", {
      className: "flywheel"
    }, /*#__PURE__*/React.createElement("div", {
      className: "flywheel-track"
    }, list.map((s, i) => /*#__PURE__*/React.createElement(React.Fragment, {
      key: s.k
    }, /*#__PURE__*/React.createElement(Node, {
      className: cls("fw-node", s.tone && "t-" + s.tone, onNode && "clickable"),
      type: onNode ? "button" : undefined,
      title: onNode ? "下钻到对应业务页面" : undefined,
      onClick: onNode ? () => onNode(i, s) : undefined
    }, /*#__PURE__*/React.createElement("span", {
      className: "fw-k"
    }, s.k), /*#__PURE__*/React.createElement("span", {
      className: "fw-v mono"
    }, s.v), /*#__PURE__*/React.createElement("span", {
      className: "fw-note"
    }, s.note)), i < list.length - 1 ? /*#__PURE__*/React.createElement(Icon, {
      n: "chevRight",
      s: 13,
      className: "fw-arrow"
    }) : null))), /*#__PURE__*/React.createElement("div", {
      className: "flywheel-loop"
    }, /*#__PURE__*/React.createElement(Icon, {
      n: "refresh",
      s: 12
    }), /*#__PURE__*/React.createElement("span", null, loopLabel || "最后一段回流至第一段：训练侧失败案例回传，转主动采集取数，形成闭环")));
  }

  /* ---------- 紧凑能力指标（模型侧口径，与业务指标区分） ---------- */
  function AiKpi({
    m
  }) {
    return /*#__PURE__*/React.createElement("div", {
      className: "aikpi"
    }, /*#__PURE__*/React.createElement("span", {
      className: "aikpi-k"
    }, m.k), /*#__PURE__*/React.createElement("span", {
      className: "aikpi-v mono"
    }, m.v, /*#__PURE__*/React.createElement("span", {
      className: "unit"
    }, m.u)), m.delta ? /*#__PURE__*/React.createElement(Delta, {
      v: m.delta,
      dir: "up"
    }) : null, /*#__PURE__*/React.createElement("span", {
      className: "aikpi-f"
    }, m.foot), /*#__PURE__*/React.createElement(Sparkline, {
      data: m.spark,
      tone: m.tone,
      height: 18
    }));
  }

  /* ---------- 多路播放器 ---------- */
  const VIEWS = [{
    k: "exo",
    label: "外部机位 · E1",
    color: "var(--accent)"
  }, {
    k: "ego",
    label: "头部机位 · Ego",
    color: "var(--domain-c)"
  }, {
    k: "wrist",
    label: "腕部机位 · W1",
    color: "var(--domain-e)"
  }, {
    k: "depth",
    label: "深度图 · D1",
    color: "var(--domain-f)"
  }, {
    k: "pcd",
    label: "点云 · P1",
    color: "var(--review)"
  }];
  function MultiView({
    views,
    t,
    count,
    main,
    onMain,
    overlays,
    tileH
  }) {
    const list = views.slice(0, count);
    return /*#__PURE__*/React.createElement("div", {
      className: cls("player-grid", "n" + (count === 1 ? 1 : count === 2 ? 2 : 4)),
      style: tileH ? {
        height: tileH
      } : {
        height: count === 1 ? 300 : 330
      }
    }, list.map(v => /*#__PURE__*/React.createElement("div", {
      key: v.k,
      className: cls("viewtile", main === v.k && "main"),
      onClick: () => onMain && onMain(v.k),
      style: {
        cursor: onMain ? "pointer" : "default"
      }
    }, /*#__PURE__*/React.createElement(SceneFrame, {
      view: v.k,
      t: t,
      overlays: overlays
    }), /*#__PURE__*/React.createElement("span", {
      className: "vtlabel"
    }, /*#__PURE__*/React.createElement("i", {
      className: "lid",
      style: {
        background: v.color
      }
    }), v.label), /*#__PURE__*/React.createElement("span", {
      className: "vtbadge"
    }, String(Math.round(t * 372)).padStart(3, "0"), "f"))));
  }
  function Transport({
    t,
    playing,
    onToggle,
    onSeek,
    onStep,
    duration,
    views,
    viewCount,
    onViewCount,
    main,
    onMain,
    extra
  }) {
    const [vc, setVc] = useState(viewCount || 4);
    useEffect(() => {
      onViewCount && onViewCount(vc);
    }, [vc]);
    return /*#__PURE__*/React.createElement("div", {
      className: "transport"
    }, /*#__PURE__*/React.createElement(IconBtn, {
      n: "stepBack",
      title: "\u4E0A\u4E00\u5E27\uFF08\u2190\uFF09",
      onClick: () => onStep(-1 / 372)
    }), /*#__PURE__*/React.createElement(IconBtn, {
      n: playing ? "pause" : "play",
      title: playing ? "暂停（空格）" : "播放（空格）",
      onClick: onToggle
    }), /*#__PURE__*/React.createElement(IconBtn, {
      n: "stepFwd",
      title: "\u4E0B\u4E00\u5E27\uFF08\u2192\uFF09",
      onClick: () => onStep(1 / 372)
    }), /*#__PURE__*/React.createElement("span", {
      className: "tc"
    }, fmtTime(t * 372), " ", /*#__PURE__*/React.createElement("span", {
      className: "muted-3"
    }, "/"), " ", fmtTime(372)), /*#__PURE__*/React.createElement("span", {
      className: "muted-3 tiny mono",
      style: {
        marginLeft: 2
      }
    }, "\u5E27 ", String(Math.round(t * 372)).padStart(3, "0")), /*#__PURE__*/React.createElement("input", {
      className: "grow",
      type: "range",
      min: "0",
      max: "1000",
      value: Math.round(t * 1000),
      onChange: e => onSeek(Number(e.target.value) / 1000),
      style: {
        accentColor: "var(--accent)",
        height: 16,
        minWidth: 80
      },
      "aria-label": "\u64AD\u653E\u8FDB\u5EA6"
    }), /*#__PURE__*/React.createElement("div", {
      className: "row-tight",
      style: {
        gap: 3
      }
    }, [1, 2, 4].map(n => /*#__PURE__*/React.createElement("button", {
      key: n,
      className: "btn btn-sm",
      "aria-pressed": vc === n,
      style: vc === n ? {
        background: "var(--surface-3)",
        borderColor: "var(--line-strong)"
      } : null,
      onClick: () => setVc(n)
    }, n, " \u8DEF"))), extra, /*#__PURE__*/React.createElement("span", {
      className: "muted-3 tiny",
      style: {
        display: "flex",
        alignItems: "center",
        gap: 5
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      n: "keyboard",
      s: 12
    }), " \u7A7A\u683C \u64AD\u653E \xB7 \u2190 \u2192 \u9010\u5E27 \xB7 1\u20139 \u5207\u89C6\u89D2"));
  }
  function fmtTime(sec) {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    const f = Math.floor(sec % 1 * 30);
    return m + ":" + String(s).padStart(2, "0") + "." + String(f).padStart(2, "0");
  }

  /* ---------- 多轨时间轴 ---------- */
  function Timeline({
    tracks,
    t = 0,
    onSeek,
    folded,
    onFold,
    notes,
    machine,
    selected,
    onSelect,
    duration = 372,
    showRuler = true
  }) {
    tracks = tracks || [];
    folded = folded || [];
    const laneRef = useRef(null);
    const [drag, setDrag] = useState(null);
    const posFrom = e => {
      const r = laneRef.current ? laneRef.current.getBoundingClientRect() : null;
      if (!r) return 0;
      return Math.max(0, Math.min(1, (e.clientX - r.left) / r.width));
    };
    useEffect(() => {
      if (!drag) return;
      const mv = e => onSeek && onSeek(posFrom(e));
      const up = () => setDrag(null);
      window.addEventListener("mousemove", mv);
      window.addEventListener("mouseup", up);
      return () => {
        window.removeEventListener("mousemove", mv);
        window.removeEventListener("mouseup", up);
      };
    }, [drag]);
    const marks = [0, 0.25, 0.5, 0.75, 1].map(p => ({
      p: p,
      label: fmtTime(p * duration).slice(0, 4)
    }));
    return /*#__PURE__*/React.createElement("div", {
      className: "timeline"
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gridTemplateColumns: "96px 1fr",
        gap: 10
      }
    }, /*#__PURE__*/React.createElement("div", null), /*#__PURE__*/React.createElement("div", {
      className: "tl-ruler"
    }, marks.map((m, i) => /*#__PURE__*/React.createElement(React.Fragment, {
      key: i
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        left: m.p * 100 + "%"
      }
    }, m.label), /*#__PURE__*/React.createElement("i", {
      style: {
        left: m.p * 100 + "%"
      }
    }))))), machine && machine.length ? /*#__PURE__*/React.createElement("div", {
      className: "track"
    }, /*#__PURE__*/React.createElement("span", {
      className: "track-label",
      style: {
        color: "var(--warn)"
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      n: "warn",
      s: 11
    }), " \u673A\u5BA1\u6807\u8BB0"), /*#__PURE__*/React.createElement("div", {
      className: "track-lane",
      style: {
        background: "transparent",
        border: "1px dashed var(--line)"
      }
    }, machine.map((m, i) => /*#__PURE__*/React.createElement("span", {
      key: i,
      className: cls("flagmark", m.kind),
      style: {
        left: m.t * 100 + "%"
      },
      title: m.label + " · " + fmtTime(m.t * duration)
    })))) : null, /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 6
      }
    }, tracks.map(tr => {
      const isFolded = folded.indexOf(tr.id) >= 0;
      return /*#__PURE__*/React.createElement("div", {
        key: tr.id,
        className: cls("track", isFolded && "folded")
      }, /*#__PURE__*/React.createElement("button", {
        className: "track-label",
        onClick: () => onFold && onFold(tr.id)
      }, /*#__PURE__*/React.createElement(Icon, {
        n: "chevDown",
        s: 11,
        className: "chev"
      }), /*#__PURE__*/React.createElement("i", {
        style: {
          width: 6,
          height: 6,
          borderRadius: 2,
          background: tr.color,
          flex: "0 0 auto"
        }
      }), /*#__PURE__*/React.createElement("span", {
        className: "ellip"
      }, tr.name)), /*#__PURE__*/React.createElement("div", {
        className: "track-lane",
        ref: tracks[0] && tr.id === tracks[0].id ? laneRef : null,
        onMouseDown: e => {
          if (e.target === e.currentTarget) {
            onSeek && onSeek(posFrom(e));
            setDrag(1);
          }
        },
        style: isFolded ? {
          opacity: 0.35,
          height: 8
        } : null
      }, !isFolded && tr.segs.map((s, i) => {
        const isSel = selected && selected.track === tr.id && selected.i === i;
        return /*#__PURE__*/React.createElement("div", {
          key: i,
          className: cls("seg", tr.id === "action" ? "act" : tr.id === "subtask" ? "sub" : tr.id === "instruction" ? "ins" : "con", s.ghost && "ghost", isSel && "sel"),
          style: {
            left: s.s * 100 + "%",
            width: (s.e - s.s) * 100 + "%"
          },
          title: s.label + (s.conf != null ? " · 置信度 " + Math.round(s.conf * 100) + "%" : ""),
          onMouseDown: e => {
            e.stopPropagation();
            onSelect && onSelect({
              track: tr.id,
              i: i
            });
            onSeek && onSeek(s.s);
          }
        }, /*#__PURE__*/React.createElement("span", {
          className: "ellip"
        }, s.label), s.low ? /*#__PURE__*/React.createElement(Icon, {
          n: "warn",
          s: 10,
          style: {
            marginLeft: 4,
            flex: "0 0 auto",
            color: "#ffe6b4"
          }
        }) : null, isSel ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("span", {
          className: "handle l",
          onMouseDown: e => e.stopPropagation()
        }), /*#__PURE__*/React.createElement("span", {
          className: "handle r",
          onMouseDown: e => e.stopPropagation()
        })) : null);
      })));
    })), notes && notes.length ? /*#__PURE__*/React.createElement("div", {
      className: "track"
    }, /*#__PURE__*/React.createElement("span", {
      className: "track-label"
    }, /*#__PURE__*/React.createElement(Icon, {
      n: "message",
      s: 11
    }), " \u8D28\u68C0\u6279\u6CE8"), /*#__PURE__*/React.createElement("div", {
      className: "track-lane",
      style: {
        background: "transparent",
        border: "1px dashed var(--line)"
      }
    }, notes.map((n, i) => /*#__PURE__*/React.createElement("span", {
      key: i,
      className: cls("annopin", n.kind),
      style: {
        left: n.t * 100 + "%"
      },
      title: "第 " + n.frame + " 帧 · " + n.who
    })))) : null, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gridTemplateColumns: "96px 1fr",
        gap: 10,
        marginTop: 2
      }
    }, /*#__PURE__*/React.createElement("div", null), /*#__PURE__*/React.createElement("div", {
      style: {
        position: "relative",
        height: 14
      }
    }, /*#__PURE__*/React.createElement("span", {
      className: "playhead",
      style: {
        left: t * 100 + "%",
        top: -6,
        bottom: -14
      }
    }))), /*#__PURE__*/React.createElement("div", {
      className: "spread",
      style: {
        marginTop: 10
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "row",
      style: {
        gap: 12,
        fontSize: 11,
        color: "var(--text-3)"
      }
    }, /*#__PURE__*/React.createElement("span", {
      className: "row",
      style: {
        gap: 5
      }
    }, /*#__PURE__*/React.createElement("i", {
      style: {
        width: 8,
        height: 8,
        background: "var(--domain-c)",
        borderRadius: 2
      }
    }), "\u52A8\u4F5C\u6BB5"), /*#__PURE__*/React.createElement("span", {
      className: "row",
      style: {
        gap: 5
      }
    }, /*#__PURE__*/React.createElement("i", {
      style: {
        width: 8,
        height: 8,
        background: "var(--accent)",
        borderRadius: 2
      }
    }), "\u5B50\u4EFB\u52A1"), /*#__PURE__*/React.createElement("span", {
      className: "row",
      style: {
        gap: 5
      }
    }, /*#__PURE__*/React.createElement("i", {
      style: {
        width: 8,
        height: 8,
        background: "var(--domain-e)",
        borderRadius: 2
      }
    }), "\u6307\u4EE4"), /*#__PURE__*/React.createElement("span", {
      className: "row",
      style: {
        gap: 5
      }
    }, /*#__PURE__*/React.createElement("i", {
      style: {
        width: 8,
        height: 8,
        background: "var(--warn)",
        borderRadius: 2
      }
    }), "\u63A5\u89E6\u4E8B\u4EF6"), /*#__PURE__*/React.createElement("span", {
      className: "row",
      style: {
        gap: 5
      }
    }, /*#__PURE__*/React.createElement("i", {
      style: {
        width: 8,
        height: 8,
        background: "var(--danger)",
        borderRadius: 2
      }
    }), "\u673A\u5BA1\u9A73\u56DE\u70B9")), /*#__PURE__*/React.createElement("span", {
      className: "tiny muted-3"
    }, "\u70B9\u51FB\u8F68\u9053\u7A7A\u767D\u5904\u5B9A\u4F4D \xB7 \u70B9\u51FB\u8272\u6BB5\u9009\u4E2D \xB7 \u62D6\u52A8\u6A59\u8272\u624B\u67C4\u53EF\u8C03\u6574\u8FB9\u754C\uFF08\u539F\u578B\u793A\u610F\uFF09")));
  }

  /* ---------- 叠加层开关 ---------- */
  function OverlaySwitch({
    value,
    onChange,
    items
  }) {
    const list = items || [{
      k: "box",
      label: "3D 框"
    }, {
      k: "hand",
      label: "手部关键点"
    }, {
      k: "contact",
      label: "接触事件"
    }, {
      k: "force",
      label: "力曲线"
    }];
    return /*#__PURE__*/React.createElement("div", {
      className: "overlay-sw"
    }, list.map(it => /*#__PURE__*/React.createElement("button", {
      key: it.k,
      className: cls("ov", value.indexOf(it.k) >= 0 && "on"),
      onClick: () => onChange(value.indexOf(it.k) >= 0 ? value.filter(x => x !== it.k) : value.concat([it.k]))
    }, /*#__PURE__*/React.createElement(Icon, {
      n: "layers",
      s: 11
    }), " ", it.label)));
  }

  /* ---------- 面包屑 + 页头 ---------- */
  function PageHead({
    crumbs,
    title,
    desc,
    actions,
    meta
  }) {
    return /*#__PURE__*/React.createElement("header", {
      className: "pagehead"
    }, /*#__PURE__*/React.createElement("div", {
      className: "grow"
    }, crumbs ? /*#__PURE__*/React.createElement("nav", {
      className: "crumbs"
    }, crumbs.map((c, i) => /*#__PURE__*/React.createElement(React.Fragment, {
      key: i
    }, i ? /*#__PURE__*/React.createElement("span", {
      className: "sep"
    }, "/") : null, c.to ? /*#__PURE__*/React.createElement("button", {
      onClick: c.to
    }, c.label) : /*#__PURE__*/React.createElement("span", {
      className: "cur"
    }, c.label)))) : null, /*#__PURE__*/React.createElement("h1", {
      className: "page-title"
    }, title), desc ? /*#__PURE__*/React.createElement("p", {
      className: "page-desc pretty"
    }, desc) : null, meta ? /*#__PURE__*/React.createElement("div", {
      className: "row",
      style: {
        marginTop: 8,
        gap: 8,
        flexWrap: "wrap"
      }
    }, meta) : null), actions ? /*#__PURE__*/React.createElement("div", {
      className: "page-actions"
    }, actions) : null);
  }

  /* ---------- 定义列表 ---------- */
  function DL({
    rows
  }) {
    if (!rows || !rows.length) return null;
    return /*#__PURE__*/React.createElement("dl", {
      className: "dl"
    }, rows.map((r, i) => /*#__PURE__*/React.createElement(React.Fragment, {
      key: i
    }, /*#__PURE__*/React.createElement("dt", null, r[0]), /*#__PURE__*/React.createElement("dd", null, r[1]))));
  }

  /* ---------- 危险操作确认 ---------- */
  function DangerConfirm({
    title,
    desc,
    impact,
    requireText,
    onCancel,
    onConfirm,
    confirmLabel = "确认执行"
  }) {
    const [v, setV] = useState("");
    const ok = !requireText || v.trim() === requireText;
    return /*#__PURE__*/React.createElement(Modal, {
      title: title,
      desc: desc,
      onClose: onCancel,
      width: 520,
      foot: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Btn, {
        tone: "ghost",
        onClick: onCancel
      }, "\u53D6\u6D88"), /*#__PURE__*/React.createElement(Btn, {
        tone: "danger",
        disabled: !ok,
        onClick: onConfirm
      }, confirmLabel))
    }, /*#__PURE__*/React.createElement("div", {
      className: "warnbox danger"
    }, "\u6B64\u64CD\u4F5C\u4E0D\u53EF\u64A4\u9500\u3002\u8BF7\u5148\u786E\u8BA4\u4E0B\u65B9\u5F71\u54CD\u9762\uFF0C\u518D\u6267\u884C\u3002"), impact ? /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      className: "field-label",
      style: {
        marginBottom: 6
      }
    }, "\u5F71\u54CD\u9762"), /*#__PURE__*/React.createElement("div", {
      style: {
        border: "1px solid var(--line)",
        borderRadius: 4,
        overflow: "hidden"
      }
    }, impact)) : null, requireText ? /*#__PURE__*/React.createElement(Field, {
      label: `输入对象名称以确认：${requireText}`,
      req: true
    }, /*#__PURE__*/React.createElement("input", {
      className: "input mono",
      value: v,
      onChange: e => setV(e.target.value),
      placeholder: requireText
    })) : null);
  }
  window.UI = {
    cls,
    Tag,
    Btn,
    IconBtn,
    Panel,
    Field,
    Switch,
    Kbd,
    StateBlock,
    SkeletonRows,
    ToastHost,
    useToast,
    Modal,
    Drawer,
    Sparkline,
    Delta,
    MetricCard,
    Hist,
    ConfBand,
    Flywheel,
    AiKpi,
    MultiView,
    Transport,
    Timeline,
    OverlaySwitch,
    PageHead,
    DL,
    DangerConfirm,
    VIEWS,
    fmtTime,
    useTicker
  };
})();