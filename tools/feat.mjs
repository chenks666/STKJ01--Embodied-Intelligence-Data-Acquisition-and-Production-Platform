/* ============================================================
   交互专项回归
   1 总览看板板块可点击跳转  2 人名去除  3 搜索栏不再溢出
   4 新建功能可交互          5 开放接口（API）存在且可交互
   运行：node tools/feat.mjs   （需先在 4311 端口起静态服务）
   ============================================================ */
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");

const URL = process.env.TARGET || "http://127.0.0.1:4311/index.html";
const errors = [];
const out = {};

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
page.on("console", (m) => { if (m.type() === "error") errors.push(m.text().split("\n")[0]); });
page.on("pageerror", (e) => errors.push("PAGEERR " + String(e).split("\n")[0]));

await page.goto(URL, { waitUntil: "load", timeout: 30000 });
await page.waitForTimeout(1300);

const cur = () => page.evaluate(() => {
  const t = document.querySelector(".main h1, .main h2, .pagehead");
  return t ? (t.innerText || "").trim().replace(/\s+/g, " ").slice(0, 30) : "";
});
const goDomain = async (i) => {
  await page.evaluate((k) => document.querySelectorAll(".nav-scroll > div > .nav-item")[k].click(), i);
  await page.waitForTimeout(320);
};
const goSub = async (i) => {
  await page.evaluate((k) => document.querySelectorAll(".nav-sub button")[k].click(), i);
  await page.waitForTimeout(360);
};

/* ---------- 1. 总览看板板块可点击跳转 ---------- */
await goDomain(0); await goSub(0);
out.overviewTitle = await cur();

const jumpCases = [];
async function tryJump(label, clickFn, expect) {
  await goDomain(0); await goSub(0);
  await clickFn();
  await page.waitForTimeout(420);
  const head = await cur();
  jumpCases.push({ label, head, ok: expect.test(head) });
}
// 指标卡：在产任务 → 任务列表
await tryJump("指标卡·在产任务", () => page.evaluate(() => document.querySelectorAll(".metric")[0].click()), /任务/);
// 指标卡：待办质检 → 待办队列
await tryJump("指标卡·待办质检", () => page.evaluate(() => document.querySelectorAll(".metric")[3].click()), /质检|待办/);
// 飞轮节点：机审质检 → 质检台
await tryJump("飞轮·机审质检", () => page.evaluate(() => document.querySelectorAll(".fw-node")[1].click()), /质检/);
// 风险「去处理」首项 → 规则配置
await tryJump("风险·去处理", () => page.evaluate(() => {
  const b = Array.from(document.querySelectorAll(".risk .btn")).find((x) => x.innerText.includes("去处理"));
  b.click();
}), /规则|质检|上传|设备|任务/);
// 驳回原因首个 → 质检台
await tryJump("驳回原因分布", () => page.evaluate(() => document.querySelectorAll(".qrow")[0].click()), /质检/);
// 热力图单元格 → 质检台
await tryJump("热力图单元格", () => page.evaluate(() => {
  const cells = Array.from(document.querySelectorAll("button")).filter((b) => /^\d{2}\.\d$/.test((b.innerText || "").trim()));
  cells[0].click();
}), /质检/);
// 异常清单行 → 上传与校验
await tryJump("异常清单行", () => page.evaluate(() => {
  const t = Array.from(document.querySelectorAll("table.dense tbody tr"));
  t[0].click();
}), /上传|校验/);

out.jumps = jumpCases;
out.jumpsAllPass = jumpCases.every((j) => j.ok);

/* ---------- 2. 人名去除（整站扫描） ---------- */
await goDomain(0); await goSub(0);
const NAME_RE = /(林敬|郭嘉伟|陈涛|何俊|周文韬|郑雨桐|张野|李梦|王一然|赵淼|孙琦|陈嘉禾|李文琦)/;
const hitNames = [];
for (let d = 0; d < 8; d++) {
  await goDomain(d);
  const cnt = await page.evaluate(() => document.querySelectorAll(".nav-sub button").length);
  for (let p = 0; p < cnt; p++) {
    await goSub(p);
    const txt = await page.evaluate(() => (document.querySelector(".main") || {}).innerText || "");
    const m = txt.match(NAME_RE);
    if (m) hitNames.push(d + "/" + p + ":" + m[1]);
  }
}
out.residualNamePages = hitNames;
out.namesClean = hitNames.length === 0;

/* ---------- 3. 顶栏搜索栏不再溢出（且为真实输入框） ---------- */
await goDomain(0); await goSub(0);
const searchOverflow = [];
for (const w of [1600, 1280, 1180, 1024, 960]) {
  await page.setViewportSize({ width: w, height: 900 });
  await page.waitForTimeout(320);
  const r = await page.evaluate(() => {
    const tb = document.querySelector(".topbar");
    const gs = document.querySelector(".gsearch");
    const inp = document.querySelector(".gsearch input");
    const cs = inp ? getComputedStyle(inp) : null;
    const gsRect = gs ? gs.getBoundingClientRect() : null;
    return {
      topbarOverflow: tb ? tb.scrollWidth - tb.clientWidth : 0,
      docOverflow: document.documentElement.scrollWidth - window.innerWidth,
      gsRight: gsRect ? Math.round(gsRect.right) : null,
      hasInput: !!inp,
      ellipsis: cs ? cs.textOverflow : "none",
      minW: cs ? cs.minWidth : "n/a",
      hidden: gs ? getComputedStyle(gs).display === "none" : true,
    };
  });
  searchOverflow.push(Object.assign({ vw: w }, r));
}
out.searchOverflow = searchOverflow;
out.searchNoOverflow = searchOverflow.every((r) => r.hidden || (r.topbarOverflow <= 1 && r.docOverflow <= 1 && r.ellipsis === "ellipsis" && r.hasInput));
await page.setViewportSize({ width: 1600, height: 1000 });
await page.waitForTimeout(300);

/* ---------- 4. 新建功能可交互 ---------- */
// 4a 规则配置 新建规则
await goDomain(1); await goSub(2);
const rulesBefore = await page.evaluate(() => document.querySelectorAll(".wb-body table tbody tr").length);
await page.evaluate(() => {
  const b = Array.from(document.querySelectorAll(".btn")).find((x) => x.innerText.trim() === "新建规则");
  b.click();
});
await page.waitForTimeout(320);
const ruleModal = await page.evaluate(() => !!document.querySelector(".modal"));
await page.evaluate(() => {
  const ins = document.querySelectorAll(".modal .input");
  const setV = (el, v) => {
    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
    setter.call(el, v);
    el.dispatchEvent(new Event("input", { bubbles: true }));
  };
  setV(ins[0], "QC-VIB-01");   // 编号
  setV(ins[1], "振动幅度峰值"); // 判定逻辑
  setV(ins[2], "12");          // 阈值
  const b = Array.from(document.querySelectorAll(".modal-foot .btn")).find((x) => x.innerText.includes("创建"));
  b.click();
});
await page.waitForTimeout(420);
const rulesAfter = await page.evaluate(() => document.querySelectorAll(".wb-body table tbody tr").length);
out.ruleCreate = { before: rulesBefore, after: rulesAfter, modal: ruleModal, ok: ruleModal && rulesAfter === rulesBefore + 1 };

// 4b 标注任务 拆包新建
await goDomain(2); await goSub(0);
const annoBefore = await page.evaluate(() => document.querySelectorAll(".table tbody tr").length);
await page.evaluate(() => {
  const b = Array.from(document.querySelectorAll(".btn")).find((x) => x.innerText.trim() === "拆包新建");
  b.click();
});
await page.waitForTimeout(320);
const annoModal = await page.evaluate(() => !!document.querySelector(".modal"));
await page.evaluate(() => {
  const b = Array.from(document.querySelectorAll(".modal-foot .btn")).find((x) => x.innerText.includes("拆包"));
  b.click();
});
await page.waitForTimeout(420);
const annoAfter = await page.evaluate(() => document.querySelectorAll(".table tbody tr").length);
out.annoCreate = { before: annoBefore, after: annoAfter, modal: annoModal, ok: annoModal && annoAfter === annoBefore + 3 };

// 4c 配置域 新建（规格模板）
await goDomain(7); await goSub(0);
const cfgBefore = await page.evaluate(() => document.querySelectorAll(".table tbody tr").length);
await page.evaluate(() => {
  const b = Array.from(document.querySelectorAll(".btn")).find((x) => x.innerText.trim() === "新建");
  b.click();
});
await page.waitForTimeout(320);
const cfgModal = await page.evaluate(() => !!document.querySelector(".modal"));
await page.evaluate(() => {
  const ins = document.querySelectorAll(".modal .input");
  const setV = (el, v) => {
    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
    setter.call(el, v);
    el.dispatchEvent(new Event("input", { bubbles: true }));
  };
  for (let i = 0; i < ins.length; i++) setV(ins[i], "TEST-" + i);
  const b = Array.from(document.querySelectorAll(".modal-foot .btn")).find((x) => x.innerText.trim() === "保存");
  b.click();
});
await page.waitForTimeout(420);
const cfgAfter = await page.evaluate(() => document.querySelectorAll(".table tbody tr").length);
out.configCreate = { before: cfgBefore, after: cfgAfter, modal: cfgModal, ok: cfgModal && cfgAfter === cfgBefore + 1 };

// 4d 配置域 审计日志：应提供「导出日志」而非「新建」
// 注意：config 域已插入「接入契约」，顺序为 specs/devices/contract/people/perms/audit → 审计日志为索引 5
await goSub(5);
await page.waitForTimeout(300);
out.auditAction = await page.evaluate(() => {
  const b = Array.from(document.querySelectorAll(".page-actions .btn")).map((x) => x.innerText.trim());
  return b;
});

/* ---------- 5. 开放接口 ---------- */
await goDomain(3);
const dsChildren = await page.evaluate(() => Array.from(document.querySelectorAll(".nav-sub button")).map((x) => x.innerText.trim()));
await goSub(4);
await page.waitForTimeout(400);
out.apiNavChildren = dsChildren;
out.api = await page.evaluate(() => {
  const t = document.querySelector(".main h1, .main h2, .pagehead");
  const head = t ? (t.innerText || "").trim().replace(/\s+/g, " ").slice(0, 40) : "";
  return {
    head,
    tabs: Array.from(document.querySelectorAll(".pagebody .btn")).map((x) => x.innerText.trim()).filter((x) => /接口|鉴权|事件|日志|示例/.test(x)),
    endpointRows: document.querySelectorAll(".pagebody table tbody tr").length,
    hasCodeIcon: document.querySelector(".pagebody svg") ? true : false,
  };
});
// 切到「接入示例」看代码块
await page.evaluate(() => {
  const b = Array.from(document.querySelectorAll(".pagebody .btn")).find((x) => x.innerText.trim() === "接入示例");
  if (b) b.click();
});
await page.waitForTimeout(360);
out.api.codeblock = await page.evaluate(() => {
  const pre = document.querySelector(".codeblock");
  return pre ? { lines: (pre.innerText || "").split("\n").length, hasCurl: /curl/.test(pre.innerText) } : null;
});
out.api.ok = /开放接口/.test(out.api.head) && out.api.endpointRows >= 8 && !!out.api.codeblock && out.api.codeblock.hasCurl;

out.errors = errors;
out.allPass = out.jumpsAllPass && out.namesClean && out.searchNoOverflow &&
  out.ruleCreate.ok && out.annoCreate.ok && out.configCreate.ok && out.api.ok && errors.length === 0;

console.log(JSON.stringify(out, null, 2));
await browser.close();
