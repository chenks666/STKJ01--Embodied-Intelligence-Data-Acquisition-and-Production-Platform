/* ============================================================
   客户门户（桌面 Web，外部只读，源：7.8 / 5.1）
   只做三件事：看进度、下载已交付数据集、提异议
   ============================================================ */
(function () {
  const {
    useState
  } = React;
  const {
    Tag,
    Btn,
    IconBtn,
    Panel,
    Field,
    Modal,
    DL,
    Kbd,
    cls,
    useToast,
    PageHead,
    StateBlock
  } = window.UI;
  const D = window.DATA;
  const NAV = [{
    k: "overview",
    n: "项目概览",
    i: "chart"
  }, {
    k: "delivery",
    n: "交付与验收",
    i: "receipt"
  }, {
    k: "datasets",
    n: "数据集与下载",
    i: "dataset"
  }, {
    k: "objections",
    n: "异议",
    i: "message"
  }];
  function PortalApp() {
    const [nav, setNav] = useState("overview");
    const toast = useToast();
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        minHeight: "100%",
        background: "var(--bg)"
      }
    }, /*#__PURE__*/React.createElement("aside", {
      style: {
        width: 208,
        flex: "0 0 auto",
        background: "var(--surface-0)",
        borderRight: "1px solid var(--line)",
        display: "flex",
        flexDirection: "column"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        padding: "14px 14px 12px",
        borderBottom: "1px solid var(--line-soft)"
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "row",
      style: {
        gap: 9
      }
    }, /*#__PURE__*/React.createElement("span", {
      className: "brand-mark",
      style: {
        width: 24,
        height: 24,
        borderColor: "var(--accent-line)"
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      n: "handshake",
      s: 13
    })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      className: "small",
      style: {
        fontWeight: 600
      }
    }, "\u5BA2\u6237\u95E8\u6237"), /*#__PURE__*/React.createElement("div", {
      className: "tiny muted-3"
    }, "\u6052\u7ACB\u673A\u5668\u4EBA \xB7 B01")))), /*#__PURE__*/React.createElement("div", {
      style: {
        padding: 8,
        display: "flex",
        flexDirection: "column",
        gap: 2
      }
    }, NAV.map(x => /*#__PURE__*/React.createElement("button", {
      key: x.k,
      className: cls("nav-item", nav === x.k && "active"),
      onClick: () => setNav(x.k)
    }, /*#__PURE__*/React.createElement("span", {
      className: "nav-ico"
    }, /*#__PURE__*/React.createElement(Icon, {
      n: x.i,
      s: 15
    })), /*#__PURE__*/React.createElement("span", {
      className: "nav-label"
    }, x.n), x.k === "objections" ? /*#__PURE__*/React.createElement("span", {
      className: "nav-badge"
    }, "1") : null))), /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: "auto",
        padding: 12
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "warnbox info",
      style: {
        fontSize: 11,
        lineHeight: 1.65
      }
    }, "\u5916\u90E8\u53EA\u8BFB\u89C6\u56FE\u3002\u5BA2\u6237\u4E4B\u95F4\u4E0D\u53EF\u89C1\u3001\u4E0D\u53EF\u641C\u3001\u4E0D\u53EF\u5BFC\u3002"))), /*#__PURE__*/React.createElement("main", {
      className: "main",
      style: {
        minWidth: 0,
        flex: 1
      }
    }, nav === "overview" ? /*#__PURE__*/React.createElement(PortalOverview, {
      onGo: setNav
    }) : null, nav === "delivery" ? /*#__PURE__*/React.createElement(window.PAGES_B.Delivery, {
      inPortal: true,
      set: () => {}
    }) : null, nav === "datasets" ? /*#__PURE__*/React.createElement(PortalDatasets, {
      toast: toast
    }) : null, nav === "objections" ? /*#__PURE__*/React.createElement(PortalObjections, {
      toast: toast
    }) : null));
  }

  /* ---------- 项目概览 ---------- */
  function PortalOverview({
    onGo
  }) {
    const V = D.DELIVERY;
    return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(PageHead, {
      crumbs: [{
        label: "客户门户"
      }, {
        label: "项目概览"
      }],
      title: "\u9879\u76EE\u6982\u89C8",
      desc: "\u8FDB\u5EA6\u4E0E\u751F\u4EA7\u5B9E\u9645\u4FDD\u6301\u4E00\u81F4\uFF0C\u907F\u514D\u9500\u552E\u627F\u8BFA\u4E0E\u751F\u4EA7\u5B9E\u9645\u8131\u8282\u3002\u6B64\u9875\u6240\u6709\u6570\u636E\u4E0E\u751F\u4EA7\u4FA7\u540C\u6E90\u3002",
      meta: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Tag, {
        tone: "quiet"
      }, "\u9879\u76EE B01 \xB7 \u4EBA\u5F62\u53CC\u81C2\u6570\u636E\u7EBF"), /*#__PURE__*/React.createElement(Tag, {
        tone: "accent",
        icon: "activity"
      }, "\u8FDB\u884C\u4E2D \xB7 \u7B2C 3 \u5355"), /*#__PURE__*/React.createElement(Tag, {
        tone: "quiet",
        icon: "user"
      }, "\u60A8\u7684\u5BA2\u6237\u7ECF\u7406")),
      actions: /*#__PURE__*/React.createElement(Btn, {
        icon: "message",
        tone: "ghost",
        onClick: () => onGo("objections")
      }, "\u63D0\u51FA\u5F02\u8BAE")
    }), /*#__PURE__*/React.createElement("div", {
      className: "pagebody"
    }, /*#__PURE__*/React.createElement("div", {
      className: "grid g-4",
      style: {
        marginBottom: 14
      }
    }, [["在产任务", "4", "个"], ["本月已交付", "2", "个数据集"], ["待您验收", "1", "个"], ["累计交付时长", "3.1", "小时"]].map(m => /*#__PURE__*/React.createElement("div", {
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
        fontSize: 24,
        fontWeight: 600,
        marginTop: 3
      }
    }, m[1], /*#__PURE__*/React.createElement("span", {
      className: "tiny muted-3",
      style: {
        marginLeft: 4
      }
    }, m[2]))))), /*#__PURE__*/React.createElement("div", {
      className: "grid",
      style: {
        gridTemplateColumns: "minmax(0,1.3fr) minmax(0,1fr)"
      }
    }, /*#__PURE__*/React.createElement(Panel, {
      title: "\u4EA4\u4ED8\u8FDB\u5EA6",
      sub: "\u5F85\u60A8\u9A8C\u6536",
      flush: true
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        padding: 16
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "spread",
      style: {
        marginBottom: 10
      }
    }, /*#__PURE__*/React.createElement("span", {
      className: "row",
      style: {
        gap: 8
      }
    }, /*#__PURE__*/React.createElement("span", {
      className: "mono small"
    }, V.id), /*#__PURE__*/React.createElement(Tag, {
      tone: "accent",
      dot: true
    }, "\u5F85\u5BA2\u6237\u9A8C\u6536")), /*#__PURE__*/React.createElement("span", {
      className: "tiny muted-3"
    }, "\u4EA4\u671F ", V.due)), /*#__PURE__*/React.createElement("div", {
      className: "bar thick",
      style: {
        marginBottom: 14
      }
    }, /*#__PURE__*/React.createElement("i", {
      style: {
        width: V.progress * 100 + "%"
      }
    })), /*#__PURE__*/React.createElement("div", {
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
    }, s.t)), s.st === "active" ? /*#__PURE__*/React.createElement("div", {
      className: "tiny muted-3",
      style: {
        marginTop: 4
      }
    }, "\u8BF7\u67E5\u770B\u4EA4\u4ED8\u6E05\u5355\u4E0E Data Card\uFF0C\u5E76\u5728 09-19 \u524D\u5B8C\u6210\u7B7E\u8BA4\u6216\u63D0\u51FA\u5F02\u8BAE\u3002") : null)))), /*#__PURE__*/React.createElement("div", {
      className: "row",
      style: {
        gap: 8,
        marginTop: 14
      }
    }, /*#__PURE__*/React.createElement(Btn, {
      tone: "primary",
      icon: "receipt",
      onClick: () => onGo("delivery")
    }, "\u67E5\u770B\u5E76\u9A8C\u6536"), /*#__PURE__*/React.createElement(Btn, {
      tone: "ghost",
      icon: "message",
      onClick: () => onGo("objections")
    }, "\u63D0\u51FA\u5F02\u8BAE")))), /*#__PURE__*/React.createElement("div", {
      className: "col",
      style: {
        gap: 14
      }
    }, /*#__PURE__*/React.createElement(Panel, {
      title: "\u5408\u540C\u8303\u56F4",
      sub: "\u8303\u56F4\u5916\u9700\u6C42\u8D70\u53D8\u66F4\u6D41\u7A0B",
      flush: true
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        padding: 14
      }
    }, /*#__PURE__*/React.createElement(DL, {
      rows: [["合同场景", "厨房 / 台面 · 折叠衣物"], ["约定规模", "1 200 条 / 6.4 小时"], ["已交付", "297 条 / 0.52 小时（第 1 批）"], ["数据格式", "LeRobot v2.1 + HDF5"], ["部署形态", "私有化 · 数据不出本地"], ["授权", "仅限内部模型训练，禁止再分发"]]
    }))), /*#__PURE__*/React.createElement(Panel, {
      title: "\u670D\u52A1\u4E0E\u652F\u6301",
      flush: true
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        padding: 14,
        display: "flex",
        flexDirection: "column",
        gap: 8
      }
    }, [["客户经理", "工作日 9:00–18:00"], ["技术支持", "响应时效 4 小时"], ["交付答疑", "数据格式与加载 SDK 使用"]].slice(0).map(x => /*#__PURE__*/React.createElement("div", {
      key: x[0],
      className: "spread"
    }, /*#__PURE__*/React.createElement("span", {
      className: "small muted"
    }, x[0]), /*#__PURE__*/React.createElement("span", {
      className: "tiny muted-3"
    }, x[1])))))))));
  }

  /* ---------- 数据集与下载 ---------- */
  function PortalDatasets({
    toast
  }) {
    return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(PageHead, {
      crumbs: [{
        label: "客户门户"
      }, {
        label: "数据集与下载"
      }],
      title: "\u6570\u636E\u96C6\u4E0E\u4E0B\u8F7D",
      desc: "\u4EC5\u5C55\u793A\u5DF2\u4EA4\u4ED8\u7ED9\u60A8\u7EC4\u7EC7\u7684\u6570\u636E\u96C6\u3002\u4E0B\u8F7D\u53D7\u6388\u6743\u65F6\u6548\u7EA6\u675F\uFF0C\u6587\u4EF6\u5E26\u6C34\u5370\u4E0E\u6765\u6E90\u6307\u7EB9\uFF0C\u6BCF\u6B21\u4E0B\u8F7D\u5747\u7559\u75D5\u3002",
      meta: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Tag, {
        tone: "quiet"
      }, "\u5DF2\u4EA4\u4ED8 3 \u4E2A\u6570\u636E\u96C6"), /*#__PURE__*/React.createElement(Tag, {
        tone: "ok",
        icon: "lock"
      }, "\u4E0B\u8F7D\u6388\u6743\u6709\u6548\u81F3 09-28"))
    }), /*#__PURE__*/React.createElement("div", {
      className: "pagebody"
    }, /*#__PURE__*/React.createElement("div", {
      className: "panel",
      style: {
        overflow: "hidden"
      }
    }, /*#__PURE__*/React.createElement("table", {
      className: "table"
    }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "\u6570\u636E\u96C6"), /*#__PURE__*/React.createElement("th", {
      className: "num"
    }, "\u6761\u6570"), /*#__PURE__*/React.createElement("th", {
      className: "num"
    }, "\u65F6\u957F"), /*#__PURE__*/React.createElement("th", null, "\u683C\u5F0F"), /*#__PURE__*/React.createElement("th", null, "\u4EA4\u4ED8\u65E5\u671F"), /*#__PURE__*/React.createElement("th", null, "\u72B6\u6001"), /*#__PURE__*/React.createElement("th", null))), /*#__PURE__*/React.createElement("tbody", null, [["DS-KITCH-FOLD-v3", 297, "0.52h", "LeRobot v2.1 + HDF5", "09-14", "待验收", "accent"], ["DS-KITCH-FOLD-v2", 268, "0.47h", "LeRobot v2.1", "09-12", "已签认", "ok"], ["DS-GRASP-NEG-v1", 600, "1.06h", "RLDS + HDF5", "09-05", "已签认", "ok"]].map(r => /*#__PURE__*/React.createElement("tr", {
      key: r[0],
      className: "clickable"
    }, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontWeight: 600
      }
    }, r[0]), /*#__PURE__*/React.createElement("div", {
      className: "tiny muted-3"
    }, r[0] === "DS-KITCH-FOLD-v3" ? "含 Data Card、质量报告、验收单" : "含 Data Card 与质量报告")), /*#__PURE__*/React.createElement("td", {
      className: "num"
    }, r[1]), /*#__PURE__*/React.createElement("td", {
      className: "num"
    }, r[2]), /*#__PURE__*/React.createElement("td", {
      className: "muted"
    }, r[3]), /*#__PURE__*/React.createElement("td", {
      className: "mono small"
    }, r[4]), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement(Tag, {
      tone: r[5],
      dot: true
    }, r[5] === "accent" ? "待验收" : r[5] === "ok" ? "已签认" : r[5])), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement(Btn, {
      size: "sm",
      tone: "ghost",
      icon: "download",
      onClick: () => toast.push({
        tone: "info",
        title: "下载已开始",
        desc: "文件已带水印 WM-2f91c4，链接 48 小时内有效。"
      })
    }, "\u4E0B\u8F7D")))))), /*#__PURE__*/React.createElement("div", {
      className: "panel-foot"
    }, /*#__PURE__*/React.createElement(Icon, {
      n: "shield",
      s: 12
    }), /*#__PURE__*/React.createElement("span", null, "\u6240\u6709\u4E0B\u8F7D\u5747\u8BB0\u5F55\u63A5\u6536\u65B9\u4E0E\u65F6\u95F4\u3002\u5206\u53D1\u540E\u53EF\u7531\u6C34\u5370\u4E0E\u6765\u6E90\u6307\u7EB9\u5B9A\u4F4D\u6CC4\u9732\u6765\u6E90\u3002"))), /*#__PURE__*/React.createElement(Panel, {
      title: "Data Card \xB7 DS-KITCH-FOLD-v3",
      sub: "\u5224\u65AD\u6570\u636E\u80FD\u5426\u7528\u4E8E\u8BAD\u7EC3\u7684\u4F9D\u636E",
      className: "",
      flush: true
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        padding: 14
      }
    }, /*#__PURE__*/React.createElement(DL, {
      rows: [["来源", D.DATA_CARD.source], ["本体", D.DATA_CARD.embody], ["传感器", D.DATA_CARD.sensors], ["场景", D.DATA_CARD.scene], ["分布", D.DATA_CARD.distribution], ["质量", D.DATA_CARD.quality], ["授权", D.DATA_CARD.license]]
    }), /*#__PURE__*/React.createElement("div", {
      className: "field-label",
      style: {
        margin: "14px 0 7px"
      }
    }, "\u5DF2\u77E5\u9650\u5236"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 6
      }
    }, D.DATA_CARD.limits.map((l, i) => /*#__PURE__*/React.createElement("div", {
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
    }, l))))))));
  }

  /* ---------- 异议 ---------- */
  function PortalObjections({
    toast
  }) {
    const [open, setOpen] = useState(false);
    return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(PageHead, {
      crumbs: [{
        label: "客户门户"
      }, {
        label: "异议"
      }],
      title: "\u5F02\u8BAE",
      desc: "\u5F02\u8BAE\u5FC5\u987B\u7ED3\u6784\u5316\u5E76\u951A\u5B9A\u5230\u5177\u4F53\u7247\u6BB5\u6216\u5B57\u6BB5\uFF0C\u5426\u5219\u6574\u6539\u65E0\u6CD5\u6267\u884C\uFF0C\u53EA\u80FD\u53CD\u590D\u6C9F\u901A\u3002\u63D0\u4EA4\u540E\u81EA\u52A8\u5173\u8054\u5230\u91C7\u96C6\u6216\u6807\u6CE8\u73AF\u8282\u5E76\u751F\u6210\u6574\u6539\u4EFB\u52A1\u3002",
      meta: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Tag, {
        tone: "warn",
        dot: true
      }, "1 \u6761\u5904\u7406\u4E2D"), /*#__PURE__*/React.createElement(Tag, {
        tone: "quiet",
        dot: true
      }, "1 \u6761\u5DF2\u5173\u95ED")),
      actions: /*#__PURE__*/React.createElement(Btn, {
        tone: "primary",
        icon: "plus",
        onClick: () => setOpen(true)
      }, "\u65B0\u5EFA\u5F02\u8BAE")
    }), /*#__PURE__*/React.createElement("div", {
      className: "pagebody"
    }, /*#__PURE__*/React.createElement("div", {
      className: "grid g-2"
    }, /*#__PURE__*/React.createElement(Panel, {
      title: "\u6211\u7684\u5F02\u8BAE",
      sub: "\u6309\u63D0\u4EA4\u65F6\u95F4\u5012\u5E8F",
      flush: true
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
    }, o.t)), /*#__PURE__*/React.createElement("div", {
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
      title: "\u7ED3\u6784\u5316\u5F02\u8BAE\u600E\u4E48\u5199",
      sub: "\u951A\u70B9\u662F\u5173\u952E",
      flush: true
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        padding: 14,
        display: "flex",
        flexDirection: "column",
        gap: 10
      }
    }, [["1", "选锚点", "片段与帧，或元数据字段、Data Card 条目。没有锚点的异议无法执行。"], ["2", "写清现象", "具体到时间码与表现，例如「01:00 处轨迹明显抖动」。"], ["3", "给出判断依据", "说明为何认为不属于数据问题，例如「怀疑本体控制异常」。"], ["4", "等待整改回执", "异议将生成整改任务并指派到采集或标注环节，闭环后重新提交验收。"]].map(s => /*#__PURE__*/React.createElement("div", {
      key: s[0],
      className: "row",
      style: {
        gap: 10,
        alignItems: "flex-start"
      }
    }, /*#__PURE__*/React.createElement("span", {
      className: "m-stepnum",
      style: {
        flex: "0 0 auto"
      }
    }, s[0]), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      className: "small",
      style: {
        fontWeight: 600
      }
    }, s[1]), /*#__PURE__*/React.createElement("div", {
      className: "tiny muted-3",
      style: {
        marginTop: 3,
        lineHeight: 1.65
      }
    }, s[2])))))), /*#__PURE__*/React.createElement(Panel, {
      title: "\u8D85\u51FA\u5408\u540C\u8303\u56F4\u7684\u9700\u6C42",
      flush: true
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        padding: 14
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "warnbox"
    }, "\u95E8\u6237\u63D0\u793A\u8303\u56F4\u5916\u5E76\u8BB0\u5F55\u3002\u8D85\u51FA\u5408\u540C\u8303\u56F4\u7684\u8C03\u6574\u8D70\u53D8\u66F4\u6D41\u7A0B\uFF0C\u4E0D\u76F4\u63A5\u6539\u751F\u4EA7\uFF0C\u907F\u514D\u53E3\u5934\u7684\u8303\u56F4\u8513\u5EF6\u5F71\u54CD\u4EA4\u671F\u3002"), /*#__PURE__*/React.createElement(Btn, {
      size: "sm",
      tone: "ghost",
      block: true,
      icon: "send",
      style: {
        marginTop: 10
      },
      onClick: () => toast.push({
        tone: "info",
        title: "已提交变更申请",
        desc: "客户经理将在 1 个工作日内联系您确认范围、工期与报价影响。"
      })
    }, "\u63D0\u4EA4\u53D8\u66F4\u7533\u8BF7")))))), open ? /*#__PURE__*/React.createElement(window.PAGES_B.ObjectionDialog, {
      onClose: () => setOpen(false)
    }) : null);
  }
  window.PORTAL = {
    PortalApp
  };
})();