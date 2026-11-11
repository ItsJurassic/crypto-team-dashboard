/* Accounts view: every paper account separately and combined. FAKE MONEY ONLY. */
async function accountsHTML(){try{return await _accountsHTML()}catch(e){console.warn("accounts",e);return `<span style="color:#e5a14c">Accounts couldn't be built from the latest data (${String(e.message).replace(/[<>]/g,"")}). It retries every 30 s.</span>`}}
async function _accountsHTML(){
const J=async u=>{try{return await (await fetch(u+"?"+Date.now())).json()}catch(e){return null}};
const [d,sc,sh,cg,st,stt,stc]=await Promise.all([J("data/dashboard.json"),J("team/scorecard.json"),J("team/shadow.json"),J("team/cg.json"),J("data/stocks.json"),J("team/shadow_trades.json"),J("data/stocks_curve.json")]);
const $$=n=>n==null||isNaN(n)?"—":(n<0?"-$":"$")+Math.abs(n).toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2});
const SOL_START=1000,MAJ_START=2000,STK_START=1000,CRYPTO_START=3000,TEAM_START=4000;
const stocksNow=(sk,curve)=>{const last=(Array.isArray(curve)&&curve.length)?curve[curve.length-1]:null;const tu=sk&&sk.updated?Date.parse(sk.updated)/1000:NaN;if(sk&&sk.equity!=null&&last&&tu&&tu>=last[0]-60)return +sk.equity;if(last)return +last[1];if(sk&&sk.equity!=null)return +sk.equity;return (sk&&sk.start)!=null?+sk.start:STK_START};
const A=[];const b=d&&d.bank;
if(b||(d&&d.equity!=null)){const L=(b&&b.lanes)||{},S=L.SOLANA||{},M=L.MAJOR||{},LN=(d&&d.lanes)||{};
 const solPl=(LN.SOLANA&&LN.SOLANA.pnl!=null)?+LN.SOLANA.pnl:((S.net||0)+(S.pnl_open||0));
 const solEq=SOL_START+solPl;
 // Live crypto equity is cash + marks on dashboard. bank.net can lag (closed trades missing from the bank ledger), which is what made Accounts disagree with the chart.
 const cryptoEq=(d&&d.equity!=null)?+d.equity:solEq+MAJ_START+((LN.MAJOR&&LN.MAJOR.pnl!=null)?+LN.MAJOR.pnl:((M.net||0)+(M.pnl_open||0)));
 const majEq=cryptoEq-solEq;
 A.push({n:"Sunny AI · SOLANA",t:"quick",start:SOL_START,eq:solEq,pl:solPl,fees:(S.trade_fees||0)+(S.slippage||0)+(S.failed_costs||0),banked:S.banked||0,note:"Fast Crypto — shares Sunny AI crypto book with MAJOR; sleeve $1,000"});
 A.push({n:"Sunny AI · MAJOR",t:"lt",start:MAJ_START,eq:majEq,pl:majEq-MAJ_START,fees:(M.trade_fees||0)+(M.slippage||0)+(M.failed_costs||0),banked:M.banked||0,note:"Slow Crypto — start $2,000 includes retired Buildup sleeve merged Nov 5"});}
if(false&&sc)A.push({n:"Seedling · fast side",t:"lt",start:500/* Oct 30 3:40 PM CT reset: $500 fast (scorecard start_balance is stale) */,eq:sc.equity,fees:null,banked:null,note:"20% bank rule not applied"});
if(false&&sh){const px={};(cg||[]).forEach(c=>px[(c.symbol||"").toUpperCase()]=c.current_price);
 const parts=[sh.buildup,sh.steady_base,sh.strategy_sleeve].filter(x=>x&&typeof x=="object");let eq=null,ok=false;
 if(parts.length){eq=+sh.accrued_usdc_rewards_usd||0;for(const g of parts){if(g.cash_usd!=null){eq+=+g.cash_usd;ok=true}for(const[k,h]of Object.entries(g.holdings||{})){ok=true;eq+=px[k]?h.qty*px[k]:(+h.cost_usd||0)}}}
 if(!ok||!isFinite(eq))eq=null;
 const T=Array.isArray(stt)?stt:(stt&&stt.trades)||[];A.push({n:"Seedling · buildup (shadow DCA)",t:"lt",start:sh.total_start_usd||500,eq,na:eq==null,fees:T.reduce((a,t)=>a+(+t.fee_usd||0),0),banked:null,note:"marked to CoinGecko prices"});}
if(st||(Array.isArray(stc)&&stc.length))A.push({n:"Fake Money · Long-term Stocks",t:"stk",start:(st&&st.start)!=null?+st.start:STK_START,eq:stocksNow(st,stc),fees:st?((st.fees||0)+(st.slippage||0)):null,banked:st?st.banked:null});
A.forEach(a=>{if(a.na)return;if(a.eq==null)a.eq=a.start+a.pl;if(a.pl==null)a.pl=a.eq-a.start});window.__ACC=A.filter(a=>!a.na);window.dispatchEvent(new Event("acc"));
const sum=(r0,n)=>{const r=r0.filter(a=>!a.na);return{n,start:r.reduce((x,a)=>x+a.start,0),eq:r.reduce((x,a)=>x+a.eq,0),pl:r.reduce((x,a)=>x+a.pl,0),fees:r.reduce((x,a)=>x+(a.fees||0),0),banked:r.reduce((x,a)=>x+(a.banked||0),0)}};
const TY={stk:["Long-term Stocks","ty-stk"],quick:["Quick Crypto","ty-q"],lt:["Long-term Crypto","ty-lt"],bank:["Banking","ty-bk"]};
const pill=t=>TY[t]?` <span class="pill ${TY[t][1]}">${TY[t][0]}</span>`:"";
const tr=(a,cls)=>a.na?`<tr><td>${a.n}${pill(a.t)}</td><td>${$$(a.start)}</td><td class=m>n/a</td><td class=m>can't be valued from published data (left out of totals)</td><td>${$$(a.fees)}</td><td>—</td></tr>`:`<tr class="${cls||""}"><td>${a.n}${cls?"":pill(a.t)}</td><td>${$$(a.start)}</td><td>${$$(a.eq)}</td><td class=${a.pl>=0?"g":"r"}>${$$(a.pl)} <span class=m>${a.start?(a.pl/a.start*100).toFixed(2)+"%":""}</span></td><td>${$$(a.fees)}</td><td class=g>${a.banked==null?"—":$$(a.banked)}</td></tr>`;
const B=A.filter(a=>a.banked).map(a=>`<tr><td>${a.n} · banked${pill("bank")}</td><td>—</td><td class=g>${$$(a.banked)}</td><td class=m>held inside equity</td><td>—</td><td class=g>${$$(a.banked)}</td></tr>`);
const hd=t=>`<tr class="tyhead"><td colspan=6>${pill(t)}</td></tr>`;
let H="";for(const t of ["quick","lt","stk"]){if(t=="lt")H+=`<tr class="tyhead"><td colspan=6><b>LONG-TERM</b> <span class=m>(crypto + stocks)</span></td></tr>`;const r=A.filter(a=>a.t==t);if(!r.length)continue;H+=hd(t)+r.map(a=>tr(a)).join("")+tr(sum(r,TY[t][0]+" subtotal"),"sub")}
const bk=A.reduce((x,a)=>x+(a.banked||0),0);
if(B.length)H+=hd("bank")+B.join("")+`<tr class="sub"><td>Banking subtotal</td><td>—</td><td class=g>${$$(bk)}</td><td></td><td>—</td><td class=g>${$$(bk)}</td></tr>`;
const plc=v=>v>=0?"g":"r",pct=a=>a.start?` <span class=m>${(a.pl/a.start*100).toFixed(2)}%</span>`:"";
const mrow=a=>a.na?`<div class="acr"><div class="acn">${a.n}</div><div class="acg"><span>Start</span><b>${$$(a.start)}</b><span>Equity</span><b class=m>n/a</b><span>P/L</span><b class=m>not valued</b></div></div>`:`<div class="acr"><div class="acn">${a.n}</div><div class="acg"><span>Start</span><b>${$$(a.start)}</b><span>Equity</span><b>${$$(a.eq)}</b><span>P/L</span><b class=${plc(a.pl)}>${$$(a.pl)}${pct(a)}</b></div></div>`;
const tot=sum(A,"Combined");let M=`<div class="actot"><div class=m>Combined total · all fake money</div><div class="acv">${$$(tot.eq)}</div><div class=${plc(tot.pl)}>${$$(tot.pl)}${pct(tot)} <span class=m>from ${$$(tot.start)}</span></div></div>`;
for(const t of ["quick","lt","stk"]){const r=A.filter(a=>a.t==t);if(!r.length)continue;const s=sum(r,"");M+=`<details class="acgrp" data-g="${t}" ${(window._acOpen||{})[t]?"open":""}><summary>${pill(t)}<span class="acs"><b>${$$(s.eq)}</b><span class=${plc(s.pl)}>${$$(s.pl)}</span></span></summary>${r.map(mrow).join("")}</details>`}
if(B.length)M+=`<details class="acgrp" data-g="bank" ${(window._acOpen||{}).bank?"open":""}><summary>${pill("bank")}<span class="acs"><b class=g>${$$(bk)}</b><span class=m>held inside equity</span></span></summary>${A.filter(a=>a.banked).map(a=>`<div class="acr"><div class="acn">${a.n}</div><div class="acg"><span>Banked</span><b class=g>${$$(a.banked)}</b></div></div>`).join("")}</details>`;
return `<style>.actbl{display:none!important}.acm{display:block}
.actot{background:var(--card2,#1e2533);border-radius:14px;padding:14px 16px;margin-bottom:10px;font-size:14px}.actot .acv{font-size:28px;font-weight:700;letter-spacing:-.02em;margin:2px 0}
.acgrp{background:var(--card2,#1e2533);border-radius:14px;margin-bottom:8px;font-size:14px}.acgrp summary{list-style:none;display:flex;align-items:center;justify-content:space-between;gap:10px;padding:14px 16px;cursor:pointer;min-height:48px}.acgrp summary::-webkit-details-marker{display:none}
.acgrp summary .pill{font-size:12.5px!important}.acs{display:flex;flex-direction:column;align-items:flex-end;font-size:14px;line-height:1.3}.acs:after{content:"Show accounts ▾";font-size:12px;color:var(--mut)}.acgrp[open] .acs:after{content:"Hide ▴"}
.acr{border-top:1px solid var(--line);padding:12px 16px}.acn{font-weight:600;font-size:14px;margin-bottom:6px;overflow-wrap:anywhere}.acg{display:grid;grid-template-columns:auto 1fr;gap:4px 12px;font-size:14px}.acg span{color:var(--mut)}.acg b{text-align:right;font-weight:600}</style><div class="acm">${M}</div><style>.ty-stk{background:rgba(255,190,70,.14);color:#ffbe46;border:1px solid rgba(255,190,70,.4)}.ty-q{background:rgba(180,120,255,.14);color:#c08cff;border:1px solid rgba(180,120,255,.4)}.ty-lt{background:rgba(143,179,255,.12);color:#8fb3ff;border:1px solid rgba(143,179,255,.35)}.ty-bk{background:rgba(34,224,138,.14);color:#22e08a;border:1px solid rgba(34,224,138,.35)}tr.tyhead td{padding-top:12px;border-bottom:1px solid rgba(255,255,255,.08)}</style><div class="actbl" style="overflow-x:auto"><table style="white-space:nowrap"><tr><th>Account</th><th>Start</th><th>Equity</th><th>Net P/L</th><th>Fees+slip</th><th>Banked</th></tr>${H}
${tr(sum(A,"COMBINED TOTAL (all fake money)"),"tot")}</table></div>
<p class=m style="font-size:11px;margin-top:6px">Three lanes: Fast Crypto (SOLANA) $1,000, Slow Crypto (MAJOR) $2,000, Fake Stocks $1,000 = $4,000 start. Shared crypto start is $3,000 (MAJOR includes the Buildup sleeve merged Nov 5). Combined equity is the live crypto book (cash + open marks) plus the stock desk, so the header, Accounts, and chart totals match. Seedling is practice testing only, with no money, and is not counted. Banking = 20% of net profit set aside (Sunny AI lanes and STOCKS). Banked cash is already counted inside each account's equity, so it is not added again to the combined total. All accounts are fake money (simulated).</p>`}

window._acOpen=window._acOpen||{};document.addEventListener("toggle",e=>{const d=e.target;if(d.classList&&d.classList.contains("acgrp"))window._acOpen[d.dataset.g]=d.open},true);
