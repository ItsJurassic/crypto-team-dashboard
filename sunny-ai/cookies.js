/* Cookies scoreboard card. FAKE MONEY ONLY.
   Source: data/cookies.json (from /workspace/algo-review/cookies.json via run.sh publish).
   +1 cookie = Good decision that also made fake-money profit. Month-end → usage top-ups with user OK. */
(function () {
  function esc(s) {
    return String(s ?? "").replace(/[<>&]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;" }[c]));
  }
  function spark(hist) {
    const rows = (Array.isArray(hist) ? hist : [])
      .map((h) => ({
        d: h.date || h.day || h.d || "",
        n: +(h.cookies != null ? h.cookies : h.n != null ? h.n : h.count != null ? h.count : 0) || 0,
      }))
      .filter((h) => h.d)
      .slice(-14);
    if (!rows.length) {
      return `<div class="ck-spark m" style="font-size:11px;margin-top:8px">No daily cookie history yet — first Good profitable decision tonight earns cookie #1.</div>`;
    }
    const max = Math.max(1, ...rows.map((r) => r.n));
    const bars = rows
      .map((r) => {
        const h = Math.max(2, Math.round((r.n / max) * 28));
        const tip = `${esc(r.d)}: ${r.n}`;
        return `<span class="ck-bar" title="${tip}" style="height:${h}px"></span>`;
      })
      .join("");
    return `<div class="ck-spark" aria-label="Recent daily cookies">${bars}</div>
      <div class="m" style="font-size:10px;margin-top:4px;display:flex;justify-content:space-between"><span>${esc(rows[0].d)}</span><span>last ${rows.length}d</span><span>${esc(rows[rows.length - 1].d)}</span></div>`;
  }
  function cardHTML(d) {
    const month = d.month || "this month";
    const m = d.cookies_this_month != null ? d.cookies_this_month : 0;
    const life = d.cookies_lifetime != null ? d.cookies_lifetime : m;
    const agg = d.aggression_1_to_10;
    const imp = d.improvement_pct;
    const improving = d.improving;
    const impLabel =
      improving === true ? "Improving" : improving === false ? "Not improving" : improving === "mixed" || improving === "Mixed" ? "Mixed" : "Ungraded";
    const impCls = improving === true ? "g" : improving === false ? "r" : "m";
    const note =
      d.rules ||
      "+1 cookie = Good decision that also made fake-money profit. Monthly cookies can go toward usage top-ups at month end with your OK.";
    const upd = d.updated_ct ? `Updated ${esc(d.updated_ct)} CT` : "";
    return `<style>
.ck-wrap{display:grid;grid-template-columns:1.2fr 1fr;gap:10px;align-items:start}
@media(max-width:700px){.ck-wrap{grid-template-columns:1fr}}
.ck-big{font-size:40px;font-weight:750;letter-spacing:-.02em;line-height:1;color:#d4a24c}
.ck-sub{font-size:12px;color:var(--mut);margin-top:4px}
.ck-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}
.ck-met{background:#11151b;border:1px solid var(--line,#252c36);border-radius:8px;padding:10px}
.ck-met b{display:block;font-size:18px;font-weight:650}
.ck-met span{color:var(--mut);font-size:11px}
.ck-spark{display:flex;align-items:flex-end;gap:3px;height:32px;margin-top:10px}
.ck-bar{flex:1;min-width:4px;background:#d4a24c;border-radius:3px 3px 1px 1px;opacity:.85}
.ck-note{font-size:11.5px;color:var(--mut);margin-top:10px;line-height:1.45}
</style>
<div class="ck-wrap">
  <div>
    <div class="ck-big">🍪 ${esc(m)}</div>
    <div class="ck-sub">This month (${esc(month)})</div>
    <div class="ck-note">${esc(note)}</div>
  </div>
  <div>
    <div class="ck-grid">
      <div class="ck-met"><b>${esc(life)}</b><span>Lifetime</span></div>
      <div class="ck-met"><b>${agg == null ? "—" : esc(agg) + "/10"}</b><span>Aggression</span></div>
      <div class="ck-met"><b class="${impCls}">${imp == null ? "—" : esc(imp) + "%"}</b><span>Improvement</span></div>
      <div class="ck-met"><b class="${impCls}">${esc(impLabel)}</b><span>Trend</span></div>
    </div>
    ${spark(d.history)}
  </div>
</div>
<p class="m" style="font-size:10.5px;margin-top:8px;text-align:center">${upd} · Fake money only · cookies buy nothing real by themselves</p>`;
  }
  async function loadCookies() {
    try {
      const d = await (await fetch("data/cookies.json?" + Date.now())).json();
      return cardHTML(d || {});
    } catch (e) {
      return `<span class="m" style="color:#e5a14c">Cookies scoreboard couldn't load (${esc(e.message)}). It retries with the page.</span>`;
    }
  }
  async function mount(el) {
    if (!el) return;
    el.innerHTML = await loadCookies();
  }
  window.CookiesCard = { mount, loadCookies, cardHTML };
})();
