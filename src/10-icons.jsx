/* ============================================================
   图标库 · 24×24 线性描边，currentColor
   统一 1.6px 描边、round 端点，与 13px 正文并置时不抢视线
   ============================================================ */
(function () {
  const P = {
    /* --- 导航 / 业务域 --- */
    production: "M3 7.5 12 3l9 4.5v9L12 21l-9-4.5v-9ZM3 7.5 12 12l9-4.5M12 12v9",
    quality: "M12 3l7 3v5.2c0 4.2-2.9 8-7 9.3-4.1-1.3-7-5.1-7-9.3V6l7-3ZM9 12l2 2 4-4.2",
    annotate: "M4 5h16v9H8.6L4 17.6V5Z M8 9h8",
    dataset: "M12 3c4.4 0 8 1.3 8 3s-3.6 3-8 3-8-1.3-8-3 3.6-3 8-3ZM4 6v12c0 1.7 3.6 3 8 3s8-1.3 8-3V6M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3",
    sim: "M12 3 21 8v8l-9 5-9-5V8l9-5ZM3.4 8.1 12 13l8.6-4.9M12 13v8.6",
    chart: "M4 20V10M10 20V4M16 20v-7M22 20H2",
    security: "M12 3l7 3v5.2c0 4.2-2.9 8-7 9.3-4.1-1.3-7-5.1-7-9.3V6l7-3ZM12 11v3.5M12 8.4h.01",
    settings: "M4 7h10M18 7h2M4 17h2M10 17h10M4 12h4M12 12h8M16 5v4M8 15v4M10 10v4",
    /* --- 操作 --- */
    search: "M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14ZM20 20l-4.2-4.2",
    bell: "M6 9a6 6 0 0 1 12 0c0 4 1.5 5.5 1.5 5.5h-15S6 13 6 9ZM10 18a2 2 0 0 0 4 0",
    basket: "M4 8h16l-1.7 9.2A2 2 0 0 1 16.3 19H7.7a2 2 0 0 1-2-1.8L4 8ZM9 8V6.5a3 3 0 0 1 6 0V8",
    plus: "M12 5v14M5 12h14",
    minus: "M5 12h14",
    x: "M6 6l12 12M18 6L6 18",
    check: "M4.5 12.5 9.5 17.5 19.5 6.5",
    chevDown: "M6 9.5l6 6 6-6",
    chevRight: "M9.5 6l6 6-6 6",
    chevLeft: "M14.5 6l-6 6 6 6",
    arrowRight: "M4 12h15M13 6l6 6-6 6",
    arrowLeft: "M20 12H5M11 6l-6 6 6 6",
    arrowUp: "M12 20V5M6 11l6-6 6 6",
    arrowDown: "M12 4v15M6 13l6 6 6-6",
    more: "M6 12h.01M12 12h.01M18 12h.01",
    play: "M8 5.5v13l11-6.5-11-6.5Z",
    pause: "M9 5v14M15 5v14",
    stop: "M6 6h12v12H6z",
    stepBack: "M18 5.5v13L8 12l10-6.5ZM6 5v14",
    stepFwd: "M6 5.5v13L16 12 6 5.5ZM18 5v14",
    skipBack: "M18 6v12l-8-6 8-6ZM6 6v12",
    maximize: "M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5",
    flag: "M6 21V4M6 4h11l-1.6 4L17 12H6",
    bookmark: "M7 4h10v17l-5-4-5 4V4Z",
    filter: "M4 5h16l-6.2 7.3V20l-3.6-2v-5.7L4 5Z",
    sort: "M7 4v16M7 20l-3-3M7 4l3 3M17 20V4M17 4l3 3M17 20l-3-3",
    download: "M12 4v11M7 10.5l5 5 5-5M5 20h14",
    upload: "M12 15V4M7 8.5l5-5 5 5M5 20h14",
    refresh: "M20 12a8 8 0 1 1-2.6-5.9M20 4v4h-4",
    trash: "M5 7h14M9 7V4.5h6V7M7 7l1 13h8l1-13M10.5 11v5.5M13.5 11v5.5",
    edit: "M4 20h4L19.5 8.5a2.1 2.1 0 0 0-3-3L5 17v3ZM15 6l3 3",
    copy: "M9 9h9v11H9zM6 15H4V4h11v2",
    link: "M9.5 14.5 14.5 9.5M10 6.5 11.8 4.7a4 4 0 0 1 5.6 5.6L15.6 12M8.4 12 6.7 13.7a4 4 0 0 0 5.6 5.6L14 17.5",
    external: "M14 4h6v6M20 4l-8 8M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5",
    keyboard: "M3 7h18v10H3zM7 11h.01M11 11h.01M15 11h.01M7 14h9",
    eye: "M2.5 12S6 5.8 12 5.8 21.5 12 21.5 12 18 18.2 12 18.2 2.5 12 2.5 12ZM12 9.2a2.8 2.8 0 1 0 0 5.6 2.8 2.8 0 0 0 0-5.6Z",
    eyeOff: "M4 4l16 16M9.6 5.9A9.7 9.7 0 0 1 12 5.8c6 0 9.5 6.2 9.5 6.2a17 17 0 0 1-3.2 3.9M6.3 8.2A17 17 0 0 0 2.5 12S6 18.2 12 18.2c1.1 0 2.1-.2 3-.6M10 10.2a2.8 2.8 0 0 0 3.7 3.8",
    /* --- 状态 / 提示 --- */
    info: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18ZM12 11v5.5M12 7.8h.01",
    warn: "M12 4 3 19.5h18L12 4ZM12 10v4M12 16.6h.01",
    block: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18ZM8 12h8",
    danger: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18ZM9 9l6 6M15 9l-6 6",
    clock: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18ZM12 7.5V12l3.2 2",
    calendar: "M4 6h16v14H4zM4 10h16M8.5 4v3M15.5 4v3",
    target: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18ZM12 7.6a4.4 4.4 0 1 0 0 8.8 4.4 4.4 0 0 0 0-8.8ZM12 11.4a.6.6 0 1 0 0 1.2.6.6 0 0 0 0-1.2Z",
    activity: "M3 12h4l2.5-7 5 14L17 12h4",
    zap: "M13 3 5 13.5h5.5L10.5 21 19 10.5h-6L13 3Z",
    gauge: "M12 20a8 8 0 1 1 8-8M12 12l4.2-2.8",
    cpu: "M7 7h10v10H7zM4 10h3M4 14h3M17 10h3M17 14h3M10 4v3M14 4v3M10 17v3M14 17v3",
    wifiOff: "M3 4l18 18M9.5 16.4a3.6 3.6 0 0 1 5 0M6.2 13.1a8 8 0 0 1 3.4-1.9M13.8 10.9A8 8 0 0 1 21 12.2M12 20h.01",
    cloudOff: "M6.5 18h10.2a3.8 3.8 0 0 0 .7-7.5 5.6 5.6 0 0 0-9.5-2.3M9 20h6M4 4l16 16",
    lock: "M6 11h12v9H6zM9 11V8a3 3 0 0 1 6 0v3M12 15v2",
    shield: "M12 3l7 3v5.2c0 4.2-2.9 8-7 9.3-4.1-1.3-7-5.1-7-9.3V6l7-3Z",
    branch: "M7 4v12a3 3 0 0 0 3 3h3M7 4a2 2 0 1 0 0-.01M17 7a2 2 0 1 0 0-.01M17 7v3.4a2.6 2.6 0 0 1-2.6 2.6H10M7 20a2 2 0 1 0 0-.01",
    /* --- 实体 --- */
    user: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM5 20.5c.9-3.2 3.6-5 7-5s6.1 1.8 7 5",
    users: "M9 12a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7ZM2.5 19.5c.8-2.8 3.2-4.4 6.5-4.4s5.7 1.6 6.5 4.4M16 5.4a3.5 3.5 0 0 1 0 6.9M17.5 15.2c2.1.4 3.6 1.8 4 4.3",
    robot: "M6 8h12v11H6zM12 4v4M9.5 12.5h.01M14.5 12.5h.01M9.5 16h5M3 12v4M21 12v4",
    hand: "M8 12V6.2a1.4 1.4 0 0 1 2.8 0V11M10.8 11V5.2a1.4 1.4 0 0 1 2.8 0V11M13.6 11V6.4a1.4 1.4 0 0 1 2.8 0V13M16.4 13v-2a1.4 1.4 0 0 1 2.8 0v3.4c0 3.6-2.5 6.1-5.9 6.1h-1.4a5.3 5.3 0 0 1-4-1.9l-3.3-4a1.4 1.4 0 0 1 2.1-1.8l1.5 1.4",
    cube: "M12 3 21 8v8l-9 5-9-5V8l9-5ZM3.4 8.1 12 13l8.6-4.9M12 13v8.6",
    layers: "M12 3 3 7.6l9 4.6 9-4.6L12 3ZM3 12.4 12 17l9-4.6M3 16.8 12 21.4l9-4.6",
    folder: "M3 6h6l2 2.4h10V19H3V6Z",
    file: "M6 3h7.5L19 8.5V21H6V3ZM13 3v6h6",
    pin: "M12 21s6.5-6.2 6.5-10.6A6.5 6.5 0 0 0 5.5 10.4C5.5 14.8 12 21 12 21ZM12 8.2a2.3 2.3 0 1 0 0 4.6 2.3 2.3 0 0 0 0-4.6Z",
    monitor: "M3 5h18v11H3zM9 20h6M12 16v4",
    smartphone: "M7 3h10v18H7zM11 18h2",
    globe: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18ZM3.4 9.5h17.2M3.4 14.5h17.2M12 3c2.6 3.4 2.6 14.2 0 18M12 3c-2.6 3.4-2.6 14.2 0 18",
    sun: "M12 6.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM12 2v2.2M12 19.8V22M2 12h2.2M19.8 12H22M5 5l1.6 1.6M17.4 17.4 19 19M19 5l-1.6 1.6M6.6 17.4 5 19",
    moon: "M15.5 3.5a8.6 8.6 0 1 0 5 14.6A9 9 0 0 1 15.5 3.5Z",
    panelLeft: "M3 4h18v16H3zM9.5 4v16",
    menu: "M4 7h16M4 12h16M4 17h16",
    grid: "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z",
    list: "M4 6h2M9 6h11M4 12h2M9 12h11M4 18h2M9 18h11",
    send: "M21 3 3 10.4l7.2 2.4L12.6 20 21 3ZM10.2 12.8 21 3",
    message: "M4 5h16v11H9l-5 4V5Z",
    route: "M6 19a2 2 0 1 0 0-.01M18 5a2 2 0 1 0 0-.01M6 17V11a3 3 0 0 1 3-3h6a3 3 0 0 0 3-3",
    handshake: "M4 12.5 8 8.5h4l3 3h3.5M20 12.5 16 16.5h-3l-2 2-2-2-2 2-3-3",
    receipt: "M6 3h12v18l-3-2-3 2-3-2-3 2V3ZM9.5 8h5M9.5 12h5",
    signature: "M4 17c3.5 0 4-9 7.5-9 2.5 0 2.5 4 5 4 1.5 0 2.4-.6 3.5-1.6M4 20.5h16",
    /* --- 开放接口 / API --- */
    code: "M9 8.4 5.6 12 9 15.6M15 8.4 18.4 12 15 15.6M13.2 6.4l-2.4 11.2",
    key: "M15 4a5 5 0 1 0 0 10 5 5 0 0 0 0-10ZM15 9h.01M11.4 11.4 4.5 18.3V20h1.7l.9-.9v-1.3h1.3l.9-.9v-1.3h1.3l.9-.9",
    webhook: "M12 4.2a2.4 2.4 0 1 0 0 4.8 2.4 2.4 0 0 0 0-4.8M5.4 15a2.4 2.4 0 1 0 0 4.8 2.4 2.4 0 0 0 0-4.8M18.6 15a2.4 2.4 0 1 0 0 4.8 2.4 2.4 0 0 0 0-4.8M10.8 8.9 6.6 15.2M13.2 8.9l4.2 6.3M7.8 17.4h8.4",
    server: "M4 4.5h16v6H4zM4 13.5h16v6H4zM7.5 7.5h.01M7.5 16.5h.01M11 7.5h5M11 16.5h5",
    sunrise: "M12 3v4M5.6 9.6 4.2 8.2M18.4 9.6l1.4-1.4M2.5 18h19M6 18a6 6 0 0 1 12 0M9.5 6.5 12 4l2.5 2.5",
  };

  function Icon({ n, s = 16, sw = 1.6, style, className }) {
    const d = P[n];
    if (!d) {
      return React.createElement("svg", { width: s, height: s, viewBox: "0 0 24 24", className, style });
    }
    return React.createElement(
      "svg",
      {
        width: s, height: s, viewBox: "0 0 24 24", fill: "none",
        stroke: "currentColor", strokeWidth: sw, strokeLinecap: "round", strokeLinejoin: "round",
        className, style, "aria-hidden": "true",
      },
      React.createElement("path", { d })
    );
  }

  /* 实心小圆点图形（用于状态标记，避免彩点噪声） */
  function Glyph({ kind, s = 12 }) {
    const map = {
      ok: "M4.5 12.5 9 17l10.5-10.5",
      warn: "M12 4.5 3.5 19.5h17L12 4.5ZM12 10v4.2M12 16.6h.01",
      danger: "M6 6l12 12M18 6 6 18",
      block: "M5.5 12h13",
      review: "M12 6.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM12 9.4v3.4l2.2 1.4",
    };
    return React.createElement(
      "svg",
      { width: s, height: s, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor",
        strokeWidth: 2.2, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true" },
      React.createElement("path", { d: map[kind] || map.ok })
    );
  }

  window.Icon = Icon;
  window.Glyph = Glyph;
  window.ICON_PATHS = P;
})();
