/* Shared table filters: any table with 8+ rows gets a search box and, when it has them, Lane and Side dropdowns. Survives 30s re-renders. PAPER ONLY. */
(function(){
const st=document.createElement("style");st.textContent=`.tfl{display:flex;gap:6px;flex-wrap:wrap;margin:6px 0}.tfl input,.tfl select{background:#0b0e14;color:#c9d3e6;border:1px solid #2d3542;border-radius:8px;padding:6px 9px;font:inherit;font-size:12px}.tfl input{flex:1;min-width:120px}`;document.head.appendChild(st);
const S={},B={};let n=0;
function key(t){return t.id||(t.dataset.tfk||(t.dataset.tfk="t"+(n++)))}
function rows(t){return [...t.querySelectorAll("tr")].filter(r=>!r.querySelector("th"))}
function apply(t){const k=key(t),f=S[k]||{};rows(t).forEach(r=>{const x=r.textContent;r.style.display=((!f.q||x.toLowerCase().includes(f.q))&&(!f.lane||new RegExp("\\b"+f.lane+"\\b").test(x))&&(!f.side||new RegExp("\\b"+f.side+"\\b","i").test(x)))?"":"none"})}
function setup(t){const rs=rows(t);if(rs.length<8||t.closest("#sa-login"))return;const k=key(t);
  let bar=B[k]&&document.contains(B[k])?B[k]:null;
  const txt=rs.map(r=>r.textContent).join(" "),lane=/\bSOLANA\b/.test(txt)&&/\bMAJOR\b/.test(txt),side=/\bBUY\b/i.test(txt)&&/\bSELL\b/i.test(txt);
  if(!bar){bar=B[k]=document.createElement("div");bar.className="tfl";const f=S[k]=S[k]||{};
    bar.innerHTML=`<input type=search placeholder="Filter rows…" aria-label="Filter rows">`+(lane?`<select data-k=lane aria-label=Lane><option value="">All lanes</option><option>SOLANA</option><option>MAJOR</option></select>`:"")+(side?`<select data-k=side aria-label=Side><option value="">Buys + sells</option><option value="BUY">Buys</option><option value="SELL">Sells</option></select>`:"");
    bar.querySelector("input").oninput=e=>{f.q=e.target.value.trim().toLowerCase();apply(t)};bar.querySelectorAll("select").forEach(s=>s.onchange=()=>{f[s.dataset.k]=s.value;apply(t)});
    (t.parentElement&&getComputedStyle(t.parentElement).overflowX!="visible"&&t.parentElement.children.length==1?t.parentElement:t).before(bar);}
  apply(t)}
let pend=0;const scan=()=>{pend=0;document.querySelectorAll("table").forEach(setup)};
new MutationObserver(()=>{if(!pend){pend=1;setTimeout(scan,300)}}).observe(document.documentElement,{subtree:true,childList:true});
})();
