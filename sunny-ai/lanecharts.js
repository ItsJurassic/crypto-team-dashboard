/* Unified lane charts (Oct 30). One layout for every lane: chart + that lane's fake markers + watchlist. FAKE MONEY ONLY. Real market data only; simulated coins never shown. */
"use strict";(function(){
const $=s=>document.querySelector(s),esc=s=>String(s??"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const J=async u=>{const r=await fetch(u+(u.includes("?")?"&":"?")+"t="+Date.now(),{cache:"no-store"});if(!r.ok)throw 0;return r.json()};
const fp=v=>v==null?"–":v>=1000?"$"+v.toLocaleString("en-US",{maximumFractionDigits:0}):v>=1?"$"+v.toFixed(2):"$"+v.toPrecision(4);
const SIMSYM=new Set(["TOADB"]);
const isSim=x=>{if(!x)return true;const s=typeof x=="string"?x:[x.symbol,x.mint,x.source,x.venue].join(" ");return /^SIM|SIM-?FEED|simulat|synthetic/i.test(s)||SIMSYM.has(String(typeof x=="string"?x:x.symbol).toUpperCase())};
const CG={BTC:"bitcoin",ETH:"ethereum",SOL:"solana",XRP:"ripple",DOGE:"dogecoin",BNB:"binancecoin",AVAX:"avalanche-2",LINK:"chainlink",SUI:"sui",HYPE:"hyperliquid",TRX:"tron",XMR:"monero",ZEC:"zcash"};
const TFS=["1D","1W","1M","1Y"],SPAN={"1D":86400,"1W":604800,"1M":2592000,"1Y":31536000};
const GR={"1D":300,"1W":3600,"1M":21600,"1Y":86400},CGD={"1D":1,"1W":7,"1M":30,"1Y":365};
const LANES=[["stocks","📈 Fake Stocks · slow"],["quick","⚡ Fast Crypto · SOLANA"],["crypto","🐢 Slow Crypto · MAJOR"]];
let TAB=LANES.some(l=>l[0]==localStorage.ucTab)?localStorage.ucTab:"stocks",F=localStorage.ucF||"all",TF=localStorage.ucTF||"1M",SYM={},D={},chart,cs,cache={};
const root=$("#uc");
root.innerHTML=`<div class="chips" id="uc-tabs" style="display:flex;gap:8px;overflow-x:auto;margin:14px 0 4px">${LANES.map(([k,l])=>`<button data-t="${k}" style="flex:0 0 auto;white-space:nowrap">${l}</button>`).join("")}</div>
<div class="card" id="uc-top"><div style="display:flex;justify-content:space-between;align-items:baseline;gap:8px;flex-wrap:wrap"><div><div class="hd" id="uc-lab"></div><span id="uc-sym" style="font-size:20px;font-weight:700"></span> <span id="uc-px" class="px"></span><span id="uc-chg" class="chg"></span></div></div>
<div class="chips" id="uc-tf" style="display:flex;gap:6px;margin:10px 0"></div><div id="uc-chart" style="height:300px"></div><div id="uc-note" class="m s" style="margin-top:8px"></div></div>
<div class="card"><div class="hd" id="uc-wlh"></div><div class="chips" id="uc-f" style="display:flex;gap:6px;flex-wrap:wrap;margin:8px 0"></div><div id="uc-list"></div></div>`;
$("#uc-tabs").onclick=e=>{const b=e.target.closest("button");if(b){TAB=localStorage.ucTab=b.dataset.t;show()}};
$("#uc-f").onclick=e=>{const b=e.target.closest("button");if(b){F=localStorage.ucF=b.dataset.f;list()}};
$("#uc-tf").onclick=e=>{const b=e.target.closest("button");if(b&&!b.disabled){TF=localStorage.ucTF=b.dataset.tf;draw()}};
function mk(){if(chart)return;const el=$("#uc-chart");chart=LightweightCharts.createChart(el,{height:300,layout:{background:{color:"transparent"},textColor:"#9aa1ad",fontFamily:"Inter,sans-serif"},grid:{vertLines:{color:"rgba(255,255,255,.04)"},horzLines:{color:"rgba(255,255,255,.04)"}},timeScale:{borderVisible:false,timeVisible:true,rightOffset:10},handleScroll:{mouseWheel:false,pressedMouseMove:true,horzTouchDrag:true,vertTouchDrag:false},handleScale:{axisPressedMouseMove:{time:true,price:false},axisDoubleClickReset:true,mouseWheel:true,pinch:true},rightPriceScale:{borderVisible:false,autoScale:true,scaleMargins:{top:.12,bottom:.12}}});
 cs=chart.addCandlestickSeries({upColor:"#4fbf8f",downColor:"#e07a7f",wickUpColor:"#4fbf8f",wickDownColor:"#e07a7f",borderVisible:false});new ResizeObserver(()=>chart.applyOptions({width:el.clientWidth})).observe(el)}
const ts=t=>typeof t=="number"?t:Math.floor(new Date(t).getTime()/1000);
async function load(){
 const [stk,act,dash,tt,pf]=await Promise.all(["data/stocks.json","data/active_markets.json","data/dashboard.json","team/trades.json","team/portfolio.json"].map(u=>J(u).catch(()=>null)));
 const L=(act&&act.lanes)||{};
 // Stocks
 const pos=(stk&&stk.positions)||{};
 D.stocks={lab:"📈 Fake Stocks · slow · fake money",rows:((stk&&stk.watch)||[]).filter(w=>!(L.STOCKS)||L.STOCKS.includes(w.symbol)).map(w=>({sym:w.symbol,px:w.price,chg:w.day_pct,sub:w.sector,st:pos[w.symbol]||w.held?"HELD":w.status=="signal"?"SIGNAL":"WATCHING",why:w.why,spark:(w.chart&&w.chart.c||[]).slice(-30),candles:w.chart?w.chart.t.map((t,i)=>({time:t,value:w.chart.c[i]})):[]})),
  trades:((stk&&stk.trades)||[]).filter(t=>t.status=="FILLED").map(t=>({sym:t.symbol,t:ts(t.time),side:t.side.toLowerCase(),px:+t.price,bot:"Stocks"})),tfs:{"1D":"Stock data is daily closes","1W":true,"1M":true,"1Y":true},line:true};
 // Quick (SOLANA): only real coins the lane holds or shadow-trades
 const dp=(dash&&dash.positions)||{};
 const qh=Object.values(dp).filter(p=>p.lane=="SOLANA"&&!isSim(p)).map(p=>p.symbol);
 const ql=(L.SOLANA||[]).map(x=>typeof x=="string"?{symbol:x}:x).filter(x=>!isSim(x)&&x.mint).map(x=>x.symbol);
 D.quick={lab:"⚡ Fast Crypto · SOLANA · fake money",rows:[...new Set([...qh,...ql])].map(s=>({sym:s,st:qh.includes(s)?"HELD":"WATCHING"})),trades:[],dex:true,
  empty:"No real Solana coins to chart right now. Quick trading was unpaused at 1:54 PM CT, but SOLANA holds no positions and none of the real-data coins it scanned passed its filters, so its shadow log is empty. The only coin it listed (TOADB) is a simulated practice coin and is hidden. Coins will appear here automatically as soon as the lane holds or shadow-trades a real one."};
 // Slow Crypto: MAJOR lane only (Seedling is practice, no money), real coins only
 const mh=Object.values(dp).filter(p=>p.lane=="MAJOR"&&!isSim(p)).map(p=>p.symbol),sh=[];
 const cl=[...new Set([...(L.MAJOR||[]),...mh,...sh])].filter(s=>!isSim(s));
 D.crypto={lab:"🐢 Slow Crypto · MAJOR · fake money",rows:cl.map(s=>({sym:s,st:mh.includes(s)||sh.includes(s)?"HELD":"WATCHING",sub:(mh.includes(s)?"MAJOR":"")+((L.MAJOR||[]).includes(s)&&!mh.includes(s)?"MAJOR":"")})),
  trades:[...((dash&&dash.trades)||[]).filter(t=>!isSim(t)&&t.symbol).map(t=>({sym:t.symbol,t:ts(t.time),side:t.side.toLowerCase(),px:+(t.filled||t.price),bot:t.lane||(t.source=="MAJOR"?"MAJOR":t.source)||"MAJOR"}))],tfs:{"1D":true,"1W":true,"1M":true,"1Y":true}};
 D.crypto.rows.sort((a,b)=>(a.st=="HELD"?0:1)-(b.st=="HELD"?0:1)||a.sym.localeCompare(b.sym));
 D.stocks.rows.sort((a,b)=>({HELD:0,SIGNAL:1,WATCHING:2}[a.st]-{HELD:0,SIGNAL:1,WATCHING:2}[b.st])||a.sym.localeCompare(b.sym));
}
const EXK={"1D":"5m","1W":"1h","1M":"4h","1Y":"1D"};let EXP=null;const extras=()=>EXP||(EXP=J("team/candles_extra.json").then(d=>d.c||{}).catch(()=>({})));
let CGQ=Promise.resolve();const cgGet=u=>{const k="cg:"+u;try{const h=JSON.parse(localStorage[k]||"null");if(h&&Date.now()-h.t<9e5)return Promise.resolve(h.d)}catch(e){}
 const p=CGQ.then(async()=>{for(let i=0;i<3;i++){const r=await fetch(u).catch(()=>null);if(r&&r.ok){const d=await r.json();if(Array.isArray(d)){try{localStorage[k]=JSON.stringify({t:Date.now(),d})}catch(e){}return d}}await new Promise(z=>setTimeout(z,3000*(i+1)))}return null});CGQ=p.then(()=>new Promise(z=>setTimeout(z,1500)));return p};
// sanitize: seconds, finite positive numbers, ascending, unique times
function clean(c){const m=new Map();for(const x of c||[]){let t=+x.time;if(t>1e11)t=Math.floor(t/1000);const o=+x.open,h=+x.high,l=+x.low,cl=+x.close;if(!(t>0)||![o,h,l,cl].every(v=>Number.isFinite(v)&&v>0))continue;m.set(t,{time:t,open:o,high:Math.max(h,o,cl),low:Math.min(l,o,cl),close:cl})}return [...m.values()].sort((a,b)=>a.time-b.time)}
function cryptoCandles(s,tf){const k=s+tf;return cache[k]||(cache[k]=cc(s,tf).then(c=>{if(!c.length)delete cache[k];return c}))}
async function cc(s,tf){let c=[],src="";
 try{const r=await fetch(`https://api.exchange.coinbase.com/products/${s}-USD/candles?granularity=${GR[tf]}`);if(r.ok){c=(await r.json()).map(x=>({time:x[0],low:x[1],high:x[2],open:x[3],close:x[4]})).reverse();src="Coinbase Exchange"}}catch(e){}
 if(!c.length){const e=(await extras())[s],x=e&&e[EXK[tf]];if(x&&x.t&&x.t.length){c=x.t.map((t,i)=>({time:t,open:x.o[i],high:x.h[i],low:x.l[i],close:x.c[i]}));src=e.src||"exchange fallback"}}
 if(!c.length&&CG[s]){const d=await cgGet(`https://api.coingecko.com/api/v3/coins/${CG[s]}/ohlc?vs_currency=usd&days=${CGD[tf]}`);if(d){c=d.map(x=>({time:x[0],open:x[1],high:x[2],low:x[3],close:x[4]}));src="CoinGecko"}}
 const now=Date.now()/1000;c=clean(c).filter(x=>x.time>=now-SPAN[tf]);c.src=src;return c}
const spark=v=>{if(!v||v.length<2)return '<svg width="70" height="24"></svg>';const a=Math.min(...v),b=Math.max(...v)||1,up=v[v.length-1]>=v[0];return `<svg width="70" height="24" viewBox="0 0 70 24"><polyline fill="none" stroke="${up?"#4fbf8f":"#e07a7f"}" stroke-width="1.5" points="${v.map((y,i)=>(i*70/(v.length-1)).toFixed(1)+","+(22-(y-a)/((b-a)||1)*20).toFixed(1)).join(" ")}"/></svg>`};
const BC={HELD:"#4fbf8f",SIGNAL:"#d9b26a",WATCHING:"#7c8cf8"};
function list(){const d=D[TAB];$("#uc-f").innerHTML=[["held","Held"],["watch","Watching or setting up"],["all","Show all"]].map(([k,l])=>`<button data-f="${k}" class="${F==k?"on":""}">${l}</button>`).join("");
 const r=d.rows.filter(x=>F=="all"||(F=="held"?x.st=="HELD":x.st!="HELD"));
 $("#uc-wlh").textContent=`What the bots are holding and watching · ${d.rows.length} markets`;
 $("#uc-list").innerHTML=!d.rows.length?`<div class="m" style="padding:14px;border:1px dashed var(--line);border-radius:14px">${esc(d.empty)}</div>`:!r.length?`<div class="m s" style="padding:10px">Nothing in this filter. Try Show all.</div>`:r.map(x=>`<div class="ucr" data-s="${esc(x.sym)}" style="display:flex;align-items:center;gap:10px;padding:10px 8px;border-bottom:1px solid var(--line);cursor:pointer;${x.sym==SYM[TAB]?"background:rgba(124,140,248,.08);border-radius:10px":""}"><div style="flex:1;min-width:0"><b>${esc(x.sym)}</b><div class="m" style="font-size:11px">${esc(x.sub||"")}</div></div><div style="text-align:right"><div>${fp(x.px)}</div><div style="font-size:12px" class="${x.chg>=0?"g":"r"}">${x.chg==null?"":(x.chg>=0?"+":"")+x.chg.toFixed(2)+"%"}</div></div><span class="spk">${spark(x.spark)}</span><span style="font-size:10px;font-weight:700;padding:3px 8px;border-radius:999px;color:${BC[x.st]};border:1px solid ${BC[x.st]}55">${x.st}</span></div>`).join("");
 document.querySelectorAll(".ucr").forEach(e=>e.onclick=()=>{SYM[TAB]=e.dataset.s;list();draw()});
 if(TAB=="crypto")r.forEach(async x=>{if(x.spark)return;const c=await cryptoCandles(x.sym,"1W");if(c.length){x.spark=c.map(z=>z.close);x.px=c[c.length-1].close;x.chg=(c[c.length-1].close/c[Math.max(0,c.length-25)].close-1)*100;if(TAB=="crypto")list()}})}
async function draw(){const d=D[TAB],top=$("#uc-top");$("#uc-lab").textContent=d.lab;
 if(!d.rows.length){top.style.display="none";return}top.style.display="";mk();
 const s=SYM[TAB]&&d.rows.some(r=>r.sym==SYM[TAB])?SYM[TAB]:(SYM[TAB]=d.rows[0].sym),row=d.rows.find(r=>r.sym==s);
 $("#uc-tf").innerHTML=TFS.map(k=>{const a=d.tfs?d.tfs[k]:true;return `<button data-tf="${k}" class="${k==TF?"on":""}" ${a===true?"":`disabled title="${esc(a)}" style="opacity:.4"`}>${k}</button>`}).join("");
 let tf=d.tfs&&d.tfs[TF]!==true?"1M":TF;$("#uc-sym").textContent=s;
 let c=[];if(d.line){const now=Date.now()/1000;c=row.candles.filter(x=>x.time>=now-SPAN[tf]).map(x=>({time:x.time,open:x.value,high:x.value,low:x.value,close:x.value}));
  // daily closes: draw as candles open=prev close
  c=c.map((x,i)=>i?{...x,open:c[i-1].close,high:Math.max(x.close,c[i-1].close),low:Math.min(x.close,c[i-1].close)}:x)}
 else c=await cryptoCandles(s,tf);
 if(d.line)c=clean(c);if(SYM[TAB]!=s||TF!=TF)return;
 cs.setMarkers([]);cs.setData(c);cs.priceScale().applyOptions({autoScale:true});chart.priceScale("right").applyOptions({autoScale:true});
 const ce=$("#uc-chart");ce.style.display=c.length<2?"none":"";$("#uc-empty")&&$("#uc-empty").remove();
 if(c.length<2){ce.insertAdjacentHTML("afterend",`<div id="uc-empty" class="m" style="padding:24px 14px;border:1px dashed var(--line);border-radius:14px;text-align:center">No ${tf} price data for ${esc(s)} right now${c.length?" (only 1 point)":""}. Try another timeframe, or check back after the next refresh.</div>`)}
 else requestAnimationFrame(()=>{chart.applyOptions({width:ce.clientWidth});chart.timeScale().fitContent()});
 const last=c[c.length-1],first=c[0];$("#uc-px").textContent=last?" "+fp(last.close):"";$("#uc-chg").innerHTML=last&&first?`<span class="${last.close>=first.close?"g":"r"}">${last.close>=first.close?"+":""}${((last.close/first.close-1)*100).toFixed(2)}% · ${tf}</span>`:"";
 const tr=d.trades.filter(t=>t.sym==s&&c.length&&t.t>=c[0].time),bk=t=>{let b=c[0].time;for(const x of c)if(x.time<=t)b=x.time;return b};
 cs.setMarkers(tr.map(t=>({time:bk(t.t),position:t.side=="buy"?"belowBar":"aboveBar",color:t.side=="buy"?"#4fbf8f":"#e07a7f",shape:t.side=="buy"?"arrowUp":"arrowDown",text:t.bot+" "+(t.side=="buy"?"Buy ":"Sell ")+fp(t.px)})).sort((a,b)=>a.time-b.time));
 $("#uc-note").textContent=(c.length?"":"No candles available for this market right now. ")+(tr.length?`${tr.length} fake ${tr.length>1?"trades":"trade"} marked (▲ buy, ▼ sell; label = bot). `:"No fake trades by this lane in this range. ")+(d.line?"Daily closes (Yahoo Finance via the stock desk).":"Real market data · "+(c.src||"Coinbase / Kraken / CoinGecko")+".")+(row.why?" "+row.why:"")}
function show(){document.querySelectorAll("#uc-tabs button").forEach(b=>b.classList.toggle("on",b.dataset.t==TAB));list();draw()}
window.__uc={cryptoCandles,D,draw,set:(t,s,f)=>{TAB=t;SYM[t]=s;TF=f;show()}};
load().then(show);setInterval(()=>{cache={};load().then(show)},120000);
})();
