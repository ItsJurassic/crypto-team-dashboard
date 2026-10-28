// Crypto Team widget for Scriptable (small + medium)
const SITE = "https://itsjurassic.github.io/crypto-team-dashboard/";
const DATA = SITE + "data/widget.json";
const fm = FileManager.local();
const cache = fm.joinPath(fm.documentsDirectory(), "crypto-widget-cache.json");

async function getData() {
  try {
    const r = new Request(DATA + "?t=" + Date.now()); r.timeoutInterval = 10;
    const d = await r.loadJSON(); fm.writeString(cache, JSON.stringify(d)); d._offline = false; return d;
  } catch (e) {
    if (fm.fileExists(cache)) { const d = JSON.parse(fm.readString(cache)); d._offline = true; return d; }
    return null;
  }
}
const money = n => "$" + Number(n).toLocaleString("en-US", {maximumFractionDigits: 2});
const pct = n => (n >= 0 ? "+" : "") + Number(n).toFixed(2) + "%";
const green = new Color("#22c55e"), red = new Color("#ef4444"), dim = new Color("#9ca3af");
function txt(st, s, size, color, bold) { const t = st.addText(s); t.font = bold ? Font.boldSystemFont(size) : Font.systemFont(size); t.textColor = color || Color.white(); t.lineLimit = 1; t.minimumScaleFactor = 0.7; return t; }

async function build(size) {
  const d = await getData();
  const w = new ListWidget();
  const g = new LinearGradient(); g.colors = [new Color("#0f172a"), new Color("#020617")]; g.locations = [0, 1]; w.backgroundGradient = g;
  w.setPadding(12, 14, 12, 14); w.url = SITE;
  w.refreshAfterDate = new Date(Date.now() + 5 * 60 * 1000);
  if (!d) { txt(w, "Crypto Team", 14, null, true); w.addSpacer(6); txt(w, "Offline - no data yet", 12, dim); return w; }

  const head = w.addStack(); head.centerAlignContent();
  const dot = head.addStack(); dot.size = new Size(10, 10); dot.cornerRadius = 5; dot.backgroundColor = new Color(d.color || "#9ca3af");
  head.addSpacer(6); txt(head, "Seedling · " + d.state + (d.coin ? " " + d.coin : ""), 13, null, true);
  w.addSpacer(6);

  const body = w.addStack(); body.layoutHorizontally();
  const left = body.addStack(); left.layoutVertically();
  txt(left, "Paper balance", 10, dim);
  txt(left, money(d.balance), size === "small" ? 20 : 22, null, true);
  txt(left, (d.pnl >= 0 ? "+" : "") + money(d.pnl).replace("$-", "-$") + " (" + pct(d.pnl_pct) + ")", 11, d.pnl >= 0 ? green : red);
  txt(left, "Trial day " + d.trial_day + " of " + d.trial_days, 10, dim);

  if (size !== "small") {
    body.addSpacer();
    const right = body.addStack(); right.layoutVertically();
    for (const s of ["BTC", "ETH"]) {
      const p = (d.prices || {})[s]; if (!p) continue;
      const row = right.addStack(); row.centerAlignContent();
      txt(row, s + " ", 12, dim, true); txt(row, money(p.price) + " ", 12, null, true);
      txt(row, pct(p.chg24), 11, p.chg24 >= 0 ? green : red);
      right.addSpacer(4);
    }
    w.addSpacer(6); txt(w, "Last: " + d.last_trade, 10, dim);
  }
  w.addSpacer();
  txt(w, (d._offline ? "Offline · " : "") + "Updated " + String(d.updated).replace(/^.*, /, ""), 9, d._offline ? new Color("#f59e0b") : dim);
  return w;
}

const size = config.widgetFamily || "medium";
const widget = await build(size);
if (config.runsInWidget) Script.setWidget(widget);
else if (size === "small") await widget.presentSmall(); else await widget.presentMedium();
Script.complete();
