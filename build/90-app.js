/* ============================================================
   应用外壳 · 三端切换 / 导航 / 路由 / 明暗主题 / 演示动线
   ============================================================ */
(function () {
  const {
    useState,
    useEffect,
    useMemo,
    useRef
  } = React;
  const {
    Tag,
    Btn,
    IconBtn,
    Panel,
    Modal,
    DL,
    Kbd,
    ToastHost,
    cls,
    useToast,
    PageHead
  } = window.UI;
  const D = window.DATA;
  const A = window.PAGES_A,
    B = window.PAGES_B;

  /* ---------- 兜底页：批次 / 配方库 ---------- */
  function BatchList({
    set
  }) {
    const toast = useToast();
    const rows = [["BAT-2409-0116", "TK-2409-011", "K2 / 采集员 A", 216, "校验中", "warn", "3 条待处理"], ["BAT-2409-0115", "TK-2409-011", "K2 / 采集员 A", 204, "已入库", "ok", "—"], ["BAT-2409-0114", "TK-2409-011", "K3 / 采集员 C", 188, "已入库", "ok", "—"], ["BAT-2409-0113", "TK-2409-011", "K3 / 采集员 C", 176, "已入库", "ok", "—"], ["BAT-2409-0112", "TK-2409-011", "K5 / 采集员 B", 160, "已入库", "ok", "—"], ["BAT-2409-0111", "TK-2409-011", "K5 / 采集员 B", 88, "已入库", "ok", "—"]];
    return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(PageHead, {
      crumbs: [{
        label: "生产"
      }, {
        label: "批次"
      }],
      title: "\u6279\u6B21",
      desc: "\u6279\u6B21\u662F\u4EFB\u52A1\u4E0B\u53EF\u72EC\u7ACB\u4EA4\u4ED8\u7684\u751F\u4EA7\u5355\u5143\uFF0C\u6309\u70B9\u4F4D\u3001\u65F6\u6BB5\u6216\u4EBA\u5458\u5212\u5206\u3002\u6279\u6B21\u7684\u8D28\u68C0\u7ED3\u8BBA\u4E0E\u4E0A\u4F20\u72B6\u6001\u5728\u6B64\u96C6\u4E2D\u67E5\u770B\u3002",
      meta: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Tag, {
        tone: "quiet"
      }, "\u5171 24 \u4E2A\u6279\u6B21"), /*#__PURE__*/React.createElement(Tag, {
        tone: "warn",
        dot: true
      }, "1 \u4E2A\u6821\u9A8C\u4E2D")),
      actions: /*#__PURE__*/React.createElement(Btn, {
        icon: "filter",
        tone: "ghost"
      }, "\u7B5B\u9009")
    }), /*#__PURE__*/React.createElement("div", {
      className: "pagebody"
    }, /*#__PURE__*/React.createElement("div", {
      className: "panel",
      style: {
        overflow: "hidden"
      }
    }, /*#__PURE__*/React.createElement("table", {
      className: "table"
    }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "\u6279\u6B21"), /*#__PURE__*/React.createElement("th", null, "\u6240\u5C5E\u4EFB\u52A1"), /*#__PURE__*/React.createElement("th", null, "\u70B9\u4F4D / \u91C7\u96C6\u5458"), /*#__PURE__*/React.createElement("th", {
      className: "num"
    }, "\u6761\u6570"), /*#__PURE__*/React.createElement("th", null, "\u72B6\u6001"), /*#__PURE__*/React.createElement("th", null, "\u5907\u6CE8"), /*#__PURE__*/React.createElement("th", null))), /*#__PURE__*/React.createElement("tbody", null, rows.map(r => /*#__PURE__*/React.createElement("tr", {
      key: r[0],
      className: "clickable",
      onClick: () => set({
        page: "upload"
      })
    }, /*#__PURE__*/React.createElement("td", {
      className: "mono",
      style: {
        fontWeight: 600
      }
    }, r[0]), /*#__PURE__*/React.createElement("td", {
      className: "mono small"
    }, r[1]), /*#__PURE__*/React.createElement("td", null, r[2]), /*#__PURE__*/React.createElement("td", {
      className: "num"
    }, r[3]), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement(Tag, {
      tone: r[5],
      dot: true
    }, r[4])), /*#__PURE__*/React.createElement("td", {
      className: r[6] === "—" ? "muted-3 tiny" : "tiny",
      style: r[6] !== "—" ? {
        color: "var(--warn)"
      } : null
    }, r[6]), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement(Icon, {
      n: "chevRight",
      s: 13,
      style: {
        color: "var(--text-4)"
      }
    })))))), /*#__PURE__*/React.createElement("div", {
      className: "panel-foot"
    }, /*#__PURE__*/React.createElement(Icon, {
      n: "info",
      s: 12
    }), /*#__PURE__*/React.createElement("span", null, "\u6279\u6B21\u7EA7\u64CD\u4F5C\uFF1A\u6279\u91CF\u91CD\u8DD1\u6821\u9A8C\u3001\u6279\u91CF\u6539\u5224\u3001\u5BFC\u51FA\u6279\u6B21\u660E\u7EC6\u3002\u5F71\u54CD\u8D85\u8FC7 50 \u6761\u65F6\u4E8C\u6B21\u786E\u8BA4\u5E76\u5217\u51FA\u5F71\u54CD\u9762\u3002")))));
  }
  function RecipesPage({
    set
  }) {
    const toast = useToast();
    const rows = [["RCP-KITCH-FOLD-NEG-v2", "厨房 / 台面 · 折叠衣物失败样本", 6, 297, "0.52h", "数据工程师", "已发布 3 版"], ["RCP-WH-SORT-ALL-v1", "仓储 / 分拣线 全量", 4, 800, "1.62h", "项目经理", "已发布 1 版"], ["RCP-SCREW-FORCE-v1", "产线 / 装配工位 力控样本", 7, 630, "1.24h", "项目经理", "待发布"], ["RCP-CLOTH-SOFT-v2", "软体实验台 柔性布料", 5, 376, "0.71h", "数据工程师", "已发布 2 版"], ["RCP-CABLE-INS-v1", "实验台 / 电控柜 插拔样本", 6, 495, "0.98h", "数据工程师", "已发布 1 版"], ["RCP-QUAD-TRAV-v1", "户外 / 阶梯碎石 四足越障", 3, 500, "1.11h", "项目经理", "已发布 1 版"], ["RCP-GRASP-NEG-v1", "桌面 / 多物体 抓取失败", 5, 198, "0.41h", "项目经理", "草稿"]];
    return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(PageHead, {
      crumbs: [{
        label: "数据集"
      }, {
        label: "配方库"
      }],
      title: "\u914D\u65B9\u5E93",
      desc: "\u628A\u300C\u6211\u8981\u54EA\u4E00\u6279\u6570\u636E\u300D\u4ECE\u53E3\u5934\u6C9F\u901A\u53D8\u6210\u53EF\u4FDD\u5B58\u3001\u53EF\u590D\u7528\u3001\u53EF\u590D\u73B0\u7684\u7ED3\u6784\u5316\u5B9A\u4E49\u3002\u540C\u7C7B\u5BA2\u6237\u7684\u7B2C\u4E8C\u6B21\u4EA4\u4ED8\uFF0C\u590D\u5236\u914D\u65B9\u6539\u6761\u4EF6\u5373\u53EF\u3002",
      meta: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Tag, {
        tone: "quiet"
      }, "\u5171 7 \u4E2A\u914D\u65B9"), /*#__PURE__*/React.createElement(Tag, {
        tone: "ok",
        icon: "check"
      }, "4 \u4E2A\u5DF2\u53D1\u5E03\u5FEB\u7167")),
      actions: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Btn, {
        icon: "plus",
        tone: "primary",
        onClick: () => set({
          page: "recipe"
        })
      }, "\u65B0\u5EFA\u914D\u65B9"))
    }), /*#__PURE__*/React.createElement("div", {
      className: "pagebody"
    }, /*#__PURE__*/React.createElement("div", {
      className: "panel",
      style: {
        overflow: "hidden"
      }
    }, /*#__PURE__*/React.createElement("table", {
      className: "table"
    }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "\u914D\u65B9"), /*#__PURE__*/React.createElement("th", null, "\u7528\u9014"), /*#__PURE__*/React.createElement("th", {
      className: "num"
    }, "\u6761\u4EF6\u7EC4"), /*#__PURE__*/React.createElement("th", {
      className: "num"
    }, "\u547D\u4E2D\u6761\u6570"), /*#__PURE__*/React.createElement("th", {
      className: "num"
    }, "\u65F6\u957F"), /*#__PURE__*/React.createElement("th", null, "\u8D1F\u8D23\u4EBA"), /*#__PURE__*/React.createElement("th", null, "\u7248\u672C"), /*#__PURE__*/React.createElement("th", null))), /*#__PURE__*/React.createElement("tbody", null, rows.map(r => /*#__PURE__*/React.createElement("tr", {
      key: r[0],
      className: "clickable",
      onClick: () => set({
        page: "recipe"
      })
    }, /*#__PURE__*/React.createElement("td", {
      className: "mono",
      style: {
        fontWeight: 600
      }
    }, r[0]), /*#__PURE__*/React.createElement("td", {
      className: "muted"
    }, r[1]), /*#__PURE__*/React.createElement("td", {
      className: "num"
    }, r[2]), /*#__PURE__*/React.createElement("td", {
      className: "num"
    }, r[3]), /*#__PURE__*/React.createElement("td", {
      className: "num"
    }, r[4]), /*#__PURE__*/React.createElement("td", null, r[5]), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement(Tag, {
      tone: r[6] === "草稿" ? "quiet" : r[6] === "待发布" ? "warn" : "ok",
      dot: true
    }, r[6])), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement(Btn, {
      size: "sm",
      tone: "ghost",
      icon: "copy",
      onClick: e => {
        e.stopPropagation();
        toast.push({
          tone: "ok",
          title: "已复制配方",
          desc: r[0] + " 已复制为副本，可改条件后直接复用。"
        });
      }
    }, "\u590D\u5236")))))))));
  }

  /* ---------- 路由表 ---------- */
  function renderPlatform(app, set) {
    const {
      domain,
      page
    } = app;
    const key = domain + "/" + page;
    const map = {
      "production/overview": /*#__PURE__*/React.createElement(A.OverviewBoard, {
        app: app,
        set: set
      }),
      "production/tasks": /*#__PURE__*/React.createElement(A.TaskList, {
        app: app,
        set: set
      }),
      "production/detail": /*#__PURE__*/React.createElement(A.TaskDetail, {
        app: app,
        set: set
      }),
      "production/batches": /*#__PURE__*/React.createElement(BatchList, {
        app: app,
        set: set
      }),
      "production/upload": /*#__PURE__*/React.createElement(A.UploadCenter, {
        app: app,
        set: set
      }),
      "production/search": /*#__PURE__*/React.createElement(A.SearchPage, {
        app: app,
        set: set
      }),
      "production/browser": /*#__PURE__*/React.createElement(A.DataBrowser, {
        app: app,
        set: set
      }),
      "quality/qcqueue": /*#__PURE__*/React.createElement(B.QCConsole, {
        app: app,
        set: set
      }),
      "quality/qc": /*#__PURE__*/React.createElement(B.QCConsole, {
        app: app,
        set: set
      }),
      "quality/rules": /*#__PURE__*/React.createElement(B.RuleConfig, null),
      "annotate/annotasks": /*#__PURE__*/React.createElement(B.AnnoTasks, {
        app: app,
        set: set
      }),
      "annotate/workbench": /*#__PURE__*/React.createElement(B.AnnoWorkbench, {
        app: app,
        set: set
      }),
      "annotate/qcanon": /*#__PURE__*/React.createElement(B.AnnoWorkbench, {
        app: app,
        set: set,
        reviewMode: true
      }),
      "dataset/recipes": /*#__PURE__*/React.createElement(RecipesPage, {
        app: app,
        set: set
      }),
      "dataset/recipe": /*#__PURE__*/React.createElement(B.RecipeEditor, {
        app: app,
        set: set
      }),
      "dataset/snapshots": /*#__PURE__*/React.createElement(B.Snapshots, {
        app: app,
        set: set
      }),
      "dataset/delivery": /*#__PURE__*/React.createElement(B.Delivery, {
        app: app,
        set: set
      }),
      "dataset/api": /*#__PURE__*/React.createElement(B.ApiConsole, {
        app: app,
        set: set
      }),
      "sim/simgate": /*#__PURE__*/React.createElement(B.SimPage, {
        page: "simgate"
      }),
      "sim/simgens": /*#__PURE__*/React.createElement(B.SimPage, {
        page: "simgens"
      }),
      "sim/simblend": /*#__PURE__*/React.createElement(B.SimPage, {
        page: "simblend"
      }),
      "board/board": /*#__PURE__*/React.createElement(B.Board, null),
      "safety/keys": /*#__PURE__*/React.createElement(B.SafetyPage, {
        page: "keys"
      }),
      "safety/lifecycle": /*#__PURE__*/React.createElement(B.SafetyPage, {
        page: "lifecycle"
      }),
      "safety/watermark": /*#__PURE__*/React.createElement(B.SafetyPage, {
        page: "watermark"
      }),
      "config/specs": /*#__PURE__*/React.createElement(B.ConfigPage, {
        page: "specs",
        set: set
      }),
      "config/devices": /*#__PURE__*/React.createElement(B.ConfigPage, {
        page: "devices",
        set: set
      }),
      "config/contract": /*#__PURE__*/React.createElement(B.ContractPage, {
        app: app,
        set: set
      }),
      "config/people": /*#__PURE__*/React.createElement(B.ConfigPage, {
        page: "people",
        set: set
      }),
      "config/perms": /*#__PURE__*/React.createElement(B.ConfigPage, {
        page: "perms",
        set: set
      }),
      "config/audit": /*#__PURE__*/React.createElement(B.ConfigPage, {
        page: "audit",
        set: set
      }),
      "config/acceptance": /*#__PURE__*/React.createElement(B.Acceptance, null)
    };
    return map[key] || /*#__PURE__*/React.createElement(A.OverviewBoard, {
      app: app,
      set: set
    });
  }

  /* ---------- 通知 ---------- */
  const NOTICES = [{
    lv: "danger",
    t: "QC-MOT-01 规则命中激增",
    d: "近 6 小时命中 42 条（阈值 30），建议复核 ASM-SCREW-01 规格模板",
    get: () => ({
      domain: "quality",
      page: "rules"
    })
  }, {
    lv: "danger",
    t: "上传队列 3 条待处理",
    d: "批次 BAT-2409-0116 有 1 条疑似重复待裁决、2 条不通过",
    get: () => ({
      domain: "production",
      page: "upload"
    })
  }, {
    lv: "warn",
    t: "被指派重采 3 条",
    d: "原因码 RC-0101 手部出画 · 已于 09:24 生成重采任务",
    get: () => ({
      domain: "production",
      page: "tasks"
    })
  }, {
    lv: "warn",
    t: "TK-2409-011 距交期 5 天",
    d: "按现速可完成，无缓冲，建议增派 1 名采集员",
    get: () => ({
      domain: "production",
      page: "detail",
      payload: {
        id: "TK-2409-011"
      }
    })
  }, {
    lv: "quiet",
    t: "构建完成",
    d: "DS-WH-SORT-v1 已发布，内容指纹 sha256:2c77…aa41",
    get: () => ({
      domain: "dataset",
      page: "snapshots"
    })
  }];
  function NoticePanel({
    onGo,
    onClose
  }) {
    return /*#__PURE__*/React.createElement("div", {
      style: {
        position: "absolute",
        top: 46,
        right: 12,
        width: 360,
        zIndex: 60,
        background: "var(--surface-1)",
        border: "1px solid var(--line-strong)",
        borderRadius: 6,
        boxShadow: "var(--shadow-pop)",
        overflow: "hidden"
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "panel-head",
      style: {
        minHeight: 38
      }
    }, /*#__PURE__*/React.createElement("span", {
      className: "panel-title"
    }, "\u901A\u77E5"), /*#__PURE__*/React.createElement("span", {
      className: "panel-sub"
    }, "\u540C\u4E00\u4E8B\u4EF6\u91CD\u590D\u901A\u77E5\u5DF2\u5408\u5E76"), /*#__PURE__*/React.createElement("span", {
      style: {
        marginLeft: "auto",
        display: "flex",
        gap: 6
      }
    }, /*#__PURE__*/React.createElement(Btn, {
      size: "sm",
      tone: "ghost"
    }, "\u5168\u90E8\u5DF2\u8BFB"), /*#__PURE__*/React.createElement(IconBtn, {
      n: "x",
      s: 13,
      title: "\u5173\u95ED",
      onClick: onClose
    }))), /*#__PURE__*/React.createElement("div", {
      style: {
        maxHeight: 380,
        overflow: "auto"
      }
    }, NOTICES.map((n, i) => /*#__PURE__*/React.createElement("button", {
      key: i,
      className: "listitem",
      onClick: () => {
        onGo(n.get());
        onClose();
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "row",
      style: {
        gap: 9,
        alignItems: "flex-start"
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      n: n.lv === "danger" ? "danger" : n.lv === "warn" ? "warn" : "info",
      s: 14,
      style: {
        color: "var(--" + (n.lv === "danger" ? "danger" : n.lv === "warn" ? "warn" : "accent") + ")",
        flex: "0 0 auto",
        marginTop: 1
      }
    }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      className: "small",
      style: {
        fontWeight: 600
      }
    }, n.t), /*#__PURE__*/React.createElement("div", {
      className: "tiny muted-3",
      style: {
        marginTop: 3,
        lineHeight: 1.6
      }
    }, n.d)))))), /*#__PURE__*/React.createElement("div", {
      className: "panel-foot",
      style: {
        justifyContent: "space-between"
      }
    }, /*#__PURE__*/React.createElement("span", {
      className: "tiny muted-3"
    }, "\u6309\u5206\u7EA7\u8BA2\u9605\uFF1A\u963B\u585E\u7EA7\u5F3A\u5236\u5F00\u542F \xB7 \u6458\u8981\u7EA7\u53EF\u5173\u95ED"), /*#__PURE__*/React.createElement("span", {
      className: "tiny",
      style: {
        color: "var(--accent)",
        cursor: "pointer"
      }
    }, "\u8BA2\u9605\u8BBE\u7F6E")));
  }

  /* ---------- 演示动线面板 ---------- */
  function FlowGuide({
    app,
    onGo,
    open,
    setOpen
  }) {
    return /*#__PURE__*/React.createElement("div", {
      className: "fabs"
    }, open ? /*#__PURE__*/React.createElement("div", {
      className: "fabs-panel"
    }, /*#__PURE__*/React.createElement("div", {
      className: "panel-head",
      style: {
        minHeight: 38
      }
    }, /*#__PURE__*/React.createElement("span", {
      className: "panel-title"
    }, "\u6F14\u793A\u52A8\u7EBF"), /*#__PURE__*/React.createElement("span", {
      className: "panel-sub"
    }, "\u7B2C 7 \u7AE0 F1\u2013F8"), /*#__PURE__*/React.createElement(IconBtn, {
      n: "x",
      s: 13,
      title: "\u6536\u8D77",
      onClick: () => setOpen(false)
    })), /*#__PURE__*/React.createElement("div", null, D.FLOWS.map(f => /*#__PURE__*/React.createElement("button", {
      key: f.id,
      className: cls("flowitem", app.flow === f.id && "active"),
      onClick: () => onGo(f)
    }, /*#__PURE__*/React.createElement("span", {
      className: "fid"
    }, f.id), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("span", {
      className: "ft"
    }, f.t), /*#__PURE__*/React.createElement("span", {
      className: "fd",
      style: {
        display: "block"
      }
    }, f.d))))), /*#__PURE__*/React.createElement("div", {
      className: "panel-foot",
      style: {
        display: "block"
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "tiny muted-3",
      style: {
        lineHeight: 1.65
      }
    }, "\u516B\u6761\u6D41\u7A0B\u8986\u76D6\u4ECE\u4EFB\u52A1\u4E0B\u8FBE\u5230\u4EA4\u4ED8\u9A8C\u6536\u7684\u5B8C\u6574\u95ED\u73AF\u3002\u4EFB\u4E00\u73AF\u8282\u51FA\u73B0\u9A73\u56DE\u6216\u5F02\u8BAE\uFF0C\u90FD\u4F1A\u56DE\u6D41\u5230\u4E0A\u6E38\u800C\u975E\u5C31\u5730\u7EC8\u6B62\u3002"))) : null, /*#__PURE__*/React.createElement("button", {
      className: "fab-toggle",
      onClick: () => setOpen(!open),
      title: "\u6F14\u793A\u52A8\u7EBF\uFF08\u7B2C 7 \u7AE0 F1\u2013F8\uFF09"
    }, /*#__PURE__*/React.createElement(Icon, {
      n: open ? "x" : "route",
      s: 19
    })));
  }

  /* ============================================================
     平台端
     ============================================================ */
  function PlatformShell({
    app,
    set,
    theme,
    setTheme
  }) {
    const toast = useToast();
    const [collapsed, setCollapsed] = useState(false);
    const [notices, setNotices] = useState(false);
    const [proj, setProj] = useState(false);
    const dom = D.DOMAINS.filter(d => d.id === app.domain)[0] || D.DOMAINS[0];
    // 窄屏抽屉导航：选中任意一项后自动收起，避免遮挡内容
    const closeNav = () => {
      if (app.navOpen) set({
        navOpen: false
      });
    };
    return /*#__PURE__*/React.createElement(React.Fragment, null, app.navOpen ? /*#__PURE__*/React.createElement("div", {
      className: "nav-scrim",
      onClick: closeNav,
      "aria-hidden": "true"
    }) : null, /*#__PURE__*/React.createElement("div", {
      className: cls("nav", collapsed && "collapsed", app.navOpen && "open")
    }, /*#__PURE__*/React.createElement("div", {
      className: "nav-scroll"
    }, D.DOMAINS.map(d => {
      const on = d.id === app.domain;
      return /*#__PURE__*/React.createElement("div", {
        key: d.id
      }, /*#__PURE__*/React.createElement("button", {
        className: cls("nav-item", on && "active"),
        onClick: () => {
          set({
            domain: d.id,
            page: d.children[0].id,
            payload: {}
          });
          closeNav();
        },
        title: collapsed ? d.name : undefined
      }, /*#__PURE__*/React.createElement("span", {
        className: "nav-ico",
        style: {
          color: on ? d.color : undefined
        }
      }, /*#__PURE__*/React.createElement(Icon, {
        n: d.icon,
        s: 15
      })), /*#__PURE__*/React.createElement("span", {
        className: "nav-label"
      }, d.name), d.children.some(c => c.badge) ? /*#__PURE__*/React.createElement("span", {
        className: "nav-badge",
        style: {
          color: "var(--danger)"
        }
      }, "!") : null), on && !collapsed ? /*#__PURE__*/React.createElement("div", {
        className: "nav-sub"
      }, d.children.map(c => /*#__PURE__*/React.createElement("button", {
        key: c.id,
        className: cls("nav-item", c.id === app.page && "active"),
        onClick: () => {
          set({
            page: c.id,
            payload: {}
          });
          closeNav();
        }
      }, /*#__PURE__*/React.createElement("span", {
        className: "sub-dot"
      }), /*#__PURE__*/React.createElement("span", {
        className: "nav-label"
      }, c.name), c.tag ? /*#__PURE__*/React.createElement("span", {
        className: "nav-badge",
        style: {
          color: c.badge ? "var(--danger)" : undefined
        }
      }, c.tag) : null)), d.id === "config" ? /*#__PURE__*/React.createElement("button", {
        className: cls("nav-item", app.page === "acceptance" && "active"),
        onClick: () => {
          set({
            page: "acceptance",
            payload: {}
          });
          closeNav();
        }
      }, /*#__PURE__*/React.createElement("span", {
        className: "sub-dot"
      }), /*#__PURE__*/React.createElement("span", {
        className: "nav-label"
      }, "\u8BBE\u8BA1\u9A8C\u6536\u6E05\u5355"), /*#__PURE__*/React.createElement("span", {
        className: "nav-badge"
      }, "23")) : null) : null);
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        padding: 8,
        borderTop: "1px solid var(--line-soft)"
      }
    }, /*#__PURE__*/React.createElement("button", {
      className: "nav-item",
      onClick: () => setCollapsed(!collapsed),
      title: collapsed ? "展开导航" : "收起导航"
    }, /*#__PURE__*/React.createElement("span", {
      className: "nav-ico"
    }, /*#__PURE__*/React.createElement(Icon, {
      n: "panelLeft",
      s: 15
    })), /*#__PURE__*/React.createElement("span", {
      className: "nav-label"
    }, "\u6536\u8D77\u5BFC\u822A")))), /*#__PURE__*/React.createElement("main", {
      className: "main"
    }, renderPlatform(app, set)));
  }

  /* ============================================================
     根组件
     ============================================================ */
  function Root() {
    const toast = useToast();
    const [app, setApp] = useState({
      end: "platform",
      domain: "production",
      page: "overview",
      payload: {},
      basket: ["CLP-81204", "CLP-81211"],
      flow: null,
      qcId: D.QC_QUEUE[0].id
    });
    const [theme, setTheme] = useState("dark");
    const [guide, setGuide] = useState(false);
    const [notices, setNotices] = useState(false);
    const [proj, setProj] = useState(false);
    const [help, setHelp] = useState(false);
    const [gq, setGq] = useState("");
    const gsearchRef = useRef(null);
    const set = p => setApp(v => Object.assign({}, v, p));
    useEffect(() => {
      document.documentElement.setAttribute("data-theme", theme);
    }, [theme]);

    // ⌘K / Ctrl+K 聚焦顶栏检索；这是顶栏检索存在的意义，不能只是个装饰
    useEffect(() => {
      const h = e => {
        if ((e.metaKey || e.ctrlKey) && (e.key === "k" || e.key === "K")) {
          e.preventDefault();
          if (gsearchRef.current) gsearchRef.current.focus();
        }
      };
      window.addEventListener("keydown", h);
      return () => window.removeEventListener("keydown", h);
    }, []);
    useEffect(() => {
      const h = e => {
        const tag = (e.target.tagName || "").toLowerCase();
        if (tag === "input" || tag === "textarea") return;
        if (e.key === "Escape") {
          setNotices(false);
          setProj(false);
        }
      };
      window.addEventListener("keydown", h);
      return () => window.removeEventListener("keydown", h);
    }, []);
    const goFlow = f => {
      if (f.to[0] === "capture") set({
        end: "capture",
        flow: f.id
      });else if (f.to[0] === "delivery") set({
        end: "portal",
        flow: f.id
      });else set({
        end: "platform",
        domain: f.to[0],
        page: f.to[1],
        payload: {},
        flow: f.id
      });
    };
    const topbar = /*#__PURE__*/React.createElement("header", {
      className: "topbar"
    }, /*#__PURE__*/React.createElement("button", {
      className: "topbar-burger",
      "aria-label": "\u6253\u5F00\u5BFC\u822A",
      "aria-expanded": !!app.navOpen,
      onClick: () => set({
        navOpen: !app.navOpen
      })
    }, /*#__PURE__*/React.createElement(Icon, {
      n: app.navOpen ? "x" : "menu",
      s: 18
    })), /*#__PURE__*/React.createElement("div", {
      className: "brand"
    }, /*#__PURE__*/React.createElement("span", {
      className: "brand-mark"
    }, /*#__PURE__*/React.createElement(Icon, {
      n: "cube",
      s: 15
    })), /*#__PURE__*/React.createElement("span", {
      className: "brand-text"
    }, /*#__PURE__*/React.createElement("span", {
      className: "brand-title"
    }, "\u5177\u8EAB\u667A\u80FD\u6570\u636E\u751F\u4EA7\u5E73\u53F0"), /*#__PURE__*/React.createElement("span", {
      className: "brand-sub"
    }, "Embodied Data Foundry"))), /*#__PURE__*/React.createElement("div", {
      className: "topbar-sep"
    }), /*#__PURE__*/React.createElement("div", {
      className: "endswitch",
      role: "group",
      "aria-label": "\u5207\u6362\u7AEF"
    }, [["platform", "平台端", "monitor"], ["capture", "采集端", "smartphone"], ["portal", "客户门户", "globe"]].map(([k, n, ic]) => /*#__PURE__*/React.createElement("button", {
      key: k,
      "aria-pressed": app.end === k,
      onClick: () => set({
        end: k,
        navOpen: false
      })
    }, /*#__PURE__*/React.createElement("span", {
      className: "row",
      style: {
        gap: 6
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      n: ic,
      s: 13
    }), n)))), app.end === "platform" ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("form", {
      className: "gsearch",
      role: "search",
      onSubmit: e => {
        e.preventDefault();
        const v = gq.trim();
        set({
          domain: "production",
          page: "search",
          payload: v ? {
            q: v
          } : {}
        });
        if (v) toast.push({
          tone: "info",
          title: "已按「" + v + "」检索",
          desc: "自然语言已翻译为结构化条件，可在检索页逐项修改。"
        });
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      n: "search",
      s: 14,
      style: {
        flex: "0 0 auto"
      }
    }), /*#__PURE__*/React.createElement("input", {
      ref: gsearchRef,
      value: gq,
      onChange: e => setGq(e.target.value),
      placeholder: "\u641C\u7D22\u4EFB\u52A1 \xB7 \u6279\u6B21 \xB7 \u6570\u636E\u7247\u6BB5",
      "aria-label": "\u5168\u5C40\u68C0\u7D22\uFF0C\u56DE\u8F66\u6267\u884C"
    }), /*#__PURE__*/React.createElement("span", {
      className: "codechip",
      style: {
        flex: "0 0 auto"
      }
    }, "\u2318K")), /*#__PURE__*/React.createElement("div", {
      className: "topbar-sep"
    }), /*#__PURE__*/React.createElement("button", {
      className: "btn btn-sm topbar-basket",
      onClick: () => set({
        end: "platform",
        domain: "production",
        page: "search"
      }),
      title: "\u9009\u62E9\u7BEE\u8DE8\u9875\u7D2F\u79EF\uFF0C\u5165\u53E3\u5728\u9876\u680F\u5E38\u9A7B\u5E76\u663E\u793A\u5B9E\u65F6\u8BA1\u6570"
    }, /*#__PURE__*/React.createElement(Icon, {
      n: "basket",
      s: 13
    }), " ", /*#__PURE__*/React.createElement("span", {
      className: "basket-label"
    }, "\u9009\u62E9\u7BEE"), /*#__PURE__*/React.createElement("span", {
      className: "mono",
      style: {
        background: "var(--accent)",
        color: "#fff",
        borderRadius: 3,
        padding: "0 5px",
        height: 16,
        lineHeight: "16px",
        fontSize: 10
      }
    }, app.basket.length))) : /*#__PURE__*/React.createElement("div", {
      className: "grow"
    }), /*#__PURE__*/React.createElement("span", {
      className: "grow"
    }), /*#__PURE__*/React.createElement("button", {
      className: "btn btn-sm topbar-proj",
      onClick: () => setProj(!proj)
    }, /*#__PURE__*/React.createElement(Icon, {
      n: "folder",
      s: 13
    }), " \u6052\u7ACB\u673A\u5668\u4EBA \xB7 B01 ", /*#__PURE__*/React.createElement(Icon, {
      n: "chevDown",
      s: 11
    })), /*#__PURE__*/React.createElement(IconBtn, {
      n: theme === "dark" ? "sun" : "moon",
      s: 16,
      title: theme === "dark" ? "切换到明色主题" : "切换到暗色主题",
      onClick: () => setTheme(theme === "dark" ? "light" : "dark")
    }), /*#__PURE__*/React.createElement(IconBtn, {
      n: "info",
      s: 16,
      title: "\u5173\u4E8E\u8BE5\u539F\u578B",
      className: "topbar-info",
      onClick: () => setHelp(true)
    }), /*#__PURE__*/React.createElement(IconBtn, {
      n: "bell",
      s: 16,
      title: "\u901A\u77E5",
      badge: "5",
      onClick: () => setNotices(!notices)
    }), /*#__PURE__*/React.createElement("span", {
      className: "topbar-avatar",
      style: {
        width: 26,
        height: 26,
        borderRadius: 13,
        background: "var(--surface-3)",
        display: "grid",
        placeItems: "center",
        fontSize: 11,
        fontFamily: "var(--font-mono)",
        color: "var(--text-2)"
      }
    }, "\u5468"), notices ? /*#__PURE__*/React.createElement(NoticePanel, {
      onGo: p => set(p),
      onClose: () => setNotices(false)
    }) : null, proj ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
      style: {
        position: "fixed",
        inset: 0,
        zIndex: 55
      },
      onClick: () => setProj(false)
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        position: "absolute",
        top: 46,
        right: 88,
        width: 268,
        zIndex: 60,
        background: "var(--surface-1)",
        border: "1px solid var(--line-strong)",
        borderRadius: 6,
        boxShadow: "var(--shadow-pop)",
        overflow: "hidden"
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "panel-head",
      style: {
        minHeight: 36
      }
    }, /*#__PURE__*/React.createElement("span", {
      className: "panel-title"
    }, "\u5207\u6362\u9879\u76EE"), /*#__PURE__*/React.createElement("span", {
      className: "panel-sub"
    }, "\u5BA2\u6237\u6570\u636E\u76F8\u4E92\u9694\u79BB")), [["恒立机器人 · B01", "人形双臂数据线", true], ["瀚海工业 · B02", "仓储与四足巡检", false], ["拓元精密 · B03", "产线装配力控", false], ["灵犀具身 · B04", "商用厨房长时序", false]].map(p => /*#__PURE__*/React.createElement("button", {
      key: p[0],
      className: "listitem",
      onClick: () => {
        setProj(false);
        toast.push({
          tone: p[2] ? "ok" : "warn",
          title: p[2] ? "已切换到 " + p[0] : "无法切换项目",
          desc: p[2] ? "看板与列表数据已按该项目口径重新拉取。" : "按 G1.2 多租户与客户隔离，客户间数据不可见、不可搜、不可导。该账号无 B02 的访问权限，可向项目管理员申请。"
        });
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "spread"
    }, /*#__PURE__*/React.createElement("span", {
      className: "small",
      style: {
        fontWeight: 600
      }
    }, p[0]), p[2] ? /*#__PURE__*/React.createElement(Tag, {
      tone: "accent",
      icon: "check"
    }, "\u5F53\u524D") : /*#__PURE__*/React.createElement(Tag, {
      tone: "quiet",
      icon: "lock"
    }, "\u9694\u79BB")), /*#__PURE__*/React.createElement("div", {
      className: "tiny muted-3",
      style: {
        marginTop: 3
      }
    }, p[1]))))) : null);
    function unusedToastHint() {}
    return /*#__PURE__*/React.createElement("div", {
      className: "app"
    }, topbar, /*#__PURE__*/React.createElement("div", {
      className: "body"
    }, /*#__PURE__*/React.createElement(ErrorBoundary, {
      k: app.end + "-" + app.domain + "-" + app.page + "-" + app.flow
    }, app.end === "platform" ? /*#__PURE__*/React.createElement(PlatformShell, {
      app: app,
      set: set,
      theme: theme,
      setTheme: setTheme
    }) : null, app.end === "capture" ? /*#__PURE__*/React.createElement("div", {
      className: "stage",
      style: {
        width: "100%"
      }
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      className: "phone"
    }, /*#__PURE__*/React.createElement("div", {
      className: "phone-screen"
    }, /*#__PURE__*/React.createElement(window.CAPTURE.CaptureApp, null))), /*#__PURE__*/React.createElement("div", {
      className: "phone-caption"
    }, "\u91C7\u96C6\u7AEF \xB7 \u79FB\u52A8\u4F18\u5148 \xB7 \u652F\u6301\u684C\u9762\u6D4F\u89C8\uFF08\u6E90\uFF1A5.1 \u4E09\u7AEF\u5206\u5DE5\uFF09"))) : null, app.end === "portal" ? /*#__PURE__*/React.createElement("div", {
      className: "stage",
      style: {
        width: "100%"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: "min(1240px,100%)"
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "window"
    }, /*#__PURE__*/React.createElement("div", {
      className: "window-bar"
    }, /*#__PURE__*/React.createElement("span", {
      className: "window-dots"
    }, /*#__PURE__*/React.createElement("i", null), /*#__PURE__*/React.createElement("i", null), /*#__PURE__*/React.createElement("i", null)), /*#__PURE__*/React.createElement("span", {
      className: "window-url"
    }, /*#__PURE__*/React.createElement(Icon, {
      n: "lock",
      s: 11
    }), " portal.embodied-data.example / projects / B01"), /*#__PURE__*/React.createElement(Tag, {
      tone: "quiet",
      icon: "eye"
    }, "\u5916\u90E8\u53EA\u8BFB")), /*#__PURE__*/React.createElement("div", {
      className: "window-body"
    }, /*#__PURE__*/React.createElement(window.PORTAL.PortalApp, null))), /*#__PURE__*/React.createElement("div", {
      className: "phone-caption",
      style: {
        marginTop: 12
      }
    }, "\u5BA2\u6237\u95E8\u6237 \xB7 \u684C\u9762 Web \xB7 \u5916\u90E8\u53EA\u8BFB\uFF08\u6E90\uFF1A5.1 / 7.8\uFF09"))) : null)), app.end === "platform" ? /*#__PURE__*/React.createElement(FlowGuide, {
      app: app,
      onGo: goFlow,
      open: guide,
      setOpen: setGuide
    }) : null, help ? /*#__PURE__*/React.createElement(HelpModal, {
      onClose: () => setHelp(false)
    }) : null);
  }

  /* ---------- 关于弹层 ---------- */
  function HelpModal({
    onClose
  }) {
    const [tab, setTab] = useState("范围");
    return /*#__PURE__*/React.createElement(Modal, {
      title: "\u5173\u4E8E\u8FD9\u4EFD\u539F\u578B",
      desc: "\u7531\u300A\u5177\u8EAB\u667A\u80FD\u6570\u636E\u751F\u4EA7\u5E73\u53F0 \u4EA7\u54C1\u8BBE\u8BA1\u6587\u6863\uFF08V1.1 \u589E\u8865\u7248\uFF09\u300B\u76F4\u63A5\u8F6C\u5316\uFF0C\u975E\u901A\u7528\u6A21\u677F\u5957\u7528\u3002",
      onClose: onClose,
      width: 720,
      foot: /*#__PURE__*/React.createElement(Btn, {
        tone: "primary",
        onClick: onClose
      }, "\u5F00\u59CB\u6D4F\u89C8")
    }, /*#__PURE__*/React.createElement("div", {
      className: "row-tight",
      style: {
        gap: 4
      }
    }, ["范围", "设计依据", "怎么演示"].map(t => /*#__PURE__*/React.createElement("button", {
      key: t,
      className: "btn",
      "aria-pressed": tab === t,
      style: tab === t ? {
        background: "var(--surface-3)",
        borderColor: "var(--line-strong)"
      } : null,
      onClick: () => setTab(t)
    }, t))), tab === "范围" ? /*#__PURE__*/React.createElement("div", {
      className: "col",
      style: {
        gap: 12
      }
    }, /*#__PURE__*/React.createElement(DL, {
      rows: [["三端", "平台端（桌面 Web）· 采集端（移动优先）· 客户门户（外部只读）"], ["平台端页面", "总览看板 · 任务与详情 · 上传与校验 · 质检台 · 规则配置 · 标注工作台 · 配方编辑器 · 快照 · 交付 · 检索 · 数据浏览器 · 仿真 / 看板 / 安全 / 配置各域"], ["覆盖流程", "第 7 章 F1–F8 全部八条，可用右下角「演示动线」逐条走查"], ["覆盖规范", "第 9 章状态反馈与四态、批量操作、通知分级、危险操作确认、播放器快捷键"], ["覆盖清单", "第 10 章 27 项异常（总览看板内可查）与第 11 章 23 项验收（配置域 → 设计验收清单）"]]
    }), /*#__PURE__*/React.createElement("div", {
      className: "warnbox info"
    }, "\u672C\u539F\u578B\u7684\u5BA2\u6237\u3001\u4EFB\u52A1\u3001\u4EBA\u5458\u3001\u6570\u503C\u5747\u4E3A\u6F14\u793A\u6570\u636E\uFF1B\u6587\u6863\u4E2D\u6807\u6CE8\u300C\u5F85\u6838\u5B9E\u300D\u7684\u9608\u503C\u5728\u672C\u539F\u578B\u4E2D\u540C\u6837\u53EA\u662F\u793A\u610F\uFF0C\u4E0D\u5F97\u4F5C\u4E3A\u5F00\u53D1\u4F9D\u636E\u3002")) : null, tab === "设计依据" ? /*#__PURE__*/React.createElement("div", {
      className: "col",
      style: {
        gap: 12
      }
    }, /*#__PURE__*/React.createElement(DL, {
      rows: [["设计原则", "P1 每一步有状态有人负责有据可查 · P2 判断尽量前移 · P3 异常必须有出路 · P4 结构化优先 · P5 零培训上手 · P6 数据不搬家"], ["视觉基调", "工业数据控制台：深色石墨底 + 中性冷蓝交互色 + 语义状态色；密排、锐角小圆角、细描边、等宽数字，无渐变与装饰动效"], ["状态语义", "通过 / 有条件通过 / 不通过 / 阻塞 / 转复核 五态配色，全站一致"], ["动效", "仅 150–400ms 状态变化，不做装饰"], ["无障碍", "所有可点区域满足移动端 44px 标准，采集端放大至 1.5 倍"]]
    })) : null, tab === "怎么演示" ? /*#__PURE__*/React.createElement("div", {
      className: "col",
      style: {
        gap: 10
      }
    }, [["顶栏三端切换", "平台端 → 采集端 → 客户门户，同一份数据在三端的不同呈现"], ["右下角演示动线", "点开即列出 F1–F8，点任一条直接跳到对应界面"], ["质检台按顺序敲键盘", "1–5 评分、R 驳回、A 通过、M 打证据、空格播放、← → 逐帧，全程不碰鼠标"], ["采集端作业页", "「我的」里可模拟弱网离线与设备时间不同步；录制到第 3 步 4 秒后质量灯会由黄转红"], ["配方编辑器", "改自然语言、拖拽右侧流水线步骤、点发布快照看二次确认"], ["规则配置台", "改任一行阈值，右侧影响预估与试运行同步更新"]].map(x => /*#__PURE__*/React.createElement("div", {
      key: x[0],
      className: "row",
      style: {
        gap: 10,
        alignItems: "flex-start"
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      n: "arrowRight",
      s: 13,
      style: {
        color: "var(--accent)",
        flex: "0 0 auto",
        marginTop: 3
      }
    }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      className: "small",
      style: {
        fontWeight: 600
      }
    }, x[0]), /*#__PURE__*/React.createElement("div", {
      className: "tiny muted-3",
      style: {
        marginTop: 2,
        lineHeight: 1.65
      }
    }, x[1]))))) : null);
  }

  /* ---------- 错误边界：单页异常不拖垮整站 ---------- */
  class ErrorBoundary extends React.Component {
    constructor(p) {
      super(p);
      this.state = {
        err: null
      };
    }
    static getDerivedStateFromError(err) {
      return {
        err: err
      };
    }
    componentDidUpdate(prev) {
      if (prev.k !== this.props.k && this.state.err) this.setState({
        err: null
      });
    }
    componentDidCatch(err) {
      try {
        console.error("[页面异常]", err);
      } catch (e) {}
    }
    render() {
      if (this.state.err) {
        return /*#__PURE__*/React.createElement("div", {
          className: "stage",
          style: {
            width: "100%"
          }
        }, /*#__PURE__*/React.createElement("div", {
          className: "warnbox danger",
          style: {
            maxWidth: 620
          }
        }, /*#__PURE__*/React.createElement("div", {
          className: "small",
          style: {
            fontWeight: 600,
            marginBottom: 6
          }
        }, "\u8FD9\u4E00\u9875\u6E32\u67D3\u65F6\u51FA\u4E86\u95EE\u9898"), /*#__PURE__*/React.createElement("div", {
          className: "tiny",
          style: {
            lineHeight: 1.7,
            marginBottom: 10,
            fontFamily: "var(--mono)"
          }
        }, String(this.state.err && this.state.err.message ? this.state.err.message : this.state.err)), /*#__PURE__*/React.createElement("div", {
          className: "tiny muted-3"
        }, "\u5176\u4F59\u9875\u9762\u4ECD\u53EF\u6B63\u5E38\u6D4F\u89C8\u3002\u5207\u5230\u522B\u7684\u9875\u9762\u4F1A\u81EA\u52A8\u6062\u590D\uFF1B\u82E5\u9700\u91CD\u8BD5\u5F53\u524D\u9875\uFF0C\u70B9\u4E0B\u65B9\u6309\u94AE\u3002"), /*#__PURE__*/React.createElement("div", {
          style: {
            marginTop: 12
          }
        }, /*#__PURE__*/React.createElement(Btn, {
          size: "sm",
          icon: "refresh",
          onClick: () => this.setState({
            err: null
          })
        }, "\u91CD\u8BD5\u672C\u9875"))));
      }
      return this.props.children;
    }
  }
  ReactDOM.createRoot(document.getElementById("root")).render(/*#__PURE__*/React.createElement(ToastHost, null, /*#__PURE__*/React.createElement(Root, null)));
})();