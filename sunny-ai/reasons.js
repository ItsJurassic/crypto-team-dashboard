/* "Why we bought this" renderer. FAKE MONEY ONLY. */
(function(){
const E=s=>String(s==null?"":s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const N=v=>typeof v=="number"?(Math.abs(v)>=1e9?"$"+(v/1e9).toFixed(1)+"B":Math.abs(v)>=1e6?"$"+(v/1e6).toFixed(2)+"M":Math.abs(v)>=1e3?"$"+(v/1e3).toFixed(0)+"k":String(v)):E(v);
window.findWhy=function(R,mint,time){if(!R)return null;const t=time?Date.parse(time):0;let best=null,bd=1e15;for(const k in R){const r=R[k];if(r.mint!==mint)continue;const d=Math.abs(Date.parse(r.time)-t);if(d<bd){bd=d;best=r}}return best};
window.whyHTML=function(r,open){
  if(!r)return `<div class="why m">Why we bought this: reason not recorded.</div>`;
  const s=r.scout||{},a=r.analyst||{},j=r.judge,f=r.fill||{},k=r.risk||{},row=(l,v)=>v==null||v===""?"":`<div class=wr><span>${l}</span><b>${v}</b></div>`;
  let det="";
  det+=`<div class=wh>Scout</div>`+(r.lane=="SOLANA"?row("Pair age",s.age_h!=null&&s.age_h!="missing"?(+s.age_h).toFixed(1)+"h":"—")+row("Mcap",N(s.mcap))+row("Liquidity",N(s.liq))+row("1h volume",N(s.vol_1h))+row("1h change",s.chg_1h!=null?E(s.chg_1h)+"%":"")+row("Buys / sells 1h",s.buys_1h!=null?`${E(s.buys_1h)} / ${E(s.sells_1h)}`:"")+row("Holders",E(s.holders))+row("LP locked",s.lp_locked!=null?E(s.lp_locked)+"%":"")
     :row("Rank",s.rank?"#"+E(s.rank):"")+row("Mcap",N(s.mcap))+row("24h volume",N(s.vol_24h))+row("24h change",s.chg_24h!=null?(+s.chg_24h).toFixed(2)+"%":""))+row("Venue",E(s.venue||f.venue));
  if(r.filters)det+=`<div class=wh>Filters passed</div><div class=wl>${r.filters.map(x=>"✓ "+E(x)).join("<br>")}</div>`;
  if(a.score!=null)det+=`<div class=wh>Analyst · score ${E(a.score)}${a.score_now!=null?` <span class=m>(now ${E(a.score_now)})</span>`:""}</div>`+(a.top?`<div class=wl>${a.top.map(([n,v])=>`${E(n)}: <b>+${E(v)}</b> pts`).join("<br>")}</div>`:"");
  if(j)det+=`<div class=wh>Judge · probability ${(+j.p).toFixed(2)}</div><div class=wl>${j.yes.map(x=>"Yes: "+E(x)).join("<br>")}</div>`;
  det+=`<div class=wh>Executor</div>`+row("Venue",E(f.venue))+row("Size",f.usd!=null?"$"+(+f.usd).toFixed(2)+" (8% of working capital)":"")+row("Slippage",f.slip_pct!=null?E(f.slip_pct)+"%":"")+row("Fees",f.fees!=null?"$"+(+f.fees).toFixed(2):"");
  if(r.risk)det+=`<div class=wh>Risk</div>`+row("Stop",E(k.stop))+row("Trail",E(k.trail))+row("Take profit",E(k.tp));
  det+=`<div class="m wn">${E(r.lane)} lane · ${E(r.recorded||"")} · fake trade</div>`;
  return `<details class="why"${open?" open":""}><summary><span class=wq>Why:</span> ${E(r.summary)}</summary><div class=wd>${det}</div></details>`;
};})();
/* BUY / SELL / FAILED / OPEN pill badges */
window.sideBadge=function(t){if(t.status&&t.status!="FILLED")return `<span class="pill pf">FAILED</span>`;return t.side=="SELL"?`<span class="pill ps">▼ SELL</span>`:`<span class="pill pb">▲ BUY</span>`};
window.openBadge=()=>`<span class="pill pb">OPEN · BUY</span>`;
window.feedHTML=function(d,inL,LT,f,esc,n){
  const T=(d.trades||[]).filter(inL);const out=[];
  for(const r of Object.values(d.reasons||{}))if(inL(r))out.push({k:"B",time:r.time,r});
  for(const t of T)if(t.side=="SELL"||t.status!="FILLED")out.push({k:t.side=="SELL"&&t.status=="FILLED"?"S":"F",time:t.time,t});
  out.sort((a,b)=>Date.parse(b.time)-Date.parse(a.time));
  const dl=(x,side,px)=>{const ln=x.lane||(x.source=="MAJOR"||/^MAJOR/.test(x.mint||"")?"MAJOR":"SOLANA"),q=new URLSearchParams(ln=="MAJOR"?{tab:"crypto",sym:x.symbol}:{tab:"quick",sym:x.mint||x.symbol,s:x.symbol});q.set("t",Math.round(Date.parse(x.time)/1000));if(px)q.set("px",px);q.set("side",side);return `charts.html?${q}`};
  const ln=(h,inner)=>`<a class="rbl" href="${h}" aria-label="Open chart for this trade">${inner}<span class="rbc" aria-hidden="true">›</span></a>`;
  if(!document.getElementById("rbl-css")){const st=document.createElement("style");st.id="rbl-css";st.textContent=".rbl{display:block;position:relative;color:inherit;text-decoration:none;cursor:pointer}.rbl>.rb{padding-right:26px}.rbl:hover>.rb{border-color:#3a4a66}.rbc{position:absolute;right:10px;top:50%;transform:translateY(-50%);color:#7b8594;font-size:20px}";document.head.appendChild(st);document.addEventListener("click",e=>{if(e.target.closest(".rbl details")){e.preventDefault();const d=e.target.closest("details");if(e.target.closest("summary"))d.open=!d.open}},true)}
  const tm=x=>new Date(x).toLocaleString([],{month:"short",day:"numeric",hour:"numeric",minute:"2-digit"});
  return out.slice(0,n||12).map(e=>{
    if(e.k=="B"){const r=e.r;return ln(dl(r,"buy",r.fill&&r.fill.price),`<div class="rb lb-b"><div class=rbh><span><span class="pill pb">▲ BUY</span> <b>$${esc(r.symbol)}</b> ${LT(r.lane)}</span><span class=m>${tm(r.time)}${r.fill&&r.fill.usd?" · "+f(r.fill.usd):""}</span></div>${whyHTML(r)}</div>`)}
    const t=e.t,lane=t.lane||(t.source=="MAJOR"?"MAJOR":"SOLANA");
    if(e.k=="F")return ln(dl(t,(t.side||"buy").toLowerCase(),t.intended),`<div class="rb lb-f"><div class=rbh><span><span class="pill pf">FAILED</span> <b>$${esc(t.symbol)}</b> ${LT(lane)} <span class=m>${esc(t.side)}</span></span><span class=m>${tm(t.time)}</span></div><div class="why m">${esc(t.status)} · ${esc(t.reason)}</div></div>`);
    const buy=T.filter(b=>b.side=="BUY"&&b.status=="FILLED"&&b.mint==t.mint&&Date.parse(b.time)<=Date.parse(t.time)).pop();
    const pnl=+t.pnl_usd,pct=buy&&+buy.usd?pnl/+buy.usd*100:null,fast=/\[fast\]/.test(t.reason||""),rs=(t.reason||"").replace(/\s*\[fast\]/,"");
    return ln(dl(t,"sell",t.filled||t.intended),`<div class="rb lb-s"><div class=rbh><span><span class="pill ps">▼ SELL</span> <b>$${esc(t.symbol)}</b> ${LT(lane)}${fast?' <span class="pill pk">[fast]</span>':""}</span><span class=m>${tm(t.time)} · ${f(t.usd)}</span></div><div class=why><span class=wq>Exit:</span> ${esc(rs)} · <b class="${pnl>=0?"g":"r"}">${pnl>=0?"+":"−"}$${Math.abs(pnl).toFixed(2)}${pct!=null?` (${pct>=0?"+":"−"}${Math.abs(pct).toFixed(1)}%)`:""}</b></div></div>`)}).join("")||"<div class=m>No trades yet</div>";
};
