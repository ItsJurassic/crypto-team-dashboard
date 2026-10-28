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
    elif not (k and os.path.isabs(str(k))): l["image"] = None
# Auto-discover lesson .md files (with matching .png) from Sequoia and Owl
known = {l.get("file") for l in lessons}
eras = {}
idx = f"{learn}/historian/index.md"
if os.path.exists(idx):
    for row in open(idx):
        m = re.match(r"\|\s*\d{4}-\d\d-\d\d\s*\|\s*\[[^\]]*\]\(([^)]+\.md)\)\s*\|[^|]*\|\s*([^|]+)\|", row)
        if m: eras["historian/" + m.group(1)] = m.group(2).strip()
for sub, bot in [("historian", "Sequoia (Market Historian)"), ("scholar", "Owl (Strategy Scholar)")]:
    d = f"{learn}/{sub}"
    if not os.path.isdir(d): continue
    for f in sorted(os.listdir(d)):
        m = re.match(r"(\d{4}-\d\d-\d\d)-(.+)\.md$", f)
        rel = f"{sub}/{f}"
        if not m or rel in known: continue
        txt = open(f"{d}/{f}").read()
        t = re.search(r"^#\s+(.+)$", txt, re.M)
        paras = [p.strip() for p in re.split(r"\n\s*\n", txt) if p.strip() and not p.strip().startswith(("#", "*", "|", "!"))]
        png = f"{d}/{f[:-3]}.png"
        lessons.append({"title": t.group(1).strip() if t else m.group(2), "date": m.group(1), "bot": bot,
                        "summary": (paras[0][:400] if paras else ""), "image": png if os.path.exists(png) else None, "file": rel})
for l in lessons:
    k = l.get("image")
    if k and os.path.isabs(str(k)) and os.path.exists(k):
        name = os.path.basename(k); shutil.copy(k, f"{out}/img/{name}"); l["image"] = f"data/img/{name}"
    l.setdefault("era", eras.get(l.get("file")))
    l["id"] = re.sub(r"[^a-z0-9]+", "-", (l.get("file") or l["title"]).lower()).strip("-")
watch = [w for w in load(f"{dash}/watchlist.json", []) if w.get("symbol") and w.get("source_url")]
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
for name, obj in [("status", status), ("trades", trades), ("lessons", lessons), ("playbook", pb), ("scorecard", score), ("watchlist", watch)]:
    json.dump(obj, open(f"{out}/{name}.json", "w"), indent=1, ensure_ascii=False)
# Widget summary (real data only)
cg = load(f"{dash}/cg.json", [])
px = {c["symbol"].upper(): {"price": c.get("current_price"), "chg24": c.get("price_change_percentage_24h")} for c in cg if isinstance(c, dict) and c.get("symbol") in ("btc", "eth")}
colors = {"Watching": "#3b82f6", "Getting ready": "#f59e0b", "Buying": "#22c55e", "Selling": "#ef4444"}
today = datetime.date.today(); d0 = datetime.date(2026, 10, 28)
bal = round(2000 + score["pnl"], 2)
lt = trades[-1] if trades else None
last = None
if lt:
    last = " ".join(str(x) for x in [lt.get("side", "").upper(), lt.get("coin") or lt.get("symbol", ""), ("@ $" + str(lt["price"])) if lt.get("price") else "", lt.get("time", "")[:10]] if x)
cgt = datetime.datetime.fromtimestamp(os.path.getmtime(f"{dash}/cg.json")).astimezone().strftime("%-I:%M %p CT") if os.path.exists(f"{dash}/cg.json") else None
widget = {"state": status.get("state", "Unknown"), "color": colors.get(status.get("state"), "#9ca3af"),
          "coin": status.get("coin", ""), "reason": status.get("reason", ""),
          "balance": bal, "pnl": score["pnl"], "pnl_pct": round(score["pnl"] / 20, 2),
          "trial_day": max(1, min(30, (today - d0).days + 1)), "trial_days": 30,
          "prices": px, "prices_as_of": cgt, "last_trade": last or "No trades yet",
          "updated": score["synced"], "url": "https://itsjurassic.github.io/crypto-team-dashboard/"}
json.dump(widget, open(f"{out}/widget.json", "w"), indent=1, ensure_ascii=False)
print("synced:", {k: (len(v) if isinstance(v, list) else "ok") for k, v in [("trades", trades), ("lessons", lessons), ("playbook", pb)]})
PY
cp -f "$DASH/candles_extra.json" "$SITE/data/candles_extra.json" 2>/dev/null || true  # fallback OHLC (TRX/XMR/LEO/WBT/RAIN/FIGR_HELOC)
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
