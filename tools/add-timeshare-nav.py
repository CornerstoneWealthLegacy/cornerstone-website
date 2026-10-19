#!/usr/bin/env python3
"""Add 'Timeshare Release' to the Practice Areas dropdown (after HOA & Condo Law) and to the
footer Practice Areas column (after International & Cross-Border) across all pages.
Path-prefix aware, idempotent. Pattern copied from add-international-nav.py."""
import glob, re, os
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__))); os.chdir(ROOT)
files = glob.glob("*.html") + glob.glob("articles/*.html") + glob.glob("*/index.html")
files = [f for f in files if not f.startswith(("_reserve/", "_internal/", "node_modules/", "timeshare/"))]
nav_re = re.compile(r'(<a href="([^"]*?)hoa-condo-law"\s+class="dropdown-item[^"]*"\s+role="menuitem">HOA &amp; Condo Law</a>)')
foot_re = re.compile(r'(<a href="([^"]*?)international-law(?:\.html)?">International &amp; Cross-Border</a>)')
nav_added = foot_added = 0
for f in files:
    t = open(f, encoding="utf-8").read(); orig = t
    m = nav_re.search(t)
    if m and 'Timeshare Release</a>' not in t.split('</nav>')[0]:
        t = t.replace(m.group(1), m.group(1) + f'\n            <a href="{m.group(2)}timeshare" class="dropdown-item" role="menuitem">Timeshare Release</a>', 1); nav_added += 1
    fm = foot_re.search(t)
    if fm and 'timeshare">Timeshare Release</a>' not in t[t.find(fm.group(1)):t.find(fm.group(1))+300]:
        t = t.replace(fm.group(1), fm.group(1) + f'\n          <a href="{fm.group(2)}timeshare">Timeshare Release</a>', 1); foot_added += 1
    if t != orig: open(f, "w", encoding="utf-8").write(t)
print(f"Nav dropdown updated: {nav_added} pages | Footer updated: {foot_added} pages")
