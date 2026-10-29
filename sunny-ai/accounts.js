/* Accounts view: every paper account separately and combined. PAPER / SIMULATED ONLY. */
async function accountsHTML(){try{return await _accountsHTML()}catch(e){console.warn("accounts",e);return `<span style="color:#e5a14c">Accounts couldn't be built from the latest data (${String(e.message).replace(/[<>]/g,"")}). It retries every 30 s.</span>`}}
async function _accountsHTML(){
const J=async u=>{try{return await (await fetch(u+"?"+Date.now())).json()}catch(e){return null}};
const [d,sc,sh,cg,st,stt]=await Promise.all([J("data/dashboard.json"),J("team/scorecard.json"),J("team/shadow.json"),J("team/cg.json"),J("data/stocks.json"),J("team/shadow_trades.json")]);
const $$=n=>n==null||isNaN(n)?"—":(n<0?"-$":"$")+Math.abs(n).toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2});
const A=[];const b=d&&d.bank;
if(b){const L=b.lanes||{},S=L.SOLANA||{},M=L.MAJOR||{},ms=b.start/2;
 A.push({n:"Sunny AI · SOLANA",t:"short",start:ms,pl:(S.net||0)+(S.pnl_open||0),fees:(S.trade_fees||0)+(S.slippage||0)+(S.failed_costs||0),banked:S.banked||0,note:"shares the $1,000 Sunny AI start with MAJOR (shown as $500 each)"});
 A.push({n:"Sunny AI · MAJOR",t:"long",start:ms,pl:(M.net||0)+(M.pnl_open||0),fees:(M.trade_fees||0)+(M.slippage||0)+(M.failed_costs||0),banked:M.banked||0});}
if(sc)A.push({n:"Seedling · $2,000 crypto",t:"long",start:sc.start_balance||2000,eq:sc.equity,fees:null,banked:null,note:"20% bank rule not applied"});
if(sh){const px={};(cg||[]).forEach(c=>px[(c.symbol||"").toUpperCase()]=c.current_price);let eq=((sh.steady_base||{}).cash_usd||0)+((sh.strategy_sleeve||{}).cash_usd||0)+(sh.accrued_usdc_rewards_usd||0);
 for(const g of [(sh.steady_base||{}).holdings,(sh.strategy_sleeve||{}).holdings])for(const[k,h]of Object.entries(g||{}))eq+=px[k]?h.qty*px[k]:h.cost_usd;
 const T=Array.isArray(stt)?stt:(stt&&stt.trades)||[];A.push({n:"Seedling · shadow DCA",t:"long",start:sh.total_start_usd||2000,eq,fees:T.reduce((a,t)=>a+(+t.fee_usd||0),0),banked:null,note:"marked to CoinGecko prices"});}
if(st)A.push({n:"STOCKS paper",t:"short",start:st.start,eq:st.equity,fees:(st.fees||0)+(st.slippage||0),banked:st.banked});
A.forEach(a=>{if(a.eq==null)a.eq=a.start+a.pl;if(a.pl==null)a.pl=a.eq-a.start});
const sum=(r,n)=>({n,start:r.reduce((x,a)=>x+a.start,0),eq:r.reduce((x,a)=>x+a.eq,0),pl:r.reduce((x,a)=>x+a.pl,0),fees:r.reduce((x,a)=>x+(a.fees||0),0),banked:r.reduce((x,a)=>x+(a.banked||0),0)});
const tr=(a,cls)=>`<tr class="${cls||""}"><td>${a.n}${a.t?` <span class="pill ${a.t=="short"?"ps":"pk"}">${a.t=="short"?"SHORT":"LONG"}</span>`:""}</td><td>${$$(a.start)}</td><td>${$$(a.eq)}</td><td class=${a.pl>=0?"g":"r"}>${$$(a.pl)} <span class=m>${a.start?(a.pl/a.start*100).toFixed(2)+"%":""}</span></td><td>${$$(a.fees)}</td><td class=g>${a.banked==null?"—":$$(a.banked)}</td></tr>`;
return `<div style="overflow-x:auto"><table style="white-space:nowrap"><tr><th>Account</th><th>Start</th><th>Equity</th><th>Net P/L</th><th>Fees+slip</th><th>Banked</th></tr>${A.map(a=>tr(a)).join("")}
${tr(sum(A.filter(a=>a.t=="short"),"Short-term subtotal"),"sub")}${tr(sum(A.filter(a=>a.t=="long"),"Long-term subtotal"),"sub")}${tr(sum(A,"TOTAL (all paper)"),"tot")}</table></div>
<p class=m style="font-size:11px;margin-top:6px">Short-term = SOLANA + STOCKS; long-term = MAJOR, Seedling, shadow DCA. Banked = 20% rule (Sunny AI lanes and STOCKS only). All accounts are paper/simulated.</p>`}
