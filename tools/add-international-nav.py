#!/usr/bin/env python3
"""Add 'International & Cross-Border' to the Practice Areas nav dropdown and the
footer Practice Areas column across all site pages. Path-prefix aware (handles
'elder-law.html', '/elder-law', '../elder-law.html'). Idempotent."""
import glob, re, os
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)

files = glob.glob("*.html") + glob.glob("articles/*.html")
nav_added = foot_added = 0

# Nav dropdown item: <a href="...elder-law..." class="dropdown-item...">Elder Law</a>
nav_re = re.compile(r'(<a href="([^"]*elder-law(?:\.html)?)"\s+class="dropdown-item[^"]*"\s+role="menuitem">Elder Law</a>)')
# Footer link: <a href="...elder-law...">Elder Law</a>  (no class)
foot_re = re.compile(r'(<a href="([^"]*elder-law(?:\.html)?)">Elder Law</a>)')

for f in files:
    t = open(f, encoding="utf-8").read()
    if 'international-law' in t and 'dropdown-item' in t and 'International &amp; Cross-Border</a>' in t:
        pass  # nav already has it
    changed = False

    # NAV
    m = nav_re.search(t)
    if m and 'International &amp; Cross-Border</a>' not in t.split('</nav>')[0]:
        href = m.group(2).replace('elder-law', 'international-law')
        item = m.group(1) + f'\n            <a href="{href}" class="dropdown-item" role="menuitem">International &amp; Cross-Border</a>'
        t = t.replace(m.group(1), item, 1)
        nav_added += 1; changed = True

    # FOOTER (only inside footer Practice Areas column — the Elder Law footer link)
    fm = foot_re.search(t)
    if fm:
        # guard: don't double-add in footer
        after = t[t.find(fm.group(1)):]
        if 'international-law' not in after[:200]:
            href = fm.group(2).replace('elder-law', 'international-law')
            item = fm.group(1) + f'\n          <a href="{href}">International &amp; Cross-Border</a>'
            t = t.replace(fm.group(1), item, 1)
            foot_added += 1; changed = True

    if changed:
        open(f, "w", encoding="utf-8").write(t)

print(f"Nav dropdown updated: {nav_added} pages | Footer updated: {foot_added} pages")
