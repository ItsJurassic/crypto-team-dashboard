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
const SEL="background:#0b0e14;color:#c9d3e6;border:1px solid #2d3542;border-radius:8px;padding:8px 10px;font:inherit;font-size:13px;max-width:100%";
card.innerHTML=`<div class="hd"><span>Stocks · paper desk watchlist</span><a class=m href="stocks.html">full stocks desk →</a></div>
<div><span class="rmd">Real market data · Yahoo Finance daily</span><span class="rmd ptag">▲▼ Paper trade (simulated orders)</span></div>
<div id="stk-desk" class="sbox" style="margin:8px 0"></div>
<div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin:6px 0"><select id="stk-sel" aria-label="Stock" style="${SEL};min-width:180px"></select><select id="stk-flt" aria-label="Filter" style="${SEL}"></select><select id="stk-sort" aria-label="Sort" style="${SEL}"></select><div id="stk-px" class="px" style="font-size:22px"></div></div>
<div id="stk-tf" class="ctabs" style="margin:4px 0"></div><div id="stk-info" class="m" style="font-size:12px"></div><div id="stk-chart" style="height:340px"></div>
<div class="m" style="font-size:12px"><span style="color:#3fb68b">■</span> close · <span style="color:#2fb3b0">■</span> SMA50 · <span style="color:#d4a24c">■</span> SMA200 · daily closes stored by the stock desk</div>
<div id="stk-note" class="m s">Loading…</div><div id="stk-why" class="m" style="font-size:12px"></div>
<div class="hd" style="margin-top:12px"><span>Watchlist</span><span class=m>same list as the Desk</span></div><div id="stk-wl"></div><div id="stk" style="display:none"></div>`;
const qcard=document.createElement("div"); qcard.className="card"; qcard.dataset.sec="quick";
qcard.innerHTML=`<div class="hd"><span>Quick trades · SOLANA lane coins</span><a class=m href="./">desk →</a></div>
<div><span class="rmd">Real market data · GeckoTerminal DEX (Solana)</span><span class="rmd ptag">▲▼ Paper trade (simulated orders)</span></div>
<div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin:8px 0"><select id="q-sel" aria-label="Quick-trade coin" style="${SEL};min-width:200px"></select><select id="q-flt" aria-label="Filter" style="${SEL}"><option value="all">All real coins</option><option value="desk">Desk-scanned only</option><option value="ref">Reference Solana coins</option><option value="traded">Fake-traded only</option></select><div id="q-px" class="px" style="font-size:22px"></div></div>
<div id="q-dl" style="margin:6px 0"></div><div id="q-ivs" class="ctabs" style="margin:4px 0"></div><div id="q-chart" style="height:340px"></div><div id="q-note" class="m s">Loading…</div><div id="q-trades" class="m" style="font-size:12px"></div>`;
(cryptoCards[0]||wrap.firstChild).before(tabs); tabs.after(card); card.after(qcard);
tabs.innerHTML=["All","Stocks (slow build)","Quick trades (Solana)","Crypto"].map((l,i)=>`<button data-t="${["all","stocks","quick","crypto"][i]}">${l}</button>`).join("");
let TAB=localStorage.chartTab||"all", SC=null, QC=null;
function showTab(t){TAB=t;localStorage.chartTab=t;tabs.querySelectorAll("button").forEach(x=>x.classList.toggle("on",x.dataset.t===t));
  wrap.querySelectorAll(":scope > .card[data-sec]").forEach(c=>c.style.display=(t==="all"||c.dataset.sec===t)?"":"none");}
tabs.onclick=e=>{const b=e.target.closest("button"); if(b) showTab(b.dataset.t);};
showTab(TAB);
const DLp=new URLSearchParams(location.search),DLt=DLp.get("tab");
const DL=DLt&&DLp.get("sym")?{tab:DLt,sym:DLp.get("sym"),t:+DLp.get("t")||0,px:+DLp.get("px")||0,side:(DLp.get("side")||"buy").toLowerCase(),done:false}:null;
if(["stocks","quick","crypto","all"].includes(DLt))showTab(DLt);
const ctF=t=>new Date(t*1000).toLocaleString("en-US",{timeZone:"America/Chicago",month:"short",day:"numeric",hour:"numeric",minute:"2-digit"})+" CT";
const pF=p=>"$"+(p>=1?(+p).toFixed(2):(+p).toPrecision(4));
const TFS=["1m","5m","15m","1h","4h","1d","1w","1mo","1y","All"];
function tfBar(el,avail,cur,on){el.innerHTML=TFS.map(k=>{const a=avail(k);return `<button data-tf="${k}" class="${k===cur?"on":""}" ${a===true?"":`disabled title="${esc(a)}" style="opacity:.4;cursor:not-allowed"`}>${k}</button>`}).join("");el.querySelectorAll("button").forEach(b=>b.onclick=()=>{if(!b.disabled)on(b.dataset.tf)})}
function dlMark(series,chartObj,times,lab,buy,sc){let b=null;if(times.length&&DL.t>=times[0]-86400){b=times.reduce((a,x)=>x<=DL.t?x:a,times[0])}
  if(DL.pl){try{DL.pl.s.removePriceLine(DL.pl.l)}catch(e){}}
  if(DL.px)DL.pl={s:series,l:series.createPriceLine({price:DL.px,color:"#f5c26b",lineWidth:2,lineStyle:2,axisLabelVisible:true,title:"Fake trade · "+lab})};
  if(!DL.done&&b!=null){DL.done=true;const i=times.indexOf(b),lo=times[Math.max(0,i-40)],hi=times[Math.min(times.length-1,i+40)];setTimeout(()=>{try{chartObj.timeScale().setVisibleRange({from:lo,to:hi})}catch(e){}},50);setTimeout(()=>sc.scrollIntoView({behavior:"smooth",block:"center"}),300)}
  return b==null?null:{time:b,position:buy?"belowBar":"aboveBar",color:"#f5c26b",shape:buy?"arrowUp":"arrowDown",size:2,text:"Fake trade · "+lab};}
const LW=()=>window.LightweightCharts;
const mkChart=el=>LW().createChart(el,{autoSize:true,layout:{background:{color:"transparent"},textColor:"#93a0b8"},grid:{vertLines:{color:"#1c2740"},horzLines:{color:"#1c2740"}},rightPriceScale:{borderColor:"#22304a"},timeScale:{borderColor:"#22304a",timeVisible:true},localization:{priceFormatter:p=>p>=1?p.toFixed(2):p.toPrecision(4),timeFormatter:t=>new Date(t*1000).toLocaleString("en-US",{timeZone:"America/Chicago",month:"short",day:"numeric",hour:"numeric",minute:"2-digit"})+" CT"}});
let STF=localStorage.stkTf||"All",SCs,S50,S200,SSYM=localStorage.stkSym||"",SF="all",SS="signals";
function svg(w,ch,trades,W=300,H=90){const c=ch.c||[],n=c.length; if(n<2) return "";
  const all=[...c,...(ch.s50||[]),...(ch.s200||[])].filter(x=>x!=null),lo=Math.min(...all),hi=Math.max(...all);
  const X=i=>i/(n-1)*W,Y=v=>H-4-(v-lo)/(hi-lo||1)*(H-8),P=a=>a.map((v,i)=>v==null?"":`${X(i).toFixed(1)},${Y(v).toFixed(1)}`).filter(Boolean).join(" ");
  const t=ch.t||[]; let mk="";
  for(const tr of trades){const ts=Date.parse(tr.time)/1000; if(!t.length||isNaN(ts)) continue; let i=t.findIndex(x=>x>=ts-43200); if(i<0) i=n-1;
    const buy=/buy/i.test(tr.side),x=X(i),y=Y(c[i]);
    mk+=`<g><title>Paper trade · ${buy?"Buy":"Sell"} ${esc(w.symbol)} at $${(+tr.price).toFixed(2)} · ${esc(String(tr.time).slice(0,16))} (simulated order)</title><path d="${buy?`M${x} ${y+3}l-5 8h10z`:`M${x} ${y-3}l-5 -8h10z`}" fill="${buy?"#16c784":"#ea3943"}"/></g>`;}
  return `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none"><polyline fill="none" stroke="#d4a24c" stroke-width="1" points="${P(ch.s200||[])}"/><polyline fill="none" stroke="#2fb3b0" stroke-width="1" points="${P(ch.s50||[])}"/><polyline fill="none" stroke="#3fb68b" stroke-width="1.6" points="${P(c)}"/>${mk}</svg>`;}
let WD=[],TD=[],ACTM=null;
const actGet=async()=>{try{ACTM=await (await fetch("data/active_markets.json?"+Date.now(),{cache:"no-store"})).json()}catch(e){}return ACTM};
const rk=w=>w.held?0:w.queued?1:w.status=="signal"?2:w.status=="rejected"?3:4;
const badge=w=>(w.held?'<span class="bdg h">HELD</span> ':"")+(w.status=="signal"||w.queued?'<span class="bdg s">SIGNAL</span>':w.status=="rejected"?'<span class="bdg">REJECTED</span>':'<span class="bdg">WATCH</span>');
function list(){const srt=SS=="day"?(a,b)=>b.day_pct-a.day_pct:SS=="rsi"?(a,b)=>a.rsi2-b.rsi2:SS=="az"?(a,b)=>a.symbol.localeCompare(b.symbol):(a,b)=>rk(a)-rk(b)||(b.score||0)-(a.score||0)||a.symbol.localeCompare(b.symbol);
  return WD.filter(w=>SF=="all"?true:SF=="held"?w.held:SF=="signals"?(w.status=="signal"||w.queued||w.held):SF=="traded"?TD.some(t=>t.symbol===w.symbol):w.sector==SF).sort(srt)}
function draw(){const secs=[...new Set(WD.map(w=>w.sector).filter(Boolean))].sort();
  E("#stk-flt").innerHTML=[["all","All "+WD.length+" stocks"],["signals","Signals + held"],["held","Held only"],["traded","Fake-traded"]].map(([k,l])=>`<option value="${k}">${l}</option>`).join("")+`<optgroup label="Sector">${secs.map(x=>`<option value="${esc(x)}">${esc(x)}</option>`).join("")}</optgroup>`; E("#stk-flt").value=SF;
  E("#stk-sort").innerHTML=[["signals","Sort: signals first"],["day","Sort: day %"],["rsi","Sort: RSI(2) low"],["az","Sort: A–Z"]].map(([k,l])=>`<option value="${k}">${l}</option>`).join(""); E("#stk-sort").value=SS;
  let x=list(), note=""; if(!x.length){x=WD.slice(); note=" (none match this filter, showing all)";}
  if(!x.some(w=>w.symbol===SSYM)) SSYM=(x[0]||{}).symbol||"";
  E("#stk-sel").innerHTML=x.map(w=>`<option value="${esc(w.symbol)}">${esc(w.symbol)} · $${(+w.price).toFixed(2)} ${w.day_pct>=0?"+":""}${w.day_pct}%${w.held?" · HELD":w.status=="signal"||w.queued?" · SIGNAL":""}</option>`).join(""); E("#stk-sel").value=SSYM;
  E("#stk").innerHTML=x.map(w=>`<div class="srow ${w.held?"held":w.status=="signal"?"sig":""}" data-s="${esc(w.symbol)}"><b>${esc(w.symbol)}</b><span style="text-align:right">$${(+w.price).toFixed(2)}</span><span style="text-align:right" class="${w.day_pct>=0?"up":"dn"}">${w.day_pct>=0?"+":""}${w.day_pct}%</span>${svg(w,w.chart||{},TD.filter(t=>t.symbol===w.symbol),90,24)}<span>${badge(w)}</span></div>`).join("");
  E("#stk").querySelectorAll(".srow").forEach(r=>r.onclick=()=>{pick(r.dataset.s);E("#stk-sel").scrollIntoView({behavior:"smooth",block:"center"})});
  E("#stk-note").textContent=`${x.length} of ${WD.length} stocks${note} · pick one from the dropdown · ${TD.length} fake trade(s) marked ▲ buy / ▼ sell`;
  pick(SSYM);}
function pick(sym){SSYM=sym;localStorage.stkSym=sym;E("#stk-sel").value=sym;const w=WD.find(z=>z.symbol===sym);if(!w)return;
  if(!LW()){E("#stk-note").textContent="Chart library didn't load. Reload to retry.";return}
  if(!SC){SC=mkChart(E("#stk-chart"));SCs=SC.addLineSeries({color:"#3fb68b",lineWidth:2});S50=SC.addLineSeries({color:"#2fb3b0",lineWidth:1,priceLineVisible:false,lastValueVisible:false});S200=SC.addLineSeries({color:"#d4a24c",lineWidth:1,priceLineVisible:false,lastValueVisible:false});}
  const ch=w.chart||{},t=ch.t||[],ser=a=>(a||[]).map((v,i)=>v==null||t[i]==null?null:{time:t[i],value:v}).filter(Boolean);
  SCs.setData(ser(ch.c));S50.setData(ser(ch.s50));S200.setData(ser(ch.s200));
  const tr=TD.filter(z=>z.symbol===sym),mk=[];for(const z of tr){const ts=Date.parse(z.time)/1000;if(isNaN(ts)||!t.length)continue;let i=t.findIndex(x=>x>=ts-43200);if(i<0)i=t.length-1;const buy=/buy/i.test(z.side);mk.push({time:t[i],position:buy?"belowBar":"aboveBar",color:buy?"#16c784":"#ea3943",shape:buy?"arrowUp":"arrowDown",text:"Paper "+(buy?"buy":"sell")})}
  if(DL&&DL.tab==="stocks"&&DL.sym.toUpperCase()===sym){const buy=DL.side!=="sell",m=dlMark(SCs,SC,t,(buy?"Bought ":"Sold ")+pF(DL.px)+" · "+ctF(DL.t),buy,E("#stk-chart"));if(m)mk.push(m);else E("#stk-why").insertAdjacentHTML("afterbegin",'<span class="rmd ptag">Fake trade</span> trade time is outside the stored daily data. ');}
  mk.sort((a,b)=>a.time-b.time);SCs.setMarkers(mk);
  const span=t.length?t[t.length-1]-t[0]:0,RG={"1w":7,"1mo":30,"1y":365};
  const av=k=>["1m","5m","15m","1h","4h"].includes(k)?"Not available: the stock desk stores daily candles only (intraday Yahoo data isn't reachable from the browser)":RG[k]&&span<RG[k]*86400*0.9?"Not available: only "+Math.round(span/86400)+" days of daily data stored":true;
  if(av(STF)!==true)STF="All";
  const fit=()=>{if(DL&&DL.done&&DL.sym.toUpperCase()===sym&&!fit.user)return;if(RG[STF]&&t.length){SC.timeScale().setVisibleRange({from:t[t.length-1]-RG[STF]*86400,to:t[t.length-1]})}else SC.timeScale().fitContent()};
  tfBar(E("#stk-tf"),av,STF,k=>{STF=k;localStorage.stkTf=k;fit.user=1;pick(SSYM)});fit();
  E("#stk-px").innerHTML=`$${(+w.price).toFixed(2)} <span class="chg ${w.day_pct>=0?"up":"dn"}">${w.day_pct>=0?"+":""}${w.day_pct}%</span>`;
  E("#stk-info").innerHTML=`<b>${esc(w.symbol)}</b> ${esc(w.sector||"")} ${badge(w)} · ${esc(w.trend||"")} · RSI2 ${w.rsi2} · RSI14 ${w.rsi14}${tr.length?' <span class="rmd ptag">▲▼ Paper trade</span>':""}`;
  E("#stk-why").textContent=w.why||"";}
E("#stk-sel").onchange=e=>pick(e.target.value);E("#stk-flt").onchange=e=>{SF=e.target.value;draw()};E("#stk-sort").onchange=e=>{SS=e.target.value;draw()};
async function go(){try{const d=await (await fetch("data/stocks.json?"+Date.now(),{cache:"no-store"})).json();
  const W=(d.watch||[]).filter(w=>!isSimX(w.symbol)), T=(d.trades||[]).filter(t=>!isSimX(t.symbol)&&!/FAIL|REJECT/i.test(t.status||""));
  await actGet(); const AS=ACTM&&ACTM.stocks; const dls=DL&&DL.tab==="stocks"?DL.sym.toUpperCase():"";
  WD=AS?W.filter(w=>AS.includes(w.symbol)||w.symbol===dls):W; TD=T; if(DL&&DL.tab==="stocks"&&!DL.used){DL.used=1;SF="all";SSYM=DL.sym.toUpperCase();} draw();
  const $f=v=>v==null?"n/a":"$"+(+v).toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2}), P=Object.entries(d.positions||{}), lt=(d.trades||[]).slice(-3).reverse();
  E("#stk-desk").innerHTML=`<div class="t"><b>Long-term stocks · fake money desk</b></div>
  <div class="m" style="font-size:12px">Fake money start ${$f(d.start)} · equity <b>${$f(d.equity)}</b> · net <span class="${(d.net_pnl||0)>=0?"up":"dn"}">${$f(d.net_pnl)}</span> · cash ${$f(d.cash)} · ${d.closed||0} closed / ${d.wins||0} wins · ${P.length} open${P.length?": "+P.map(([k])=>esc(k)).join(", "):""}</div>
  ${lt.length?`<div class="m" style="font-size:12px">Latest fake trades: ${lt.map(t=>`<span class="rmd ptag">Fake trade</span>${esc(t.side)} ${esc(t.symbol)} $${(+t.price).toFixed(2)} · ${esc(String(t.reason||"").slice(0,90))}`).join("<br>")}</div>`:`<div class="m" style="font-size:12px">No fake trades yet. Trades with reasons, rules and the backtest are on the <a href="stocks.html">stocks desk page</a>.</div>`}`;
 }catch(e){E("#stk-note").innerHTML=`<span class="dn">Stock charts unavailable right now (${esc(e.message)}).</span>`;}}
go(); setInterval(go,300000);
if(window.Watchlist)Watchlist.mount(E("#stk-wl"),{onPick:s=>{showTab(TAB==="crypto"||TAB==="quick"?"stocks":TAB);SF="all";SSYM=s;draw();E("#stk-chart").scrollIntoView({behavior:"smooth",block:"center"})}});
// ---- Quick trades (SOLANA lane): one big DEX chart + dropdown. Real coins only (GeckoTerminal public API); SIM practice coins are filtered out.
const REF=[["BONK","DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263"],["WIF","EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm"],["POPCAT","7GCihgDB8fe6KNjn2MYtkzZcRjQy3t9GHdC8uHYmW2hr"],["JUP","JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN"],["TRUMP","6p6xgHyF7AeE6TZkSmFsko444wqoP15icUSqi2jfGiPN"]];
const QIV={"1m":["minute",1,300],"5m":["minute",5,300],"15m":["minute",15,300],"1h":["hour",1,300],"4h":["hour",4,300],"1d":["day",1,300],"1w":["hour",1,168],"1mo":["hour",4,180],"1y":["day",1,365],"All":["day",1,1000]};
let QL=[],QM=localStorage.qMint||"",QIVK=QIV[localStorage.qIv]?localStorage.qIv:"15m",QF="all",QCs=null,QT=[];const poolC={};
const okMint=m=>m&&!isSimX(m)&&!/^MAJOR/i.test(m)&&/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(m);
const gt=async u=>{const c=new AbortController(),to=setTimeout(()=>c.abort(),10000);try{const r=await fetch("https://api.geckoterminal.com/api/v2/"+u,{signal:c.signal,headers:{Accept:"application/json"}});if(r.status==429)throw new Error("rate limited, retry in a minute");if(!r.ok)throw new Error("HTTP "+r.status);return r.json()}finally{clearTimeout(to)}};
E("#q-ivs").innerHTML=Object.keys(QIV).map(k=>`<button data-iv="${k}" title="${k=="All"?"Pool lifetime (daily candles, up to 1000 days)":""}">${k}</button>`).join("");
E("#q-ivs").querySelectorAll("button").forEach(b=>b.onclick=()=>{if(b.disabled)return;QIVK=b.dataset.iv;localStorage.qIv=QIVK;if(DL){DL.user=1;DL.pick=1}qchart()});
function qopts(){const x=QL.filter(q=>QF=="all"||(QF=="desk"&&q.desk)||(QF=="ref"&&!q.desk)||(QF=="traded"&&q.traded));
  if(!x.some(q=>q.mint===QM))QM=(x[0]||QL[0]||{}).mint||"";
  E("#q-sel").innerHTML=x.map(q=>`<option value="${q.mint}">${esc(q.symbol)}${q.traded?" · fake-traded":q.desk?" · desk scanned":" · reference"}</option>`).join("")||'<option value="">No coins in this filter</option>';E("#q-sel").value=QM;}
async function qload(){let d=null;try{d=await (await fetch("data/dashboard.json?"+Date.now())).json()}catch(e){}
  const M=new Map();const add=(sym,mint,o)=>{if(!okMint(mint))return;const q=M.get(mint)||{symbol:sym||mint.slice(0,6),mint,desk:false,traded:false};Object.assign(q,o);M.set(mint,q)};
  QT=[];if(d){for(const k of ["kills","judge_rejections","calibration"])for(const r of d[k]||[])if(r.lane!=="MAJOR")add(r.symbol,r.mint,{desk:true});
    for(const t of d.trades||[])if(okMint(t.mint)&&!isSimX(t.source)){add(t.symbol,t.mint,{desk:true,traded:true});QT.push(t)}
    for(const [m,p] of Object.entries(d.positions||{}))if(p.lane!=="MAJOR")add(p.symbol,m,{desk:true,traded:true,held:true});}
  const desk=[...M.values()].sort((a,b)=>(b.traded-a.traded)||a.symbol.localeCompare(b.symbol));
  await actGet(); const AQ=ACTM&&ACTM.quick_mints;
  QL=AQ?desk.filter(q=>AQ.includes(q.mint)):[...desk,...REF.filter(([,m])=>!M.has(m)).map(([s,m])=>({symbol:s,mint:m,desk:false,traded:false}))];
  if(AQ&&!QL.length&&!(DL&&DL.tab==="quick"))E("#q-chart").style.display="none";
  if(DL&&DL.tab==="quick"&&!DL.used){DL.used=1;if(!okMint(DL.sym)){DL.sim=1}else{QF="all";QM=DL.sym;if(!QL.some(q=>q.mint===QM))QL.unshift({symbol:DLp.get("s")||QM.slice(0,6),mint:QM,desk:true,traded:true});const age=Date.now()/1000-DL.t;QIVK=age<4.5*3600?"1m":age<24*3600?"5m":age<70*3600?"15m":age<12*86400?"1h":age<45*86400?"4h":age<280*86400?"1d":"All";}}
  qopts(); E("#q-note").textContent=AQ?`${QL.length} coin(s) on the SOLANA lane's active list (held or shadow-trading). Coins no bot lists are removed and come back when a bot lists them again.`:`${desk.length} real coin(s) the SOLANA lane scanned or traded, plus ${QL.length-desk.length} reference Solana coins. Practice (SIM) coins are never charted.${d?"":" Desk data unavailable, showing reference coins only."}`;
  if(DL&&DL.sim){E("#q-dl").innerHTML=`<div class="sbox" style="border-color:#7a5a1e"><span class="rmd ptag">Fake trade</span> <b>${esc(DLp.get("s")||"This coin")}</b> was a <b>SIM practice coin</b> from the simulator feed, so it has no real market data and no chart. ${DL.px?(DL.side==="sell"?"Sold ":"Bought ")+pF(DL.px)+" · ":""}${DL.t?ctF(DL.t):""} (simulated).</div>`;if(!DL.done){DL.done=1;setTimeout(()=>qcard.scrollIntoView({behavior:"smooth",block:"center"}),300)}}
  qchart();}
async function qchart(){E("#q-ivs").querySelectorAll("button").forEach(b=>b.classList.toggle("on",b.dataset.iv===QIVK));
  if(DL&&DL.sim&&!DL.pick){E("#q-chart").style.display="none";E("#q-px").textContent="–";E("#q-trades").innerHTML="";return}E("#q-chart").style.display="";
  const q=QL.find(z=>z.mint===QM);if(!q)return;localStorage.qMint=QM;if(!LW()){E("#q-note").textContent="Chart library didn't load. Reload to retry.";return}
  if(!QC){QC=mkChart(E("#q-chart"));QCs=QC.addCandlestickSeries({upColor:"#16c784",downColor:"#ea3943",borderVisible:false,wickUpColor:"#16c784",wickDownColor:"#ea3943",priceFormat:{type:"price",precision:8,minMove:1e-8}});}
  E("#q-px").textContent="…";
  try{let pl=poolC[q.mint];if(!pl){const r=await gt(`networks/solana/tokens/${q.mint}/pools?page=1`);const p=(r.data||[])[0];if(!p)throw new Error("no DEX pool found");
      pl=poolC[q.mint]={id:p.id.replace(/^solana_/,""),side:(p.relationships?.base_token?.data?.id||"")==="solana_"+q.mint?"base":"quote",name:p.attributes?.name||"",dex:p.relationships?.dex?.data?.id||""};}
    const [tf,ag,lim]=QIV[QIVK];const r=await gt(`networks/solana/pools/${pl.id}/ohlcv/${tf}?aggregate=${ag}&limit=${lim}&currency=usd&token=${pl.side}`);
    const L=(r.data?.attributes?.ohlcv_list||[]).map(a=>({time:a[0],open:+a[1],high:+a[2],low:+a[3],close:+a[4]})).sort((a,b)=>a.time-b.time);
    if(!L.length)throw new Error("no candles for this pool");
    QCs.setData(L);const step=L.length>1?L[1].time-L[0].time:60;
    const tr=QT.filter(t=>t.mint===q.mint),mk=[];for(const t of tr){const ts=Date.parse(t.time)/1000;if(isNaN(ts)||ts<L[0].time)continue;const b=L.reduce((a,c)=>c.time<=ts?c:a,L[0]);const buy=/buy/i.test(t.side);mk.push({time:b.time,position:buy?"belowBar":"aboveBar",color:buy?"#16c784":"#ea3943",shape:buy?"arrowUp":"arrowDown",text:"Paper "+(buy?"buy":"sell")})}
    let dlm=null;if(DL&&DL.tab==="quick"&&DL.sym===q.mint){const buy=DL.side!=="sell";if(DL.user)DL.done=true;dlm=dlMark(QCs,QC,L.map(c=>c.time),(buy?"Bought ":"Sold ")+pF(DL.px)+" · "+ctF(DL.t),buy,E("#q-chart"));if(dlm)mk.push(dlm)}
    QCs.setMarkers(mk.sort((a,b)=>a.time-b.time));if(!(dlm&&DL.done&&!DL.user&&DL.fitted)){QC.timeScale().fitContent();}if(dlm&&!DL.fitted){DL.fitted=1;DL.done=false;dlMark(QCs,QC,L.map(c=>c.time),(DL.side!=="sell"?"Bought ":"Sold ")+pF(DL.px)+" · "+ctF(DL.t),DL.side!=="sell",E("#q-chart"))}
    const last=L[L.length-1].close,first=L[0].open,ch=(last/first-1)*100;
    E("#q-px").innerHTML=`$${last>=1?last.toFixed(2):last.toPrecision(4)} <span class="chg ${ch>=0?"up":"dn"}">${ch>=0?"+":""}${ch.toFixed(1)}%</span>`;
    E("#q-trades").innerHTML=`<b>${esc(q.symbol)}</b> · pool ${esc(pl.name)} (${esc(pl.dex)}) · ${L.length} candles of ${QIVK} · <a style="color:#8fb3ff" target=_blank rel=noopener href="https://www.geckoterminal.com/solana/pools/${pl.id}">source</a>`+(tr.length?`<br>`+tr.slice(-5).reverse().map(t=>`<span class="rmd ptag">Fake trade</span>${esc(t.side)} at $${esc(t.filled||t.intended)} · ${esc(String(t.time).slice(0,16))} · ${esc(t.reason||"")}`).join("<br>"):`<br>No paper trades on this coin in the current log.`);
  }catch(e){if(/no candles/.test(e.message||"")){const b=E("#q-ivs").querySelector(`[data-iv="${QIVK}"]`);if(b){b.disabled=true;b.title="Not available for this pool";b.style.opacity=".4"}E("#q-px").textContent="–";E("#q-trades").innerHTML=`<span class="m">${QIVK} isn't available for ${esc(q.symbol)}'s pool. Pick another timeframe.</span>`;return}E("#q-px").textContent="–";E("#q-trades").innerHTML=`<span class="dn">Couldn't load DEX candles for ${esc(q.symbol)} (${esc(e.name=="AbortError"?"timed out":e.message)}). Pick another coin or retry shortly.</span>`;}}
E("#q-sel").onchange=e=>{QM=e.target.value;if(DL)DL.pick=1;E("#q-dl").innerHTML="";qchart()};E("#q-flt").onchange=e=>{QF=e.target.value;if(DL)DL.pick=1;qopts();qchart()};
qload();setInterval(qload,300000);setInterval(()=>{if(TAB=="all"||TAB=="quick")qchart()},90000);
})();
