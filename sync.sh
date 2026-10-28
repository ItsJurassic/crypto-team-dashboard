#!/usr/bin/env bash
# Copy bot data from the box into data/ and push to GitHub Pages.
# Usage: ./sync.sh            (copy + commit + push if a git remote exists)
#        ./sync.sh --no-push  (copy only)
set -euo pipefail
REMOTE="https://github.com/ItsJurassic/crypto-team-dashboard.git"
SITE="$(cd "$(dirname "$0")" && pwd)"
DASH=/workspace/crypto-dashboard
LEARN=/workspace/crypto-learning
python3 - "$SITE" "$DASH" "$LEARN" <<'PY'
import json, sys, os, re, shutil, datetime
site, dash, learn = sys.argv[1:4]
out = os.path.join(site, "data"); os.makedirs(os.path.join(out, "img"), exist_ok=True)
def load(p, default):
    try: return json.load(open(p))
    except Exception: return default
status = load(f"{dash}/status.json", {"state":"Unknown","coin":"","reason":"Seedling has not reported a status yet.","updated":""})
trades = load(f"{dash}/trades.json", [])
for t in trades:  # ISO time with offset -> unix t
    if "t" not in t: t["t"] = int(datetime.datetime.fromisoformat(t["time"]).timestamp())
lessons = load(f"{dash}/lessons.json", [])
imgmap = {"btc2017": f"{learn}/historian/2026-10-28-btc-2017-cycle.png", "rrsizing": f"{learn}/scholar/risk-reward-sizing.png"}
for l in lessons:
    k = l.get("image")
    src = imgmap.get(k) if k else None
    if src and os.path.exists(src):
        ext = os.path.splitext(src)[1]; shutil.copy(src, f"{out}/img/{k}{ext}"); l["image"] = f"data/img/{k}{ext}"
    else: l["image"] = None
pb = []
pbf = f"{learn}/scholar/playbook.md"
if os.path.exists(pbf):
    pb = [re.sub(r"^\s*[-*]\s*", "", x).strip() for x in open(pbf) if re.match(r"^\s*[-*]\s*G\d+", x)]
if not pb:
    m = re.search(r"\[(.*)\]", open(f"{dash}/consts/playbook.ts").read()) if os.path.exists(f"{dash}/consts/playbook.ts") else None
    pb = json.loads("[" + m.group(1) + "]") if m else []
closed = [t for t in trades if t.get("pnl") is not None]
score = {"start_balance": 2000, "start": "2026-10-28", "end": "2026-11-27",
         "trades": len(trades), "closed": len(closed),
         "pnl": round(sum(t["pnl"] for t in closed), 2) if closed else 0,
         "wins": sum(1 for t in closed if t["pnl"] > 0),
         "largest_loss": min([t["pnl"] for t in closed], default=None),
         "synced": datetime.datetime.now().astimezone().strftime("%b %-d, %Y, %-I:%M %p CT")}
for name, obj in [("status", status), ("trades", trades), ("lessons", lessons), ("playbook", pb), ("scorecard", score)]:
    json.dump(obj, open(f"{out}/{name}.json", "w"), indent=1, ensure_ascii=False)
print("synced:", {k: (len(v) if isinstance(v, list) else "ok") for k, v in [("trades", trades), ("lessons", lessons), ("playbook", pb)]})
PY
[ "${1:-}" = "--no-push" ] && exit 0
cd "$SITE"
git rev-parse --git-dir >/dev/null 2>&1 || git init -q -b main
git remote get-url origin >/dev/null 2>&1 || git remote add origin "$REMOTE"
if true; then
  git add -A data
  git diff --cached --quiet || git commit -qm "Sync bot data $(date '+%F %H:%M %Z')"
  git push -q origin HEAD:main
  echo "pushed"
else
  echo "No git remote yet; data copied but not pushed."
fi
