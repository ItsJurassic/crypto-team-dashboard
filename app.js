"use strict";
let CB = ["BTC","ETH","SOL","XRP","DOGE"];  // + watchlist coins that Coinbase lists
const IVS = {"1m":60,"5m":300,"15m":900,"1h":3600,"4h":14400,"1D":86400,"1W":604800,"1M":2592000};
const CG_DAYS = {"1m":1,"5m":1,"15m":1,"1h":2,"4h":7,"1D":90,"1W":365,"1M":"max"};
const SCOL = {"Watching":"#4ea1ff","Getting ready to trade":"#f5a623","Buying":"#16c784","Selling":"#ea3943","Paused":"#9e9e9e","Unknown":"#9e9e9e"};
const TEAM = [
 ["Sunny (main assistant)","Your general assistant; coordinates the team and refreshes this dashboard"],
 ["Heron (Crypto Watcher)","Alerts on big moves, volume spikes and your price levels, 24/7"],
 ["Lark (Crypto Pulse, news)","News, X sentiment and on-chain digest every 4 hours"],
 ["Petrel (Macro Watcher)","Heads-up before Fed, CPI, jobs and other events, plus a recap after"],
 ["Seedling (Paper Trader)","Logs each simulated trade and explains the reasoning and signals"],
 ["Willow (Trade Journal Coach)","Reviews each closed trade (mistake or bad luck) and sends a weekly recap"],
 ["Sequoia (Market Historian)","Studies 10 years of top-20 chart history and saves dated lessons"],
 ["Owl (Strategy Scholar)","Studies how people trade and keeps the playbook the other bots use"]];
const $ = s => document.querySelector(s);
const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const fp = v => v == null ? "n/a" : v >= 1000 ? "$" + v.toLocaleString("en-US",{maximumFractionDigits:0}) : v >= 1 ? "$" + v.toFixed(2) : "$" + v.toPrecision(4);
const pc = v => v == null ? '<span class="muted">n/a</span>' : `<span class="${v>=0?"up":"dn"}">${v>=0?"+":""}${v.toFixed(2)}%</span>`;
const fmc = v => v >= 1e12 ? "$"+(v/1e12).toFixed(2)+"T" : v >= 1e9 ? "$"+(v/1e9).toFixed(1)+"B" : "$"+(v/1e6).toFixed(0)+"M";
const ct = (d, o) => new Date(d).toLocaleString("en-US", Object.assign({timeZone:"America/Chicago"}, o||{month:"short",day:"numeric",hour:"numeric",minute:"2-digit"})) + " CT";
const getJSON = async (u) => { const r = await fetch(u, {cache:"no-store"}); if (!r.ok) throw new Error(r.status + " " + u); return r.json(); };

let state = {sym:"BTC", iv:"1h", top:[], trades:[], candles:[], ws:null};
let chart, cs, ls;

// ---------- tabs ----------
document.querySelectorAll(".tabbar button").forEach(b => b.onclick = () => {
  document.querySelectorAll(".tabbar button").forEach(x => x.classList.toggle("on", x === b));
  document.querySelectorAll(".tab").forEach(t => t.classList.toggle("active", t.id === "tab-" + b.dataset.tab));
  if (b.dataset.tab === "overview" && chart) chart.applyOptions({width: $("#chart").clientWidth});
  scrollTo(0,0);
});

// ---------- bot data ----------
async function loadStatus() {
  try {
    const s = await getJSON("data/status.json");
    const col = SCOL[s.state] || "#9e9e9e", dot = $("#dot");
    dot.style.background = col; dot.style.color = col;
    dot.classList.toggle("live", s.state !== "Paused" && s.state !== "Unknown");
    $("#st-state").textContent = "Seedling: " + (s.state === "Unknown" ? "No status yet" : s.state);
    $("#st-coin").textContent = s.coin ? "· " + s.coin : "";
    $("#st-reason").textContent = s.reason || "";
    let chk = ""; try { const w = await getJSON("data/widget.json"); chk = w.updated || ""; } catch {}
    $("#st-upd").textContent = (s.updated ? "Status since " + s.updated.replace(/^.*?, \d{4}, /, "") : "") + (chk ? " · Checked " + chk : "");
  } catch (e) { $("#st-state").textContent = "Status unavailable"; $("#st-reason").textContent = "Could not load data/status.json."; }
}
async function loadBotData() {
  try { state.trades = await getJSON("data/trades.json"); } catch { state.trades = []; }
  const tl = $("#trades");
  tl.innerHTML = state.trades.length ? `<div class="tablewrap"><table><thead><tr><th>Time</th><th>Coin</th><th>Side</th><th>Price</th><th>Qty</th><th style="text-align:left">Why</th></tr></thead><tbody>${
    [...state.trades].sort((a,b)=>b.t-a.t).map(t=>`<tr><td>${ct(t.t*1000)}</td><td>${esc(t.coin)}</td><td class="${t.side==="buy"?"up":"dn"}">${t.side==="buy"?"Buy":"Sell"}</td><td>${fp(t.price)}</td><td>${esc(t.qty)}</td><td style="text-align:left;white-space:normal">${esc(t.reason)}</td></tr>`).join("")}</tbody></table></div>`
    : `<div class="empty"><b>No trades yet.</b> The log fills in as Seedling (Paper Trader) records each simulated trade and Willow (Trade Journal Coach) reviews it.</div>`;
  try {
    const s = await getJSON("data/scorecard.json");
    const now = new Date(), st = new Date(s.start + "T00:00:00-05:00"), en = new Date(s.end + "T23:59:59-06:00");
    const el = Math.max(0, Math.min(30, Math.floor((now - st) / 864e5))), rem = Math.max(0, Math.ceil((en - now) / 864e5));
    const m = [[el,"Days elapsed"],[rem,"Days remaining"],[(s.pnl>=0?"$":"-$")+Math.abs(s.pnl).toFixed(2),"P&L vs $"+s.start_balance.toLocaleString()+" start"],
      [s.closed ? Math.round(100*s.wins/s.closed)+"%" : "n/a","Win rate"],[s.largest_loss!=null ? fp(-s.largest_loss).replace("$","-$") : "n/a","Largest loss"],[s.trades,"Trades logged"]];
    $("#score").innerHTML = m.map(([v,l])=>`<div class="metric"><b>${v}</b><span class="muted small">${l}</span></div>`).join("");
    $("#score-note").textContent = `Trial ${s.start} to ${s.end}. Data synced ${s.synced}.`;
  } catch { $("#score").innerHTML = '<div class="empty">Scorecard not synced yet.</div>'; }
  try {
    const L = await getJSON("data/lessons.json");
    $("#lessons").innerHTML = L.length ? L.sort((a,b)=>b.date.localeCompare(a.date)).map(l=>`<div class="lesson" id="L-${esc(l.id)}"><h2>${esc(l.title)}</h2>${l.image?`<img loading="lazy" src="${esc(l.image)}" alt="${esc(l.title)} chart">`:""}<div class="muted small">${esc(l.date)} · ${esc(l.bot)}</div><p>${esc(l.summary)}</p></div>`).join("")
      : '<div class="empty">No lessons yet.</div>';
    state.lessons = L; drawGrid();
  } catch { $("#lessons").innerHTML = '<div class="empty">No lessons yet.</div>'; }
  try {
    const P = await getJSON("data/playbook.json");
    $("#playbook").outerHTML = P.length ? `<ol id="playbook">${P.map(x=>`<li>${esc(x)}</li>`).join("")}</ol>` : '<div id="playbook" class="empty">Playbook not started.</div>';
  } catch {}
  setMarkers();
}
// ---------- Sequoia progress grid (tap a filled cell to open its chart) ----------
function drawGrid() {
  const L = (state.lessons||[]).filter(l=>l.era), Y0 = 2016, Y1 = new Date().getFullYear();
  const top = state.top.length ? state.top.map(c=>c.symbol.toUpperCase()) : CB;
  const cov = {};
  for (const l of L) { const m = l.era.match(/^([A-Z0-9_]+)\s+(\d{4})(?:\D+(\d{4}))?/); if (!m) continue;
    for (let y = +m[2]; y <= +(m[3]||m[2]); y++) (cov[m[1]+y] ||= []).push(l); }
  const yrs = []; for (let y = Y0; y <= Y1; y++) yrs.push(y);
  $("#grid").innerHTML = `<table class="grid"><thead><tr><th></th>${yrs.map(y=>`<th>${y%2?"":"’"+String(y).slice(2)}</th>`).join("")}</tr></thead><tbody>${
    top.map(s=>`<tr><td>${esc(s)}</td>${yrs.map(y=>{const h=cov[s+y]; return h?`<td><button class="cell on" data-l="${esc(h[0].id)}" aria-label="${esc(s)} ${y}: ${esc(h[0].title)}"></button></td>`:`<td><span class="cell"></span></td>`}).join("")}</tr>`).join("")}</tbody></table>`;
  document.querySelectorAll("#grid .cell.on").forEach(b => b.onclick = () => { const el = document.getElementById("L-"+b.dataset.l); if (el) { el.scrollIntoView({behavior:"smooth"}); el.classList.add("flash"); setTimeout(()=>el.classList.remove("flash"),1500); } });
}
// ---------- news watchlist ----------
async function loadWatch() {
  let W = []; try { W = await getJSON("data/watchlist.json"); } catch {}
  state.watch = W;
  $("#watch").innerHTML = W.length ? W.map(w=>`<div class="lesson"><b>${esc(w.name)} <span class="muted">${esc(w.symbol)}</span></b> <span class="tag">${esc(w.status)}</span>
    <div class="muted small">Added ${esc(w.added_at)} by ${esc(w.added_by)}</div><p>${esc(w.reason)}</p><a href="${esc(w.source_url)}" target="_blank" rel="noopener">Source</a> · <a href="#" data-sym="${esc(w.symbol)}" class="wchart">Chart</a></div>`).join("")
    : '<div class="empty">No new coins on watch yet. When Lark (Crypto Pulse) finds a promising new coin in the news, it shows up here with the reason and source, and Seedling can paper-trade it.</div>';
  document.querySelectorAll(".wchart").forEach(a => a.onclick = e => { e.preventDefault(); document.querySelector('[data-tab="overview"]').click(); setSym(a.dataset.sym); });
  for (const w of W) { const s = w.symbol.toUpperCase(); if (CB.includes(s)) continue;
    try { await getJSON(`https://api.exchange.coinbase.com/products/${s}-USD/ticker`); CB.push(s); } catch {} }
}
$("#team").innerHTML = TEAM.map(([n,d])=>`<div class="lesson"><b>${n}</b><div class="muted small">${d}</div></div>`).join("");

// ---------- chart ----------
function initChart() {
  chart = LightweightCharts.createChart($("#chart"), {autoSize:true, layout:{background:{color:"transparent"},textColor:"#93a0b8"},
    grid:{vertLines:{color:"#1c2740"},horzLines:{color:"#1c2740"}}, rightPriceScale:{borderColor:"#22304a"},
    timeScale:{borderColor:"#22304a",timeVisible:true,secondsVisible:false,tickMarkFormatter:(t,k)=>new Date(t*1000).toLocaleString("en-US",Object.assign({timeZone:"America/Chicago"},k<3?{month:"short",day:"numeric"}:{hour:"numeric",minute:"2-digit"}))},
    localization:{timeFormatter:t=>ct(t*1000)}, handleScale:{axisPressedMouseMove:true}});
  cs = chart.addCandlestickSeries({upColor:"#16c784",downColor:"#ea3943",borderVisible:false,wickUpColor:"#16c784",wickDownColor:"#ea3943"});
  ls = chart.addLineSeries({color:"#4ea1ff",lineWidth:2,visible:false});
  chart.subscribeCrosshairMove(p => {
    if (!p.time) return showTradeNote();
    const hit = state.trades.filter(t => t.coin === state.sym && bucket(t.t) === p.time);
    if (hit.length) $("#trade-note").innerHTML = hit.map(t=>`<b class="${t.side==="buy"?"up":"dn"}">${t.side.toUpperCase()}</b> ${esc(t.coin)} at ${fp(t.price)}, ${ct(t.t*1000)}. Why: ${esc(t.reason)}`).join("<br>");
    else showTradeNote();
  });
}
function bucket(t) { const c = state.candles; for (let i = c.length-1; i >= 0; i--) if (t >= c[i].time) return (i===c.length-1 && t - c[i].time > IVS[state.iv]*1.5) ? null : c[i].time; return null; }
function showTradeNote() {
  const n = state.trades.filter(t=>t.coin===state.sym).length;
  $("#trade-note").textContent = n ? `${n} ${state.sym} trade(s). Green ▲ = buy, red ▼ = sell. Tap a marker's candle to read why.` : `No trades yet for ${state.sym}. Seedling's buys will show as green ▲ and sells as red ▼ on the chart.`;
}
function setMarkers() {
  if (!cs) return;
  const mk = state.trades.filter(t=>t.coin===state.sym).map(t=>({t,b:bucket(t.t)})).filter(x=>x.b!=null).sort((a,b)=>a.b-b.b)
    .map(({t,b})=>({time:b, position:t.side==="buy"?"belowBar":"aboveBar", color:t.side==="buy"?"#16c784":"#ea3943", shape:t.side==="buy"?"arrowUp":"arrowDown", text:(t.side==="buy"?"B ":"S ")+fp(t.price)}));
  (ls.options().visible ? ls : cs).setMarkers(mk); showTradeNote();
}
function agg(c, iv) {
  const out = []; let cur = null;
  for (const k of c) {
    const d = new Date(k.time*1000);
    const key = iv === "4h" ? Math.floor(k.time/14400)*14400 : iv === "1W" ? k.time - ((d.getUTCDay()+6)%7)*86400 : Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1)/1000;
    if (!cur || cur.time !== key) { cur = {time:key, open:k.open, high:k.high, low:k.low, close:k.close}; out.push(cur); }
    else { cur.high = Math.max(cur.high,k.high); cur.low = Math.min(cur.low,k.low); cur.close = k.close; }
  }
  return out;
}
async function cbCandles(sym, gran, pages=1) {
  let all = [], end = Math.floor(Date.now()/1000);
  for (let p = 0; p < pages; p++) {
    const start = end - gran*300;
    const r = await getJSON(`https://api.exchange.coinbase.com/products/${sym}-USD/candles?granularity=${gran}&start=${new Date(start*1000).toISOString()}&end=${new Date(end*1000).toISOString()}`);
    all = all.concat(r); end = start; if (r.length < 290) break;
  }
  const m = new Map(); for (const [t,l,h,o,c] of all) m.set(t,{time:t,open:o,high:h,low:l,close:c});
  return [...m.values()].sort((a,b)=>a.time-b.time);
}
async function extraCandles() {
  if (!state.extra || Date.now() - (state.extraAt||0) > 120000) {
    try { const r = await getJSON("data/candles_extra.json?t=" + Date.now()); state.extra = r.c || {}; state.extraAsOf = r.asOf; state.extraAt = Date.now(); }
    catch { state.extra = state.extra || {}; }
  }
  return state.extra;
}
async function loadChart() {
  const sym = state.sym, iv = state.iv, note = $("#chart-note");
  try {
    if (CB.includes(sym)) {
      let c;
      if (iv === "4h") c = agg(await cbCandles(sym,3600,2),"4h");
      else if (iv === "1W" || iv === "1M") c = agg(await cbCandles(sym,86400,iv==="1M"?4:2),iv);
      else c = await cbCandles(sym, IVS[iv]);
      if (sym !== state.sym || iv !== state.iv) return;
      state.candles = c; ls.applyOptions({visible:false}); cs.applyOptions({visible:true}); ls.setData([]); cs.setData(c);
      note.textContent = `${sym}-USD ${iv} candles from Coinbase Exchange, live via websocket. ${iv==="4h"?"4h built from 1h candles. ":""}${iv==="1W"||iv==="1M"?"Built from daily candles (UTC). ":""}Times shown in CT.`;
    } else if ((await extraCandles())[sym]) {
      const d = state.extra[sym], k = d[iv];
      if (sym !== state.sym || iv !== state.iv) return;
      if (!k) {
        cs.setData([]); ls.setData([]); state.candles = [];
        const have = Object.keys(d).filter(x=>x!=="src").join(", ");
        note.textContent = `${sym}: no ${iv} candles from ${d.src.split(";")[0]}. Available: ${have}.`; return;
      }
      const c = k.c.map((cl,i)=>({time: Array.isArray(k.t) ? k.t[i] : k.t + i*k.st, open:k.o[i], high:k.h[i], low:k.l[i], close:cl}));
      state.candles = c; ls.applyOptions({visible:false}); cs.applyOptions({visible:true}); ls.setData([]); cs.setData(c);
      const age = Math.round((Date.now()/1000 - state.extraAsOf)/60);
      note.textContent = `${sym} ${iv} candles from ${d.src}. Not on Coinbase; snapshot refreshed by the bots (${age} min old). Times shown in CT.`;
    } else {
      const id = (state.top.find(c=>c.symbol.toUpperCase()===sym)||{}).id || ((state.watch||[]).find(w=>w.symbol.toUpperCase()===sym)||{}).coingecko_id;
      if (!id) throw new Error("no CoinGecko id");
      const r = await getJSON(`https://api.coingecko.com/api/v3/coins/${id}/market_chart?vs_currency=usd&days=${CG_DAYS[iv]}`);
      if (sym !== state.sym || iv !== state.iv) return;
      const m = new Map(); for (const [t,v] of r.prices) m.set(Math.floor(t/1000), v);
      const pts = [...m].map(([time,value])=>({time,value})).sort((a,b)=>a.time-b.time);
      state.candles = pts.map(p=>({time:p.time})); cs.setData([]); cs.applyOptions({visible:false}); ls.applyOptions({visible:true}); ls.setData(pts);
      note.textContent = `${sym} is not on Coinbase Exchange in this set; showing a CoinGecko price line (${CG_DAYS[iv]} day${CG_DAYS[iv]===1?"":"s"}), refreshed every 60 s. Times in CT.`;
    }
    chart.timeScale().fitContent(); setMarkers();
  } catch (e) {
    cs.setData([]); ls.setData([]); state.candles = [];
    note.innerHTML = `<span class="dn">Chart data unavailable right now (${esc(e.message)}). Retrying shortly.</span>`;
  }
}
function onTick(sym, price, t) {
  if (sym !== state.sym || !CB.includes(sym)) return;
  const c = state.candles; if (!c.length || c[0].open == null) return;
  const g = IVS[state.iv], last = c[c.length-1];
  let bt = state.iv === "1W" || state.iv === "1M" ? last.time : Math.floor(t/g)*g;
  if (state.iv === "1M") { const d = new Date(t*1000); bt = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1)/1000; }
  if (state.iv === "1W") { const d = new Date(t*1000); const day = Math.floor(t/86400)*86400; bt = day - ((d.getUTCDay()+6)%7)*86400; }
  if (bt > last.time) { const n = {time:bt,open:price,high:price,low:price,close:price}; c.push(n); cs.update(n); }
  else if (bt === last.time) { last.high = Math.max(last.high,price); last.low = Math.min(last.low,price); last.close = price; cs.update(last); }
}

// ---------- prices ----------
const live = {};
function showPx() {
  const L = live[state.sym], row = state.top.find(c=>c.symbol.toUpperCase()===state.sym);
  const p = L ? L.price : row && row.current_price, ch = L ? L.chg : row && row.price_change_percentage_24h;
  $("#px").innerHTML = p != null ? `${fp(p)}<span class="chg">${pc(ch)}</span>` : "–";
}
function connectWS() {
  try {
    const ws = new WebSocket("wss://ws-feed.exchange.coinbase.com"); state.ws = ws;
    ws.onopen = () => ws.send(JSON.stringify({type:"subscribe",product_ids:CB.map(s=>s+"-USD"),channels:["ticker"]}));
    ws.onmessage = ev => { const m = JSON.parse(ev.data); if (m.type !== "ticker") return;
      const sym = m.product_id.split("-")[0], price = +m.price, open = +m.open_24h;
      live[sym] = {price, chg: open ? (price/open-1)*100 : null};
      onTick(sym, price, Math.floor(new Date(m.time).getTime()/1000));
      if (sym === state.sym) showPx();
      const cell = document.querySelector(`[data-px="${sym}"]`); if (cell) cell.textContent = fp(price);
    };
    ws.onclose = () => setTimeout(connectWS, 3000);
  } catch { setTimeout(connectWS, 5000); }
}
async function pollCB() {  // REST backup for prices in case the websocket is blocked
  for (const s of CB) { try { const t = await getJSON(`https://api.exchange.coinbase.com/products/${s}-USD/ticker`);
    if (!state.ws || state.ws.readyState !== 1) { live[s] = Object.assign(live[s]||{}, {price:+t.price}); onTick(s, +t.price, Math.floor(Date.now()/1000)); } } catch {} }
  showPx();
}
async function loadTop() {
  try {
    state.top = await getJSON("https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=20&page=1&price_change_percentage=24h,7d");
    $("#top tbody").innerHTML = state.top.map((c,i)=>{const s=c.symbol.toUpperCase(); return `<tr class="click" data-sym="${esc(s)}"><td>${i+1}</td><td>${esc(c.name)} <span class="muted">${esc(s)}</span></td><td data-px="${esc(s)}">${fp(live[s]?live[s].price:c.current_price)}</td><td>${pc(c.price_change_percentage_24h_in_currency)}</td><td>${pc(c.price_change_percentage_7d_in_currency)}</td><td>${fmc(c.market_cap)}</td></tr>`;}).join("");
    $("#top-note").textContent = "CoinGecko, updated " + ct(Date.now()) + " (every 60 s). Coinbase coins tick live. Tap a row to chart it.";
    document.querySelectorAll("#top tr.click").forEach(r => r.onclick = () => { setSym(r.dataset.sym); scrollTo({top:0,behavior:"smooth"}); });
    const sel = $("#coin"), cur = state.sym;
    const syms = [...new Set([...CB, ...state.top.map(c=>c.symbol.toUpperCase()), ...(state.watch||[]).map(w=>w.symbol.toUpperCase())])];
    sel.innerHTML = syms.map(s=>{const c=state.top.find(x=>x.symbol.toUpperCase()===s);return `<option value="${s}">${(state.watch||[]).some(w=>w.symbol.toUpperCase()===s)?"👀 ":""}${c?esc(c.name)+" ("+s+")":s}${CB.includes(s)?"":" · line"}</option>`}).join("");
    sel.value = cur;
  } catch (e) { $("#top-note").innerHTML = `<span class="dn">Top-20 table unavailable (${esc(e.message)}); retrying in 60 s.</span>`; }
  showPx(); drawGrid();
}
function setSym(s) { state.sym = s; $("#coin").value = s; showPx(); loadChart(); }
$("#coin").innerHTML = CB.map(s=>`<option>${s}</option>`).join("");
$("#coin").onchange = e => setSym(e.target.value);
$("#ivs").innerHTML = Object.keys(IVS).map(k=>`<button data-iv="${k}" class="${k===state.iv?"on":""}">${k}</button>`).join("");
document.querySelectorAll("#ivs button").forEach(b => b.onclick = () => { state.iv = b.dataset.iv; document.querySelectorAll("#ivs button").forEach(x=>x.classList.toggle("on",x===b)); loadChart(); });

initChart(); loadStatus(); loadBotData(); loadWatch().then(loadTop).then(loadChart); connectWS();
setInterval(pollCB, 5000);
setInterval(loadStatus, 15000);
setInterval(loadBotData, 60000);
setInterval(loadTop, 60000);
setInterval(loadWatch, 300000);
setInterval(() => { if (!CB.includes(state.sym) || ["1m","5m"].includes(state.iv)) loadChart(); }, 60000);
if ("serviceWorker" in navigator) navigator.serviceWorker.register("sw.js").catch(()=>{});
