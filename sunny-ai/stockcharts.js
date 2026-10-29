"use strict";
// Stock desk watchlist charts on Charts page. Real market data only: Yahoo Finance daily candles via the stock desk's data/stocks.json.
// Markers = PAPER trades from the stock desk (simulated orders). Practice/simulator coins are never shown.
(function(){
const E=s=>document.querySelector(s), esc=s=>String(s??"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const isSimX=v=>/^SIM/i.test(String(v||""))||/SIM-?FEED|simulat|synthetic/i.test(String(v||""));
const st=document.createElement("style");
st.textContent=`.ctabs{display:flex;gap:6px;overflow-x:auto;scrollbar-width:none;margin:10px 0}.ctabs::-webkit-scrollbar{display:none}.ctabs button{flex:0 0 auto;background:#0b0e14;color:#7b8594;border:1px solid #1c222c;border-radius:999px;padding:7px 12px;font:inherit;font-size:12px;cursor:pointer}.ctabs button.on{background:#13261c;color:#22e08a;border-color:#22e08a}
.sgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:10px}.sbox{border:1px solid #22304a;border-radius:10px;padding:8px}.sbox .t{display:flex;justify-content:space-between;font-size:13px}.sbox svg{width:100%;height:auto;display:block}
.rmd{display:inline-block;font-size:11px;padding:2px 7px;border-radius:999px;border:1px solid #2f6f55;color:#6fd3a6;background:rgba(22,199,132,.08);margin:2px 4px 2px 0}.rmd.ptag{border-color:#7a5a1e;color:#f5c26b;background:rgba(245,166,35,.08)}`;
document.head.appendChild(st);
const wrap=E(".wrap"), cryptoCards=[...wrap.querySelectorAll(":scope > .card")];
cryptoCards.forEach(c=>c.dataset.sec="crypto");
const tabs=document.createElement("div"); tabs.className="ctabs";
tabs.innerHTML=["All","Stocks (slow build)","Crypto"].map((l,i)=>`<button data-t="${["all","stocks","crypto"][i]}" class="${i?"":"on"}">${l}</button>`).join("");
const card=document.createElement("div"); card.className="card"; card.dataset.sec="stocks";
card.innerHTML=`<div class="hd"><span>Stocks · stock desk watchlist</span><a class=m href="stocks.html">stocks desk</a></div>
<div><span class="rmd">Real market data · Yahoo Finance daily</span><span class="rmd ptag">▲▼ Paper trade (simulated orders)</span></div>
<div id="stk-desk" class="sbox" style="margin:8px 0"></div><div id="stk-note" class="m s">Loading…</div><div id="stk" class="sgrid"></div>`;
(cryptoCards[0]||wrap.firstChild).before(tabs); tabs.after(card);
tabs.onclick=e=>{const b=e.target.closest("button"); if(!b) return; tabs.querySelectorAll("button").forEach(x=>x.classList.toggle("on",x===b));
  const t=b.dataset.t; wrap.querySelectorAll(":scope > .card[data-sec]").forEach(c=>c.style.display=(t==="all"||c.dataset.sec===t)?"":"none");};
function svg(w,ch,trades){const W=300,H=90,c=ch.c||[],n=c.length; if(n<2) return "";
  const all=[...c,...(ch.s50||[]),...(ch.s200||[])].filter(x=>x!=null),lo=Math.min(...all),hi=Math.max(...all);
  const X=i=>i/(n-1)*W,Y=v=>H-4-(v-lo)/(hi-lo||1)*(H-8),P=a=>a.map((v,i)=>v==null?"":`${X(i).toFixed(1)},${Y(v).toFixed(1)}`).filter(Boolean).join(" ");
  const t=ch.t||[]; let mk="";
  for(const tr of trades){const ts=Date.parse(tr.time)/1000; if(!t.length||isNaN(ts)) continue; let i=t.findIndex(x=>x>=ts-43200); if(i<0) i=n-1;
    const buy=/buy/i.test(tr.side),x=X(i),y=Y(c[i]);
    mk+=`<g><title>Paper trade · ${buy?"Buy":"Sell"} ${esc(w.symbol)} at $${(+tr.price).toFixed(2)} · ${esc(String(tr.time).slice(0,16))} (simulated order)</title><path d="${buy?`M${x} ${y+3}l-5 8h10z`:`M${x} ${y-3}l-5 -8h10z`}" fill="${buy?"#16c784":"#ea3943"}"/></g>`;}
  return `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none"><polyline fill="none" stroke="#d4a24c" stroke-width="1" points="${P(ch.s200||[])}"/><polyline fill="none" stroke="#2fb3b0" stroke-width="1" points="${P(ch.s50||[])}"/><polyline fill="none" stroke="#3fb68b" stroke-width="1.6" points="${P(c)}"/>${mk}</svg>`;}
async function go(){try{const d=await (await fetch("data/stocks.json?"+Date.now(),{cache:"no-store"})).json();
  const W=(d.watch||[]).filter(w=>!isSimX(w.symbol)), T=(d.trades||[]).filter(t=>!isSimX(t.symbol)&&!/FAIL|REJECT/i.test(t.status||""));
  E("#stk").innerHTML=W.map(w=>{const tr=T.filter(t=>t.symbol===w.symbol);return `<div class="sbox"><div class="t"><b>${esc(w.symbol)} <span class=m>${esc(w.sector||"")}</span></b><span>$${(+w.price).toFixed(2)} <span class="${w.day_pct>=0?"up":"dn"}">${w.day_pct>=0?"+":""}${w.day_pct}%</span></span></div>${svg(w,w.chart||{},tr)}<div class="m" style="font-size:11px">${esc(w.trend||"")} · ${tr.length?tr.length+" paper trade(s)":"no paper trades"} · <span class="rmd" style="font-size:10px">Real market data · Yahoo Finance daily</span></div></div>`}).join("");
  const $f=v=>v==null?"n/a":"$"+(+v).toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2}), P=Object.entries(d.positions||{}), lt=(d.trades||[]).slice(-3).reverse();
  E("#stk-desk").innerHTML=`<div class="t"><b>Stocks paper desk</b><a class=m href="stocks.html">open full desk →</a></div>
  <div class="m" style="font-size:12px">Paper start ${$f(d.start)} · equity <b>${$f(d.equity)}</b> · net <span class="${(d.net_pnl||0)>=0?"up":"dn"}">${$f(d.net_pnl)}</span> · cash ${$f(d.cash)} · ${d.closed||0} closed / ${d.wins||0} wins · ${P.length} open${P.length?": "+P.map(([k])=>esc(k)).join(", "):""}</div>
  ${lt.length?`<div class="m" style="font-size:12px">Latest paper trades: ${lt.map(t=>`<span class="rmd ptag">Paper trade</span>${esc(t.side)} ${esc(t.symbol)} $${(+t.price).toFixed(2)} · ${esc(String(t.reason||"").slice(0,90))}`).join("<br>")}</div>`:`<div class="m" style="font-size:12px">No paper trades yet. Trades with reasons, rules and the backtest are on the <a href="stocks.html">stocks desk page</a>.</div>`}`;
  E("#stk-note").textContent=`${W.length} symbols the stock desk watches · ~6 months of daily closes (green), SMA50 (teal), SMA200 (gold) · ${T.length} paper trade(s) marked ▲ buy / ▼ sell · updated ${new Date(d.updated||Date.now()).toLocaleString("en-US",{timeZone:"America/Chicago",month:"short",day:"numeric",hour:"numeric",minute:"2-digit"})} CT`;
 }catch(e){E("#stk-note").innerHTML=`<span class="dn">Stock charts unavailable right now (${esc(e.message)}).</span>`;}}
go(); setInterval(go,300000);
})();
