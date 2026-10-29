/* "Why we bought this" renderer. PAPER / SIMULATED ONLY. */
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
  det+=`<div class="m wn">${E(r.lane)} lane · ${E(r.recorded||"")} · paper trade</div>`;
  return `<details class="why"${open?" open":""}><summary><span class=wq>Why:</span> ${E(r.summary)}</summary><div class=wd>${det}</div></details>`;
};})();
