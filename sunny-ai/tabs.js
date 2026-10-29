/* Desk tabs: Combined | Long-term crypto | Quick crypto | Stocks. PAPER ONLY. Reads data/profits.json .tabs */
(function(){
const T=[["combined","Combined"],["crypto_long","Long-term crypto"],["crypto_quick","Quick crypto"],["stocks","Stocks"]];
const m=n=>n==null?"—":(n<0?"-$":"$")+Math.abs(+n).toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2}),
sg=n=>n==null?"—":(n>=0?"+":"")+m(n),cl=n=>n==null?"":n>=0?"g":"r";
let sel=localStorage.getItem("deskTab")||"combined",D=null,els=[];
function spark(c){if(!c||c.length<2)return`<div class=m style="padding:18px 0;text-align:center;font-size:12px">No curve yet</div>`;
 const W=600,H=120,v=c.map(x=>x[1]),lo=Math.min(0,...v),hi=Math.max(0,...v),r=hi-lo||1,t0=c[0][0],tr=(c[c.length-1][0]-t0)||1,
 X=t=>(t-t0)/tr*W,Y=y=>H-4-(y-lo)/r*(H-8),p=c.map((x,i)=>(i?"L":"M")+X(x[0]).toFixed(1)+","+Y(x[1]).toFixed(1)).join(""),last=v[v.length-1],col=last>=0?"#22e08a":"#ff4d5e";
 return`<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" style="width:100%;height:120px;display:block"><line x1=0 x2=${W} y1=${Y(0)} y2=${Y(0)} stroke="#2a3240" stroke-dasharray="4 4"/><path d="${p}" fill=none stroke="${col}" stroke-width=2 vector-effect=non-scaling-stroke /></svg>`}
function render(el){if(!D)return;const s=D[sel]||{};const n=s.trades||0;
 const met=(l,v,c)=>`<div class=met><b class="${c||""}">${v}</b><span>${l}</span></div>`;
 el.innerHTML=`<div class="dtabs">${T.map(([k,l])=>`<button data-k="${k}" class="${k==sel?"on":""}">${l}</button>`).join("")}</div>`+
 (n===0?`<div class=m style="margin:10px 0 4px;font-size:12px">${s.note||"No closed trades yet."}</div>`:`<div class=m style="margin:10px 0 4px;font-size:11px">${s.note||""}</div>`)+
 `<div class="dtg">${met("Trades",n)}${met("W / L",n?`${s.wins}W / ${s.losses}L`:"—")}${met("Win rate",s.win_rate==null?"—":s.win_rate+"%")}${met("Avg win",m(s.avg_win),"g")}${met("Avg loss",m(s.avg_loss),"r")}${met("Profit factor",s.profit_factor==null?"—":s.profit_factor,s.profit_factor==null?"":s.profit_factor>=1?"g":"r")}${met("Expectancy / trade",sg(s.expectancy),cl(s.expectancy))}${met("Fees + slippage",n?m(-s.fees_slip):"—",n?"r":"")}${met("Net realized P/L",sg(s.net),cl(s.net))}${met("Open (unrealized)",sg(s.open_pnl),cl(s.open_pnl))}${met("🏦 Banked",m(s.banked),"g")}${met("Max drawdown",s.max_dd?`${m(-s.max_dd)} (${s.max_dd_pct}%)`:"—",s.max_dd?"r":"")}</div>`+
 `<div class=hd style="margin-top:10px">Equity curve · P/L vs start (${m(s.capital)})</div>${spark(s.curve)}`;
 el.querySelectorAll("button").forEach(b=>b.onclick=()=>{sel=b.dataset.k;localStorage.setItem("deskTab",sel);els.forEach(render)})}
async function load(){try{D=(await (await fetch("data/profits.json?"+Date.now())).json()).tabs;els.forEach(render)}catch(e){}}
const st=document.createElement("style");st.textContent=`.dtabs{display:flex;gap:6px;overflow-x:auto;scrollbar-width:none;-webkit-overflow-scrolling:touch}.dtabs::-webkit-scrollbar{display:none}.dtabs button{flex:0 0 auto;background:#0b0e14;color:#7b8594;border:1px solid #1c222c;border-radius:999px;padding:7px 12px;font:inherit;font-size:12px;cursor:pointer}.dtabs button.on{background:#13261c;color:#22e08a;border-color:#22e08a}.dtg{display:grid;grid-template-columns:repeat(auto-fill,minmax(130px,1fr));gap:8px}.dtg .met{background:#0b0e14;border:1px solid #1c222c;border-radius:10px;padding:9px}.dtg .met b{display:block;font-size:16px}.dtg .met span{color:#7b8594;font-size:11px}@media(max-width:480px){.dtg{grid-template-columns:repeat(2,1fr)}}`;document.head.appendChild(st);
window.deskTabs=function(el){els.push(el);render(el)};
document.addEventListener("DOMContentLoaded",()=>{document.querySelectorAll("[data-desktabs]").forEach(e=>deskTabs(e));load();setInterval(load,30000)});
})();
