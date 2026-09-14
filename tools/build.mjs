/* ============================================================
   构建脚本
   1) 用本地 Babel 把 src/*.jsx 预编译为 build/*.js（浏览器无需 Babel）
   2) 生成离线单文件 HTML：内联 CSS、编译产物与 React，双击即可打开
   运行：node tools/build.mjs
   ============================================================ */
import fs from "node:fs";
import path from "node:path";
import url from "node:url";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const Babel = require("../vendor/babel-standalone.js");

const here = path.dirname(url.fileURLToPath(import.meta.url));
const ROOT = path.resolve(here, "..");
const SRC = path.join(ROOT, "src");
const OUT = path.join(ROOT, "build");
const VENDOR = path.join(ROOT, "vendor");
const STYLES = path.join(ROOT, "styles");

fs.mkdirSync(OUT, { recursive: true });

const files = fs.readdirSync(SRC).filter((f) => f.endsWith(".jsx")).sort();
let total = 0;

for (const f of files) {
  const code = fs.readFileSync(path.join(SRC, f), "utf8");
  let out;
  try {
    out = Babel.transform(code, {
      filename: f,
      presets: [["react", { runtime: "classic", pragma: "React.createElement" }]],
      compact: false,
      comments: true,
      retainLines: false,
    }).code;
  } catch (err) {
    console.error("\n✗ 编译失败：" + f);
    console.error("  " + err.message);
    const lines = code.split("\n");
    const ln = (err.loc && err.loc.line) || 0;
    for (let i = Math.max(0, ln - 3); i < Math.min(lines.length, ln + 2); i++) {
      console.error("  " + String(i + 1).padStart(4) + " | " + lines[i]);
    }
    process.exit(1);
  }
  fs.writeFileSync(path.join(OUT, f.replace(/\.jsx$/, ".js")), out, "utf8");
  total += out.length;
  console.log("compiled", f, "->", f.replace(/\.jsx$/, ".js"), (out.length / 1024).toFixed(1) + "KB");
}

/* ---------- 离线单文件 ---------- */
const css = ["tokens.css", "app.css"].map((f) => fs.readFileSync(path.join(STYLES, f), "utf8")).join("\n");
const vendor = ["react.js", "react-dom.js"].map((f) => fs.readFileSync(path.join(VENDOR, f), "utf8")).join("\n;\n");
const app = files.map((f) => fs.readFileSync(path.join(OUT, f.replace(/\.jsx$/, ".js")), "utf8")).join("\n;\n");

const html = `<!DOCTYPE html>
<html lang="zh-CN" data-theme="dark">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>具身智能数据生产平台 · 高保真交互原型（离线单文件）</title>
<style>
${css}
</style>
</head>
<body>
<div id="root"></div>
<script>
${vendor}
</script>
<script>
${app}
</script>
</body>
</html>
`;

const single = path.join(ROOT, "具身智能数据生产平台-高保真交互原型.html");
fs.writeFileSync(single, html, "utf8");
console.log("\nsingle file:", single, (html.length / 1024).toFixed(0) + "KB");
console.log("app bundle total:", (total / 1024).toFixed(0) + "KB");
