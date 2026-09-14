import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";
const require = createRequire(import.meta.url)
const QA = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "shots", "_qa");
const { chromium } = require("playwright");
const fs = await import("node:fs");
fs.mkdirSync(QA, { recursive: true });

const URL = "http://127.0.0.1:4311/" + encodeURIComponent("具身智能数据生产平台-高保真交互原型.html");
const errors = [];
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
page.on("console", (m) => { if (m.type() === "error") errors.push(m.text().split("\n")[0]); });
page.on("pageerror", (e) => errors.push("PAGEERR " + String(e).split("\n")[0]));

await page.goto(URL, { waitUntil: "load", timeout: 40000 });
await page.waitForTimeout(1600);

const info = await page.evaluate(() => ({
  rootLen: (document.getElementById("root") || {}).innerHTML ? document.getElementById("root").innerHTML.length : -1,
  navCount: document.querySelectorAll(".nav-scroll > div > .nav-item").length,
  title: document.title,
  styleTags: document.querySelectorAll("style").length,
  scriptTags: document.querySelectorAll("script").length,
  externalScripts: Array.from(document.querySelectorAll("script[src]")).map((s) => s.src),
}));

// 切到采集端与客户门户各一次
const ends = [];
for (const kw of ["采集", "客户", "平台"]) {
  await page.evaluate((k) => {
    const b = Array.from(document.querySelectorAll(".endswitch button")).find((x) => x.innerText.includes(k));
    if (b) b.click();
  }, kw);
  await page.waitForTimeout(600);
  ends.push({ kw, ok: await page.evaluate(() => document.querySelector(".body").innerText.length > 200) });
}

await page.screenshot({ path: QA + "/SINGLE-自包含验证.png" });

const report = { soloFileOK: info.rootLen > 10000, info, ends, errorCount: errors.length, errors };
fs.writeFileSync(QA + "/_single.json", JSON.stringify(report, null, 2), "utf8");
console.log(JSON.stringify(report, null, 2));
await browser.close();
