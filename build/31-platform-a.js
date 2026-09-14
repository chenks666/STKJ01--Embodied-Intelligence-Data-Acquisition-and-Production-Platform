/* ============================================================
   平台端页面 A：总览看板 / 任务 / 上传校验 / 检索 / 数据浏览器
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
    MetricCard,
    Hist,
    MultiView,
    Transport,
    Timeline,
    OverlaySwitch,
    PageHead,
    DL,
    Kbd,
    Flywheel,
    AiKpi,
    VIEWS,
    fmtTime,
    useTicker,
    cls
  } = window.UI;
  const D = window.DATA;

  /* ============================================================
     生产总览看板（源：8.2）
     ============================================================ */
  const HEAT = {
    scenes: ["厨房台面", "装配工位", "分拣线", "软体实验台", "吧台"],
    emps: ["采集员 A", "采集员 B", "采集员 C", "现场督导"],
    v: [[96.2, 78.4, 94.1, 82.0, 91.5], [93.8, 74.6, 92.5, 86.2, 89.0], [88.4, 81.2, 90.3, 79.4, 92.8], [91.0, 85.5, 95.2, 84.1, 90.4]]
  };
  function OverviewBoard({
    app,
    set
  }) {
    const toast = window.UI.useToast();
    const [mode, setMode] = useState("risk");
    const heatColor = v => {
      if (v >= 93) return "var(--ok)";
      if (v >= 88) return "color-mix(in srgb, var(--ok) 45%, var(--warn))";
      if (v >= 82) return "var(--warn)";
      return "var(--danger)";
    };

    /* 内容板块均可点击下钻：点击后自动跳转到对应业务页面并带入上下文 */
    const go = t => {
      set({
        domain: t.domain,
        page: t.page,
        payload: t.payload || {},
        flow: null
      });
      toast.push({
        tone: "info",
        title: "已跳转 · " + t.label,
        desc: t.desc || "已带入该板块的上下文，可在目标页继续处理。"
      });
    };
    const METRIC_TO = [{
      domain: "production",
      page: "tasks",
      label: "任务列表",
      desc: "已按「在产任务」口径进入任务列表，可查看 6 个在产任务。"
    }, {
      domain: "production",
      page: "upload",
      label: "上传与校验",
      desc: "已进入上传与校验中心，可查看今日 1 486 条入库明细。"
    }, {
      domain: "quality",
      page: "qc",
      label: "质检台",
      desc: "已进入质检台，可查看一次通过率 88.7% 背后的驳回明细。"
    }, {
      domain: "quality",
      page: "qcqueue",
      label: "待办队列",
      desc: "已进入待办队列，187 条按优先级排序处理。"
    }];
    const RISK_TO = [{
      domain: "quality",
      page: "rules",
      label: "规则配置",
      desc: "已定位到规则库，可回溯 ASM-SCREW-01 的静止段阈值。"
    }, {
      domain: "production",
      page: "upload",
      label: "上传与校验",
      desc: "已进入待裁决列表，可完成 3 条数据的并排对比裁决。"
    }, {
      domain: "config",
      page: "devices",
      label: "本体与设备台账",
      desc: "已进入设备台账，可核查 K2 点位设备与时钟同步。"
    }, {
      domain: "quality",
      page: "qc",
      label: "质检台",
      desc: "已进入质检台，可回溯原因码 RC-0101 的驳回记录。"
    }, {
      domain: "production",
      page: "detail",
      payload: {
        id: "TK-2409-011"
      },
      label: "任务详情",
      desc: "已进入 TK-2409-011 任务详情，可查看剩余产能与缓冲。"
    }];
    const FW_TO = [{
      domain: "production",
      page: "overview",
      label: "生产总览",
      desc: "已回到生产总览看板。"
    }, {
      domain: "quality",
      page: "qc",
      label: "质检台",
      desc: "已进入质检台，可查看机审命中与人工改判记录。"
    }, {
      domain: "annotate",
      page: "workbench",
      label: "标注工作台",
      desc: "已进入标注工作台，可复核预标注候选。"
    }, {
      domain: "dataset",
      page: "recipes",
      label: "配方库",
      desc: "已进入配方库，可查看可复现的建集配方。"
    }, {
      domain: "dataset",
      page: "delivery",
      label: "导出与交付",
      desc: "已进入导出与交付，可查看交付包与 Data Card。"
    }, {
      domain: "annotate",
      page: "annotasks",
      label: "标注任务",
      desc: "已进入标注任务，可查看难例回流后的主动采集单元。"
    }];
    const goIdx = (list, i, fallback) => go(list[i] || fallback || list[0]);
    return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(PageHead, {
      crumbs: [{
        label: "生产"
      }, {
        label: "总览看板"
      }],
      title: "\u751F\u4EA7\u603B\u89C8\u770B\u677F",
      desc: "\u770B\u677F\u7684\u7B2C\u4E00\u804C\u8D23\u662F\u66B4\u9732\u98CE\u9669\uFF0C\u4E0D\u662F\u5C55\u793A\u6570\u636E\u3002\u6BCF\u4E00\u5757\u90FD\u5FC5\u987B\u80FD\u56DE\u7B54\u300C\u6211\u73B0\u5728\u8981\u505A\u4EC0\u4E48\u300D\uFF0C\u56E0\u6B64\u98CE\u9669\u5217\u8868\u6392\u5728\u8D28\u91CF\u6982\u89C8\u4E4B\u524D\uFF0C\u4E14\u6BCF\u9879\u98CE\u9669\u90FD\u5E26\u5EFA\u8BAE\u52A8\u4F5C\u4E0E\u8D23\u4EFB\u89D2\u8272\u3002",
      meta: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Tag, {
        tone: "quiet",
        icon: "clock"
      }, "\u6570\u636E\u622A\u81F3 12:34 \xB7 \u6BCF 60 \u79D2\u5237\u65B0"), /*#__PURE__*/React.createElement(Tag, {
        tone: "quiet",
        icon: "users"
      }, "\u5728\u5C97 18 \u4EBA \xB7 \u5728\u7EBF\u8BBE\u5907 31 / 38"), /*#__PURE__*/React.createElement(Tag, {
        tone: "warn",
        icon: "gauge"
      }, "\u5F53\u524D\u89C6\u56FE\uFF1A\u9879\u76EE\u5168\u91CF"), /*#__PURE__*/React.createElement(Tag, {
        tone: "accent",
        icon: "arrowRight"
      }, "\u6240\u6709\u677F\u5757\u53EF\u70B9\u51FB\u4E0B\u94BB")),
      actions: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Btn, {
        icon: "refresh",
        tone: "ghost",
        onClick: () => toast.push({
          tone: "info",
          title: "已刷新",
          desc: "看板数据于 12:34 重新拉取。"
        })
      }, "\u5237\u65B0"), /*#__PURE__*/React.createElement(Btn, {
        icon: "plus",
        tone: "primary",
        onClick: () => set({
          page: "tasks",
          payload: {
            create: true
          }
        })
      }, "\u65B0\u5EFA\u91C7\u96C6\u4EFB\u52A1"))
    }), /*#__PURE__*/React.createElement("div", {
      className: "pagebody"
    }, /*#__PURE__*/React.createElement("div", {
      className: "grid g-4",
      style: {
        marginBottom: 14
      }
    }, D.METRICS.map((m, i) => /*#__PURE__*/React.createElement(MetricCard, {
      key: i,
      m: m,
      onClick: () => go(METRIC_TO[i] || METRIC_TO[0])
    }))), /*#__PURE__*/React.createElement(Panel, {
      title: "\u6570\u636E\u98DE\u8F6E \xB7 \u6A21\u578B\u5728\u73AF",
      sub: "\u6A21\u578B\u9010\u6B65\u63A5\u7BA1\u53EF\u91CD\u590D\u7684\u5224\u65AD\uFF0C\u4EBA\u53EA\u5904\u7406\u4F4E\u7F6E\u4FE1\u4E0E\u9AD8\u5F71\u54CD\uFF1B\u8BAD\u7EC3\u4FA7\u7684\u5931\u8D25\u6848\u4F8B\u56DE\u6D41\uFF0C\u95ED\u73AF\u56DE\u5230\u91C7\u96C6",
      right: /*#__PURE__*/React.createElement(Tag, {
        tone: "accent",
        icon: "cpu"
      }, "\u516D\u73AF\u8282\u95ED\u73AF \xB7 \u4EBA\u673A\u4E00\u81F4\u7387 93.8%"),
      style: {
        marginBottom: 14
      }
    }, /*#__PURE__*/React.createElement(Flywheel, {
      stages: D.FLYWHEEL,
      onNode: i => goIdx(FW_TO, i)
    }), /*#__PURE__*/React.createElement("div", {
      className: "grid g-4",
      style: {
        marginTop: 14
      }
    }, D.AI_METRICS.map((m, i) => /*#__PURE__*/React.createElement(AiKpi, {
      key: i,
      m: m
    }))), /*#__PURE__*/React.createElement("div", {
      className: "tiny muted-3",
      style: {
        marginTop: 12,
        lineHeight: 1.7
      }
    }, "\u56DB\u7C7B\u80FD\u529B\u6307\u6807\u4E0E\u7ADE\u54C1\u53E3\u5F84\u5BF9\u9F50\uFF1A\u9884\u6807\u6CE8\u8986\u76D6\u7387\u5BF9\u5E94\u300C\u6A21\u578B\u5148\u6807\u6CE8\u3001\u4EBA\u5DE5\u590D\u6838\u4E0D\u786E\u5B9A\u6837\u672C\u300D\uFF0C\u673A\u5BA1\u547D\u4E2D\u7387\u4E0E\u4EBA\u673A\u4E00\u81F4\u7387\u5BF9\u5E94\u300C\u6A21\u578B\u5728\u73AF\u7684\u6539\u5224\u7387\u300D\uFF0C\u96BE\u4F8B\u56DE\u6D41\u5BF9\u5E94\u300C\u90E8\u7F72\u53CD\u9988\u95ED\u73AF\u300D\u3002 \u6307\u6807\u53EA\u7528\u4E8E\u8BF4\u660E\u81EA\u52A8\u5316\u7684\u63A5\u7BA1\u7A0B\u5EA6\uFF0C\u5224\u5B9A\u6743\u59CB\u7EC8\u4FDD\u7559\u5728\u4EBA\u624B\u4E0A\u3002")), /*#__PURE__*/React.createElement("div", {
      className: "grid",
      style: {
        gridTemplateColumns: "minmax(0,1.35fr) minmax(0,1fr)",
        alignItems: "start"
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "col",
      style: {
        gap: 14
      }
    }, /*#__PURE__*/React.createElement(Panel, {
      title: "\u98CE\u9669\u4E0E\u5F85\u529E",
      sub: "\u6BCF\u9879\u7ED9\u51FA\u5EFA\u8BAE\u52A8\u4F5C\u4E0E\u8D23\u4EFB\u89D2\u8272",
      right: /*#__PURE__*/React.createElement(Tag, {
        tone: "danger",
        dot: true
      }, "2 \u9879\u9AD8\u98CE\u9669"),
      flush: true
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 10,
        padding: 14
      }
    }, D.RISKS.map((r, i) => /*#__PURE__*/React.createElement("div", {
      key: i,
      className: cls("risk", "lv-" + r.lv)
    }, /*#__PURE__*/React.createElement("span", {
      className: "rk"
    }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      className: "risk-title pretty"
    }, r.title), /*#__PURE__*/React.createElement("div", {
      className: "risk-desc pretty"
    }, r.desc), /*#__PURE__*/React.createElement("div", {
      className: "risk-act"
    }, /*#__PURE__*/React.createElement(Icon, {
      n: "arrowRight",
      s: 11,
      style: {
        color: "var(--accent)",
        flex: "0 0 auto"
      }
    }), /*#__PURE__*/React.createElement("span", {
      className: "pretty"
    }, r.act))), /*#__PURE__*/React.createElement("div", {
      className: "col",
      style: {
        gap: 6,
        alignItems: "flex-end"
      }
    }, /*#__PURE__*/React.createElement(Tag, {
      tone: r.lv === "danger" ? "danger" : r.lv === "warn" ? "warn" : "review"
    }, r.lv === "danger" ? "高" : r.lv === "warn" ? "中" : "提示"), /*#__PURE__*/React.createElement("span", {
      className: "tiny muted-3 nowrap"
    }, r.who), /*#__PURE__*/React.createElement(Btn, {
      size: "sm",
      tone: "ghost",
      onClick: () => goIdx(RISK_TO, i)
    }, "\u53BB\u5904\u7406")))))), /*#__PURE__*/React.createElement(Panel, {
      title: "\u5728\u4EA7\u4EFB\u52A1",
      sub: "\u70B9\u51FB\u5361\u7247\u4E0B\u94BB\u5230\u4EFB\u52A1\u8BE6\u60C5",
      right: /*#__PURE__*/React.createElement(Btn, {
        size: "sm",
        tone: "ghost",
        icon: "arrowRight",
        onClick: () => set({
          page: "tasks"
        })
      }, "\u5168\u90E8\u4EFB\u52A1"),
      flush: true
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 10,
        padding: 14
      }
    }, D.TASKS.slice(0, 4).map(t => /*#__PURE__*/React.createElement("button", {
      key: t.id,
      className: "panel",
      style: {
        textAlign: "left",
        cursor: "pointer",
        background: "var(--surface-1)"
      },
      onClick: () => set({
        page: "detail",
        payload: {
          id: t.id
        }
      })
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        padding: "11px 12px"
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "spread",
      style: {
        marginBottom: 7
      }
    }, /*#__PURE__*/React.createElement("span", {
      className: "small mono muted-3"
    }, t.id), /*#__PURE__*/React.createElement(Tag, {
      tone: t.risk === "danger" ? "danger" : t.risk === "warn" ? "warn" : "ok",
      dot: true
    }, t.status)), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 13,
        fontWeight: 600,
        lineHeight: 1.5
      },
      className: "pretty"
    }, t.name), /*#__PURE__*/React.createElement("div", {
      className: "tiny muted-3",
      style: {
        marginTop: 3
      }
    }, t.customer, " \xB7 ", t.scene), /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 10
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "spread tiny muted-3",
      style: {
        marginBottom: 4
      }
    }, /*#__PURE__*/React.createElement("span", null, "\u8FDB\u5EA6 ", Math.round(t.progress * 100), "%"), /*#__PURE__*/React.createElement("span", {
      className: "mono"
    }, t.done, " / ", t.plan, " \u6761")), /*#__PURE__*/React.createElement("div", {
      className: cls("bar", t.risk === "danger" ? "danger" : t.risk === "warn" ? "warn" : "")
    }, /*#__PURE__*/React.createElement("i", {
      style: {
        width: t.progress * 100 + "%"
      }
    }))), /*#__PURE__*/React.createElement("div", {
      className: "row",
      style: {
        marginTop: 10,
        gap: 12
      }
    }, /*#__PURE__*/React.createElement("span", {
      className: "tiny muted-3"
    }, "\u4E00\u6B21\u901A\u8FC7\u7387 ", /*#__PURE__*/React.createElement("b", {
      className: "mono",
      style: {
        color: t.pass1 < 0.85 ? "var(--danger)" : "var(--text)"
      }
    }, Math.round(t.pass1 * 1000) / 10, "%")), /*#__PURE__*/React.createElement("span", {
      className: "tiny muted-3"
    }, "\u4EA4\u671F ", /*#__PURE__*/React.createElement("b", {
      className: "mono",
      style: {
        color: "var(--text)"
      }
    }, t.due))))))))), /*#__PURE__*/React.createElement("div", {
      className: "col",
      style: {
        gap: 14
      }
    }, /*#__PURE__*/React.createElement(Panel, {
      title: "\u9A73\u56DE\u539F\u56E0\u5206\u5E03",
      sub: "\u8FD1 7 \u65E5 \xB7 \u70B9\u51FB\u4EFB\u4E00\u539F\u56E0\u7801\u8DF3\u8F6C\u8D28\u68C0\u53F0\u67E5\u770B\u660E\u7EC6",
      right: /*#__PURE__*/React.createElement("div", {
        className: "row-tight"
      }, /*#__PURE__*/React.createElement("button", {
        className: "btn btn-sm",
        "aria-pressed": mode === "risk",
        style: mode === "risk" ? {
          background: "var(--surface-3)"
        } : null,
        onClick: () => setMode("risk")
      }, "\u6309\u6761\u6570"), /*#__PURE__*/React.createElement("button", {
        className: "btn btn-sm",
        "aria-pressed": mode === "risk2",
        style: mode === "risk2" ? {
          background: "var(--surface-3)"
        } : null,
        onClick: () => setMode("risk2")
      }, "\u6309\u5360\u6BD4")),
      flush: true
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        padding: 14,
        display: "flex",
        flexDirection: "column",
        gap: 9
      }
    }, D.REJECT_DIST.map(r => /*#__PURE__*/React.createElement("div", {
      key: r.code,
      className: "qrow",
      style: {
        gridTemplateColumns: "1fr 52px",
        cursor: "pointer"
      },
      onClick: () => go({
        domain: "quality",
        page: "qc",
        payload: {
          reason: r.code
        },
        label: "质检台",
        desc: "已按原因码 " + r.code + " " + r.name + " 过滤，命中 " + r.n + " 条。"
      })
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      className: "row",
      style: {
        gap: 7
      }
    }, /*#__PURE__*/React.createElement("span", {
      className: "codechip"
    }, r.code), /*#__PURE__*/React.createElement("span", {
      className: "small"
    }, r.name), /*#__PURE__*/React.createElement("span", {
      className: "tiny muted-3",
      style: {
        marginLeft: "auto"
      }
    }, mode === "risk" ? r.n + " 条" : Math.round(r.pct * 100) + "%")), /*#__PURE__*/React.createElement("div", {
      className: "bar",
      style: {
        marginTop: 5
      }
    }, /*#__PURE__*/React.createElement("i", {
      style: {
        width: r.pct / 0.24 * 100 + "%",
        background: r.pct > 0.18 ? "var(--danger)" : r.pct > 0.1 ? "var(--warn)" : "var(--accent)"
      }
    }))), /*#__PURE__*/React.createElement("span", {
      className: "tiny muted-3 nowrap",
      style: {
        textAlign: "right"
      }
    }, "\u67E5\u770B \u203A"))))), /*#__PURE__*/React.createElement(Panel, {
      title: "\u91C7\u96C6\u5458 \xD7 \u573A\u666F \u4E00\u6B21\u901A\u8FC7\u7387\u70ED\u529B",
      sub: "\u5355\u4F4D %\uFF0C\u4F4E\u4E8E 85 \u9700\u5173\u6CE8 \xB7 \u70B9\u51FB\u5355\u5143\u683C\u8DF3\u8F6C\u8D28\u68C0\u53F0",
      flush: true
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        padding: 14
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gridTemplateColumns: "62px repeat(" + HEAT.scenes.length + ",1fr)",
        gap: 4,
        alignItems: "center"
      }
    }, /*#__PURE__*/React.createElement("span", null), HEAT.scenes.map(s => /*#__PURE__*/React.createElement("span", {
      key: s,
      className: "tiny muted-3",
      style: {
        textAlign: "center",
        lineHeight: 1.3
      }
    }, s)), HEAT.emps.map((e, ri) => /*#__PURE__*/React.createElement(React.Fragment, {
      key: e
    }, /*#__PURE__*/React.createElement("span", {
      className: "tiny muted-3",
      style: {
        textAlign: "right"
      }
    }, e), HEAT.v[ri].map((v, ci) => /*#__PURE__*/React.createElement("button", {
      key: ci,
      title: e + " · " + HEAT.scenes[ci] + " · " + v + "% · 点击查看明细",
      onClick: () => go({
        domain: "quality",
        page: "qc",
        payload: {
          emp: e,
          scene: HEAT.scenes[ci],
          pass1: v
        },
        label: "质检台",
        desc: e + " 在「" + HEAT.scenes[ci] + "」的一次通过率为 " + v + "%，已带入该组合的驳回明细。"
      }),
      style: {
        height: 34,
        borderRadius: 3,
        cursor: "pointer",
        border: "1px solid var(--line-soft)",
        background: heatColor(v),
        opacity: 0.22 + (v - 70) / 40 * 0.55,
        color: "var(--text)",
        fontFamily: "var(--font-mono)",
        fontSize: 10.5
      }
    }, v))))), /*#__PURE__*/React.createElement("div", {
      className: "hr",
      style: {
        margin: "12px 0"
      }
    }), /*#__PURE__*/React.createElement("div", {
      className: "spread tiny muted-3"
    }, /*#__PURE__*/React.createElement("span", {
      className: "row",
      style: {
        gap: 6
      }
    }, "\u4F4E ", /*#__PURE__*/React.createElement("i", {
      style: {
        width: 60,
        height: 6,
        borderRadius: 2,
        background: "var(--danger)",
        opacity: .55
      }
    }), /*#__PURE__*/React.createElement("i", {
      style: {
        width: 60,
        height: 6,
        borderRadius: 2,
        background: "var(--warn)",
        opacity: .7
      }
    }), /*#__PURE__*/React.createElement("i", {
      style: {
        width: 60,
        height: 6,
        borderRadius: 2,
        background: "var(--ok)",
        opacity: .8
      }
    }), " \u9AD8"), /*#__PURE__*/React.createElement("span", null, "\u91C7\u96C6\u5458 B @ \u88C5\u914D\u5DE5\u4F4D \u6700\u4F4E 74.6%")))), /*#__PURE__*/React.createElement(Panel, {
      title: "\u5F02\u5E38\u4E0E\u8FB9\u754C\u6E05\u5355",
      sub: "\u7B2C 10 \u7AE0 27 \u9879\uFF0C\u6BCF\u9879\u5747\u7ED9\u51FA\u53EF\u6267\u884C\u4E0B\u4E00\u6B65 \xB7 \u70B9\u51FB\u884C\u8DF3\u8F6C\u5904\u7F6E\u9875",
      right: /*#__PURE__*/React.createElement(Tag, {
        tone: "ok",
        dot: true
      }, "100% \u6709\u51FA\u8DEF"),
      flush: true
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        maxHeight: 232,
        overflow: "auto"
      }
    }, /*#__PURE__*/React.createElement("table", {
      className: "table dense"
    }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", {
      style: {
        width: 40
      }
    }, "\u7F16\u53F7"), /*#__PURE__*/React.createElement("th", null, "\u573A\u666F"), /*#__PURE__*/React.createElement("th", null, "\u7528\u6237\u51FA\u8DEF"))), /*#__PURE__*/React.createElement("tbody", null, D.EXCEPTIONS.map(x => /*#__PURE__*/React.createElement("tr", {
      key: x[0],
      className: "clickable",
      onClick: () => go({
        domain: "production",
        page: "upload",
        payload: {
          exception: x[0]
        },
        label: "上传与校验",
        desc: "已带入异常项 " + x[0] + "（" + x[1] + "）的处置上下文。"
      })
    }, /*#__PURE__*/React.createElement("td", {
      className: "mono muted-3"
    }, x[0]), /*#__PURE__*/React.createElement("td", {
      className: "nowrap"
    }, x[1]), /*#__PURE__*/React.createElement("td", {
      className: "muted pretty"
    }, x[4])))))))))));
  }

  /* ============================================================
     任务列表（源：8.3）
     ============================================================ */
  const TASK_COLS = [{
    k: "name",
    label: "任务名",
    w: "auto"
  }, {
    k: "customer",
    label: "客户"
  }, {
    k: "scene",
    label: "场景"
  }, {
    k: "progress",
    label: "进度",
    num: true
  }, {
    k: "batches",
    label: "已上传批次",
    num: true
  }, {
    k: "pass1",
    label: "一次通过率",
    num: true
  }, {
    k: "due",
    label: "交付日期",
    num: true
  }, {
    k: "status",
    label: "状态"
  }];
  function TaskList({
    app,
    set
  }) {
    const toast = window.UI.useToast();
    const [sort, setSort] = useState({
      k: "due",
      asc: true
    });
    const [flt, setFlt] = useState("全部");
    const [detail, setDetail] = useState(null);
    const [checked, setChecked] = useState([]);
    const [view, setView] = useState("全部在产");
    const rows = useMemo(() => {
      let r = D.TASKS.slice();
      if (flt === "风险") r = r.filter(t => t.risk !== "ok");
      if (flt === "采集中") r = r.filter(t => t.status === "采集中");
      if (flt === "质检中") r = r.filter(t => t.status === "质检中");
      r.sort((a, b) => {
        const x = a[sort.k],
          y = b[sort.k];
        const c = typeof x === "number" ? x - y : String(x).localeCompare(String(y), "zh");
        return sort.asc ? c : -c;
      });
      return r;
    }, [sort, flt]);
    useEffect(() => {
      if (app.payload && app.payload.create) setDetail({
        create: true
      });
    }, [app.payload]);
    return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(PageHead, {
      crumbs: [{
        label: "生产"
      }, {
        label: "任务"
      }],
      title: "\u4EFB\u52A1\u5217\u8868",
      desc: "\u5217\u56FA\u5B9A\u4E3A\u4EFB\u52A1\u540D\u3001\u5BA2\u6237\u3001\u573A\u666F\u3001\u8FDB\u5EA6\u3001\u5DF2\u4E0A\u4F20\u6279\u6B21\u3001\u4E00\u6B21\u901A\u8FC7\u7387\u3001\u4EA4\u4ED8\u65E5\u671F\u3001\u72B6\u6001\u3002\u8868\u683C\u652F\u6301\u6309\u4EFB\u610F\u9AD8\u9891\u5217\u6392\u5E8F\u5E76\u4FDD\u5B58\u4E3A\u89C6\u56FE\u3002",
      meta: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Tag, {
        tone: "quiet",
        icon: "filter"
      }, "\u5F53\u524D\u89C6\u56FE\uFF1A", view), /*#__PURE__*/React.createElement(Tag, {
        tone: "quiet"
      }, "\u5171 ", rows.length, " \u6761"), checked.length ? /*#__PURE__*/React.createElement(Tag, {
        tone: "accent"
      }, "\u5DF2\u9009 ", checked.length, " \u6761") : null),
      actions: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Btn, {
        icon: "bookmark",
        tone: "ghost",
        onClick: () => toast.push({
          tone: "ok",
          title: "视图已保存",
          desc: "「" + view + "」已保存到我的视图，下次进入自动套用。"
        })
      }, "\u4FDD\u5B58\u4E3A\u89C6\u56FE"), /*#__PURE__*/React.createElement(Btn, {
        icon: "plus",
        tone: "primary",
        onClick: () => setDetail({
          create: true
        })
      }, "\u65B0\u5EFA\u91C7\u96C6\u4EFB\u52A1"))
    }), /*#__PURE__*/React.createElement("div", {
      className: "pagebody"
    }, /*#__PURE__*/React.createElement("div", {
      className: "panel",
      style: {
        overflow: "hidden"
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "panel-head",
      style: {
        gap: 8
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "row-tight",
      style: {
        gap: 3
      }
    }, ["全部", "风险", "采集中", "质检中"].map(f => /*#__PURE__*/React.createElement("button", {
      key: f,
      className: "btn btn-sm",
      "aria-pressed": flt === f,
      style: flt === f ? {
        background: "var(--surface-3)",
        borderColor: "var(--line-strong)"
      } : null,
      onClick: () => setFlt(f)
    }, f))), /*#__PURE__*/React.createElement("div", {
      className: "hr",
      style: {
        width: 1,
        height: 18,
        background: "var(--line)"
      }
    }), /*#__PURE__*/React.createElement("div", {
      className: "gsearch",
      style: {
        flex: "0 1 260px",
        height: 26
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      n: "search",
      s: 13
    }), /*#__PURE__*/React.createElement("input", {
      placeholder: "\u6309\u4EFB\u52A1\u540D / \u5BA2\u6237 / \u573A\u666F\u7B5B\u9009"
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        marginLeft: "auto",
        display: "flex",
        gap: 8
      }
    }, /*#__PURE__*/React.createElement("span", {
      className: "tiny muted-3",
      style: {
        alignSelf: "center"
      }
    }, "\u5DF2\u9009 ", checked.length, " \u6761"), /*#__PURE__*/React.createElement(Btn, {
      size: "sm",
      tone: "ghost",
      icon: "download",
      disabled: !checked.length,
      onClick: () => toast.push({
        tone: "ok",
        title: "已导出明细",
        desc: "选中 " + checked.length + " 条任务的批次明细已导出为 CSV，失败项可单独下载原因。"
      })
    }, "\u5BFC\u51FA\u660E\u7EC6"), /*#__PURE__*/React.createElement(Btn, {
      size: "sm",
      tone: "ghost",
      icon: "bell",
      disabled: !checked.length,
      onClick: () => toast.push({
        tone: "warn",
        title: "批量提醒已发送",
        desc: "已按任务责任人合并推送，同一任务 1 小时内不重复通知。"
      })
    }, "\u6279\u91CF\u50AC\u529E"))), /*#__PURE__*/React.createElement("table", {
      className: "table"
    }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", {
      style: {
        width: 34
      }
    }, /*#__PURE__*/React.createElement("label", {
      className: "check"
    }, /*#__PURE__*/React.createElement("input", {
      type: "checkbox",
      checked: checked.length === rows.length && rows.length > 0,
      onChange: e => setChecked(e.target.checked ? rows.map(r => r.id) : [])
    }))), TASK_COLS.map(c => /*#__PURE__*/React.createElement("th", {
      key: c.k,
      className: cls(c.num && "num", "sortable"),
      onClick: () => setSort(s => ({
        k: c.k,
        asc: s.k === c.k ? !s.asc : true
      }))
    }, c.label, sort.k === c.k ? /*#__PURE__*/React.createElement("span", {
      className: "sortcaret"
    }, /*#__PURE__*/React.createElement(Icon, {
      n: sort.asc ? "arrowUp" : "arrowDown",
      s: 10,
      sw: 2.2
    })) : null)), /*#__PURE__*/React.createElement("th", {
      style: {
        width: 40
      }
    }))), /*#__PURE__*/React.createElement("tbody", null, rows.map(t => /*#__PURE__*/React.createElement("tr", {
      key: t.id,
      className: cls("clickable", checked.indexOf(t.id) >= 0 && "selected")
    }, /*#__PURE__*/React.createElement("td", {
      onClick: e => e.stopPropagation()
    }, /*#__PURE__*/React.createElement("label", {
      className: "check"
    }, /*#__PURE__*/React.createElement("input", {
      type: "checkbox",
      checked: checked.indexOf(t.id) >= 0,
      onChange: e => setChecked(e.target.checked ? checked.concat([t.id]) : checked.filter(x => x !== t.id))
    }))), /*#__PURE__*/React.createElement("td", {
      onClick: () => set({
        page: "detail",
        payload: {
          id: t.id
        }
      })
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontWeight: 600
      }
    }, t.name), /*#__PURE__*/React.createElement("div", {
      className: "tiny muted-3 mono"
    }, t.id, " \xB7 ", t.spec, " \xB7 ", t.mode)), /*#__PURE__*/React.createElement("td", {
      className: "nowrap",
      onClick: () => set({
        page: "detail",
        payload: {
          id: t.id
        }
      })
    }, /*#__PURE__*/React.createElement("div", null, t.customer), /*#__PURE__*/React.createElement("div", {
      className: "tiny muted-3"
    }, t.embodiment)), /*#__PURE__*/React.createElement("td", {
      className: "nowrap",
      onClick: () => set({
        page: "detail",
        payload: {
          id: t.id
        }
      })
    }, t.scene), /*#__PURE__*/React.createElement("td", {
      className: "num",
      onClick: () => set({
        page: "detail",
        payload: {
          id: t.id
        }
      })
    }, Math.round(t.progress * 100), "%"), /*#__PURE__*/React.createElement("td", {
      className: "num",
      onClick: () => set({
        page: "detail",
        payload: {
          id: t.id
        }
      })
    }, t.batches), /*#__PURE__*/React.createElement("td", {
      className: "num",
      onClick: () => set({
        page: "detail",
        payload: {
          id: t.id
        }
      })
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        color: t.pass1 < 0.85 ? "var(--danger)" : t.pass1 >= 0.93 ? "var(--ok)" : "var(--text)"
      }
    }, (t.pass1 * 100).toFixed(1), "%")), /*#__PURE__*/React.createElement("td", {
      className: "num",
      onClick: () => set({
        page: "detail",
        payload: {
          id: t.id
        }
      })
    }, t.due), /*#__PURE__*/React.createElement("td", {
      onClick: () => set({
        page: "detail",
        payload: {
          id: t.id
        }
      })
    }, /*#__PURE__*/React.createElement(Tag, {
      tone: t.risk === "danger" ? "danger" : t.risk === "warn" ? "warn" : t.status === "已交付" ? "ok" : "review",
      dot: true
    }, t.status)), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement(IconBtn, {
      n: "more",
      title: "\u66F4\u591A\u64CD\u4F5C",
      onClick: e => {
        e.stopPropagation();
        toast.push({
          tone: "info",
          title: "操作菜单",
          desc: "撤回任务 / 复制任务 / 查看数据血缘 / 归档。"
        });
      }
    })))))), /*#__PURE__*/React.createElement("div", {
      className: "panel-foot"
    }, /*#__PURE__*/React.createElement("span", null, "\u5171 ", rows.length, " \u6761 \xB7 \u6BCF\u9875 20 \u6761"), /*#__PURE__*/React.createElement("span", {
      className: "row",
      style: {
        marginLeft: "auto",
        gap: 6
      }
    }, /*#__PURE__*/React.createElement(Btn, {
      size: "sm",
      tone: "ghost",
      icon: "chevLeft",
      disabled: true
    }, "\u4E0A\u4E00\u9875"), /*#__PURE__*/React.createElement("span", {
      className: "mono small"
    }, "1 / 1"), /*#__PURE__*/React.createElement(Btn, {
      size: "sm",
      tone: "ghost",
      icon: "chevRight",
      disabled: true
    }, "\u4E0B\u4E00\u9875")))), /*#__PURE__*/React.createElement("p", {
      className: "tiny muted-3",
      style: {
        marginTop: 10
      }
    }, "\u4E0A\u4E0B\u6587\u4FDD\u6301\uFF1A\u4ECE\u5217\u8868\u8FDB\u5165\u8BE6\u60C5\u518D\u8FD4\u56DE\u65F6\uFF0C\u7B5B\u9009\u6761\u4EF6\u3001\u6392\u5E8F\u3001\u6EDA\u52A8\u4F4D\u7F6E\u4E0E\u5206\u9875\u5747\u4FDD\u7559\uFF08\u539F\u578B\u4E2D\u4EE5\u89C6\u56FE\u72B6\u6001\u6A21\u62DF\uFF09\u3002")), detail && detail.create ? /*#__PURE__*/React.createElement(CreateTaskWizard, {
      onClose: () => setDetail(null)
    }) : null);
  }

  /* ---------- 新建任务向导（源：7.1 七步 / 6.1 A4.2 三步向导） ---------- */
  const WIZ_STEPS = ["基本信息", "数据规格", "指派与排期", "下发前校验"];
  function CreateTaskWizard({
    onClose
  }) {
    const toast = window.UI.useToast();
    const [i, setI] = useState(0);
    const [nl, setNl] = useState("厨房台面把毛巾折叠两次并放到右侧托盘");
    const [name, setName] = useState("厨房台面折叠衣物（Ego）");
    const [mods, setMods] = useState(["RGB-D 头部", "腕部 RGB", "关节角度与力矩", "末端位姿", "触觉阵列"]);
    const [tight, setTight] = useState(false);
    const [saved, setSaved] = useState("12:31");
    useEffect(() => {
      const id = setTimeout(() => setSaved("刚刚"), 2500);
      return () => clearTimeout(id);
    }, []);
    const MODS = ["RGB-D 头部", "腕部 RGB", "激光雷达", "关节角度与力矩", "末端位姿", "IMU", "触觉阵列", "音频", "手柄状态"];
    const est = {
      n: 1200,
      hours: 6.4,
      man: 42
    };
    const CHECKS = [["规格模板已冻结", true], ["本体与设备可用", true], ["点位与人员无冲突", !tight], ["模态与本体组合受支持", true], ["质量阈值在可行区间", true], ["交付日期晚于估算工期", true], ["命名规范已套用", true], ["合规密级已标注", true]];
    return /*#__PURE__*/React.createElement(Drawer, {
      title: "\u65B0\u5EFA\u91C7\u96C6\u4EFB\u52A1",
      sub: /*#__PURE__*/React.createElement("span", {
        className: "row",
        style: {
          gap: 6
        }
      }, /*#__PURE__*/React.createElement(Icon, {
        n: "check",
        s: 11
      }), " \u8349\u7A3F\u5DF2\u4FDD\u5B58 ", saved, " ", /*#__PURE__*/React.createElement("span", {
        className: "muted-3"
      }, "\xB7 \u7F51\u7EDC\u4E2D\u65AD\u65F6\u672C\u5730\u6682\u5B58\u5E76\u6301\u7EED\u91CD\u8BD5")),
      onClose: onClose,
      width: 640,
      foot: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Btn, {
        tone: "ghost",
        onClick: onClose
      }, "\u53D6\u6D88"), /*#__PURE__*/React.createElement("span", {
        className: "grow"
      }), /*#__PURE__*/React.createElement("span", {
        className: "tiny muted-3",
        style: {
          alignSelf: "center"
        }
      }, "\u6B65\u9AA4 ", i + 1, " / ", WIZ_STEPS.length), /*#__PURE__*/React.createElement(Btn, {
        tone: "ghost",
        icon: "chevLeft",
        disabled: i === 0,
        onClick: () => setI(i - 1)
      }, "\u4E0A\u4E00\u6B65"), i < WIZ_STEPS.length - 1 ? /*#__PURE__*/React.createElement(Btn, {
        tone: "primary",
        iconRight: "chevRight",
        onClick: () => setI(i + 1)
      }, "\u4E0B\u4E00\u6B65") : /*#__PURE__*/React.createElement(Btn, {
        tone: "primary",
        icon: "send",
        onClick: () => {
          onClose();
          toast.push({
            tone: "ok",
            title: "任务已下发",
            desc: "任务卡已推送到 3 台采集端，状态变为已下发，等待采集员确认。24 小时未确认将自动升级通知现场督导。",
            action: {
              label: "查看任务",
              fn: () => {}
            }
          });
        }
      }, "\u786E\u8BA4\u4E0B\u53D1"))
    }, /*#__PURE__*/React.createElement("div", {
      className: "row",
      style: {
        gap: 6
      }
    }, WIZ_STEPS.map((s, k) => /*#__PURE__*/React.createElement("button", {
      key: s,
      className: "btn btn-sm",
      "aria-pressed": k === i,
      style: k === i ? {
        background: "var(--accent)",
        borderColor: "var(--accent)",
        color: "#fff"
      } : k < i ? {
        borderColor: "var(--ok)",
        color: "var(--ok)"
      } : null,
      onClick: () => setI(k)
    }, k + 1, ". ", s))), i === 0 ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Field, {
      label: "\u4EFB\u52A1\u540D",
      req: true
    }, /*#__PURE__*/React.createElement("input", {
      className: "input",
      value: name,
      onChange: e => setName(e.target.value)
    })), /*#__PURE__*/React.createElement(Field, {
      label: "\u81EA\u7136\u8BED\u8A00\u63CF\u8FF0",
      hint: "\u7CFB\u7EDF\u4F1A\u7FFB\u8BD1\u4E3A\u7ED3\u6784\u5316\u89C4\u683C\uFF0C\u7FFB\u8BD1\u7ED3\u679C\u53EF\u89C1\u53EF\u6539"
    }, /*#__PURE__*/React.createElement("textarea", {
      className: "textarea",
      rows: 3,
      value: nl,
      onChange: e => setNl(e.target.value)
    })), /*#__PURE__*/React.createElement("div", {
      className: "panel-inset",
      style: {
        padding: 11
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "row",
      style: {
        gap: 6,
        marginBottom: 8
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      n: "cpu",
      s: 13,
      style: {
        color: "var(--accent)"
      }
    }), /*#__PURE__*/React.createElement("span", {
      className: "small",
      style: {
        fontWeight: 600
      }
    }, "\u89E3\u6790\u7ED3\u679C\uFF08\u53EF\u9010\u9879\u4FEE\u6539\uFF09"), /*#__PURE__*/React.createElement(Tag, {
      tone: "quiet",
      style: {
        marginLeft: "auto"
      }
    }, "\u7F6E\u4FE1\u5EA6 0.93")), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexWrap: "wrap",
        gap: 6
      }
    }, [["场景", "厨房 / 台面"], ["技能", "折叠衣物"], ["步骤数", "4"], ["目标物", "毛巾 ×1"], ["末端", "右侧托盘"], ["本体", "人形 · 双臂"]].map(c => /*#__PURE__*/React.createElement("span", {
      key: c[0],
      className: "check",
      style: {
        border: "1px solid var(--line)",
        borderRadius: 4,
        padding: "3px 8px",
        background: "var(--surface-1)"
      }
    }, /*#__PURE__*/React.createElement("span", {
      className: "tiny muted-3"
    }, c[0]), /*#__PURE__*/React.createElement("span", {
      className: "small"
    }, c[1]), /*#__PURE__*/React.createElement(Icon, {
      n: "edit",
      s: 11,
      style: {
        color: "var(--text-4)"
      }
    }))))), /*#__PURE__*/React.createElement(Field, {
      label: "\u5BA2\u6237\u4E0E\u9879\u76EE",
      req: true
    }, /*#__PURE__*/React.createElement("select", {
      className: "select"
    }, /*#__PURE__*/React.createElement("option", null, "\u6052\u7ACB\u673A\u5668\u4EBA \xB7 \u4EE3\u53F7 B01 \xB7 \u4EBA\u5F62\u53CC\u81C2\u6570\u636E\u7EBF"), /*#__PURE__*/React.createElement("option", null, "\u701A\u6D77\u5DE5\u4E1A \xB7 \u4EE3\u53F7 B02"), /*#__PURE__*/React.createElement("option", null, "\u62D3\u5143\u7CBE\u5BC6 \xB7 \u4EE3\u53F7 B03"))), /*#__PURE__*/React.createElement("div", {
      className: "warnbox info"
    }, "\u89C4\u683C\u51BB\u7ED3\u662F\u5F3A\u7EA6\u675F\u800C\u975E\u63D0\u793A\uFF1A\u6A21\u677F\u4E00\u7ECF\u5F15\u7528\u5373\u51BB\u7ED3\u7248\u672C\uFF0C\u9009\u62E9\u5668\u5185\u53EA\u53EF\u9884\u89C8\u4E0D\u53EF\u7F16\u8F91\u3002\u9700\u8981\u4FEE\u6539\u65F6\u7CFB\u7EDF\u5F15\u5BFC\u53E6\u5B58\u4E3A\u65B0\u7248\u672C\uFF0C\u539F\u4EFB\u52A1\u4E0E\u5386\u53F2\u6279\u6B21\u4ECD\u6307\u5411\u65E7\u7248\u672C\u3002")) : null, i === 1 ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
      className: "spread"
    }, /*#__PURE__*/React.createElement(Field, {
      label: "\u89C4\u683C\u6A21\u677F",
      req: true,
      className: "grow"
    }, /*#__PURE__*/React.createElement("select", {
      className: "select"
    }, /*#__PURE__*/React.createElement("option", null, "EGO-KITCH-02 v1.2\uFF08\u5F53\u524D\u6700\u65B0\uFF09"), /*#__PURE__*/React.createElement("option", null, "EGO-KITCH-02 v1.1"))), /*#__PURE__*/React.createElement(Tag, {
      tone: "accent",
      icon: "lock",
      style: {
        marginTop: 22,
        height: 24
      }
    }, "\u5DF2\u5F15\u7528\u5E76\u51BB\u7ED3 v1.2")), /*#__PURE__*/React.createElement(Field, {
      label: "\u91C7\u96C6\u6A21\u5F0F",
      req: true,
      hint: "\u56DB\u79CD\u6A21\u5F0F\u5171\u7528\u540C\u4E00\u5957\u89C4\u683C\u4E0E\u8D28\u68C0\u53E3\u5F84"
    }, /*#__PURE__*/React.createElement("select", {
      className: "select",
      defaultValue: "\u793A\u6559\u91C7\u96C6"
    }, /*#__PURE__*/React.createElement("option", null, "\u793A\u6559\u91C7\u96C6"), /*#__PURE__*/React.createElement("option", null, "\u81EA\u52A8\u56DE\u653E\u91C7\u96C6"), /*#__PURE__*/React.createElement("option", null, "\u89E6\u53D1\u5F0F\u91C7\u96C6\uFF08\u63A5\u89E6\u6216\u5230\u8FBE\u4F4D\u7F6E\u81EA\u52A8\u8D77\u505C\uFF09"), /*#__PURE__*/React.createElement("option", null, "\u6B63\u8D1F\u6837\u672C\u7EDF\u4E00\u91C7\u96C6"))), /*#__PURE__*/React.createElement(Field, {
      label: "\u4F20\u611F\u5668\u6A21\u6001",
      hint: "\u52FE\u9009\u540E\u5B9E\u65F6\u4F30\u7B97\u4EA7\u91CF\u4E0E\u5DE5\u65F6"
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexWrap: "wrap",
        gap: 8,
        marginTop: 2
      }
    }, MODS.map(m => /*#__PURE__*/React.createElement("label", {
      key: m,
      className: "check",
      style: {
        border: "1px solid var(--line)",
        borderRadius: 4,
        padding: "4px 9px",
        background: mods.indexOf(m) >= 0 ? "var(--accent-dim)" : "var(--surface-1)",
        borderColor: mods.indexOf(m) >= 0 ? "var(--accent-line)" : "var(--line)"
      }
    }, /*#__PURE__*/React.createElement("input", {
      type: "checkbox",
      checked: mods.indexOf(m) >= 0,
      onChange: e => setMods(e.target.checked ? mods.concat([m]) : mods.filter(x => x !== m))
    }), /*#__PURE__*/React.createElement("span", {
      className: "small",
      style: {
        color: mods.indexOf(m) >= 0 ? "var(--accent-hi)" : "var(--text-2)"
      }
    }, m))))), /*#__PURE__*/React.createElement("div", {
      className: "grid g-3"
    }, /*#__PURE__*/React.createElement("div", {
      className: "panel-inset",
      style: {
        padding: 11
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "tiny muted-3"
    }, "\u9884\u8BA1\u6761\u6570"), /*#__PURE__*/React.createElement("div", {
      className: "mono",
      style: {
        fontSize: 21,
        fontWeight: 600
      }
    }, est.n)), /*#__PURE__*/React.createElement("div", {
      className: "panel-inset",
      style: {
        padding: 11
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "tiny muted-3"
    }, "\u9884\u8BA1\u6709\u6548\u65F6\u957F"), /*#__PURE__*/React.createElement("div", {
      className: "mono",
      style: {
        fontSize: 21,
        fontWeight: 600
      }
    }, est.hours, "h")), /*#__PURE__*/React.createElement("div", {
      className: "panel-inset",
      style: {
        padding: 11
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "tiny muted-3"
    }, "\u9884\u8BA1\u4EBA\u65F6"), /*#__PURE__*/React.createElement("div", {
      className: "mono",
      style: {
        fontSize: 21,
        fontWeight: 600,
        color: "var(--warn)"
      }
    }, est.man, "h"))), /*#__PURE__*/React.createElement("p", {
      className: "tiny muted-3",
      style: {
        lineHeight: 1.7
      }
    }, "\u4EA7\u91CF\u4F30\u7B97\u53CD\u5411\u5F71\u54CD\u89C4\u683C\uFF1A\u52FE\u9009\u9AD8\u91C7\u6837\u7387\u3001\u591A\u6A21\u6001\u3001\u957F\u65F6\u957F\u65F6\uFF0C\u7CFB\u7EDF\u540C\u65F6\u7ED9\u51FA\u9884\u8BA1\u4EBA\u65F6\u4E0E\u8BBE\u5907\u5360\u7528\uFF0C\u8BA9\u65B9\u6848\u5236\u5B9A\u8005\u5728\u89C4\u683C\u4E0E\u4EA7\u80FD\u4E4B\u95F4\u505A\u663E\u5F0F\u6743\u8861\uFF0C\u800C\u4E0D\u662F\u4E0B\u53D1\u540E\u624D\u53D1\u73B0\u6392\u4E0D\u4E0B\u3002"), /*#__PURE__*/React.createElement(Switch, {
      checked: tight,
      onChange: setTight,
      label: "\u6536\u7D27\u76EE\u6807\u53EF\u89C1\u7387\u9608\u503C\u81F3 85%\uFF08\u9ED8\u8BA4 70%\uFF09"
    }), tight ? /*#__PURE__*/React.createElement("div", {
      className: "warnbox"
    }, "\u6536\u7D27\u540E\u9884\u8BA1\u4E00\u6B21\u901A\u8FC7\u7387\u4E0B\u964D 6\u20139 pt\uFF0C\u4EBA\u65F6\u4E0A\u5347\u7EA6 18%\u3002\u8BE5\u53D8\u66F4\u4F1A\u4EE5\u6A59\u8272\u6807\u8BB0\u5E76\u5199\u5165\u6210\u672C\u5F71\u54CD\u8BF4\u660E\u3002") : null) : null, i === 2 ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Field, {
      label: "\u70B9\u4F4D",
      req: true
    }, /*#__PURE__*/React.createElement("select", {
      className: "select"
    }, /*#__PURE__*/React.createElement("option", null, "\u53A8\u623F / \u53F0\u9762 K2\uFF08\u4ECA\u65E5\u8D1F\u8377 78%\uFF09"), /*#__PURE__*/React.createElement("option", null, "\u53A8\u623F / \u53F0\u9762 K3\uFF08\u4ECA\u65E5\u8D1F\u8377 34%\uFF09"))), /*#__PURE__*/React.createElement(Field, {
      label: "\u91C7\u96C6\u5458",
      req: true,
      hint: "\u51B2\u7A81\u884C\u5185\u663E\u793A\u9EC4\u8272\u63D0\u793A\u4E0E\u5F53\u65E5\u8D1F\u8377"
    }, /*#__PURE__*/React.createElement("select", {
      className: "select"
    }, /*#__PURE__*/React.createElement("option", null, "\u91C7\u96C6\u5458 A\uFF08\u5F53\u65E5\u8D1F\u8377 82%\uFF09"), /*#__PURE__*/React.createElement("option", null, "\u91C7\u96C6\u5458 B\uFF08\u5F53\u65E5\u8D1F\u8377 96%\uFF09"), /*#__PURE__*/React.createElement("option", null, "\u91C7\u96C6\u5458 C\uFF08\u5F53\u65E5\u8D1F\u8377 41%\uFF09"))), !tight ? null : null, /*#__PURE__*/React.createElement("div", {
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
    }), /*#__PURE__*/React.createElement("span", null, "\u91C7\u96C6\u5458 B \u5728 09-16 14:00\u201318:00 \u5DF2\u88AB TK-2409-009 \u5360\u7528\u3002\u82E5\u9009\u62E9\u8BE5\u4EBA\u5458\uFF0C\u53EF\u8C03\u6574\u65F6\u6BB5\u3001\u66F4\u6362\u4EBA\u5458\uFF0C\u6216\u67E5\u770B\u5F53\u65E5\u8D1F\u8377\u540E\u786E\u8BA4\u3002")), /*#__PURE__*/React.createElement("div", {
      className: "grid g-2"
    }, /*#__PURE__*/React.createElement(Field, {
      label: "\u4EA4\u4ED8\u65E5\u671F",
      req: true
    }, /*#__PURE__*/React.createElement("input", {
      className: "input mono",
      defaultValue: "2026-09-19"
    })), /*#__PURE__*/React.createElement(Field, {
      label: "\u62BD\u68C0\u7B56\u7565"
    }, /*#__PURE__*/React.createElement("select", {
      className: "select"
    }, /*#__PURE__*/React.createElement("option", null, "\u6309\u91C7\u96C6\u5458\u4E0E\u98CE\u9669\u7B49\u7EA7\uFF08\u63A8\u8350\uFF09"), /*#__PURE__*/React.createElement("option", null, "\u56FA\u5B9A\u6BD4\u4F8B 10%"), /*#__PURE__*/React.createElement("option", null, "\u5168\u68C0")))), /*#__PURE__*/React.createElement(Field, {
      label: "\u8D28\u91CF\u8981\u6C42",
      hint: "\u4ECE\u89C4\u5219\u5E93\u5E26\u51FA\u9ED8\u8BA4\u9608\u503C\uFF0C\u5141\u8BB8\u6536\u7D27"
    }, /*#__PURE__*/React.createElement("div", {
      className: "panel-inset",
      style: {
        padding: 11
      }
    }, [["QC-FRAME-01 有效帧占比", "≥ 80%", false], ["QC-VIS-01 目标可见率", tight ? "≥ 85%" : "≥ 70%", tight], ["QC-MOT-01 静止段占比", "≤ 30%", false], ["QC-ALIGN-01 观测与动作偏差", "≤ 2 帧", false]].map(r => /*#__PURE__*/React.createElement("div", {
      key: r[0],
      className: "spread",
      style: {
        padding: "5px 0",
        borderBottom: "1px solid var(--line-soft)"
      }
    }, /*#__PURE__*/React.createElement("span", {
      className: "small muted"
    }, r[0]), /*#__PURE__*/React.createElement("span", {
      className: "mono small",
      style: {
        color: r[2] ? "var(--warn)" : "var(--text)"
      }
    }, r[1], r[2] ? /*#__PURE__*/React.createElement("span", {
      className: "tiny",
      style: {
        marginLeft: 6
      }
    }, "\u5DF2\u6536\u7D27") : null)))))) : null, i === 3 ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
      className: "spread"
    }, /*#__PURE__*/React.createElement("span", {
      className: "small",
      style: {
        fontWeight: 600
      }
    }, "\u4E0B\u53D1\u524D\u6821\u9A8C\uFF088 \u9879\uFF09"), /*#__PURE__*/React.createElement(Tag, {
      tone: tight ? "warn" : "ok",
      dot: true
    }, tight ? "1 项未通过" : "全部通过")), /*#__PURE__*/React.createElement("div", {
      style: {
        border: "1px solid var(--line)",
        borderRadius: 4,
        overflow: "hidden"
      }
    }, CHECKS.map((c, k) => /*#__PURE__*/React.createElement("div", {
      key: k,
      className: "spread",
      style: {
        padding: "9px 11px",
        borderBottom: k < CHECKS.length - 1 ? "1px solid var(--line-soft)" : 0,
        background: !c[1] ? "var(--warn-dim)" : "transparent"
      }
    }, /*#__PURE__*/React.createElement("span", {
      className: "row",
      style: {
        gap: 8
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      n: c[1] ? "check" : "warn",
      s: 13,
      style: {
        color: c[1] ? "var(--ok)" : "var(--warn)"
      }
    }), /*#__PURE__*/React.createElement("span", {
      className: "small",
      style: {
        color: c[1] ? "var(--text-2)" : "var(--warn)"
      }
    }, c[0])), c[1] ? /*#__PURE__*/React.createElement("span", {
      className: "tiny muted-3"
    }, "\u901A\u8FC7") : /*#__PURE__*/React.createElement("span", {
      className: "row",
      style: {
        gap: 8
      }
    }, /*#__PURE__*/React.createElement("span", {
      className: "tiny",
      style: {
        color: "var(--warn)"
      }
    }, "\u7F3A\uFF1A\u70B9\u4F4D K3 \u672A\u88AB\u6307\u6D3E\u4EBA\u5458"), /*#__PURE__*/React.createElement(Btn, {
      size: "sm",
      tone: "ghost",
      icon: "arrowRight",
      onClick: () => setI(2)
    }, "\u53BB\u4FEE\u6B63"))))), /*#__PURE__*/React.createElement("p", {
      className: "tiny muted-3",
      style: {
        lineHeight: 1.7
      }
    }, "\u4E0B\u53D1\u6821\u9A8C\u6E05\u5355\u5FC5\u987B\u53EF\u89E3\u91CA\u2014\u2014\u672A\u901A\u8FC7\u9879\u4E0D\u80FD\u53EA\u8BF4\u300C\u6821\u9A8C\u5931\u8D25\u300D\uFF0C\u800C\u8981\u5199\u6E05\u7F3A\u4EC0\u4E48\u3001\u53BB\u54EA\u8865\u3001\u8865\u5B8C\u662F\u5426\u8FD8\u9700\u91CD\u65B0\u6821\u9A8C\u3002"), /*#__PURE__*/React.createElement("div", {
      className: "warnbox info"
    }, "\u4E0B\u53D1\u540E\u91C7\u96C6\u5458 24 \u5C0F\u65F6\u672A\u786E\u8BA4\u65F6\uFF0C\u7CFB\u7EDF\u81EA\u52A8\u5347\u7EA7\u901A\u77E5\u73B0\u573A\u7763\u5BFC\uFF0C\u907F\u514D\u4EFB\u52A1\u6302\u5728\u65E0\u4EBA\u8BA4\u9886\u7684\u72B6\u6001\u3002")) : null);
  }

  /* ============================================================
     任务详情 · 时间线（源：8.3）
     ============================================================ */
  function TaskDetail({
    app,
    set
  }) {
    const toast = window.UI.useToast();
    const t = D.TASKS.filter(x => x.id === (app.payload && app.payload.id))[0] || D.TASKS[0];
    const steps = t.steps && t.steps.length ? t.steps : [{
      k: "创建",
      t: "09-11 09:20",
      who: "项目经理",
      out: "任务已创建",
      st: "done",
      note: ""
    }, {
      k: "已下发",
      t: "09-11 09:41",
      who: "项目经理",
      out: "任务卡已推送",
      st: "done",
      note: ""
    }, {
      k: "已确认",
      t: "09-11 10:02",
      who: "采集员 A",
      out: "确认接收",
      st: "done",
      note: ""
    }, {
      k: "采集中",
      t: "09-11 10:30 起",
      who: "采集组",
      out: t.done + " / " + t.plan + " 条",
      st: "active",
      note: ""
    }, {
      k: "上传中",
      t: "持续",
      who: "系统",
      out: "队列 0",
      st: "active",
      note: ""
    }, {
      k: "质检中",
      t: "09-13 14:00 起",
      who: "质检员",
      out: "已判定 " + Math.round(t.done * 0.8) + " 条",
      st: "active",
      note: ""
    }, {
      k: "标注中",
      t: "09-14 09:00 起",
      who: "标注组",
      out: "已提交 " + Math.round(t.done * 0.6) + " 条",
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
    }];
    return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(PageHead, {
      crumbs: [{
        label: "生产",
        to: () => set({
          page: "tasks"
        })
      }, {
        label: "任务",
        to: () => set({
          page: "tasks"
        })
      }, {
        label: t.id
      }],
      title: t.name,
      desc: "\u8BE6\u60C5\u9875\u6309\u65F6\u95F4\u7EBF\u7EC4\u7EC7\uFF0C\u800C\u975E\u6309\u5B57\u6BB5\u5806\u53E0\u3002\u6BCF\u4E2A\u8282\u70B9\u663E\u793A\u8D23\u4EFB\u4EBA\u3001\u65F6\u95F4\u4E0E\u4EA7\u51FA\u6570\u91CF\u3002\u4E89\u8BAE\u4E0E\u5F02\u5E38\u4E8B\u4EF6\u4F5C\u4E3A\u63D2\u53D9\u8282\u70B9\u51FA\u73B0\u5728\u65F6\u95F4\u7EBF\u4E0A\uFF0C\u4F7F\u300C\u8FD9\u4E2A\u4EFB\u52A1\u5230\u5E95\u5361\u5728\u54EA\u300D\u4E00\u773C\u53EF\u89C1\u3002",
      meta: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Tag, {
        tone: "quiet",
        icon: "user"
      }, t.customer, " \xB7 ", t.code), /*#__PURE__*/React.createElement(Tag, {
        tone: "quiet",
        icon: "pin"
      }, t.scene), /*#__PURE__*/React.createElement(Tag, {
        tone: "quiet",
        icon: "robot"
      }, t.embodiment), /*#__PURE__*/React.createElement(Tag, {
        tone: "quiet",
        icon: "cube"
      }, t.spec), /*#__PURE__*/React.createElement(Tag, {
        tone: "accent",
        icon: "lock"
      }, "\u89C4\u683C\u5DF2\u51BB\u7ED3"), /*#__PURE__*/React.createElement(Tag, {
        tone: t.risk === "danger" ? "danger" : t.risk === "warn" ? "warn" : "ok",
        dot: true
      }, t.status)),
      actions: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Btn, {
        icon: "bell",
        tone: "ghost",
        onClick: () => toast.push({
          tone: "info",
          title: "已订阅该任务",
          desc: "状态变化、驳回、交期风险将按分级规则通知你。"
        })
      }, "\u8BA2\u9605\u52A8\u6001"), /*#__PURE__*/React.createElement(Btn, {
        icon: "download",
        tone: "ghost",
        onClick: () => toast.push({
          tone: "ok",
          title: "批次明细已导出",
          desc: "任务 " + t.id + " 的批次明细已导出为 CSV。"
        })
      }, "\u5BFC\u51FA\u6279\u6B21"), /*#__PURE__*/React.createElement(Btn, {
        tone: "ghost",
        icon: "more"
      }, "\u66F4\u591A"))
    }), /*#__PURE__*/React.createElement("div", {
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
    }, "\u8FDB\u5EA6"), /*#__PURE__*/React.createElement("div", {
      className: "mono",
      style: {
        fontSize: 23,
        fontWeight: 600
      }
    }, Math.round(t.progress * 100), "%"), /*#__PURE__*/React.createElement("div", {
      className: cls("bar", t.risk === "danger" ? "danger" : t.risk === "warn" ? "warn" : ""),
      style: {
        marginTop: 8
      }
    }, /*#__PURE__*/React.createElement("i", {
      style: {
        width: t.progress * 100 + "%"
      }
    }))), /*#__PURE__*/React.createElement("div", {
      className: "panel-inset",
      style: {
        padding: 12
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "tiny muted-3"
    }, "\u4E00\u6B21\u901A\u8FC7\u7387"), /*#__PURE__*/React.createElement("div", {
      className: "mono",
      style: {
        fontSize: 23,
        fontWeight: 600,
        color: t.pass1 < 0.85 ? "var(--danger)" : "var(--text)"
      }
    }, (t.pass1 * 100).toFixed(1), "%"), /*#__PURE__*/React.createElement("div", {
      className: "tiny muted-3",
      style: {
        marginTop: 8
      }
    }, t.pass1d > 0 ? "较上周 +" : "较上周 ", (t.pass1d * 100).toFixed(1), " pt")), /*#__PURE__*/React.createElement("div", {
      className: "panel-inset",
      style: {
        padding: 12
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "tiny muted-3"
    }, "\u5DF2\u4E0A\u4F20\u6279\u6B21"), /*#__PURE__*/React.createElement("div", {
      className: "mono",
      style: {
        fontSize: 23,
        fontWeight: 600
      }
    }, t.batches), /*#__PURE__*/React.createElement("div", {
      className: "tiny muted-3",
      style: {
        marginTop: 8
      }
    }, "\u5171 ", t.plan, " \u6761\u8BA1\u5212\u91CF")), /*#__PURE__*/React.createElement("div", {
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
        color: t.risk !== "ok" ? "var(--warn)" : "var(--text)"
      }
    }, t.due), /*#__PURE__*/React.createElement("div", {
      className: "tiny muted-3",
      style: {
        marginTop: 8
      }
    }, "\u8D23\u4EFB\u4EBA ", t.owner))), /*#__PURE__*/React.createElement("div", {
      className: "detail-split"
    }, /*#__PURE__*/React.createElement(Panel, {
      title: "\u4EFB\u52A1\u65F6\u95F4\u7EBF",
      sub: "\u5F02\u5E38\u4E0E\u4E89\u8BAE\u4F5C\u4E3A\u63D2\u53D9\u8282\u70B9",
      flush: true
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        padding: "16px 16px 8px"
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "tlflow"
    }, steps.map((s, i) => /*#__PURE__*/React.createElement("div", {
      key: i,
      className: cls("tlflow-node", s.st === "active" ? "active" : s.st === "done" ? "done" : s.st === "insert" ? "insert" : s.st === "blocked" ? "blocked" : "")
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
    }) : s.st === "insert" ? "" : "·"), i < steps.length - 1 ? /*#__PURE__*/React.createElement("span", {
      className: "tlflow-line"
    }) : null), /*#__PURE__*/React.createElement("div", {
      className: "tlflow-body"
    }, /*#__PURE__*/React.createElement("div", {
      className: "spread"
    }, /*#__PURE__*/React.createElement("span", {
      className: "row",
      style: {
        gap: 8
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 13,
        fontWeight: 600
      }
    }, s.k), s.st === "active" ? /*#__PURE__*/React.createElement(Tag, {
      tone: "accent",
      dot: true
    }, "\u8FDB\u884C\u4E2D") : null, s.st === "insert" ? /*#__PURE__*/React.createElement(Tag, {
      tone: "warn",
      dot: true
    }, "\u63D2\u53D9\u4E8B\u4EF6") : null, s.st === "wait" ? /*#__PURE__*/React.createElement(Tag, {
      tone: "quiet"
    }, "\u672A\u5F00\u59CB") : null), /*#__PURE__*/React.createElement("span", {
      className: "tiny muted-3 mono nowrap"
    }, s.t)), /*#__PURE__*/React.createElement("div", {
      className: "row",
      style: {
        marginTop: 5,
        gap: 10,
        flexWrap: "wrap"
      }
    }, /*#__PURE__*/React.createElement("span", {
      className: "tiny muted-3"
    }, /*#__PURE__*/React.createElement(Icon, {
      n: "user",
      s: 11
    }), " ", s.who), /*#__PURE__*/React.createElement("span", {
      className: "tiny muted-3"
    }, /*#__PURE__*/React.createElement(Icon, {
      n: "arrowRight",
      s: 11
    }), " ", s.out)), s.note ? /*#__PURE__*/React.createElement("div", {
      className: "small muted pretty",
      style: {
        marginTop: 6,
        paddingLeft: 10,
        borderLeft: "2px solid var(--line-strong)"
      }
    }, s.note) : null)))))), /*#__PURE__*/React.createElement("div", {
      className: "col",
      style: {
        gap: 14
      }
    }, /*#__PURE__*/React.createElement(Panel, {
      title: "\u89C4\u683C\u4E0E\u53E3\u5F84",
      flush: true
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        padding: 14
      }
    }, /*#__PURE__*/React.createElement(DL, {
      rows: [["规格模板", t.spec], ["采集模式", t.mode], ["本体", t.embodiment], ["场景", t.scene], ["命名规范", "SPEC-NAMING-v3"], ["密级", "内部 · 客户可见"], ["合规", "人像与工牌脱敏已开启"], ["抽检比例", "按风险等级 10% / 30% / 100%"]]
    }))), /*#__PURE__*/React.createElement(Panel, {
      title: "\u6279\u6B21",
      sub: "共 " + t.batches + " 个",
      flush: true
    }, /*#__PURE__*/React.createElement("table", {
      className: "table dense"
    }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "\u6279\u6B21"), /*#__PURE__*/React.createElement("th", {
      className: "num"
    }, "\u6761\u6570"), /*#__PURE__*/React.createElement("th", {
      className: "num"
    }, "\u901A\u8FC7\u7387"), /*#__PURE__*/React.createElement("th", null, "\u72B6\u6001"))), /*#__PURE__*/React.createElement("tbody", null, ["BAT-2409-0111", "BAT-2409-0112", "BAT-2409-0113", "BAT-2409-0114", "BAT-2409-0115", "BAT-2409-0116"].slice(0, 6).map((b, i) => /*#__PURE__*/React.createElement("tr", {
      key: b,
      className: "clickable",
      onClick: () => set({
        page: "upload"
      })
    }, /*#__PURE__*/React.createElement("td", {
      className: "mono"
    }, b), /*#__PURE__*/React.createElement("td", {
      className: "num"
    }, 180 + i * 12), /*#__PURE__*/React.createElement("td", {
      className: "num",
      style: {
        color: i === 5 ? "var(--warn)" : ""
      }
    }, (92 - i * 1.4).toFixed(1), "%"), /*#__PURE__*/React.createElement("td", null, i === 5 ? /*#__PURE__*/React.createElement(Tag, {
      tone: "warn",
      dot: true
    }, "\u6821\u9A8C\u4E2D") : /*#__PURE__*/React.createElement(Tag, {
      tone: "ok",
      dot: true
    }, "\u5DF2\u5165\u5E93"))))))), /*#__PURE__*/React.createElement(Panel, {
      title: "\u5371\u9669\u533A",
      sub: "\u5220\u9664\u3001\u64A4\u56DE\u7C7B\u64CD\u4F5C\u7EDF\u4E00\u7F6E\u4E8E\u72EC\u7ACB\u533A",
      className: "dangerzone",
      flush: true
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        padding: 14,
        display: "flex",
        flexDirection: "column",
        gap: 8
      }
    }, /*#__PURE__*/React.createElement(Btn, {
      tone: "danger",
      icon: "x",
      block: true,
      onClick: () => toast.push({
        tone: "warn",
        title: "撤回需二次确认",
        desc: "撤回将影响采集端已下发但未完成的片段，需先选择处理方式。"
      })
    }, "\u64A4\u56DE\u5DF2\u4E0B\u53D1\u4EFB\u52A1"), /*#__PURE__*/React.createElement(Btn, {
      tone: "danger",
      icon: "trash",
      block: true,
      onClick: () => toast.push({
        tone: "warn",
        title: "已拦截",
        desc: "任务下已有入库数据，删除前需先走影响面分析。"
      })
    }, "\u5220\u9664\u4EFB\u52A1")))))));
  }

  /* ============================================================
     上传与自动校验（源：7.3）
     ============================================================ */
  function UploadCenter({
    app,
    set
  }) {
    const toast = window.UI.useToast();
    const [sel, setSel] = useState(D.UPLOAD_ROWS[2].id);
    const [compare, setCompare] = useState(false);
    const row = D.UPLOAD_ROWS.filter(r => r.id === sel)[0] || D.UPLOAD_ROWS[0];
    const toneOf = s => s === "ok" ? "ok" : s === "warn" ? "warn" : s === "danger" ? "danger" : "review";
    const labelOf = s => s === "ok" ? "通过" : s === "warn" ? "有条件通过" : s === "danger" ? "不通过" : "待裁决 / 待补校验";
    return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(PageHead, {
      crumbs: [{
        label: "生产"
      }, {
        label: "上传与校验"
      }],
      title: "\u4E0A\u4F20\u4E0E\u81EA\u52A8\u6821\u9A8C\u4E2D\u5FC3",
      desc: "\u628A\u300C\u6570\u636E\u662F\u5426\u5408\u683C\u300D\u7684\u5224\u65AD\u524D\u79FB\u5230\u4E0A\u4F20\u73AF\u8282\uFF0C\u8BA9\u4E0D\u5408\u683C\u6570\u636E\u6839\u672C\u4E0D\u8FDB\u5165\u751F\u4EA7\u961F\u5217\u3002\u4E09\u6001\u7ED3\u8BBA\u800C\u975E\u4E24\u6001\uFF0C\u6BCF\u6761\u4E0D\u901A\u8FC7\u90FD\u5FC5\u987B\u80FD\u4E00\u8DF3\u5B9A\u4F4D\u5230\u5177\u4F53\u5E27\u6216\u5177\u4F53\u5B57\u6BB5\u3002",
      meta: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Tag, {
        tone: "ok",
        dot: true
      }, "\u901A\u8FC7 412"), /*#__PURE__*/React.createElement(Tag, {
        tone: "warn",
        dot: true
      }, "\u6709\u6761\u4EF6\u901A\u8FC7 7"), /*#__PURE__*/React.createElement(Tag, {
        tone: "danger",
        dot: true
      }, "\u4E0D\u901A\u8FC7 3"), /*#__PURE__*/React.createElement(Tag, {
        tone: "review",
        dot: true
      }, "\u5F85\u88C1\u51B3 2"), /*#__PURE__*/React.createElement(Tag, {
        tone: "quiet",
        icon: "link"
      }, "\u63A5\u5165\u5951\u7EA6\u5DF2\u7ED1\u5B9A"), /*#__PURE__*/React.createElement(Tag, {
        tone: "quiet",
        icon: "clock"
      }, "\u6821\u9A8C\u961F\u5217 0 \xB7 \u5E73\u5747\u8017\u65F6 34 \u79D2")),
      actions: /*#__PURE__*/React.createElement(Btn, {
        icon: "upload",
        tone: "primary",
        onClick: () => toast.push({
          tone: "info",
          title: "已加入上传队列",
          desc: "分片上传已开始，支持断点续传与内容指纹秒传。"
        })
      }, "\u4E0A\u4F20\u6570\u636E")
    }), /*#__PURE__*/React.createElement("div", {
      className: "pagebody flush"
    }, /*#__PURE__*/React.createElement("div", {
      className: "wb wb-2",
      style: {
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
    }, "\u4E0A\u4F20\u961F\u5217"), /*#__PURE__*/React.createElement(Tag, {
      tone: "quiet"
    }, "\u6279\u6B21 BAT-2409-0116"), /*#__PURE__*/React.createElement("span", {
      className: "grow"
    }), /*#__PURE__*/React.createElement(Btn, {
      size: "sm",
      tone: "ghost",
      icon: "filter"
    }, "\u7B5B\u9009")), /*#__PURE__*/React.createElement("div", {
      className: "wb-body"
    }, /*#__PURE__*/React.createElement("table", {
      className: "table dense"
    }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "\u6570\u636E\u5355\u5143"), /*#__PURE__*/React.createElement("th", {
      className: "num"
    }, "\u4F53\u79EF"), /*#__PURE__*/React.createElement("th", {
      className: "num"
    }, "\u65F6\u957F"), /*#__PURE__*/React.createElement("th", null, "\u7ED3\u8BBA"))), /*#__PURE__*/React.createElement("tbody", null, D.UPLOAD_ROWS.map(r => /*#__PURE__*/React.createElement("tr", {
      key: r.id,
      className: cls("clickable", r.id === sel && "selected"),
      onClick: () => setSel(r.id)
    }, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("div", {
      className: "mono"
    }, r.id), /*#__PURE__*/React.createElement("div", {
      className: "tiny muted-3"
    }, r.task)), /*#__PURE__*/React.createElement("td", {
      className: "num"
    }, r.size), /*#__PURE__*/React.createElement("td", {
      className: "num"
    }, r.dur), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement(Tag, {
      tone: toneOf(r.state),
      dot: true
    }, r.step)))))), /*#__PURE__*/React.createElement("div", {
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
    }), /*#__PURE__*/React.createElement("span", null, "\u6821\u9A8C\u670D\u52A1\u672C\u8EAB\u5931\u8D25\u65F6\uFF0C\u6761\u76EE\u6807\u8BB0\u4E3A\u300C\u5F85\u8865\u6821\u9A8C\u300D\u800C\u975E\u300C\u4E0D\u901A\u8FC7\u300D\uFF0C\u670D\u52A1\u6062\u590D\u540E\u81EA\u52A8\u91CD\u8DD1\uFF0C\u4E0D\u8BEF\u4F24\u6570\u636E\u3002"))))), /*#__PURE__*/React.createElement("div", {
      className: "wb-col scrollable"
    }, /*#__PURE__*/React.createElement("div", {
      className: "wb-head"
    }, /*#__PURE__*/React.createElement("span", {
      className: "mono small"
    }, row.id), /*#__PURE__*/React.createElement(Tag, {
      tone: toneOf(row.state),
      dot: true
    }, labelOf(row.state)), /*#__PURE__*/React.createElement("span", {
      className: "grow"
    }), /*#__PURE__*/React.createElement(Btn, {
      size: "sm",
      tone: "ghost",
      icon: "external",
      onClick: () => set({
        page: "browser",
        payload: {
          id: row.id
        }
      })
    }, "\u6253\u5F00\u6570\u636E\u6D4F\u89C8\u5668")), /*#__PURE__*/React.createElement("div", {
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
        marginBottom: 8
      }
    }, /*#__PURE__*/React.createElement("span", {
      className: "field-label",
      style: {
        margin: 0
      }
    }, "\u6821\u9A8C\u6D41\u6C34\u7EBF\uFF08\u6E90\uFF1AD3.1\uFF09"), /*#__PURE__*/React.createElement("span", {
      className: "row tiny muted-3",
      style: {
        gap: 5
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      n: "cpu",
      s: 11
    }), " \u6821\u9A8C\u5F15\u64CE QC-ENGINE v3.4 \xB7 \u89C4\u5219\u96C6 QC-RULES-v3 \xB7 \u5951\u7EA6 CONTRACT-v1")), /*#__PURE__*/React.createElement("div", {
      className: "row",
      style: {
        gap: 4,
        flexWrap: "wrap"
      }
    }, ["解封装", "时间对齐", "Schema", "命名", "去重", "抽帧", "脱敏", "一致性"].map((s, i) => /*#__PURE__*/React.createElement("div", {
      key: s,
      className: "row-tight",
      style: {
        gap: 4
      }
    }, /*#__PURE__*/React.createElement(Tag, {
      tone: row.state === "danger" && i >= 4 ? "danger" : row.state === "review" && i >= 4 ? "review" : "ok",
      icon: row.state === "danger" && i === 4 ? "x" : "check"
    }, s), i < 7 ? /*#__PURE__*/React.createElement(Icon, {
      n: "chevRight",
      s: 10,
      style: {
        color: "var(--text-4)"
      }
    }) : null)))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      className: "spread",
      style: {
        marginBottom: 8
      }
    }, /*#__PURE__*/React.createElement("span", {
      className: "field-label",
      style: {
        margin: 0
      }
    }, "\u5951\u7EA6\u7EA7\u6821\u9A8C"), /*#__PURE__*/React.createElement("span", {
      className: "row tiny muted-3",
      style: {
        gap: 5
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      n: "link",
      s: 11
    }), " \u4F9D\u300C\u63A5\u5165\u5951\u7EA6\u300D\u9010\u6761\u5224\u5B9A \xB7 \u5165\u5E93\u5373\u62D2")), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 6
      }
    }, [["消息类型带 header，时间域取创建时刻", true, "契约 §ROS2 主题契约"], ["必填字段齐备且类型匹配（position / data / K）", true, "契约 §字段抽取"], ["边界值校验：载荷无 NaN / Inf", row.state !== "danger", "契约 §边界校验"], ["跨流对齐偏差 ≤ 1 帧（依 header.stamp）", row.state === "ok", "契约 §时间对齐"]].map(c => /*#__PURE__*/React.createElement("div", {
      key: c[0],
      className: "spread",
      style: {
        padding: "8px 10px",
        border: "1px solid var(--line)",
        borderRadius: 4,
        background: c[1] ? "transparent" : "var(--warn-dim)"
      }
    }, /*#__PURE__*/React.createElement("span", {
      className: "row",
      style: {
        gap: 8
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      n: c[1] ? "check" : "warn",
      s: 13,
      style: {
        color: c[1] ? "var(--ok)" : "var(--warn)"
      }
    }), /*#__PURE__*/React.createElement("span", {
      className: "small",
      style: {
        color: c[1] ? "var(--text-2)" : "var(--warn)"
      }
    }, c[0])), /*#__PURE__*/React.createElement("span", {
      className: "tiny muted-3 nowrap"
    }, c[2])))), /*#__PURE__*/React.createElement("div", {
      className: "tiny muted-3",
      style: {
        marginTop: 8,
        lineHeight: 1.65
      }
    }, "\u5951\u7EA6\u6821\u9A8C\u6392\u5728\u6D41\u6C34\u7EBF\u6700\u524D\uFF1A\u65E0 header \u6216\u542B NaN / Inf \u7684\u6D88\u606F\u5728\u8FD9\u91CC\u5C31\u88AB\u62D2\u7EDD\u5165\u5E93\uFF0C\u800C\u4E0D\u662F\u8D70\u5B8C\u53BB\u91CD\u3001\u62BD\u5E27\u3001\u8131\u654F\u518D\u56DE\u6EAF\u3002")), row.evidences ? /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      className: "spread",
      style: {
        marginBottom: 8
      }
    }, /*#__PURE__*/React.createElement("span", {
      className: "field-label"
    }, "\u9010\u9879\u8BC1\u636E", /*#__PURE__*/React.createElement("span", {
      className: "req"
    }, "\xB7")), /*#__PURE__*/React.createElement("span", {
      className: "tiny muted-3"
    }, "\u70B9\u51FB\u8BC1\u636E\u76F4\u63A5\u8DF3\u8F6C\u5230\u95EE\u9898\u5E27\u6216\u95EE\u9898\u5B57\u6BB5")), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 7
      }
    }, row.evidences.map((e, i) => /*#__PURE__*/React.createElement("button", {
      key: i,
      className: "panel",
      style: {
        textAlign: "left",
        cursor: "pointer",
        background: "var(--surface-1)"
      },
      onClick: () => set({
        page: "browser",
        payload: {
          id: row.id,
          t: e.t
        }
      })
    }, /*#__PURE__*/React.createElement("div", {
      className: "spread",
      style: {
        padding: "9px 11px"
      }
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      className: "row",
      style: {
        gap: 7
      }
    }, /*#__PURE__*/React.createElement("span", {
      className: "codechip"
    }, e.rule), /*#__PURE__*/React.createElement("span", {
      className: "small"
    }, e.k)), /*#__PURE__*/React.createElement("div", {
      className: "mono small",
      style: {
        marginTop: 4,
        color: "var(--danger)"
      }
    }, e.v)), /*#__PURE__*/React.createElement("span", {
      className: "row",
      style: {
        gap: 6,
        flex: "0 0 auto"
      }
    }, /*#__PURE__*/React.createElement("span", {
      className: "tiny muted-3 mono"
    }, e.jump), /*#__PURE__*/React.createElement(Icon, {
      n: "arrowRight",
      s: 13,
      style: {
        color: "var(--accent)"
      }
    }))))))) : /*#__PURE__*/React.createElement("div", {
      className: "panel-inset",
      style: {
        padding: 12
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "row",
      style: {
        gap: 8
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      n: "check",
      s: 15,
      style: {
        color: "var(--ok)"
      }
    }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      className: "small",
      style: {
        fontWeight: 600
      }
    }, row.note), /*#__PURE__*/React.createElement("div", {
      className: "tiny muted-3",
      style: {
        marginTop: 3
      }
    }, "\u65E0\u9700\u4EBA\u5DE5\u4ECB\u5165\uFF0C\u5DF2\u8FDB\u5165\u751F\u4EA7\u961F\u5217\u3002")))), row.note && row.evidences ? /*#__PURE__*/React.createElement("div", {
      className: cls("warnbox", row.state === "danger" ? "danger" : "")
    }, row.note) : null, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      className: "field-label",
      style: {
        marginBottom: 8
      }
    }, "\u4E09\u6001\u7ED3\u8BBA"), /*#__PURE__*/React.createElement("div", {
      className: "grid g-3"
    }, [["通过", "ok"], ["有条件通过", "warn"], ["不通过", "danger"]].map(([k, tone]) => /*#__PURE__*/React.createElement("div", {
      key: k,
      className: "panel-inset",
      style: {
        padding: 10,
        borderLeft: "3px solid var(--" + tone + ")"
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "small",
      style: {
        fontWeight: 600,
        color: "var(--" + tone + ")"
      }
    }, k), /*#__PURE__*/React.createElement("div", {
      className: "tiny muted-3",
      style: {
        marginTop: 4,
        lineHeight: 1.6
      }
    }, k === "通过" ? "全部规则命中合格，直接入库" : k === "有条件通过" ? "可忽略但需留痕，例如轻微过曝" : "任一阻断或驳回级规则命中"))))), /*#__PURE__*/React.createElement(Panel, {
      title: "\u6D3E\u751F\u52A8",
      sub: "\u7531\u7ED3\u8BBA\u51B3\u5B9A\u4E0B\u4E00\u6B65",
      flush: true
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        padding: 12,
        display: "flex",
        flexDirection: "column",
        gap: 8
      }
    }, row.state === "danger" ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Btn, {
      tone: "primary",
      icon: "refresh",
      block: true,
      onClick: () => toast.push({
        tone: "warn",
        title: "重采任务已生成",
        desc: "已预填原因码 RC-FRAME-01 / RC-VIS-01、差异说明与指派对象「采集员 B」，并跳转到任务详情。"
      })
    }, "\u751F\u6210\u91CD\u91C7\u4EFB\u52A1\uFF08\u9884\u586B\u539F\u56E0\u7801\u4E0E\u6307\u6D3E\uFF09"), /*#__PURE__*/React.createElement("div", {
      className: "tiny muted-3"
    }, "\u5C06\u9884\u586B\uFF1A\u539F\u56E0\u7801 \xD72 \xB7 \u95EE\u9898\u5E27 \xD73 \xB7 \u6307\u6D3E\u5BF9\u8C61 \u91C7\u96C6\u5458 B \xB7 \u89C4\u683C EGO-KITCH-02 v1.2")) : row.dup ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Btn, {
      tone: "primary",
      icon: "copy",
      block: true,
      onClick: () => setCompare(true)
    }, "\u5E76\u6392\u5BF9\u6BD4\u540E\u88C1\u51B3"), /*#__PURE__*/React.createElement("div", {
      className: "tiny muted-3"
    }, "\u91CD\u590D\u68C0\u6D4B\u7ED9\u5E76\u6392\u5BF9\u6BD4\u800C\u975E\u81EA\u52A8\u5220\u9664\uFF1A\u76F8\u4F3C\u5EA6\u8D85\u9608\u65F6\u7531\u4EBA\u51B3\u5B9A\uFF0C\u56E0\u4E3A\u770B\u8D77\u6765\u50CF\u4E0D\u7B49\u4E8E\u662F\u540C\u4E00\u6761\u3002")) : row.state === "warn" ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Btn, {
      tone: "primary",
      icon: "check",
      block: true,
      onClick: () => toast.push({
        tone: "ok",
        title: "已按有条件通过放行",
        desc: "已记录留痕：QC-LIGHT-01，轻微过曝 6.1%。该留痕将进入质量报告的「已知限制」。",
        action: {
          label: "撤销",
          fn: () => toast.push({
            tone: "info",
            title: "已撤销放行",
            desc: ""
          })
        }
      })
    }, "\u6309\u6709\u6761\u4EF6\u901A\u8FC7\u653E\u884C\u5E76\u7559\u75D5"), /*#__PURE__*/React.createElement("div", {
      className: "tiny muted-3"
    }, "\u7559\u75D5\u5730\u70B9\uFF1ACLP \u5143\u6570\u636E + \u8D28\u91CF\u62A5\u544A\u300C\u5DF2\u77E5\u9650\u5236\u300D\u7AE0\u8282\u3002")) : row.step === "旁路通道" ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Btn, {
      tone: "primary",
      icon: "external",
      block: true,
      onClick: () => toast.push({
        tone: "info",
        title: "已生成直传凭据",
        desc: "对象存储直传 URL 有效期 24 小时，上传完成后自动回到本队列继续校验。"
      })
    }, "\u8D70\u5BF9\u8C61\u5B58\u50A8\u76F4\u4F20"), /*#__PURE__*/React.createElement("div", {
      className: "tiny muted-3"
    }, "\u8D85\u8FC7\u6D4F\u89C8\u5668\u4E0A\u4F20\u9608\u503C\u7684\u6570\u636E\u4E0D\u786C\u4F20\uFF0C\u907F\u514D\u7528\u6237\u5361\u5728\u4E00\u4E2A\u505A\u4E0D\u5230\u7684\u64CD\u4F5C\u4E0A\u3002")) : /*#__PURE__*/React.createElement("div", {
      className: "tiny muted-3"
    }, "\u672C\u6761\u76EE\u65E0\u9700\u4EBA\u5DE5\u4ECB\u5165\u3002")))))))), compare ? /*#__PURE__*/React.createElement(Modal, {
      title: "\u7591\u4F3C\u91CD\u590D \xB7 \u5E76\u6392\u5BF9\u6BD4\u88C1\u51B3",
      desc: "\u76F8\u4F3C\u5EA6 0.972\uFF0C\u8D85\u8FC7\u9608\u503C 0.95\u3002\u7CFB\u7EDF\u4E0D\u81EA\u52A8\u5220\u9664\uFF0C\u7531\u4EBA\u51B3\u5B9A\u3002",
      onClose: () => setCompare(false),
      width: 760,
      foot: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Btn, {
        tone: "ghost",
        onClick: () => setCompare(false)
      }, "\u6682\u4E0D\u5904\u7406"), /*#__PURE__*/React.createElement("span", {
        className: "grow"
      }), /*#__PURE__*/React.createElement(Btn, {
        tone: "danger",
        onClick: () => {
          setCompare(false);
          toast.push({
            tone: "warn",
            title: "已丢弃为新条目",
            desc: "CLP-88415 已标记丢弃，保留 30 天可撤回。"
          });
        }
      }, "\u4E22\u5F03\u65B0\u6761\u76EE"), /*#__PURE__*/React.createElement(Btn, {
        tone: "primary",
        onClick: () => {
          setCompare(false);
          toast.push({
            tone: "ok",
            title: "已保留两条",
            desc: "CLP-88415 已保留并入库；确认为真实重复时可后续批量去重。"
          });
        }
      }, "\u4E24\u6761\u90FD\u4FDD\u7559"))
    }, /*#__PURE__*/React.createElement("div", {
      className: "grid g-2",
      style: {
        gap: 12
      }
    }, [["CLP-88415（新）", 0.62], ["CLP-87120（库内）", 0.58]].map(([n, t], i) => /*#__PURE__*/React.createElement("div", {
      key: i
    }, /*#__PURE__*/React.createElement("div", {
      className: "spread",
      style: {
        marginBottom: 6
      }
    }, /*#__PURE__*/React.createElement("span", {
      className: "mono small"
    }, n), /*#__PURE__*/React.createElement(Tag, {
      tone: i ? "quiet" : "warn"
    }, i ? "库内已有" : "本次上传")), /*#__PURE__*/React.createElement("div", {
      className: "player",
      style: {
        height: 180
      }
    }, /*#__PURE__*/React.createElement(SceneFrame, {
      view: "exo",
      t: t
    })), /*#__PURE__*/React.createElement(DL, {
      rows: [["场景", "厨房 / 台面 K2"], ["时长", i ? "06:14" : "06:12"], ["采集员", i ? "采集员 A" : "采集员 A"], ["采集时间", i ? "09-08 15:22" : "09-11 14:02"], ["内容指纹", i ? "sha256:8c1d…" : "sha256:b2f7…"]]
    })))), /*#__PURE__*/React.createElement("div", {
      className: "warnbox info"
    }, "\u5DEE\u5F02\u70B9\uFF1A\u52A8\u4F5C\u6BB5\u8FB9\u754C\u76F8\u5DEE 2 \u5E27\uFF0801:12.4 vs 01:14.1\uFF09\uFF0C\u5176\u4F59\u5143\u6570\u636E\u4E00\u81F4\u3002\u4E24\u6761\u5BF9\u5E94\u540C\u4E00\u573A\u666F\u7684\u540C\u4E00\u6B21\u64CD\u4F5C\uFF0C\u4F46\u662F\u4E24\u6B21\u72EC\u7ACB\u5F55\u5236\u3002")) : null);
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
    D.SEARCH_FACETS.forEach(g => {
      c[g.key] = [];
    });
    D.SEARCH_FACETS.forEach(g => {
      if (g.key === "view") return; // 视角另按词边界处理，避免 "ego / exo" 误命中
      g.vals.forEach(o => {
        if ((o.syn || []).some(s => t.indexOf(String(s).toLowerCase()) >= 0)) c[g.key].push(o.v);
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
    D.SEARCH_FACETS.forEach(g => {
      out[g.key] = manual.hasOwnProperty(g.key) ? manual[g.key] : parsed[g.key] || [];
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
    return D.SEARCH_FACETS.some(g => (c[g.key] || []).length) || c.minScore != null || c.dur != null;
  }
  function filterHits(list, c, text) {
    if (!condsActive(c)) {
      // 无结构化条件：退化为关键词包含匹配（任一命中），不把自然语言整句当精确条件
      const toks = String(text || "").toLowerCase().split(/[\s,，、。;；:：/]+/).map(s => s.trim()).filter(s => s.length >= 2 && SEARCH_STOP.indexOf(s) < 0);
      if (!toks.length) return list.slice();
      return list.filter(h => {
        const hs = hitText(h);
        return toks.some(tk => hs.indexOf(tk) >= 0);
      });
    }
    return list.filter(h => {
      if (c.scene.length && c.scene.indexOf(h.scene) < 0) return false;
      if (c.skill.length && c.skill.indexOf(h.skill) < 0) return false;
      if (c.embody.length && c.embody.indexOf(h.embody) < 0) return false;
      if (c.view.length && c.view.indexOf(h.emb) < 0) return false;
      if (c.quality.length && c.quality.indexOf(h.q) < 0) return false;
      if (c.result.length && !c.result.some(r => (h.tags || []).indexOf(r) >= 0)) return false;
      if (c.minScore != null && h.score < c.minScore) return false;
      if (c.dur) {
        const s = mmss(h.dur);
        if (s < c.dur[0] || s > c.dur[1]) return false;
      }
      return true;
    });
  }
  function minLabel(sec) {
    // 秒 → 分钟展示（去掉多余小数）
    return String(Math.round(sec / 60 * 100) / 100);
  }
  function chipList(c) {
    const out = [];
    D.SEARCH_FACETS.forEach(g => (c[g.key] || []).forEach(v => out.push({
      key: g.key,
      group: g.k,
      value: v
    })));
    if (c.minScore != null) out.push({
      key: "minScore",
      group: "质量分",
      value: "≥ " + c.minScore
    });
    if (c.dur) out.push({
      key: "dur",
      group: "时长",
      value: minLabel(c.dur[0]) + "–" + minLabel(c.dur[1]) + " 分钟"
    });
    return out;
  }
  function SearchPage({
    app,
    set
  }) {
    const toast = window.UI.useToast();
    // 顶栏检索把问题带进来，检索页必须承接，否则「在顶栏搜完还要在页内再输一遍」
    const [q, setQ] = useState(app.payload && app.payload.q || "厨房场景里叠衣服失败的那几条，只要质量分 70 以上、时长 5 分钟到 8 分钟");
    // manual = 手工结构化条件；未触碰的组由 query 解析结果接管，两者合并成最终条件
    const [manual, setManual] = useState({});
    // 选择篮必须与顶栏常驻计数同源，否则「跨页累积」名不副实
    const basket = app.basket || [];
    const setBasket = v => set({
      basket: typeof v === "function" ? v(basket) : v
    });
    const [slow, setSlow] = useState(false);
    const parsed = useMemo(() => parseSearch(q), [q]);
    const conds = useMemo(() => mergeConds(parsed, manual), [parsed, manual]);
    const hits = useMemo(() => filterHits(D.SEARCH_HITS, conds, q).slice().sort((a, b) => b.score - a.score), [conds, q]);
    const chips = useMemo(() => chipList(conds), [conds]);
    const inBasket = id => basket.indexOf(id) >= 0;
    const toggleFacet = (key, v) => setManual(m => {
      const cur = (m.hasOwnProperty(key) ? m[key] : parsed[key] || []).slice();
      const i = cur.indexOf(v);
      if (i >= 0) cur.splice(i, 1);else cur.push(v);
      return Object.assign({}, m, {
        [key]: cur
      });
    });
    const removeChip = c => {
      if (c.key === "minScore") setManual(m => Object.assign({}, m, {
        minScore: null
      }));else if (c.key === "dur") setManual(m => Object.assign({}, m, {
        dur: null
      }));else toggleFacet(c.key, c.value);
    };
    const resetAll = () => {
      setManual({});
      setQ("");
    };
    // 时长区间编辑器：界面以「分钟」输入，写入前显式换算为秒（1 分钟 = 60 秒）
    const setDurMin = (idx, val) => setManual(m => {
      const cur = ((m.hasOwnProperty("dur") ? m.dur : parsed.dur) || [300, 480]).slice();
      const next = cur.slice();
      next[idx] = Math.round(Math.max(0, Math.min(120, parseFloat(val) || 0)) * 60);
      return Object.assign({}, m, {
        dur: next
      });
    });
    useEffect(() => {
      if (app.payload && app.payload.q) {
        setQ(app.payload.q);
        setManual({});
      }
    }, [app.payload]);
    useEffect(() => {
      const h = e => {
        if (e.key === "Escape") setBasket([]);
      };
      window.addEventListener("keydown", h);
      return () => window.removeEventListener("keydown", h);
    }, []);

    // 合计时长按命中的真实时长求和，不再用「条数 × 常数」估算
    const totalHours = (hits.reduce((s, h) => s + mmss(h.dur), 0) / 3600).toFixed(2);
    const totalMin = Math.round(hits.reduce((s, h) => s + mmss(h.dur), 0) / 60);
    return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(PageHead, {
      crumbs: [{
        label: "生产"
      }, {
        label: "检索与取数"
      }],
      title: "\u8BED\u4E49\u68C0\u7D22\u4E0E\u53D6\u6570",
      desc: "\u8BA9\u300C\u627E\u6570\u636E\u300D\u4ECE\u7FFB\u76EE\u5F55\u53D8\u6210\u63D0\u95EE\u3002\u7B5B\u9009\u9762\u677F\u4E0E\u914D\u65B9\u6761\u4EF6\u540C\u6784\uFF0C\u68C0\u7D22\u7ED3\u679C\u53EF\u65E0\u7F1D\u8F6C\u4E3A\u914D\u65B9\u3002",
      meta: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Tag, {
        tone: "ok",
        icon: "zap"
      }, "\u7ED3\u679C\u8017\u65F6 1.4 \u79D2\uFF08\u76EE\u6807\uFF1A\u79D2\u7EA7\uFF09"), app.payload && app.payload.q ? /*#__PURE__*/React.createElement(Tag, {
        tone: "accent",
        icon: "search"
      }, "\u6765\u81EA\u9876\u680F\u68C0\u7D22 \xB7 \u95EE\u9898\u5DF2\u5E26\u5165") : null, /*#__PURE__*/React.createElement(Tag, {
        tone: "quiet"
      }, "\u547D\u4E2D ", hits.length, " \u6761 \xB7 \u5408\u8BA1 ", totalHours, " \u5C0F\u65F6"), basket.length ? /*#__PURE__*/React.createElement(Tag, {
        tone: "accent",
        icon: "basket"
      }, "\u9009\u62E9\u7BEE\u5DF2\u7D2F\u79EF ", basket.length, " \u6761") : null),
      actions: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Btn, {
        icon: "bookmark",
        tone: "ghost",
        onClick: () => toast.push({
          tone: "ok",
          title: "检索视图已保存",
          desc: (chips.length ? chips.map(c => c.group + " " + c.value).join(" · ") : "当前关键词") + " 已存为个人视图，可复用为配方条件。"
        })
      }, "\u4FDD\u5B58\u68C0\u7D22\u89C6\u56FE"), /*#__PURE__*/React.createElement(Btn, {
        icon: "basket",
        tone: "primary",
        disabled: !basket.length,
        onClick: () => set({
          page: "recipe",
          payload: {
            fromBasket: true,
            ids: basket
          }
        })
      }, "\u7528\u6240\u9009\u5EFA\u96C6\uFF08", basket.length, "\uFF09"))
    }), /*#__PURE__*/React.createElement("div", {
      className: "pagebody flush"
    }, /*#__PURE__*/React.createElement("div", {
      className: "wb",
      style: {
        gridTemplateColumns: "264px minmax(0,1fr)",
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
    }, "\u7B5B\u9009\u6761\u4EF6"), /*#__PURE__*/React.createElement("span", {
      className: "tiny muted-3"
    }, "\u5DF2\u9009 ", chips.length), /*#__PURE__*/React.createElement("span", {
      className: "grow"
    }), /*#__PURE__*/React.createElement(Btn, {
      size: "sm",
      tone: "ghost",
      onClick: resetAll
    }, "\u6E05\u7A7A")), /*#__PURE__*/React.createElement("div", {
      className: "wb-body"
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        padding: 12,
        display: "flex",
        flexDirection: "column",
        gap: 12
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "warnbox info",
      style: {
        fontSize: 11,
        lineHeight: 1.65
      }
    }, "\u7B5B\u9009\u9762\u677F\u4E0E\u914D\u65B9\u6761\u4EF6\u540C\u6784\uFF1A\u540C\u4E00\u5957\u6761\u4EF6\u7EC4\u4EF6\u5728\u68C0\u7D22\u4E0E\u5EFA\u96C6\u4E24\u5904\u590D\u7528\u3002\u6B64\u5904\u52FE\u9009\u4E0E\u4E0A\u65B9\u81EA\u7136\u8BED\u8A00\u89E3\u6790\u7ED3\u679C\u5408\u5E76\u751F\u6548\u3002"), D.SEARCH_FACETS.map(g => {
      const sel = conds[g.key] || [];
      return /*#__PURE__*/React.createElement("div", {
        key: g.key
      }, /*#__PURE__*/React.createElement("div", {
        className: "spread",
        style: {
          marginBottom: 6
        }
      }, /*#__PURE__*/React.createElement("span", {
        className: "field-label",
        style: {
          margin: 0
        }
      }, g.k), /*#__PURE__*/React.createElement("span", {
        className: "tiny muted-3"
      }, "\u5DF2\u9009 ", sel.length)), /*#__PURE__*/React.createElement("div", {
        style: {
          display: "flex",
          flexDirection: "column",
          gap: 3
        }
      }, g.vals.map(o => /*#__PURE__*/React.createElement("label", {
        key: o.v,
        className: "check",
        style: {
          padding: "3px 0",
          cursor: "pointer"
        }
      }, /*#__PURE__*/React.createElement("input", {
        type: "checkbox",
        checked: sel.indexOf(o.v) >= 0,
        onChange: () => toggleFacet(g.key, o.v)
      }), /*#__PURE__*/React.createElement("span", {
        className: "small",
        style: {
          color: sel.indexOf(o.v) >= 0 ? "var(--text)" : "var(--text-2)"
        }
      }, o.v)))));
    }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      className: "spread",
      style: {
        marginBottom: 4
      }
    }, /*#__PURE__*/React.createElement("span", {
      className: "field-label",
      style: {
        margin: 0
      }
    }, "\u65F6\u957F\u533A\u95F4"), /*#__PURE__*/React.createElement("span", {
      className: "tiny muted-3"
    }, conds.dur ? minLabel(conds.dur[0]) + "–" + minLabel(conds.dur[1]) + " 分钟" : "不限")), /*#__PURE__*/React.createElement("div", {
      className: "row",
      style: {
        gap: 6
      }
    }, /*#__PURE__*/React.createElement("input", {
      className: "input mono",
      value: conds.dur ? minLabel(conds.dur[0]) : "",
      placeholder: "0",
      onChange: e => setDurMin(0, e.target.value)
    }), /*#__PURE__*/React.createElement("span", {
      className: "muted-3"
    }, "\u2013"), /*#__PURE__*/React.createElement("input", {
      className: "input mono",
      value: conds.dur ? minLabel(conds.dur[1]) : "",
      placeholder: "\u4E0D\u9650",
      onChange: e => setDurMin(1, e.target.value)
    }), /*#__PURE__*/React.createElement("span", {
      className: "tiny muted-3"
    }, "\u5206\u949F")), conds.dur ? /*#__PURE__*/React.createElement("button", {
      className: "btn btn-sm",
      style: {
        marginTop: 6
      },
      onClick: () => setManual(m => Object.assign({}, m, {
        dur: null
      }))
    }, "\u6E05\u9664\u533A\u95F4") : null), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      className: "spread",
      style: {
        marginBottom: 4
      }
    }, /*#__PURE__*/React.createElement("span", {
      className: "field-label",
      style: {
        margin: 0
      }
    }, "\u8D28\u91CF\u5206\u4E0B\u9650"), /*#__PURE__*/React.createElement("span", {
      className: "tiny muted-3"
    }, conds.minScore == null ? "不限" : "≥ " + conds.minScore)), /*#__PURE__*/React.createElement("input", {
      type: "range",
      min: "0",
      max: "100",
      value: conds.minScore == null ? 0 : conds.minScore,
      onChange: e => setManual(m => Object.assign({}, m, {
        minScore: parseInt(e.target.value, 10)
      })),
      style: {
        width: "100%",
        accentColor: "var(--accent)",
        marginTop: 4
      }
    }), /*#__PURE__*/React.createElement("div", {
      className: "spread tiny muted-3"
    }, /*#__PURE__*/React.createElement("span", null, "0"), /*#__PURE__*/React.createElement("span", null, "100")))))), /*#__PURE__*/React.createElement("div", {
      className: "wb-col",
      style: {
        borderRight: 0
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "wb-head",
      style: {
        gap: 10
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "gsearch",
      style: {
        flex: "1 1 auto",
        maxWidth: 620,
        height: 30
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      n: "search",
      s: 14
    }), /*#__PURE__*/React.createElement("input", {
      value: q,
      placeholder: "\u7528\u81EA\u7136\u8BED\u8A00\u63CF\u8FF0\u4F60\u8981\u54EA\u4E00\u6279\u6570\u636E",
      onChange: e => {
        setQ(e.target.value);
        setManual({});
      }
    })), /*#__PURE__*/React.createElement(Btn, {
      size: "sm",
      tone: "ghost",
      icon: "sort"
    }, "\u6309\u8D28\u91CF\u5206"), /*#__PURE__*/React.createElement(Btn, {
      size: "sm",
      tone: "ghost",
      icon: "grid"
    }, "\u7F51\u683C"), /*#__PURE__*/React.createElement("span", {
      className: "grow"
    }), /*#__PURE__*/React.createElement(Btn, {
      size: "sm",
      tone: "ghost",
      icon: "clock",
      onClick: () => setSlow(true)
    }, "\u6A21\u62DF\u6162\u67E5\u8BE2")), chips.length ? /*#__PURE__*/React.createElement("div", {
      style: {
        padding: "10px 14px",
        borderBottom: "1px solid var(--line-soft)",
        background: "var(--surface-1)"
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "row",
      style: {
        gap: 8,
        flexWrap: "wrap"
      }
    }, /*#__PURE__*/React.createElement("span", {
      className: "row",
      style: {
        gap: 5,
        color: "var(--accent)"
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      n: "cpu",
      s: 13
    }), /*#__PURE__*/React.createElement("span", {
      className: "tiny"
    }, "\u68C0\u7D22\u6761\u4EF6")), chips.map((c, i) => /*#__PURE__*/React.createElement("button", {
      key: c.key + i,
      className: "tag t-accent",
      title: "\u70B9\u51FB\u79FB\u9664\u8BE5\u6761\u4EF6",
      style: {
        cursor: "pointer"
      },
      onClick: () => removeChip(c)
    }, c.group, " ", /*#__PURE__*/React.createElement("b", {
      style: {
        fontWeight: 600
      }
    }, c.value), " ", /*#__PURE__*/React.createElement(Icon, {
      n: "x",
      s: 10
    }))), /*#__PURE__*/React.createElement("button", {
      className: "btn btn-sm",
      onClick: resetAll
    }, "\u5168\u90E8\u6E05\u9664"), /*#__PURE__*/React.createElement("span", {
      className: "grow"
    }), /*#__PURE__*/React.createElement("span", {
      className: "tiny muted-3"
    }, "\u547D\u4E2D ", /*#__PURE__*/React.createElement("b", null, hits.length), " / \u8BED\u6599 ", D.SEARCH_HITS.length, " \u6761 \xB7 \u5408\u8BA1 ", totalMin, " \u5206\u949F"))) : /*#__PURE__*/React.createElement("div", {
      style: {
        padding: "10px 14px",
        borderBottom: "1px solid var(--line-soft)",
        background: "var(--surface-1)"
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "row",
      style: {
        gap: 8,
        flexWrap: "wrap"
      }
    }, /*#__PURE__*/React.createElement("span", {
      className: "row",
      style: {
        gap: 5,
        color: "var(--text-3)"
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      n: "search",
      s: 13
    }), /*#__PURE__*/React.createElement("span", {
      className: "tiny"
    }, "\u672A\u8BC6\u522B\u5230\u7ED3\u6784\u5316\u6761\u4EF6\uFF0C\u5DF2\u6309\u5173\u952E\u8BCD\u5305\u542B\u5339\u914D")), /*#__PURE__*/React.createElement("span", {
      className: "grow"
    }), /*#__PURE__*/React.createElement("span", {
      className: "tiny muted-3"
    }, "\u547D\u4E2D ", /*#__PURE__*/React.createElement("b", null, hits.length), " / \u8BED\u6599 ", D.SEARCH_HITS.length, " \u6761 \xB7 \u5408\u8BA1 ", totalMin, " \u5206\u949F"))), /*#__PURE__*/React.createElement("div", {
      className: "wb-body",
      style: {
        padding: 14
      }
    }, slow ? /*#__PURE__*/React.createElement("div", {
      className: "panel",
      style: {
        marginBottom: 12
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "panel-body",
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 10
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "row",
      style: {
        gap: 8
      }
    }, /*#__PURE__*/React.createElement("span", {
      className: "skel",
      style: {
        width: 14,
        height: 14,
        borderRadius: "50%"
      }
    }), /*#__PURE__*/React.createElement("span", {
      className: "small"
    }, "\u6B63\u5728\u6267\u884C\uFF1A\u5411\u91CF\u7D22\u5F15\u68C0\u7D22 \u2192 \u5143\u6570\u636E\u8FC7\u6EE4 \u2192 \u8D28\u91CF\u5206\u5C42\u6821\u9A8C"), /*#__PURE__*/React.createElement("span", {
      className: "grow"
    }), /*#__PURE__*/React.createElement(Btn, {
      size: "sm",
      tone: "ghost"
    }, "\u53D6\u6D88")), /*#__PURE__*/React.createElement("div", {
      className: "bar"
    }, /*#__PURE__*/React.createElement("i", {
      style: {
        width: "62%"
      }
    })), /*#__PURE__*/React.createElement("span", {
      className: "tiny muted-3"
    }, "\u5DF2\u8017\u65F6 4.2 \u79D2\u3002\u6162\u67E5\u8BE2\u7ED9\u51FA\u9636\u6BB5\u53CD\u9988\u800C\u975E\u53EA\u8F6C\u5708\uFF1B\u8D85\u8FC7 1 \u79D2\u5FC5\u987B\u53EF\u89C1\u8FDB\u5EA6\uFF0C\u8D85\u8FC7 5 \u79D2\u7ED9\u51FA\u53EF\u53D6\u6D88\u5165\u53E3\u3001\u8D85\u8FC7 30 \u79D2\u8F6C\u5165\u901A\u77E5\u4E2D\u5FC3\u3002"))) : null, hits.length === 0 ? /*#__PURE__*/React.createElement("div", {
      className: "panel",
      style: {
        padding: 26,
        textAlign: "center"
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      n: "search",
      s: 22,
      style: {
        color: "var(--text-4)"
      }
    }), /*#__PURE__*/React.createElement("div", {
      className: "small",
      style: {
        fontWeight: 600,
        marginTop: 10
      }
    }, "\u5F53\u524D\u6761\u4EF6\u4E0B\u672A\u547D\u4E2D\u4EFB\u4F55\u6570\u636E"), /*#__PURE__*/React.createElement("div", {
      className: "tiny muted-3",
      style: {
        marginTop: 6,
        lineHeight: 1.75,
        maxWidth: 430,
        marginLeft: "auto",
        marginRight: "auto"
      }
    }, "\u8BED\u6599\u5E93\u73B0\u6709 ", D.SEARCH_HITS.length, " \u6761\u6570\u636E\u3002\u5F53\u524D\u6761\u4EF6\u8FC7\u7A84\u2014\u2014\u53EF\u653E\u5BBD\u8D28\u91CF\u5206\u4E0B\u9650\u3001\u53BB\u6389\u65F6\u957F\u533A\u95F4\uFF0C\u6216\u51CF\u5C11\u573A\u666F / \u6280\u80FD\u9650\u5B9A\u540E\u91CD\u8BD5\u3002"), /*#__PURE__*/React.createElement("div", {
      className: "row",
      style: {
        gap: 8,
        justifyContent: "center",
        marginTop: 14,
        flexWrap: "wrap"
      }
    }, /*#__PURE__*/React.createElement(Btn, {
      size: "sm",
      tone: "primary",
      onClick: resetAll
    }, "\u67E5\u770B\u5168\u90E8\u6570\u636E"), conds.minScore != null ? /*#__PURE__*/React.createElement(Btn, {
      size: "sm",
      tone: "ghost",
      onClick: () => setManual(m => Object.assign({}, m, {
        minScore: null
      }))
    }, "\u653E\u5BBD\u8D28\u91CF\u5206\u4E0B\u9650") : null, conds.dur ? /*#__PURE__*/React.createElement(Btn, {
      size: "sm",
      tone: "ghost",
      onClick: () => setManual(m => Object.assign({}, m, {
        dur: null
      }))
    }, "\u53BB\u6389\u65F6\u957F\u533A\u95F4") : null)) : /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))",
        gap: 12
      }
    }, hits.map(h => /*#__PURE__*/React.createElement("div", {
      key: h.id,
      className: "panel",
      style: {
        overflow: "hidden"
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "player",
      style: {
        height: 156,
        borderRadius: 0,
        cursor: "pointer"
      },
      onClick: () => set({
        page: "browser",
        payload: {
          id: h.id
        }
      })
    }, /*#__PURE__*/React.createElement(SceneFrame, {
      view: h.emb === "Ego" ? "ego" : "exo",
      t: h.score % 60 / 100 + 0.2,
      overlays: ["box"]
    }), /*#__PURE__*/React.createElement("span", {
      className: "vtlabel"
    }, /*#__PURE__*/React.createElement("i", {
      className: "lid",
      style: {
        background: h.q === "优质" ? "var(--ok)" : h.q === "边缘难例" ? "var(--warn)" : "var(--danger)"
      }
    }), h.q), /*#__PURE__*/React.createElement("span", {
      className: "vtbadge"
    }, h.dur)), /*#__PURE__*/React.createElement("div", {
      style: {
        padding: 11
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "spread"
    }, /*#__PURE__*/React.createElement("span", {
      className: "mono small"
    }, h.id), /*#__PURE__*/React.createElement("span", {
      className: cls("tag", h.score >= 85 ? "t-ok" : h.score >= 60 ? "t-warn" : "t-danger")
    }, h.score, " \u5206")), /*#__PURE__*/React.createElement("div", {
      className: "row",
      style: {
        gap: 8,
        marginTop: 7,
        flexWrap: "wrap"
      }
    }, /*#__PURE__*/React.createElement(Tag, {
      tone: "quiet",
      icon: "pin"
    }, h.scene), /*#__PURE__*/React.createElement(Tag, {
      tone: "quiet",
      icon: "robot"
    }, h.embody), /*#__PURE__*/React.createElement(Tag, {
      tone: "quiet"
    }, h.emb)), /*#__PURE__*/React.createElement("div", {
      className: "spread",
      style: {
        marginTop: 9
      }
    }, /*#__PURE__*/React.createElement("span", {
      className: "tiny muted-3"
    }, h.emp, " \xB7 ", h.time), /*#__PURE__*/React.createElement(Btn, {
      size: "sm",
      tone: inBasket(h.id) ? "ghost" : "primary",
      icon: inBasket(h.id) ? "check" : "plus",
      onClick: () => {
        setBasket(inBasket(h.id) ? basket.filter(x => x !== h.id) : basket.concat([h.id]));
        if (!inBasket(h.id)) toast.push({
          tone: "ok",
          title: "已加入选择篮",
          desc: "选择篮跨页、跨查询累积，顶栏常驻显示计数。"
        });
      }
    }, inBasket(h.id) ? "已选" : "加入选择篮"))))))), /*#__PURE__*/React.createElement("div", {
      className: "keybar",
      style: {
        borderTop: "1px solid var(--line)"
      }
    }, /*#__PURE__*/React.createElement("span", {
      className: "row",
      style: {
        gap: 6
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      n: "basket",
      s: 12
    }), " \u9009\u62E9\u7BEE ", /*#__PURE__*/React.createElement("b", null, basket.length), " \u6761"), /*#__PURE__*/React.createElement("span", {
      className: "muted-3"
    }, "\xB7"), /*#__PURE__*/React.createElement("span", null, basket.slice(0, 4).join(" · "), basket.length > 4 ? " 等 " + basket.length + " 条" : ""), /*#__PURE__*/React.createElement("span", {
      className: "grow"
    }), /*#__PURE__*/React.createElement(Btn, {
      size: "sm",
      tone: "ghost",
      onClick: () => setBasket([]),
      disabled: !basket.length
    }, "\u6E05\u7A7A"), /*#__PURE__*/React.createElement(Btn, {
      size: "sm",
      tone: "primary",
      disabled: !basket.length,
      onClick: () => set({
        page: "recipe",
        payload: {
          fromBasket: true,
          ids: basket
        }
      })
    }, "\u7528\u6240\u9009\u5EFA\u96C6"))))));
  }

  /* ============================================================
     数据浏览器（源：8.5）
     ============================================================ */
  function DataBrowser({
    app,
    set
  }) {
    const toast = window.UI.useToast();
    const [t, setT] = useTicker(372, false);
    const [playing, setPlaying] = useState(true);
    const [views, setViews] = useState(4);
    const [main, setMain] = useState("exo");
    const [ov, setOv] = useState(["box", "hand"]);
    useEffect(() => {
      if (app.payload && app.payload.t != null) setT(app.payload.t);
    }, [app.payload]);
    const clip = app.payload && app.payload.id || "CLP-88414";
    return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(PageHead, {
      crumbs: [{
        label: "生产",
        to: () => set({
          page: "search"
        })
      }, {
        label: "数据浏览器"
      }],
      title: "数据浏览器 · " + clip,
      desc: "\u591A\u8DEF\u540C\u6B65\u753B\u9762\u3001\u65F6\u95F4\u8F74\u4E0E\u5143\u6570\u636E\u9762\u677F\u540C\u5C4F\u3002\u53E0\u52A0\u5C42\u9010\u9879\u5F00\u5173\u3001\u4E92\u4E0D\u5E72\u6270\uFF1B\u76F8\u5173\u6570\u636E\u53EF\u76F4\u63A5\u5207\u6362\u800C\u4E0D\u4E22\u5931\u5F53\u524D\u4F4D\u7F6E\u3002",
      meta: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Tag, {
        tone: "quiet",
        icon: "pin"
      }, "\u53A8\u623F / \u53F0\u9762 K2"), /*#__PURE__*/React.createElement(Tag, {
        tone: "quiet",
        icon: "robot"
      }, "\u4EBA\u5F62 \xB7 \u53CC\u81C2"), /*#__PURE__*/React.createElement(Tag, {
        tone: "quiet",
        icon: "cube"
      }, "EGO-KITCH-02 v1.2"), /*#__PURE__*/React.createElement(Tag, {
        tone: "warn",
        dot: true
      }, "\u8D28\u68C0\u7ED3\u8BBA\uFF1A\u4E0D\u901A\u8FC7"), /*#__PURE__*/React.createElement(Tag, {
        tone: "quiet",
        icon: "flag"
      }, "\u673A\u5BA1\u6807\u8BB0 3 \u5904")),
      actions: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Btn, {
        icon: "download",
        tone: "ghost"
      }, "\u4E0B\u8F7D\u539F\u59CB"), /*#__PURE__*/React.createElement(Btn, {
        icon: "link",
        tone: "ghost"
      }, "\u590D\u5236\u94FE\u63A5"), /*#__PURE__*/React.createElement(Btn, {
        icon: "flag",
        tone: "ghost",
        onClick: () => toast.push({
          tone: "info",
          title: "已打标记",
          desc: "已在当前帧添加标记，可用于驳回证据或批注。"
        })
      }, "\u6253\u6807\u8BB0 ", /*#__PURE__*/React.createElement(Kbd, null, "M")))
    }), /*#__PURE__*/React.createElement("div", {
      className: "pagebody flush"
    }, /*#__PURE__*/React.createElement("div", {
      className: "wb",
      style: {
        gridTemplateColumns: "minmax(0,1fr) 344px",
        height: "100%"
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "wb-col"
    }, /*#__PURE__*/React.createElement("div", {
      className: "wb-body",
      style: {
        background: "var(--surface-inset)"
      }
    }, /*#__PURE__*/React.createElement(MultiView, {
      views: VIEWS,
      t: t,
      count: views,
      main: main,
      onMain: setMain,
      overlays: ov,
      tileH: views === 1 ? 560 : views === 2 ? 420 : 480
    })), /*#__PURE__*/React.createElement("div", {
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
      extra: /*#__PURE__*/React.createElement("div", {
        className: "row-tight",
        style: {
          gap: 4
        }
      }, VIEWS.map((v, i) => /*#__PURE__*/React.createElement("button", {
        key: v.k,
        className: "btn btn-sm",
        title: v.label + "（" + (i + 1) + "）",
        onClick: () => {
          setMain(v.k);
          if (views === 1) setViews(2);
        },
        style: main === v.k ? {
          borderColor: v.color,
          color: v.color
        } : null
      }, i + 1)))
    }), /*#__PURE__*/React.createElement(Timeline, {
      t: t,
      onSeek: setT,
      duration: 372,
      machine: [{
        t: 0.10,
        kind: "danger",
        label: "有效帧占比 71.3%"
      }, {
        t: 0.372,
        kind: "warn",
        label: "过曝"
      }, {
        t: 0.65,
        kind: "danger",
        label: "目标可见率 63.5%"
      }],
      notes: [{
        t: 0.31,
        kind: "warn",
        who: "质检员",
        frame: 128
      }, {
        t: 0.65,
        kind: "review",
        who: "质检员",
        frame: 268
      }],
      tracks: [{
        id: "action",
        color: "var(--domain-c)",
        name: "动作段",
        segs: D.ANNO_TRACKS[0].segs
      }, {
        id: "instruction",
        color: "var(--domain-e)",
        name: "指令",
        segs: D.ANNO_TRACKS[2].segs
      }, {
        id: "contact",
        color: "var(--warn)",
        name: "接触事件",
        segs: D.ANNO_TRACKS[3].segs
      }]
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
    }, "\u5143\u6570\u636E\u4E0E\u53E0\u52A0\u5C42"), /*#__PURE__*/React.createElement("span", {
      className: "grow"
    }), /*#__PURE__*/React.createElement(IconBtn, {
      n: "copy",
      title: "\u590D\u5236\u5168\u90E8\u5B57\u6BB5",
      onClick: () => toast.push({
        tone: "ok",
        title: "已复制",
        desc: "全部结构化字段已复制到剪贴板（JSON）。"
      })
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
        marginBottom: 8
      }
    }, "\u53E0\u52A0\u5C42\u5F00\u5173"), /*#__PURE__*/React.createElement(OverlaySwitch, {
      value: ov,
      onChange: setOv
    }), /*#__PURE__*/React.createElement("div", {
      className: "tiny muted-3",
      style: {
        marginTop: 8,
        lineHeight: 1.65
      }
    }, "\u9010\u9879\u5F00\u5173\uFF0C\u4E92\u4E0D\u5E72\u6270\u3002\u8D28\u68C0\u5458\u6253\u5F00\u7684\u662F\u300C\u95EE\u9898\u300D\uFF0C\u4E0D\u662F\u300C\u6240\u6709\u4FE1\u606F\u300D\u3002")), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      className: "field-label",
      style: {
        marginBottom: 8
      }
    }, "\u673A\u5BA1\u547D\u4E2D"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 6
      }
    }, [["QC-FRAME-01 有效帧占比", "71.3% < 80%", "danger", 0.10], ["QC-VIS-01 目标可见率", "63.5% < 70%", "danger", 0.65], ["QC-ALIGN-01 观测动作偏差", "2.4 帧 > 2 帧", "danger", 0.65], ["QC-LIGHT-01 过曝帧占比", "6.1% > 5%", "warn", 0.372]].map(e => /*#__PURE__*/React.createElement("button", {
      key: e[0],
      className: "panel-inset",
      style: {
        padding: "8px 10px",
        textAlign: "left",
        cursor: "pointer",
        border: "1px solid var(--line-soft)"
      },
      onClick: () => setT(e[3])
    }, /*#__PURE__*/React.createElement("div", {
      className: "spread"
    }, /*#__PURE__*/React.createElement("span", {
      className: cls("tag", "t-" + e[2])
    }, e[0]), /*#__PURE__*/React.createElement(Icon, {
      n: "arrowRight",
      s: 12,
      style: {
        color: "var(--accent)"
      }
    })), /*#__PURE__*/React.createElement("div", {
      className: "mono small",
      style: {
        marginTop: 5,
        color: "var(--" + e[2] + ")"
      }
    }, e[1]))))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      className: "field-label",
      style: {
        marginBottom: 8
      }
    }, "\u7ED3\u6784\u5316\u5B57\u6BB5"), /*#__PURE__*/React.createElement(DL, {
      rows: [["Clip ID", clip], ["任务", "TK-2409-011"], ["批次", "BAT-2409-0116"], ["采集员", "采集员 A"], ["采集时间", "09-11 14:02"], ["点位", "K2"], ["时长", "08:04"], ["视角", "Ego / Exo / Wrist"], ["质量分", "34（无效）"], ["分层", "无效样本"], ["内容指纹", "sha256:b2f7…9a04"], ["合规", "脱敏已通过"]]
    })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      className: "field-label",
      style: {
        marginBottom: 8
      }
    }, "\u8840\u7F18"), /*#__PURE__*/React.createElement("div", {
      className: "panel-inset",
      style: {
        padding: 11
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "row",
      style: {
        gap: 6,
        flexWrap: "wrap"
      }
    }, /*#__PURE__*/React.createElement(Tag, {
      tone: "quiet",
      icon: "file"
    }, "\u539F\u59CB"), /*#__PURE__*/React.createElement(Icon, {
      n: "arrowRight",
      s: 10,
      style: {
        color: "var(--text-4)"
      }
    }), /*#__PURE__*/React.createElement(Tag, {
      tone: "quiet"
    }, "\u6E05\u6D17 v2"), /*#__PURE__*/React.createElement(Icon, {
      n: "arrowRight",
      s: 10,
      style: {
        color: "var(--text-4)"
      }
    }), /*#__PURE__*/React.createElement(Tag, {
      tone: "quiet"
    }, "\u6807\u6CE8 v4"), /*#__PURE__*/React.createElement(Icon, {
      n: "arrowRight",
      s: 10,
      style: {
        color: "var(--text-4)"
      }
    }), /*#__PURE__*/React.createElement(Tag, {
      tone: "accent"
    }, "\u672A\u5165\u96C6")), /*#__PURE__*/React.createElement("div", {
      className: "tiny muted-3",
      style: {
        marginTop: 8,
        lineHeight: 1.65
      }
    }, "\u8BE5\u6570\u636E\u672A\u88AB\u6253\u5305\u8FDB\u4EFB\u4F55\u5FEB\u7167\u3002\u82E5\u540E\u7EED\u88AB\u5F15\u7528\uFF0C\u5C06\u5728\u6B64\u5904\u5C55\u5F00\u53D7\u5F71\u54CD\u7684\u6570\u636E\u96C6\u6E05\u5355\u3002"))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      className: "field-label",
      style: {
        marginBottom: 8
      }
    }, "\u76F8\u5173\u6570\u636E"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 5
      }
    }, [["CLP-88412", "同任务", "06:12", "ok"], ["CLP-88413", "同任务", "05:48", "warn"], ["CLP-88415", "同采集员", "05:30", "review"]].map(r => /*#__PURE__*/React.createElement("button", {
      key: r[0],
      className: "listitem",
      style: {
        border: "1px solid var(--line-soft)",
        borderRadius: 4,
        padding: "8px 10px"
      },
      onClick: () => set({
        page: "browser",
        payload: {
          id: r[0]
        }
      })
    }, /*#__PURE__*/React.createElement("div", {
      className: "spread"
    }, /*#__PURE__*/React.createElement("span", {
      className: "mono small"
    }, r[0]), /*#__PURE__*/React.createElement(Tag, {
      tone: r[3],
      dot: true
    }, r[1])), /*#__PURE__*/React.createElement("div", {
      className: "tiny muted-3",
      style: {
        marginTop: 3
      }
    }, "\u65F6\u957F ", r[2], " \xB7 \u70B9\u51FB\u76F4\u63A5\u5207\u6362\uFF0C\u4E0D\u4E22\u5931\u5F53\u524D\u4F4D\u7F6E")))))))))));
  }
  window.PAGES_A = {
    OverviewBoard,
    TaskList,
    TaskDetail,
    UploadCenter,
    SearchPage,
    DataBrowser,
    CreateTaskWizard
  };
})();