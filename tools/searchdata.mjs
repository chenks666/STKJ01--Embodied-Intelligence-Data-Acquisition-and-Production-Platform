/* ============================================================
   检索数据支撑专项
   验证：结果随查询真实变化（而非固定列表）、条件解析与筛选正确、
         空态有出路、语料覆盖平台全部场景、左侧筛选面板可点选
   运行：node tools/searchdata.mjs   （需先在 4311 端口起静态服务）
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
await page.waitForTimeout(1200);

const goDomain = async (i) => {
  await page.evaluate((k) => document.querySelectorAll(".nav-scroll > div > .nav-item")[k].click(), i);
  await page.waitForTimeout(300);
};
const goSub = async (i) => {
  await page.evaluate((k) => document.querySelectorAll(".nav-sub button")[k].click(), i);
  await page.waitForTimeout(380);
};
const setQuery = async (v) => {
  await page.evaluate((val) => {
    const inp = document.querySelector(".pagebody .gsearch input");
    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
    setter.call(inp, val);
    inp.dispatchEvent(new Event("input", { bubbles: true }));
  }, v);
  await page.waitForTimeout(360);
};
const cards = () => page.evaluate(() => document.querySelectorAll(".pagebody .player").length);
const ids = () => page.evaluate(() => Array.from(document.querySelectorAll(".pagebody .panel .mono.small"))
  .map((x) => x.innerText.trim()).filter((t) => /^CLP-/.test(t)));
const chips = () => page.evaluate(() => Array.from(document.querySelectorAll(".pagebody button.tag")).map((x) => x.innerText.replace(/\s+/g, " ").trim()));
const quoted = () => page.evaluate(() => (document.querySelector(".pagebody") || {}).innerText || "");
const emptyShown = async () => /未命中任何数据/.test(await quoted());
const corpusSize = await page.evaluate(() => (window.DATA && window.DATA.SEARCH_HITS ? window.DATA.SEARCH_HITS.length : -1));

/* 进入检索页 */
await goDomain(0); await goSub(4);
out.pageTitle = await page.evaluate(() => { const t = document.querySelector(".main h1, .main h2, .pagehead"); return t ? t.innerText.replace(/\s+/g, " ").slice(0, 40) : ""; });
out.corpusSize = corpusSize;
out.corpusScenes = await page.evaluate(() => {
  const s = {}; (window.DATA.SEARCH_HITS || []).forEach((h) => { s[h.scene] = (s[h.scene] || 0) + 1; }); return s;
});

/* T1 默认查询：应被真实解析并过滤（5 条） */
out.T1_default = { cards: await cards(), ids: await ids(), chips: await chips() };
out.T1_ok = out.T1_default.cards === 5 &&
  ["CLP-81204", "CLP-81206", "CLP-81211", "CLP-81233", "CLP-81238"].every((c) => out.T1_default.ids.includes(c)) &&
  out.T1_default.chips.some((c) => /场景/.test(c) && /厨房 \/ 台面/.test(c)) &&
  out.T1_default.chips.some((c) => /技能/.test(c) && /折叠衣物/.test(c)) &&
  out.T1_default.chips.some((c) => /结果/.test(c) && /失败/.test(c)) &&
  out.T1_default.chips.some((c) => /质量分/.test(c) && /70/.test(c)) &&
  out.T1_default.chips.some((c) => /时长/.test(c) && /5.?8/.test(c));

/* T2 换一个完全不同的查询：结果必须跟着换 */
await setQuery("仓储分拣线 成功的优质样本");
out.T2 = { cards: await cards(), ids: await ids(), chips: await chips() };
out.T2_ok = out.T2.cards === 2 && out.T2.ids.every((c) => ["CLP-81301", "CLP-81305"].includes(c)) &&
  out.T2.chips.some((c) => /仓储 \/ 分拣线/.test(c)) && out.T2.chips.some((c) => /优质/.test(c));

/* T3 技能类查询 */
await setQuery("螺丝锁付 力控");
out.T3 = { cards: await cards(), ids: await ids() };
out.T3_ok = out.T3.cards === 4 && out.T3.ids.every((c) => /^CLP-8134\d$|^CLP-8135\d$/.test(c));

/* T4 无命中：必须有空态与出路 */
await setQuery("zzzzqq 完全不存在的场景");
out.T4 = { cards: await cards(), empty: await emptyShown(), hasReset: await page.evaluate(() => Array.from(document.querySelectorAll(".pagebody .btn")).some((b) => b.innerText.includes("查看全部数据"))) };
out.T4_ok = out.T4.cards === 0 && out.T4.empty && out.T4.hasReset;

/* T5 空态出路可点：查看全部数据 → 全语料 */
await page.evaluate(() => { const b = Array.from(document.querySelectorAll(".pagebody .btn")).find((x) => x.innerText.includes("查看全部数据")); if (b) b.click(); });
await page.waitForTimeout(400);
out.T5 = { cards: await cards(), chips: (await chips()).length };
out.T5_ok = out.T5.cards === corpusSize && out.T5.chips === 0;

/* T6 左侧筛选面板可点选：勾「四足越障」应把结果收敛到四足数据 */
await page.evaluate(() => {
  const lab = Array.from(document.querySelectorAll(".pagebody label.check")).find((l) => l.innerText.trim() === "四足越障");
  if (lab) lab.querySelector("input").click();
});
await page.waitForTimeout(360);
out.T6 = { cards: await cards(), ids: await ids() };
out.T6_ok = out.T6.cards === 3 && out.T6.ids.every((c) => ["CLP-81431", "CLP-81435", "CLP-81439"].includes(c));

/* T7 顶栏检索 → 检索页，查询驱动结果 */
await goDomain(0); await goSub(0);
await page.evaluate(() => {
  const inp = document.querySelector(".gsearch input");
  const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
  setter.call(inp, "四足越障");
  inp.dispatchEvent(new Event("input", { bubbles: true }));
  inp.closest("form").dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
});
await page.waitForTimeout(600);
out.T7 = { title: await page.evaluate(() => { const t = document.querySelector(".pagehead"); return t ? t.innerText.replace(/\s+/g, " ").slice(0, 24) : ""; }), cards: await cards(), ids: await ids() };
out.T7_ok = /检索/.test(out.T7.title) && out.T7.cards === 3;

out.errors = errors;
out.errorsCount = errors.length;
out.allPass = out.corpusSize === 37 && Object.keys(out.corpusScenes).length === 9 &&
  out.T1_ok && out.T2_ok && out.T3_ok && out.T4_ok && out.T5_ok && out.T6_ok && out.T7_ok && errors.length === 0;

console.log(JSON.stringify(out, null, 2));
await browser.close();
