# -*- coding: utf-8 -*-
"""人名 -> 职称 的有序替换。先处理「职称+人名」的复合串，再处理裸人名，
避免出现「采集员 · 采集员 A」这类重复。客户公司名不在此列，保持不动。"""
import io, os, re, sys

SRC = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "src"))

# (旧, 新) 顺序敏感：复合串必须排在裸人名之前
RULES = [
    ("采集员 · 林敬", "采集员 A"),
    ("采集员 林敬", "采集员 A"),
    ("质检员 郑雨桐", "质检员"),
    ("项目经理 · 周文韬", "项目经理"),
    ("现场督导 · 何俊", "现场督导"),
    ("质量负责人 · 郑雨桐", "质量负责人"),
    ("您的客户经理 李文琦", "您的客户经理"),
    ("李文琦 · 工作日", "工作日"),
    ("09-10 郑雨桐 · 78", "09-10 质检员 · 78"),
    ("K2 / 林敬", "K2 / 采集员 A"),
    ("K3 / 陈涛", "K3 / 采集员 C"),
    ("K5 / 郭嘉伟", "K5 / 采集员 B"),
    # 裸人名
    ("周文韬", "项目经理"),
    ("李文琦", "项目经理"),
    ("陈嘉禾", "数据工程师"),
    ("郑雨桐", "质检员"),
    ("林敬", "采集员 A"),
    ("郭嘉伟", "采集员 B"),
    ("陈涛", "采集员 C"),
    ("何俊", "现场督导"),
    ("张野", "设备工程师"),
    ("李梦", "标注员 A"),
    ("王一然", "标注员 B"),
    ("赵淼", "标注员 C"),
    ("孙琦", "标注员 D"),
]

NAMES = ["周文韬", "李文琦", "陈嘉禾", "郑雨桐", "林敬", "郭嘉伟", "陈涛", "何俊", "张野", "李梦", "王一然", "赵淼", "孙琦"]

total = 0
for fn in sorted(os.listdir(SRC)):
    if not fn.endswith(".jsx"):
        continue
    p = os.path.join(SRC, fn)
    with io.open(p, encoding="utf-8") as f:
        text = f.read()
    orig = text
    n = 0
    for a, b in RULES:
        c = text.count(a)
        if c:
            text = text.replace(a, b)
            n += c
    if text != orig:
        with io.open(p, "w", encoding="utf-8") as f:
            f.write(text)
        print("  %-22s 替换 %d 处" % (fn, n))
        total += n

print("\n合计替换 %d 处" % total)
print("\n残留人名检查：")
hit = 0
for fn in sorted(os.listdir(SRC)):
    if not fn.endswith(".jsx"):
        continue
    with io.open(os.path.join(SRC, fn), encoding="utf-8") as f:
        t = f.read()
    for nm in NAMES:
        if nm in t:
            for i, line in enumerate(t.split("\n"), 1):
                if nm in line:
                    print("  !! %s:%d %s" % (fn, i, line.strip()[:110]))
                    hit += 1
print("  残留 %d 处" % hit)
