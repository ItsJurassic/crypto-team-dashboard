"use strict";
// Stock desk watchlist charts on Charts page. Real market data only: Yahoo Finance daily candles via the stock desk's data/stocks.json.
// Markers = PAPER trades from the stock desk (simulated orders). Practice/simulator coins are never shown.
(function(){
const E=s=>document.querySelector(s), esc=s=>String(s??"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const isSimX=v=>/^SIM/i.test(String(v||""))||/SIM-?FEED|simulat|synthetic/i.test(String(v||""));
const st=document.createElement("style");
st.textContent=`.ctabs{display:flex;gap:6px;overflow-x:auto;scrollbar-width:none;margin:10px 0}.ctabs::-webkit-scrollbar{display:none}.ctabs button{flex:0 0 auto;background:#0b0e14;color:#7b8594;border:1px solid #1c222c;border-radius:999px;padding:7px 12px;font:inherit;font-size:12px;cursor:pointer}.ctabs button.on{background:#13261c;color:#22e08a;border-color:#22e08a}
.srows{display:grid;grid-template-columns:repeat(auto-fill,minmax(330px,1fr));gap:4px}.srow{display:grid;grid-template-columns:52px 72px 58px 1fr auto;align-items:center;gap:6px;border:1px solid #22304a;border-radius:8px;padding:4px 8px;font-size:12px;cursor:pointer}.srow.held{border-color:#3fb68b}.srow.sig{border-color:#2fb3b0}.srow svg{width:100%;height:24px;display:block}.bdg{font-size:9px;padding:1px 5px;border-radius:5px;border:1px solid #2a3550;color:#9aa6bb}.bdg.s{color:#5fd6d2;border-color:#2fb3b0}.bdg.h{color:#3fb68b;border-color:#3fb68b}#stkf select{background:#0b0e14;color:#c9d3e6;border:1px solid #1c222c;border-radius:999px;padding:6px 10px;font:inherit;font-size:12px}
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
<div id="stk-desk" class="sbox" style="margin:8px 0"></div><div id="stk-note" class="m s">Loading…</div><div id="stkf" class="ctabs" style="margin:6px 0"></div><div id="stks" class="ctabs" style="margin:0 0 6px"></div><div id="stk" class="srows"></div><div id="stkbig" class="sbox" style="display:none;margin-top:8px"></div>`;
(cryptoCards[0]||wrap.firstChild).before(tabs); tabs.after(card);
tabs.onclick=e=>{const b=e.target.closest("button"); if(!b) return; tabs.querySelectorAll("button").forEach(x=>x.classList.toggle("on",x===b));
  const t=b.dataset.t; wrap.querySelectorAll(":scope > .card[data-sec]").forEach(c=>c.style.display=(t==="all"||c.dataset.sec===t)?"":"none");};
function svg(w,ch,trades,W=300,H=90){const c=ch.c||[],n=c.length; if(n<2) return "";
  const all=[...c,...(ch.s50||[]),...(ch.s200||[])].filter(x=>x!=null),lo=Math.min(...all),hi=Math.max(...all);
  const X=i=>i/(n-1)*W,Y=v=>H-4-(v-lo)/(hi-lo||1)*(H-8),P=a=>a.map((v,i)=>v==null?"":`${X(i).toFixed(1)},${Y(v).toFixed(1)}`).filter(Boolean).join(" ");
  const t=ch.t||[]; let mk="";
  for(const tr of trades){const ts=Date.parse(tr.time)/1000; if(!t.length||isNaN(ts)) continue; let i=t.findIndex(x=>x>=ts-43200); if(i<0) i=n-1;
    const buy=/buy/i.test(tr.side),x=X(i),y=Y(c[i]);
    mk+=`<g><title>Paper trade · ${buy?"Buy":"Sell"} ${esc(w.symbol)} at $${(+tr.price).toFixed(2)} · ${esc(String(tr.time).slice(0,16))} (simulated order)</title><path d="${buy?`M${x} ${y+3}l-5 8h10z`:`M${x} ${y-3}l-5 -8h10z`}" fill="${buy?"#16c784":"#ea3943"}"/></g>`;}
  return `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none"><polyline fill="none" stroke="#d4a24c" stroke-width="1" points="${P(ch.s200||[])}"/><polyline fill="none" stroke="#2fb3b0" stroke-width="1" points="${P(ch.s50||[])}"/><polyline fill="none" stroke="#3fb68b" stroke-width="1.6" points="${P(c)}"/>${mk}</svg>`;}
let WD=[],TD=[],WF="Focus",WS="Signals first";
const rk=w=>w.held?0:w.queued?1:w.status=="signal"?2:w.status=="rejected"?3:4;
const badge=w=>(w.held?'<span class="bdg h">HELD</span> ':"")+(w.status=="signal"||w.queued?'<span class="bdg s">SIGNAL</span>':w.status=="rejected"?'<span class="bdg">REJECTED</span>':'<span class="bdg">WATCH</span>');
function draw(){const secs=[...new Set(WD.map(w=>w.sector).filter(Boolean))].sort();
  E("#stkf").innerHTML=[["Focus","Signals + Held"],["Signals","Signals"],["Held","Held"],["All","Show all "+WD.length]].map(([k,l])=>`<button class="${k==WF?"on":""}" data-f="${k}">${l}</button>`).join("")+`<select aria-label="Sector"><option value="">Sector…</option>${secs.map(x=>`<option ${x==WF?"selected":""}>${esc(x)}</option>`).join("")}</select>`;
  E("#stks").innerHTML=["Signals first","Day %","RSI(2) low","A–Z"].map(x=>`<button class="${x==WS?"on":""}" data-s="${x}">Sort: ${x}</button>`).join("");
  E("#stkf").querySelectorAll("button").forEach(b=>b.onclick=()=>{WF=b.dataset.f;draw()}); E("#stkf select").onchange=e=>{WF=e.target.value||"Focus";draw()};
  E("#stks").querySelectorAll("button").forEach(b=>b.onclick=()=>{WS=b.dataset.s;draw()});
  const srt=WS=="Day %"?(a,b)=>b.day_pct-a.day_pct:WS=="RSI(2) low"?(a,b)=>a.rsi2-b.rsi2:WS=="A–Z"?(a,b)=>a.symbol.localeCompare(b.symbol):(a,b)=>rk(a)-rk(b)||(b.score||0)-(a.score||0)||a.symbol.localeCompare(b.symbol);
  let x=WD.filter(w=>(WF=="All"||WF=="Focus")?true:WF=="Held"?w.held:WF=="Signals"?(w.status=="signal"||w.queued):w.sector==WF).sort(srt), note="";
  if(WF=="Focus"){const f=x.filter(w=>w.held||w.queued||w.status=="signal"); if(f.length) x=f; else {x=x.slice(0,12); note=" · no signals or holdings now, showing top 12";}}
  E("#stk").innerHTML=x.map(w=>`<div class="srow ${w.held?"held":w.status=="signal"?"sig":""}" data-s="${esc(w.symbol)}"><b>${esc(w.symbol)}</b><span style="text-align:right">$${(+w.price).toFixed(2)}</span><span style="text-align:right" class="${w.day_pct>=0?"up":"dn"}">${w.day_pct>=0?"+":""}${w.day_pct}%</span>${svg(w,w.chart||{},TD.filter(t=>t.symbol===w.symbol),90,24)}<span>${badge(w)}</span></div>`).join("");
  E("#stk-note").textContent=`${x.length} of ${WD.length} symbols${note} · tap a row for the full chart · ${TD.length} paper trade(s) marked ▲ buy / ▼ sell`;
  E("#stk").querySelectorAll(".srow").forEach(r=>r.onclick=()=>{const w=WD.find(z=>z.symbol===r.dataset.s), tr=TD.filter(t=>t.symbol===w.symbol), b=E("#stkbig");
    b.style.display=""; b.innerHTML=`<div class="t"><b>${esc(w.symbol)} <span class=m>${esc(w.sector||"")}</span> ${badge(w)}</b><a href="#" class=m id="stkx">close</a></div>${svg(w,w.chart||{},tr,780,260)}<div class="m" style="font-size:12px"><span style="color:#3fb68b">■</span> close · <span style="color:#2fb3b0">■</span> SMA50 · <span style="color:#d4a24c">■</span> SMA200 · 6 months daily · ${esc(w.trend||"")} · RSI2 ${w.rsi2} · RSI14 ${w.rsi14} <span class="rmd">Real market data · Yahoo Finance daily</span>${tr.length?'<span class="rmd ptag">▲▼ Paper trade</span>':""}</div><div class="m" style="font-size:12px">${esc(w.why||"")}</div>`;
    E("#stkx").onclick=e=>{e.preventDefault();b.style.display="none"}; b.scrollIntoView({behavior:"smooth",block:"nearest"});});
}
async function go(){try{const d=await (await fetch("data/stocks.json?"+Date.now(),{cache:"no-store"})).json();
  const W=(d.watch||[]).filter(w=>!isSimX(w.symbol)), T=(d.trades||[]).filter(t=>!isSimX(t.symbol)&&!/FAIL|REJECT/i.test(t.status||""));
  WD=W; TD=T; draw();
  const $f=v=>v==null?"n/a":"$"+(+v).toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2}), P=Object.entries(d.positions||{}), lt=(d.trades||[]).slice(-3).reverse();
  E("#stk-desk").innerHTML=`<div class="t"><b>Stocks paper desk</b><a class=m href="stocks.html">open full desk →</a></div>
  <div class="m" style="font-size:12px">Paper start ${$f(d.start)} · equity <b>${$f(d.equity)}</b> · net <span class="${(d.net_pnl||0)>=0?"up":"dn"}">${$f(d.net_pnl)}</span> · cash ${$f(d.cash)} · ${d.closed||0} closed / ${d.wins||0} wins · ${P.length} open${P.length?": "+P.map(([k])=>esc(k)).join(", "):""}</div>
  ${lt.length?`<div class="m" style="font-size:12px">Latest paper trades: ${lt.map(t=>`<span class="rmd ptag">Paper trade</span>${esc(t.side)} ${esc(t.symbol)} $${(+t.price).toFixed(2)} · ${esc(String(t.reason||"").slice(0,90))}`).join("<br>")}</div>`:`<div class="m" style="font-size:12px">No paper trades yet. Trades with reasons, rules and the backtest are on the <a href="stocks.html">stocks desk page</a>.</div>`}`;
 }catch(e){E("#stk-note").innerHTML=`<span class="dn">Stock charts unavailable right now (${esc(e.message)}).</span>`;}}
go(); setInterval(go,300000);
})();
