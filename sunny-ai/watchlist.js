/* Shared compact stock watchlist (Desk + Charts). One component, one data source: data/stocks.json. FAKE MONEY ONLY. */
(function(){
const esc=s=>String(s??"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const isSim=v=>/^SIM/i.test(String(v||""))||/SIM-?FEED|simulat|synthetic/i.test(String(v||""));
if(!document.getElementById("wl-css")){const st=document.createElement("style");st.id="wl-css";st.textContent=`.wl-f{display:flex;gap:6px;flex-wrap:wrap;align-items:center;margin:6px 0}.wl-f button,.wl-f select{background:#0b0e14;color:#9aa6bb;border:1px solid #1c222c;border-radius:999px;padding:5px 10px;font:inherit;font-size:12px;cursor:pointer}.wl-f button.on{background:#13261c;color:#22e08a;border-color:#22e08a}
.wl-rows{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:4px}.wl-r{display:grid;grid-template-columns:52px 70px 56px 1fr auto 12px;align-items:center;gap:6px;border:1px solid #22304a;border-radius:8px;padding:5px 8px;font-size:12px;color:inherit;text-decoration:none;cursor:pointer}.wl-r:hover{border-color:#3a4a66}.wl-r.held{border-color:#3fb68b}.wl-r.sig{border-color:#2fb3b0}.wl-r svg{width:100%;height:22px;display:block}.wl-r .up{color:#22e08a}.wl-r .dn{color:#ff4d5e}.wl-r .cv{color:#7b8594;font-size:16px}
.wl-b{font-size:9px;padding:1px 5px;border-radius:5px;border:1px solid #2a3550;color:#9aa6bb}.wl-b.s{color:#5fd6d2;border-color:#2fb3b0}.wl-b.h{color:#3fb68b;border-color:#3fb68b}.wl-more{margin-top:6px;background:none;border:0;color:#8fb3ff;font:inherit;font-size:12px;cursor:pointer;padding:4px 0}`;document.head.appendChild(st)}
const badge=w=>(w.held?'<span class="wl-b h">HELD</span> ':"")+(w.status=="signal"||w.queued?'<span class="wl-b s">SIGNAL</span>':w.status=="rejected"?'<span class="wl-b">REJECTED</span>':'<span class="wl-b">WATCH</span>');
const rk=w=>w.held?0:w.queued?1:w.status=="signal"?2:w.status=="rejected"?3:4;
const spark=c=>{c=(c||[]).filter(x=>x!=null).slice(-60);if(c.length<2)return"";const lo=Math.min(...c),hi=Math.max(...c);return `<svg viewBox="0 0 90 22" preserveAspectRatio="none"><polyline fill="none" stroke="${c[c.length-1]>=c[0]?"#3fb68b":"#e5636f"}" stroke-width="1.4" points="${c.map((v,i)=>`${(i/(c.length-1)*90).toFixed(1)},${(20-(v-lo)/(hi-lo||1)*18).toFixed(1)}`).join(" ")}"/></svg>`};
let DATA=null,LOADING=null;
async function load(force){if(DATA&&!force)return DATA;if(LOADING)return LOADING;LOADING=fetch("data/stocks.json?"+Date.now(),{cache:"no-store"}).then(r=>r.json()).then(d=>{DATA=d;LOADING=null;return d}).catch(e=>{LOADING=null;throw e});return LOADING}
function mount(el,opt){opt=opt||{};const key="wlF";let F=localStorage[key]||"signals",more=false;
  async function render(force){let d;try{d=await load(force)}catch(e){el.innerHTML=`<div class="m" style="font-size:12px">Watchlist unavailable right now.</div>`;return}
    const W=(d.watch||[]).filter(w=>!isSim(w.symbol)),secs=[...new Set(W.map(w=>w.sector).filter(Boolean))].sort();
    if(F!="signals"&&F!="held"&&F!="all"&&!secs.includes(F))F="signals";
    let x=W.filter(w=>F=="all"?true:F=="held"?w.held:F=="signals"?(w.held||w.queued||w.status=="signal"):w.sector==F).sort((a,b)=>rk(a)-rk(b)||(b.score||0)-(a.score||0)||a.symbol.localeCompare(b.symbol));
    const empty=!x.length;const N=opt.compact&&!more?5:1e9,shown=x.slice(0,N);
    el.innerHTML=`<div class="wl-f">${[["signals","Signals + held"],["held","Held"],["all","Show all"]].map(([k,l])=>`<button data-f="${k}" class="${F==k?"on":""}">${l}</button>`).join("")}<select aria-label="Sector"><option value="">Sector…</option>${secs.map(s=>`<option ${F==s?"selected":""}>${esc(s)}</option>`).join("")}</select><span class="m" style="font-size:11px">${x.length} of ${W.length}</span></div>
    <div class="wl-rows">${empty?`<div class="m" style="font-size:12px">No stocks match this filter right now${F=="signals"?" (no signals or holdings yet)":""}. Try Show all.</div>`:shown.map(w=>`<a class="wl-r ${w.held?"held":w.status=="signal"||w.queued?"sig":""}" href="charts.html?tab=stocks&sym=${encodeURIComponent(w.symbol)}" data-s="${esc(w.symbol)}"><b>${esc(w.symbol)}</b><span style="text-align:right">$${(+w.price).toFixed(2)}</span><span style="text-align:right" class="${w.day_pct>=0?"up":"dn"}">${w.day_pct>=0?"+":""}${w.day_pct}%</span>${spark((w.chart||{}).c)}<span>${badge(w)}</span><span class=cv aria-hidden=true>›</span></a>`).join("")}</div>
    ${opt.compact&&x.length>5?`<button class="wl-more">${more?"Show fewer":"See all "+x.length+" →"}</button>`:""}`;
    el.querySelectorAll(".wl-f button").forEach(b=>b.onclick=()=>{F=localStorage[key]=b.dataset.f;render()});
    el.querySelector(".wl-f select").onchange=e=>{if(e.target.value){F=localStorage[key]=e.target.value;render()}};
    const m=el.querySelector(".wl-more");if(m)m.onclick=()=>{more=!more;render()};
    if(opt.onPick)el.querySelectorAll(".wl-r").forEach(a=>a.onclick=e=>{e.preventDefault();opt.onPick(a.dataset.s)});}
  render();setInterval(()=>render(true),300000);addEventListener("storage",e=>{if(e.key==key){F=e.newValue||"signals";render()}});}
window.Watchlist={mount,badge,load};
})();
