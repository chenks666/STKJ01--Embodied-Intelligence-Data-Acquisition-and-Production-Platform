import { createRequire } from "node:module";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url)
const SHOTS = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "shots");
const { chromium } = require("playwright");

const URL = process.env.TARGET || "http://127.0.0.1:4311/index.html";
const OUT = path.join(SHOTS, "_qa");
fs.mkdirSync(OUT, { recursive: true });

const VIEWPORTS = [
  { k: "375", w: 375, h: 812, dpr: 2, name: "手机 375" },
  { k: "414", w: 414, h: 896, dpr: 2, name: "手机 414" },
  { k: "768", w: 768, h: 1024, dpr: 1, name: "平板竖 768" },
  { k: "1024", w: 1024, h: 768, dpr: 1, name: "平板横 1024" },
  { k: "1440", w: 1440, h: 900, dpr: 1, name: "笔记本 1440" },
  { k: "1920", w: 1920, h: 1080, dpr: 1, name: "桌面 1920" },
];

// 覆盖：三栏页 / 双栏页 / 表格页 / 卡片页 / 采集端 / 门户
const PAGES = [
  ["质量", "质检台"],
  ["生产", "总览看板"],
  ["生产", "任务"],
  ["数据集", "配方编辑器"],
  ["配置", "审计日志"],
];

const errors = [];
let cur = "-";
const browser = await chromium.launch({ headless: true });
const report = [];

for (const vp of VIEWPORTS) {
  const ctx = await browser.newContext({ viewport: { width: vp.w, height: vp.h }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  page.on("console", (m) => { if (m.type() === "error") errors.push(vp.k + " " + cur + " :: " + m.text().split("\n")[0]); });
  page.on("pageerror", (e) => errors.push(vp.k + " " + cur + " :: PAGEERR " + String(e).split("\n")[0]));

  await page.goto(URL, { waitUntil: "load", timeout: 40000 });
  await page.waitForTimeout(1300);

  const rows = [];

  for (const [dom, pg] of PAGES) {
    cur = dom + "/" + pg;
    // 窄屏需先开抽屉
    const needDrawer = vp.w <= 900;
    if (needDrawer) {
      await page.evaluate(() => { const b = document.querySelector(".topbar-burger"); if (b) b.click(); });
      await page.waitForTimeout(320);
    }
    await page.evaluate(([d, p]) => {
      const els = Array.from(document.querySelectorAll(".nav-scroll > div > .nav-item"));
      const el = els.find((x) => x.innerText.replace(/\s+/g, "").replace(/\d|!/g, "").includes(d));
      if (el) el.click();
    }, [dom, pg]);
    await page.waitForTimeout(340);
    if (needDrawer) {
      const open = await page.evaluate(() => !!document.querySelector(".nav.open"));
      if (!open) { await page.evaluate(() => { const b = document.querySelector(".topbar-burger"); if (b) b.click(); }); await page.waitForTimeout(300); }
    }
    await page.evaluate((p) => {
      const els = Array.from(document.querySelectorAll(".nav-sub button"));
      const el = els.find((x) => x.innerText.replace(/\s+/g, "").replace(/\d|!/g, "").includes(p));
      if (el) el.click();
    }, pg);
    await page.waitForTimeout(480);

    // 量溢出
    const m = await page.evaluate(() => {
      const de = document.documentElement;
      const offenders = [];
      const vw = window.innerWidth;
      document.querySelectorAll(".main *, .stage *, .topbar *").forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.width === 0 || r.height === 0) return;
        if (r.right > vw + 2 || r.left < -2) {
          const st = getComputedStyle(el);
          if (st.position === "fixed") return;
          offenders.push(el.tagName + "." + String(el.className).split(" ").slice(0, 2).join(".") + " r=" + Math.round(r.right) + " l=" + Math.round(r.left));
        }
      });
      const tb = document.querySelector(".topbar");
      return {
        docScrollW: de.scrollWidth, winW: window.innerWidth,
        bodyOverflowX: de.scrollWidth > window.innerWidth + 2,
        topbar: tb ? { sw: tb.scrollWidth, cw: tb.clientWidth, over: tb.scrollWidth > tb.clientWidth + 1 } : null,
        offenders: offenders.slice(0, 4),
        offenderCount: offenders.length,
      };
    });
    rows.push({ page: cur, ...m });
    if ((vp.k === "375" || vp.k === "768" || vp.k === "1920") && ["质检台", "配方编辑器"].includes(pg)) {
      await page.screenshot({ path: path.join(OUT, "R-" + vp.k + "-" + cp(pg) + ".png") });
    }
  }

  // 采集端 + 门户
  for (const [kw, tag] of [["采集", "capture"], ["客户", "portal"]]) {
    cur = tag;
    await page.evaluate((k) => {
      if (window.innerWidth <= 900) { const b = document.querySelector(".nav-scrim"); if (b) b.click(); }
      const b = Array.from(document.querySelectorAll(".endswitch button")).find((x) => x.innerText.includes(k));
      if (b) b.click();
    }, kw);
    await page.waitForTimeout(700);
    const m = await page.evaluate(() => ({
      bodyOverflowX: document.documentElement.scrollWidth > window.innerWidth + 2,
      docScrollW: document.documentElement.scrollWidth, winW: window.innerWidth,
    }));
    rows.push({ page: tag, ...m });
    if (vp.k === "375") await page.screenshot({ path: path.join(OUT, "R-375-" + tag + ".png") });
  }

  report.push({ vp: vp.name, w: vp.w, rows });
  await ctx.close();
}

function cp(s) { return s.replace(/[^\u4e00-\u9fa5A-Za-z0-9]/g, ""); }

const out = { errors, report };
fs.writeFileSync(path.join(OUT, "_responsive.json"), JSON.stringify(out, null, 2), "utf8");
console.log("errorCount=" + errors.length);
for (const r of report) {
  const bad = r.rows.filter((x) => x.bodyOverflowX);
  console.log(r.vp + " → 横溢页: " + (bad.length ? bad.map((b) => b.page + "(" + b.docScrollW + ">" + b.winW + ")").join(", ") : "无"));
}
console.log(JSON.stringify(errors.slice(0, 12), null, 2));
await browser.close();
