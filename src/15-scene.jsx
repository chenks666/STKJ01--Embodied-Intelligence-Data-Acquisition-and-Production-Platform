/* ============================================================
   合成采集画面 · 纯 SVG 生成的「多路机位」示意
   用于播放器、数据浏览器、质检台与标注画布，避免引用外部素材
   ============================================================ */
(function () {
  const clamp01 = (x) => (x < 0 ? 0 : x > 1 ? 1 : x);
  const lerp = (a, b, t) => a + (b - a) * t;
  const ease = (x) => (x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2);

  /* 确定性伪随机，保证每次渲染一致 */
  function rng(seed) {
    let s = seed >>> 0;
    return function () {
      s = (s * 1664525 + 1013904223) >>> 0;
      return s / 4294967296;
    };
  }

  /* 平面二连杆逆解，用于让机械臂末端跟随轨迹 */
  function ik(tx, ty, ox, oy, l1, l2) {
    const dx = tx - ox, dy = ty - oy;
    let d = Math.hypot(dx, dy);
    d = Math.min(d, l1 + l2 - 1);
    d = Math.max(d, Math.abs(l1 - l2) + 1);
    const base = Math.atan2(dy, dx);
    const c = (d * d + l1 * l1 - l2 * l2) / (2 * d * l1);
    const A = Math.acos(Math.max(-1, Math.min(1, c)));
    const th1 = base - A;
    const jx = ox + l1 * Math.cos(th1), jy = oy + l1 * Math.sin(th1);
    const th2 = Math.atan2(ty - jy, tx - jx);
    return { jx, jy, th1, th2 };
  }

  /* 末端轨迹关键帧 */
  const EE = [
    [0.00, 58, 66], [0.08, 90, 116], [0.16, 99, 132], [0.26, 101, 110],
    [0.42, 120, 102], [0.56, 148, 114], [0.68, 150, 124], [0.80, 156, 118],
    [0.90, 162, 122], [1.00, 122, 84],
  ];
  function eeAt(t) {
    let i = 0;
    while (i < EE.length - 2 && t > EE[i + 1][0]) i++;
    const a = EE[i], b = EE[i + 1];
    const p = ease(clamp01((t - a[0]) / (b[0] - a[0])));
    return [lerp(a[1], b[1], p), lerp(a[2], b[2], p)];
  }

  /* 布料的四个角随折叠推进而变化 */
  const CLOTH = [
    [0.00, [[62,109],[139,109],[139,159],[62,159]]],
    [0.18, [[62,109],[139,109],[139,159],[62,159]]],
    [0.34, [[62,109],[139,95],[139,148],[62,159]]],
    [0.52, [[62,109],[113,95],[113,145],[62,159]]],
    [0.70, [[62,111],[101,106],[101,142],[62,152]]],
    [0.86, [[156,109],[187,107],[187,125],[156,130]]],
    [1.00, [[158,111],[185,110],[185,124],[158,127]]],
  ];
  function clothAt(t) {
    let i = 0;
    while (i < CLOTH.length - 2 && t > CLOTH[i + 1][0]) i++;
    const a = CLOTH[i], b = CLOTH[i + 1];
    const p = ease(clamp01((t - a[0]) / (b[0] - a[0])));
    return a[1].map((pt, k) => [lerp(pt[0], b[1][k][0], p), lerp(pt[1], b[1][k][1], p)]);
  }
  const poly = (pts) => pts.map((p) => p[0].toFixed(1) + "," + p[1].toFixed(1)).join(" ");

  /* 深度伪彩：近处暖、远处冷 */
  function depthColor(y, yMin, yMax) {
    const u = clamp01((y - yMin) / (yMax - yMin));
    const hue = lerp(205, 14, u);
    const light = lerp(26, 66, u);
    return "hsl(" + hue.toFixed(0) + " 72% " + light.toFixed(0) + "%)";
  }

  /* ---------- 外部机位（Exo）：工作台全貌 + 机械臂 ---------- */
  function Exo({ t, depth }) {
    const [tx, ty] = eeAt(t);
    const arm = ik(tx, ty, 18, 142, 78, 72);
    const cl = clothAt(t);
    const C = (y) => (depth ? depthColor(y, 60, 165) : null);

    return React.createElement(
      "g",
      null,
      /* 背墙与地面 */
      React.createElement("rect", { x: 0, y: 0, width: 320, height: 105, fill: depth ? C(70) : "#12161d" }),
      React.createElement("rect", { x: 0, y: 105, width: 320, height: 75, fill: depth ? C(150) : "#1b212b" }),
      React.createElement("path", {
        d: "M0 105H320", stroke: depth ? "rgba(0,0,0,.25)" : "#2c3441", strokeWidth: 1,
      }),
      /* 台面网格（仅在非深度模式下作为参照） */
      !depth &&
        React.createElement(
          "g",
          { stroke: "#242c38", strokeWidth: 0.6, opacity: 0.55 },
          [0, 1, 2, 3, 4, 5].map((i) =>
            React.createElement("line", { key: "v" + i, x1: 40 + i * 48, y1: 105, x2: 20 + i * 56, y2: 180 })
          ),
          [0, 1].map((i) => React.createElement("line", { key: "h" + i, x1: 0, y1: 130 + i * 26, x2: 320, y2: 130 + i * 26 }))
        ),
      /* 背景陈设：置物架轮廓 */
      React.createElement("rect", { x: 236, y: 26, width: 76, height: 76, fill: depth ? C(50) : "#161b23", stroke: depth ? "none" : "#232a35" }),
      React.createElement("line", { x1: 236, y1: 52, x2: 312, y2: 52, stroke: depth ? "rgba(0,0,0,.2)" : "#232a35" }),
      React.createElement("rect", { x: 246, y: 32, width: 16, height: 14, fill: depth ? C(40) : "#20272f" }),
      React.createElement("rect", { x: 270, y: 34, width: 20, height: 12, fill: depth ? C(40) : "#20272f" }),
      /* 水杯 */
      React.createElement("rect", { x: 44, y: 118, width: 13, height: 20, rx: 2, fill: depth ? C(120) : "#2b333e", stroke: depth ? "none" : "#39424f" }),
      /* 托盘 */
      React.createElement("rect", { x: 128, y: 106, width: 64, height: 24, rx: 2, fill: depth ? C(118) : "#232b35", stroke: depth ? "none" : "#39424f" }),
      React.createElement("rect", { x: 132, y: 109, width: 56, height: 18, rx: 1, fill: depth ? C(122) : "#1b222a" }),
      /* 布料 */
      React.createElement("polygon", {
        points: poly(cl),
        fill: depth ? C(cl[0][1] + 12) : "#3d475a",
        stroke: depth ? "none" : "#5b6981",
        strokeWidth: 0.9,
      }),
      !depth && React.createElement("polyline", { points: poly([cl[0], cl[1]]), fill: "none", stroke: "#6d7d99", strokeWidth: 0.8, strokeDasharray: "3 2" }),
      /* 已折出的折痕 */
      !depth &&
        t > 0.6 &&
        React.createElement("line", {
          x1: lerp(62, 158, clamp01((t - 0.6) / 0.26)), y1: 118,
          x2: lerp(101, 185, clamp01((t - 0.6) / 0.26)), y2: 118,
          stroke: "#6d7d99", strokeWidth: 0.7, strokeDasharray: "2 2",
        }),
      /* 机械臂 */
      React.createElement(
        "g",
        { strokeLinecap: "round", fill: "none" },
        React.createElement("line", { x1: 18, y1: 142, x2: arm.jx, y2: arm.jy, stroke: depth ? C(140) : "#8a94a6", strokeWidth: 7 }),
        React.createElement("line", { x1: arm.jx, y1: arm.jy, x2: tx, y2: ty, stroke: depth ? C(135) : "#a8b3c4", strokeWidth: 5.5 }),
        React.createElement("circle", { cx: 18, cy: 142, r: 8, fill: depth ? C(142) : "#3a4553", stroke: depth ? "none" : "#5b6981", strokeWidth: 1 }),
        React.createElement("circle", { cx: arm.jx, cy: arm.jy, r: 4, fill: depth ? C(138) : "#c6d0de" }),
        /* 夹爪 */
        React.createElement("g", { transform: "translate(" + tx.toFixed(1) + "," + ty.toFixed(1) + ") rotate(" + (arm.th2 * 180 / Math.PI).toFixed(1) + ")" },
          React.createElement("rect", { x: -2, y: -5, width: 9, height: 10, rx: 1.5, fill: depth ? C(134) : "#cdd6e3" }),
          React.createElement("rect", { x: 7, y: -7, width: 8, height: 3, rx: 1, fill: depth ? C(134) : "#e2e8f0" }),
          React.createElement("rect", { x: 7, y: 4, width: 8, height: 3, rx: 1, fill: depth ? C(134) : "#e2e8f0" })
        )
      )
    );
  }

  /* ---------- 第一视角（Ego）：俯视桌面 ---------- */
  function Ego({ t }) {
    const cl = clothAt(t);
    const handY = lerp(176, 118, clamp01(t / 0.2)) ;
    const open = lerp(0, 1, clamp01((t - 0.14) / 0.06));
    const grow = 1 + clamp01((t - 0.5) / 0.4) * 0.1;
    return React.createElement(
      "g",
      null,
      React.createElement("rect", { x: 0, y: 0, width: 320, height: 180, fill: "#1c222b" }),
      /* 桌面木纹走向 */
      React.createElement(
        "g",
        { stroke: "#242c37", strokeWidth: 0.7, opacity: 0.8 },
        [0, 1, 2, 3, 4, 5, 6, 7].map((i) =>
          React.createElement("path", { key: i, d: "M" + (i * 42 - 20) + " 0 Q " + (i * 42 + 6) + " 90 " + (i * 42 - 14) + " 180", fill: "none" })
        )
      ),
      /* 托盘在上方远处 */
      React.createElement("rect", { x: 196, y: 18, width: 86, height: 34, rx: 3, fill: "#232b35", stroke: "#3b4553" }),
      React.createElement("text", { x: 239, y: 39, textAnchor: "middle", fontSize: 9, fill: "#5f6b7c", fontFamily: "var(--font-sans)" }, "托盘"),
      /* 布料 */
      React.createElement("g", { transform: "translate(160,108) scale(" + grow.toFixed(3) + ") translate(-160,-108)" },
        React.createElement("polygon", { points: poly(cl), fill: "#3f4a5d", stroke: "#61708c", strokeWidth: 1.2 }),
        React.createElement("polygon", { points: poly([cl[0], cl[1], [(cl[1][0] + cl[2][0]) / 2, (cl[1][1] + cl[2][1]) / 2], [(cl[0][0] + cl[3][0]) / 2, (cl[0][1] + cl[3][1]) / 2]]), fill: "#46536a", opacity: 0.55 })
      ),
      /* 双手（第一视角） */
      React.createElement(
        "g",
        { fill: "#c9a88a", stroke: "#8e6f56", strokeWidth: 1 },
        React.createElement("g", { transform: "translate(" + (-4 - open * 10) + "," + handY.toFixed(1) + ")" },
          React.createElement("rect", { x: 0, y: 0, width: 46, height: 62, rx: 14 }),
          React.createElement("rect", { x: 20, y: -10, width: 30, height: 12, rx: 6, transform: "rotate(-12 20 0)" }),
          React.createElement("rect", { x: 30, y: -2, width: 34, height: 11, rx: 5.5, transform: "rotate(-4 30 0)" })
        ),
        React.createElement("g", { transform: "translate(" + (296 + open * 10) + "," + handY.toFixed(1) + ")" },
          React.createElement("rect", { x: -46, y: 0, width: 46, height: 62, rx: 14 }),
          React.createElement("rect", { x: -50, y: -10, width: 30, height: 12, rx: 6, transform: "rotate(12 0 0)" }),
          React.createElement("rect", { x: -64, y: -2, width: 34, height: 11, rx: 5.5, transform: "rotate(4 0 0)" })
        )
      ),
      /* 头部机位轻微鱼眼暗示 */
      React.createElement("rect", { x: 0, y: 0, width: 320, height: 180, fill: "none", stroke: "rgba(0,0,0,.5)", strokeWidth: 22 })
    );
  }

  /* ---------- 腕部机位：夹爪特写 ---------- */
  function Wrist({ t }) {
    const gap = lerp(30, 8, clamp01((t - 0.14) / 0.1)) + lerp(0, 6, clamp01((t - 0.7) / 0.2));
    const cl = clothAt(t);
    return React.createElement(
      "g",
      null,
      React.createElement("rect", { x: 0, y: 0, width: 320, height: 180, fill: "#171d25" }),
      React.createElement("polygon", {
        points: poly(cl.map((p) => [p[0] * 1.5 + 10, p[1] * 0.72 + 28])),
        fill: "#39445496", stroke: "#63718c", strokeWidth: 1.4,
      }),
      React.createElement("rect", { x: 0, y: 0, width: 320, height: 180, fill: "none", stroke: "#0b0e13", strokeWidth: 30 }),
      React.createElement(
        "g",
        { fill: "#b9c3d0", stroke: "#7d8898", strokeWidth: 1 },
        React.createElement("rect", { x: 128, y: 20, width: 64, height: 42, rx: 6 }),
        React.createElement("rect", { x: 130, y: 60, width: 16, height: 78 + gap, rx: 4 }),
        React.createElement("rect", { x: 174, y: 60, width: 16, height: 78 + gap, rx: 4 }),
        React.createElement("rect", { x: 138, y: 132 + gap, width: 44, height: 9, rx: 3 })
      ),
      React.createElement("rect", { x: 0, y: 0, width: 320, height: 180, fill: "none", stroke: "#0a0d12", strokeWidth: 34, opacity: 0.55 })
    );
  }

  /* ---------- 点云 ---------- */
  function Pcd({ t }) {
    const r = rng(20260914);
    const pts = [];
    for (let i = 0; i < 240; i++) {
      const x = r() * 320, y = 106 + r() * 74;
      pts.push([x, y]);
    }
    /* 背墙稀疏点 */
    for (let i = 0; i < 60; i++) pts.push([r() * 320, 12 + r() * 88]);
    const cl = clothAt(t);
    for (let i = 0; i < 90; i++) {
      const u = r(), v = r();
      const a = cl[0], b = cl[1], c = cl[2], d = cl[3];
      pts.push([
        lerp(lerp(a[0], b[0], u), lerp(d[0], c[0], u), v),
        lerp(lerp(a[1], b[1], u), lerp(d[1], c[1], u), v),
      ]);
    }
    const [tx, ty] = eeAt(t);
    const arm = ik(tx, ty, 18, 142, 78, 72);
    for (let i = 0; i <= 40; i++) {
      const u = i / 40;
      const px = u < 0.5 ? lerp(18, arm.jx, u * 2) : lerp(arm.jx, tx, (u - 0.5) * 2);
      const py = u < 0.5 ? lerp(142, arm.jy, u * 2) : lerp(arm.jy, ty, (u - 0.5) * 2);
      for (let k = -1; k <= 1; k++) pts.push([px, py + k * 3.2]);
    }
    return React.createElement(
      "g",
      null,
      React.createElement("rect", { x: 0, y: 0, width: 320, height: 180, fill: "#05070a" }),
      pts.map((p, i) =>
        React.createElement("circle", {
          key: i, cx: p[0].toFixed(1), cy: p[1].toFixed(1),
          r: p[1] > 104 ? 1.05 : 0.8,
          fill: depthColor(p[1], 60, 168),
          opacity: p[1] > 104 ? 0.95 : 0.5,
        })
      ),
      React.createElement("text", { x: 8, y: 174, fontSize: 8.5, fill: "#4a5563", fontFamily: "var(--font-mono)" }, "PCD  " + pts.length + " pts  10 Hz")
    );
  }

  /* ---------- 叠加层 ---------- */
  function Overlay({ t, kind }) {
    const [tx, ty] = eeAt(t);
    const cl = clothAt(t);
    const box = {
      x: Math.min.apply(null, cl.map((p) => p[0])) - 3,
      y: Math.min.apply(null, cl.map((p) => p[1])) - 3,
      w: Math.max.apply(null, cl.map((p) => p[0])) - Math.min.apply(null, cl.map((p) => p[0])) + 6,
      h: Math.max.apply(null, cl.map((p) => p[1])) - Math.min.apply(null, cl.map((p) => p[1])) + 6,
    };
    return React.createElement(
      "g",
      null,
      kind === "box" &&
        React.createElement(
          "g",
          null,
          React.createElement("rect", { x: box.x, y: box.y, width: box.w, height: box.h, fill: "none", stroke: "#5ee6a8", strokeWidth: 1.1 }),
          React.createElement("rect", { x: box.x, y: box.y - 11, width: 52, height: 11, fill: "#5ee6a8" }),
          React.createElement("text", { x: box.x + 3, y: box.y - 2.6, fontSize: 8, fill: "#04221a", fontFamily: "var(--font-mono)" }, "TOWEL 0.97"),
          React.createElement("rect", { x: 128, y: 106, width: 64, height: 24, fill: "none", stroke: "#7cd0ff", strokeWidth: 1, strokeDasharray: "3 2" }),
          React.createElement("text", { x: 130, y: 103, fontSize: 8, fill: "#7cd0ff", fontFamily: "var(--font-mono)" }, "TRAY 0.94")
        ),
      kind === "hand" &&
        React.createElement(
          "g",
          null,
          [
            [-6, -6], [0, -9], [6, -8], [11, -4], [15, 3],
          ].map((o, i) =>
            React.createElement("circle", { key: i, cx: tx + o[0], cy: ty + o[1], r: 1.8, fill: "#ffd166", stroke: "#3a2f14", strokeWidth: 0.5 })
          ),
          React.createElement("polyline", {
            points: [[-6, -6], [0, -9], [6, -8], [11, -4], [15, 3], [8, 8], [0, 9], [-6, 6], [-6, -6]].map((p) => (tx + p[0]) + "," + (ty + p[1])).join(" "),
            fill: "none", stroke: "#ffd166", strokeWidth: 0.9, strokeDasharray: "2 1.6",
          }),
          React.createElement("circle", { cx: tx + 15, cy: ty + 3, r: 3.4, fill: "none", stroke: "#ffd166", strokeWidth: 0.8 })
        ),
      kind === "contact" &&
        t > 0.17 && t < 0.24 &&
        React.createElement(
          "g",
          null,
          React.createElement("circle", { cx: tx, cy: ty, r: 12, fill: "none", stroke: "#ff7a45", strokeWidth: 1.4 }),
          React.createElement("circle", { cx: tx, cy: ty, r: 5, fill: "#ff7a45", opacity: 0.85 }),
          React.createElement("text", { x: tx + 15, y: ty + 3, fontSize: 8, fill: "#ff7a45", fontFamily: "var(--font-mono)" }, "CONTACT 4.2 N")
        ),
      kind === "force" &&
        React.createElement(
          "g",
          null,
          React.createElement("path", {
            d: (function () {
              let d = "M6 168";
              for (let i = 0; i <= 60; i++) {
                const u = i / 60;
                const v = t > 0.17 && t < 0.24 ? 14 * Math.exp(-Math.pow((u - t) * 12, 2)) : 0;
                d += " L" + (6 + u * 308).toFixed(1) + " " + (168 - v - Math.sin(u * 26) * 1.4).toFixed(1);
              }
              return d;
            })(),
            fill: "none", stroke: "#ff7a45", strokeWidth: 1.2,
          })
        )
    );
  }

  /* ---------- 对外出口 ---------- */
  function SceneFrame({ view = "exo", t = 0.3, overlays = [] }) {
    const O = overlays.map((k) => React.createElement(Overlay, { key: k, t: t, kind: k }));
    if (view === "pcd") return React.createElement("svg", { viewBox: "0 0 320 180", preserveAspectRatio: "xMidYMid slice" }, React.createElement(Pcd, { t: t }), O);
    if (view === "ego") return React.createElement("svg", { viewBox: "0 0 320 180", preserveAspectRatio: "xMidYMid slice" }, React.createElement(Ego, { t: t }), O);
    if (view === "wrist") return React.createElement("svg", { viewBox: "0 0 320 180", preserveAspectRatio: "xMidYMid slice" }, React.createElement(Wrist, { t: t }), O);
    if (view === "depth") return React.createElement("svg", { viewBox: "0 0 320 180", preserveAspectRatio: "xMidYMid slice" }, React.createElement(Exo, { t: t, depth: true }), O);
    return React.createElement("svg", { viewBox: "0 0 320 180", preserveAspectRatio: "xMidYMid slice" }, React.createElement(Exo, { t: t }), O);
  }

  window.SceneFrame = SceneFrame;
  window.sceneHelpers = { eeAt: eeAt, clothAt: clothAt, ik: ik, clamp01: clamp01, lerp: lerp, rng: rng };
})();
