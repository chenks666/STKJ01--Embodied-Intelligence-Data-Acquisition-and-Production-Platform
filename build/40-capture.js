/* ============================================================
   采集端（移动优先，源：7.2 / 8.4）
   现场约束：可能戴手套、光线差、单手操作、弱网是默认场景
   ============================================================ */
(function () {
  const {
    useState,
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
    Modal,
    Drawer,
    DL,
    cls,
    useToast
  } = window.UI;
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
    return [{
      k: "同步偏差",
      v: +(0.28 + 0.1 * Math.sin(e * 1.7)).toFixed(2)
    }, {
      k: "有效帧占比",
      v: +(93.4 - k * 14).toFixed(1)
    }, {
      k: "目标可见率",
      v: +(88.0 - k * 26).toFixed(1)
    }, {
      k: "静止段占比",
      v: +(8.6 + k * 9).toFixed(1)
    }, {
      k: "丢帧率",
      v: +(0.42 + k * 1.1).toFixed(2)
    }];
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
    const [queue, setQueue] = useState([{
      id: "SEG-K2-0412",
      step: "沿长边对折一次",
      size: "412 MB",
      st: "uploading",
      p: 0.62
    }, {
      id: "SEG-K2-0411",
      step: "平铺毛巾，四角对齐",
      size: "386 MB",
      st: "done",
      p: 1
    }, {
      id: "SEG-K2-0410",
      step: "确认台面与机位",
      size: "41 MB",
      st: "done",
      p: 1
    }]);
    const [ackOpen, setAckOpen] = useState(false);

    /* 录制计时 */
    useEffect(() => {
      if (!rec) return;
      const id = setInterval(() => setE(v => +(v + 0.25).toFixed(2)), 250);
      return () => clearInterval(id);
    }, [rec]);

    /* 上传队列推进 */
    useEffect(() => {
      if (offline) return;
      const id = setInterval(() => {
        setQueue(q => {
          const i = q.findIndex(x => x.st === "uploading");
          if (i < 0) return q;
          const arr = q.slice();
          const p = Math.min(1, arr[i].p + 0.06);
          arr[i] = Object.assign({}, arr[i], {
            p: p,
            st: p >= 1 ? "done" : "uploading"
          });
          if (p >= 1) {
            const nxt = q.findIndex((x, k) => k > i && x.st === "queued");
            if (nxt >= 0) arr[nxt] = Object.assign({}, arr[nxt], {
              st: "uploading"
            });
          }
          return arr;
        });
      }, 700);
      return () => clearInterval(id);
    }, [offline]);
    const rawIdx = job.steps.findIndex(s => !s.done);
    const allDone = rawIdx < 0;
    const curStep = allDone ? job.steps.length - 1 : rawIdx;
    const mvals = metricsAt(curStep, e);
    const states = mvals.map((mv, i) => metricState(MET[i], mv.v));
    const worst = states.indexOf("danger") >= 0 ? "danger" : states.indexOf("warn") >= 0 ? "warn" : "ok";
    const lightText = {
      ok: "数据可用，继续下一步",
      warn: "指标接近阈值，注意 " + (states.indexOf("warn") >= 0 ? mvals[states.indexOf("warn")].k : "变化"),
      danger: "手部超出画面，请调整站位或后退半步"
    }[worst];
    const startRec = () => {
      if (syncBad) {
        toast.push({
          tone: "danger",
          title: "无法开始录制",
          desc: "设备时间未同步，请先一键同步。按异常 X1：同步偏差超阈将阻塞录制并红色告警。"
        });
        return;
      }
      setRec({
        step: curStep
      });
      setE(0);
      setMarks([]);
    };
    const stopRec = () => {
      const seg = "SEG-K2-0" + (413 + Math.floor(Math.random() * 80));
      const st = job.steps.slice();
      st[curStep] = Object.assign({}, st[curStep], {
        done: true,
        tries: (retry[curStep] || 0) + 1
      });
      setJob(Object.assign({}, job, {
        steps: st,
        left: Math.max(0, job.left - 1)
      }));
      setQueue(q => [{
        id: seg,
        step: job.steps[curStep].n,
        size: 300 + Math.round(e * 30) + " MB",
        st: offline ? "queued" : "uploading",
        p: 0
      }, ...q.map(x => x.st === "uploading" ? Object.assign({}, x, {
        st: "queued"
      }) : x)]);
      setRec(null);
      setE(0);
      setMarks([]);
      toast.push({
        tone: worst === "danger" ? "warn" : "ok",
        title: "本步已结束",
        desc: (worst === "danger" ? "片段标记为待复核。已进入" : "已生成片段并进入") + (offline ? "离线队列，恢复网络后自动续传。" : "上传队列。")
      });
    };
    const redoStep = i => {
      setRetry(Object.assign({}, retry, {
        [i]: (retry[i] || 0) + 1
      }));
      const st = job.steps.slice();
      for (let k = i; k < st.length; k++) st[k] = Object.assign({}, st[k], {
        done: false
      });
      setJob(Object.assign({}, job, {
        steps: st
      }));
      setTab("job");
      toast.push({
        tone: "info",
        title: "已重录该步（第 " + ((retry[i] || 0) + 2) + " 次）",
        desc: "只重录失败的这一步，原片段进入回收，避免为一步失误丢弃整条记录。"
      });
    };
    const pending = queue.filter(q => q.st !== "done").length;
    return /*#__PURE__*/React.createElement("div", {
      className: "m-app"
    }, /*#__PURE__*/React.createElement("div", {
      className: "m-statusbar"
    }, /*#__PURE__*/React.createElement("span", null, "12:46"), /*#__PURE__*/React.createElement("span", {
      className: "row",
      style: {
        gap: 5
      }
    }, offline ? /*#__PURE__*/React.createElement(Icon, {
      n: "wifiOff",
      s: 11,
      style: {
        color: "var(--warn)"
      }
    }) : /*#__PURE__*/React.createElement(Icon, {
      n: "activity",
      s: 11
    }), syncBad ? /*#__PURE__*/React.createElement(Icon, {
      n: "warn",
      s: 11,
      style: {
        color: "var(--danger)"
      }
    }) : null, /*#__PURE__*/React.createElement("span", null, "K2 \xB7 82%"))), /*#__PURE__*/React.createElement("div", {
      className: "m-topbar"
    }, tab === "job" ? /*#__PURE__*/React.createElement(IconBtn, {
      n: "chevLeft",
      s: 18,
      title: "\u8FD4\u56DE",
      onClick: () => {
        setTab("home");
        setRec(null);
      }
    }) : /*#__PURE__*/React.createElement("span", {
      className: "brand-mark",
      style: {
        width: 24,
        height: 24
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      n: "robot",
      s: 13
    })), /*#__PURE__*/React.createElement("div", {
      className: "grow"
    }, /*#__PURE__*/React.createElement("div", {
      className: "m-title"
    }, tab === "home" ? "今日任务" : tab === "job" ? job.name : tab === "upload" ? "上传队列" : "我的"), /*#__PURE__*/React.createElement("div", {
      className: "m-sub"
    }, tab === "job" ? job.scene + " · " + job.spec : tab === "home" ? "09-14 周一 · 3 个任务待办" : tab === "upload" ? offline ? "离线中 · 恢复后自动续传" : "共 " + queue.length + " 个片段" : "采集员 A")), tab !== "home" ? /*#__PURE__*/React.createElement(IconBtn, {
      n: "bell",
      s: 17,
      title: "\u901A\u77E5",
      badge: pending ? String(pending) : null
    }) : /*#__PURE__*/React.createElement(IconBtn, {
      n: offline ? "wifiOff" : "activity",
      s: 17,
      title: "\u7F51\u7EDC",
      onClick: () => setOffline(!offline)
    })), offline && tab !== "home" ? /*#__PURE__*/React.createElement("div", {
      style: {
        padding: "9px 14px",
        background: "var(--warn-dim)",
        borderBottom: "1px solid color-mix(in srgb, var(--warn) 34%, transparent)",
        display: "flex",
        gap: 8,
        alignItems: "center"
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      n: "wifiOff",
      s: 14,
      style: {
        color: "var(--warn)",
        flex: "0 0 auto"
      }
    }), /*#__PURE__*/React.createElement("span", {
      className: "small",
      style: {
        color: "var(--warn)"
      }
    }, "\u5DF2\u8F6C\u5165\u79BB\u7EBF\u961F\u5217 \xB7 \u5F85\u4E0A\u4F20 ", pending, " \u4E2A\u7247\u6BB5")) : null, syncBad && tab === "job" ? /*#__PURE__*/React.createElement("div", {
      style: {
        padding: "9px 14px",
        background: "var(--danger-dim)",
        borderBottom: "1px solid color-mix(in srgb, var(--danger) 34%, transparent)",
        display: "flex",
        gap: 8,
        alignItems: "center"
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      n: "warn",
      s: 14,
      style: {
        color: "var(--danger)",
        flex: "0 0 auto"
      }
    }), /*#__PURE__*/React.createElement("span", {
      className: "small",
      style: {
        color: "var(--danger)",
        flex: 1
      }
    }, "\u8BBE\u5907\u65F6\u95F4\u672A\u540C\u6B65\uFF08\u504F\u5DEE 1.8 \u5E27\uFF09\uFF0C\u5F55\u5236\u5DF2\u963B\u585E"), /*#__PURE__*/React.createElement("button", {
      className: "btn btn-sm",
      style: {
        borderColor: "var(--danger)",
        color: "var(--danger)",
        background: "transparent"
      },
      onClick: () => {
        setSyncBad(false);
        toast.push({
          tone: "ok",
          title: "同步完成",
          desc: "偏差已回到 0.2 帧，录制自动解除阻塞。"
        });
      }
    }, "\u4E00\u952E\u540C\u6B65")) : null, /*#__PURE__*/React.createElement("div", {
      className: "m-scroll"
    }, tab === "home" ? /*#__PURE__*/React.createElement(CaptureHome, {
      jobId: jobId,
      onOpen: id => {
        setJobId(id);
        setJob(JSON.parse(JSON.stringify(D.CAPTURE_TASKS.filter(x => x.id === id)[0])));
        setTab("job");
        setE(0);
      },
      queue: queue,
      offline: offline
    }) : null, tab === "job" ? /*#__PURE__*/React.createElement(CaptureJob, {
      job: job,
      curStep: curStep,
      allDone: allDone,
      rec: rec,
      e: e,
      mvals: mvals,
      states: states,
      worst: worst,
      lightText: lightText,
      marks: marks,
      retry: retry,
      onStart: startRec,
      onStop: stopRec,
      onAnomaly: () => setMarkers(setMarks, curStep, e, toast),
      onRedo: redoStep,
      onAck: () => setAckOpen(true),
      onLeave: () => {
        setTab("home");
        setRec(null);
      },
      onJumpStep: i => {
        if (i <= curStep) return;
        toast.push({
          tone: "info",
          title: "请先完成当前步骤",
          desc: "SOP 步骤需按顺序执行；如需重来，可在已完成步骤上选择重录。"
        });
      }
    }) : null, tab === "upload" ? /*#__PURE__*/React.createElement(CaptureUpload, {
      queue: queue,
      offline: offline,
      onRetry: () => toast.push({
        tone: "info",
        title: "已重新入队",
        desc: "断点续传，不重新开始。"
      })
    }) : null, tab === "me" ? /*#__PURE__*/React.createElement(CaptureMe, {
      onToggleOffline: () => setOffline(!offline),
      offline: offline,
      onSync: () => setSyncBad(true)
    }) : null), tab === "job" ? /*#__PURE__*/React.createElement("div", {
      className: "m-actionbar"
    }, /*#__PURE__*/React.createElement(Btn, {
      tone: "ghost",
      icon: "flag",
      onClick: () => setMarkers(setMarks, curStep, e, toast),
      style: {
        height: 44,
        flex: "0 0 auto",
        padding: "0 14px"
      }
    }, "\u5F02\u5E38\u6253\u70B9"), !allDone ? !rec ? /*#__PURE__*/React.createElement("button", {
      className: "m-bigbtn rec grow",
      onClick: startRec
    }, /*#__PURE__*/React.createElement("span", {
      className: "recdot",
      style: {
        background: "#fff"
      }
    }), " \u5F00\u59CB\u5F55\u5236 \xB7 \u7B2C ", curStep + 1, " \u6B65") : /*#__PURE__*/React.createElement("button", {
      className: "m-bigbtn stop grow",
      onClick: stopRec
    }, /*#__PURE__*/React.createElement(Icon, {
      n: "stop",
      s: 18
    }), " \u7ED3\u675F\u672C\u6B65 ", e.toFixed(1), "s") : /*#__PURE__*/React.createElement("button", {
      className: "m-bigbtn done grow",
      onClick: () => setTab("upload")
    }, /*#__PURE__*/React.createElement(Icon, {
      n: "check",
      s: 18
    }), " \u5DF2\u5B8C\u6210 \xB7 \u67E5\u770B\u4E0A\u4F20\u961F\u5217")) : null, /*#__PURE__*/React.createElement("nav", {
      className: "m-tabbar"
    }, [["home", "今日", "grid"], ["job", "作业", "target"], ["upload", "上传", "upload"], ["me", "我的", "user"]].map(([k, label, ic]) => /*#__PURE__*/React.createElement("button", {
      key: k,
      className: cls("m-tab", tab === k && "active"),
      onClick: () => {
        if (k !== "job") setRec(null);
        setTab(k);
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      n: ic,
      s: 19
    }), /*#__PURE__*/React.createElement("span", null, label)))), ackOpen ? /*#__PURE__*/React.createElement(Modal, {
      title: "\u6211\u5DF2\u77E5\u6653\u5E76\u7EE7\u7EED",
      desc: "\u8D28\u91CF\u706F\u4E0D\u53EF\u88AB\u5173\u95ED\u2014\u2014\u73B0\u573A\u4EBA\u5458\u6709\u7ED5\u8FC7\u63D0\u793A\u7684\u52A8\u673A\uFF0C\u56E0\u6B64\u63D0\u793A\u4E0D\u53EF\u5173\u95ED\uFF0C\u4F46\u53EF\u4EE5\u63D0\u4F9B\u300C\u6211\u5DF2\u77E5\u6653\u5E76\u7EE7\u7EED\u300D\u7684\u64CD\u4F5C\u8BB0\u5F55\u7559\u75D5\u3002",
      onClose: () => setAckOpen(false),
      width: 420,
      foot: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Btn, {
        tone: "ghost",
        onClick: () => setAckOpen(false)
      }, "\u53D6\u6D88"), /*#__PURE__*/React.createElement(Btn, {
        tone: "primary",
        onClick: () => {
          setAckOpen(false);
          toast.push({
            tone: "warn",
            title: "已留痕",
            desc: "本次「已知晓并继续」已写入记录，将随片段一并提交给质检。"
          });
        }
      }, "\u786E\u8BA4\u5E76\u7559\u75D5"))
    }, /*#__PURE__*/React.createElement(DL, {
      rows: [["当前指标", mvals.map(m => m.k + " " + m.v).join(" · ")], ["结论", worst === "danger" ? "不通过（将标记待复核）" : "有条件通过"], ["留痕对象", "本片段 + 采集员 A"]]
    })) : null);
  }
  function setMarkers(setMarks, curStep, e, toast) {
    setMarks(m => m.concat([{
      t: e,
      step: curStep
    }]));
    toast.push({
      tone: "info",
      title: "已打点",
      desc: "异常时刻 " + e.toFixed(2) + "s 已标记，并附短语原因，将随片段一并提交。"
    });
  }

  /* ============================================================
     今日任务卡（源：8.4）
     ============================================================ */
  function CaptureHome({
    jobId,
    onOpen,
    queue,
    offline
  }) {
    return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
      className: "m-card flat"
    }, /*#__PURE__*/React.createElement("div", {
      className: "spread"
    }, /*#__PURE__*/React.createElement("span", {
      className: "small muted"
    }, "\u4ECA\u65E5\u5F85\u529E"), /*#__PURE__*/React.createElement(Tag, {
      tone: "warn",
      dot: true
    }, "\u4EA4\u671F 09-19")), /*#__PURE__*/React.createElement("div", {
      className: "row",
      style: {
        gap: 18,
        marginTop: 10
      }
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      className: "tiny muted-3"
    }, "\u5269\u4F59\u6761\u6570"), /*#__PURE__*/React.createElement("div", {
      className: "mono",
      style: {
        fontSize: 27,
        fontWeight: 600
      }
    }, "54")), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      className: "tiny muted-3"
    }, "\u5DF2\u5B8C\u6210"), /*#__PURE__*/React.createElement("div", {
      className: "mono",
      style: {
        fontSize: 27,
        fontWeight: 600,
        color: "var(--ok)"
      }
    }, "36")), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      className: "tiny muted-3"
    }, "\u4E00\u6B21\u901A\u8FC7"), /*#__PURE__*/React.createElement("div", {
      className: "mono",
      style: {
        fontSize: 27,
        fontWeight: 600
      }
    }, "91%")))), queue.filter(q => q.st !== "done").length ? /*#__PURE__*/React.createElement("div", {
      className: "m-card",
      style: {
        borderColor: "var(--accent-line)",
        background: "var(--surface-1)"
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "row",
      style: {
        gap: 9
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      n: offline ? "wifiOff" : "upload",
      s: 17,
      style: {
        color: offline ? "var(--warn)" : "var(--accent)"
      }
    }), /*#__PURE__*/React.createElement("div", {
      className: "grow"
    }, /*#__PURE__*/React.createElement("div", {
      className: "small",
      style: {
        fontWeight: 600
      }
    }, offline ? "待上传 " + queue.filter(q => q.st !== "done").length + " 个片段" : "正在上传"), /*#__PURE__*/React.createElement("div", {
      className: "tiny muted-3",
      style: {
        marginTop: 2
      }
    }, offline ? "恢复网络后自动续传，无需人工干预" : "断点续传中，可离开本页")))) : null, /*#__PURE__*/React.createElement("div", {
      className: "field-label",
      style: {
        paddingLeft: 2
      }
    }, "\u4EFB\u52A1\u5361"), D.CAPTURE_TASKS.map(t => /*#__PURE__*/React.createElement("button", {
      key: t.id,
      className: cls("m-card", t.id === jobId && "active"),
      style: {
        textAlign: "left",
        cursor: "pointer",
        width: "100%"
      },
      onClick: () => onOpen(t.id)
    }, /*#__PURE__*/React.createElement("div", {
      className: "spread"
    }, /*#__PURE__*/React.createElement("span", {
      className: "mono tiny muted-3"
    }, t.id), /*#__PURE__*/React.createElement(Tag, {
      tone: t.state === "active" ? "accent" : "quiet",
      dot: true
    }, t.state === "active" ? "进行中" : "待开始")), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 17,
        fontWeight: 600,
        marginTop: 7,
        lineHeight: 1.45
      },
      className: "pretty"
    }, t.name), /*#__PURE__*/React.createElement("div", {
      className: "tiny muted-3",
      style: {
        marginTop: 4
      }
    }, t.scene, " \xB7 ", t.mode), /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 11
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "spread tiny muted-3",
      style: {
        marginBottom: 5
      }
    }, /*#__PURE__*/React.createElement("span", null, "\u5269\u4F59 ", t.left, " / ", t.plan, " \u6761"), /*#__PURE__*/React.createElement("span", null, t.priority)), /*#__PURE__*/React.createElement("div", {
      className: "bar thick"
    }, /*#__PURE__*/React.createElement("i", {
      style: {
        width: (1 - t.left / t.plan) * 100 + "%"
      }
    }))))), /*#__PURE__*/React.createElement("div", {
      className: "m-card flat"
    }, /*#__PURE__*/React.createElement("div", {
      className: "field-label"
    }, "\u4ECA\u65E5\u73B0\u573A\u63D0\u793A"), /*#__PURE__*/React.createElement("div", {
      className: "col",
      style: {
        gap: 9,
        marginTop: 10
      }
    }, [["K2 点位照明偏暗", "建议开启补光灯，避免过曝/欠曝驳回"], ["机位建议已更新", "肩部机位易致手部出画，建议改为胸部机位"]].map(x => /*#__PURE__*/React.createElement("div", {
      key: x[0],
      className: "row",
      style: {
        gap: 9,
        alignItems: "flex-start"
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      n: "info",
      s: 14,
      style: {
        color: "var(--review)",
        flex: "0 0 auto",
        marginTop: 2
      }
    }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      className: "small"
    }, x[0]), /*#__PURE__*/React.createElement("div", {
      className: "tiny muted-3",
      style: {
        marginTop: 2,
        lineHeight: 1.6
      }
    }, x[1])))))));
  }

  /* ============================================================
     作业页（源：7.2）
     ============================================================ */
  function CaptureJob({
    job,
    curStep,
    allDone,
    rec,
    e,
    mvals,
    states,
    worst,
    lightText,
    marks,
    retry,
    onStart,
    onStop,
    onAnomaly,
    onRedo,
    onAck,
    onLeave,
    onJumpStep
  }) {
    const [specOpen, setSpecOpen] = useState(false);
    const [metricOpen, setMetricOpen] = useState(false);
    const recording = !!rec;
    return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("button", {
      className: "m-card flat",
      style: {
        textAlign: "left",
        cursor: "pointer",
        width: "100%"
      },
      onClick: () => setSpecOpen(!specOpen)
    }, /*#__PURE__*/React.createElement("div", {
      className: "spread"
    }, /*#__PURE__*/React.createElement("span", {
      className: "row",
      style: {
        gap: 8
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      n: "file",
      s: 14,
      className: "muted-3"
    }), /*#__PURE__*/React.createElement("span", {
      className: "small",
      style: {
        fontWeight: 600
      }
    }, job.spec, "\uFF08\u5DF2\u51BB\u7ED3\uFF09")), /*#__PURE__*/React.createElement(Icon, {
      n: "chevDown",
      s: 15,
      className: "muted-3",
      style: {
        transform: specOpen ? "none" : "rotate(-90deg)",
        transition: "transform 150ms"
      }
    })), specOpen ? /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 11
      }
    }, /*#__PURE__*/React.createElement(DL, {
      rows: [["采集模式", job.mode], ["本体", "人形 · 双臂"], ["点位", job.scene], ["模态", "RGB-D 头部 · 腕部 RGB · 关节力矩 · 触觉"], ["有效帧占比", "≥ 80%"], ["目标可见率", "≥ 70%"], ["静止段占比", "≤ 30%"], ["观测动作偏差", "≤ 2 帧"]]
    }), /*#__PURE__*/React.createElement("div", {
      className: "row",
      style: {
        gap: 8,
        marginTop: 10
      }
    }, /*#__PURE__*/React.createElement("span", {
      className: "tag t-quiet"
    }, /*#__PURE__*/React.createElement(Icon, {
      n: "eye",
      s: 11
    }), " \u67E5\u770B\u53C2\u8003\u6837\u4F8B"), /*#__PURE__*/React.createElement("span", {
      className: "tag t-quiet"
    }, /*#__PURE__*/React.createElement(Icon, {
      n: "play",
      s: 11
    }), " \u793A\u8303\u89C6\u9891 0:42"))) : null), /*#__PURE__*/React.createElement("div", {
      className: "m-card",
      style: {
        padding: 0,
        overflow: "hidden"
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "player-grid n2",
      style: {
        height: 168
      }
    }, [["exo", "外部机位 E1", "var(--accent)"], [recording ? "wrist" : "ego", recording ? "腕部机位 W1" : "头部机位 Ego", "var(--domain-c)"]].map(v => /*#__PURE__*/React.createElement("div", {
      key: v[0],
      className: "viewtile"
    }, /*#__PURE__*/React.createElement(SceneFrame, {
      view: v[0],
      t: recording ? 0.2 + e % 3 / 8 : 0.3
    }), /*#__PURE__*/React.createElement("span", {
      className: "vtlabel"
    }, /*#__PURE__*/React.createElement("i", {
      className: "lid",
      style: {
        background: v[2]
      }
    }), v[1]), recording ? /*#__PURE__*/React.createElement("span", {
      className: "vtbadge",
      style: {
        color: "#fff",
        display: "flex",
        gap: 5,
        alignItems: "center"
      }
    }, /*#__PURE__*/React.createElement("span", {
      className: "recdot",
      style: {
        width: 7,
        height: 7,
        background: "var(--danger)"
      }
    }), "REC ", e.toFixed(1), "s") : null))), marks.length ? /*#__PURE__*/React.createElement("div", {
      style: {
        padding: "8px 12px",
        display: "flex",
        gap: 6,
        flexWrap: "wrap",
        borderTop: "1px solid var(--line-soft)"
      }
    }, marks.map((m, i) => /*#__PURE__*/React.createElement("span", {
      key: i,
      className: "tag t-warn"
    }, /*#__PURE__*/React.createElement(Icon, {
      n: "flag",
      s: 10
    }), " ", m.t.toFixed(2), "s"))) : null), /*#__PURE__*/React.createElement("button", {
      className: cls("qlight", "m-card", worst),
      style: {
        width: "100%",
        textAlign: "left",
        cursor: "pointer",
        border: "1px solid",
        padding: 13
      },
      onClick: () => setMetricOpen(!metricOpen)
    }, /*#__PURE__*/React.createElement("span", {
      className: "lamp",
      style: {
        width: 16,
        height: 16
      }
    }), /*#__PURE__*/React.createElement("span", {
      className: "grow"
    }, /*#__PURE__*/React.createElement("span", {
      className: "qtext",
      style: {
        fontWeight: 600,
        display: "block",
        fontSize: 14
      }
    }, recording ? "录制中 · " : "", worst === "ok" ? "绿灯 可用" : worst === "warn" ? "黄灯 注意" : "红灯 不可用"), /*#__PURE__*/React.createElement("span", {
      className: "tiny",
      style: {
        color: "var(--text-2)",
        display: "block",
        marginTop: 3,
        lineHeight: 1.55
      }
    }, lightText)), /*#__PURE__*/React.createElement(Icon, {
      n: "chevDown",
      s: 15,
      style: {
        transform: metricOpen ? "none" : "rotate(-90deg)",
        transition: "transform 150ms",
        color: "var(--text-3)"
      }
    })), metricOpen ? /*#__PURE__*/React.createElement("div", {
      className: "m-card"
    }, /*#__PURE__*/React.createElement("div", {
      className: "field-label",
      style: {
        marginBottom: 10
      }
    }, "\u4E94\u9879\u5B9E\u65F6\u6307\u6807"), /*#__PURE__*/React.createElement("div", {
      className: "col",
      style: {
        gap: 10
      }
    }, mvals.map((m, i) => /*#__PURE__*/React.createElement("div", {
      key: m.k
    }, /*#__PURE__*/React.createElement("div", {
      className: "spread",
      style: {
        marginBottom: 5
      }
    }, /*#__PURE__*/React.createElement("span", {
      className: "small",
      style: {
        color: "var(--" + states[i] + ")"
      }
    }, m.k), /*#__PURE__*/React.createElement("span", {
      className: "mono small"
    }, m.v, /*#__PURE__*/React.createElement("span", {
      className: "tiny muted-3"
    }, MET[i].unit), /*#__PURE__*/React.createElement("span", {
      className: "tiny muted-3",
      style: {
        marginLeft: 7
      }
    }, MET[i].dir === "gt" ? "≥" : "≤", MET[i].ok))), /*#__PURE__*/React.createElement("div", {
      className: cls("bar", states[i] === "ok" ? "ok" : states[i])
    }, /*#__PURE__*/React.createElement("i", {
      style: {
        width: Math.min(100, MET[i].dir === "gt" ? m.v : m.v / (MET[i].ok * 1.8) * 100) + "%"
      }
    })), /*#__PURE__*/React.createElement("div", {
      className: "tiny muted-3",
      style: {
        marginTop: 3
      }
    }, MET[i].hint)))), /*#__PURE__*/React.createElement("div", {
      className: "warnbox",
      style: {
        marginTop: 11,
        fontSize: 11,
        lineHeight: 1.65
      }
    }, "\u8D28\u91CF\u706F\u4E0D\u53EF\u88AB\u5173\u95ED\uFF1A\u73B0\u573A\u4EBA\u5458\u6709\u7ED5\u8FC7\u63D0\u793A\u7684\u52A8\u673A\uFF0C\u56E0\u6B64\u63D0\u793A\u4E0D\u53EF\u5173\u95ED\uFF0C\u4F46\u53EF\u4EE5\u63D0\u4F9B\u300C\u6211\u5DF2\u77E5\u6653\u5E76\u7EE7\u7EED\u300D\u7684\u64CD\u4F5C\u8BB0\u5F55\u7559\u75D5\u3002"), /*#__PURE__*/React.createElement(Btn, {
      size: "sm",
      tone: "ghost",
      block: true,
      style: {
        marginTop: 8
      },
      onClick: onAck,
      disabled: worst === "ok"
    }, "\u6211\u5DF2\u77E5\u6653\u5E76\u7EE7\u7EED\uFF08\u7559\u75D5\uFF09")) : null, /*#__PURE__*/React.createElement("div", {
      className: "m-card",
      style: {
        padding: "10px 6px"
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "spread",
      style: {
        padding: "0 8px 8px"
      }
    }, /*#__PURE__*/React.createElement("span", {
      className: "field-label",
      style: {
        margin: 0
      }
    }, "SOP \u6B65\u9AA4\u6E05\u5355"), /*#__PURE__*/React.createElement("span", {
      className: "tiny muted-3"
    }, allDone ? job.steps.length : curStep + 1, " / ", job.steps.length)), job.steps.map((s, i) => /*#__PURE__*/React.createElement("div", {
      key: i,
      className: cls("m-step", s.done && "done", i === curStep && !allDone && "active"),
      onClick: () => onJumpStep(i)
    }, /*#__PURE__*/React.createElement("span", {
      className: "m-stepnum"
    }, s.done ? /*#__PURE__*/React.createElement(Icon, {
      n: "check",
      s: 12,
      sw: 2.6
    }) : i + 1), /*#__PURE__*/React.createElement("span", {
      className: "grow"
    }, /*#__PURE__*/React.createElement("span", {
      className: "m-step-name",
      style: {
        fontSize: 15,
        fontWeight: i === curStep ? 600 : 400,
        display: "block",
        lineHeight: 1.5
      }
    }, s.n), /*#__PURE__*/React.createElement("span", {
      className: "tiny muted-3",
      style: {
        display: "block",
        marginTop: 3
      }
    }, s.done ? "已完成" + (retry[i] ? " · 第 " + (retry[i] + 1) + " 次" : "") + " · 点击可重录该步" : i === curStep ? "当前步骤 · 点击查看要点与示例图" : "未开始")), s.done ? /*#__PURE__*/React.createElement(Icon, {
      n: "refresh",
      s: 15,
      style: {
        color: "var(--text-4)",
        flex: "0 0 auto"
      },
      onClick: ev => {
        ev.stopPropagation();
        onRedo(i);
      }
    }) : null))), allDone ? /*#__PURE__*/React.createElement("div", {
      className: "m-card",
      style: {
        borderColor: "color-mix(in srgb, var(--ok) 34%, transparent)",
        background: "var(--ok-dim)"
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "row",
      style: {
        gap: 9
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      n: "check",
      s: 17,
      style: {
        color: "var(--ok)"
      }
    }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      className: "small",
      style: {
        fontWeight: 600,
        color: "var(--ok)"
      }
    }, "\u672C\u6761\u6570\u636E\u5DF2\u5B8C\u6210"), /*#__PURE__*/React.createElement("div", {
      className: "tiny muted-3",
      style: {
        marginTop: 3,
        lineHeight: 1.6
      }
    }, "\u4E0A\u4F20\u524D\u8F7B\u6821\u9A8C\u5DF2\u901A\u8FC7\uFF0C\u7247\u6BB5\u5DF2\u8FDB\u5165\u4E0A\u4F20\u961F\u5217\uFF08\u547D\u540D\u3001\u65F6\u957F\u3001\u5FC5\u586B\u5143\u6570\u636E\u5747\u5728\u7AEF\u4FA7\u62E6\u622A\uFF09\u3002")), /*#__PURE__*/React.createElement(Icon, {
      n: "chevRight",
      s: 15,
      className: "muted-3"
    }))) : null);
  }

  /* ============================================================
     上传队列（源：7.3 端侧部分）
     ============================================================ */
  function CaptureUpload({
    queue,
    offline,
    onRetry
  }) {
    return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
      className: "m-card flat"
    }, /*#__PURE__*/React.createElement("div", {
      className: "spread"
    }, /*#__PURE__*/React.createElement("span", {
      className: "small muted"
    }, "\u4E0A\u4F20\u72B6\u6001"), /*#__PURE__*/React.createElement(Tag, {
      tone: offline ? "warn" : "ok",
      dot: true
    }, offline ? "离线队列" : "断点续传中")), /*#__PURE__*/React.createElement("div", {
      className: "row",
      style: {
        gap: 18,
        marginTop: 10
      }
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      className: "tiny muted-3"
    }, "\u5DF2\u5B8C\u6210"), /*#__PURE__*/React.createElement("div", {
      className: "mono",
      style: {
        fontSize: 25,
        fontWeight: 600,
        color: "var(--ok)"
      }
    }, queue.filter(q => q.st === "done").length)), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      className: "tiny muted-3"
    }, "\u5F85\u4E0A\u4F20"), /*#__PURE__*/React.createElement("div", {
      className: "mono",
      style: {
        fontSize: 25,
        fontWeight: 600,
        color: offline ? "var(--warn)" : "var(--text)"
      }
    }, queue.filter(q => q.st !== "done").length)), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      className: "tiny muted-3"
    }, "\u4F53\u79EF"), /*#__PURE__*/React.createElement("div", {
      className: "mono",
      style: {
        fontSize: 25,
        fontWeight: 600
      }
    }, "1.2", /*#__PURE__*/React.createElement("span", {
      className: "tiny muted-3"
    }, "GB"))))), /*#__PURE__*/React.createElement("div", {
      className: "field-label",
      style: {
        paddingLeft: 2
      }
    }, "\u7247\u6BB5\u961F\u5217"), queue.map(q => /*#__PURE__*/React.createElement("div", {
      key: q.id,
      className: "m-card"
    }, /*#__PURE__*/React.createElement("div", {
      className: "spread"
    }, /*#__PURE__*/React.createElement("span", {
      className: "mono small"
    }, q.id), q.st === "done" ? /*#__PURE__*/React.createElement(Tag, {
      tone: "ok",
      icon: "check"
    }, "\u5DF2\u4E0A\u4F20") : q.st === "queued" ? /*#__PURE__*/React.createElement(Tag, {
      tone: "warn",
      dot: true
    }, "\u5F85\u4E0A\u4F20") : /*#__PURE__*/React.createElement(Tag, {
      tone: "accent",
      dot: true
    }, Math.round(q.p * 100), "%")), /*#__PURE__*/React.createElement("div", {
      className: "small",
      style: {
        marginTop: 6
      }
    }, q.step), /*#__PURE__*/React.createElement("div", {
      className: "bar",
      style: {
        marginTop: 9
      }
    }, /*#__PURE__*/React.createElement("i", {
      style: {
        width: q.p * 100 + "%"
      }
    })), /*#__PURE__*/React.createElement("div", {
      className: "spread",
      style: {
        marginTop: 8
      }
    }, /*#__PURE__*/React.createElement("span", {
      className: "tiny muted-3"
    }, q.size), q.st !== "done" ? /*#__PURE__*/React.createElement(Btn, {
      size: "sm",
      tone: "ghost",
      icon: "refresh",
      onClick: onRetry
    }, "\u7ACB\u5373\u91CD\u8BD5") : /*#__PURE__*/React.createElement("span", {
      className: "tiny muted-3"
    }, "\u7AEF\u4FA7\u8F7B\u6821\u9A8C\u901A\u8FC7")))), /*#__PURE__*/React.createElement("div", {
      className: "m-card flat"
    }, /*#__PURE__*/React.createElement("div", {
      className: "field-label"
    }, "\u4E0A\u4F20\u89C4\u5219"), /*#__PURE__*/React.createElement("div", {
      className: "col",
      style: {
        gap: 9,
        marginTop: 10
      }
    }, [["分片上传 · 断点续传", "中断后保留已传分片，恢复后自动续传，不重新开始"], ["内容指纹命中即秒传", "同一片段重复上传时直接跳过"], ["超大文件走旁路", "超过浏览器阈值时不硬传，改为对象存储直传"], ["弱网与离线是默认场景", "离线仍可录制，恢复网络后自动续传"]].map(x => /*#__PURE__*/React.createElement("div", {
      key: x[0],
      className: "row",
      style: {
        gap: 9,
        alignItems: "flex-start"
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      n: "check",
      s: 14,
      style: {
        color: "var(--ok)",
        flex: "0 0 auto",
        marginTop: 2
      }
    }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      className: "small"
    }, x[0]), /*#__PURE__*/React.createElement("div", {
      className: "tiny muted-3",
      style: {
        marginTop: 2,
        lineHeight: 1.6
      }
    }, x[1])))))));
  }

  /* ============================================================
     我的（现场异常与设备）
     ============================================================ */
  function CaptureMe({
    offline,
    onToggleOffline,
    onSync
  }) {
    return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
      className: "m-card"
    }, /*#__PURE__*/React.createElement("div", {
      className: "row",
      style: {
        gap: 12
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 44,
        height: 44,
        borderRadius: 22,
        background: "var(--surface-3)",
        display: "grid",
        placeItems: "center"
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      n: "user",
      s: 20
    })), /*#__PURE__*/React.createElement("div", {
      className: "grow"
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 16,
        fontWeight: 600
      }
    }, "\u91C7\u96C6\u5458 A"), /*#__PURE__*/React.createElement("div", {
      className: "tiny muted-3",
      style: {
        marginTop: 3
      }
    }, "\u91C7\u96C6\u5458 \xB7 \u70B9\u4F4D K2 \xB7 \u4ECA\u65E5\u5728\u5C97"))), /*#__PURE__*/React.createElement("div", {
      className: "row",
      style: {
        gap: 18,
        marginTop: 14
      }
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      className: "tiny muted-3"
    }, "\u4ECA\u65E5\u5B8C\u6210"), /*#__PURE__*/React.createElement("div", {
      className: "mono",
      style: {
        fontSize: 21,
        fontWeight: 600
      }
    }, "36")), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      className: "tiny muted-3"
    }, "\u4E00\u6B21\u901A\u8FC7"), /*#__PURE__*/React.createElement("div", {
      className: "mono",
      style: {
        fontSize: 21,
        fontWeight: 600
      }
    }, "91%")), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      className: "tiny muted-3"
    }, "\u91CD\u5F55"), /*#__PURE__*/React.createElement("div", {
      className: "mono",
      style: {
        fontSize: 21,
        fontWeight: 600,
        color: "var(--warn)"
      }
    }, "4")))), /*#__PURE__*/React.createElement("div", {
      className: "field-label",
      style: {
        paddingLeft: 2
      }
    }, "\u73B0\u573A\u5F02\u5E38\u62A5\u969C"), D.CAPTURE_ANOMALY.map(a => /*#__PURE__*/React.createElement("div", {
      key: a.code,
      className: "m-card",
      style: {
        padding: "12px 14px"
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "spread"
    }, /*#__PURE__*/React.createElement("span", {
      className: "small",
      style: {
        fontWeight: 600
      }
    }, a.k), /*#__PURE__*/React.createElement("span", {
      className: "codechip"
    }, a.code)))), /*#__PURE__*/React.createElement("div", {
      className: "m-card flat"
    }, /*#__PURE__*/React.createElement("div", {
      className: "spread",
      style: {
        marginBottom: 10
      }
    }, /*#__PURE__*/React.createElement("span", {
      className: "field-label",
      style: {
        margin: 0
      }
    }, "\u8BBE\u5907\u72B6\u6001"), /*#__PURE__*/React.createElement(Tag, {
      tone: "ok",
      dot: true
    }, "\u5728\u7EBF")), /*#__PURE__*/React.createElement(DL, {
      rows: [["设备", "B01-H2-01 人形 · 双臂"], ["固件", "fw-3.4.1"], ["标定", "有效至 10-08"], ["同步偏差", "0.2 帧（阈值 1）"], ["存储可用", "184 GB"]]
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 8,
        marginTop: 12
      }
    }, /*#__PURE__*/React.createElement(Switch, {
      checked: offline,
      onChange: onToggleOffline,
      label: "\u6A21\u62DF\u5F31\u7F51 / \u79BB\u7EBF\uFF08\u6F14\u793A\u7528\uFF09"
    }), /*#__PURE__*/React.createElement(Btn, {
      size: "sm",
      tone: "ghost",
      block: true,
      icon: "warn",
      onClick: onSync
    }, "\u6A21\u62DF\u8BBE\u5907\u65F6\u95F4\u4E0D\u540C\u6B65"))), /*#__PURE__*/React.createElement("div", {
      className: "m-card flat"
    }, /*#__PURE__*/React.createElement("div", {
      className: "field-label"
    }, "\u4ECA\u65E5\u5DF2\u9A73\u56DE\u9700\u91CD\u91C7"), /*#__PURE__*/React.createElement("div", {
      className: "col",
      style: {
        gap: 10,
        marginTop: 10
      }
    }, [["SEG-K2-0398", "RC-0101 手部出画", "09:24"], ["SEG-K2-0402", "RC-0301 静止过长", "10:11"], ["SEG-K2-0405", "RC-0301 静止过长", "11:02"]].map(x => /*#__PURE__*/React.createElement("div", {
      key: x[0],
      className: "row",
      style: {
        gap: 10
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      n: "refresh",
      s: 14,
      style: {
        color: "var(--danger)",
        flex: "0 0 auto"
      }
    }), /*#__PURE__*/React.createElement("div", {
      className: "grow"
    }, /*#__PURE__*/React.createElement("div", {
      className: "mono small"
    }, x[0]), /*#__PURE__*/React.createElement("div", {
      className: "tiny muted-3",
      style: {
        marginTop: 2
      }
    }, x[1], " \xB7 ", x[2])), /*#__PURE__*/React.createElement(Btn, {
      size: "sm",
      tone: "danger"
    }, "\u53BB\u91CD\u91C7"))), /*#__PURE__*/React.createElement("div", {
      className: "tiny muted-3",
      style: {
        lineHeight: 1.65
      }
    }, "\u9A73\u56DE\u5FC5\u987B\u9644\u8BC1\u636E\uFF1A\u539F\u56E0\u7801\u52A0\u65F6\u95F4\u7801\u6216\u5E27\u6807\u8BB0\uFF0C\u56E0\u6B64\u6BCF\u6761\u9A73\u56DE\u90FD\u80FD\u76F4\u63A5\u8DF3\u5230\u95EE\u9898\u5E27\uFF0C\u91C7\u96C6\u7AEF\u4E0D\u4F1A\u6536\u5230\u65E0\u6CD5\u6267\u884C\u7684\u6307\u4EE4\u3002"))));
  }
  window.CAPTURE = {
    CaptureApp
  };
})();