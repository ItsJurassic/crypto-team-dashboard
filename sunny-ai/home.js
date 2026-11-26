/* Sunny AI home dashboard. FAKE MONEY / PAPER TRADING ONLY. */
(function(){
const TEAM_START=4000, SOL_START=1000, MAJ_START=2000, STK_START=1000;
const $=id=>document.getElementById(id);
const esc=s=>String(s??"").replace(/[<>&"]/g,c=>({"<":"&lt;",">":"&gt;","&":"&amp;","\"":"&quot;"}[c]));
const J=u=>fetch(u+"?t="+Date.now(),{cache:"no-store"}).then(r=>{if(!r.ok)throw new Error(r.status);return r.json()});
const money=(n,d=2)=>n==null||isNaN(+n)?"—":(n<0?"-":"")+"$"+Math.abs(+n).toLocaleString("en-US",{minimumFractionDigits:d,maximumFractionDigits:d});
const delta=n=>n==null||isNaN(+n)?"—":(n>0?"+":n<0?"-":"")+money(Math.abs(+n)).replace(/^-/,"") ;
const pct=n=>n==null||!isFinite(n)?"—":(n>0?"+":n<0?"-":"")+(Math.abs(n)*100).toFixed(2)+"%";
const cls=n=>n>0?"g":n<0?"r":"";
function when(iso){
  if(!iso) return "";
  const d=new Date(iso);
  if(isNaN(+d)) return String(iso);
  return d.toLocaleString("en-US",{timeZone:"America/Chicago",month:"short",day:"numeric",hour:"numeric",minute:"2-digit"})+" CT";
}
function ts(iso){const t=Date.parse(iso||"");return isNaN(t)?0:t}

function lanesFromAcc(A){
  if(!A||!A.length) return null;
  const pick=re=>A.find(a=>re.test(a.n||""));
  const fast=pick(/SOLANA/), slow=pick(/MAJOR/), stocks=pick(/stock/i);
  if(!fast||!slow) return null;
  return {fast,slow,stocks};
}
function lanesFromRaw(d,sk){
  const LN=(d&&d.lanes)||{}, B=((d&&d.bank)||{}).lanes||{};
  const solPl=(LN.SOLANA&&LN.SOLANA.pnl!=null)?+LN.SOLANA.pnl:((B.SOLANA||{}).net||0)+((B.SOLANA||{}).pnl_open||0);
  const solEq=SOL_START+solPl;
  const cryptoEq=(d&&d.equity!=null)?+d.equity:solEq+MAJ_START+((LN.MAJOR&&LN.MAJOR.pnl!=null)?+LN.MAJOR.pnl:((B.MAJOR||{}).net||0)+((B.MAJOR||{}).pnl_open||0));
  const majEq=cryptoEq-solEq;
  const stkEq=sk&&sk.equity!=null?+sk.equity:STK_START;
  const stkStart=sk&&sk.start!=null?+sk.start:STK_START;
  return {
    fast:{n:"Fast Crypto",start:SOL_START,eq:solEq,pl:solPl},
    slow:{n:"Slow Crypto",start:MAJ_START,eq:majEq,pl:majEq-MAJ_START},
    stocks:sk?{n:"Paper Stocks",start:stkStart,eq:stkEq,pl:stkEq-stkStart}:null
  };
}

function laneMeta(key,d,sk){
  const LN=(d&&d.lanes)||{};
  if(key==="fast"){
    const v=LN.SOLANA||{};
    const open=+v.open||0;
    return {href:"desk.html",kicker:"SOLANA sleeve",accent:"fast",
      detail: open? (open+" open · lane P/L "+delta(v.pnl)) : ("All cash · "+(+v.closed||0)+" closed")};
  }
  if(key==="slow"){
    const v=LN.MAJOR||{};
    const open=+v.open||0;
    return {href:"desk.html",kicker:"MAJOR sleeve",accent:"slow",
      detail: open? (open+" open · lane P/L "+delta(v.pnl)) : ("All cash · "+(+v.closed||0)+" closed")};
  }
  const n=sk&&sk.positions?Object.keys(sk.positions).length:0;
  const cash=sk&&sk.cash!=null?money(sk.cash):null;
  return {href:"stocks.html",kicker:"Long-term paper book",accent:"stocks",
    detail: (n?n+" holdings":"No holdings")+(cash?" · "+cash+" cash":"")};
}

function renderBook(L){
  const rows=[L.fast,L.slow,L.stocks].filter(a=>a&&a.eq!=null&&a.start!=null);
  const start=rows.reduce((s,a)=>s+a.start,0)||TEAM_START;
  const eq=rows.reduce((s,a)=>s+a.eq,0);
  const pl=eq-start;
  $("eq").textContent=money(eq);
  $("start").textContent=money(start);
  $("pnl").textContent=delta(pl)+"  "+pct(start?pl/start:0);
  $("pnl").className="pct "+cls(pl);
  $("pnlsub").textContent=pl===0?"Flat versus start":(pl<0?"Below the $4,000 paper start":"Above the $4,000 paper start");
  const bar=$("bar").querySelector("i");
  const ratio=start?Math.max(0,Math.min(1,eq/start)):0;
  bar.style.width=(Math.max(0.03,ratio)*100).toFixed(1)+"%";
  bar.className=cls(pl);
}

function renderLanes(L,d,sk){
  const order=[["fast","Fast Crypto","$1,000 sleeve"],["slow","Slow Crypto","$2,000 sleeve"],["stocks","Paper Stocks","$1,000 sleeve"]];
  $("lanes").innerHTML=order.map(([key,label,sleeve])=>{
    const a=L[key];
    const meta=laneMeta(key,d,sk);
    if(!a) return `<article class="card home-lane ${meta.accent}"><div class="hd">${label}</div><div class="m">Waiting for data…</div></article>`;
    const pl=a.pl!=null?a.pl:a.eq-a.start;
    return `<a class="card home-lane ${meta.accent}" href="${meta.href}">
      <div class="hd"><span>${esc(label)}</span><span class="home-chip">${esc(sleeve)}</span></div>
      <div class="eq">${money(a.eq)}</div>
      <div class="home-lane-pl ${cls(pl)}">${delta(pl)}  <span>${pct(a.start?pl/a.start:0)}</span></div>
      <div class="m home-lane-detail">${esc(meta.detail)}</div>
      <div class="home-lane-go">Open →</div>
    </a>`;
  }).join("");
}

function laneOf(t){
  if(t._desk==="stocks") return ["Paper Stocks","stocks"];
  const src=(t.source||t.lane||"").toUpperCase();
  if(src==="MAJOR") return ["Slow Crypto","slow"];
  return ["Fast Crypto","fast"];
}
function collectTrades(d,sk){
  const out=[];
  for(const t of (d&&d.trades)||[]){
    out.push({
      time:t.time, side:t.side, symbol:t.symbol, status:t.status,
      source:t.source, usd:t.usd, pnl:t.pnl_usd===""||t.pnl_usd==null?null:+t.pnl_usd,
      price:t.filled||t.intended, reason:t.reason, _desk:"crypto"
    });
  }
  for(const t of (sk&&sk.trades)||[]){
    out.push({
      time:t.time, side:t.side, symbol:t.symbol, status:t.status,
      source:"STOCKS", usd:t.usd, pnl:t.pnl_usd===""||t.pnl_usd==null?null:(+t.pnl_usd),
      price:t.price, reason:t.reason, _desk:"stocks"
    });
  }
  out.sort((a,b)=>ts(b.time)-ts(a.time));
  return out;
}
function renderTrades(rows){
  if(!rows.length){$("trades").innerHTML='<p class="m">No paper trades have been published yet.</p>';return;}
  const show=rows.slice(0,10);
  $("trades").innerHTML=`<ul class="home-list">${show.map(t=>{
    const [lane,accent]=laneOf(t);
    const side=(t.side||"").toUpperCase();
    const ok=/^FILLED$/i.test(t.status||"");
    const st=ok?"Filled":(t.status||"").replace(/^FAILED:\s*/i,"Failed · ");
    const pnl=t.pnl!=null?`<span class="${cls(t.pnl)}">${delta(t.pnl)}</span>`:(t.usd!=null?`<span class="m">${money(+t.usd)}</span>`:"");
    return `<li class="home-row">
      <div class="home-row-top">
        <span class="home-side ${side==="SELL"?"sell":"buy"}">${esc(side||"—")}</span>
        <strong>$${esc(t.symbol||"")}</strong>
        <span class="home-chip ${accent}">${esc(lane)}</span>
        <span class="home-status ${ok?"":"fail"}">${esc(st)}</span>
        <span class="home-row-amt">${pnl}</span>
      </div>
      <div class="home-row-sub m">${esc(when(t.time))}${t.price? " · "+esc((isFinite(+t.price)?money(+t.price, +t.price>=100?2:4):String(t.price))) : ""}${t.reason? " · "+esc(String(t.reason).slice(0,160)) : ""}</div>
    </li>`;
  }).join("")}</ul>`;
}

function renderLessons(list){
  const L=(list||[]).slice().sort((a,b)=>String(b.date||"").localeCompare(String(a.date||""))).slice(0,4);
  if(!L.length){$("lessons").innerHTML='<p class="m">No lessons published yet.</p>';return;}
  $("lessons").innerHTML=`<ul class="home-list">${L.map(l=>`<li class="home-lesson">
    <a href="research.html">
      <strong>${esc(l.title||"Untitled")}</strong>
      <div class="m">${esc(l.date||"")} · ${esc((l.bot||"").replace(/\s*\(.*$/,""))} · ${esc(l.market||"Crypto")}</div>
      <p>${esc(String(l.summary||"").slice(0,220))}${String(l.summary||"").length>220?"…":""}</p>
    </a>
  </li>`).join("")}</ul>`;
}
function renderPlaybook(rules){
  const P=Array.isArray(rules)?rules:[];
  if(!P.length){$("playbook").innerHTML='<p class="m">Playbook has not loaded yet.</p>';return;}
  $("playbook").innerHTML=`<p class="m home-pb-count">${P.length} rules · Owl's paper-trading playbook</p>
    <ol class="home-rules">${P.slice(0,6).map(r=>`<li>${esc(r)}</li>`).join("")}</ol>
    ${P.length>6?`<a class="home-more" href="playbook.html">Read all ${P.length} rules →</a>`:""}`;
}

let timer=null;
async function load(){
  try{
    const [d,sk,lessons,playbook]=await Promise.all([
      J("data/dashboard.json").catch(()=>null),
      J("data/stocks.json").catch(()=>null),
      J("team/lessons.json").catch(()=>[]),
      J("team/playbook.json").catch(()=>[])
    ]);
    // Prefer accounts.js so the hero matches Numbers / Office.
    if(typeof window.accountsHTML==="function"){
      try{await Promise.race([window.accountsHTML(),new Promise(r=>setTimeout(r,8000))])}catch(e){}
    }
    const fromAcc=lanesFromAcc(window.__ACC);
    const L=fromAcc||lanesFromRaw(d,sk);
    if(fromAcc){
      // Keep display names consistent with the requested labels.
      if(L.fast) L.fast.n="Fast Crypto";
      if(L.slow) L.slow.n="Slow Crypto";
      if(L.stocks) L.stocks.n="Paper Stocks";
    }
    renderBook(L);
    renderLanes(L,d,sk);
    renderTrades(collectTrades(d,sk));
    renderLessons(lessons||[]);
    renderPlaybook(playbook||[]);
    const stamps=[d&&d.updated,sk&&sk.updated].filter(Boolean);
    const latest=stamps.length?stamps.reduce((a,b)=>ts(b)>ts(a)?b:a):null;
    $("asof").textContent=latest?"As of "+when(latest):"Paper desk";
    document.body.dataset.homeReady="1";
  }catch(e){
    $("asof").textContent="Could not load the latest paper figures";
    if($("trades").textContent==="Loading…") $("trades").innerHTML='<p class="m">Live data did not load. Retry in a moment, or open <a href="desk.html">Numbers</a>.</p>';
    console.warn("home load",e);
  }
}
function start(){load();if(timer)clearInterval(timer);timer=setInterval(load,30000)}
if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",start);
else start();
addEventListener("acc",()=>{const A=lanesFromAcc(window.__ACC);if(A){A.fast&&(A.fast.n="Fast Crypto");A.slow&&(A.slow.n="Slow Crypto");A.stocks&&(A.stocks.n="Paper Stocks");renderBook(A);}});
})();
