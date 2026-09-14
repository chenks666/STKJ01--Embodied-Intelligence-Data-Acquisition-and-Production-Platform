/* ============================================================
   平台端页面 B：质检台 / 规则配置 / 标注 / 配方 / 快照 / 交付 / 其余域
   ============================================================ */
(function () {
  const {
    useState,
    useMemo,
    useEffect,
    useRef
  } = React;
  const {
    Tag,
    Btn,
    IconBtn,
    Panel,
    Field,
    Switch,
    StateBlock,
    Modal,
    Drawer,
    DangerConfirm,
    Hist,
    ConfBand,
    MultiView,
    Transport,
    Timeline,
    OverlaySwitch,
    PageHead,
    DL,
    Kbd,
    VIEWS,
    fmtTime,
    useTicker,
    cls
  } = window.UI;
  const D = window.DATA;

  /* ============================================================
     质检待办队列（源：7.4 左栏）
     ============================================================ */
  const RISK_LABEL = {
    high: "高风险",
    mid: "中",
    low: "低"
  };
  function QCQueue({
    app,
    set,
    compact
  }) {
    const [flt, setFlt] = useState("全部");
    // 从总览热力图下钻时带入采集员筛选，让「跳转」真的落在同一上下文
    const [emp, setEmp] = useState(app.payload && app.payload.emp || "全部");
    const rows = D.QC_QUEUE.filter(r => flt === "全部" ? true : flt === "高风险" ? r.risk === "high" : r.done ? true : !r.done).filter(r => emp === "全部" ? true : r.emp === emp);
    const pending = D.QC_QUEUE.filter(r => !r.done).length;
    const body = /*#__PURE__*/React.createElement("div", {
      className: "wb-body"
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        padding: "9px 12px",
        borderBottom: "1px solid var(--line-soft)",
        display: "flex",
        flexDirection: "column",
        gap: 7
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "spread"
    }, /*#__PURE__*/React.createElement("span", {
      className: "tiny muted-3"
    }, "\u5F85\u529E ", /*#__PURE__*/React.createElement("b", {
      className: "mono",
      style: {
        color: "var(--danger)"
      }
    }, pending), " \u6761 \xB7 \u9884\u8BA1\u8017\u65F6 2 \u5C0F\u65F6 40 \u5206"), /*#__PURE__*/React.createElement(IconBtn, {
      n: "filter",
      s: 13,
      title: "\u7B5B\u9009"
    })), /*#__PURE__*/React.createElement("div", {
      className: "row-tight",
      style: {
        gap: 3
      }
    }, ["全部", "高风险", "未判定"].map(f => /*#__PURE__*/React.createElement("button", {
      key: f,
      className: "btn btn-sm",
      "aria-pressed": flt === f,
      style: flt === f ? {
        background: "var(--surface-3)",
        borderColor: "var(--line-strong)"
      } : null,
      onClick: () => setFlt(f)
    }, f)), /*#__PURE__*/React.createElement("select", {
      className: "select",
      style: {
        height: 25,
        width: 96,
        marginLeft: "auto",
        fontSize: 11
      },
      value: emp,
      onChange: e => setEmp(e.target.value)
    }, ["全部", "采集员 A", "采集员 B", "采集员 C", "现场督导"].map(e => /*#__PURE__*/React.createElement("option", {
      key: e
    }, e))))), rows.map(r => /*#__PURE__*/React.createElement("button", {
      key: r.id,
      className: cls("listitem", app.qcId === r.id && "active"),
      onClick: () => set({
        qcId: r.id
      })
    }, /*#__PURE__*/React.createElement("div", {
      className: "spread"
    }, /*#__PURE__*/React.createElement("span", {
      className: "mono small"
    }, r.id), /*#__PURE__*/React.createElement(Tag, {
      tone: r.risk === "high" ? "danger" : r.risk === "mid" ? "warn" : "quiet",
      dot: true
    }, RISK_LABEL[r.risk])), /*#__PURE__*/React.createElement("div", {
      className: "tiny muted-3",
      style: {
        marginTop: 4
      }
    }, r.task, " \xB7 ", r.scene, " \xB7 ", r.emp), /*#__PURE__*/React.createElement("div", {
      className: "row",
      style: {
        marginTop: 6,
        gap: 10
      }
    }, /*#__PURE__*/React.createElement("span", {
      className: "tiny muted-3 mono"
    }, /*#__PURE__*/React.createElement(Icon, {
      n: "clock",
      s: 10
    }), " ", r.dur), r.machine.length ? /*#__PURE__*/React.createElement("span", {
      className: "tiny",
      style: {
        color: "var(--warn)"
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      n: "warn",
      s: 10
    }), " \u673A\u5BA1 ", r.machine.length, " \u5904") : /*#__PURE__*/React.createElement("span", {
      className: "tiny",
      style: {
        color: "var(--ok)"
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      n: "check",
      s: 10
    }), " \u673A\u5BA1\u901A\u8FC7"), r.done ? /*#__PURE__*/React.createElement("span", {
      className: "tiny",
      style: {
        color: "var(--ok)",
        marginLeft: "auto"
      }
    }, "\u5DF2\u5224\u5B9A ", r.score, " \u5206") : null))), /*#__PURE__*/React.createElement("div", {
      style: {
        padding: 12
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "warnbox info",
      style: {
        fontSize: 11,
        lineHeight: 1.65
      }
    }, "\u6309\u98CE\u9669\u4E0E\u5BA2\u6237\u4F18\u5148\u7EA7\u6392\u5E8F\uFF0C\u800C\u975E\u6309\u65F6\u95F4\u3002\u4F4E\u7F6E\u4FE1\u4E0E\u673A\u5BA1\u547D\u4E2D\u591A\u7684\u6761\u76EE\u81EA\u52A8\u6392\u5728\u961F\u5217\u524D\u9762\uFF0C\u628A\u4EBA\u7684\u6CE8\u610F\u529B\u82B1\u5728\u6700\u53EF\u80FD\u51FA\u9519\u7684\u5730\u65B9\u3002")));
    if (compact) return body;
    return /*#__PURE__*/React.createElement("div", {
      className: "wb-col"
    }, /*#__PURE__*/React.createElement("div", {
      className: "wb-head"
    }, /*#__PURE__*/React.createElement("span", {
      className: "small",
      style: {
        fontWeight: 600
      }
    }, "\u5F85\u529E\u961F\u5217"), /*#__PURE__*/React.createElement("span", {
      className: "grow"
    }), /*#__PURE__*/React.createElement(Tag, {
      tone: "danger",
      dot: true
    }, pending)), body);
  }

  /* ============================================================
     质检台（源：7.4）
     ============================================================ */
  function QCConsole({
    app,
    set
  }) {
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
    const row = D.QC_QUEUE.filter(r => r.id === cur)[0] || D.QC_QUEUE[0];
    const canReject = codes.length > 0 && codes.length <= 3 && evid.length > 0;
    const canPass = score != null;

    /* 全键盘：一轮判定不碰鼠标 */
    useEffect(() => {
      const h = e => {
        const tag = (e.target.tagName || "").toLowerCase();
        if (tag === "input" || tag === "textarea" || tag === "select") return;
        if (e.key >= "1" && e.key <= "5") {
          setScore(Number(e.key));
          e.preventDefault();
        } else if (e.key === " ") {
          setPlaying(p => !p);
          e.preventDefault();
        } else if (e.key === "ArrowLeft") {
          setT(v => Math.max(0, v - 1 / 372));
          e.preventDefault();
        } else if (e.key === "ArrowRight") {
          setT(v => Math.min(1, v + 1 / 372));
          e.preventDefault();
        } else if (e.key.toLowerCase() === "r") {
          if (canReject) doReject();else toast.push({
            tone: "warn",
            title: "驳回被拦住",
            desc: "驳回必须附原因码与至少一条证据" + (codes.length === 0 ? "；当前未选原因码。" : codes.length > 3 ? "；原因码最多 3 个，当前 " + codes.length + " 个。" : "；当前缺证据，按 M 在播放位置打一条。")
          });
          e.preventDefault();
        } else if (e.key.toLowerCase() === "a") {
          if (canPass) doPass();else toast.push({
            tone: "warn",
            title: "通过被拦住",
            desc: "通过前必须先给质量分，按 1–5 打分。"
          });
          e.preventDefault();
        } else if (e.key.toLowerCase() === "m") {
          addEvidence();
        } else if (e.key === "Enter" && e.shiftKey) {
          next();
        } else if (["6", "7", "8", "9"].indexOf(e.key) >= 0) {
          const i = Number(e.key) - 6;
          if (VIEWS[i]) setMain(VIEWS[i].k);
        }
      };
      window.addEventListener("keydown", h);
      return () => window.removeEventListener("keydown", h);
    }, [canReject, canPass, codes, evid, score]);
    const addEvidence = () => {
      const f = Math.round(t * 372);
      setEvid(v => v.concat([{
        t: t,
        frame: f
      }]));
      toast.push({
        tone: "info",
        title: "已添加证据",
        desc: "时间码 " + fmtTime(t * 372) + " · 第 " + f + " 帧。"
      });
    };
    const next = () => {
      const idx = D.QC_QUEUE.findIndex(r => r.id === cur);
      const nx = D.QC_QUEUE[(idx + 1) % D.QC_QUEUE.length];
      setCur(nx.id);
      set({
        qcId: nx.id
      });
      setScore(null);
      setCodes([]);
      setEvid([]);
      setNote("");
      setT(0.42);
    };
    const doReject = () => {
      toast.push({
        tone: "danger",
        title: "已驳回并生成重采任务",
        desc: "原因码 " + codes.map(c => c.code).join(" / ") + "，证据 " + evid.length + " 处。重采任务已预填指派对象 " + row.emp + "。"
      });
      next();
    };
    const doPass = () => {
      toast.push({
        tone: "ok",
        title: "已通过",
        desc: "评分 " + score + " 分，自动跳转下一条并预加载。"
      });
      next();
    };
    const selAdvice = codes.length ? codes[codes.length - 1] : null;
    return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(PageHead, {
      crumbs: [{
        label: "质量",
        to: () => set({
          page: "qcqueue"
        })
      }, {
        label: "质检台"
      }],
      title: "\u8D28\u68C0\u53F0",
      desc: "\u4E00\u8F6E\u5224\u5B9A\u5FC5\u987B\u80FD\u5168\u952E\u76D8\u5B8C\u6210\u3002\u8BC4\u5206\u3001\u9A73\u56DE\u3001\u901A\u8FC7\u3001\u4E0B\u4E00\u6761\u3001\u9010\u5E27\u3001\u5207\u6362\u89C6\u89D2\u5168\u90E8\u7ED1\u5B9A\u5FEB\u6377\u952E\uFF0C\u5E76\u628A\u5FEB\u6377\u952E\u63D0\u793A\u5E38\u663E\u5728\u754C\u9762\u4E0A\u800C\u975E\u85CF\u5728\u5E2E\u52A9\u91CC\u3002",
      meta: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Tag, {
        tone: "danger",
        dot: true
      }, "\u5F85\u529E ", D.QC_QUEUE.filter(r => !r.done).length, " \u6761"), /*#__PURE__*/React.createElement(Tag, {
        tone: "quiet",
        icon: "clock"
      }, "\u672C\u8F6E\u5DF2\u5224\u5B9A 12 \u6761 \xB7 \u5E73\u5747 26 \u79D2 / \u6761"), /*#__PURE__*/React.createElement(Tag, {
        tone: "quiet",
        icon: "gauge"
      }, "\u673A\u5BA1\u547D\u4E2D\u7387 31% \xB7 \u4EBA\u5DE5\u6539\u5224\u7387 6.2%")),
      actions: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Btn, {
        icon: "keyboard",
        tone: "ghost",
        onClick: () => setLogOpen(true)
      }, "\u5FEB\u6377\u952E"), /*#__PURE__*/React.createElement(Btn, {
        icon: "chart",
        tone: "ghost"
      }, "\u8D28\u91CF\u770B\u677F"))
    }), /*#__PURE__*/React.createElement("div", {
      className: "pagebody flush"
    }, /*#__PURE__*/React.createElement("div", {
      className: "wb wb-3",
      style: {
        height: "100%"
      }
    }, /*#__PURE__*/React.createElement(QCQueue, {
      app: app,
      set: set
    }), /*#__PURE__*/React.createElement("div", {
      className: "wb-col",
      style: {
        borderRight: "1px solid var(--line)"
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "wb-head"
    }, /*#__PURE__*/React.createElement("span", {
      className: "mono small"
    }, row.id), /*#__PURE__*/React.createElement(Tag, {
      tone: row.risk === "high" ? "danger" : "warn",
      dot: true
    }, RISK_LABEL[row.risk]), /*#__PURE__*/React.createElement("span", {
      className: "tiny muted-3"
    }, row.task, " \xB7 ", row.scene, " \xB7 ", row.emp, " \xB7 ", row.dur), /*#__PURE__*/React.createElement("span", {
      className: "grow"
    }), /*#__PURE__*/React.createElement("span", {
      className: "tiny muted-3"
    }, "\u64AD\u653E\u5668\u5DF2\u5BF9\u9F50\u5230\u673A\u5BA1\u5F02\u5E38\u70B9")), /*#__PURE__*/React.createElement("div", {
      className: "wb-body",
      style: {
        background: "var(--surface-inset)",
        display: "flex",
        alignItems: "center"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: "100%"
      }
    }, /*#__PURE__*/React.createElement(MultiView, {
      views: VIEWS,
      t: t,
      count: views,
      main: main,
      onMain: setMain,
      overlays: ov,
      tileH: views === 4 ? 300 : 380
    }))), /*#__PURE__*/React.createElement("div", {
      className: "wb-foot"
    }, /*#__PURE__*/React.createElement(Transport, {
      t: t,
      playing: playing,
      duration: 372,
      onToggle: () => setPlaying(!playing),
      onSeek: setT,
      onStep: d => setT(v => Math.max(0, Math.min(1, v + d))),
      views: VIEWS,
      main: main,
      onMain: setMain,
      extra: /*#__PURE__*/React.createElement(Btn, {
        size: "sm",
        tone: "ghost",
        icon: "flag",
        onClick: addEvidence
      }, "\u6253\u8BC1\u636E ", /*#__PURE__*/React.createElement(Kbd, null, "M"))
    }), /*#__PURE__*/React.createElement(Timeline, {
      t: t,
      onSeek: setT,
      duration: 372,
      machine: row.machine,
      notes: D.ANNO_NOTES,
      tracks: [{
        id: "action",
        color: "var(--domain-c)",
        name: "动作段",
        segs: D.ANNO_TRACKS[0].segs
      }, {
        id: "contact",
        color: "var(--warn)",
        name: "接触事件",
        segs: D.ANNO_TRACKS[3].segs
      }]
    }))), /*#__PURE__*/React.createElement("div", {
      className: "wb-col",
      style: {
        borderRight: 0
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "wb-head"
    }, /*#__PURE__*/React.createElement("span", {
      className: "small",
      style: {
        fontWeight: 600
      }
    }, "\u5224\u5B9A\u9762\u677F"), /*#__PURE__*/React.createElement("span", {
      className: "grow"
    }), /*#__PURE__*/React.createElement(Tag, {
      tone: canReject || canPass ? "accent" : "quiet",
      dot: true
    }, canReject || canPass ? "可提交" : "未满足提交条件")), /*#__PURE__*/React.createElement("div", {
      className: "wb-body"
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        padding: 14,
        display: "flex",
        flexDirection: "column",
        gap: 14
      }
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      className: "spread",
      style: {
        marginBottom: 7
      }
    }, /*#__PURE__*/React.createElement("span", {
      className: "field-label",
      style: {
        margin: 0
      }
    }, "\u8D28\u91CF\u8BC4\u5206", /*#__PURE__*/React.createElement("span", {
      className: "req"
    }, "\xB7")), /*#__PURE__*/React.createElement("span", {
      className: "tiny muted-3"
    }, "\u952E\u76D8 1\u20135")), /*#__PURE__*/React.createElement("div", {
      className: "score"
    }, [1, 2, 3, 4, 5].map(n => /*#__PURE__*/React.createElement("button", {
      key: n,
      className: cls(score === n && "on"),
      onClick: () => setScore(n)
    }, n, /*#__PURE__*/React.createElement("span", {
      className: "k"
    }, n)))), /*#__PURE__*/React.createElement("div", {
      className: "spread tiny muted-3",
      style: {
        marginTop: 5
      }
    }, /*#__PURE__*/React.createElement("span", null, "1 \u5B8C\u5168\u4E0D\u53EF\u7528"), /*#__PURE__*/React.createElement("span", null, "3 \u5408\u683C"), /*#__PURE__*/React.createElement("span", null, "5 \u4F18\u8D28"))), /*#__PURE__*/React.createElement("div", {
      className: "hr"
    }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      className: "spread",
      style: {
        marginBottom: 7
      }
    }, /*#__PURE__*/React.createElement("span", {
      className: "field-label",
      style: {
        margin: 0
      }
    }, "\u673A\u5BA1\u8BC1\u636E\u94FE"), /*#__PURE__*/React.createElement(Tag, {
      tone: "quiet",
      icon: "cpu"
    }, "\u6A21\u578B ", D.MACHINE_EVIDENCE.model)), /*#__PURE__*/React.createElement("div", {
      className: "panel-inset",
      style: {
        padding: 11
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "spread",
      style: {
        marginBottom: 9
      }
    }, /*#__PURE__*/React.createElement("span", {
      className: "row",
      style: {
        gap: 7
      }
    }, /*#__PURE__*/React.createElement("span", {
      className: "codechip"
    }, D.MACHINE_EVIDENCE.propose.code), /*#__PURE__*/React.createElement("span", {
      className: "small"
    }, D.MACHINE_EVIDENCE.propose.name), /*#__PURE__*/React.createElement("span", {
      className: "tiny muted-3 mono"
    }, D.MACHINE_EVIDENCE.propose.seg)), /*#__PURE__*/React.createElement(Tag, {
      tone: "accent"
    }, "\u7F6E\u4FE1\u5EA6 ", Math.round(D.MACHINE_EVIDENCE.propose.conf * 100), "%")), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 6
      }
    }, D.MACHINE_EVIDENCE.chain.map(e => /*#__PURE__*/React.createElement("button", {
      key: e.k,
      className: "row",
      style: {
        gap: 8,
        border: 0,
        background: "transparent",
        color: "inherit",
        cursor: "pointer",
        textAlign: "left",
        padding: 0
      },
      onClick: () => toast.push({
        tone: "info",
        title: "已跳转证据",
        desc: e.rule + " · " + e.jump
      })
    }, /*#__PURE__*/React.createElement(Icon, {
      n: "chevRight",
      s: 11,
      style: {
        color: "var(--text-4)",
        flex: "0 0 auto"
      }
    }), /*#__PURE__*/React.createElement("span", {
      className: "small muted grow pretty"
    }, e.k), /*#__PURE__*/React.createElement("span", {
      className: "mono tiny nowrap",
      style: {
        color: "var(--danger)"
      }
    }, e.v)))), /*#__PURE__*/React.createElement("div", {
      className: "hr",
      style: {
        margin: "10px 0"
      }
    }), /*#__PURE__*/React.createElement("div", {
      className: "spread"
    }, /*#__PURE__*/React.createElement("span", {
      className: "tiny muted-3"
    }, "\u8BE5\u539F\u56E0\u7801\u5386\u53F2\u673A\u5BA1\u51C6\u786E\u7387 ", Math.round(D.MACHINE_EVIDENCE.precision * 100), "%"), /*#__PURE__*/React.createElement(Btn, {
      size: "sm",
      tone: "ghost",
      icon: "check",
      onClick: () => {
        const it = D.REASON_CODES[2].items[0];
        if (!codes.some(c => c.code === it.code) && codes.length < 3) setCodes(codes.concat([it]));
        toast.push({
          tone: "ok",
          title: "已采纳机审建议",
          desc: "原因码 " + it.code + " 已选中。结论仍以人工判定为准，采纳与改判都会回写人机一致率。"
        });
      }
    }, "\u91C7\u7EB3\u5EFA\u8BAE")), /*#__PURE__*/React.createElement("div", {
      className: "tiny muted-3",
      style: {
        marginTop: 8,
        lineHeight: 1.65
      }
    }, "\u6A21\u578B\u7ED9\u7ED3\u8BBA\u3001\u4E5F\u7ED9\u8BC1\u636E\uFF1A\u4EBA\u5148\u770B\u8BC1\u636E\u518D\u51B3\u5B9A\u662F\u5426\u91C7\u7EB3\u3002\u91C7\u7EB3\u4E0E\u6539\u5224\u90FD\u4F1A\u56DE\u5199\u4E00\u81F4\u7387\uFF0C\u4F4E\u4E8E\u9608\u503C\u65F6\u53CD\u8FC7\u6765\u63D0\u793A\u89C4\u5219\u9700\u8981\u8C03\u6574\u3002"))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      className: "spread",
      style: {
        marginBottom: 7
      }
    }, /*#__PURE__*/React.createElement("span", {
      className: "field-label",
      style: {
        margin: 0
      }
    }, "\u539F\u56E0\u7801", /*#__PURE__*/React.createElement("span", {
      className: "req"
    }, "\xB7")), /*#__PURE__*/React.createElement("span", {
      className: "tiny",
      style: {
        color: codes.length > 3 ? "var(--danger)" : "var(--text-3)"
      }
    }, "\u4E24\u7EA7\u7ED3\u6784\uFF0C\u6700\u591A\u9009 3 \u4E2A\uFF08\u5DF2\u9009 ", codes.length, "\uFF09")), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 5
      }
    }, D.REASON_CODES.map(g => /*#__PURE__*/React.createElement("div", {
      key: g.group
    }, /*#__PURE__*/React.createElement("button", {
      className: "spread",
      style: {
        width: "100%",
        border: 0,
        background: "transparent",
        color: "inherit",
        cursor: "pointer",
        padding: "4px 0"
      },
      onClick: () => setOpenGroup(openGroup === g.group ? "" : g.group)
    }, /*#__PURE__*/React.createElement("span", {
      className: "row",
      style: {
        gap: 7
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      n: "chevDown",
      s: 11,
      style: {
        transform: openGroup === g.group ? "none" : "rotate(-90deg)",
        transition: "transform 150ms"
      }
    }), /*#__PURE__*/React.createElement("span", {
      className: "small",
      style: {
        fontWeight: 600
      }
    }, g.group), /*#__PURE__*/React.createElement("span", {
      className: "codechip"
    }, g.seg)), /*#__PURE__*/React.createElement("span", {
      className: "tiny muted-3"
    }, D.REASON_CODES.filter(x => x.group === g.group)[0].items.length, " \u9879")), openGroup === g.group ? /*#__PURE__*/React.createElement("div", {
      className: "rc-group",
      style: {
        marginTop: 4
      }
    }, g.items.map(it => {
      const on = codes.some(c => c.code === it.code);
      return /*#__PURE__*/React.createElement("button", {
        key: it.code,
        className: cls("rc-item", on && "on"),
        onClick: () => setCodes(on ? codes.filter(c => c.code !== it.code) : codes.length >= 3 ? codes : codes.concat([it]))
      }, /*#__PURE__*/React.createElement("span", {
        className: "rc-code"
      }, it.code), /*#__PURE__*/React.createElement("span", {
        className: "grow"
      }, /*#__PURE__*/React.createElement("span", {
        className: "small",
        style: {
          color: on ? "var(--danger)" : "var(--text)"
        }
      }, it.name), on ? /*#__PURE__*/React.createElement("span", {
        className: "tiny muted-3",
        style: {
          display: "block",
          marginTop: 3,
          lineHeight: 1.6
        }
      }, it.advice) : null), /*#__PURE__*/React.createElement(Icon, {
        n: on ? "check" : "plus",
        s: 12,
        style: {
          flex: "0 0 auto",
          marginTop: 2,
          color: on ? "var(--danger)" : "var(--text-4)"
        }
      }));
    })) : null)))), selAdvice ? /*#__PURE__*/React.createElement("div", {
      className: "warnbox info"
    }, /*#__PURE__*/React.createElement("div", {
      className: "row",
      style: {
        gap: 6,
        marginBottom: 5
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      n: "cpu",
      s: 12
    }), /*#__PURE__*/React.createElement("span", {
      className: "small",
      style: {
        fontWeight: 600
      }
    }, "\u6807\u51C6\u5904\u7F6E\u5EFA\u8BAE\uFF08\u81EA\u52A8\u5E26\u51FA\uFF0C\u53EF\u5FAE\u8C03\uFF09")), /*#__PURE__*/React.createElement("span", {
      className: "pretty"
    }, selAdvice.advice)) : null, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      className: "spread",
      style: {
        marginBottom: 7
      }
    }, /*#__PURE__*/React.createElement("span", {
      className: "field-label",
      style: {
        margin: 0
      }
    }, "\u9A73\u56DE\u8BC1\u636E", /*#__PURE__*/React.createElement("span", {
      className: "req"
    }, "\xB7")), /*#__PURE__*/React.createElement("span", {
      className: "tiny",
      style: {
        color: evid.length ? "var(--ok)" : "var(--danger)"
      }
    }, evid.length ? "已添加 " + evid.length + " 处" : "至少 1 处，否则驳回按钮禁用")), /*#__PURE__*/React.createElement("div", {
      className: "row",
      style: {
        gap: 6,
        flexWrap: "wrap"
      }
    }, evid.map((e, i) => /*#__PURE__*/React.createElement("span", {
      key: i,
      className: "codechip",
      title: "第 " + e.frame + " 帧"
    }, /*#__PURE__*/React.createElement(Icon, {
      n: "flag",
      s: 10
    }), " ", fmtTime(e.t * 372), /*#__PURE__*/React.createElement("button", {
      className: "iconbtn",
      style: {
        width: 14,
        height: 14
      },
      onClick: () => setEvid(evid.filter((_, k) => k !== i))
    }, /*#__PURE__*/React.createElement(Icon, {
      n: "x",
      s: 9
    }))))), /*#__PURE__*/React.createElement(Btn, {
      size: "sm",
      tone: "ghost",
      icon: "plus",
      style: {
        marginTop: 7
      },
      onClick: addEvidence
    }, "\u5728\u5F53\u524D\u5E27\u6DFB\u52A0\u8BC1\u636E ", /*#__PURE__*/React.createElement(Kbd, null, "M"))), /*#__PURE__*/React.createElement(Field, {
      label: "\u5907\u6CE8\uFF08\u81EA\u7531\u6587\u672C\u4EC5\u4F5C\u8865\u5145\uFF0C\u7ED3\u6784\u5316\u5B57\u6BB5\u4F18\u5148\uFF09"
    }, /*#__PURE__*/React.createElement("textarea", {
      className: "textarea",
      rows: 2,
      value: note,
      onChange: e => setNote(e.target.value),
      placeholder: "\u8865\u5145\u8BF4\u660E\uFF0C\u5C06\u968F\u5224\u5B9A\u4E00\u5E76\u5199\u5165\u8BB0\u5F55"
    })), /*#__PURE__*/React.createElement("div", {
      className: "hr"
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 8
      }
    }, /*#__PURE__*/React.createElement(Btn, {
      tone: "ok",
      size: "lg",
      block: true,
      disabled: !canPass,
      onClick: doPass,
      icon: "check"
    }, "\u901A\u8FC7\u5E76\u4E0B\u4E00\u6761 ", /*#__PURE__*/React.createElement(Kbd, null, "A")), /*#__PURE__*/React.createElement(Btn, {
      tone: "danger",
      size: "lg",
      block: true,
      disabled: !canReject,
      onClick: doReject,
      icon: "x"
    }, "\u9A73\u56DE ", /*#__PURE__*/React.createElement(Kbd, null, "R")), /*#__PURE__*/React.createElement(Btn, {
      tone: "ghost",
      block: true,
      disabled: !canReject,
      onClick: () => toast.push({
        tone: "warn",
        title: "已进入仲裁队列",
        desc: "采集员申诉后由项目经理裁定，结论可回写原因码字典。"
      }),
      icon: "handshake"
    }, "\u63D0\u4EA4\u4EF2\u88C1 ", /*#__PURE__*/React.createElement(Kbd, null, "\u21E7\u21B5")), !canReject && !canPass ? /*#__PURE__*/React.createElement("div", {
      className: "tiny",
      style: {
        color: "var(--danger)",
        lineHeight: 1.65
      }
    }, "\u63D0\u4EA4\u6761\u4EF6\uFF1A\u901A\u8FC7\u9700\u5148\u8BC4\u5206\uFF1B\u9A73\u56DE\u9700\u539F\u56E0\u7801\uFF081\u20133 \u4E2A\uFF09\u52A0\u81F3\u5C11 1 \u5904\u8BC1\u636E\u3002\u6CA1\u6709\u8BC1\u636E\u7684\u9A73\u56DE\u4F1A\u5728\u91C7\u96C6\u7AEF\u53D8\u6210\u65E0\u6CD5\u6267\u884C\u7684\u6307\u4EE4\u3002") : null), /*#__PURE__*/React.createElement("div", {
      className: "warnbox"
    }, "\u540C\u4E00\u539F\u56E0\u7801\u5728\u540C\u4E00\u4EFB\u52A1\u91CD\u590D\u51FA\u73B0 3 \u6B21\u4EE5\u4E0A\u5C06\u89E6\u53D1\u89C4\u683C\u590D\u6838\u63D0\u9192\uFF0C\u4ECE\u6E90\u5934\u6CBB\u7406\u800C\u975E\u6307\u8D23\u4E2A\u4F53\u3002"))), /*#__PURE__*/React.createElement("div", {
      className: "keybar"
    }, /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement(Kbd, null, "1"), "\u2013", /*#__PURE__*/React.createElement(Kbd, null, "5"), " \u8BC4\u5206"), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement(Kbd, null, "R"), " \u9A73\u56DE"), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement(Kbd, null, "A"), " \u901A\u8FC7"), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement(Kbd, null, "M"), " \u6253\u8BC1\u636E"), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement(Kbd, null, "\u7A7A\u683C"), " \u64AD\u653E"), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement(Kbd, null, "\u2190"), /*#__PURE__*/React.createElement(Kbd, null, "\u2192"), " \u9010\u5E27"), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement(Kbd, null, "6"), "\u2013", /*#__PURE__*/React.createElement(Kbd, null, "9"), " \u5207\u89C6\u56FE"))))), logOpen ? /*#__PURE__*/React.createElement(Modal, {
      title: "\u8D28\u68C0\u5FEB\u6377\u952E",
      desc: "\u5FEB\u6377\u952E\u63D0\u793A\u5E38\u663E\u4E8E\u754C\u9762\uFF0C\u4E0D\u85CF\u5728\u5E2E\u52A9\u6587\u6863\u91CC\u3002",
      onClose: () => setLogOpen(false),
      width: 520
    }, /*#__PURE__*/React.createElement(DL, {
      rows: [["1 – 5", "质量评分"], ["R", "驳回（需原因码 + 证据）"], ["A", "通过并自动跳下一条"], ["M / Shift + M", "在当前帧打证据 / 标记"], ["空格", "播放与暂停（焦点在输入框时除外）"], ["← →", "逐帧前后；长按连续步进"], ["Shift + ← →", "跳转一秒，快速粗定位"], ["6 – 9", "切换视角（按外、头、腕、深度的配置顺序）"], ["↑ ↓", "在标记之间跳转"], ["Esc", "关闭当前浮层"], ["Shift + ↵", "提交仲裁"]]
    })) : null);
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
    const [nr, setNr] = useState({
      code: "",
      dim: "内容",
      logic: "",
      op: ">",
      val: "",
      unit: "%",
      action: "驳回"
    });
    const r = rules.filter(x => x.code === sel)[0];
    const DIMS = ["同步", "完整性", "可见性", "内容", "元数据", "命名", "重复", "标定", "合规", "成像", "遮挡", "有效性", "一致性", "划分"];
    const UNITS = ["%", "帧", "项", "天", "m/s²", "σ", "—"];
    const submitNew = () => {
      const code = (nr.code || "").trim().toUpperCase() || "QC-NEW-" + String(rules.length + 1).padStart(2, "0");
      if (rules.some(x => x.code === code)) {
        toast.push({
          tone: "warn",
          title: "规则编号已被占用",
          desc: code + " 已存在，请改用未占用的编号。"
        });
        return;
      }
      if (!(nr.logic || "").trim()) {
        toast.push({
          tone: "warn",
          title: "判定逻辑不能为空",
          desc: "判定逻辑会被开发直接实现，必须写清可测量的量与比较方式。"
        });
        return;
      }
      if (nr.val === "" || isNaN(Number(nr.val))) {
        toast.push({
          tone: "warn",
          title: "阈值必须是数字",
          desc: "无量纲规则可填 0，但不可留空。"
        });
        return;
      }
      const row = {
        code,
        dim: nr.dim,
        logic: nr.logic.trim(),
        val: Number(nr.val),
        unit: nr.unit,
        op: nr.op,
        action: nr.action,
        on: true,
        hit7: 0,
        rate7: 0
      };
      setRules(rs => rs.concat([row]));
      setSel(code);
      setPending(row.val);
      setCreating(false);
      setNr({
        code: "",
        dim: "内容",
        logic: "",
        op: ">",
        val: "",
        unit: "%",
        action: "驳回"
      });
      toast.push({
        tone: "ok",
        title: "规则已创建 · 以试运行接入",
        desc: code + " 已加入规则库并置为启用，先按试运行统计命中，不参与实际驳回，确认影响面后再切换到生效。"
      });
    };
    const setVal = (code, v) => setRules(rs => rs.map(x => x.code === code ? Object.assign({}, x, {
      val: v
    }) : x));
    const toggle = code => setRules(rs => rs.map(x => x.code === code ? Object.assign({}, x, {
      on: !x.on
    }) : x));
    const hitAfter = Math.round(r.hit7 * (1 + (r.val - pending) / (pending || 1) * 0.9));
    const delta = hitAfter - r.hit7;
    return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(PageHead, {
      crumbs: [{
        label: "质量"
      }, {
        label: "规则配置"
      }],
      title: "\u8D28\u68C0\u89C4\u5219\u914D\u7F6E\u53F0",
      desc: "\u9608\u503C\u53D8\u66F4\u5FC5\u987B\u5148\u770B\u5F71\u54CD\u9762\u3002\u8D28\u68C0\u9608\u503C\u662F\u5168\u5C40\u6760\u6746\uFF0C\u6539\u4E00\u4E2A\u6570\u53EF\u80FD\u5BFC\u81F4\u6570\u5343\u6761\u6570\u636E\u88AB\u9A73\u56DE\u6216\u653E\u884C\uFF0C\u56E0\u6B64\u914D\u7F6E\u53F0\u5FC5\u987B\u5185\u5EFA\u5F71\u54CD\u9884\u4F30\u4E0E\u8BD5\u8FD0\u884C\uFF0C\u4E0D\u80FD\u8BA9\u9608\u503C\u4FEE\u6539\u6210\u4E3A\u76F2\u64CD\u4F5C\u3002",
      meta: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Tag, {
        tone: "quiet"
      }, rules.filter(x => x.on).length, " / ", rules.length, " \u6761\u89C4\u5219\u542F\u7528"), /*#__PURE__*/React.createElement(Tag, {
        tone: "quiet",
        icon: "branch"
      }, "\u89C4\u5219\u5E93\u7248\u672C QC-RULES-v3 \xB7 \u5DF2\u7ED1\u5B9A 4 \u4E2A\u4EFB\u52A1"), /*#__PURE__*/React.createElement(Tag, {
        tone: "warn",
        icon: "info"
      }, "\u6240\u6709\u9608\u503C\u5F53\u524D\u5747\u4E3A\u5F85\u6838\u5B9E\u9879\uFF0C\u9700\u4EE5\u5185\u90E8\u5B9E\u6D4B\u57FA\u7EBF\u8BBE\u5B9A")),
      actions: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Btn, {
        icon: "upload",
        tone: "ghost"
      }, "\u5BFC\u51FA\u89C4\u5219\u96C6"), /*#__PURE__*/React.createElement(Btn, {
        icon: "plus",
        tone: "primary",
        onClick: () => setCreating(true)
      }, "\u65B0\u5EFA\u89C4\u5219"))
    }), /*#__PURE__*/React.createElement("div", {
      className: "pagebody flush"
    }, /*#__PURE__*/React.createElement("div", {
      className: "wb",
      style: {
        gridTemplateColumns: "minmax(0,1fr) 380px",
        height: "100%"
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "wb-col"
    }, /*#__PURE__*/React.createElement("div", {
      className: "wb-head"
    }, /*#__PURE__*/React.createElement("span", {
      className: "small",
      style: {
        fontWeight: 600
      }
    }, "\u89C4\u5219\u8868"), /*#__PURE__*/React.createElement("div", {
      className: "gsearch",
      style: {
        flex: "0 1 220px",
        height: 26
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      n: "search",
      s: 13
    }), /*#__PURE__*/React.createElement("input", {
      placeholder: "\u6309\u7F16\u53F7 / \u7EF4\u5EA6\u641C\u7D22"
    })), /*#__PURE__*/React.createElement("span", {
      className: "grow"
    }), /*#__PURE__*/React.createElement("span", {
      className: "tiny muted-3"
    }, "\u884C\u5185\u7F16\u8F91\u9608\u503C\uFF0C\u5F00\u5173\u5373\u65F6\u751F\u6548")), /*#__PURE__*/React.createElement("div", {
      className: "wb-body"
    }, /*#__PURE__*/React.createElement("table", {
      className: "table"
    }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", {
      style: {
        width: 118
      }
    }, "\u89C4\u5219\u7F16\u53F7"), /*#__PURE__*/React.createElement("th", {
      style: {
        width: 76
      }
    }, "\u7EF4\u5EA6"), /*#__PURE__*/React.createElement("th", null, "\u5224\u5B9A\u903B\u8F91"), /*#__PURE__*/React.createElement("th", {
      style: {
        width: 172
      }
    }, "\u9608\u503C"), /*#__PURE__*/React.createElement("th", {
      style: {
        width: 96
      }
    }, "\u5904\u7F6E\u52A8\u4F5C"), /*#__PURE__*/React.createElement("th", {
      style: {
        width: 84
      },
      className: "num"
    }, "\u8FD1 7 \u65E5\u547D\u4E2D"), /*#__PURE__*/React.createElement("th", {
      style: {
        width: 60
      }
    }, "\u542F\u7528"))), /*#__PURE__*/React.createElement("tbody", null, rules.map(x => /*#__PURE__*/React.createElement("tr", {
      key: x.code,
      className: cls("clickable", x.code === sel && "selected"),
      onClick: () => {
        setSel(x.code);
        setPending(x.val);
      }
    }, /*#__PURE__*/React.createElement("td", {
      className: "mono tiny"
    }, x.code), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement(Tag, {
      tone: "quiet"
    }, x.dim)), /*#__PURE__*/React.createElement("td", {
      className: "pretty"
    }, x.logic), /*#__PURE__*/React.createElement("td", {
      onClick: e => e.stopPropagation()
    }, /*#__PURE__*/React.createElement("div", {
      className: "row",
      style: {
        gap: 6
      }
    }, /*#__PURE__*/React.createElement("span", {
      className: "mono muted-3"
    }, x.op), /*#__PURE__*/React.createElement("input", {
      className: "input mono",
      style: {
        width: 74,
        height: 25
      },
      value: x.val,
      onChange: e => setVal(x.code, e.target.value === "" ? "" : Number(e.target.value))
    }), /*#__PURE__*/React.createElement("span", {
      className: "tiny muted-3"
    }, x.unit))), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement(Tag, {
      tone: x.action === "阻塞" ? "block" : x.action === "驳回" ? "danger" : "review",
      dot: true
    }, x.action)), /*#__PURE__*/React.createElement("td", {
      className: "num"
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        color: x.hit7 > 50 ? "var(--warn)" : ""
      }
    }, x.hit7), /*#__PURE__*/React.createElement("div", {
      className: "tiny muted-3"
    }, (x.rate7 * 100).toFixed(1), "%")), /*#__PURE__*/React.createElement("td", {
      onClick: e => e.stopPropagation()
    }, /*#__PURE__*/React.createElement(Switch, {
      checked: x.on,
      onChange: () => toggle(x.code)
    })))))), /*#__PURE__*/React.createElement("div", {
      style: {
        padding: 14
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "warnbox info",
      style: {
        display: "flex",
        gap: 8
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      n: "info",
      s: 14,
      style: {
        flex: "0 0 auto",
        marginTop: 1
      }
    }), /*#__PURE__*/React.createElement("span", null, "\u5904\u7F6E\u52A8\u4F5C\u4E09\u9009\u4E00\uFF1A\u963B\u585E\uFF08\u4E0D\u8FDB\u751F\u4EA7\u961F\u5217\uFF09\u3001\u9A73\u56DE\uFF08\u751F\u6210\u91CD\u91C7\u4EFB\u52A1\uFF09\u3001\u8F6C\u590D\u6838\uFF08\u8FDB\u4EBA\u5DE5\u961F\u5217\uFF09\u3002\u9009\u62E9\u540E\u7CFB\u7EDF\u5C55\u793A\u8BE5\u52A8\u4F5C\u7684\u4E0B\u6E38\u5F71\u54CD\u94FE\u8DEF\u3002"))))), /*#__PURE__*/React.createElement("div", {
      className: "wb-col scrollable",
      style: {
        borderRight: 0
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "wb-head"
    }, /*#__PURE__*/React.createElement("span", {
      className: "mono small"
    }, r.code), /*#__PURE__*/React.createElement(Tag, {
      tone: r.action === "驳回" ? "danger" : "review",
      dot: true
    }, r.action), /*#__PURE__*/React.createElement("span", {
      className: "grow"
    }), /*#__PURE__*/React.createElement(IconBtn, {
      n: "more",
      title: "\u66F4\u591A"
    })), /*#__PURE__*/React.createElement("div", {
      className: "wb-body"
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        padding: 14,
        display: "flex",
        flexDirection: "column",
        gap: 14
      }
    }, /*#__PURE__*/React.createElement(DL, {
      rows: [["维度", r.dim], ["判定逻辑", r.logic], ["当前阈值", r.op + " " + r.val + " " + r.unit], ["处置动作", r.action], ["适用范围", "全部任务 · 真实与仿真数据"], ["绑定任务", "4 个"], ["最近修改", "09-10 质检员 · 78 → 80"]]
    }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      className: "field-label",
      style: {
        marginBottom: 7
      }
    }, "\u9608\u503C\u5F71\u54CD\u9884\u4F30\uFF08\u8FD1 7 \u65E5\uFF09"), /*#__PURE__*/React.createElement("div", {
      className: "row",
      style: {
        gap: 8,
        marginBottom: 10
      }
    }, /*#__PURE__*/React.createElement("input", {
      className: "input mono",
      value: pending,
      onChange: e => setPending(e.target.value === "" ? "" : Number(e.target.value)),
      style: {
        width: 96
      }
    }), /*#__PURE__*/React.createElement("span", {
      className: "tiny muted-3"
    }, r.unit), /*#__PURE__*/React.createElement("span", {
      className: "grow"
    }), /*#__PURE__*/React.createElement(Btn, {
      size: "sm",
      tone: "ghost",
      onClick: () => setPending(r.val)
    }, "\u8FD8\u539F")), /*#__PURE__*/React.createElement("div", {
      className: "grid g-3",
      style: {
        gap: 8
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "panel-inset",
      style: {
        padding: 10
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "tiny muted-3"
    }, "\u5F53\u524D\u547D\u4E2D"), /*#__PURE__*/React.createElement("div", {
      className: "mono",
      style: {
        fontSize: 19,
        fontWeight: 600
      }
    }, r.hit7)), /*#__PURE__*/React.createElement("div", {
      className: "panel-inset",
      style: {
        padding: 10
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "tiny muted-3"
    }, "\u8C03\u6574\u540E"), /*#__PURE__*/React.createElement("div", {
      className: "mono",
      style: {
        fontSize: 19,
        fontWeight: 600,
        color: delta > 0 ? "var(--danger)" : delta < 0 ? "var(--ok)" : "var(--text)"
      }
    }, hitAfter)), /*#__PURE__*/React.createElement("div", {
      className: "panel-inset",
      style: {
        padding: 10
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "tiny muted-3"
    }, "\u53D8\u5316"), /*#__PURE__*/React.createElement("div", {
      className: "mono",
      style: {
        fontSize: 19,
        fontWeight: 600,
        color: delta > 0 ? "var(--danger)" : delta < 0 ? "var(--ok)" : "var(--text)"
      }
    }, delta > 0 ? "+" : "", delta))), /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 10
      }
    }, /*#__PURE__*/React.createElement(Hist, {
      data: D.RECIPE_PRESET.hist,
      labels: ["0", "2", "4", "6", "8", "10", "12", "14", "16", "18", "20", "22"]
    }), /*#__PURE__*/React.createElement("div", {
      className: "tiny muted-3",
      style: {
        marginTop: 8,
        lineHeight: 1.65
      }
    }, "\u9884\u4F30\u57FA\u4E8E\u8FD1 7 \u65E5\u5DF2\u5165\u5E93\u6570\u636E\u7684\u62BD\u6837\u91CD\u653E\u3002\u9608\u503C\u8C03\u9AD8 2 \u4E2A\u5355\u4F4D\u5C06\u591A\u9A73\u56DE ", Math.max(0, delta), " \u6761\uFF0C\u5BF9\u5E94\u4EBA\u65F6\u7EA6 ", (Math.max(0, delta) * 0.42).toFixed(1), " \u5C0F\u65F6\u3002"))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      className: "spread",
      style: {
        marginBottom: 7
      }
    }, /*#__PURE__*/React.createElement("span", {
      className: "field-label",
      style: {
        margin: 0
      }
    }, "\u89C4\u5219\u8BD5\u8FD0\u884C"), /*#__PURE__*/React.createElement(Tag, {
      tone: "quiet"
    }, "\u5728\u5386\u53F2\u6570\u636E\u4E0A\u8BD5\u8DD1\uFF0C\u4E0D\u5199\u5E93")), trial ? /*#__PURE__*/React.createElement("div", {
      className: "panel-inset",
      style: {
        padding: 11
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "row",
      style: {
        gap: 8,
        marginBottom: 8
      }
    }, /*#__PURE__*/React.createElement("span", {
      className: "skel",
      style: {
        width: 12,
        height: 12,
        borderRadius: "50%"
      }
    }), /*#__PURE__*/React.createElement("span", {
      className: "small"
    }, "\u8BD5\u8FD0\u884C\u4E2D\uFF1A\u91CD\u653E 2026-09-07 \u81F3 09-14 \u5171 11 284 \u6761\u2026")), /*#__PURE__*/React.createElement("div", {
      className: "bar"
    }, /*#__PURE__*/React.createElement("i", {
      style: {
        width: "78%"
      }
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 10,
        display: "flex",
        flexDirection: "column",
        gap: 6
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "spread tiny"
    }, /*#__PURE__*/React.createElement("span", {
      className: "muted-3"
    }, "\u547D\u4E2D\u6837\u672C"), /*#__PURE__*/React.createElement("span", {
      className: "mono"
    }, hitAfter, " \u6761")), /*#__PURE__*/React.createElement("div", {
      className: "spread tiny"
    }, /*#__PURE__*/React.createElement("span", {
      className: "muted-3"
    }, "\u5176\u4E2D\u4EBA\u5DE5\u786E\u8BA4\u4E3A\u5408\u7406\u9A73\u56DE"), /*#__PURE__*/React.createElement("span", {
      className: "mono"
    }, Math.round(hitAfter * 0.86), " \u6761")), /*#__PURE__*/React.createElement("div", {
      className: "spread tiny"
    }, /*#__PURE__*/React.createElement("span", {
      className: "muted-3"
    }, "\u7591\u4F3C\u8BEF\u62A5"), /*#__PURE__*/React.createElement("span", {
      className: "mono",
      style: {
        color: "var(--warn)"
      }
    }, Math.round(hitAfter * 0.14), " \u6761")), /*#__PURE__*/React.createElement("div", {
      className: "spread tiny"
    }, /*#__PURE__*/React.createElement("span", {
      className: "muted-3"
    }, "\u5F71\u54CD\u4EFB\u52A1\u6570"), /*#__PURE__*/React.createElement("span", {
      className: "mono"
    }, "4 \u4E2A"))), /*#__PURE__*/React.createElement(Btn, {
      size: "sm",
      tone: "ghost",
      icon: "external",
      style: {
        marginTop: 10,
        width: "100%"
      },
      onClick: () => toast.push({
        tone: "info",
        title: "已打开命中样本",
        desc: "抽 20 条命中样本供人工确认合理性，全部可跳转到问题帧。"
      })
    }, "\u67E5\u770B\u547D\u4E2D\u6837\u672C")) : /*#__PURE__*/React.createElement(Btn, {
      tone: "ghost",
      icon: "play",
      block: true,
      onClick: () => setTrial(true)
    }, "\u5F00\u59CB\u8BD5\u8FD0\u884C")), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      className: "field-label",
      style: {
        marginBottom: 7
      }
    }, "\u5904\u7F6E\u52A8\u4F5C\u4E0E\u4E0B\u6E38\u5F71\u54CD"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 6
      }
    }, [["阻塞", "数据不进入生产队列，元数据类与合规类适用", "block"], ["驳回", "生成重采任务并回到采集端，内容质量类适用", "danger"], ["转复核", "进入人工队列，边界情况适用", "review"]].map(a => /*#__PURE__*/React.createElement("button", {
      key: a[0],
      className: cls("rc-item", r.action === a[0] && "on"),
      onClick: () => toast.push({
        tone: "info",
        title: "已切换处置动作",
        desc: "该动作将影响 " + r.hit7 + " 条/周的下游流转路径。"
      })
    }, /*#__PURE__*/React.createElement(Tag, {
      tone: a[2],
      dot: true
    }, a[0]), /*#__PURE__*/React.createElement("span", {
      className: "grow small muted pretty"
    }, a[1]))))), /*#__PURE__*/React.createElement("div", {
      className: "dangerzone"
    }, /*#__PURE__*/React.createElement("div", {
      className: "panel-head"
    }, /*#__PURE__*/React.createElement("span", {
      className: "panel-title"
    }, "\u751F\u6548\u4E0E\u56DE\u6EDA")), /*#__PURE__*/React.createElement("div", {
      style: {
        padding: 14,
        display: "flex",
        flexDirection: "column",
        gap: 8
      }
    }, /*#__PURE__*/React.createElement(Btn, {
      tone: "primary",
      block: true,
      icon: "check",
      onClick: () => toast.push({
        tone: "warn",
        title: "阈值已变更",
        desc: "QC-MOT-01 由 " + r.val + " 变为 " + pending + "，影响 " + hitAfter + " 条/周。变更已记入审计日志，可 10 秒内撤销。",
        action: {
          label: "撤销",
          fn: () => {
            setPending(r.val);
          }
        }
      })
    }, "\u786E\u8BA4\u53D8\u66F4\u5E76\u751F\u6548"), /*#__PURE__*/React.createElement("div", {
      className: "tiny muted-3",
      style: {
        lineHeight: 1.65
      }
    }, "\u5371\u9669\u64CD\u4F5C\u786E\u8BA4\u8981\u6C42\uFF1A\u4FEE\u6539\u8D28\u68C0\u9608\u503C\u5C5E\u5168\u5C40\u751F\u6548\u64CD\u4F5C\uFF0C\u987B\u5148\u770B\u5F71\u54CD\u9884\u4F30\u4E0E\u8BD5\u8FD0\u884C\u7ED3\u679C\uFF0C\u53D8\u66F4\u540E\u4FDD\u7559\u64A4\u9500\u5165\u53E3\u4E0D\u5C11\u4E8E 10 \u79D2\u3002")))))))), creating ? /*#__PURE__*/React.createElement(Modal, {
      title: "\u65B0\u5EFA\u8D28\u68C0\u89C4\u5219",
      width: 580,
      desc: "\u65B0\u5EFA\u89C4\u5219\u9ED8\u8BA4\u4EE5\u300C\u8BD5\u8FD0\u884C\u300D\u63A5\u5165\uFF1A\u5148\u7EDF\u8BA1\u547D\u4E2D\uFF0C\u4E0D\u53C2\u4E0E\u5B9E\u9645\u9A73\u56DE\uFF0C\u786E\u8BA4\u5F71\u54CD\u9762\u540E\u518D\u5207\u6362\u4E3A\u751F\u6548\u3002",
      onClose: () => setCreating(false),
      foot: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Btn, {
        tone: "ghost",
        onClick: () => setCreating(false)
      }, "\u53D6\u6D88"), /*#__PURE__*/React.createElement("span", {
        className: "grow"
      }), /*#__PURE__*/React.createElement(Btn, {
        tone: "primary",
        icon: "check",
        onClick: submitNew
      }, "\u521B\u5EFA\u5E76\u7F6E\u4E3A\u542F\u7528"))
    }, /*#__PURE__*/React.createElement(Field, {
      label: "\u89C4\u5219\u7F16\u53F7",
      req: true,
      hint: "\u7559\u7A7A\u5219\u81EA\u52A8\u6309 QC-NEW-NN \u751F\u6210\uFF1B\u7F16\u53F7\u5FC5\u987B\u5168\u5E93\u552F\u4E00\u3002"
    }, /*#__PURE__*/React.createElement("input", {
      className: "input mono",
      placeholder: "\u5982 QC-VIB-01",
      value: nr.code,
      onChange: e => setNr(Object.assign({}, nr, {
        code: e.target.value
      }))
    })), /*#__PURE__*/React.createElement("div", {
      className: "grid g-2"
    }, /*#__PURE__*/React.createElement(Field, {
      label: "\u7EF4\u5EA6",
      req: true
    }, /*#__PURE__*/React.createElement("select", {
      className: "select",
      value: nr.dim,
      onChange: e => setNr(Object.assign({}, nr, {
        dim: e.target.value
      }))
    }, DIMS.map(d => /*#__PURE__*/React.createElement("option", {
      key: d
    }, d)))), /*#__PURE__*/React.createElement(Field, {
      label: "\u5904\u7F6E\u52A8\u4F5C",
      req: true,
      hint: "\u963B\u585E / \u9A73\u56DE / \u8F6C\u590D\u6838\u4E09\u9009\u4E00"
    }, /*#__PURE__*/React.createElement("select", {
      className: "select",
      value: nr.action,
      onChange: e => setNr(Object.assign({}, nr, {
        action: e.target.value
      }))
    }, ["驳回", "阻塞", "转复核"].map(a => /*#__PURE__*/React.createElement("option", {
      key: a
    }, a))))), /*#__PURE__*/React.createElement(Field, {
      label: "\u5224\u5B9A\u903B\u8F91",
      req: true,
      hint: "\u5199\u6E05\u53EF\u88AB\u76F4\u63A5\u5B9E\u73B0\u7684\u91CF\uFF0C\u4F8B\u5982\u300C\u9759\u6B62\u6BB5\u5360\u6BD4\u300D\u300C\u529B\u77E9\u5F02\u5E38\u503C\u5360\u6BD4\u300D\u3002"
    }, /*#__PURE__*/React.createElement("input", {
      className: "input",
      placeholder: "\u5982 \u632F\u52A8\u5E45\u5EA6\u5CF0\u503C",
      value: nr.logic,
      onChange: e => setNr(Object.assign({}, nr, {
        logic: e.target.value
      }))
    })), /*#__PURE__*/React.createElement("div", {
      className: "row",
      style: {
        alignItems: "flex-end",
        gap: 10
      }
    }, /*#__PURE__*/React.createElement(Field, {
      label: "\u6BD4\u8F83\u7B26",
      className: "grow"
    }, /*#__PURE__*/React.createElement("select", {
      className: "select",
      value: nr.op,
      onChange: e => setNr(Object.assign({}, nr, {
        op: e.target.value
      }))
    }, [">", "<", "=", "≠"].map(o => /*#__PURE__*/React.createElement("option", {
      key: o
    }, o)))), /*#__PURE__*/React.createElement(Field, {
      label: "\u9608\u503C",
      req: true,
      className: "grow"
    }, /*#__PURE__*/React.createElement("input", {
      className: "input mono",
      placeholder: "\u5982 12",
      value: nr.val,
      onChange: e => setNr(Object.assign({}, nr, {
        val: e.target.value
      }))
    })), /*#__PURE__*/React.createElement(Field, {
      label: "\u5355\u4F4D",
      className: "grow"
    }, /*#__PURE__*/React.createElement("select", {
      className: "select",
      value: nr.unit,
      onChange: e => setNr(Object.assign({}, nr, {
        unit: e.target.value
      }))
    }, UNITS.map(u => /*#__PURE__*/React.createElement("option", {
      key: u
    }, u))))), /*#__PURE__*/React.createElement("div", {
      className: "warnbox info"
    }, "\u65B0\u5EFA\u89C4\u5219\u4E0D\u4F1A\u7ACB\u5373\u53C2\u4E0E\u9A73\u56DE\uFF1A\u7CFB\u7EDF\u5148\u6309\u8BD5\u8FD0\u884C\u7EDF\u8BA1\u8FD1 7 \u65E5\u547D\u4E2D\u4E0E\u7591\u4F3C\u8BEF\u62A5\uFF0C\u786E\u8BA4\u5F71\u54CD\u9762\u540E\u518D\u5207\u6362\u4E3A\u751F\u6548\uFF0C\u907F\u514D\u4E00\u6B21\u914D\u7F6E\u6539\u52A8\u5BFC\u81F4\u5927\u6279\u6570\u636E\u88AB\u8BEF\u9A73\u3002")) : null);
  }

  /* ============================================================
     标注工作台（源：7.5 / 8.6）
     ============================================================ */
  function AnnoWorkbench({
    app,
    set,
    reviewMode
  }) {
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
    const c = D.ANNO_CLIPS.filter(x => x.id === clip)[0] || D.ANNO_CLIPS[0];
    const seg = sel ? tracks.filter(x => x.id === sel.track)[0].segs[sel.i] : null;
    const nudge = (field, d) => {
      if (!sel) return;
      setTracks(ts => ts.map(tr => tr.id !== sel.track ? tr : Object.assign({}, tr, {
        segs: tr.segs.map((s, i) => i !== sel.i ? s : Object.assign({}, s, {
          [field]: Math.max(0, Math.min(1, s[field] + d))
        }))
      })));
    };
    const activeNote = D.ANNO_NOTES.filter(n => Math.abs(n.t - t) < 0.035);
    return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(PageHead, {
      crumbs: [{
        label: "标注",
        to: () => set({
          page: "annotasks"
        })
      }, {
        label: reviewMode ? "标注质检" : "标注工作台"
      }],
      title: reviewMode ? "标注质检 · 复核与逐帧批注" : "标注工作台",
      desc: reviewMode ? "复核标注结果、处理分歧、必要时仲裁。批注落在帧上而非句子上——第 128 帧手部被遮挡，比「整体质量不佳」对标注员有用得多。" : "支撑 VLA 类数据的长视频、多轨、跨模态标注，而不是把图片标注器套用在具身数据上。AI 预标注以候选而非结论呈现。",
      meta: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Tag, {
        tone: "quiet",
        icon: "cube"
      }, "CLA-KITCH-FOLD-v4\uFF08\u89C4\u8303\u7248\u672C\u5DF2\u4E0E\u4EFB\u52A1\u7ED1\u5B9A\uFF09"), /*#__PURE__*/React.createElement(Tag, {
        tone: "accent",
        icon: "cpu"
      }, "AI \u9884\u6807\u6CE8\u5DF2\u5B8C\u6210 \xB7 \u5E73\u5747\u7F6E\u4FE1\u5EA6 0.71"), /*#__PURE__*/React.createElement(Tag, {
        tone: "ok",
        icon: "check"
      }, "\u9884\u6807\u6CE8\u91C7\u7EB3\u7387 91%"), /*#__PURE__*/React.createElement(Tag, {
        tone: "warn",
        dot: true
      }, "\u5F85\u590D\u6838\u4F4E\u7F6E\u4FE1\u533A\u57DF ", c.pending, " \u5904"), /*#__PURE__*/React.createElement(Tag, {
        tone: "quiet",
        icon: "clock"
      }, "\u81EA\u52A8\u4FDD\u5B58\u4E8E 12:41")),
      actions: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Btn, {
        icon: "message",
        tone: "ghost",
        onClick: () => setNotesOpen(!notesOpen)
      }, "\u6279\u6CE8 ", D.ANNO_NOTES.length), /*#__PURE__*/React.createElement(Btn, {
        icon: "route",
        tone: "ghost",
        onClick: () => toast.push({
          tone: "warn",
          title: "已转入仲裁队列",
          desc: "两人标注分歧超阈（一致率 71.4% < 85%），已高亮分歧帧并指派标注质检员裁定。"
        })
      }, "\u63D0\u4EA4\u4EF2\u88C1"), /*#__PURE__*/React.createElement(Btn, {
        icon: "send",
        tone: "primary",
        onClick: () => toast.push({
          tone: "ok",
          title: "已提交",
          desc: "提交后不可编辑，仅可查看。已进入标注质检队列。"
        })
      }, "\u63D0\u4EA4\u4EFB\u52A1"))
    }), /*#__PURE__*/React.createElement("div", {
      className: "pagebody flush"
    }, /*#__PURE__*/React.createElement("div", {
      className: "wb",
      style: {
        gridTemplateColumns: "248px minmax(0,1fr) 348px",
        height: "100%"
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "wb-col"
    }, /*#__PURE__*/React.createElement("div", {
      className: "wb-head"
    }, /*#__PURE__*/React.createElement("span", {
      className: "small",
      style: {
        fontWeight: 600
      }
    }, "\u4EFB\u52A1\u4E0E\u8FDB\u5EA6"), /*#__PURE__*/React.createElement("span", {
      className: "grow"
    }), /*#__PURE__*/React.createElement(Tag, {
      tone: "quiet"
    }, "4 / 12")), /*#__PURE__*/React.createElement("div", {
      className: "wb-body"
    }, D.ANNO_CLIPS.map(x => /*#__PURE__*/React.createElement("button", {
      key: x.id,
      className: cls("listitem", x.id === clip && "active"),
      onClick: () => {
        setClip(x.id);
        setSel(null);
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "spread"
    }, /*#__PURE__*/React.createElement("span", {
      className: "mono small"
    }, x.id), /*#__PURE__*/React.createElement(Tag, {
      tone: x.state === "已提交" ? "ok" : x.state === "标注中" ? "accent" : x.state === "待复核" ? "warn" : "quiet",
      dot: true
    }, x.state)), /*#__PURE__*/React.createElement("div", {
      className: "tiny muted-3 ellip",
      style: {
        marginTop: 4
      }
    }, x.name), /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 7
      }
    }, /*#__PURE__*/React.createElement(ConfBand, {
      conf: x.conf
    }), /*#__PURE__*/React.createElement("div", {
      className: "spread tiny muted-3",
      style: {
        marginTop: 4
      }
    }, /*#__PURE__*/React.createElement("span", null, "\u7F6E\u4FE1\u5EA6\u5206\u5E03"), /*#__PURE__*/React.createElement("span", null, x.pending ? "待复核 " + x.pending + " 处" : "无需复核")))))), /*#__PURE__*/React.createElement("div", {
      className: "wb-foot",
      style: {
        padding: 12
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "warnbox info",
      style: {
        fontSize: 11,
        lineHeight: 1.6
      }
    }, "\u672A\u63D0\u4EA4\u4EFB\u52A1\u53EF\u65AD\u70B9\u7EED\u6807\u3002\u957F\u65F6\u95F4\u672A\u63D0\u4EA4\u65F6\u4FDD\u7559\u8349\u7A3F\uFF0C\u4E0B\u6B21\u8FDB\u5165\u81EA\u52A8\u6062\u590D\u5230\u65AD\u70B9\u3002"))), /*#__PURE__*/React.createElement("div", {
      className: "wb-col"
    }, /*#__PURE__*/React.createElement("div", {
      className: "wb-head"
    }, /*#__PURE__*/React.createElement("span", {
      className: "mono small"
    }, clip), /*#__PURE__*/React.createElement("span", {
      className: "grow"
    }), /*#__PURE__*/React.createElement("button", {
      className: "btn btn-sm",
      "aria-pressed": dual,
      style: dual ? {
        background: "var(--surface-3)"
      } : null,
      onClick: () => setDual(!dual)
    }, "\u53CC\u89C6\u56FE\u8054\u52A8"), /*#__PURE__*/React.createElement(Btn, {
      size: "sm",
      tone: "ghost",
      icon: "target",
      onClick: () => setT(0.31)
    }, "\u8DF3\u5230\u4F4E\u7F6E\u4FE1\u6BB5")), /*#__PURE__*/React.createElement("div", {
      className: "wb-body",
      style: {
        background: "var(--surface-inset)"
      }
    }, /*#__PURE__*/React.createElement(MultiView, {
      views: dual ? [VIEWS[0], VIEWS[4]] : [VIEWS[0]],
      t: t,
      count: dual ? 2 : 1,
      main: main,
      onMain: setMain,
      overlays: ov,
      tileH: dual ? 330 : 420
    }), activeNote.length ? /*#__PURE__*/React.createElement("div", {
      style: {
        padding: "0 0 10px"
      }
    }, activeNote.map((n, i) => /*#__PURE__*/React.createElement("div", {
      key: i,
      className: "panel",
      style: {
        margin: "0 0 6px",
        background: "var(--warn-dim)",
        borderColor: "color-mix(in srgb, var(--warn) 34%, transparent)"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        padding: "9px 12px",
        display: "flex",
        gap: 9
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      n: "message",
      s: 14,
      style: {
        color: "var(--warn)",
        flex: "0 0 auto",
        marginTop: 1
      }
    }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      className: "row",
      style: {
        gap: 8
      }
    }, /*#__PURE__*/React.createElement("span", {
      className: "small",
      style: {
        fontWeight: 600,
        color: "var(--warn)"
      }
    }, "\u7B2C ", n.frame, " \u5E27 \xB7 ", n.who, "\uFF08", n.role, "\uFF09")), /*#__PURE__*/React.createElement("div", {
      className: "small pretty",
      style: {
        marginTop: 4
      }
    }, n.text)))))) : null), /*#__PURE__*/React.createElement("div", {
      className: "wb-foot"
    }, /*#__PURE__*/React.createElement(Transport, {
      t: t,
      playing: playing,
      duration: 372,
      onToggle: () => setPlaying(!playing),
      onSeek: setT,
      onStep: d => setT(v => Math.max(0, Math.min(1, v + d))),
      views: VIEWS,
      main: main,
      onMain: setMain,
      extra: /*#__PURE__*/React.createElement(Btn, {
        size: "sm",
        tone: "ghost",
        icon: "layers",
        onClick: () => setOv(ov.length ? [] : ["box", "hand", "contact"])
      }, "\u53E0\u52A0\u5C42")
    }), /*#__PURE__*/React.createElement(Timeline, {
      t: t,
      onSeek: setT,
      duration: 372,
      tracks: tracks,
      folded: folded,
      onFold: id => setFolded(folded.indexOf(id) >= 0 ? folded.filter(x => x !== id) : folded.concat([id])),
      selected: sel,
      onSelect: setSel,
      notes: notesOpen ? D.ANNO_NOTES : null
    }))), /*#__PURE__*/React.createElement("div", {
      className: "wb-col scrollable",
      style: {
        borderRight: 0
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "wb-head"
    }, /*#__PURE__*/React.createElement("span", {
      className: "small",
      style: {
        fontWeight: 600
      }
    }, "\u8F68\u9053\u4E0E\u68C0\u67E5\u5668"), /*#__PURE__*/React.createElement("span", {
      className: "grow"
    }), /*#__PURE__*/React.createElement(IconBtn, {
      n: "plus",
      title: "\u65B0\u5EFA\u8F68\u9053",
      onClick: () => {
        const id = "track" + (tracks.length + 1);
        const color = ["var(--domain-b)", "var(--ok)", "var(--domain-f)"][tracks.length % 3];
        setTracks(ts => ts.concat([{
          id: id,
          name: "新轨道 " + (ts.length + 1),
          color: color,
          segs: []
        }]));
        toast.push({
          tone: "ok",
          title: "已新建轨道",
          desc: "新轨道已加入时间线，可在画面上拉框创建第一个片段，或在检查器里按帧输入起止。"
        });
      }
    })), /*#__PURE__*/React.createElement("div", {
      className: "wb-body"
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        padding: 14,
        display: "flex",
        flexDirection: "column",
        gap: 14
      }
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      className: "field-label",
      style: {
        marginBottom: 7
      }
    }, "\u8F68\u9053\uFF08\u53EF\u6298\u53E0\u4EE5\u4FDD\u6301\u957F\u89C6\u9891\u53EF\u8BFB\uFF09"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 4
      }
    }, tracks.map(tr => /*#__PURE__*/React.createElement("div", {
      key: tr.id,
      className: "spread",
      style: {
        padding: "6px 9px",
        border: "1px solid var(--line-soft)",
        borderRadius: 4,
        background: "var(--surface-1)"
      }
    }, /*#__PURE__*/React.createElement("span", {
      className: "row",
      style: {
        gap: 8
      }
    }, /*#__PURE__*/React.createElement("i", {
      style: {
        width: 7,
        height: 7,
        borderRadius: 2,
        background: tr.color
      }
    }), /*#__PURE__*/React.createElement("span", {
      className: "small"
    }, tr.name), /*#__PURE__*/React.createElement("span", {
      className: "tiny muted-3"
    }, tr.segs.length, " \u6BB5")), /*#__PURE__*/React.createElement(Switch, {
      checked: folded.indexOf(tr.id) < 0,
      onChange: () => setFolded(folded.indexOf(tr.id) >= 0 ? folded.filter(x => x !== tr.id) : folded.concat([tr.id]))
    }))))), seg ? /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      className: "field-label",
      style: {
        marginBottom: 7
      }
    }, "\u9009\u4E2D\u6BB5 \xB7 ", tracks.filter(x => x.id === sel.track)[0].name), /*#__PURE__*/React.createElement("div", {
      className: "panel-inset",
      style: {
        padding: 12
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "row",
      style: {
        gap: 8,
        marginBottom: 9
      }
    }, /*#__PURE__*/React.createElement("input", {
      className: "input",
      value: seg.label,
      readOnly: true,
      style: {
        height: 27
      }
    }), /*#__PURE__*/React.createElement(IconBtn, {
      n: "edit",
      title: "\u91CD\u547D\u540D"
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 7
      }
    }, [["起点", "s"], ["终点", "e"]].map(([lab, f]) => /*#__PURE__*/React.createElement("div", {
      key: f,
      className: "spread"
    }, /*#__PURE__*/React.createElement("span", {
      className: "small muted-3"
    }, lab), /*#__PURE__*/React.createElement("span", {
      className: "row",
      style: {
        gap: 5
      }
    }, /*#__PURE__*/React.createElement(Btn, {
      size: "sm",
      tone: "ghost",
      onClick: () => nudge(f, -0.008)
    }, "\u25C2"), /*#__PURE__*/React.createElement("span", {
      className: "mono small",
      style: {
        minWidth: 62,
        textAlign: "center"
      }
    }, fmtTime(seg[f] * 372)), /*#__PURE__*/React.createElement(Btn, {
      size: "sm",
      tone: "ghost",
      onClick: () => nudge(f, 0.008)
    }, "\u25B8"))))), /*#__PURE__*/React.createElement("div", {
      className: "hr",
      style: {
        margin: "11px 0"
      }
    }), /*#__PURE__*/React.createElement("div", {
      className: "spread"
    }, /*#__PURE__*/React.createElement("span", {
      className: "small muted-3"
    }, "\u5438\u9644\u5173\u952E\u5E27"), /*#__PURE__*/React.createElement(Switch, {
      checked: true,
      onChange: () => toast.push({
        tone: "info",
        title: "边界已吸附",
        desc: "分段边界自动吸附到最近的关键帧。"
      })
    })), /*#__PURE__*/React.createElement("div", {
      className: "spread",
      style: {
        marginTop: 9
      }
    }, /*#__PURE__*/React.createElement("span", {
      className: "small muted-3"
    }, "\u6821\u9A8C\u5B50\u6BB5\u65F6\u957F\u5173\u7CFB"), /*#__PURE__*/React.createElement(Tag, {
      tone: "ok",
      icon: "check"
    }, "\u901A\u8FC7")), /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 10,
        display: "flex",
        gap: 6
      }
    }, /*#__PURE__*/React.createElement(Btn, {
      size: "sm",
      tone: "ghost",
      style: {
        flex: 1
      },
      icon: "copy",
      onClick: () => toast.push({
        tone: "ok",
        title: "已复制段",
        desc: "已复制该段的起止与标签。"
      })
    }, "\u590D\u5236\u6BB5"), /*#__PURE__*/React.createElement(Btn, {
      size: "sm",
      tone: "danger",
      style: {
        flex: 1
      },
      icon: "trash",
      onClick: () => {
        setTracks(ts => ts.map(tr => tr.id !== sel.track ? tr : Object.assign({}, tr, {
          segs: tr.segs.filter((_, i) => i !== sel.i)
        })));
        setSel(null);
      }
    }, "\u5220\u9664\u6BB5")))) : /*#__PURE__*/React.createElement("div", {
      className: "panel-inset",
      style: {
        padding: 12
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "small muted"
    }, "\u5728\u65F6\u95F4\u8F74\u4E0A\u70B9\u9009\u4EFB\u610F\u8272\u6BB5\u4EE5\u7F16\u8F91\u5176\u8FB9\u754C\u3001\u6807\u7B7E\u4E0E\u5C5E\u6027\u3002")), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      className: "spread",
      style: {
        marginBottom: 7
      }
    }, /*#__PURE__*/React.createElement("span", {
      className: "field-label",
      style: {
        margin: 0
      }
    }, "\u5F85\u590D\u6838\u9879"), /*#__PURE__*/React.createElement(Tag, {
      tone: "warn",
      dot: true
    }, c.pending, " \u5904")), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 5
      }
    }, D.ANNO_TRACKS[0].segs.filter(s => s.low).map((s, i) => /*#__PURE__*/React.createElement("button", {
      key: i,
      className: "listitem",
      style: {
        border: "1px solid var(--line-soft)",
        borderRadius: 4,
        padding: "8px 10px"
      },
      onClick: () => setT(s.s)
    }, /*#__PURE__*/React.createElement("div", {
      className: "spread"
    }, /*#__PURE__*/React.createElement("span", {
      className: "small"
    }, s.label), /*#__PURE__*/React.createElement(Tag, {
      tone: "danger",
      dot: true
    }, "\u7F6E\u4FE1\u5EA6 ", Math.round(s.conf * 100), "%")), /*#__PURE__*/React.createElement("div", {
      className: "tiny muted-3",
      style: {
        marginTop: 3
      }
    }, fmtTime(s.s * 372), " \u2013 ", fmtTime(s.e * 372), " \xB7 \u70B9\u51FB\u8DF3\u8F6C"))), /*#__PURE__*/React.createElement("div", {
      className: "tiny muted-3",
      style: {
        lineHeight: 1.65
      }
    }, "\u7F6E\u4FE1\u5EA6\u5F15\u5BFC\u590D\u6838\u987A\u5E8F\uFF1A\u4F4E\u7F6E\u4FE1\u533A\u57DF\u81EA\u52A8\u6392\u5728\u961F\u5217\u524D\u9762\uFF0C\u628A\u4EBA\u7684\u6CE8\u610F\u529B\u82B1\u5728\u6700\u53EF\u80FD\u51FA\u9519\u7684\u5730\u65B9\u3002"))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      className: "spread",
      style: {
        marginBottom: 7
      }
    }, /*#__PURE__*/React.createElement("span", {
      className: "field-label",
      style: {
        margin: 0
      }
    }, "\u4E3B\u52A8\u5B66\u4E60 \xB7 \u96BE\u4F8B\u56DE\u6D41"), /*#__PURE__*/React.createElement(Tag, {
      tone: "warn",
      dot: true
    }, D.AL_QUEUE.length, " \u6761\u4F18\u5148")), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 5
      }
    }, D.AL_QUEUE.map(a => /*#__PURE__*/React.createElement("button", {
      key: a.id,
      className: cls("listitem", a.id === clip && "active"),
      style: {
        border: "1px solid var(--line-soft)",
        borderRadius: 4,
        padding: "8px 10px"
      },
      onClick: () => {
        setClip(a.id);
        setSel(null);
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "spread"
    }, /*#__PURE__*/React.createElement("span", {
      className: "mono small"
    }, a.id), /*#__PURE__*/React.createElement(Tag, {
      tone: a.why === "训练回传" ? "accent" : a.why === "机审分歧" ? "warn" : "danger",
      dot: true
    }, a.why)), /*#__PURE__*/React.createElement("div", {
      className: "tiny muted-3",
      style: {
        marginTop: 4,
        lineHeight: 1.55
      }
    }, a.from), /*#__PURE__*/React.createElement("div", {
      className: "tiny muted-3 mono",
      style: {
        marginTop: 3
      }
    }, "\u6A21\u578B\u7F6E\u4FE1\u5EA6 ", Math.round(a.conf * 100), "% \xB7 ", a.task)))), /*#__PURE__*/React.createElement("div", {
      className: "tiny muted-3",
      style: {
        marginTop: 8,
        lineHeight: 1.65
      }
    }, "\u961F\u5217\u6309\u6A21\u578B\u4E0D\u786E\u5B9A\u5EA6\u6392\u5E8F\u800C\u975E\u63D0\u4EA4\u65F6\u95F4\uFF1A\u4F4E\u7F6E\u4FE1\u6837\u672C\u3001\u673A\u5BA1\u4E0E\u4EBA\u5DE5\u5206\u6B67\u6837\u672C\u3001\u8BAD\u7EC3\u4FA7\u5931\u8D25\u56DE\u4F20\u6837\u672C\u4F18\u5148\u3002\u6807\u5B8C\u8FD9\u6279\u96BE\u4F8B\uFF0C\u6A21\u578B\u6700\u8584\u5F31\u7684\u533A\u57DF\u4F1A\u88AB\u76F4\u63A5\u8865\u9F50\uFF0C\u800C\u4E0D\u662F\u7EE7\u7EED\u5728\u5DF2\u7ECF\u5B66\u4F1A\u7684\u6837\u672C\u4E0A\u91CD\u590D\u52B3\u52A8\u3002")), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      className: "field-label",
      style: {
        marginBottom: 7
      }
    }, "\u8D28\u68C0\u6279\u6CE8\uFF08\u951A\u5B9A\u5728\u5E27\u4E0A\uFF09"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 6
      }
    }, D.ANNO_NOTES.map((n, i) => /*#__PURE__*/React.createElement("div", {
      key: i,
      className: "panel-inset",
      style: {
        padding: 10,
        cursor: "pointer",
        borderLeft: "3px solid var(--" + n.kind + ")"
      },
      onClick: () => setT(n.t)
    }, /*#__PURE__*/React.createElement("div", {
      className: "spread"
    }, /*#__PURE__*/React.createElement("span", {
      className: "small",
      style: {
        fontWeight: 600
      }
    }, "\u7B2C ", n.frame, " \u5E27 \xB7 ", n.who), /*#__PURE__*/React.createElement(Icon, {
      n: "arrowRight",
      s: 12,
      style: {
        color: "var(--accent)"
      }
    })), /*#__PURE__*/React.createElement("div", {
      className: "tiny muted",
      style: {
        marginTop: 4,
        lineHeight: 1.65
      }
    }, n.text))))), /*#__PURE__*/React.createElement("div", {
      className: "warnbox info"
    }, "\u89C4\u8303\u7248\u672C\u4E0E\u4EFB\u52A1\u7ED1\u5B9A\uFF1A\u63D0\u4EA4\u540E\u89C4\u8303\u66F4\u65B0\u4E0D\u5F71\u54CD\u5DF2\u63D0\u4EA4\u7ED3\u679C\uFF1B\u672A\u63D0\u4EA4\u4EFB\u52A1\u53EF\u9009\u62E9\u6309\u65B0\u89C4\u8303\u91CD\u6807\uFF0C\u907F\u514D\u6807\u5230\u4E00\u534A\u89C4\u8303\u53D8\u4E86\u9020\u6210\u7684\u53E3\u5F84\u6DF7\u4E71\u3002")))))));
  }

  /* ============================================================
     数据集配方编辑器（源：7.6 / 8.7）
     ============================================================ */
  function RecipeEditor({
    app,
    set
  }) {
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
    const embody = relax ? P.embody.map(x => Object.assign({}, x, {
      v: Math.round(x.v * 1.15)
    })) : P.embody;
    const quality = relax ? P.quality.map(x => Object.assign({}, x, {
      v: Math.round(x.v * 1.15)
    })) : P.quality;
    const onDrop = i => {
      if (dragI === null || dragI === i) return;
      const arr = pipe.slice();
      const [m] = arr.splice(dragI, 1);
      arr.splice(i, 0, m);
      setPipe(arr);
      setDragI(null);
      setOverI(null);
    };
    return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(PageHead, {
      crumbs: [{
        label: "数据集",
        to: () => set({
          page: "recipes"
        })
      }, {
        label: "配方编辑器"
      }],
      title: "\u6570\u636E\u96C6\u914D\u65B9\u7F16\u8F91\u5668",
      desc: "\u628A\u300C\u6211\u8981\u54EA\u4E00\u6279\u6570\u636E\u300D\u4ECE\u53E3\u5934\u6C9F\u901A\u53D8\u6210\u53EF\u4FDD\u5B58\u3001\u53EF\u590D\u7528\u3001\u53EF\u590D\u73B0\u7684\u7ED3\u6784\u5316\u5B9A\u4E49\u3002\u6761\u4EF6\u6784\u5EFA\u5668\u4E0E\u9884\u89C8\u533A\u540C\u5C4F\u4E14\u8054\u52A8\u2014\u2014\u6761\u4EF6\u4E0E\u7ED3\u679C\u662F\u56E0\u679C\u5173\u7CFB\uFF0C\u4EFB\u4F55\u8BA9\u7528\u6237\u6765\u56DE\u5207\u6362\u9875\u9762\u7684\u8BBE\u8BA1\u90FD\u4F1A\u7834\u574F\u8FB9\u8C03\u8FB9\u770B\u7684\u6838\u5FC3\u4F53\u9A8C\u3002",
      meta: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Tag, {
        tone: "quiet",
        icon: "file"
      }, "\u914D\u65B9 RCP-KITCH-FOLD-NEG-v2"), /*#__PURE__*/React.createElement(Tag, {
        tone: "accent",
        icon: "cpu"
      }, "\u81EA\u7136\u8BED\u8A00\u5DF2\u89E3\u6790\u4E3A ", conds.length, " \u4E2A\u6761\u4EF6\u7EC4"), app.payload && app.payload.fromBasket ? /*#__PURE__*/React.createElement(Tag, {
        tone: "ok",
        icon: "basket"
      }, "\u6E90\u81EA\u9009\u62E9\u7BEE ", app.payload.ids.length, " \u6761") : null),
      actions: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Btn, {
        icon: "copy",
        tone: "ghost",
        onClick: () => toast.push({
          tone: "ok",
          title: "配方已复制",
          desc: "同类客户的第二次交付，复制配方改条件即可，把重复劳动降到最低。"
        })
      }, "\u590D\u5236\u914D\u65B9"), /*#__PURE__*/React.createElement(Btn, {
        icon: "bookmark",
        tone: "ghost",
        onClick: () => toast.push({
          tone: "ok",
          title: "已保存到配方库",
          desc: "配方 RCP-KITCH-FOLD-NEG-v2 已保存。"
        })
      }, "\u4FDD\u5B58\u914D\u65B9"), /*#__PURE__*/React.createElement(Btn, {
        icon: "play",
        tone: "primary",
        onClick: () => {
          setBuilt(true);
          toast.push({
            tone: "info",
            title: "已提交构建",
            desc: "构建转为异步任务，队列位置 2，预计 4 分 20 秒完成。超过 30 秒将移出页面并转入通知中心。"
          });
        }
      }, "\u63D0\u4EA4\u6784\u5EFA"))
    }), /*#__PURE__*/React.createElement("div", {
      className: "pagebody flush"
    }, /*#__PURE__*/React.createElement("div", {
      className: "wb",
      style: {
        gridTemplateColumns: "330px minmax(0,1fr) 316px",
        height: "100%"
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "wb-col scrollable"
    }, /*#__PURE__*/React.createElement("div", {
      className: "wb-head"
    }, /*#__PURE__*/React.createElement("span", {
      className: "small",
      style: {
        fontWeight: 600
      }
    }, "\u6761\u4EF6\u6784\u5EFA\u5668"), /*#__PURE__*/React.createElement("span", {
      className: "grow"
    }), /*#__PURE__*/React.createElement(Tag, {
      tone: "quiet"
    }, "\u53CC\u901A\u9053")), /*#__PURE__*/React.createElement("div", {
      className: "wb-body"
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        padding: 14,
        display: "flex",
        flexDirection: "column",
        gap: 13
      }
    }, /*#__PURE__*/React.createElement(Field, {
      label: "\u81EA\u7136\u8BED\u8A00\u8F93\u5165",
      hint: "\u7FFB\u8BD1\u7ED3\u679C\u53EF\u89C1\u53EF\u6539\uFF0C\u4E0D\u662F\u9ED1\u7BB1"
    }, /*#__PURE__*/React.createElement("textarea", {
      className: "textarea",
      rows: 4,
      value: nl,
      onChange: e => setNl(e.target.value)
    })), /*#__PURE__*/React.createElement(Btn, {
      tone: "primary",
      icon: "cpu",
      block: true,
      onClick: () => toast.push({
        tone: "ok",
        title: "已解析",
        desc: "解析出 " + conds.length + " 个条件组，置信度 0.91。结果以可编辑标签呈现，可逐项微调。"
      })
    }, "\u89E3\u6790\u4E3A\u7ED3\u6784\u5316\u6761\u4EF6"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      className: "spread",
      style: {
        marginBottom: 7
      }
    }, /*#__PURE__*/React.createElement("span", {
      className: "field-label",
      style: {
        margin: 0
      }
    }, "\u6761\u4EF6\u7EC4"), /*#__PURE__*/React.createElement(Btn, {
      size: "sm",
      tone: "ghost",
      icon: "plus",
      onClick: () => setConds(conds.concat([{
        k: "光照条件",
        op: "等于",
        v: "正常室内",
        n: 291
      }]))
    }, "\u52A0\u6761\u4EF6")), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 6
      }
    }, conds.map((c, i) => /*#__PURE__*/React.createElement("div", {
      key: i,
      className: "panel-inset",
      style: {
        padding: "8px 10px",
        display: "flex",
        alignItems: "center",
        gap: 8
      }
    }, /*#__PURE__*/React.createElement("span", {
      className: "tiny muted-3",
      style: {
        width: 46,
        flex: "0 0 auto"
      }
    }, c.k), /*#__PURE__*/React.createElement("span", {
      className: "tiny muted-3"
    }, c.op), /*#__PURE__*/React.createElement("span", {
      className: "small grow ellip"
    }, c.v), /*#__PURE__*/React.createElement("span", {
      className: "tiny muted-3 mono nowrap"
    }, c.n), /*#__PURE__*/React.createElement(IconBtn, {
      n: "x",
      s: 11,
      title: "\u79FB\u9664",
      onClick: () => setConds(conds.filter((_, k) => k !== i))
    }))))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      className: "spread",
      style: {
        marginBottom: 7
      }
    }, /*#__PURE__*/React.createElement("span", {
      className: "field-label",
      style: {
        margin: 0
      }
    }, "\u6A21\u578B\u5EFA\u8BAE\u6761\u4EF6"), /*#__PURE__*/React.createElement(Tag, {
      tone: "quiet",
      icon: "cpu"
    }, "\u8986\u76D6\u5EA6\u5206\u6790")), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 6
      }
    }, [{
      k: "光照条件",
      v: "包含 320–460 lux",
      why: "照度集中，暗光场景为覆盖缺口"
    }, {
      k: "物体材质",
      v: "包含 混纺",
      why: "棉与涤纶占 86%，混纺仅 14%"
    }, {
      k: "失败类型",
      v: "包含 滑移",
      why: "滑移仅 8 条，是最稀少的长尾"
    }].map(s => /*#__PURE__*/React.createElement("button", {
      key: s.k,
      className: "panel-inset",
      style: {
        padding: "8px 10px",
        textAlign: "left",
        cursor: "pointer",
        display: "flex",
        gap: 8,
        alignItems: "flex-start"
      },
      onClick: () => {
        if (!conds.some(x => x.k === s.k && x.v === s.v)) setConds(conds.concat([{
          k: s.k,
          op: "包含",
          v: s.v,
          n: 0
        }]));
        toast.push({
          tone: "ok",
          title: "已加入条件",
          desc: s.k + " · " + s.v + "。建议基于覆盖度与长尾分析，采纳与否由人决定。"
        });
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      n: "plus",
      s: 12,
      style: {
        color: "var(--accent)",
        flex: "0 0 auto",
        marginTop: 2
      }
    }), /*#__PURE__*/React.createElement("span", {
      className: "grow"
    }, /*#__PURE__*/React.createElement("span", {
      className: "small",
      style: {
        fontWeight: 600
      }
    }, s.k), /*#__PURE__*/React.createElement("span", {
      className: "small muted"
    }, " \xB7 ", s.v), /*#__PURE__*/React.createElement("span", {
      className: "tiny muted-3",
      style: {
        display: "block",
        marginTop: 2,
        lineHeight: 1.55
      }
    }, s.why))))), /*#__PURE__*/React.createElement("div", {
      className: "tiny muted-3",
      style: {
        marginTop: 8,
        lineHeight: 1.65
      }
    }, "\u6A21\u578B\u5148\u6307\u51FA\u5F53\u524D\u7ED3\u679C\u7F3A\u4EC0\u4E48\uFF0C\u518D\u7531\u4EBA\u51B3\u5B9A\u8865\u4E0D\u8865\u3002\u7F3A\u53E3\u7684\u8865\u6CD5\u6709\u4E24\u79CD\uFF1A\u5728\u5DF2\u91C7\u6570\u636E\u91CC\u6362\u6761\u4EF6\uFF0C\u6216\u76F4\u63A5\u8F6C\u6210\u65B0\u7684\u91C7\u96C6\u9700\u6C42\u3002")), /*#__PURE__*/React.createElement("div", {
      className: "warnbox",
      style: {
        display: "flex",
        gap: 8
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      n: "warn",
      s: 14,
      style: {
        flex: "0 0 auto",
        marginTop: 1
      }
    }), /*#__PURE__*/React.createElement("span", null, "\u5EFA\u96C6\u524D\u7F6E\u6821\u9A8C\u7ED9\u8B66\u544A\u800C\u975E\u963B\u585E\uFF1A\u5F53\u524D\u300C\u7ED3\u679C\u300D\u4EC5\u542B\u5931\u8D25\u6837\u672C\uFF0C\u7F3A\u5C11\u6210\u529F\u5BF9\u7167\uFF0C\u82E5\u7528\u4E8E\u76D1\u7763\u8BAD\u7EC3\u53EF\u80FD\u5F15\u5165\u7ED3\u679C\u504F\u7F6E\u3002", warn ? /*#__PURE__*/React.createElement(Btn, {
      size: "sm",
      tone: "ghost",
      style: {
        marginTop: 8
      },
      onClick: () => setWarn(false)
    }, "\u6211\u5DF2\u77E5\u6653\uFF0C\u7EE7\u7EED") : /*#__PURE__*/React.createElement("span", {
      className: "tiny",
      style: {
        display: "block",
        marginTop: 5
      }
    }, "\u5DF2\u7559\u75D5\u3002"))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      className: "field-label",
      style: {
        marginBottom: 7
      }
    }, "\u547D\u4E2D\u89C4\u6A21\u5B9E\u65F6\u9884\u4F30"), /*#__PURE__*/React.createElement("div", {
      className: "tiny muted-3",
      style: {
        lineHeight: 1.65
      }
    }, "\u9760\u62BD\u6837\u4E0E\u7D22\u5F15\u52A0\u901F\uFF0C\u907F\u514D\u6BCF\u6539\u4E00\u4E2A\u6761\u4EF6\u5C31\u7B49\u4E00\u6B21\u5168\u91CF\u626B\u63CF\u3002\u5F53\u524D\u57FA\u4E8E 30% \u5206\u5C42\u62BD\u6837\u5916\u63A8\uFF0C\u8BEF\u5DEE \xB12.1%\u3002"))))), /*#__PURE__*/React.createElement("div", {
      className: "wb-col scrollable"
    }, /*#__PURE__*/React.createElement("div", {
      className: "wb-head"
    }, /*#__PURE__*/React.createElement("span", {
      className: "small",
      style: {
        fontWeight: 600
      }
    }, "\u7ED3\u679C\u9884\u89C8"), /*#__PURE__*/React.createElement("span", {
      className: "grow"
    }), /*#__PURE__*/React.createElement(Btn, {
      size: "sm",
      tone: "ghost",
      icon: "refresh",
      onClick: () => toast.push({
        tone: "info",
        title: "已刷新预估",
        desc: "重跑抽样外推，耗时 0.8 秒。"
      })
    }, "\u91CD\u7B97")), /*#__PURE__*/React.createElement("div", {
      className: "wb-body"
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        padding: 14,
        display: "flex",
        flexDirection: "column",
        gap: 14
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "grid g-4",
      style: {
        gap: 10
      }
    }, [["命中条数", hit, "条"], ["总时长", hours, "小时"], ["平均时长", (hours * 3600 / hit).toFixed(1), "秒"], ["本体种类", 4, "类"]].map(m => /*#__PURE__*/React.createElement("div", {
      key: m[0],
      className: "panel-inset",
      style: {
        padding: 11
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "tiny muted-3"
    }, m[0]), /*#__PURE__*/React.createElement("div", {
      className: "mono",
      style: {
        fontSize: 21,
        fontWeight: 600,
        lineHeight: 1.25
      }
    }, m[1], /*#__PURE__*/React.createElement("span", {
      className: "tiny muted-3",
      style: {
        marginLeft: 3
      }
    }, m[2]))))), /*#__PURE__*/React.createElement("div", {
      className: "grid g-2",
      style: {
        gap: 14
      }
    }, /*#__PURE__*/React.createElement(Panel, {
      title: "\u672C\u4F53\u5206\u5E03",
      flush: true
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        padding: 12
      }
    }, embody.map(b => /*#__PURE__*/React.createElement("div", {
      key: b.k,
      style: {
        marginBottom: 9
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "spread tiny",
      style: {
        marginBottom: 4
      }
    }, /*#__PURE__*/React.createElement("span", {
      className: "muted"
    }, b.k), /*#__PURE__*/React.createElement("span", {
      className: "mono"
    }, b.v, " \u6761 \xB7 ", Math.round(b.v / embody.reduce((s, x) => s + x.v, 0) * 100), "%")), /*#__PURE__*/React.createElement("div", {
      className: "bar"
    }, /*#__PURE__*/React.createElement("i", {
      style: {
        width: b.v / embody[0].v * 100 + "%"
      }
    })))))), /*#__PURE__*/React.createElement(Panel, {
      title: "\u8D28\u91CF\u5206\u5C42",
      flush: true
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        padding: 12
      }
    }, quality.map((b, i) => /*#__PURE__*/React.createElement("div", {
      key: b.k,
      style: {
        marginBottom: 9
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "spread tiny",
      style: {
        marginBottom: 4
      }
    }, /*#__PURE__*/React.createElement("span", {
      className: "muted"
    }, b.k), /*#__PURE__*/React.createElement("span", {
      className: "mono"
    }, b.v, " \u6761")), /*#__PURE__*/React.createElement("div", {
      className: "bar"
    }, /*#__PURE__*/React.createElement("i", {
      style: {
        width: b.v / quality[1].v * 100 + "%",
        background: i === 0 ? "var(--ok)" : i === 1 ? "var(--warn)" : "var(--danger)"
      }
    })))), /*#__PURE__*/React.createElement("div", {
      className: "tiny muted-3",
      style: {
        lineHeight: 1.6
      }
    }, "\u8FB9\u7F18\u96BE\u4F8B\u5360\u6BD4 47%\uFF0C\u53EF\u7528\u4E8E\u96BE\u4F8B\u6316\u6398\u4E0E\u4E3B\u52A8\u91C7\u96C6\u53D6\u7528\u3002")))), /*#__PURE__*/React.createElement(Panel, {
      title: "\u65F6\u957F\u5206\u5E03",
      sub: "\u62BD\u6837\u5916\u63A8 \xB7 \u79D2",
      flush: true
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        padding: 12
      }
    }, /*#__PURE__*/React.createElement(Hist, {
      data: P.hist,
      labels: ["4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15"]
    }))), /*#__PURE__*/React.createElement("div", {
      className: "spread"
    }, /*#__PURE__*/React.createElement("span", {
      className: "small muted-3"
    }, "\u62BD\u6837\u67E5\u770B\u524D 6 \u6761\uFF08\u4E0D\u70B9\u5F00\u4E5F\u80FD\u7B5B\u6389\u5927\u534A\uFF09"), /*#__PURE__*/React.createElement(Btn, {
      size: "sm",
      tone: "ghost",
      icon: "external",
      onClick: () => set({
        page: "browser",
        payload: {
          id: "CLP-81204"
        }
      })
    }, "\u6253\u5F00\u6570\u636E\u6D4F\u89C8\u5668")), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gridTemplateColumns: "repeat(3,1fr)",
        gap: 9
      }
    }, D.SEARCH_HITS.slice(0, 6).map(h => /*#__PURE__*/React.createElement("div", {
      key: h.id,
      className: "panel",
      style: {
        overflow: "hidden"
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "player",
      style: {
        height: 82,
        borderRadius: 0
      }
    }, /*#__PURE__*/React.createElement(SceneFrame, {
      view: h.emb === "Ego" ? "ego" : "exo",
      t: h.score % 50 / 100 + 0.25
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        padding: "7px 9px"
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "mono tiny"
    }, h.id), /*#__PURE__*/React.createElement("div", {
      className: "spread",
      style: {
        marginTop: 3
      }
    }, /*#__PURE__*/React.createElement("span", {
      className: "tiny muted-3"
    }, h.dur), /*#__PURE__*/React.createElement("span", {
      className: cls("tag", h.score >= 85 ? "t-ok" : "t-warn"),
      style: {
        height: 17
      }
    }, h.score)))))), /*#__PURE__*/React.createElement("div", {
      className: "row",
      style: {
        gap: 8,
        flexWrap: "wrap"
      }
    }, /*#__PURE__*/React.createElement(Btn, {
      size: "sm",
      tone: "ghost",
      onClick: () => setRelax(!relax)
    }, relax ? "撤销放宽" : "放宽条件看看"), /*#__PURE__*/React.createElement(Btn, {
      size: "sm",
      tone: "ghost",
      icon: "refresh",
      onClick: () => toast.push({
        tone: "info",
        title: "已生成主动采集需求",
        desc: "命中的长尾缺口（暗光 / 混纺 / 滑移）已转为采集需求，回填至任务列表的「补采」队列。"
      })
    }, "\u957F\u5C3E\u7F3A\u53E3\u8F6C\u8865\u91C7"), /*#__PURE__*/React.createElement("span", {
      className: "tiny muted-3"
    }, relax ? "已放宽质量分下限至 60，命中 +44 条" : "结果 297 条偏少时，可一键放宽并给出建议")), built ? /*#__PURE__*/React.createElement(Panel, {
      title: "\u6784\u5EFA\u4EFB\u52A1",
      sub: "\u5F02\u6B65\u6267\u884C\uFF0C\u8D85\u51FA 30 \u79D2\u79FB\u51FA\u9875\u9762\u5E76\u8F6C\u5165\u901A\u77E5\u4E2D\u5FC3",
      flush: true
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        padding: 14,
        display: "flex",
        flexDirection: "column",
        gap: 10
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "spread"
    }, /*#__PURE__*/React.createElement("span", {
      className: "row",
      style: {
        gap: 8
      }
    }, /*#__PURE__*/React.createElement("span", {
      className: "skel",
      style: {
        width: 12,
        height: 12,
        borderRadius: "50%"
      }
    }), /*#__PURE__*/React.createElement("span", {
      className: "small"
    }, "\u961F\u5217\u4F4D\u7F6E 2 \xB7 \u6B63\u5728\u6267\u884C\u300C\u683C\u5F0F\u8F6C\u6362\u300D\u6B65\u9AA4")), /*#__PURE__*/React.createElement("span", {
      className: "tiny muted-3 mono"
    }, "\u9884\u8BA1 4 \u5206 20 \u79D2")), /*#__PURE__*/React.createElement("div", {
      className: "bar"
    }, /*#__PURE__*/React.createElement("i", {
      style: {
        width: "34%"
      }
    })), /*#__PURE__*/React.createElement("div", {
      className: "tiny muted-3",
      style: {
        lineHeight: 1.65
      }
    }, "\u6784\u5EFA\u5931\u8D25\u65F6\u4FDD\u7559\u5DF2\u5B8C\u6210\u5206\u7247\u5E76\u7ED9\u51FA\u5931\u8D25\u539F\u56E0\uFF0C\u652F\u6301\u65AD\u70B9\u7EED\u8DD1\u800C\u4E0D\u4ECE\u5934\u5F00\u59CB\u3002\u76EE\u6807\u683C\u5F0F\u4E0D\u652F\u6301\u67D0\u6A21\u6001\u65F6\u4F1A\u5217\u51FA\u4E0D\u652F\u6301\u9879\u4E0E\u66FF\u4EE3\u65B9\u6848\u3002"))) : null))), /*#__PURE__*/React.createElement("div", {
      className: "wb-col scrollable",
      style: {
        borderRight: 0
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "wb-head"
    }, /*#__PURE__*/React.createElement("span", {
      className: "small",
      style: {
        fontWeight: 600
      }
    }, "\u5904\u7406\u6D41\u6C34\u7EBF"), /*#__PURE__*/React.createElement("span", {
      className: "grow"
    }), /*#__PURE__*/React.createElement("span", {
      className: "tiny muted-3"
    }, "\u62D6\u62FD\u6392\u5E8F")), /*#__PURE__*/React.createElement("div", {
      className: "wb-body"
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        padding: 14,
        display: "flex",
        flexDirection: "column",
        gap: 12
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "pipe"
    }, pipe.map((s, i) => /*#__PURE__*/React.createElement("div", {
      key: s.k,
      className: cls("pipe-step", dragI === i && "dragging", overI === i && "over"),
      draggable: true,
      onDragStart: () => setDragI(i),
      onDragOver: e => {
        e.preventDefault();
        setOverI(i);
      },
      onDragLeave: () => setOverI(null),
      onDrop: () => onDrop(i),
      onDragEnd: () => {
        setDragI(null);
        setOverI(null);
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      n: "list",
      s: 13,
      className: "pipe-grip"
    }), /*#__PURE__*/React.createElement("span", {
      className: "pipe-idx"
    }, i + 1), /*#__PURE__*/React.createElement("span", {
      className: "grow"
    }, /*#__PURE__*/React.createElement("span", {
      className: "small",
      style: {
        fontWeight: 600
      }
    }, s.k), /*#__PURE__*/React.createElement("span", {
      className: "tiny muted-3",
      style: {
        display: "block",
        marginTop: 2,
        lineHeight: 1.6
      }
    }, s.v)), /*#__PURE__*/React.createElement(IconBtn, {
      n: "settings",
      s: 12,
      title: "\u914D\u7F6E\u53C2\u6570",
      onClick: () => toast.push({
        tone: "info",
        title: s.k + " · 参数",
        desc: s.v
      })
    })))), /*#__PURE__*/React.createElement(Btn, {
      tone: "ghost",
      icon: "plus",
      block: true,
      size: "sm"
    }, "\u6DFB\u52A0\u5904\u7406\u6B65\u9AA4"), /*#__PURE__*/React.createElement("div", {
      className: "hr"
    }), /*#__PURE__*/React.createElement(Field, {
      label: "\u7248\u672C\u53F7",
      hint: "\u53D1\u5E03\u5373\u51BB\u7ED3"
    }, /*#__PURE__*/React.createElement("input", {
      className: "input mono",
      defaultValue: "v3"
    })), /*#__PURE__*/React.createElement(Field, {
      label: "\u53D8\u66F4\u65E5\u5FD7"
    }, /*#__PURE__*/React.createElement("textarea", {
      className: "textarea",
      rows: 3,
      defaultValue: "- 新增条件：结果 = 失败\n- 调整分层划分：按场景分层，8 : 1 : 1\n- 新增泄露检测步骤"
    })), /*#__PURE__*/React.createElement(Switch, {
      checked: true,
      label: "\u751F\u6210\u5206\u7247\u4E0E\u7D22\u5F15\u6587\u4EF6",
      onChange: () => {}
    }), /*#__PURE__*/React.createElement(Switch, {
      checked: true,
      label: "\u4EA4\u4ED8\u524D\u5D4C\u5165\u6765\u6E90\u6307\u7EB9",
      onChange: () => {}
    }), /*#__PURE__*/React.createElement("div", {
      className: "warnbox info"
    }, "\u5FEB\u7167\u4E0D\u53EF\u53D8\uFF1A\u53D1\u5E03\u5373\u51BB\u7ED3\uFF0C\u8BAD\u7EC3\u4FA7\u53EA\u8BFB\u5F15\u7528\u3002\u540E\u7EED\u6570\u636E\u53D8\u5316\u4E0D\u5F71\u54CD\u5DF2\u53D1\u5E03\u7248\u672C\uFF0C\u9700\u8981\u66F4\u65B0\u5219\u53D1\u65B0\u7248\u672C\u3002"), /*#__PURE__*/React.createElement(Btn, {
      tone: "primary",
      size: "lg",
      block: true,
      icon: "bookmark",
      onClick: () => setPub(true)
    }, "\u53D1\u5E03\u5FEB\u7167")))))), pub ? /*#__PURE__*/React.createElement(Modal, {
      title: "\u53D1\u5E03\u5FEB\u7167 \xB7 \u4E8C\u6B21\u786E\u8BA4",
      desc: "\u53D1\u5E03\u540E\u8BE5\u7248\u672C\u6210\u4E3A\u8BAD\u7EC3\u4FA7\u5F15\u7528\u6765\u6E90\uFF0C\u4E0D\u53EF\u539F\u5730\u4FEE\u6539\u3002",
      onClose: () => setPub(false),
      width: 560,
      foot: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Btn, {
        tone: "ghost",
        onClick: () => setPub(false)
      }, "\u53D6\u6D88"), /*#__PURE__*/React.createElement(Btn, {
        tone: "primary",
        icon: "check",
        onClick: () => {
          setPub(false);
          toast.push({
            tone: "ok",
            title: "快照已发布",
            desc: "DS-KITCH-FOLD-v3 · 297 条 · 内容指纹 sha256:4f2a…c81e。变更日志与 Data Card 已一并生成。"
          });
        }
      }, "\u786E\u8BA4\u53D1\u5E03"))
    }, /*#__PURE__*/React.createElement(DL, {
      rows: [["版本号", "DS-KITCH-FOLD-v3"], ["条数 / 时长", "297 条 / 0.52 小时"], ["处理步骤", pipe.length + " 步"], ["分层划分", "按场景分层，训练 / 验证 / 测试 = 8 : 1 : 1"], ["泄露检测", "阻断同场景跨集重叠 · 当前 0 处"], ["预计体积", "412 GB（含分片与索引）"], ["替代关系", "替代 DS-KITCH-FOLD-v2"]]
    }), /*#__PURE__*/React.createElement("div", {
      className: "warnbox"
    }, "\u53D1\u5E03\u64CD\u4F5C\u5728\u8BAD\u7EC3\u4FA7\u7ACB\u5373\u751F\u6548\u3002\u82E5\u53D1\u73B0\u6570\u636E\u95EE\u9898\uFF0C\u4E0D\u5141\u8BB8\u539F\u5730\u4FEE\u6539\uFF0C\u9700\u53D1\u65B0\u7248\u672C\u5E76\u6807\u6CE8\u66FF\u4EE3\u5173\u7CFB\u3002")) : null);
  }

  /* ============================================================
     其余平台页：配方库 / 快照 / 交付 / 标注任务 / 仿真 / 看板 / 安全 / 配置
     ============================================================ */
  function Snapshots({
    set
  }) {
    const toast = window.UI.useToast();
    return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(PageHead, {
      crumbs: [{
        label: "数据集"
      }, {
        label: "快照与版本"
      }],
      title: "\u5FEB\u7167\u4E0E\u7248\u672C",
      desc: "\u6BCF\u6B21\u52A0\u5DE5\u4EA7\u751F\u65B0\u7248\u672C\uFF0C\u5386\u53F2\u7248\u672C\u4E0D\u53EF\u53D8\u3002\u7531\u539F\u59CB\u8BB0\u5F55\u5230\u6570\u636E\u96C6\u5FEB\u7167\u7684\u5B8C\u6574\u94FE\u8DEF\u53EF\u8FFD\u6EAF\uFF0C\u6539\u5224\u6216\u5220\u9664\u65F6\u53EF\u5217\u51FA\u53D7\u5F71\u54CD\u7684\u6570\u636E\u96C6\u3002",
      meta: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Tag, {
        tone: "ok",
        dot: true
      }, "\u5DF2\u53D1\u5E03 4"), /*#__PURE__*/React.createElement(Tag, {
        tone: "warn",
        dot: true
      }, "\u5F85\u53D1\u5E03 1\uFF08\u6CC4\u9732\u963B\u65AD\uFF09"), /*#__PURE__*/React.createElement(Tag, {
        tone: "quiet"
      }, "\u5171 14 \u4E2A\u7248\u672C")),
      actions: /*#__PURE__*/React.createElement(Btn, {
        icon: "branch",
        tone: "ghost",
        onClick: () => toast.push({
          tone: "info",
          title: "影响面分析",
          desc: "选择任意数据单元即可列出受影响的数据集快照与训练侧引用点。"
        })
      }, "\u5F71\u54CD\u9762\u5206\u6790")
    }), /*#__PURE__*/React.createElement("div", {
      className: "pagebody"
    }, /*#__PURE__*/React.createElement("div", {
      className: "panel",
      style: {
        overflow: "hidden"
      }
    }, /*#__PURE__*/React.createElement("table", {
      className: "table"
    }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "\u6570\u636E\u96C6\u5FEB\u7167"), /*#__PURE__*/React.createElement("th", null, "\u6765\u6E90\u4EFB\u52A1"), /*#__PURE__*/React.createElement("th", {
      className: "num"
    }, "\u6761\u6570"), /*#__PURE__*/React.createElement("th", {
      className: "num"
    }, "\u65F6\u957F"), /*#__PURE__*/React.createElement("th", null, "\u5185\u5BB9\u6307\u7EB9"), /*#__PURE__*/React.createElement("th", null, "\u53D1\u5E03"), /*#__PURE__*/React.createElement("th", null, "\u72B6\u6001"), /*#__PURE__*/React.createElement("th", null, "\u8BAD\u7EC3\u4FA7\u5F15\u7528"))), /*#__PURE__*/React.createElement("tbody", null, D.SNAPSHOTS.map(s => /*#__PURE__*/React.createElement("tr", {
      key: s.id,
      className: "clickable",
      onClick: () => set({
        page: "delivery"
      })
    }, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontWeight: 600
      }
    }, s.id), /*#__PURE__*/React.createElement("div", {
      className: "tiny muted-3 mono"
    }, s.date, " \xB7 ", s.by)), /*#__PURE__*/React.createElement("td", {
      className: "mono small"
    }, s.task), /*#__PURE__*/React.createElement("td", {
      className: "num"
    }, s.n), /*#__PURE__*/React.createElement("td", {
      className: "num"
    }, s.hours, "h"), /*#__PURE__*/React.createElement("td", {
      className: "mono tiny muted"
    }, s.fp), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement(Tag, {
      tone: s.state === "已发布" ? "ok" : s.state === "待发布" ? "warn" : "quiet",
      dot: true
    }, s.state)), /*#__PURE__*/React.createElement("td", {
      className: "tiny muted-3"
    }, s.state === "已替代" ? "已被 v3 替代" : s.state === "待发布" ? "阻塞：场景泄露 1 处" : "不可变"), /*#__PURE__*/React.createElement("td", {
      className: "tiny muted"
    }, s.used))))), /*#__PURE__*/React.createElement("div", {
      className: "panel-foot"
    }, /*#__PURE__*/React.createElement(Icon, {
      n: "lock",
      s: 12
    }), /*#__PURE__*/React.createElement("span", null, "\u5DF2\u53D1\u5E03\u7248\u672C\u65E0\u6CD5\u539F\u5730\u4FEE\u6539\uFF1B\u9700\u8981\u4FEE\u6B63\u65F6\u53D1\u65B0\u7248\u672C\u5E76\u6807\u6CE8\u66FF\u4EE3\u5173\u7CFB\uFF08\u5BF9\u5E94\u9A8C\u6536\u9879 V09\uFF09\u3002")))));
  }
  function Delivery({
    set,
    inPortal
  }) {
    const toast = window.UI.useToast();
    const V = D.DELIVERY,
      C = D.DATA_CARD;
    const [tab, setTab] = useState("清单");
    const [obj, setObj] = useState(false);
    const [dl, setDl] = useState(false);
    const body = /*#__PURE__*/React.createElement("div", {
      className: "pagebody"
    }, /*#__PURE__*/React.createElement("div", {
      className: "grid g-4",
      style: {
        marginBottom: 14
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "panel-inset",
      style: {
        padding: 12
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "tiny muted-3"
    }, "\u4EA4\u4ED8\u8FDB\u5EA6"), /*#__PURE__*/React.createElement("div", {
      className: "mono",
      style: {
        fontSize: 23,
        fontWeight: 600
      }
    }, Math.round(V.progress * 100), "%"), /*#__PURE__*/React.createElement("div", {
      className: "bar",
      style: {
        marginTop: 8
      }
    }, /*#__PURE__*/React.createElement("i", {
      style: {
        width: V.progress * 100 + "%"
      }
    }))), /*#__PURE__*/React.createElement("div", {
      className: "panel-inset",
      style: {
        padding: 12
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "tiny muted-3"
    }, "\u4EA4\u4ED8\u5305\u4F53\u79EF"), /*#__PURE__*/React.createElement("div", {
      className: "mono",
      style: {
        fontSize: 23,
        fontWeight: 600
      }
    }, "412", /*#__PURE__*/React.createElement("span", {
      className: "tiny muted-3"
    }, " GB")), /*#__PURE__*/React.createElement("div", {
      className: "tiny muted-3",
      style: {
        marginTop: 8
      }
    }, "\u542B\u5206\u7247\u4E0E\u7D22\u5F15\u6587\u4EF6")), /*#__PURE__*/React.createElement("div", {
      className: "panel-inset",
      style: {
        padding: 12
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "tiny muted-3"
    }, "\u4EA4\u4ED8\u65E5\u671F"), /*#__PURE__*/React.createElement("div", {
      className: "mono",
      style: {
        fontSize: 23,
        fontWeight: 600,
        color: "var(--warn)"
      }
    }, V.due), /*#__PURE__*/React.createElement("div", {
      className: "tiny muted-3",
      style: {
        marginTop: 8
      }
    }, "\u8D23\u4EFB\u4EBA ", inPortal ? "客户方" : "项目经理")), /*#__PURE__*/React.createElement("div", {
      className: "panel-inset",
      style: {
        padding: 12
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "tiny muted-3"
    }, "\u9A8C\u6536\u72B6\u6001"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 17,
        fontWeight: 600,
        marginTop: 4
      }
    }, /*#__PURE__*/React.createElement(Tag, {
      tone: "accent",
      dot: true
    }, "\u5F85\u5BA2\u6237\u9A8C\u6536")), /*#__PURE__*/React.createElement("div", {
      className: "tiny muted-3",
      style: {
        marginTop: 6
      }
    }, "\u9A8C\u6536\u72B6\u6001\u5BF9\u5916\u53EF\u89C1"))), /*#__PURE__*/React.createElement("div", {
      className: "row-tight",
      style: {
        gap: 4,
        marginBottom: 12
      }
    }, ["清单", "Data Card", "格式与转换", "质量报告", "验收与异议"].map(x => /*#__PURE__*/React.createElement("button", {
      key: x,
      className: "btn",
      "aria-pressed": tab === x,
      style: tab === x ? {
        background: "var(--surface-3)",
        borderColor: "var(--line-strong)"
      } : null,
      onClick: () => setTab(x)
    }, x))), tab === "清单" ? /*#__PURE__*/React.createElement("div", {
      className: "grid",
      style: {
        gridTemplateColumns: "minmax(0,1.3fr) minmax(0,1fr)"
      }
    }, /*#__PURE__*/React.createElement(Panel, {
      title: "\u4EA4\u4ED8\u5305\u5185\u5BB9",
      sub: "\u56DB\u4EF6\u4E00\u4F53\uFF0C\u7F3A\u4E00\u5219\u4EA4\u4ED8\u4E0D\u5B8C\u6574",
      flush: true
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        padding: 14,
        display: "flex",
        flexDirection: "column",
        gap: 8
      }
    }, V.content.map(c => /*#__PURE__*/React.createElement("div", {
      key: c.k,
      className: "spread",
      style: {
        padding: "11px 12px",
        border: "1px solid var(--line)",
        borderRadius: 4,
        background: c.st === "pending" ? "var(--surface-2)" : "transparent"
      }
    }, /*#__PURE__*/React.createElement("span", {
      className: "row",
      style: {
        gap: 10
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      n: c.st === "pending" ? "clock" : "check",
      s: 15,
      style: {
        color: c.st === "pending" ? "var(--warn)" : "var(--ok)"
      }
    }), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("span", {
      className: "small",
      style: {
        fontWeight: 600
      }
    }, c.k), /*#__PURE__*/React.createElement("span", {
      className: "tiny muted-3",
      style: {
        display: "block",
        marginTop: 2
      }
    }, c.v))), /*#__PURE__*/React.createElement(Tag, {
      tone: c.st === "pending" ? "warn" : "ok",
      dot: true
    }, c.st === "pending" ? "待客户签认" : "已生成"))), /*#__PURE__*/React.createElement("div", {
      className: "warnbox info",
      style: {
        marginTop: 4
      }
    }, "Data Card \u5FC5\u987B\u968F\u6570\u636E\u4E00\u8D77\u8D70\uFF1A\u5B83\u627F\u8F7D\u6765\u6E90\u3001\u5206\u5E03\u3001\u8D28\u91CF\u3001\u9650\u5236\u4E0E\u6388\u6743\uFF0C\u662F\u5BA2\u6237\u5224\u65AD\u6570\u636E\u80FD\u5426\u7528\u4E8E\u8BAD\u7EC3\u7684\u4F9D\u636E\u3002"))), /*#__PURE__*/React.createElement(Panel, {
      title: "\u4EA4\u4ED8\u6D41\u7A0B",
      sub: "\u9636\u6BB5\u4E0E\u8D23\u4EFB\u4EBA",
      flush: true
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        padding: 14
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "tlflow"
    }, V.steps.map((s, i) => /*#__PURE__*/React.createElement("div", {
      key: s.k,
      className: cls("tlflow-node", s.st === "done" ? "done" : s.st === "active" ? "active" : "")
    }, /*#__PURE__*/React.createElement("div", {
      className: "tlflow-rail"
    }, /*#__PURE__*/React.createElement("span", {
      className: "tlflow-dot"
    }, s.st === "done" ? /*#__PURE__*/React.createElement(Icon, {
      n: "check",
      s: 12,
      sw: 2.6
    }) : s.st === "active" ? /*#__PURE__*/React.createElement(Icon, {
      n: "activity",
      s: 12
    }) : "·"), i < V.steps.length - 1 ? /*#__PURE__*/React.createElement("span", {
      className: "tlflow-line"
    }) : null), /*#__PURE__*/React.createElement("div", {
      className: "tlflow-body"
    }, /*#__PURE__*/React.createElement("div", {
      className: "spread"
    }, /*#__PURE__*/React.createElement("span", {
      className: "small",
      style: {
        fontWeight: 600
      }
    }, s.k), /*#__PURE__*/React.createElement("span", {
      className: "tiny muted-3 mono"
    }, s.t))))))))) : null, tab === "Data Card" ? /*#__PURE__*/React.createElement("div", {
      className: "grid",
      style: {
        gridTemplateColumns: "minmax(0,1.4fr) minmax(0,1fr)"
      }
    }, /*#__PURE__*/React.createElement(Panel, {
      title: C.id,
      sub: "\u968F\u4EA4\u4ED8\u9644\u5E26\u7684\u6570\u636E\u96C6\u8BF4\u660E\u5361",
      flush: true
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        padding: 14,
        display: "flex",
        flexDirection: "column",
        gap: 12
      }
    }, /*#__PURE__*/React.createElement(DL, {
      rows: [["来源", C.source], ["本体", C.embody], ["传感器", C.sensors], ["场景", C.scene], ["分布", C.distribution], ["质量", C.quality], ["授权", C.license]]
    }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      className: "field-label",
      style: {
        marginBottom: 7
      }
    }, "\u5DF2\u77E5\u9650\u5236\uFF08\u5FC5\u987B\u663E\u5F0F\u58F0\u660E\uFF0C\u907F\u514D\u4E0B\u6E38\u8BEF\u7528\uFF09"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 6
      }
    }, C.limits.map((l, i) => /*#__PURE__*/React.createElement("div", {
      key: i,
      className: "panel-inset",
      style: {
        padding: "9px 11px",
        borderLeft: "3px solid var(--danger)",
        display: "flex",
        gap: 8
      }
    }, /*#__PURE__*/React.createElement("span", {
      className: "mono tiny muted-3",
      style: {
        flex: "0 0 auto"
      }
    }, "L", i + 1), /*#__PURE__*/React.createElement("span", {
      className: "small pretty",
      style: {
        lineHeight: 1.7
      }
    }, l))))), /*#__PURE__*/React.createElement("div", {
      className: "panel-inset",
      style: {
        padding: 11
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "row",
      style: {
        gap: 8
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      n: "shield",
      s: 14,
      style: {
        color: "var(--accent)"
      }
    }), /*#__PURE__*/React.createElement("span", {
      className: "small"
    }, C.watermark))))), /*#__PURE__*/React.createElement("div", {
      className: "col",
      style: {
        gap: 14
      }
    }, /*#__PURE__*/React.createElement(Panel, {
      title: "\u4E0B\u8F7D\u6388\u6743",
      sub: "\u5916\u90E8\u4E0B\u8F7D\u5FC5\u987B\u5E26\u65F6\u6548\u4E0E\u6C34\u5370",
      flush: true
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        padding: 14,
        display: "flex",
        flexDirection: "column",
        gap: 10
      }
    }, /*#__PURE__*/React.createElement(DL, {
      rows: [["授权对象", "恒立机器人 · 算法组（3 个账号）"], ["有效期", "2026-09-14 至 2026-09-28"], ["水印", "已嵌入 · WM-2f91c4"], ["下载次数", "2 / 5"], ["留痕", "全程记录，可在审计日志检索"]]
    }), /*#__PURE__*/React.createElement(Btn, {
      tone: inPortal ? "primary" : "ghost",
      block: true,
      icon: "download",
      onClick: () => setDl(true)
    }, "\u53D1\u8D77\u4E0B\u8F7D"), /*#__PURE__*/React.createElement(Btn, {
      tone: "ghost",
      block: true,
      icon: "code",
      onClick: () => set({
        domain: "dataset",
        page: "api"
      })
    }, "\u901A\u8FC7\u5F00\u653E\u63A5\u53E3\u62C9\u53D6"), /*#__PURE__*/React.createElement("div", {
      className: "tiny muted-3",
      style: {
        lineHeight: 1.6
      }
    }, "\u4E00\u6B21\u6027\u538B\u7F29\u5305\u9002\u5408\u9A8C\u6536\uFF1B\u7B97\u6CD5\u56E2\u961F\u6301\u7EED\u53D6\u6570\u8BF7\u8D70\u5F00\u653E\u63A5\u53E3\uFF0C\u6309\u7247\u6BB5\u62C9\u53D6\u3001\u53EF\u65AD\u70B9\u7EED\u4F20\uFF0C\u4E14\u5171\u7528\u540C\u4E00\u5957\u51ED\u8BC1\u4E0E\u7559\u75D5\u3002"))), /*#__PURE__*/React.createElement(Panel, {
      title: "\u5408\u89C4",
      sub: "\u5BA2\u6237\u6570\u636E\u9694\u79BB",
      flush: true
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        padding: 14,
        display: "flex",
        flexDirection: "column",
        gap: 8
      }
    }, [["客户间不可见、不可搜、不可导", true], ["传输 TLS 加密 · 静态落盘密文", true], ["交付包可溯源到接收方", true], ["密钥可轮换", true]].map(r => /*#__PURE__*/React.createElement("div", {
      key: r[0],
      className: "spread"
    }, /*#__PURE__*/React.createElement("span", {
      className: "small muted"
    }, r[0]), /*#__PURE__*/React.createElement(Tag, {
      tone: "ok",
      icon: "check"
    }, "\u901A\u8FC7"))))))) : null, tab === "质量报告" ? /*#__PURE__*/React.createElement(Panel, {
      title: "\u8D28\u91CF\u8BC4\u4F30\u62A5\u544A QER-KITCH-FOLD-v3",
      sub: "\u9762\u5411\u5BA2\u6237",
      flush: true
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        padding: 14,
        display: "flex",
        flexDirection: "column",
        gap: 14
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "grid g-4",
      style: {
        gap: 10
      }
    }, [["一次通过率", "91.3%", "ok"], ["数据集可用率", "100%", "ok"], ["边缘难例占比", "36.7%", "warn"], ["无效样本", "0 条", "ok"]].map(m => /*#__PURE__*/React.createElement("div", {
      key: m[0],
      className: "panel-inset",
      style: {
        padding: 11
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "tiny muted-3"
    }, m[0]), /*#__PURE__*/React.createElement("div", {
      className: "mono",
      style: {
        fontSize: 20,
        fontWeight: 600,
        color: "var(--" + m[2] + ")"
      }
    }, m[1])))), /*#__PURE__*/React.createElement("div", {
      className: "grid g-2",
      style: {
        gap: 14
      }
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      className: "field-label",
      style: {
        marginBottom: 8
      }
    }, "\u7EF4\u5EA6\u901A\u8FC7\u7387"), [["同步", 99.2], ["完整性", 94.4], ["可见性", 91.8], ["内容质量", 88.1], ["合规", 99.7], ["观测动作一致性", 93.5]].map(d => /*#__PURE__*/React.createElement("div", {
      key: d[0],
      style: {
        marginBottom: 9
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "spread tiny",
      style: {
        marginBottom: 4
      }
    }, /*#__PURE__*/React.createElement("span", {
      className: "muted"
    }, d[0]), /*#__PURE__*/React.createElement("span", {
      className: "mono"
    }, d[1], "%")), /*#__PURE__*/React.createElement("div", {
      className: "bar"
    }, /*#__PURE__*/React.createElement("i", {
      style: {
        width: d[1] + "%",
        background: d[1] < 90 ? "var(--warn)" : "var(--ok)"
      }
    }))))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      className: "field-label",
      style: {
        marginBottom: 8
      }
    }, "\u9A73\u56DE\u539F\u56E0 TOP 5"), D.REJECT_DIST.slice(0, 5).map(x => /*#__PURE__*/React.createElement("div", {
      key: x.code,
      className: "spread",
      style: {
        padding: "6px 0",
        borderBottom: "1px solid var(--line-soft)"
      }
    }, /*#__PURE__*/React.createElement("span", {
      className: "row",
      style: {
        gap: 7
      }
    }, /*#__PURE__*/React.createElement("span", {
      className: "codechip"
    }, x.code), /*#__PURE__*/React.createElement("span", {
      className: "small"
    }, x.name)), /*#__PURE__*/React.createElement("span", {
      className: "mono small"
    }, x.n))))))) : null, tab === "验收与异议" ? /*#__PURE__*/React.createElement("div", {
      className: "grid",
      style: {
        gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)"
      }
    }, /*#__PURE__*/React.createElement(Panel, {
      title: "\u5F02\u8BAE\u8BB0\u5F55",
      sub: "\u5F02\u8BAE\u5FC5\u987B\u7ED3\u6784\u5316\u5E76\u951A\u5B9A\u5230\u5177\u4F53\u7247\u6BB5\u6216\u5B57\u6BB5",
      flush: true,
      right: /*#__PURE__*/React.createElement(Btn, {
        size: "sm",
        tone: "primary",
        icon: "plus",
        onClick: () => setObj(true)
      }, "\u63D0\u5F02\u8BAE")
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        padding: 14,
        display: "flex",
        flexDirection: "column",
        gap: 10
      }
    }, D.OBJECTIONS.map(o => /*#__PURE__*/React.createElement("div", {
      key: o.id,
      className: "panel",
      style: {
        background: "var(--surface-1)"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        padding: 12
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "spread"
    }, /*#__PURE__*/React.createElement("span", {
      className: "row",
      style: {
        gap: 8
      }
    }, /*#__PURE__*/React.createElement("span", {
      className: "mono small"
    }, o.id), /*#__PURE__*/React.createElement(Tag, {
      tone: o.st === "处理中" ? "warn" : "quiet",
      dot: true
    }, o.st)), /*#__PURE__*/React.createElement("span", {
      className: "tiny muted-3"
    }, o.by, " \xB7 ", o.t)), /*#__PURE__*/React.createElement("div", {
      className: "small pretty",
      style: {
        marginTop: 8,
        lineHeight: 1.75
      }
    }, o.text), /*#__PURE__*/React.createElement("div", {
      className: "row",
      style: {
        gap: 6,
        marginTop: 9,
        flexWrap: "wrap"
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      n: "target",
      s: 12,
      style: {
        color: "var(--accent)",
        flex: "0 0 auto"
      }
    }), /*#__PURE__*/React.createElement("span", {
      className: "codechip"
    }, o.anchor)), /*#__PURE__*/React.createElement("div", {
      className: "small muted pretty",
      style: {
        marginTop: 9,
        paddingLeft: 10,
        borderLeft: "2px solid var(--accent-line)",
        lineHeight: 1.7
      }
    }, o.reply)))))), /*#__PURE__*/React.createElement("div", {
      className: "col",
      style: {
        gap: 14
      }
    }, /*#__PURE__*/React.createElement(Panel, {
      title: "\u9A8C\u6536\u5355 ACC-KITCH-FOLD-v3",
      sub: "\u7F3A\u4E00\u5219\u4EA4\u4ED8\u4E0D\u5B8C\u6574",
      flush: true
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        padding: 14,
        display: "flex",
        flexDirection: "column",
        gap: 8
      }
    }, [["数据集规模与描述相符", true], ["Data Card 字段完整", true], ["质量报告已随附", true], ["已知限制已声明", true], ["下载授权已生效", true], ["客户签认", false]].map(r => /*#__PURE__*/React.createElement("div", {
      key: r[0],
      className: "spread",
      style: {
        padding: "9px 0",
        borderBottom: "1px solid var(--line-soft)"
      }
    }, /*#__PURE__*/React.createElement("span", {
      className: "small muted"
    }, r[0]), r[1] ? /*#__PURE__*/React.createElement(Tag, {
      tone: "ok",
      icon: "check"
    }, "\u901A\u8FC7") : /*#__PURE__*/React.createElement(Tag, {
      tone: "warn",
      icon: "clock"
    }, "\u5F85\u7B7E\u8BA4"))))), /*#__PURE__*/React.createElement(Panel, {
      title: "\u4EA4\u4ED8\u8BF4\u660E",
      flush: true
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        padding: 14,
        display: "flex",
        flexDirection: "column",
        gap: 10
      }
    }, /*#__PURE__*/React.createElement(DL, {
      rows: [["快照", "DS-KITCH-FOLD-v3"], ["格式", "LeRobot v2.1 + HDF5 双份"], ["分片", "每片 512 条，共 1 片"], ["加载方式", "流式与随机访问两种，原生 PyTorch Dataset"], ["核验", "内容指纹 sha256:4f2a…c81e"]]
    }), /*#__PURE__*/React.createElement("div", {
      className: "tiny muted-3",
      style: {
        lineHeight: 1.65
      }
    }, "\u8BAD\u7EC3\u4FA7\u6D41\u5F0F\u52A0\u8F7D\uFF1A\u5177\u8EAB\u6570\u636E\u96C6\u4F53\u79EF\u5DE8\u5927\uFF0C\u65E0\u6CD5\u4E00\u6B21\u6027\u8F7D\u5165\u5185\u5B58\uFF0CSDK \u63D0\u4F9B\u6D41\u5F0F\u4E0E\u968F\u673A\u8BBF\u95EE\u4E24\u79CD\u65B9\u5F0F\uFF0C\u987A\u5E8F\u4E0E\u968F\u673A\u8BBF\u95EE\u7ED3\u679C\u4E00\u81F4\u3002"))))) : null, tab === "格式与转换" ? /*#__PURE__*/React.createElement("div", {
      className: "col",
      style: {
        gap: 14
      }
    }, /*#__PURE__*/React.createElement(Panel, {
      title: "\u683C\u5F0F\u4E0E\u8F6C\u6362",
      sub: "\u6E90\u683C\u5F0F\u4E00\u6B21\u843D\u76D8\uFF1B\u8F6C\u6362\u6210\u6807\u51C6\u683C\u5F0F\u4F9B\u8BAD\u7EC3\u4FA7\u76F4\u63A5\u6D88\u8D39\uFF0C\u8F6C\u6362\u4E0D\u6539\u6E90\uFF0C\u53EF\u968F\u65F6\u91CD\u653E",
      right: /*#__PURE__*/React.createElement(Tag, {
        tone: "quiet",
        icon: "cube"
      }, "\u6E90\u683C\u5F0F AIRS HDF5 \xB7 \u5206\u5757\u5199\u5165"),
      flush: true
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        overflowX: "auto"
      }
    }, /*#__PURE__*/React.createElement("table", {
      className: "table"
    }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", {
      style: {
        width: 108
      }
    }, "\u76EE\u6807\u683C\u5F0F"), /*#__PURE__*/React.createElement("th", null, "\u9002\u7528"), /*#__PURE__*/React.createElement("th", {
      style: {
        width: 200
      }
    }, "\u8F6C\u6362\u5DE5\u5177"), /*#__PURE__*/React.createElement("th", {
      style: {
        width: 190
      }
    }, "\u8F6C\u6362\u540E\u6821\u9A8C"), /*#__PURE__*/React.createElement("th", {
      style: {
        width: 78
      }
    }, "\u72B6\u6001"))), /*#__PURE__*/React.createElement("tbody", null, [["Parquet", "离线分析 · Pandas / DuckDB", "convert_h5_to_parquet.py", "行数与字段类型与源一致", "已生成"], ["Zarr", "云端 · 多 GPU 并行读取", "convert_h5_to_zarr.py", "分块边界与源一致", "已生成"], ["LeRobot v3", "PyTorch 训练 · 推送 HuggingFace Hub", "convert_h5_to_lerobot.py", "episode 数与帧索引一致", "已生成"], ["JSON Lines", "调试 · 逐条抽查", "convert_h5_to_jsonl.py", "逐条可解析、无 NaN / Inf", "按需"]].map(r => /*#__PURE__*/React.createElement("tr", {
      key: r[0]
    }, /*#__PURE__*/React.createElement("td", {
      className: "small",
      style: {
        fontWeight: 600
      }
    }, r[0]), /*#__PURE__*/React.createElement("td", {
      className: "muted pretty"
    }, r[1]), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("span", {
      className: "codechip"
    }, r[2])), /*#__PURE__*/React.createElement("td", {
      className: "tiny muted-3"
    }, r[3]), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement(Tag, {
      tone: r[4] === "已生成" ? "ok" : "quiet",
      dot: true
    }, r[4]))))))), /*#__PURE__*/React.createElement("div", {
      className: "panel-foot"
    }, /*#__PURE__*/React.createElement(Icon, {
      n: "info",
      s: 12
    }), /*#__PURE__*/React.createElement("span", null, "\u6BCF\u4E2A\u8F6C\u6362\u5668\u5728\u8FD0\u884C\u524D\u5148\u5BF9\u6E90 HDF5 \u505A\u4E00\u6B21\u5185\u8054\u6821\u9A8C\uFF1A\u6E90\u672C\u8EAB\u4E0D\u5408\u683C\u65F6\u76F4\u63A5\u7EC8\u6B62\uFF0C\u4E0D\u4EA7\u51FA\u534A\u6210\u54C1\u3002"))), /*#__PURE__*/React.createElement("div", {
      className: "grid g-2",
      style: {
        gap: 14
      }
    }, /*#__PURE__*/React.createElement(Panel, {
      title: "\u63A8\u9001\u5230\u8BAD\u7EC3\u4FA7",
      sub: "LeRobot v3 \u2192 HuggingFace Hub",
      flush: true
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        padding: 14,
        display: "flex",
        flexDirection: "column",
        gap: 10
      }
    }, /*#__PURE__*/React.createElement(DL, {
      rows: [["目标仓库", "internal/DS-KITCH-FOLD-v3"], ["格式", "LeRobot v3"], ["分片", "1 片 · 512 条"], ["可见性", "私有 · 仅授权账号"], ["核验", "内容指纹 sha256:4f2a…c81e"]]
    }), /*#__PURE__*/React.createElement(Btn, {
      tone: "ghost",
      block: true,
      icon: "upload",
      onClick: () => toast.push({
        tone: "ok",
        title: "已推送到 Hub",
        desc: "LeRobot v3 数据集已推送至私有仓库，仅授权账号可拉取；推送动作已记入审计日志。"
      })
    }, "\u63A8\u9001\u5230 Hub"))), /*#__PURE__*/React.createElement(Panel, {
      title: "\u4E3A\u4EC0\u4E48\u4E0D\u53EA\u7ED9\u4E00\u4EFD\u538B\u7F29\u5305",
      sub: "\u683C\u5F0F\u4E0E\u6D88\u8D39\u65B9\u5F0F\u51B3\u5B9A\u590D\u7528\u7387",
      flush: true
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        padding: 14,
        display: "flex",
        flexDirection: "column",
        gap: 10
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "warnbox info"
    }, "\u540C\u4E00\u4EFD\u6570\u636E\uFF0C\u8BAD\u7EC3\u4FA7\u8981\u7684\u662F\u80FD\u76F4\u63A5\u6D41\u5F0F\u52A0\u8F7D\u7684\u6807\u51C6\u683C\u5F0F\uFF1B\u53EA\u7ED9\u538B\u7F29\u5305\uFF0C\u7B49\u4E8E\u628A\u89E3\u5305\u3001\u5BF9\u9F50\u4E0E\u5199 Dataset \u7684\u6210\u672C\u8F6C\u5AC1\u7ED9\u5BA2\u6237\u3002"), [["源格式", "AIRS HDF5 · 分块写入，保留多流原始时序"], ["标准格式", "Parquet / Zarr / LeRobot v3，按用途各取所需"], ["在线消费", "走开放接口按片段拉取，支持断点续传"], ["三者关系", "同一快照的多副面孔，内容指纹一致，不产生第二份事实"]].map(r => /*#__PURE__*/React.createElement("div", {
      key: r[0],
      className: "row",
      style: {
        gap: 10,
        padding: "8px 0",
        borderBottom: "1px solid var(--line-soft)",
        alignItems: "flex-start"
      }
    }, /*#__PURE__*/React.createElement("span", {
      className: "small",
      style: {
        fontWeight: 600,
        flex: "0 0 62px"
      }
    }, r[0]), /*#__PURE__*/React.createElement("span", {
      className: "small muted pretty grow"
    }, r[1]))))))) : null);
    return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(PageHead, {
      crumbs: inPortal ? [{
        label: "客户门户"
      }, {
        label: "交付与验收"
      }] : [{
        label: "数据集"
      }, {
        label: "导出与交付"
      }],
      title: inPortal ? "交付与验收" : "导出与交付",
      desc: "\u6570\u636E\u96C6\u3001Data Card\u3001\u8D28\u91CF\u62A5\u544A\u3001\u9A8C\u6536\u5355\u56DB\u4EF6\u4E00\u4F53\uFF0C\u7F3A\u4E00\u5219\u4EA4\u4ED8\u4E0D\u5B8C\u6574\u3002\u9A8C\u6536\u72B6\u6001\u5BF9\u5916\u53EF\u89C1\uFF0C\u5BA2\u6237\u95E8\u6237\u7684\u8FDB\u5EA6\u5FC5\u987B\u4E0E\u5B9E\u9645\u4E00\u81F4\uFF0C\u907F\u514D\u9500\u552E\u627F\u8BFA\u4E0E\u751F\u4EA7\u5B9E\u9645\u8131\u8282\u3002",
      meta: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Tag, {
        tone: "quiet",
        icon: "file"
      }, V.id, " \xB7 ", V.customer, " \xB7 ", V.code), /*#__PURE__*/React.createElement(Tag, {
        tone: "quiet",
        icon: "cube"
      }, V.snapshot), /*#__PURE__*/React.createElement(Tag, {
        tone: "warn",
        icon: "clock"
      }, "\u4EA4\u671F ", V.due)),
      actions: !inPortal ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Btn, {
        icon: "bell",
        tone: "ghost",
        onClick: () => toast.push({
          tone: "warn",
          title: "已催办",
          desc: "已将验收提醒推送至客户门户联系人，并抄送项目经理。"
        })
      }, "\u50AC\u529E\u9A8C\u6536"), /*#__PURE__*/React.createElement(Btn, {
        icon: "send",
        tone: "primary",
        onClick: () => toast.push({
          tone: "ok",
          title: "已重新推送门户",
          desc: "交付清单与下载入口已更新，客户可见。"
        })
      }, "\u63A8\u9001\u95E8\u6237")) : null
    }), body, obj ? /*#__PURE__*/React.createElement(ObjectionDialog, {
      onClose: () => setObj(false)
    }) : null, dl ? /*#__PURE__*/React.createElement(Modal, {
      title: "\u53D1\u8D77\u4E0B\u8F7D",
      desc: "\u5916\u90E8\u4E0B\u8F7D\u5FC5\u987B\u5E26\u65F6\u6548\u4E0E\u6C34\u5370\uFF0C\u5E76\u5168\u7A0B\u7559\u75D5\u3002",
      onClose: () => setDl(false),
      width: 480,
      foot: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Btn, {
        tone: "ghost",
        onClick: () => setDl(false)
      }, "\u53D6\u6D88"), /*#__PURE__*/React.createElement(Btn, {
        tone: "primary",
        icon: "download",
        onClick: () => {
          setDl(false);
          toast.push({
            tone: "ok",
            title: "下载已开始",
            desc: "文件已带水印 WM-2f91c4 与时效链接（48 小时）。本次下载已记入审计日志。"
          });
        }
      }, "\u786E\u8BA4\u4E0B\u8F7D"))
    }, /*#__PURE__*/React.createElement(DL, {
      rows: [["对象", "DS-KITCH-FOLD-v3 · 412 GB"], ["授权有效期", "至 2026-09-28"], ["水印", "WM-2f91c4（可溯源到接收方）"], ["本次为", "第 3 / 5 次下载"]]
    }), /*#__PURE__*/React.createElement("div", {
      className: "warnbox"
    }, "\u4E0B\u8F7D\u94FE\u63A5\u4E0D\u53EF\u8F6C\u53D1\u3002\u5206\u53D1\u540E\u53EF\u7531\u6C34\u5370\u4E0E\u6765\u6E90\u6307\u7EB9\u5B9A\u4F4D\u6CC4\u9732\u63A5\u6536\u65B9\u3002")) : null);
  }
  function ObjectionDialog({
    onClose
  }) {
    const toast = window.UI.useToast();
    const [anchor, setAnchor] = useState(true);
    return /*#__PURE__*/React.createElement(Modal, {
      title: "\u63D0\u4EA4\u5F02\u8BAE",
      desc: "\u5F02\u8BAE\u9700\u5173\u8054\u5230\u5177\u4F53\u7247\u6BB5\u6216\u5B57\u6BB5\uFF0C\u5426\u5219\u6574\u6539\u65E0\u6CD5\u6267\u884C\uFF0C\u53EA\u80FD\u53CD\u590D\u6C9F\u901A\u3002",
      onClose: onClose,
      width: 560,
      foot: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Btn, {
        tone: "ghost",
        onClick: onClose
      }, "\u53D6\u6D88"), /*#__PURE__*/React.createElement(Btn, {
        tone: "primary",
        disabled: !anchor,
        icon: "send",
        onClick: () => {
          onClose();
          toast.push({
            tone: "ok",
            title: "异议已提交",
            desc: "已生成整改任务 OBJ-0008 并关联到采集环节，指派现场督导。整改完成后重新提交验收。"
          });
        }
      }, "\u63D0\u4EA4\u5F02\u8BAE"))
    }, /*#__PURE__*/React.createElement(Field, {
      label: "\u951A\u70B9\u7C7B\u578B",
      req: true
    }, /*#__PURE__*/React.createElement("div", {
      className: "row",
      style: {
        gap: 10,
        marginTop: 2
      }
    }, /*#__PURE__*/React.createElement("label", {
      className: "check"
    }, /*#__PURE__*/React.createElement("input", {
      type: "radio",
      name: "an",
      defaultChecked: true,
      onChange: () => setAnchor(true)
    }), /*#__PURE__*/React.createElement("span", null, "\u7247\u6BB5 / \u5E27")), /*#__PURE__*/React.createElement("label", {
      className: "check"
    }, /*#__PURE__*/React.createElement("input", {
      type: "radio",
      name: "an"
    }), /*#__PURE__*/React.createElement("span", null, "\u5143\u6570\u636E\u5B57\u6BB5")), /*#__PURE__*/React.createElement("label", {
      className: "check"
    }, /*#__PURE__*/React.createElement("input", {
      type: "radio",
      name: "an"
    }), /*#__PURE__*/React.createElement("span", null, "Data Card \u6761\u76EE")))), /*#__PURE__*/React.createElement(Field, {
      label: "\u951A\u70B9\u5B9A\u4F4D",
      req: true
    }, /*#__PURE__*/React.createElement("select", {
      className: "select"
    }, /*#__PURE__*/React.createElement("option", null, "CLP-81226 \xB7 \u5E27 00:52.300 \u2013 01:04.800\uFF08\u52A8\u4F5C\u6BB5\u300C\u5BF9\u6298\u300D\uFF09"), /*#__PURE__*/React.createElement("option", null, "CLP-81204 \xB7 \u5E27 00:12.100"))), /*#__PURE__*/React.createElement(Field, {
      label: "\u5F02\u8BAE\u5185\u5BB9",
      req: true
    }, /*#__PURE__*/React.createElement("textarea", {
      className: "textarea",
      rows: 4,
      defaultValue: "\u8BE5\u6BB5\u5BF9\u6298\u8F68\u8FF9\u5728 01:00 \u5904\u51FA\u73B0\u660E\u663E\u6296\u52A8\uFF0C\u6000\u7591\u672C\u4F53\u63A7\u5236\u5F02\u5E38\u800C\u975E\u6570\u636E\u95EE\u9898\uFF0C\u8BF7\u786E\u8BA4\u662F\u5426\u5E94\u6392\u9664\u3002"
    })), /*#__PURE__*/React.createElement("div", {
      className: "warnbox info"
    }, "\u63D0\u4EA4\u540E\u5F02\u8BAE\u5C06\u81EA\u52A8\u5173\u8054\u5230\u5BF9\u5E94\u7684\u91C7\u96C6\u6216\u6807\u6CE8\u73AF\u8282\uFF0C\u5E76\u751F\u6210\u5E26\u8D23\u4EFB\u4EBA\u7684\u6574\u6539\u4EFB\u52A1\u3002"));
  }

  /* ---------- 标注任务列表 ---------- */
  function AnnoTasks({
    set
  }) {
    const toast = window.UI.useToast();
    const [rows, setRows] = useState(D.ANNO_CLIPS);
    const [creating, setCreating] = useState(false);
    const [nf, setNf] = useState({
      from: "CLP-81204",
      to: "CLP-81211",
      unit: 3,
      mode: "按段切分",
      who: "标注员 A",
      spec: "CLA-KITCH-FOLD-v4"
    });
    const SPECS = ["CLA-KITCH-FOLD-v4", "CLA-WH-SORT-v2", "CLA-SCREW-v1"];
    const submitNew = () => {
      const n = Number(nf.unit);
      if (!nf.from || !nf.to) {
        toast.push({
          tone: "warn",
          title: "请选择数据区间",
          desc: "拆包需给出起始与结束的 Clip 编号，避免范围不清导致漏标或重标。"
        });
        return;
      }
      if (!n || n <= 0) {
        toast.push({
          tone: "warn",
          title: "单元数必须大于 0",
          desc: "按条数或按段切分，至少产出 1 个可派发单元。"
        });
        return;
      }
      if (!nf.who) {
        toast.push({
          tone: "warn",
          title: "请指定标注员",
          desc: "未指派单元会进入待领取池，请选择首位标注员或先按技能标签智能分派。"
        });
        return;
      }
      const added = [];
      for (let i = 0; i < Math.min(n, 3); i++) {
        added.push({
          id: "CLP-9" + (1200 + rows.length + i),
          name: "厨房台面 · 折叠衣物 · 拆包 #" + (i + 1),
          state: "未领取",
          conf: [],
          pending: 0
        });
      }
      setRows(rs => rs.concat(added));
      setCreating(false);
      toast.push({
        tone: "ok",
        title: "已拆包新建 " + n + " 个单元",
        desc: "范围 " + nf.from + " – " + nf.to + "，" + nf.mode + "，规范 " + nf.spec + "，首位标注员 " + nf.who + "。可再用「智能分派」按技能标签与负荷微调。"
      });
    };
    return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(PageHead, {
      crumbs: [{
        label: "标注"
      }, {
        label: "标注任务"
      }],
      title: "\u6807\u6CE8\u4EFB\u52A1\u4E0E\u6392\u4EA7",
      desc: "\u6309 Clip \u6570\u91CF\u3001\u65F6\u957F\u3001\u96BE\u5EA6\u62C6\u5206\u4E3A\u53EF\u6D3E\u53D1\u5355\u5143\uFF0C\u6309\u6280\u80FD\u6807\u7B7E\u4E0E\u8D1F\u8377\u5206\u6D3E\u3002\u5DE5\u65F6\u4E0E\u8BA1\u4EF7\u53EF\u6309\u6761\u3001\u6309\u6BB5\u6216\u6309\u5DE5\u65F6\u7EDF\u8BA1\u3002",
      meta: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Tag, {
        tone: "quiet"
      }, "\u5728\u529E ", rows.length + 8, " \u4E2A"), /*#__PURE__*/React.createElement(Tag, {
        tone: "warn",
        dot: true
      }, "\u5F85\u590D\u6838 5 \u4E2A"), /*#__PURE__*/React.createElement(Tag, {
        tone: "quiet",
        icon: "users"
      }, "\u5728\u5C97\u6807\u6CE8\u5458 9 \u4EBA")),
      actions: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Btn, {
        icon: "users",
        tone: "ghost",
        onClick: () => toast.push({
          tone: "info",
          title: "已按技能标签与负荷分派",
          desc: "3 个单元已分派给 VLA 标注组，负荷均衡后无人超过 90%。"
        })
      }, "\u667A\u80FD\u5206\u6D3E"), /*#__PURE__*/React.createElement(Btn, {
        icon: "plus",
        tone: "primary",
        onClick: () => setCreating(true)
      }, "\u62C6\u5305\u65B0\u5EFA"))
    }), /*#__PURE__*/React.createElement("div", {
      className: "pagebody"
    }, /*#__PURE__*/React.createElement("div", {
      className: "grid g-3",
      style: {
        marginBottom: 14
      }
    }, [["人均产能", "18.4", "条 / 人日"], ["标注一致性", "86.2", "%（目标 ≥ 85）"], ["返修率", "9.1", "%（目标 ≤ 8）"]].map(m => /*#__PURE__*/React.createElement("div", {
      key: m[0],
      className: "panel-inset",
      style: {
        padding: 13
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "tiny muted-3"
    }, m[0]), /*#__PURE__*/React.createElement("div", {
      className: "mono",
      style: {
        fontSize: 22,
        fontWeight: 600,
        marginTop: 3
      }
    }, m[1], /*#__PURE__*/React.createElement("span", {
      className: "tiny muted-3",
      style: {
        marginLeft: 4
      }
    }, m[2]))))), /*#__PURE__*/React.createElement("div", {
      className: "panel",
      style: {
        overflow: "hidden"
      }
    }, /*#__PURE__*/React.createElement("table", {
      className: "table"
    }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "\u6570\u636E\u5355\u5143"), /*#__PURE__*/React.createElement("th", null, "\u4EFB\u52A1"), /*#__PURE__*/React.createElement("th", null, "\u6807\u6CE8\u5458"), /*#__PURE__*/React.createElement("th", null, "\u89C4\u8303\u7248\u672C"), /*#__PURE__*/React.createElement("th", {
      className: "num"
    }, "\u65F6\u957F"), /*#__PURE__*/React.createElement("th", null, "\u8FDB\u5EA6"), /*#__PURE__*/React.createElement("th", null, "\u72B6\u6001"), /*#__PURE__*/React.createElement("th", null))), /*#__PURE__*/React.createElement("tbody", null, rows.map((c, i) => /*#__PURE__*/React.createElement("tr", {
      key: c.id,
      className: "clickable",
      onClick: () => set({
        page: "workbench",
        payload: {
          clip: c.id
        }
      })
    }, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("div", {
      className: "mono"
    }, c.id), /*#__PURE__*/React.createElement("div", {
      className: "tiny muted-3 ellip"
    }, c.name)), /*#__PURE__*/React.createElement("td", {
      className: "mono small"
    }, "TK-2409-011"), /*#__PURE__*/React.createElement("td", null, ["标注员 A", "标注员 B", "标注员 C", "标注员 D"][i] || nf.who), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("span", {
      className: "codechip"
    }, nf.spec)), /*#__PURE__*/React.createElement("td", {
      className: "num"
    }, "06:12"), /*#__PURE__*/React.createElement("td", {
      style: {
        minWidth: 120
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "bar"
    }, /*#__PURE__*/React.createElement("i", {
      style: {
        width: Math.max(8, 100 - i * 22) + "%"
      }
    }))), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement(Tag, {
      tone: c.state === "已提交" ? "ok" : c.state === "标注中" ? "accent" : c.state === "待复核" ? "warn" : "quiet",
      dot: true
    }, c.state)), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement(Icon, {
      n: "chevRight",
      s: 13,
      style: {
        color: "var(--text-4)"
      }
    })))))))), creating ? /*#__PURE__*/React.createElement(Modal, {
      title: "\u62C6\u5305\u65B0\u5EFA\u6807\u6CE8\u5355\u5143",
      width: 560,
      desc: "\u628A\u4E00\u6279 Clip \u62C6\u6210\u53EF\u6D3E\u53D1\u3001\u53EF\u8BA1\u4EF7\u3001\u53EF\u590D\u6838\u7684\u6807\u6CE8\u5355\u5143\u3002\u62C6\u5305\u8BB0\u5F55\u4F1A\u5199\u56DE\u6570\u636E\u5355\u5143\u8D26\u672C\uFF0C\u4FBF\u4E8E\u8FFD\u6EAF\u6765\u6E90\u3002",
      onClose: () => setCreating(false),
      foot: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Btn, {
        tone: "ghost",
        onClick: () => setCreating(false)
      }, "\u53D6\u6D88"), /*#__PURE__*/React.createElement("span", {
        className: "grow"
      }), /*#__PURE__*/React.createElement(Btn, {
        tone: "primary",
        icon: "check",
        onClick: submitNew
      }, "\u62C6\u5305\u5E76\u751F\u6210\u5355\u5143"))
    }, /*#__PURE__*/React.createElement("div", {
      className: "grid g-2"
    }, /*#__PURE__*/React.createElement(Field, {
      label: "\u8D77\u59CB Clip",
      req: true
    }, /*#__PURE__*/React.createElement("input", {
      className: "input mono",
      value: nf.from,
      onChange: e => setNf(Object.assign({}, nf, {
        from: e.target.value
      }))
    })), /*#__PURE__*/React.createElement(Field, {
      label: "\u7ED3\u675F Clip",
      req: true
    }, /*#__PURE__*/React.createElement("input", {
      className: "input mono",
      value: nf.to,
      onChange: e => setNf(Object.assign({}, nf, {
        to: e.target.value
      }))
    }))), /*#__PURE__*/React.createElement("div", {
      className: "grid g-2"
    }, /*#__PURE__*/React.createElement(Field, {
      label: "\u62C6\u5305\u65B9\u5F0F",
      req: true,
      hint: "\u6309\u6BB5\u5207\u5206\u4FDD\u7559\u5B8C\u6574\u52A8\u4F5C\u6BB5\uFF0C\u6309\u56FA\u5B9A\u6761\u6570\u5207\u5206\u66F4\u5229\u4E8E\u5747\u644A\u8D1F\u8377"
    }, /*#__PURE__*/React.createElement("select", {
      className: "select",
      value: nf.mode,
      onChange: e => setNf(Object.assign({}, nf, {
        mode: e.target.value
      }))
    }, ["按段切分", "按固定条数", "按时长均分"].map(m => /*#__PURE__*/React.createElement("option", {
      key: m
    }, m)))), /*#__PURE__*/React.createElement(Field, {
      label: "\u5355\u5143\u6570",
      req: true,
      hint: "\u672C\u539F\u578B\u4EE5 3 \u4E2A\u5355\u5143\u6F14\u793A"
    }, /*#__PURE__*/React.createElement("input", {
      className: "input mono",
      value: nf.unit,
      onChange: e => setNf(Object.assign({}, nf, {
        unit: e.target.value
      }))
    }))), /*#__PURE__*/React.createElement("div", {
      className: "grid g-2"
    }, /*#__PURE__*/React.createElement(Field, {
      label: "\u89C4\u8303\u7248\u672C",
      req: true,
      hint: "\u5355\u5143\u5FC5\u987B\u7ED1\u5B9A\u5355\u4E00\u89C4\u8303\u7248\u672C\uFF0C\u907F\u514D\u53E3\u5F84\u6DF7\u7528"
    }, /*#__PURE__*/React.createElement("select", {
      className: "select",
      value: nf.spec,
      onChange: e => setNf(Object.assign({}, nf, {
        spec: e.target.value
      }))
    }, SPECS.map(s => /*#__PURE__*/React.createElement("option", {
      key: s
    }, s)))), /*#__PURE__*/React.createElement(Field, {
      label: "\u9996\u4F4D\u6807\u6CE8\u5458",
      req: true
    }, /*#__PURE__*/React.createElement("select", {
      className: "select",
      value: nf.who,
      onChange: e => setNf(Object.assign({}, nf, {
        who: e.target.value
      }))
    }, ["标注员 A", "标注员 B", "标注员 C", "标注员 D"].map(w => /*#__PURE__*/React.createElement("option", {
      key: w
    }, w))))), /*#__PURE__*/React.createElement("div", {
      className: "warnbox info"
    }, "\u62C6\u5305\u4F1A\u6539\u53D8\u8BA1\u4EF7\u8FB9\u754C\uFF1A\u540C\u4E00 Clip \u88AB\u62C6\u5230\u4E0D\u540C\u5355\u5143\u65F6\uFF0C\u5DE5\u65F6\u4E0E\u8FD4\u4FEE\u8D23\u4EFB\u6309\u5355\u5143\u5F52\u5C5E\u7EDF\u8BA1\uFF0C\u56E0\u6B64\u89C4\u8303\u7248\u672C\u4E0E\u5355\u5143\u6570\u5FC5\u987B\u5728\u4E0B\u53D1\u524D\u786E\u8BA4\u3002")) : null);
  }

  /* ---------- 仿真域 ---------- */
  function SimPage({
    page
  }) {
    const toast = window.UI.useToast();
    if (page === "simgens") {
      return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(PageHead, {
        crumbs: [{
          label: "仿真"
        }, {
          label: "生成任务"
        }],
        title: "\u5408\u6210\u6570\u636E\u751F\u6210\u4E0E\u57DF\u968F\u673A\u5316",
        desc: "\u5728\u4EFF\u771F\u4E2D\u6279\u91CF\u751F\u6210\u5E26\u6807\u6CE8\u7684\u6837\u672C\uFF0C\u7BA1\u7406\u771F\u5B9E\u4E0E\u5408\u6210\u6570\u636E\u7684\u914D\u6BD4\u4E0E\u6765\u6E90\u6807\u6CE8\uFF0C\u5F62\u6210\u6570\u636E\u98DE\u8F6E\u3002"
      }), /*#__PURE__*/React.createElement("div", {
        className: "pagebody"
      }, /*#__PURE__*/React.createElement("div", {
        className: "panel",
        style: {
          overflow: "hidden"
        }
      }, /*#__PURE__*/React.createElement("table", {
        className: "table"
      }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "\u751F\u6210\u4EFB\u52A1"), /*#__PURE__*/React.createElement("th", null, "\u4EFF\u771F\u73AF\u5883"), /*#__PURE__*/React.createElement("th", null, "\u968F\u673A\u5316\u7EF4\u5EA6"), /*#__PURE__*/React.createElement("th", {
        className: "num"
      }, "\u76EE\u6807\u6761\u6570"), /*#__PURE__*/React.createElement("th", {
        className: "num"
      }, "\u5DF2\u751F\u6210"), /*#__PURE__*/React.createElement("th", null, "\u72B6\u6001"))), /*#__PURE__*/React.createElement("tbody", null, [["GEN-0091", "Isaac Sim 5.0", "光照 · 材质 · 背景 · 物体位姿", 5000, 5000, "已完成"], ["GEN-0092", "MuJoCo", "光照 · 物体位姿", 3000, 1840, "生成中"], ["GEN-0093", "Genesis", "材质 · 背景 · 轨迹扰动", 4000, 0, "排队中"]].map(r => /*#__PURE__*/React.createElement("tr", {
        key: r[0],
        onClick: () => toast.push({
          tone: "info",
          title: "生成任务详情",
          desc: r[0] + " · " + r[1]
        }),
        className: "clickable"
      }, /*#__PURE__*/React.createElement("td", {
        className: "mono"
      }, r[0]), /*#__PURE__*/React.createElement("td", null, r[1]), /*#__PURE__*/React.createElement("td", {
        className: "muted"
      }, r[2]), /*#__PURE__*/React.createElement("td", {
        className: "num"
      }, r[3]), /*#__PURE__*/React.createElement("td", {
        className: "num"
      }, r[4]), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement(Tag, {
        tone: r[5] === "已完成" ? "ok" : r[5] === "生成中" ? "accent" : "quiet",
        dot: true
      }, r[5])))))))));
    }
    if (page === "simblend") {
      return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(PageHead, {
        crumbs: [{
          label: "仿真"
        }, {
          label: "虚实融合配比"
        }],
        title: "\u865A\u5B9E\u878D\u5408\u4E0E\u6765\u6E90\u6807\u6CE8",
        desc: "\u7BA1\u7406\u771F\u5B9E\u4E0E\u5408\u6210\u6570\u636E\u7684\u914D\u6BD4\uFF0C\u4FDD\u8BC1\u6BCF\u4E00\u6761\u6570\u636E\u6765\u6E90\u53EF\u8FFD\u6EAF (F4.1)\u3002\u4EFF\u771F\u5F15\u64CE\u6E05\u5355\u4FDD\u7559 Isaac Sim\u3001MuJoCo\u3001Genesis \u4E09\u9879\u3002"
      }), /*#__PURE__*/React.createElement("div", {
        className: "pagebody"
      }, /*#__PURE__*/React.createElement("div", {
        className: "grid g-2"
      }, /*#__PURE__*/React.createElement(Panel, {
        title: "\u9ED8\u8BA4\u914D\u6BD4",
        sub: "\u5F71\u54CD\u914D\u65B9\u9ED8\u8BA4\u503C\u4E0E Data Card \u8868\u8FF0",
        flush: true
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          padding: 14,
          display: "flex",
          flexDirection: "column",
          gap: 12
        }
      }, [["真实采集", 70, "ok"], ["仿真生成", 20, "review"], ["Sim2Real 增强", 10, "warn"]].map(r => /*#__PURE__*/React.createElement("div", {
        key: r[0]
      }, /*#__PURE__*/React.createElement("div", {
        className: "spread small",
        style: {
          marginBottom: 5
        }
      }, /*#__PURE__*/React.createElement("span", null, r[0]), /*#__PURE__*/React.createElement("span", {
        className: "mono"
      }, r[1], "%")), /*#__PURE__*/React.createElement("input", {
        type: "range",
        min: "0",
        max: "100",
        defaultValue: r[1],
        style: {
          width: "100%",
          accentColor: "var(--" + r[0 + 2] + ")"
        }
      }))), /*#__PURE__*/React.createElement("div", {
        className: "warnbox"
      }, "\u914D\u6BD4\u53D8\u66F4\u5C06\u5F71\u54CD\u540E\u7EED\u6240\u6709\u65B0\u5EFA\u914D\u65B9\u7684\u9ED8\u8BA4\u503C\uFF1B\u5DF2\u53D1\u5E03\u5FEB\u7167\u4E0D\u53D7\u5F71\u54CD\u3002"))), /*#__PURE__*/React.createElement(Panel, {
        title: "\u6765\u6E90\u6807\u6CE8\u89C4\u5219",
        flush: true
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          padding: 14,
          display: "flex",
          flexDirection: "column",
          gap: 8
        }
      }, [["每条数据写入 source 字段（real / sim / sim2real）", true], ["增强数据额外写入算子与参数", true], ["Data Card 自动汇总来源配比", true], ["配比失衡时在建集前置校验给警告", true]].map(r => /*#__PURE__*/React.createElement("div", {
        key: r[0],
        className: "spread"
      }, /*#__PURE__*/React.createElement("span", {
        className: "small muted pretty"
      }, r[0]), /*#__PURE__*/React.createElement(Tag, {
        tone: "ok",
        icon: "check"
      }, "\u542F\u7528"))))))));
    }
    return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(PageHead, {
      crumbs: [{
        label: "仿真"
      }, {
        label: "仿真接入"
      }],
      title: "\u4EFF\u771F\u73AF\u5883\u63A5\u5165",
      desc: "\u5411\u4E0B\u517C\u5BB9\u5F02\u6784\u672C\u4F53\u3001\u9065\u64CD\u4F5C\u8BBE\u5907\u4E0E\u4EFF\u771F\u73AF\u5883\u3002\u5B9E\u673A\u91C7\u96C6\u573A\u666F\u53EF\u5728\u4EFF\u771F\u4E2D\u590D\u73B0\uFF0C\u4EFF\u771F\u573A\u666F\u4EA6\u53EF\u4E0B\u53D1\u5B9E\u673A\uFF0C\u5F62\u6210\u865A\u5B9E\u6570\u636E\u95ED\u73AF\u8FED\u4EE3\u3002"
    }), /*#__PURE__*/React.createElement("div", {
      className: "pagebody"
    }, /*#__PURE__*/React.createElement("div", {
      className: "grid g-3"
    }, [["Isaac Sim", "5.0.0", "已连接", "ok"], ["MuJoCo", "3.2.4", "已连接", "ok"], ["Genesis", "0.4.1", "未连接", "quiet"]].map(e => /*#__PURE__*/React.createElement(Panel, {
      key: e[0],
      title: e[0],
      sub: "版本 " + e[1],
      right: /*#__PURE__*/React.createElement(Tag, {
        tone: e[3],
        dot: true
      }, e[2]),
      flush: true
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        padding: 14,
        display: "flex",
        flexDirection: "column",
        gap: 10
      }
    }, /*#__PURE__*/React.createElement(DL, {
      rows: [["连接器", e[0].toLowerCase().replace(" ", "-") + "-connector"], ["同步场景", e[2] === "已连接" ? "3 个" : "—"], ["最近同步", e[2] === "已连接" ? "12 分钟前" : "—"]]
    }), /*#__PURE__*/React.createElement(Btn, {
      size: "sm",
      tone: "ghost",
      block: true,
      icon: "refresh",
      onClick: () => toast.push({
        tone: "info",
        title: "已发起同步",
        desc: e[0] + " 场景与数据同步中。"
      })
    }, "\u540C\u6B65\u573A\u666F")))))));
  }

  /* ---------- 四类看板 ---------- */
  function Board() {
    const [tab, setTab] = useState("产能");
    const TABS = {
      产能: {
        unit: "条 / 人日",
        data: [62, 74, 81, 88, 92, 96, 101],
        foot: [["现场有效产出比", "31.4%", "在基线上提升 10.2 pt"], ["人均日产出", "101 条", "+6.3%"], ["设备占用率", "78.2%", "峰值 94%"]]
      },
      进度: {
        unit: "% 完成",
        data: [18, 32, 46, 58, 71, 84, 92],
        foot: [["在产任务按期率", "83.3%", "2 个任务存在风险"], ["平均交付周期", "9.4 天", "−1.2 天"], ["批次准交率", "96.1%", "+2.4 pt"]]
      },
      质量: {
        unit: "% 通过率",
        data: [86, 88, 91, 90, 89, 90.5, 88.7],
        foot: [["一次通过率", "88.7%", "目标 ≥ 92%，当前未达标"], ["机审误报率", "6.2%", "较上周 −1.1 pt"], ["改判率", "3.1%", "—"]]
      },
      成本: {
        unit: "元 / 有效小时",
        data: [1240, 1180, 1120, 1064, 1012, 986, 948],
        foot: [["单有效小时成本", "948 元", "−7.4%"], ["存储成本", "412 GB / 任务", "冷热分层后 −18%"], ["返工成本占比", "11.2%", "主要来自 RC-0301"]]
      }
    };
    const cur = TABS[tab];
    return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(PageHead, {
      crumbs: [{
        label: "看板"
      }, {
        label: "四类视图"
      }],
      title: "\u4EA7\u80FD \xB7 \u8FDB\u5EA6 \xB7 \u8D28\u91CF \xB7 \u6210\u672C",
      desc: "\u56DB\u7C7B\u89C6\u56FE\u5171\u7528\u540C\u4E00\u5957\u53E3\u5F84\uFF0C\u5207\u6362\u5373\u5207\u6362\u89C2\u6D4B\u7EF4\u5EA6\u3002\u6307\u6807\u53EF\u4E0B\u94BB\u5230\u660E\u7EC6\u5217\u8868\uFF0C\u5E76\u81EA\u52A8\u5E26\u5165\u7B5B\u9009\u6761\u4EF6\u3002",
      actions: /*#__PURE__*/React.createElement(Btn, {
        icon: "download",
        tone: "ghost"
      }, "\u5BFC\u51FA\u62A5\u8868")
    }), /*#__PURE__*/React.createElement("div", {
      className: "pagebody"
    }, /*#__PURE__*/React.createElement("div", {
      className: "row-tight",
      style: {
        gap: 4,
        marginBottom: 14
      }
    }, Object.keys(TABS).map(x => /*#__PURE__*/React.createElement("button", {
      key: x,
      className: "btn",
      "aria-pressed": tab === x,
      style: tab === x ? {
        background: "var(--surface-3)",
        borderColor: "var(--line-strong)"
      } : null,
      onClick: () => setTab(x)
    }, x))), /*#__PURE__*/React.createElement("div", {
      className: "grid g-3",
      style: {
        marginBottom: 14
      }
    }, cur.foot.map(m => /*#__PURE__*/React.createElement("div", {
      key: m[0],
      className: "panel-inset",
      style: {
        padding: 13
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "tiny muted-3"
    }, m[0]), /*#__PURE__*/React.createElement("div", {
      className: "mono",
      style: {
        fontSize: 22,
        fontWeight: 600,
        marginTop: 3
      }
    }, m[1]), /*#__PURE__*/React.createElement("div", {
      className: "tiny muted-3",
      style: {
        marginTop: 5
      }
    }, m[2])))), /*#__PURE__*/React.createElement(Panel, {
      title: tab + "趋势",
      sub: "近 7 日 · " + cur.unit,
      flush: true
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        padding: 18
      }
    }, /*#__PURE__*/React.createElement(Hist, {
      data: cur.data.concat(cur.data).map((v, i) => v * (0.9 + i % 5 * 0.05)),
      labels: ["09-08", "09-09", "09-10", "09-11", "09-12", "09-13", "09-14", "09-08", "09-09", "09-10", "09-11", "09-12", "09-13", "09-14"]
    })))));
  }

  /* ---------- 安全域 ---------- */
  function SafetyPage({
    page
  }) {
    const toast = window.UI.useToast();
    const M = {
      keys: {
        t: "加密与密钥管理",
        d: "传输 TLS 加密、静态数据加密、密钥轮换。抓包不可读，落盘为密文。",
        rows: [["传输层加密", "TLS 1.3 · 全站", "ok"], ["静态加密", "AES-256-GCM · 全量数据桶", "ok"], ["密钥轮换", "90 天自动轮换 · 上次 08-02", "ok"], ["客户专属密钥", "恒立机器人 · 独立 KMS 密钥", "ok"], ["授权校验", "Last check 12:20 · License 有效至 2027-03-01", "ok"]]
      },
      lifecycle: {
        t: "数据生命周期与合规销毁",
        d: "按客户与项目配置留存策略、到期提醒、一键销毁项目数据并出具销毁记录。",
        rows: [["恒立机器人 B01", "留存 24 个月 · 到期 2028-08-31", "warn"], ["瀚海工业 B02", "留存 36 个月 · 到期 2029-08-31", "ok"], ["拓元精密 B03", "留存 12 个月 · 到期 2027-08-31", "ok"], ["临时交付包 DLV-2409-004", "下载链接 48 小时后失效", "ok"]]
      },
      watermark: {
        t: "交付包水印与溯源",
        d: "交付包嵌入水印与来源指纹，可定位泄露接收方；下载授权有时效并全程留痕。",
        rows: [["WM-2f91c4", "DS-KITCH-FOLD-v3 → 恒立机器人", "ok"], ["WM-a3107e", "DS-WH-SORT-v1 → 瀚海工业", "ok"], ["WM-88c0f2", "DS-CLOTH-v2 → 星穹智能", "warn"]]
      }
    }[page] || null;
    if (!M) return null;
    return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(PageHead, {
      crumbs: [{
        label: "安全"
      }, {
        label: M.t
      }],
      title: M.t,
      desc: M.d,
      meta: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Tag, {
        tone: "ok",
        icon: "shield"
      }, "\u5168\u94FE\u8DEF\u5BA1\u8BA1\u5DF2\u5F00\u542F"), /*#__PURE__*/React.createElement(Tag, {
        tone: "quiet"
      }, "\u9A8C\u6536\u9879 V20 / V21 / V22")),
      actions: /*#__PURE__*/React.createElement(Btn, {
        icon: "external",
        tone: "ghost"
      }, "\u67E5\u770B\u5BA1\u8BA1\u65E5\u5FD7")
    }), /*#__PURE__*/React.createElement("div", {
      className: "pagebody"
    }, /*#__PURE__*/React.createElement(Panel, {
      title: M.t,
      sub: "\u5F53\u524D\u72B6\u6001",
      flush: true
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        padding: 14,
        display: "flex",
        flexDirection: "column",
        gap: 8
      }
    }, M.rows.map(r => /*#__PURE__*/React.createElement("div", {
      key: r[0],
      className: "spread",
      style: {
        padding: "11px 12px",
        border: "1px solid var(--line)",
        borderRadius: 4
      }
    }, /*#__PURE__*/React.createElement("span", {
      className: "row",
      style: {
        gap: 10
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      n: r[2] === "ok" ? "check" : "warn",
      s: 14,
      style: {
        color: "var(--" + (r[2] === "ok" ? "ok" : "warn") + ")"
      }
    }), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("span", {
      className: "small",
      style: {
        fontWeight: 600
      }
    }, r[0]), /*#__PURE__*/React.createElement("span", {
      className: "tiny muted-3",
      style: {
        display: "block",
        marginTop: 2
      }
    }, r[1]))), /*#__PURE__*/React.createElement(Tag, {
      tone: r[2],
      dot: true
    }, r[2] === "ok" ? "正常" : "待关注"))), page === "lifecycle" ? /*#__PURE__*/React.createElement("div", {
      className: "dangerzone",
      style: {
        marginTop: 8
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "panel-head"
    }, /*#__PURE__*/React.createElement("span", {
      className: "panel-title"
    }, "\u5408\u89C4\u9500\u6BC1")), /*#__PURE__*/React.createElement("div", {
      style: {
        padding: 14,
        display: "flex",
        flexDirection: "column",
        gap: 10
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "warnbox danger"
    }, "\u9500\u6BC1\u4E0D\u53EF\u6062\u590D\u3002\u6267\u884C\u524D\u9700\u5148\u5BFC\u51FA\u9500\u6BC1\u5BF9\u8C61\u6E05\u5355\uFF0C\u5E76\u7531\u5BA2\u6237\u4E0E\u9879\u76EE\u8D1F\u8D23\u4EBA\u53CC\u65B9\u4E8C\u6B21\u786E\u8BA4\u3002"), /*#__PURE__*/React.createElement(Btn, {
      tone: "danger",
      block: true,
      icon: "trash",
      onClick: () => toast.push({
        tone: "warn",
        title: "需二次确认",
        desc: "请先选择销毁对象范围并导出清单，确认后方可执行。销毁完成后将出具含对象清单的销毁记录。"
      })
    }, "\u53D1\u8D77\u9500\u6BC1\u6D41\u7A0B"))) : null))));
  }

  /* ---------- 配置域 ---------- */
  function ConfigPage({
    page,
    set
  }) {
    const toast = window.UI.useToast();
    const [creating, setCreating] = useState(false);
    const [extra, setExtra] = useState({});
    const [nf, setNf] = useState([]);
    const M = {
      specs: {
        t: "规格模板",
        d: "可复用的数据规格与质量要求集合。模板一经引用即冻结版本，需要修改时另存为新版本。",
        cols: ["模板编号", "场景", "本体", "采集模式", "质量要求", "版本", "状态"],
        rows: [["EGO-KITCH-02", "厨房 / 台面", "人形 · 双臂", "示教采集", "有效帧 ≥ 80% · 可见率 ≥ 70%", "v1.2", "启用"], ["WH-SORT-05", "仓储 / 分拣线", "轮式 + 机械臂", "触发式采集", "静止段 ≤ 25%", "v2.0", "启用"], ["ASM-SCREW-01", "产线 / 装配工位", "机械臂 · 六轴", "自动回放采集", "力矩异常 ≤ 3%", "v1.0", "草稿"], ["CABLE-INS-02", "实验台 / 电控柜", "灵巧手 · 三指", "正负样本统一采集", "动作闭合 100%", "v1.1", "启用"], ["GRASP-NEG-01", "桌面 / 多物体", "人形 · 双臂", "正负样本统一采集", "可见率 ≥ 70%", "v1.0", "启用"]]
      },
      devices: {
        t: "本体与设备台账",
        d: "设备档案、固件版本、标定状态、时钟同步与责任人。批量查看在线状态，下发同步与自检指令。",
        cols: ["设备编号", "类型", "固件", "标定", "点位", "在线", "时钟同步", "责任人"],
        rows: [["B01-H2-01", "人形 · 双臂", "fw-3.4.1", "有效至 10-08", "K2", "在线", "已同步 · 0.4ms", "现场督导"], ["B01-H2-02", "人形 · 双臂", "fw-3.4.1", "有效至 10-08", "K3", "在线", "已同步 · 0.4ms", "现场督导"], ["B03-A6-07", "机械臂 · 六轴", "fw-2.9.0", "已过期 3 天", "S1", "在线", "已同步 · 18µs", "设备工程师"], ["B02-WL-03", "轮式 + 机械臂", "fw-1.8.5", "有效至 11-20", "W2", "离线", "已同步 · 1.2ms", "设备工程师"], ["DEX-3F-02", "灵巧手 · 三指", "fw-1.2.2", "有效至 09-30", "K7", "在线", "已同步 · 1.2ms", "采集员 A"], ["VR-HMD-01", "远端浏览器头显", "—", "无标定项", "远程", "在线", "未同步 · 收报打戳", "现场督导"]],
        note: "B03-A6-07 标定已过期 3 天：按异常清单 X2，允许录制但片段将标记为待复核，需更新标定或接受复核。VR-HMD-01 无法运行受控时钟，改由采集侧在收报时打戳（见接入契约）。"
      },
      people: {
        t: "点位与人员",
        d: "点位信息、人员技能标签与当日负荷。派工与排期以本表为准。",
        cols: ["点位", "场景", "采集员", "技能标签", "当日负荷", "状态"],
        rows: [["K2", "厨房 / 台面", "采集员 A", "Ego · 双臂", "82%", "在岗"], ["K3", "厨房 / 台面", "采集员 C", "Ego · 双臂", "41%", "在岗"], ["K5", "桌面 / 多物体", "采集员 B", "抓取 · 失败样本", "96%", "在岗"], ["K7", "实验台 / 电控柜", "采集员 C", "灵巧手 · 力控", "58%", "在岗"], ["S1", "产线 / 装配工位", "设备工程师", "六轴 · 力控", "74%", "在岗"]]
      },
      perms: {
        t: "权限与角色",
        d: "角色、权限点、数据范围三层控制。项目隔离与客户数据隔离是准入条件。",
        cols: ["角色", "权限点", "数据范围", "人数"],
        rows: [["采集员", "采集端全部 · 平台端只读本人数据", "本项目 · 本人", "6"], ["质检员", "质检台 · 规则只读", "本项目全量", "4"], ["标注员", "标注工作台", "指派单元", "9"], ["算法工程师", "检索 · 配方 · 导出 · 交付", "本项目全量", "3"], ["项目经理", "全部（除密钥管理）", "本项目全量", "2"], ["客户", "客户门户只读 · 提异议", "本客户已交付", "3"]]
      },
      audit: {
        t: "审计日志",
        d: "全操作留痕，规格变更与数据导出单独留痕，可检索可导出。",
        cols: ["时间", "操作人", "动作", "对象", "结果", "来源 IP"],
        rows: [["09-14 12:31", "质检员", "修改质检阈值", "QC-MOT-01 30 → 28", "成功", "10.20.3.44"], ["09-14 11:52", "项目经理", "撤回已下发任务", "TK-2409-003", "已拦截（需二次确认）", "10.20.3.12"], ["09-14 11:20", "客户 · 恒立", "提交异议", "OBJ-0007 · CLP-81226", "成功", "203.0.113.9"], ["09-14 10:42", "数据工程师", "导出数据集", "DS-KITCH-FOLD-v3", "成功（带水印）", "10.20.3.31"], ["09-14 10:02", "客户 · 恒立", "下载交付包", "DLV-2409-004", "成功（第 2 次）", "203.0.113.9"]]
      }
    }[page];
    if (!M) return null;
    const list = M.rows.concat(extra[page] || []);
    const openNew = () => {
      setNf(M.cols.map(() => ""));
      setCreating(true);
    };
    const submitNew = () => {
      const vals = nf.map(v => String(v == null ? "" : v).trim());
      if (vals.some(v => !v)) {
        toast.push({
          tone: "warn",
          title: "有必填项为空",
          desc: "配置类记录字段缺失会导致下游口径不一致，请补齐全部字段后再保存。"
        });
        return;
      }
      setExtra(e => Object.assign({}, e, {
        [page]: (e[page] || []).concat([vals])
      }));
      setCreating(false);
      toast.push({
        tone: "ok",
        title: "已新建并保存",
        desc: vals[0] + " 已加入「" + M.t + "」。配置即时生效，变更已记入审计日志。"
      });
    };
    const FIELD_HINT = {
      specs: ["模板编号，如 EGO-KITCH-03", "场景，如 厨房 / 台面", "本体，如 人形 · 双臂", "采集模式", "质量要求，如 有效帧 ≥ 80%", "版本，如 v1.0", "状态：启用 / 草稿"],
      devices: ["设备编号，如 B01-H2-03", "类型", "固件，如 fw-3.4.1", "标定有效期", "点位，如 K2", "在线状态：在线 / 离线", "责任人"],
      people: ["点位，如 K9", "场景", "采集员 / 责任人", "技能标签", "当日负荷，如 60%", "状态：在岗 / 离岗"],
      perms: ["角色名", "权限点", "数据范围", "人数"]
    }[page] || [];
    const isAudit = page === "audit";
    return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(PageHead, {
      crumbs: [{
        label: "配置"
      }, {
        label: M.t
      }],
      title: M.t,
      desc: M.d,
      meta: isAudit ? null : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Tag, {
        tone: "quiet"
      }, "\u5171 ", list.length, " \u6761"), /*#__PURE__*/React.createElement(Tag, {
        tone: "quiet",
        icon: "shield"
      }, "\u53D8\u66F4\u7559\u75D5 \xB7 \u53EF\u56DE\u6EAF")),
      actions: /*#__PURE__*/React.createElement(React.Fragment, null, page === "devices" && set ? /*#__PURE__*/React.createElement(Btn, {
        icon: "link",
        tone: "ghost",
        onClick: () => set({
          domain: "config",
          page: "contract",
          payload: {}
        })
      }, "\u67E5\u770B\u63A5\u5165\u5951\u7EA6") : null, /*#__PURE__*/React.createElement(Btn, {
        icon: "filter",
        tone: "ghost"
      }, "\u7B5B\u9009"), isAudit ? /*#__PURE__*/React.createElement(Btn, {
        icon: "download",
        tone: "primary",
        onClick: () => toast.push({
          tone: "ok",
          title: "日志已导出",
          desc: "近 30 日审计日志（含规格变更与数据导出留痕）已导出为 CSV，导出动作本身同样留痕。"
        })
      }, "\u5BFC\u51FA\u65E5\u5FD7") : /*#__PURE__*/React.createElement(Btn, {
        icon: "plus",
        tone: "primary",
        onClick: openNew
      }, "\u65B0\u5EFA"))
    }), /*#__PURE__*/React.createElement("div", {
      className: "pagebody"
    }, /*#__PURE__*/React.createElement("div", {
      className: "panel",
      style: {
        overflow: "hidden"
      }
    }, /*#__PURE__*/React.createElement("table", {
      className: "table"
    }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, M.cols.map((c, i) => /*#__PURE__*/React.createElement("th", {
      key: i
    }, c)))), /*#__PURE__*/React.createElement("tbody", null, list.map((r, i) => /*#__PURE__*/React.createElement("tr", {
      key: i
    }, r.map((c, k) => /*#__PURE__*/React.createElement("td", {
      key: k,
      className: k === 0 ? "mono" : "",
      style: k === 0 ? {
        fontWeight: 600
      } : null
    }, c === "启用" || c === "草稿" ? /*#__PURE__*/React.createElement(Tag, {
      tone: c === "启用" ? "ok" : "quiet",
      dot: true
    }, c) : c === "在线" || c === "离线" ? /*#__PURE__*/React.createElement(Tag, {
      tone: c === "在线" ? "ok" : "quiet",
      dot: true
    }, c) : c === "成功" ? /*#__PURE__*/React.createElement(Tag, {
      tone: "ok",
      dot: true
    }, c) : c === "在岗" ? /*#__PURE__*/React.createElement(Tag, {
      tone: "ok",
      dot: true
    }, c) : c.indexOf && c.indexOf("已同步") === 0 ? /*#__PURE__*/React.createElement(Tag, {
      tone: "ok",
      dot: true
    }, c) : c.indexOf && c.indexOf("未同步") === 0 ? /*#__PURE__*/React.createElement(Tag, {
      tone: "warn",
      dot: true
    }, c) : /^\d+$|%|fw-/.test(c) ? /*#__PURE__*/React.createElement("span", {
      className: /^\d+$|%/.test(c) ? "mono" : "mono tiny"
    }, c) : /*#__PURE__*/React.createElement("span", {
      className: typeof c === "string" && c.length > 24 ? "muted" : ""
    }, c))))))), M.note ? /*#__PURE__*/React.createElement("div", {
      className: "panel-foot",
      style: {
        color: "var(--warn)"
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      n: "warn",
      s: 12
    }), " ", M.note) : null)), creating ? /*#__PURE__*/React.createElement(Modal, {
      title: "新建 · " + M.t,
      width: 560,
      desc: "\u914D\u7F6E\u7C7B\u8BB0\u5F55\u4E00\u65E6\u88AB\u5F15\u7528\u5373\u4EA7\u751F\u4E0B\u6E38\u4F9D\u8D56\uFF0C\u5B57\u6BB5\u9700\u5B8C\u6574\u4E14\u547D\u540D\u89C4\u8303\uFF0C\u521B\u5EFA\u540E\u53EF\u5728\u5BA1\u8BA1\u65E5\u5FD7\u56DE\u6EAF\u3002",
      onClose: () => setCreating(false),
      foot: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Btn, {
        tone: "ghost",
        onClick: () => setCreating(false)
      }, "\u53D6\u6D88"), /*#__PURE__*/React.createElement("span", {
        className: "grow"
      }), /*#__PURE__*/React.createElement(Btn, {
        tone: "primary",
        icon: "check",
        onClick: submitNew
      }, "\u4FDD\u5B58"))
    }, /*#__PURE__*/React.createElement("div", {
      className: "grid g-2"
    }, M.cols.map((c, i) => /*#__PURE__*/React.createElement(Field, {
      key: c,
      label: c,
      req: i === 0 || i === 1,
      hint: FIELD_HINT[i] || undefined
    }, /*#__PURE__*/React.createElement("input", {
      className: "input",
      value: nf[i] || "",
      placeholder: FIELD_HINT[i] || "",
      onChange: e => setNf(v => v.map((x, k) => k === i ? e.target.value : x))
    })))), /*#__PURE__*/React.createElement("div", {
      className: "warnbox info"
    }, page === "specs" ? "规格模板一经任务引用即冻结版本，需要修改时另存为新版本，原任务与历史批次仍指向旧版本。" : page === "devices" ? "设备台账涉及标定状态，标定过期的设备允许录制但片段会被标记为待复核。" : page === "people" ? "点位与人员是派工与排期的唯一口径，负荷冲突会在下达任务时行内提示。" : "权限与角色按「角色 / 权限点 / 数据范围」三层控制，客户数据隔离是准入条件。")) : null);
  }

  /* ============================================================
     验收清单（附：第 11 章）
     ============================================================ */
  function Acceptance() {
    return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(PageHead, {
      crumbs: [{
        label: "配置"
      }, {
        label: "设计验收清单"
      }],
      title: "\u8BBE\u8BA1\u9A8C\u6536\u6E05\u5355\uFF0823 \u9879\uFF09",
      desc: "\u8BBE\u8BA1\u7A3F\u8FDB\u5165\u5F00\u53D1\u524D\u7684\u81EA\u68C0\u8868\uFF0C\u4E5F\u662F\u4E0A\u7EBF\u524D\u7684\u8D70\u67E5\u4F9D\u636E\uFF0C\u6BCF\u6761\u90FD\u53EF\u88AB\u76F4\u63A5\u5224\u5B9A\u901A\u8FC7\u6216\u4E0D\u901A\u8FC7\u3002"
    }), /*#__PURE__*/React.createElement("div", {
      className: "pagebody"
    }, /*#__PURE__*/React.createElement("div", {
      className: "panel",
      style: {
        overflow: "hidden"
      }
    }, /*#__PURE__*/React.createElement("table", {
      className: "table dense"
    }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", {
      style: {
        width: 56
      }
    }, "\u7F16\u53F7"), /*#__PURE__*/React.createElement("th", {
      style: {
        width: 320
      }
    }, "\u68C0\u67E5\u9879"), /*#__PURE__*/React.createElement("th", null, "\u901A\u8FC7\u6807\u51C6"), /*#__PURE__*/React.createElement("th", {
      style: {
        width: 92
      }
    }, "\u539F\u578B\u72B6\u6001"))), /*#__PURE__*/React.createElement("tbody", null, D.ACCEPTANCE.map(a => /*#__PURE__*/React.createElement("tr", {
      key: a[0]
    }, /*#__PURE__*/React.createElement("td", {
      className: "mono muted-3"
    }, a[0]), /*#__PURE__*/React.createElement("td", null, a[1]), /*#__PURE__*/React.createElement("td", {
      className: "muted pretty"
    }, a[2]), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement(Tag, {
      tone: "ok",
      icon: "check"
    }, "\u5DF2\u8986\u76D6")))))))));
  }

  /* ============================================================
     开放接口 / API（交付后的数据消费入口）
     ============================================================ */
  const CODE_SAMPLES = {
    curl: ["# 1) API Key + HMAC 签名换取时效令牌", "curl -s -X POST https://api.embodied-data.example/v1/auth/token \\", "  -H \"X-Api-Key: AK-LIVE-7f21\" \\", "  -H \"X-Signature: hmac-sha256=...\" \\", "  -H \"X-Timestamp: 1757834001\" \\", "  -d '{\"scope\":\"clip:read\",\"ttl\":3600}'", "", "# 2) 自然语言检索片段（游标分页）", "curl -s -X POST https://api.embodied-data.example/v1/search \\", "  -H \"Authorization: Bearer $TOKEN\" \\", "  -d '{\"dataset\":\"DS-KITCH-FOLD-v3\",\"query\":\"叠衣服失败的那几条\",\"limit\":20}'", "", "# 3) 断点续传取媒体切片", "curl -s -H \"Authorization: Bearer $TOKEN\" -H \"Range: bytes=0-4194303\" \\", "  https://api.embodied-data.example/v1/clips/CLP-81204/media -o clip.part0"],
    python: ["# Python 3 · requests", "import requests", "BASE = \"https://api.embodied-data.example\"", "h = {\"X-Api-Key\": \"AK-LIVE-7f21\"}", "", "tok = requests.post(BASE + \"/v1/auth/token\", headers=h,", "                    json={\"scope\": \"clip:read\", \"ttl\": 3600}).json()[\"token\"]", "H = {\"Authorization\": \"Bearer \" + tok}", "", "r = requests.post(BASE + \"/v1/search\", headers=H, json={", "    \"dataset\": \"DS-KITCH-FOLD-v3\",", "    \"query\": \"叠衣服失败的那几条\",", "    \"limit\": 20,", "}).json()", "", "for clip in r[\"items\"]:", "    print(clip[\"id\"], clip[\"qc\"], clip[\"confidence\"])"],
    js: ["// Node 18+ · 内置 fetch", "const BASE = \"https://api.embodied-data.example\";", "const res = await fetch(BASE + \"/v1/search\", {", "  method: \"POST\",", "  headers: { \"Authorization\": \"Bearer \" + token, \"Content-Type\": \"application/json\" },", "  body: JSON.stringify({ dataset: \"DS-KITCH-FOLD-v3\", query: \"叠衣服失败的那几条\", limit: 20 }),", "});", "const { items, next_cursor } = await res.json();", "console.log(items.length, next_cursor);"]
  };
  function ApiConsole({
    app,
    set
  }) {
    const toast = window.UI.useToast();
    const [tab, setTab] = useState("接口");
    const [lang, setLang] = useState("curl");
    const E = D.API_ENDPOINTS,
      K = D.API_KEYS,
      C = D.API_CALLS,
      W = D.API_WEBHOOKS;
    const methodTone = m => m === "POST" ? "ok" : "review";
    const codeTone = c => c < 300 ? "ok" : c < 500 ? "warn" : "danger";
    const TABS = ["接口", "鉴权与密钥", "事件回调", "调用日志", "接入示例"];
    return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(PageHead, {
      crumbs: [{
        label: "数据集"
      }, {
        label: "开放接口"
      }],
      title: "\u5F00\u653E\u63A5\u53E3 \xB7 Open API",
      desc: "\u4EA4\u4ED8\u4E0D\u662F\u7EC8\u70B9\u3002\u5BA2\u6237\u7B97\u6CD5\u56E2\u961F\u901A\u8FC7\u5F00\u653E\u63A5\u53E3\u6309\u9700\u68C0\u7D22\u4E0E\u62C9\u53D6\u6570\u636E\uFF0C\u800C\u4E0D\u662F\u53CD\u590D\u7B49\u4E00\u6B21\u538B\u7F29\u5305\u3002\u53D6\u6570\u5171\u7528\u540C\u4E00\u5957\u51ED\u8BC1\u3001\u6C34\u5370\u4E0E\u7559\u75D5\uFF0C\u6743\u9650\u70B9\u4E0E\u5BA2\u6237\u9694\u79BB\u53E3\u5F84\u4E00\u81F4\u3002",
      meta: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Tag, {
        tone: "quiet",
        icon: "server"
      }, "\u7248\u672C v1 \xB7 \u7A33\u5B9A"), /*#__PURE__*/React.createElement(Tag, {
        tone: "ok",
        dot: true
      }, "\u751F\u4EA7\u51ED\u8BC1 3 \u4E2A\u5728\u7528"), /*#__PURE__*/React.createElement(Tag, {
        tone: "quiet",
        icon: "gauge"
      }, "\u9ED8\u8BA4\u9650\u6D41 20 QPS")),
      actions: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Btn, {
        icon: "link",
        tone: "ghost",
        onClick: () => toast.push({
          tone: "info",
          title: "已复制接入文档地址",
          desc: "接口文档与 OpenAPI 描述文件按凭证范围生成，真实数据集 ID 等敏感字段不会下发到文档。"
        })
      }, "\u63A5\u5165\u6587\u6863"), /*#__PURE__*/React.createElement(Btn, {
        icon: "plus",
        tone: "primary",
        onClick: () => toast.push({
          tone: "ok",
          title: "已创建沙箱凭证",
          desc: "沙箱凭证仅可访问沙箱数据；正式凭证需在「安全 · 加密与密钥」完成审批后签发。"
        })
      }, "\u65B0\u5EFA\u51ED\u8BC1"))
    }), /*#__PURE__*/React.createElement("div", {
      className: "pagebody"
    }, /*#__PURE__*/React.createElement("div", {
      className: "grid g-4",
      style: {
        marginBottom: 14
      }
    }, [["数据集读取", "GET /v1/datasets", "列数据集与 Data Card，按客户隔离"], ["片段检索与取数", "POST /v1/search", "自然语言检索 + 游标分页 + 断点续传"], ["交付包导出", "POST /v1/exports", "异步导出，下载地址 48 小时失效"], ["事件回调", "5 类事件", "状态、质检、交付变化实时推送"]].map(c => /*#__PURE__*/React.createElement("div", {
      key: c[0],
      className: "panel-inset",
      style: {
        padding: 12
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "row",
      style: {
        gap: 7
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      n: "code",
      s: 14,
      style: {
        color: "var(--accent)"
      }
    }), /*#__PURE__*/React.createElement("span", {
      className: "small",
      style: {
        fontWeight: 600
      }
    }, c[0])), /*#__PURE__*/React.createElement("div", {
      className: "mono tiny",
      style: {
        marginTop: 8,
        color: "var(--text-2)"
      }
    }, c[1]), /*#__PURE__*/React.createElement("div", {
      className: "tiny muted-3",
      style: {
        marginTop: 5,
        lineHeight: 1.6
      }
    }, c[2])))), /*#__PURE__*/React.createElement("div", {
      className: "row-tight",
      style: {
        gap: 4,
        marginBottom: 12
      }
    }, TABS.map(x => /*#__PURE__*/React.createElement("button", {
      key: x,
      className: "btn",
      "aria-pressed": tab === x,
      style: tab === x ? {
        background: "var(--surface-3)",
        borderColor: "var(--line-strong)"
      } : null,
      onClick: () => setTab(x)
    }, x))), tab === "接口" ? /*#__PURE__*/React.createElement("div", {
      className: "panel",
      style: {
        overflow: "hidden"
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "panel-head"
    }, /*#__PURE__*/React.createElement("span", {
      className: "panel-title"
    }, "\u63A5\u53E3\u6E05\u5355"), /*#__PURE__*/React.createElement("span", {
      className: "panel-sub"
    }, "v1 \xB7 \u5168\u90E8\u8D70 HTTPS\uFF0C\u8BF7\u6C42\u4F53\u4E0E\u56DE\u8C03\u5747\u9700\u7B7E\u540D")), /*#__PURE__*/React.createElement("table", {
      className: "table"
    }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", {
      style: {
        width: 64
      }
    }, "\u65B9\u6CD5"), /*#__PURE__*/React.createElement("th", null, "\u8DEF\u5F84"), /*#__PURE__*/React.createElement("th", null, "\u8BF4\u660E"), /*#__PURE__*/React.createElement("th", {
      style: {
        width: 126
      }
    }, "\u9274\u6743"), /*#__PURE__*/React.createElement("th", {
      style: {
        width: 72
      },
      className: "num"
    }, "\u9650\u6D41"), /*#__PURE__*/React.createElement("th", {
      style: {
        width: 108
      }
    }, "\u6743\u9650\u70B9"))), /*#__PURE__*/React.createElement("tbody", null, E.map(e => /*#__PURE__*/React.createElement("tr", {
      key: e.m + e.p,
      className: "clickable",
      onClick: () => toast.push({
        tone: "info",
        title: e.m + " " + e.p,
        desc: e.d + "（权限点 " + e.scope + "，限流 " + e.qps + " QPS，鉴权：" + e.auth + "）"
      })
    }, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement(Tag, {
      tone: methodTone(e.m),
      dot: true
    }, e.m)), /*#__PURE__*/React.createElement("td", {
      className: "mono small"
    }, e.p), /*#__PURE__*/React.createElement("td", {
      className: "muted pretty"
    }, e.d), /*#__PURE__*/React.createElement("td", {
      className: "tiny muted-3"
    }, e.auth), /*#__PURE__*/React.createElement("td", {
      className: "num tiny"
    }, e.qps, " QPS"), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("span", {
      className: "codechip"
    }, e.scope)))))), /*#__PURE__*/React.createElement("div", {
      className: "panel-foot"
    }, /*#__PURE__*/React.createElement(Icon, {
      n: "info",
      s: 12
    }), /*#__PURE__*/React.createElement("span", null, "\u9650\u6D41\u6309\u51ED\u8BC1\u7EF4\u5EA6\u8BA1\u7B97\uFF0C\u8D85\u9650\u8FD4\u56DE 429 \u5E76\u5E26 Retry-After \u54CD\u5E94\u5934\uFF1B\u6279\u91CF\u53D6\u6570\u5EFA\u8BAE\u7528\u6E38\u6807\u987A\u5E8F\u62C9\u53D6\uFF0C\u800C\u4E0D\u662F\u5E76\u53D1\u66B4\u51B2\u3002"))) : null, tab === "鉴权与密钥" ? /*#__PURE__*/React.createElement("div", {
      className: "grid",
      style: {
        gridTemplateColumns: "minmax(0,1.4fr) minmax(0,1fr)"
      }
    }, /*#__PURE__*/React.createElement(Panel, {
      title: "\u751F\u4EA7\u4E0E\u6C99\u7BB1\u51ED\u8BC1",
      sub: "\u53EF\u8F6E\u6362\u3001\u53EF\u505C\u7528\uFF0C\u6743\u9650\u70B9\u6700\u5C0F\u6388\u4E88",
      flush: true
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        overflowX: "auto"
      }
    }, /*#__PURE__*/React.createElement("table", {
      className: "table"
    }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "\u51ED\u8BC1"), /*#__PURE__*/React.createElement("th", null, "\u5F52\u5C5E"), /*#__PURE__*/React.createElement("th", null, "\u73AF\u5883"), /*#__PURE__*/React.createElement("th", null, "\u6743\u9650\u70B9"), /*#__PURE__*/React.createElement("th", null, "IP \u767D\u540D\u5355"), /*#__PURE__*/React.createElement("th", null, "\u6700\u8FD1\u8C03\u7528"), /*#__PURE__*/React.createElement("th", null, "\u72B6\u6001"))), /*#__PURE__*/React.createElement("tbody", null, K.map(k => /*#__PURE__*/React.createElement("tr", {
      key: k.id
    }, /*#__PURE__*/React.createElement("td", {
      className: "mono small",
      style: {
        fontWeight: 600
      }
    }, k.id), /*#__PURE__*/React.createElement("td", null, k.who), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement(Tag, {
      tone: k.env === "生产" ? "accent" : "quiet"
    }, k.env)), /*#__PURE__*/React.createElement("td", {
      className: "muted tiny"
    }, k.scopes), /*#__PURE__*/React.createElement("td", {
      className: "mono tiny"
    }, k.ip), /*#__PURE__*/React.createElement("td", {
      className: "mono tiny muted-3"
    }, k.last), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement(Tag, {
      tone: k.state === "启用" ? "ok" : "quiet",
      dot: true
    }, k.state)))))))), /*#__PURE__*/React.createElement("div", {
      className: "col",
      style: {
        gap: 14
      }
    }, /*#__PURE__*/React.createElement(Panel, {
      title: "\u9274\u6743\u65B9\u5F0F",
      sub: "\u4E24\u6BB5\u5F0F\uFF1A\u5148\u7B7E\u540D\u6362\u4EE4\u724C\uFF0C\u518D\u6301\u4EE4\u724C\u53D6\u6570",
      flush: true
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        padding: 14,
        display: "flex",
        flexDirection: "column",
        gap: 11
      }
    }, [["API Key", "标识调用方身份，可随时停用与轮换"], ["HMAC-SHA256 签名", "对方法、路径、时间戳与请求体签名，防篡改防重放"], ["时效令牌", "Bearer 令牌默认 1 小时，可细到权限点与数据集"], ["IP 白名单", "生产凭证必须绑定来源网段"]].map(r => /*#__PURE__*/React.createElement("span", {
      key: r[0],
      className: "row",
      style: {
        gap: 8,
        alignItems: "flex-start"
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      n: "key",
      s: 13,
      style: {
        color: "var(--accent)",
        flex: "0 0 auto",
        marginTop: 2
      }
    }), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("span", {
      className: "small",
      style: {
        fontWeight: 600
      }
    }, r[0]), /*#__PURE__*/React.createElement("span", {
      className: "tiny muted-3",
      style: {
        display: "block",
        marginTop: 2,
        lineHeight: 1.6
      }
    }, r[1])))), /*#__PURE__*/React.createElement(Btn, {
      tone: "ghost",
      block: true,
      icon: "external",
      onClick: () => toast.push({
        tone: "info",
        title: "已对齐密钥管理",
        desc: "开放接口凭证与「安全 · 加密与密钥」共用同一套 KMS 密钥与 90 天轮换策略，停用即刻生效。"
      })
    }, "\u5728\u5BC6\u94A5\u7BA1\u7406\u4E2D\u5BF9\u9F50\u8F6E\u6362\u7B56\u7565"))), /*#__PURE__*/React.createElement(Panel, {
      title: "\u914D\u989D\u4E0E\u5408\u89C4",
      sub: "\u4E0E\u5BA2\u6237\u9694\u79BB\u53E3\u5F84\u4E00\u81F4",
      flush: true
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        padding: 14,
        display: "flex",
        flexDirection: "column",
        gap: 8
      }
    }, [["凭证仅可见本客户数据集"], ["取数全程留痕，可审计"], ["媒体切片带水印与来源指纹"], ["下载地址 48 小时失效"]].map(r => /*#__PURE__*/React.createElement("div", {
      key: r[0],
      className: "spread"
    }, /*#__PURE__*/React.createElement("span", {
      className: "small muted"
    }, r[0]), /*#__PURE__*/React.createElement(Tag, {
      tone: "ok",
      icon: "check"
    }, "\u901A\u8FC7"))))))) : null, tab === "事件回调" ? /*#__PURE__*/React.createElement("div", {
      className: "grid",
      style: {
        gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)"
      }
    }, /*#__PURE__*/React.createElement(Panel, {
      title: "Webhook \u4E8B\u4EF6",
      sub: "\u56DE\u8C03\u5E26\u7B7E\u540D\u4E0E\u65F6\u95F4\u6233\uFF0C\u5931\u8D25\u81EA\u52A8\u91CD\u8BD5 3 \u6B21",
      flush: true
    }, /*#__PURE__*/React.createElement("table", {
      className: "table"
    }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "\u4E8B\u4EF6"), /*#__PURE__*/React.createElement("th", null, "\u8BF4\u660E"), /*#__PURE__*/React.createElement("th", {
      style: {
        width: 88
      }
    }, "\u8BA2\u9605"))), /*#__PURE__*/React.createElement("tbody", null, W.map(w => /*#__PURE__*/React.createElement("tr", {
      key: w.ev
    }, /*#__PURE__*/React.createElement("td", {
      className: "mono small"
    }, w.ev), /*#__PURE__*/React.createElement("td", {
      className: "muted pretty"
    }, w.d), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement(Tag, {
      tone: w.state === "已订阅" ? "ok" : "quiet",
      dot: true
    }, w.state))))))), /*#__PURE__*/React.createElement(Panel, {
      title: "\u56DE\u8C03\u5904\u7F6E\u5EFA\u8BAE",
      sub: "\u5E42\u7B49\u4E0E\u9000\u907F",
      flush: true
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        padding: 14,
        display: "flex",
        flexDirection: "column",
        gap: 10
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "warnbox info"
    }, "\u56DE\u8C03\u53EF\u80FD\u91CD\u590D\u6295\u9012\uFF1A\u8BF7\u4EE5\u4E8B\u4EF6 ID \u505A\u5E42\u7B49\uFF0C\u4E0D\u8981\u4EE5\u5230\u8FBE\u987A\u5E8F\u63A8\u65AD\u4E1A\u52A1\u987A\u5E8F\u3002"), [["重试策略", "指数退避 · 最多 3 次"], ["超时", "10 秒未响应计一次失败"], ["验签", "时间戳偏差 > 5 分钟拒绝"], ["回执", "返回 2xx 视为成功"]].map(r => /*#__PURE__*/React.createElement("div", {
      key: r[0],
      className: "spread",
      style: {
        padding: "9px 0",
        borderBottom: "1px solid var(--line-soft)"
      }
    }, /*#__PURE__*/React.createElement("span", {
      className: "small muted"
    }, r[0]), /*#__PURE__*/React.createElement("span", {
      className: "small mono"
    }, r[1])))))) : null, tab === "调用日志" ? /*#__PURE__*/React.createElement("div", {
      className: "panel",
      style: {
        overflow: "hidden"
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "panel-head"
    }, /*#__PURE__*/React.createElement("span", {
      className: "panel-title"
    }, "\u8C03\u7528\u65E5\u5FD7"), /*#__PURE__*/React.createElement("span", {
      className: "panel-sub"
    }, "\u8FD1 24 \u5C0F\u65F6 \xB7 \u5168\u90E8\u8C03\u7528\u7559\u75D5\uFF0C\u53EF\u5BFC\u51FA"), /*#__PURE__*/React.createElement("span", {
      style: {
        marginLeft: "auto"
      }
    }, /*#__PURE__*/React.createElement(Btn, {
      size: "sm",
      tone: "ghost",
      icon: "download",
      onClick: () => toast.push({
        tone: "ok",
        title: "日志已导出",
        desc: "近 24 小时调用日志已导出为 CSV，含状态码、耗时与限流记录。"
      })
    }, "\u5BFC\u51FA"))), /*#__PURE__*/React.createElement("div", {
      style: {
        overflowX: "auto"
      }
    }, /*#__PURE__*/React.createElement("table", {
      className: "table"
    }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", {
      style: {
        width: 84
      }
    }, "\u65F6\u95F4"), /*#__PURE__*/React.createElement("th", null, "\u8C03\u7528\u65B9"), /*#__PURE__*/React.createElement("th", null, "\u63A5\u53E3"), /*#__PURE__*/React.createElement("th", {
      style: {
        width: 68
      },
      className: "num"
    }, "\u72B6\u6001"), /*#__PURE__*/React.createElement("th", {
      style: {
        width: 76
      },
      className: "num"
    }, "\u8017\u65F6"), /*#__PURE__*/React.createElement("th", null, "\u5907\u6CE8"))), /*#__PURE__*/React.createElement("tbody", null, C.map((c, i) => /*#__PURE__*/React.createElement("tr", {
      key: i
    }, /*#__PURE__*/React.createElement("td", {
      className: "mono tiny muted-3"
    }, c.t), /*#__PURE__*/React.createElement("td", {
      className: "small nowrap"
    }, c.who), /*#__PURE__*/React.createElement("td", {
      className: "mono tiny"
    }, c.ep), /*#__PURE__*/React.createElement("td", {
      className: "num"
    }, /*#__PURE__*/React.createElement(Tag, {
      tone: codeTone(c.code),
      dot: true
    }, c.code)), /*#__PURE__*/React.createElement("td", {
      className: "num mono tiny"
    }, c.ms, " ms"), /*#__PURE__*/React.createElement("td", {
      className: "muted pretty tiny"
    }, c.note)))))), /*#__PURE__*/React.createElement("div", {
      className: "panel-foot"
    }, /*#__PURE__*/React.createElement(Icon, {
      n: "info",
      s: 12
    }), /*#__PURE__*/React.createElement("span", null, "\u505C\u7528\u51ED\u8BC1\uFF08403\uFF09\u3001\u9650\u6D41\uFF08429\uFF09\u4E0E\u65F6\u6548\u8FC7\u671F\uFF08404\uFF09\u5355\u72EC\u9AD8\u4EAE\u2014\u2014\u8FD9\u4E09\u7C7B\u662F\u6700\u5E38\u89C1\u7684\u63A5\u5165\u95EE\u9898\uFF0C\u65E5\u5FD7\u91CC\u53EF\u76F4\u63A5\u5B9A\u4F4D\u3002"))) : null, tab === "接入示例" ? /*#__PURE__*/React.createElement("div", {
      className: "panel",
      style: {
        overflow: "hidden"
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "panel-head"
    }, /*#__PURE__*/React.createElement("span", {
      className: "panel-title"
    }, "\u63A5\u5165\u793A\u4F8B"), /*#__PURE__*/React.createElement("span", {
      className: "panel-sub"
    }, "\u5148\u6362\u4EE4\u724C\uFF0C\u518D\u68C0\u7D22\uFF0C\u6700\u540E\u65AD\u70B9\u7EED\u4F20\u53D6\u5A92\u4F53"), /*#__PURE__*/React.createElement("span", {
      style: {
        marginLeft: "auto",
        display: "flex",
        gap: 6
      }
    }, ["curl", "python", "js"].map(l => /*#__PURE__*/React.createElement("button", {
      key: l,
      className: "btn btn-sm",
      "aria-pressed": lang === l,
      style: lang === l ? {
        background: "var(--surface-3)",
        borderColor: "var(--line-strong)"
      } : null,
      onClick: () => setLang(l)
    }, l)))), /*#__PURE__*/React.createElement("div", {
      style: {
        padding: 14
      }
    }, /*#__PURE__*/React.createElement("pre", {
      className: "codeblock"
    }, /*#__PURE__*/React.createElement("code", null, (CODE_SAMPLES[lang] || []).join("\n"))), /*#__PURE__*/React.createElement("div", {
      className: "row",
      style: {
        gap: 8,
        marginTop: 12,
        flexWrap: "wrap"
      }
    }, /*#__PURE__*/React.createElement(Btn, {
      tone: "ghost",
      icon: "copy",
      onClick: () => toast.push({
        tone: "ok",
        title: "示例已复制",
        desc: "示例代码已复制到剪贴板（原型内为模拟操作）。"
      })
    }, "\u590D\u5236\u793A\u4F8B"), /*#__PURE__*/React.createElement(Btn, {
      tone: "ghost",
      icon: "play",
      onClick: () => toast.push({
        tone: "info",
        title: "已在沙箱发送示例请求",
        desc: "沙箱返回 200，命中 18 条片段，next_cursor 已返回。"
      })
    }, "\u5728\u6C99\u7BB1\u8BD5\u8DD1"), /*#__PURE__*/React.createElement("span", {
      className: "tiny muted-3",
      style: {
        alignSelf: "center"
      }
    }, "\u6C99\u7BB1\u4E0E\u751F\u4EA7\u9664\u6570\u636E\u8303\u56F4\u5916\u63A5\u53E3\u5B8C\u5168\u4E00\u81F4\uFF0C\u53EF\u5728\u6C99\u7BB1\u8054\u8C03\u901A\u8FC7\u540E\u518D\u5207\u6362\u751F\u4EA7\u51ED\u8BC1\u3002")))) : null));
  }

  /* ============================================================
     设备接入契约（源：硬件-软件解耦）
     ============================================================ */
  function ContractPage({
    set
  }) {
    const toast = window.UI.useToast();
    const [lang, setLang] = useState("session");
    const IF = D.CONTRACT_IFACES,
      ST = D.CONTRACT_STREAMS,
      RJ = D.CONTRACT_REJECTS,
      CK = D.CLOCK_SYNC;
    const bad = ST.filter(s => !s.ok).length;
    const synced = CK.filter(c => c.state === "已同步").length;
    return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(PageHead, {
      crumbs: [{
        label: "配置"
      }, {
        label: "接入契约"
      }],
      title: "\u8BBE\u5907\u63A5\u5165\u5951\u7EA6",
      desc: "\u786C\u4EF6\u4E0E\u8F6F\u4EF6\u89E3\u8026\u7684\u843D\u70B9\uFF1A\u4EFB\u4F55\u80FD\u6309\u5951\u7EA6\u53D1\u5E03\u6807\u51C6\u6D88\u606F\u7684\u8BBE\u5907\u90FD\u80FD\u63A5\u5165\uFF0C\u6362\u786C\u4EF6\u3001\u6362\u573A\u666F\u3001\u6362\u70B9\u4F4D\u90FD\u4E0D\u6539\u91C7\u96C6\u670D\u52A1\u4EE3\u7801\uFF0C\u53EA\u6539\u4F1A\u8BDD\u914D\u7F6E\u3002\u5951\u7EA6\u662F\u53D7\u63A7\u8D44\u4EA7\u2014\u2014\u5165\u5E93\u524D\u5148\u8FC7\u5951\u7EA6\u6821\u9A8C\uFF0C\u4E0D\u5408\u5951\u7EA6\u7684\u6D88\u606F\u6839\u672C\u4E0D\u8FDB\u5165\u751F\u4EA7\u961F\u5217\u3002",
      meta: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Tag, {
        tone: "quiet",
        icon: "link"
      }, "3 \u4E2A\u63A5\u53E3\u5951\u7EA6"), /*#__PURE__*/React.createElement(Tag, {
        tone: bad ? "warn" : "ok",
        dot: true
      }, ST.length, " \u6761\u6D41 \xB7 ", bad ? bad + " 条不合契约" : "全部合规"), /*#__PURE__*/React.createElement(Tag, {
        tone: synced < CK.length ? "warn" : "ok",
        icon: "clock"
      }, "\u65F6\u949F\u540C\u6B65 ", synced, " / ", CK.length, " \u8282\u70B9")),
      actions: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Btn, {
        icon: "file",
        tone: "ghost",
        onClick: () => toast.push({
          tone: "info",
          title: "契约文档已生成",
          desc: "契约与开放接口同源生成，含消息类型、QoS、时间域与字段抽取规则，可直接交给设备侧对接。"
        })
      }, "\u5BFC\u51FA\u5951\u7EA6"), /*#__PURE__*/React.createElement(Btn, {
        icon: "plus",
        tone: "primary",
        onClick: () => toast.push({
          tone: "ok",
          title: "已登记新设备",
          desc: "登记只做两件事：确认它发布的消息类型匹配契约、在会话配置里声明话题。不产生任何采集服务代码改动。"
        })
      }, "\u767B\u8BB0\u65B0\u8BBE\u5907"))
    }), /*#__PURE__*/React.createElement("div", {
      className: "pagebody"
    }, /*#__PURE__*/React.createElement("div", {
      className: "grid g-3",
      style: {
        marginBottom: 14
      }
    }, IF.map(f => /*#__PURE__*/React.createElement("div", {
      key: f.k,
      className: "panel-inset",
      style: {
        padding: 12
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "row",
      style: {
        gap: 7
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      n: "link",
      s: 14,
      style: {
        color: "var(--accent)"
      }
    }), /*#__PURE__*/React.createElement("span", {
      className: "small",
      style: {
        fontWeight: 600
      }
    }, f.k)), /*#__PURE__*/React.createElement("div", {
      className: "tiny muted-3",
      style: {
        marginTop: 8,
        lineHeight: 1.65
      }
    }, f.d), /*#__PURE__*/React.createElement("div", {
      className: "row",
      style: {
        gap: 6,
        marginTop: 9,
        flexWrap: "wrap"
      }
    }, /*#__PURE__*/React.createElement("span", {
      className: "codechip"
    }, f.types), /*#__PURE__*/React.createElement("span", {
      className: "tiny muted-3"
    }, f.rate))))), /*#__PURE__*/React.createElement(Panel, {
      title: "\u6D41\u58F0\u660E",
      sub: "\u6BCF\u6761\u6D41\u72EC\u7ACB\u58F0\u660E\u8BDD\u9898\u3001\u6D88\u606F\u7C7B\u578B\u3001QoS\u3001\u65F6\u95F4\u57DF\u4E0E\u5B57\u6BB5\uFF1B\u91C7\u96C6\u670D\u52A1\u5BF9\u786C\u4EF6\u96F6\u77E5\u8BC6\uFF0C\u53EA\u6309\u58F0\u660E\u8BA2\u9605",
      right: /*#__PURE__*/React.createElement(Tag, {
        tone: "quiet",
        icon: "branch"
      }, "\u4E24\u5C42\u914D\u7F6E \xB7 \u7B2C 1 \u5C42"),
      flush: true,
      style: {
        marginBottom: 14
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        overflowX: "auto"
      }
    }, /*#__PURE__*/React.createElement("table", {
      className: "table"
    }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", {
      style: {
        width: 96
      }
    }, "\u6D41"), /*#__PURE__*/React.createElement("th", {
      style: {
        width: 66
      }
    }, "\u6765\u6E90"), /*#__PURE__*/React.createElement("th", null, "\u8BDD\u9898"), /*#__PURE__*/React.createElement("th", null, "\u6D88\u606F\u7C7B\u578B"), /*#__PURE__*/React.createElement("th", {
      style: {
        width: 84
      }
    }, "\u65F6\u95F4\u57DF"), /*#__PURE__*/React.createElement("th", {
      style: {
        width: 196
      }
    }, "QoS"), /*#__PURE__*/React.createElement("th", {
      style: {
        width: 148
      }
    }, "\u5B57\u6BB5\u62BD\u53D6"), /*#__PURE__*/React.createElement("th", {
      style: {
        width: 60
      },
      className: "num"
    }, "\u901F\u7387"), /*#__PURE__*/React.createElement("th", {
      style: {
        width: 74
      }
    }, "\u5951\u7EA6"))), /*#__PURE__*/React.createElement("tbody", null, ST.map(s => /*#__PURE__*/React.createElement("tr", {
      key: s.topic,
      className: "clickable",
      onClick: () => toast.push({
        tone: s.ok ? "info" : "warn",
        title: s.name + " · " + s.topic,
        desc: s.type + " · 时间域 " + s.tdom + " · QoS " + s.qos + " · 字段 " + s.fields + (s.ok ? "" : "；该流不合契约，入库前会被拒绝。")
      })
    }, /*#__PURE__*/React.createElement("td", {
      className: "small",
      style: {
        fontWeight: 600
      }
    }, s.name), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement(Tag, {
      tone: "quiet"
    }, s.src)), /*#__PURE__*/React.createElement("td", {
      className: "mono tiny"
    }, s.topic), /*#__PURE__*/React.createElement("td", {
      className: "mono tiny muted-3"
    }, s.type), /*#__PURE__*/React.createElement("td", {
      className: "tiny",
      style: {
        color: s.ok ? "var(--text-2)" : "var(--danger)"
      }
    }, s.tdom), /*#__PURE__*/React.createElement("td", {
      className: "mono tiny muted-3"
    }, s.qos), /*#__PURE__*/React.createElement("td", {
      className: "mono tiny muted-3"
    }, s.fields), /*#__PURE__*/React.createElement("td", {
      className: "num tiny"
    }, s.hz), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement(Tag, {
      tone: s.ok ? "ok" : "danger",
      dot: true
    }, s.ok ? "合规" : "不合规"))))))), /*#__PURE__*/React.createElement("div", {
      className: "panel-foot"
    }, /*#__PURE__*/React.createElement(Icon, {
      n: "info",
      s: 12
    }), /*#__PURE__*/React.createElement("span", null, "\u53EA\u63A5\u53D7\u5E26 header \u7684\u6D88\u606F\uFF1Aheader.stamp \u5FC5\u987B\u662F\u6570\u636E\u7684\u521B\u5EFA\u65F6\u523B\uFF08\u66DD\u5149\u3001\u8BFB\u56DE\u3001\u89E3\u7B97\u6216\u6536\u62A5\uFF09\uFF0C\u800C\u4E0D\u662F\u53D1\u5E03\u65F6\u523B\u3002\u65E0 header \u7684\u6D88\u606F\u4E00\u5F8B\u62D2\u7EDD\uFF0C\u907F\u514D\u300C\u770B\u8D77\u6765\u5BF9\u9F50\u3001\u5B9E\u9645\u9519\u4F4D\u300D\u3002"))), /*#__PURE__*/React.createElement("div", {
      className: "grid",
      style: {
        gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)",
        marginBottom: 14
      }
    }, /*#__PURE__*/React.createElement(Panel, {
      title: "\u4E24\u5C42\u914D\u7F6E",
      sub: "\u6539\u786C\u4EF6\u4E0D\u6539\u4EE3\u7801",
      flush: true,
      right: /*#__PURE__*/React.createElement("div", {
        className: "row-tight"
      }, /*#__PURE__*/React.createElement("button", {
        className: "btn btn-sm",
        "aria-pressed": lang === "session",
        style: lang === "session" ? {
          background: "var(--surface-3)"
        } : null,
        onClick: () => setLang("session")
      }, "\u4F1A\u8BDD\u914D\u7F6E"), /*#__PURE__*/React.createElement("button", {
        className: "btn btn-sm",
        "aria-pressed": lang === "global",
        style: lang === "global" ? {
          background: "var(--surface-3)"
        } : null,
        onClick: () => setLang("global")
      }, "\u5168\u5C40\u914D\u7F6E"))
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        padding: 14
      }
    }, /*#__PURE__*/React.createElement("pre", {
      className: "codeblock",
      style: {
        maxHeight: 300
      }
    }, /*#__PURE__*/React.createElement("code", null, D.CONTRACT_YAML[lang].join("\n"))), /*#__PURE__*/React.createElement("div", {
      className: "tiny muted-3",
      style: {
        marginTop: 10,
        lineHeight: 1.7
      }
    }, "\u7B2C 1 \u5C42\u4F1A\u8BDD\u914D\u7F6E\u56DE\u7B54\u300C\u5F55\u4EC0\u4E48\u300D\uFF0C\u7B2C 2 \u5C42\u5168\u5C40\u914D\u7F6E\u56DE\u7B54\u300C\u7528\u54EA\u4E2A\u9002\u914D\u5668\u300D\u3002\u65B0\u589E\u8BBE\u5907 = \u5199\u4E00\u4E2A\u53D1\u5E03\u6807\u51C6\u6D88\u606F\u7684\u9002\u914D\u5668 + \u5728\u4F1A\u8BDD\u914D\u7F6E\u91CC\u58F0\u660E\u8BDD\u9898\uFF1B\u6838\u5FC3\u91C7\u96C6\u670D\u52A1\u65E2\u4E0D\u53C2\u4E0E\uFF0C\u4E5F\u4E0D\u77E5\u9053\u5177\u4F53\u786C\u4EF6\u3002"))), /*#__PURE__*/React.createElement(Panel, {
      title: "\u65F6\u95F4\u57DF\u4E0E\u65F6\u949F\u540C\u6B65",
      sub: "\u8DE8\u6D41\u5BF9\u9F50\u7684\u552F\u4E00\u524D\u63D0",
      right: /*#__PURE__*/React.createElement(Tag, {
        tone: synced < CK.length ? "warn" : "ok",
        dot: true
      }, synced, " / ", CK.length, " \u5DF2\u540C\u6B65"),
      flush: true
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        padding: 14
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "warnbox",
      style: {
        marginBottom: 10
      }
    }, "\u8BB0\u5F55\u7684\u6BCF\u6761\u65F6\u95F4\u6233\u90FD\u6765\u81EA\u5404\u53D1\u5E03\u7AEF\u81EA\u5DF1\u7684\u65F6\u949F\u3002\u65F6\u949F\u4E0D\u540C\u6B65\u4E0D\u4F1A\u62A5\u9519\uFF0C\u53EA\u4F1A\u8BA9\u8DE8\u6D41\u5BF9\u9F50\u9759\u9ED8\u9519\u4F4D\u2014\u2014\u8FD9\u662F\u6700\u96BE\u4E8B\u540E\u53D1\u73B0\u7684\u4E00\u7C7B\u6570\u636E\u7F3A\u9677\u3002\u5F55\u5236\u524D\u5FC5\u987B\u5B8C\u6210\u540C\u6B65\u3002"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 7
      }
    }, CK.map(c => /*#__PURE__*/React.createElement("div", {
      key: c.node,
      className: "spread",
      style: {
        padding: "8px 10px",
        border: "1px solid var(--line)",
        borderRadius: 4,
        background: c.state === "已同步" ? "transparent" : "var(--warn-dim)"
      }
    }, /*#__PURE__*/React.createElement("span", {
      className: "row",
      style: {
        gap: 8
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      n: c.state === "已同步" ? "check" : "warn",
      s: 13,
      style: {
        color: c.state === "已同步" ? "var(--ok)" : "var(--warn)"
      }
    }), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("span", {
      className: "small",
      style: {
        fontWeight: 600
      }
    }, c.node), /*#__PURE__*/React.createElement("span", {
      className: "tiny muted-3",
      style: {
        display: "block",
        marginTop: 2
      }
    }, c.proto))), /*#__PURE__*/React.createElement("span", {
      className: "row",
      style: {
        gap: 8
      }
    }, /*#__PURE__*/React.createElement("span", {
      className: "mono tiny muted-3"
    }, c.off), /*#__PURE__*/React.createElement(Tag, {
      tone: c.state === "已同步" ? "ok" : "warn",
      dot: true
    }, c.state))))), /*#__PURE__*/React.createElement("div", {
      className: "tiny muted-3",
      style: {
        marginTop: 10,
        lineHeight: 1.7
      }
    }, "\u5C40\u57DF\u7F51\u7528 chrony \u5373\u53EF\uFF08\u6BEB\u79D2\u7EA7\uFF09\uFF1B\u9700\u8981\u66F4\u7D27\u7684\u754C\u7528 PTP\uFF08\u5FAE\u79D2\u7EA7\uFF09\u3002\u82E5\u8FDC\u7AEF\u8BBE\u5907\u65E0\u6CD5\u8FD0\u884C\u53D7\u63A7\u65F6\u949F\uFF08\u4F8B\u5982\u6D4F\u89C8\u5668\u5934\u663E\uFF09\uFF0C\u628A\u9002\u914D\u5C42\u653E\u5728\u91C7\u96C6\u4FA7\u3001\u5728\u6536\u62A5\u65F6\u6253\u6233\uFF0C\u4E0D\u8981\u4F9D\u8D56\u5BF9\u7AEF\u65F6\u949F\u3002")))), /*#__PURE__*/React.createElement(Panel, {
      title: "\u5951\u7EA6\u62E6\u622A\u8BB0\u5F55",
      sub: "\u4E0D\u5408\u5951\u7EA6\u7684\u6D88\u606F\u5728\u5165\u5E93\u524D\u88AB\u62D2\uFF0C\u800C\u4E0D\u662F\u7B49\u8D28\u68C0\u73AF\u8282\u624D\u53D1\u73B0",
      right: /*#__PURE__*/React.createElement(Tag, {
        tone: "danger",
        dot: true
      }, "\u8FD1 24 \u5C0F\u65F6 ", RJ.length, " \u6B21"),
      flush: true
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        overflowX: "auto"
      }
    }, /*#__PURE__*/React.createElement("table", {
      className: "table"
    }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", {
      style: {
        width: 84
      }
    }, "\u65F6\u95F4"), /*#__PURE__*/React.createElement("th", {
      style: {
        width: 186
      }
    }, "\u6D41"), /*#__PURE__*/React.createElement("th", null, "\u62E6\u622A\u539F\u56E0"), /*#__PURE__*/React.createElement("th", {
      style: {
        width: 108
      }
    }, "\u5904\u7F6E"), /*#__PURE__*/React.createElement("th", null, "\u5EFA\u8BAE"))), /*#__PURE__*/React.createElement("tbody", null, RJ.map((r, i) => /*#__PURE__*/React.createElement("tr", {
      key: i
    }, /*#__PURE__*/React.createElement("td", {
      className: "mono tiny muted-3"
    }, r.t), /*#__PURE__*/React.createElement("td", {
      className: "mono tiny"
    }, r.stream), /*#__PURE__*/React.createElement("td", {
      className: "small pretty"
    }, r.why), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement(Tag, {
      tone: r.action === "标记待核" ? "warn" : "danger",
      dot: true
    }, r.action)), /*#__PURE__*/React.createElement("td", {
      className: "muted pretty tiny"
    }, r.note)))))), /*#__PURE__*/React.createElement("div", {
      className: "panel-foot"
    }, /*#__PURE__*/React.createElement(Icon, {
      n: "info",
      s: 12
    }), /*#__PURE__*/React.createElement("span", null, "\u62E6\u622A\u4E0D\u662F\u5931\u8D25\uFF0C\u662F\u5EC9\u4EF7\u7684\u8D28\u91CF\u524D\u7F6E\uFF1A\u5728\u6821\u9A8C\u6D41\u6C34\u7EBF\u7B2C\u4E00\u6B65\u5C31\u62D2\u6389\uFF0C\u6BD4\u8BA9\u810F\u6570\u636E\u8D70\u5B8C\u91C7\u96C6\u3001\u4E0A\u4F20\u3001\u8D28\u68C0\u3001\u6807\u6CE8\u518D\u56DE\u6EAF\u4FBF\u5B9C\u4E00\u4E2A\u6570\u91CF\u7EA7\u3002")))));
  }
  window.PAGES_B = {
    QCConsole,
    QCQueue,
    RuleConfig,
    AnnoWorkbench,
    RecipeEditor,
    Snapshots,
    Delivery,
    ObjectionDialog,
    AnnoTasks,
    SimPage,
    Board,
    SafetyPage,
    ConfigPage,
    Acceptance,
    ApiConsole,
    ContractPage
  };
})();