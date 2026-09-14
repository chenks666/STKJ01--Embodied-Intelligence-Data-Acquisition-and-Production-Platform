// 智能元素断言：确认新增的飞轮 / 能力指标 / 机审证据链 / 主动学习 / 模型建议
// 真的渲染出来了，并扫描是否存在「空图标」（图标名已删除但仍在引用 → 空 svg）
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

const textHas = (t) => page.evaluate((s) => document.body.innerText.includes(s), t);
const count = (sel) => page.evaluate((s) => document.querySelectorAll(s).length, sel);

const out = {};

/* 1. 总览看板：数据飞轮 + 能力指标 */
await goto("生产", "总览看板");
out.overview = {
  flywheel: await count(".flywheel"),
  fwNodes: await count(".fw-node"),
  fwLoop: await count(".flywheel-loop"),
  aiKpi: await count(".aikpi"),
  hasFlywheelTitle: await textHas("数据飞轮"),
  hasPreLabelKpi: await textHas("预标注覆盖率"),
  hasHardCaseKpi: await textHas("难例回流"),
};

/* 2. 质检台：机审证据链 */
await goto("质量", "质检台");
out.qc = {
  hasEvidenceChain: await textHas("机审证据链"),
  hasModelVersion: await textHas("QC-MOT-v4.2"),
  hasConsistency: await textHas("历史机审准确率"),
  adoptBtn: await page.evaluate(() => Array.from(document.querySelectorAll("button")).some((b) => b.innerText.includes("采纳建议"))),
};

/* 3. 标注工作台：主动学习难例回流 */
await goto("标注", "标注工作台");
out.anno = {
  hasActiveLearning: await textHas("主动学习"),
  hasTrainFeedback: await textHas("训练回传"),
  alItems: await count(".listitem"),           // 含 clip 列表 + 难例队列
  hasAdoptRate: await textHas("预标注采纳率"),
};

/* 4. 配方编辑器：模型建议条件 + 长尾转补采 */
await goto("数据集", "配方编辑器");
out.recipe = {
  hasSuggest: await textHas("模型建议条件"),
  hasCoverage: await textHas("覆盖度分析"),
  hasLongTail: await textHas("长尾缺口转补采"),
};

/* 5. 上传校验：校验引擎版本 */
await goto("生产", "上传与校验");
out.upload = { hasEngine: await textHas("QC-ENGINE v3.4") };

/* 6. 空图标扫描：图标名被删除但仍在引用 → 渲染出无子节点的 svg */
out.emptyIcons = await page.evaluate(() => {
  const bad = [];
  document.querySelectorAll("svg").forEach((s) => {
    if (s.querySelectorAll("path, circle, rect, line, polyline, polygon").length === 0) {
      const p = s.parentElement;
      bad.push((p ? p.tagName + "." + String(p.className).split(" ")[0] : "?") + " :: " + JSON.stringify(s.getAttribute("class") || ""));
    }
  });
  return { count: bad.length, sample: bad.slice(0, 6) };
});

out.errors = errors;
fs.writeFileSync(path.join(OUT, "_aicheck.json"), JSON.stringify(out, null, 2), "utf8");
console.log(JSON.stringify(out, null, 2));
await browser.close();
