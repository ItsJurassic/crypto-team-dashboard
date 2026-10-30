/* Accounts view: every paper account separately and combined. PAPER / SIMULATED ONLY. */
async function accountsHTML(){try{return await _accountsHTML()}catch(e){console.warn("accounts",e);return `<span style="color:#e5a14c">Accounts couldn't be built from the latest data (${String(e.message).replace(/[<>]/g,"")}). It retries every 30 s.</span>`}}
async function _accountsHTML(){
const J=async u=>{try{return await (await fetch(u+"?"+Date.now())).json()}catch(e){return null}};
const [d,sc,sh,cg,st,stt]=await Promise.all([J("data/dashboard.json"),J("team/scorecard.json"),J("team/shadow.json"),J("team/cg.json"),J("data/stocks.json"),J("team/shadow_trades.json")]);
const $$=n=>n==null||isNaN(n)?"—":(n<0?"-$":"$")+Math.abs(n).toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2});
const A=[];const b=d&&d.bank;
if(b){const L=b.lanes||{},S=L.SOLANA||{},M=L.MAJOR||{},ms=b.start/2;
 A.push({n:"Sunny AI · SOLANA",t:"quick",start:ms,pl:(S.net||0)+(S.pnl_open||0),fees:(S.trade_fees||0)+(S.slippage||0)+(S.failed_costs||0),banked:S.banked||0,note:"shares the $1,000 Sunny AI start with MAJOR (shown as $500 each)"});
 A.push({n:"Sunny AI · MAJOR",t:"lt",start:ms,pl:(M.net||0)+(M.pnl_open||0),fees:(M.trade_fees||0)+(M.slippage||0)+(M.failed_costs||0),banked:M.banked||0});}
if(sc)A.push({n:"Seedling · $2,000 crypto",t:"lt",start:sc.start_balance||2000,eq:sc.equity,fees:null,banked:null,note:"20% bank rule not applied"});
if(sh){const px={};(cg||[]).forEach(c=>px[(c.symbol||"").toUpperCase()]=c.current_price);let eq=((sh.steady_base||{}).cash_usd||0)+((sh.strategy_sleeve||{}).cash_usd||0)+(sh.accrued_usdc_rewards_usd||0);
 for(const g of [(sh.steady_base||{}).holdings,(sh.strategy_sleeve||{}).holdings])for(const[k,h]of Object.entries(g||{}))eq+=px[k]?h.qty*px[k]:h.cost_usd;
 const T=Array.isArray(stt)?stt:(stt&&stt.trades)||[];A.push({n:"Seedling · shadow DCA",t:"lt",start:sh.total_start_usd||2000,eq,fees:T.reduce((a,t)=>a+(+t.fee_usd||0),0),banked:null,note:"marked to CoinGecko prices"});}
if(st)A.push({n:"STOCKS paper",t:"stk",start:st.start,eq:st.equity,fees:(st.fees||0)+(st.slippage||0),banked:st.banked});
A.forEach(a=>{if(a.eq==null)a.eq=a.start+a.pl;if(a.pl==null)a.pl=a.eq-a.start});
const sum=(r,n)=>({n,start:r.reduce((x,a)=>x+a.start,0),eq:r.reduce((x,a)=>x+a.eq,0),pl:r.reduce((x,a)=>x+a.pl,0),fees:r.reduce((x,a)=>x+(a.fees||0),0),banked:r.reduce((x,a)=>x+(a.banked||0),0)});
const TY={stk:["Long-term Stocks","ty-stk"],quick:["Quick Crypto","ty-q"],lt:["Long-term Crypto","ty-lt"],bank:["Banking","ty-bk"]};
const pill=t=>TY[t]?` <span class="pill ${TY[t][1]}">${TY[t][0]}</span>`:"";
const tr=(a,cls)=>`<tr class="${cls||""}"><td>${a.n}${cls?"":pill(a.t)}</td><td>${$$(a.start)}</td><td>${$$(a.eq)}</td><td class=${a.pl>=0?"g":"r"}>${$$(a.pl)} <span class=m>${a.start?(a.pl/a.start*100).toFixed(2)+"%":""}</span></td><td>${$$(a.fees)}</td><td class=g>${a.banked==null?"—":$$(a.banked)}</td></tr>`;
const B=A.filter(a=>a.banked).map(a=>`<tr><td>${a.n} · banked${pill("bank")}</td><td>—</td><td class=g>${$$(a.banked)}</td><td class=m>held inside equity</td><td>—</td><td class=g>${$$(a.banked)}</td></tr>`);
const hd=t=>`<tr class="tyhead"><td colspan=6>${pill(t)}</td></tr>`;
let H="";for(const t of ["quick","lt","stk"]){const r=A.filter(a=>a.t==t);if(!r.length)continue;H+=hd(t)+r.map(a=>tr(a)).join("")+tr(sum(r,TY[t][0]+" subtotal"),"sub")}
const bk=A.reduce((x,a)=>x+(a.banked||0),0);
if(B.length)H+=hd("bank")+B.join("")+`<tr class="sub"><td>Banking subtotal</td><td>—</td><td class=g>${$$(bk)}</td><td></td><td>—</td><td class=g>${$$(bk)}</td></tr>`;
return `<style>.ty-stk{background:rgba(255,190,70,.14);color:#ffbe46;border:1px solid rgba(255,190,70,.4)}.ty-q{background:rgba(180,120,255,.14);color:#c08cff;border:1px solid rgba(180,120,255,.4)}.ty-lt{background:rgba(143,179,255,.12);color:#8fb3ff;border:1px solid rgba(143,179,255,.35)}.ty-bk{background:rgba(34,224,138,.14);color:#22e08a;border:1px solid rgba(34,224,138,.35)}tr.tyhead td{padding-top:12px;border-bottom:1px solid rgba(255,255,255,.08)}</style><div style="overflow-x:auto"><table style="white-space:nowrap"><tr><th>Account</th><th>Start</th><th>Equity</th><th>Net P/L</th><th>Fees+slip</th><th>Banked</th></tr>${H}
${tr(sum(A,"COMBINED TOTAL (all paper)"),"tot")}</table></div>
<p class=m style="font-size:11px;margin-top:6px">Long-term Stocks = stock desk (slow build); Quick Crypto = Sunny AI SOLANA lane; Long-term Crypto = MAJOR, Seedling, shadow DCA; Banking = 20% of net profit set aside (Sunny AI lanes and STOCKS). Banked cash is already counted inside each account's equity, so it is not added again to the combined total. All accounts are paper/simulated.</p>`}
