// 交互断言：新增控件的可点击行为是否真的生效
import { createRequire } from "node:module";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url)
const SHOTS = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "shots");
const { chromium } = require("playwright");

const URL = process.env.TARGET || "http://127.0.0.1:4311/index.html";
const OUT = SHOTS;
fs.mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
const errors = [];
page.on("console", (m) => { if (m.type() === "error") errors.push(m.text().split("\n")[0]); });
page.on("pageerror", (e) => errors.push("PAGEERR " + String(e).split("\n")[0]));

await page.goto(URL, { waitUntil: "load", timeout: 30000 });
await page.waitForTimeout(1400);

async function goto(dom, pgName) {
  await page.evaluate((d) => {
    const els = Array.from(document.querySelectorAll(".nav-scroll > div > .nav-item"));
    const el = els.find((x) => x.innerText.replace(/\s+/g, "").replace(/[!\d]/g, "").includes(d));
    if (el) el.click();
  }, dom);
  await page.waitForTimeout(360);
  await page.evaluate((p) => {
    const els = Array.from(document.querySelectorAll(".nav-sub button"));
    const el = els.find((x) => x.innerText.replace(/\s+/g, "").replace(/[!\d]/g, "").includes(p));
    if (el) el.click();
  }, pgName);
  await page.waitForTimeout(520);
}

const clicks = (label) => page.evaluate((l) => {
  const b = Array.from(document.querySelectorAll("button")).find((x) => x.innerText.replace(/\s+/g, "").includes(l));
  if (b) { b.click(); return true; }
  return false;
}, label);

const out = {};

/* 质检台：点「采纳建议」→ 原因码应被选中（出现 RC-0301 与处置建议） */
await goto("质量", "质检台");
const before = await page.evaluate(() => document.body.innerText.includes("标准处置建议"));
out.qcAdopt = { clickOk: await clicks("采纳建议") };
await page.waitForTimeout(420);
out.qcAdopt.adviceShownAfter = await page.evaluate(() => document.body.innerText.includes("标准处置建议"));
out.qcAdopt.toastShown = await page.evaluate(() => document.body.innerText.includes("已采纳机审建议"));
out.qcAdopt.adviceBeforeClick = before;

/* 标注工作台：点难例队列里的 CLP-81206 → 中栏 header 应切换 */
await goto("标注", "标注工作台");
const headBefore = await page.evaluate(() => (document.querySelector(".wb-head .mono") || {}).innerText || "");
out.annoSwitch = { headBefore };
await page.evaluate(() => {
  const b = Array.from(document.querySelectorAll(".listitem")).find((x) => x.innerText.includes("CLP-81206") && x.innerText.includes("低置信"));
  if (b) b.click();
});
await page.waitForTimeout(500);
out.annoSwitch.headAfter = await page.evaluate(() => {
  const hs = Array.from(document.querySelectorAll(".wb-head .mono"));
  return hs.map((h) => h.innerText.trim()).join(" | ");
});
out.annoSwitch.switched = out.annoSwitch.headAfter.includes("CLP-81206");

/* 配方编辑器：点模型建议条件 → 条件组应新增该条 */
await goto("数据集", "配方编辑器");
const condBefore = await page.evaluate(() => document.querySelectorAll(".panel-inset").length);
out.recipeAdd = { condBefore };
await page.evaluate(() => {
  const b = Array.from(document.querySelectorAll("button")).find((x) => x.innerText.includes("光照条件") && x.innerText.includes("320–460"));
  if (b) b.click();
});
await page.waitForTimeout(420);
out.recipeAdd.toast = await page.evaluate(() => document.body.innerText.includes("已加入条件"));
out.recipeAdd.newCondVisible = await page.evaluate(() => document.body.innerText.includes("320–460 lux"));

out.errors = errors;
fs.writeFileSync(path.join(OUT, "_aiclick.json"), JSON.stringify(out, null, 2), "utf8");
console.log(JSON.stringify(out, null, 2));
await browser.close();
