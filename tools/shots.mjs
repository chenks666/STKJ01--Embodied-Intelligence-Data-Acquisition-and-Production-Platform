/* ============================================================
   标准截图集 + 导航回归
   按导航顺序逐页遍历三端，产出 shots/ 下唯一编号的截图，
   同时收集控制台报错（0 报错即导航回归通过）。
   运行：node tools/shots.mjs
   依赖：本地已启动 http://127.0.0.1:4311 静态服务（见 README）
   ============================================================ */
import { createRequire } from "node:module";
import fs from "node:fs";
import path from "node:path";
import url from "node:url";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");

const BASE = process.env.TARGET || "http://127.0.0.1:4311/index.html";
const ROOT = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "shots");
fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });

const errors = [];
let cur = "boot";

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
page.on("console", (m) => { if (m.type() === "error") errors.push(cur + " :: " + m.text().split("\n")[0]); });
page.on("pageerror", (e) => errors.push(cur + " :: PAGEERR " + String(e).split("\n")[0]));

await page.goto(BASE, { waitUntil: "load", timeout: 30000 });
await page.waitForTimeout(1400);

const results = [];
const cn = (s) => (s || "").replace(/[^\u4e00-\u9fa5A-Za-z0-9]/g, "").slice(0, 14);
const cjk = (s) => (s || "").replace(/[^\u4e00-\u9fa5]/g, "").slice(0, 14);
const shot = (name) => page.screenshot({ path: path.join(OUT, name + ".png") });

/* ---------- 平台端：按域展开逐页遍历（含配置域的「设计验收清单」） ---------- */
const domainCount = await page.evaluate(() => document.querySelectorAll(".nav-scroll > div > .nav-item").length);
let n = 0;
for (let d = 0; d < domainCount; d++) {
  const domName = await page.evaluate((i) => {
    const el = document.querySelectorAll(".nav-scroll > div > .nav-item")[i];
    if (!el) return null;
    el.click();
    return (el.innerText || "").trim().replace(/\s+/g, " ").replace(/[!\d]/g, "").trim();
  }, d);
  await page.waitForTimeout(450);

  const pageCount = await page.evaluate(() => document.querySelectorAll(".nav-sub button").length);
  for (let p = 0; p < pageCount; p++) {
    const info = await page.evaluate((idx) => {
      const el = document.querySelectorAll(".nav-sub button")[idx];
      if (!el) return null;
      el.click();
      return (el.innerText || "").trim().replace(/\s+/g, " ").replace(/[\d]/g, "").trim();
    }, p);
    await page.waitForTimeout(430);
    n++;
    const id = String(n).padStart(2, "0") + "-" + cjk(domName) + "_" + cjk(info);
    cur = id;
    results.push({ id, end: "platform", domain: domName, page: info });
    await shot(id);
  }
}
const platformPages = n;

/* ---------- 总览看板：明色主题 ---------- */
await page.evaluate(() => document.querySelectorAll(".nav-scroll > div > .nav-item")[0].click());
await page.waitForTimeout(300);
await page.evaluate(() => document.querySelectorAll(".nav-sub button")[0].click());
await page.waitForTimeout(350);
await page.click('button.iconbtn[title*="明色主题"]');
await page.waitForTimeout(400);
cur = "light";
results.push({ id: "light", end: "platform", page: "明色主题 · 总览看板" });
await shot(String(n + 1).padStart(2, "0") + "-明色主题");
await page.click('button.iconbtn[title*="暗色主题"]');
await page.waitForTimeout(400);

/* ---------- 演示动线面板 ---------- */
await page.click("button.fab-toggle");
await page.waitForTimeout(450);
cur = "flow";
results.push({ id: "flow", end: "platform", page: "演示动线面板" });
await shot(String(n + 2).padStart(2, "0") + "-演示动线");
await page.click("button.fab-toggle");
await page.waitForTimeout(350);

/* ---------- 采集端：底部 tab ---------- */
await page.evaluate(() => {
  const b = Array.from(document.querySelectorAll(".endswitch button")).find((x) => x.innerText.includes("采集"));
  if (b) b.click();
});
await page.waitForTimeout(800);
const capTabs = await page.evaluate(() => Array.from(document.querySelectorAll(".m-tab")).map((e) => e.innerText.trim()));
for (let i = 0; i < capTabs.length; i++) {
  await page.evaluate((idx) => { const t = document.querySelectorAll(".m-tab")[idx]; if (t) t.click(); }, i);
  await page.waitForTimeout(500);
  cur = "CAP-" + cjk(capTabs[i]);
  results.push({ id: cur, end: "capture", tab: capTabs[i] });
  await shot("CAP-" + String(i + 1).padStart(2, "0") + "-" + cjk(capTabs[i]));
}

/* ---------- 客户门户 ---------- */
await page.evaluate(() => {
  const b = Array.from(document.querySelectorAll(".endswitch button")).find((x) => x.innerText.includes("客户"));
  if (b) b.click();
});
await page.waitForTimeout(800);
const portalTabs = await page.evaluate(() => Array.from(document.querySelectorAll("aside .nav-item")).map((e) => e.innerText.trim()));
cur = "PORTAL";
results.push({ id: "PORTAL", end: "portal", tabs: portalTabs });
await shot("PORTAL-00");
for (let i = 0; i < portalTabs.length; i++) {
  await page.evaluate((idx) => { const el = document.querySelectorAll("aside .nav-item")[idx]; if (el) el.click(); }, i);
  await page.waitForTimeout(550);
  cur = "PORTAL-" + cjk(portalTabs[i]);
  results.push({ id: cur, end: "portal", tab: portalTabs[i] });
  await shot("PORTAL-" + String(i + 1).padStart(2, "0") + "-" + cjk(portalTabs[i]));
}

const report = { platformPages, captureTabs: capTabs, portalTabs, totalShots: results.length, errorCount: errors.length, errors, results };
fs.writeFileSync(path.join(ROOT, "tools", ".shots-report.json"), JSON.stringify(report, null, 2), "utf8");
console.log("platformPages=" + platformPages + " captureTabs=" + capTabs.length + " portalTabs=" + portalTabs.length);
console.log("totalShots=" + results.length + " errorCount=" + errors.length);
await browser.close();
