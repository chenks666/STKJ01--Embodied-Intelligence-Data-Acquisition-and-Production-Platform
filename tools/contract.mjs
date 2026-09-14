/* ============================================================
   接入契约专项验收
   A. 顶栏搜索栏可输入 + 回车检索 + ⌘K 聚焦 + 查询带入检索页
   B. 接入契约（对齐 AIRSPEED 开源能力缺口）
   C. 设备台账时钟同步列 / 上传契约级校验 / 交付格式与转换
   D. 全站无控制台错误
   运行：node tools/contract.mjs   （需先在 4311 端口起静态服务）
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

const head = () => page.evaluate(() => {
  const t = document.querySelector(".main h1, .main h2, .pagehead");
  return t ? (t.innerText || "").trim().replace(/\s+/g, " ").slice(0, 40) : "";
});
const goDomain = async (i) => {
  await page.evaluate((k) => document.querySelectorAll(".nav-scroll > div > .nav-item")[k].click(), i);
  await page.waitForTimeout(300);
};
const goSub = async (i) => {
  await page.evaluate((k) => document.querySelectorAll(".nav-sub button")[k].click(), i);
  await page.waitForTimeout(360);
};

/* ================= A. 顶栏搜索栏 ================= */
await goDomain(0); await goSub(0);
out.A_inputExists = await page.evaluate(() => {
  const f = document.querySelector("form.gsearch");
  const inp = document.querySelector(".gsearch input");
  return { form: !!f, input: !!inp, type: inp ? inp.getAttribute("type") || "text" : null, placeholder: inp ? inp.getAttribute("placeholder") : null };
});

// A2 键入 → 受控值跟着变
await page.fill(".gsearch input", "厨房叠衣服失败 质量分70以上");
await page.waitForTimeout(200);
out.A_typedValue = await page.evaluate(() => (document.querySelector(".gsearch input") || {}).value || "");

// A3 回车 → 跳到检索页并把问题带入
const Q = "厨房叠衣服失败 质量分70以上";
await page.evaluate((q) => {
  const inp = document.querySelector(".gsearch input");
  const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
  setter.call(inp, q);
  inp.dispatchEvent(new Event("input", { bubbles: true }));
  inp.closest("form").dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
}, Q);
await page.waitForTimeout(500);
out.A_searchHead = await head();
out.A_queryCarried = await page.evaluate((q) => {
  const inp = document.querySelector(".pagebody .gsearch input");
  const badge = Array.from(document.querySelectorAll(".pagehead .tag, .main .tag")).map((x) => x.innerText.trim());
  return {
    inputValue: inp ? (inp.value || "").trim() : null,
    matches: inp ? (inp.value || "").indexOf(q) >= 0 : false,
    badge: badge.find((b) => /来自顶栏检索/.test(b)) || null,
  };
}, Q);
out.A_pageTitleOK = /检索/.test(out.A_searchHead);
out.A_ok = out.A_inputExists.input && out.A_typedValue.length > 0 && out.A_pageTitleOK && out.A_queryCarried.matches && !!out.A_queryCarried.badge;

// A4 ⌘K 聚焦
await goDomain(0); await goSub(0);
await page.evaluate(() => document.querySelector(".gsearch input").blur());
await page.keyboard.press("Control+k");
await page.waitForTimeout(200);
out.A_ctrlKFocused = await page.evaluate(() => document.activeElement === document.querySelector(".gsearch input"));

/* ================= B. 接入契约页 ================= */
await goDomain(7); await goSub(2);
await page.waitForTimeout(420);
out.B_head = await head();
out.B_meta = await page.evaluate(() => Array.from(document.querySelectorAll(".pagehead .tag, .main .tag")).map((x) => x.innerText.trim()).slice(0, 4));
out.B_ifaces = await page.evaluate(() => document.querySelectorAll(".panel-inset").length);
out.B_streamRows = await page.evaluate(() => {
  const panels = Array.from(document.querySelectorAll(".panel"));
  const p = panels.find((x) => /流声明/.test(x.innerText));
  return p ? p.querySelectorAll("table tbody tr").length : -1;
});
out.B_nonCompliant = await page.evaluate(() => {
  const all = Array.from(document.querySelectorAll(".tag")).map((x) => x.innerText.trim());
  return all.filter((t) => t === "不合规").length;
});
out.B_rejectRows = await page.evaluate(() => {
  const panels = Array.from(document.querySelectorAll(".panel"));
  const p = panels.find((x) => /契约拦截记录/.test(x.innerText));
  return p ? p.querySelectorAll("table tbody tr").length : -1;
});

// B2 两层配置切换：会话 → 全局，代码块应变化
out.B_codeSession = await page.evaluate(() => (document.querySelector(".codeblock") || {}).innerText || "");
await page.evaluate(() => {
  const b = Array.from(document.querySelectorAll(".btn")).find((x) => x.innerText.trim() === "全局配置");
  if (b) b.click();
});
await page.waitForTimeout(320);
out.B_codeGlobal = await page.evaluate(() => (document.querySelector(".codeblock") || {}).innerText || "");
out.B_yamlToggle = out.B_codeSession.length > 0 && out.B_codeGlobal.length > 0 && out.B_codeSession !== out.B_codeGlobal;

// B3 点击流声明一行 → toast（交互有反馈）
await page.evaluate(() => {
  const panels = Array.from(document.querySelectorAll(".panel"));
  const p = panels.find((x) => /流声明/.test(x.innerText));
  const tr = p.querySelector("table tbody tr");
  tr.click();
});
await page.waitForTimeout(360);
out.B_rowToast = await page.evaluate(() => !!document.querySelector(".toast, .toast-host, [class*=toast]"));

out.B_clockSynced = await page.evaluate(() => {
  const all = Array.from(document.querySelectorAll(".tag")).map((x) => x.innerText.trim());
  return all.find((t) => /时钟同步/.test(t)) || null;
});
out.B_ok = /设备接入契约/.test(out.B_head) && out.B_ifaces >= 3 && out.B_streamRows === 7 &&
  out.B_nonCompliant === 1 && out.B_rejectRows === 4 && out.B_yamlToggle && out.B_rowToast;

/* ================= C1. 设备台账 时钟同步列 ================= */
await goDomain(7); await goSub(1);
await page.waitForTimeout(420);
out.C1_head = await head();
out.C1_cols = await page.evaluate(() => {
  const t = document.querySelector(".pagebody table, .main table");
  return t ? Array.from(t.querySelectorAll("thead th")).map((x) => x.innerText.trim()) : [];
});
out.C1_hasClockCol = out.C1_cols.indexOf("时钟同步") >= 0;
out.C1_hasContractBtn = await page.evaluate(() => Array.from(document.querySelectorAll(".page-actions .btn, .btn")).some((b) => b.innerText.includes("查看接入契约")));
// 点击「查看接入契约」应跳到契约页
await page.evaluate(() => {
  const b = Array.from(document.querySelectorAll(".btn")).find((x) => x.innerText.includes("查看接入契约"));
  if (b) b.click();
});
await page.waitForTimeout(420);
out.C1_jumpHead = await head();

/* ================= C2. 上传页 契约级校验面板 ================= */
await goDomain(0); await goSub(3);
await page.waitForTimeout(480);
out.C2_head = await head();
out.C2_panel = await page.evaluate(() => /契约级校验/.test((document.querySelector(".main") || {}).innerText || ""));
out.C2_checks = await page.evaluate(() => {
  const main = document.querySelector(".main");
  if (!main) return { nan: false, header: false, field: false, align: false };
  const t = main.innerText;
  return {
    header: /消息类型带 header/.test(t),
    field: /必填字段齐备/.test(t),
    nan: /NaN \/ Inf/.test(t),
    align: /跨流对齐偏差/.test(t),
  };
});
out.C2_badge = await page.evaluate(() => Array.from(document.querySelectorAll(".tag")).some((x) => /接入契约已绑定/.test(x.innerText)));
out.C2_ok = out.C2_panel && out.C2_checks.header && out.C2_checks.field && out.C2_checks.nan && out.C2_checks.align && out.C2_badge;

/* ================= C3. 交付页 格式与转换 ================= */
await goDomain(3); await goSub(3);
await page.waitForTimeout(480);
out.C3_head = await head();
out.C3_tabs = await page.evaluate(() => Array.from(document.querySelectorAll(".row-tight .btn")).map((x) => x.innerText.trim()));
await page.evaluate(() => {
  const b = Array.from(document.querySelectorAll(".btn")).find((x) => x.innerText.trim() === "格式与转换");
  if (b) b.click();
});
await page.waitForTimeout(360);
out.C3_panel = await page.evaluate(() => {
  const main = document.querySelector(".main");
  const t = main ? main.innerText : "";
  return { parquet: /Parquet/.test(t), zarr: /Zarr/.test(t), lerobot: /LeRobot v3/.test(t), jsonl: /JSON Lines/.test(t), convTool: /convert_h5_to_/.test(t) };
});
out.C3_tabExists = out.C3_tabs.indexOf("格式与转换") >= 0;
out.C3_ok = out.C3_tabExists && out.C3_panel.parquet && out.C3_panel.zarr && out.C3_panel.lerobot && out.C3_panel.jsonl && out.C3_panel.convTool;

/* ================= D. 控制台错误 ================= */
out.errors = errors;
out.errorsCount = errors.length;

out.allPass = out.A_ok && out.A_ctrlKFocused && out.B_ok && out.C1_hasClockCol &&
  out.C1_hasContractBtn && /设备接入契约/.test(out.C1_jumpHead) && out.C2_ok && out.C3_ok && errors.length === 0;

console.log(JSON.stringify(out, null, 2));
await browser.close();
