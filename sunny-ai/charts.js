"use strict";
let CB = ["BTC","ETH","SOL","XRP","DOGE"];  // + watchlist coins that Coinbase lists
const IVS = {"1m":60,"5m":300,"15m":900,"1h":3600,"4h":14400,"1D":86400,"1W":604800,"1M":2592000};
const CG_DAYS = {"1m":1,"5m":1,"15m":1,"1h":2,"4h":7,"1D":90,"1W":365,"1M":"max"};
const SCOL = {"Watching":"#4ea1ff","Getting ready to trade":"#f5a623","Buying":"#16c784","Selling":"#ea3943","Paused":"#9e9e9e","Unknown":"#9e9e9e"};
const $ = s => document.querySelector(s);
const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const fp = v => v == null ? "n/a" : v >= 1000 ? "$" + v.toLocaleString("en-US",{maximumFractionDigits:0}) : v >= 1 ? "$" + v.toFixed(2) : "$" + v.toPrecision(4);
const pc = v => v == null ? '<span class="muted">n/a</span>' : `<span class="${v>=0?"up":"dn"}">${v>=0?"+":""}${v.toFixed(2)}%</span>`;
const fmc = v => v >= 1e12 ? "$"+(v/1e12).toFixed(2)+"T" : v >= 1e9 ? "$"+(v/1e9).toFixed(1)+"B" : "$"+(v/1e6).toFixed(0)+"M";
const ct = (d, o) => new Date(d).toLocaleString("en-US", Object.assign({timeZone:"America/Chicago"}, o||{month:"short",day:"numeric",hour:"numeric",minute:"2-digit"})) + " CT";
const getJSON = async (u) => { const r = await fetch(u, {cache:"no-store"}); if (!r.ok) throw new Error(r.status + " " + u); return r.json(); };

// GUARD: practice/simulator coins (simfeed "SIM..." mints, SIM-FEED source) never render here. Real market data only.
const isSim = x => { if (!x) return false; if (typeof x === "string") return /^SIM/i.test(x) || /SIM-?FEED|simulat|synthetic/i.test(x);
  return ["mint","id","coin","symbol","pair","source","src","lane","coingecko_id"].some(k => x[k] != null && (/^SIM/i.test(String(x[k])) || /SIM-?FEED|simulat|synthetic/i.test(String(x[k])))); };
const SRC_TAG = s => `<span class="rmd">Real market data · ${esc(s)}</span>`;
let state = {sym:"BTC", iv:"1h", top:[], trades:[], candles:[], ws:null};
let chart, cs, ls;
async function loadTrades(){ try { state.trades = (await getJSON("team/trades.json")).filter(t => !isSim(t)); } catch { state.trades = []; } setMarkers(); }
async function loadWatch() {
  let W = []; try { W = await getJSON("team/watchlist.json"); } catch {}
  W = W.filter(w => !isSim(w)); state.watch = W;
  $("#watch").innerHTML = W.length ? W.map(w=>`<div class="lesson"><b>${esc(w.name)} <span class="muted">${esc(w.symbol)}</span></b> <span class="tag">${esc(w.status)}</span>
    <div class="muted small">Added ${esc(w.added_at)} by ${esc(w.added_by)}</div><p>${esc(w.reason)}</p><a href="${esc(w.source_url)}" target="_blank" rel="noopener">Source</a> · <a href="#" data-sym="${esc(w.symbol)}" class="wchart">Chart</a></div>`).join("")
    : '<div class="empty">No new coins on watch yet. When Lark (Crypto Pulse) finds a promising new coin in the news, it shows up here with the reason and source, and Seedling can paper-trade it.</div>';
  document.querySelectorAll(".wchart").forEach(a => a.onclick = e => { e.preventDefault(); setSym(a.dataset.sym); });
  for (const w of W) { const s = w.symbol.toUpperCase(); if (CB.includes(s)) continue;
    try { await getJSON(`https://api.exchange.coinbase.com/products/${s}-USD/ticker`); CB.push(s); } catch {} }
}
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
    if (hit.length) $("#trade-note").innerHTML = hit.map(t=>`<span class="rmd ptag">Fake trade</span> <b class="${t.side==="buy"?"up":"dn"}">${t.side.toUpperCase()}</b> ${esc(t.coin)} at ${fp(t.price)}, ${ct(t.t*1000)}. Why: ${esc(t.reason)}`).join("<br>");
    else showTradeNote();
  });
}
function bucket(t) { const c = state.candles; for (let i = c.length-1; i >= 0; i--) if (t >= c[i].time) return (i===c.length-1 && t - c[i].time > IVS[state.iv]*1.5) ? null : c[i].time; return null; }
function showTradeNote() {
  const n = state.trades.filter(t=>t.coin===state.sym).length;
  $("#trade-note").textContent = n ? `${n} ${state.sym} fake trade(s). Legend: green ▲ = Fake trade buy, red ▼ = Fake trade sell (simulated, not real orders). Tap a marker's candle to read why.` : `No trades yet for ${state.sym}. Fake trade buys show as green ▲ and fake trade sells as red ▼ on the chart (simulated, not real orders).`;
}
function setMarkers() {
  if (!cs) return;
  const mk = state.trades.filter(t=>t.coin===state.sym).map(t=>({t,b:bucket(t.t)})).filter(x=>x.b!=null).sort((a,b)=>a.b-b.b)
    .map(({t,b})=>({time:b, position:t.side==="buy"?"belowBar":"aboveBar", color:t.side==="buy"?"#16c784":"#ea3943", shape:t.side==="buy"?"arrowUp":"arrowDown", text:"Fake trade · "+(t.side==="buy"?"Buy ":"Sell ")+fp(t.price)}));
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
    try { const r = await getJSON("team/candles_extra.json?t=" + Date.now()); state.extra = Object.fromEntries(Object.entries(r.c || {}).filter(([k,v]) => !isSim(k) && !isSim(v && v.src))); state.extraAsOf = r.asOf; state.extraAt = Date.now(); }
    catch { state.extra = state.extra || {}; }
  }
  return state.extra;
}
async function loadChart() {
  const sym = state.sym, iv = state.iv, note = $("#chart-note");
  try {
    if (isSim(sym)) throw new Error("practice/simulator coin blocked on Charts");
    if (CB.includes(sym)) {
      let c;
      if (iv === "4h") c = agg(await cbCandles(sym,3600,2),"4h");
      else if (iv === "1W" || iv === "1M") c = agg(await cbCandles(sym,86400,iv==="1M"?4:2),iv);
      else c = await cbCandles(sym, IVS[iv]);
      if (sym !== state.sym || iv !== state.iv) return;
      state.candles = c; ls.applyOptions({visible:false}); cs.applyOptions({visible:true}); ls.setData([]); cs.setData(c);
      note.textContent = `${sym}-USD ${iv} candles from Coinbase Exchange, live via websocket. ${iv==="4h"?"4h built from 1h candles. ":""}${iv==="1W"||iv==="1M"?"Built from daily candles (UTC). ":""}Times shown in CT.`; $("#src-tag").innerHTML = SRC_TAG("Coinbase Exchange");
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
      note.textContent = `${sym} ${iv} candles from ${d.src}. Not on Coinbase; snapshot refreshed by the bots (${age} min old). Times shown in CT.`; $("#src-tag").innerHTML = SRC_TAG(d.src.split(";")[0].split(" (")[0]);
    } else {
      const id = (state.top.find(c=>c.symbol.toUpperCase()===sym)||{}).id || ((state.watch||[]).find(w=>w.symbol.toUpperCase()===sym)||{}).coingecko_id;
      if (!id) throw new Error("no CoinGecko id");
      const r = await getJSON(`https://api.coingecko.com/api/v3/coins/${id}/market_chart?vs_currency=usd&days=${CG_DAYS[iv]}`);
      if (sym !== state.sym || iv !== state.iv) return;
      const m = new Map(); for (const [t,v] of r.prices) m.set(Math.floor(t/1000), v);
      const pts = [...m].map(([time,value])=>({time,value})).sort((a,b)=>a.time-b.time);
      state.candles = pts.map(p=>({time:p.time})); cs.setData([]); cs.applyOptions({visible:false}); ls.applyOptions({visible:true}); ls.setData(pts);
      note.textContent = `${sym} is not on Coinbase Exchange in this set; showing a CoinGecko price line (${CG_DAYS[iv]} day${CG_DAYS[iv]===1?"":"s"}), refreshed every 60 s. Times in CT.`; $("#src-tag").innerHTML = SRC_TAG("CoinGecko");
    }
    chart.timeScale().fitContent(); setMarkers();
  } catch (e) {
    cs.setData([]); ls.setData([]); state.candles = []; $("#src-tag").innerHTML = "";
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
    state.top = (await getJSON("https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=20&page=1&price_change_percentage=24h,7d")).filter(c => !isSim(c));
    $("#top tbody").innerHTML = state.top.map((c,i)=>{const s=c.symbol.toUpperCase(); return `<tr class="click" data-sym="${esc(s)}"><td>${i+1}</td><td>${esc(c.name)} <span class="muted">${esc(s)}</span></td><td data-px="${esc(s)}">${fp(live[s]?live[s].price:c.current_price)}</td><td>${pc(c.price_change_percentage_24h_in_currency)}</td><td>${pc(c.price_change_percentage_7d_in_currency)}</td><td>${fmc(c.market_cap)}</td></tr>`;}).join("");
    $("#top-note").textContent = "CoinGecko, updated " + ct(Date.now()) + " (every 60 s). Coinbase coins tick live. Tap a row to chart it.";
    document.querySelectorAll("#top tr.click").forEach(r => r.onclick = () => { setSym(r.dataset.sym); scrollTo({top:0,behavior:"smooth"}); });
    const sel = $("#coin"), cur = state.sym;
    const syms = [...new Set([...CB, ...state.top.map(c=>c.symbol.toUpperCase()), ...(state.watch||[]).map(w=>w.symbol.toUpperCase())])].filter(x => !isSim(x));
    sel.innerHTML = syms.map(s=>{const c=state.top.find(x=>x.symbol.toUpperCase()===s);return `<option value="${s}">${(state.watch||[]).some(w=>w.symbol.toUpperCase()===s)?"👀 ":""}${c?esc(c.name)+" ("+s+")":s}${CB.includes(s)?"":" · line"}</option>`}).join("");
    sel.value = cur;
  } catch (e) { $("#top-note").innerHTML = `<span class="dn">Top-20 table unavailable (${esc(e.message)}); retrying in 60 s.</span>`; }
  showPx(); 
}
function setSym(s) { state.sym = s; $("#coin").value = s; showPx(); loadChart(); }
$("#coin").innerHTML = CB.map(s=>`<option>${s}</option>`).join("");
$("#coin").onchange = e => setSym(e.target.value);
$("#ivs").innerHTML = Object.keys(IVS).map(k=>`<button data-iv="${k}" class="${k===state.iv?"on":""}">${k}</button>`).join("");
document.querySelectorAll("#ivs button").forEach(b => b.onclick = () => { state.iv = b.dataset.iv; document.querySelectorAll("#ivs button").forEach(x=>x.classList.toggle("on",x===b)); loadChart(); });

{ const st = document.createElement("style"); st.textContent = ".rmd{display:inline-block;font-size:11px;padding:2px 7px;border-radius:999px;border:1px solid #2f6f55;color:#6fd3a6;background:rgba(22,199,132,.08);margin:2px 4px 2px 0}.rmd.ptag{border-color:#7a5a1e;color:#f5c26b;background:rgba(245,166,35,.08)}"; document.head.appendChild(st); }
initChart(); loadTrades(); loadWatch().then(loadTop).then(loadChart); connectWS();
setInterval(pollCB, 5000);
setInterval(loadTrades, 120000);
setInterval(loadTop, 60000);
setInterval(loadWatch, 300000);
setInterval(() => { if (!CB.includes(state.sym) || ["1m","5m"].includes(state.iv)) loadChart(); }, 60000);
