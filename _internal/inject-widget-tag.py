#!/usr/bin/env python3
"""One-time (idempotent) injector: adds the video-widget script tag before </body>
on every deployed HTML page. Skips _internal, _reserve, node_modules, .git.
Safe to re-run — pages that already carry the tag are left untouched.
Part of the Video Intake Widget rollout (2026-09-02)."""
import os

TAG = '<script src="/widget/truestead-widget.js" defer></script>'
SKIP_DIRS = {'_internal', '_reserve', 'node_modules', '.git'}

def main():
    root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    injected = skipped_nobody = already = 0
    for root, dirs, files in os.walk(root_dir):
        dirs[:] = [d for d in dirs if d not in SKIP_DIRS]
        for fn in files:
            if not fn.endswith('.html'):
                continue
            p = os.path.join(root, fn)
            with open(p, encoding='utf-8', errors='replace') as f:
                html = f.read()
            if TAG in html:
                already += 1
                continue
            idx = html.rfind('</body>')
            if idx == -1:
                skipped_nobody += 1
                continue
            with open(p, 'w', encoding='utf-8') as f:
                f.write(html[:idx] + TAG + '\n' + html[idx:])
            injected += 1
    print(f'injected: {injected}, already had: {already}, no </body>: {skipped_nobody}')

if __name__ == '__main__':
    main()
