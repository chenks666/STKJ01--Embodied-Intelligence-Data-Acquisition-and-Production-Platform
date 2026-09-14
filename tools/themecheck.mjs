// 主题与可读性检查：深/浅主题切换后，新增智能元素是否仍然可读（无深底深字）
import { createRequire } from "node:module";
import fs from "node:fs";
const require = createRequire(import.meta.url);
const { chromium } = require("playwright");

const URL = process.env.TARGET || "http://127.0.0.1:4311/index.html";
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
const errors = [];
page.on("console", (m) => { if (m.type() === "error") errors.push(m.text().split("\n")[0]); });
page.on("pageerror", (e) => errors.push("PAGEERR " + String(e).split("\n")[0]));
await page.goto(URL, { waitUntil: "load", timeout: 30000 });
await page.waitForTimeout(1300);

/* WCAG 2.1 相对亮度（含 sRGB 反伽马），确定性纯函数 */
const srgbToLin = (c) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
const lum = (c) => {
  const m = String(c).match(/\d+(\.\d+)?/g);
  if (!m || m.length < 3) return 0;
  const [r, g, b] = [+m[0] / 255, +m[1] / 255, +m[2] / 255];
  return 0.2126 * srgbToLin(r) + 0.7152 * srgbToLin(g) + 0.0722 * srgbToLin(b);
};
/* WCAG 对比度：1 ~ 21，AA 小字需 ≥ 4.5，大字需 ≥ 3 */
const wcag = (a, b) => {
  const L1 = lum(a), L2 = lum(b);
  return +((Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05)).toFixed(2);
};

async function sample(label) {
  const r = await page.evaluate(() => {
    const pick = (sel, prop) => {
      const el = document.querySelector(sel);
      return el ? String(getComputedStyle(el)[prop] || "") : "";
    };
    return {
      theme: document.documentElement.getAttribute("data-theme"),
      stageBgImg: pick(".stage", "backgroundImage").slice(0, 60) || "(平台页无 .stage)",
      fwNodeBg: pick(".fw-node", "backgroundColor"),
      fwVColor: pick(".fw-v", "color"),
      fwNoteColor: pick(".fw-note", "color"),
      fwKColor: pick(".fw-k", "color"),
      kpiBg: pick(".aikpi", "backgroundColor"),
      kpiVColor: pick(".aikpi-v", "color"),
      kpiFColor: pick(".aikpi-f", "color"),
      loopColor: pick(".flywheel-loop", "color"),
      loopBg: pick(".panel", "backgroundColor"),
    };
  });
  return {
    label, theme: r.theme,
    stageBg: r.stageBgImg.includes("radial") ? "含径向渐变(不合规)" : r.stageBgImg.slice(0, 30),
    /* 新增元素：正文尺寸文字需 ≥4.5:1，辅助小字底线 ≥3:1 */
    fwV: wcag(r.fwVColor, r.fwNodeBg),
    fwNote: wcag(r.fwNoteColor, r.fwNodeBg),
    fwK: wcag(r.fwKColor, r.fwNodeBg),
    kpiV: wcag(r.kpiVColor, r.kpiBg),
    kpiF: wcag(r.kpiFColor, r.kpiBg),
    loop: wcag(r.loopColor, r.loopBg),
  };
}

async function goto(dom, pgName) {
  await page.evaluate((d) => {
    const els = Array.from(document.querySelectorAll(".nav-scroll > div > .nav-item"));
    const el = els.find((x) => x.innerText.replace(/\s+/g, "").replace(/[!\d]/g, "").includes(d));
    if (el) el.click();
  }, dom);
  await page.waitForTimeout(380);
  await page.evaluate((p) => {
    const els = Array.from(document.querySelectorAll(".nav-sub button"));
    const el = els.find((x) => x.innerText.replace(/\s+/g, "").replace(/[!\d]/g, "").includes(p));
    if (el) el.click();
  }, pgName);
  await page.waitForTimeout(540);
}

const out = [];
await goto("生产", "总览看板");
out.push(await sample("dark 深色主题"));

// 切换主题
await page.evaluate(() => {
  const b = Array.from(document.querySelectorAll("button")).find((x) => (x.getAttribute("title") || "").includes("主题") || (x.getAttribute("aria-label") || "").includes("主题"));
  if (b) b.click();
  else { document.documentElement.setAttribute("data-theme", document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark"); }
});
await page.waitForTimeout(600);
await goto("生产", "总览看板");
out.push(await sample("light 浅色主题"));


out.push({ errors });
console.log(JSON.stringify(out, null, 2));
await browser.close();
